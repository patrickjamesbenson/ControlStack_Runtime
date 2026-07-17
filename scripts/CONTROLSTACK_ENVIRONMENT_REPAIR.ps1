#requires -Version 5.1

[CmdletBinding()]
param(
    [switch]$AuditOnly
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$RepairVersion = '2.0.0'
$StartedAt = Get-Date
$Timestamp = $StartedAt.ToString('yyyyMMdd-HHmmss')
$RepairMode = $(if ($AuditOnly) { 'AUDIT' } else { 'EXECUTE' })
$ReceiptRoot = 'C:\ControlStack_Receipts'
$ReceiptPath = Join-Path $ReceiptRoot ("CONTROLSTACK_ENVIRONMENT_REPAIR_{0}_{1}.json" -f $RepairMode, $Timestamp)
$BackupRoot = Join-Path $ReceiptRoot ("CONTROLSTACK_ENVIRONMENT_REPAIR_{0}_backups" -f $Timestamp)

$ProgramRoot = 'C:\ControlStack_Worktrees\program-integrate'
$SelectorRoot = 'C:\ControlStack_Worktrees\selector-engine'
$LabRoot = 'C:\ControlStack_Worktrees\code-pilot-lab'
$ToolingRoot = 'C:\ControlStack_Worktrees\controlstack-tooling-v2'

$ExpectedBranches = [ordered]@{
    Program = 'lane/program-integrate'
    Selector = 'lane/selector-engine'
    Lab = 'lane/code-pilot-lab'
}

$ExpectedPorts = [ordered]@{
    SelectorMcp = 8000
    SelectorMcpCandidate = 8100
    SelectorRuntime = 8788
    SelectorTunnel = 8082
    LabMcp = 8021
    LabSpecification = 8899
    LabTunnel = 8081
    ProgramMcp = 8022
    ProgramTunnel = 8080
}

$SelectorWriteScope = 'docs/_context/lanes/selector-engine/**'
$LabCommitMessage = 'docs(lab): establish durable lane memory'
$LabGate = 'lab-ies'
$LabStagedPaths = @(
    'docs/_context/lanes/lab-ies/DECISION_LOG.md',
    'docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md',
    'docs/_context/lanes/lab-ies/LANE_CHARTER.md',
    'docs/_context/lanes/lab-ies/LANE_STATE.md',
    'docs/_context/lanes/lab-ies/SESSION_HANDOFF.md',
    'docs/_context/lanes/lab-ies/WORK_QUEUE.md'
)

$Receipt = [ordered]@{
    repairVersion = $RepairVersion
    mode = $RepairMode.ToLowerInvariant()
    startedAt = $StartedAt.ToString('o')
    completedAt = $null
    status = 'started'
    failureCode = 'NONE'
    failure = [ordered]@{ phase = 'INITIALIZATION'; scriptLine = $null; exceptionType = $null }
    branches = [ordered]@{ program = $null; selector = $null; lab = $null }
    validations = New-Object System.Collections.ArrayList
    changes = New-Object System.Collections.ArrayList
    services = New-Object System.Collections.ArrayList
    lab = [ordered]@{ gate = 'not-run'; gateExitCode = $null; commit = $null; push = 'not-run'; protectedDigest = $null }
    selector = [ordered]@{ scope = $SelectorWriteScope; activation = 'not-run'; candidatePort = 8100 }
    preservation = [ordered]@{
        existingManagerFileCount = 0
        existingServiceCount = 0
        unknownServiceCount = 0
        csTunnelRuntimeReferenceCount = 0
        existingManagersUntouched = $true
        existingStartupUntouched = $true
    }
}

$MutationStarted = $false
$TemporaryTunnelProcesses = New-Object System.Collections.ArrayList
$NewCanonicalTunnelProcesses = New-Object System.Collections.ArrayList
$OldTunnelProcesses = @{}
$StoppedOriginalTunnelIds = New-Object System.Collections.ArrayList
$TunnelLoadBearing = @{}
$SecretPlainText = $null
$SecretSecure = $null
$NewSecretFile = $null
$ManagerRoot = $null
$ManagerRegistryPath = $null
$ManagerScriptPath = $null
$TunnelHostPath = $null
$StartupEntryPath = $null
$SelectorConfigPlan = $null
$SelectorConfigBackup = $null
$ProtectedLabFingerprintBefore = $null
$FailureCode = 'NONE'
$CurrentPhase = 'INITIALIZATION'
$CurrentUserSid = $null

function Set-AuditPhase {
    param([Parameter(Mandatory = $true)][string]$Phase)
    if ($Phase -notmatch '^[A-Z0-9_]{3,80}$') { throw 'INVALID_AUDIT_PHASE' }
    $script:CurrentPhase = $Phase
    $Receipt.failure.phase = $Phase
}

function Set-FailureCode {
    param([Parameter(Mandatory = $true)][string]$Code)
    $script:FailureCode = $Code
}

function Add-ReceiptChange {
    param([string]$Kind, [string]$Path, [string]$Detail)
    $serviceId = $null
    if (-not [string]::IsNullOrWhiteSpace($Path) -and $Path -match '^[a-z0-9-]{1,64}$') { $serviceId = $Path }
    [void]$Receipt.changes.Add([ordered]@{ kind = [string]$Kind; status = 'recorded'; serviceId = $serviceId; resultCode = 'OK' })
}

function Add-PreservedService {
    param([string]$Name, [string]$Source, [string]$Detail)
    # Existing services remain under their existing manager. Free-text source
    # data is deliberately not copied into the structured receipt.
}

function Add-ReceiptError {
    param([string]$Message)
    if ($script:FailureCode -eq 'NONE') { $script:FailureCode = 'SAFE_FAILURE' }
}

function Add-ReceiptValidation {
    param([string]$Code, [string]$Status, [string]$ServiceId = $null, [Nullable[int]]$Port = $null, [Nullable[uint32]]$ProcessId = $null)
    [void]$Receipt.validations.Add([ordered]@{
        code = [string]$Code
        status = [string]$Status
        serviceId = $ServiceId
        port = $Port
        processId = $ProcessId
        resultCode = 'OK'
    })
}

function Add-ReceiptService {
    param([string]$ServiceId, [int]$Port, [uint32]$ProcessId, [string]$ExecutableName, [string]$Status)
    [void]$Receipt.services.Add([ordered]@{
        serviceId = $ServiceId
        port = $Port
        processId = $ProcessId
        executableName = $ExecutableName
        status = $Status
    })
}

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Get-StructuredReceiptSnapshot {
    return [ordered]@{
        repairVersion = [string]$Receipt.repairVersion
        mode = [string]$Receipt.mode
        startedAt = [string]$Receipt.startedAt
        completedAt = [string]$Receipt.completedAt
        status = [string]$Receipt.status
        failureCode = [string]$Receipt.failureCode
        failure = [ordered]@{
            phase = [string]$Receipt.failure.phase
            scriptLine = $Receipt.failure.scriptLine
            exceptionType = [string]$Receipt.failure.exceptionType
        }
        branches = [ordered]@{
            program = [string]$Receipt.branches.program
            selector = [string]$Receipt.branches.selector
            lab = [string]$Receipt.branches.lab
        }
        validations = @($Receipt.validations | ForEach-Object {
            [ordered]@{ code=[string]$_.code; status=[string]$_.status; serviceId=$_.serviceId; port=$_.port; processId=$_.processId; resultCode=[string]$_.resultCode }
        })
        changes = @($Receipt.changes | ForEach-Object {
            [ordered]@{ kind=[string]$_.kind; status=[string]$_.status; serviceId=$_.serviceId; resultCode=[string]$_.resultCode }
        })
        services = @($Receipt.services | ForEach-Object {
            [ordered]@{ serviceId=[string]$_.serviceId; port=[int]$_.port; processId=[uint32]$_.processId; executableName=[string]$_.executableName; status=[string]$_.status }
        })
        lab = [ordered]@{
            gate = [string]$Receipt.lab.gate
            gateExitCode = $Receipt.lab.gateExitCode
            commit = $Receipt.lab.commit
            push = [string]$Receipt.lab.push
            protectedDigest = $Receipt.lab.protectedDigest
        }
        selector = [ordered]@{
            scope = [string]$Receipt.selector.scope
            activation = [string]$Receipt.selector.activation
            candidatePort = [int]$Receipt.selector.candidatePort
        }
        preservation = [ordered]@{
            existingManagerFileCount = [int]$Receipt.preservation.existingManagerFileCount
            existingServiceCount = [int]$Receipt.preservation.existingServiceCount
            unknownServiceCount = [int]$Receipt.preservation.unknownServiceCount
            csTunnelRuntimeReferenceCount = [int]$Receipt.preservation.csTunnelRuntimeReferenceCount
            existingManagersUntouched = [bool]$Receipt.preservation.existingManagersUntouched
            existingStartupUntouched = [bool]$Receipt.preservation.existingStartupUntouched
        }
    }
}

function Write-Receipt {
    param([string]$Status)
    if ($Status -in @('audit-passed','completed')) {
        $Receipt.failure.phase = $null
        $Receipt.failure.scriptLine = $null
        $Receipt.failure.exceptionType = $null
    }
    if ($null -ne $script:SecretPlainText) {
        $script:SecretPlainText = '<cleared-before-receipt>'
        $script:SecretPlainText = $null
    }
    $Receipt.status = $Status
    $Receipt.failureCode = $script:FailureCode
    $Receipt.completedAt = (Get-Date).ToString('o')
    Ensure-Directory -Path $ReceiptRoot
    $json = (Get-StructuredReceiptSnapshot) | ConvertTo-Json -Depth 12
    [System.IO.File]::WriteAllText($ReceiptPath, $json, (New-Object System.Text.UTF8Encoding($false)))
    Write-Host "Receipt: $ReceiptPath"
}

function Invoke-External {
    param(
        [Parameter(Mandatory = $true)][string]$FilePath,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [string]$WorkingDirectory = $null,
        [switch]$AllowFailure
    )
    $original = Get-Location
    $previousErrorActionPreference = $ErrorActionPreference
    $output = @()
    $exitCode = 0
    try {
        if ($WorkingDirectory) { Set-Location -LiteralPath $WorkingDirectory }
        # Windows PowerShell 5.1 converts native stderr redirected with 2>&1
        # into ErrorRecord objects. Under the script-wide Stop preference,
        # even a warning becomes a terminating RemoteException before the
        # native exit code can be evaluated. Capture the records here and let
        # the explicit exit-code policy below decide success or failure.
        $ErrorActionPreference = 'Continue'
        $output = @(& $FilePath @Arguments 2>&1)
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $previousErrorActionPreference
        Set-Location -LiteralPath $original
    }
    if (-not $AllowFailure -and $exitCode -ne 0) {
        Set-FailureCode -Code 'EXTERNAL_COMMAND_FAILED'
        throw 'EXTERNAL_COMMAND_FAILED'
    }
    return [ordered]@{ exitCode = $exitCode; output = @($output | ForEach-Object { [string]$_ }) }
}

function Invoke-Git {
    param(
        [Parameter(Mandatory = $true)][string]$Root,
        [Parameter(Mandatory = $true)][string[]]$Arguments,
        [switch]$AllowFailure
    )
    $args = @('-C', $Root) + $Arguments
    return Invoke-External -FilePath 'git.exe' -Arguments $args -AllowFailure:$AllowFailure
}

function Get-GitBranch {
    param([string]$Root)
    $result = Invoke-Git -Root $Root -Arguments @('branch', '--show-current')
    return (($result.output -join "`n").Trim())
}

function Get-NulSeparatedGitPathsLegacy {
    param([string]$Root, [string[]]$Arguments)
    $temp = [System.IO.Path]::GetTempFileName()
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = 'git.exe'
        $psi.WorkingDirectory = $Root
        $psi.UseShellExecute = $false
        $psi.RedirectStandardOutput = $true
        $psi.RedirectStandardError = $true
        $psi.CreateNoWindow = $true
        $quoted = @('-C', ('"' + $Root.Replace('"', '"') + '"'))
        foreach ($arg in $Arguments) {
            if ($arg -match '[\s"]') { $quoted += ('"' + $arg.Replace('"', '\"') + '"') } else { $quoted += $arg }
        }
        $psi.Arguments = $quoted -join ' '
        $process = New-Object System.Diagnostics.Process
        $process.StartInfo = $psi
        [void]$process.Start()
        $memory = New-Object System.IO.MemoryStream
        $process.StandardOutput.BaseStream.CopyTo($memory)
        $stderr = $process.StandardError.ReadToEnd()
        $process.WaitForExit()
        if ($process.ExitCode -ne 0) { throw "Git path query failed: $stderr" }
        $text = [System.Text.Encoding]::UTF8.GetString($memory.ToArray())
        if ([string]::IsNullOrEmpty($text)) { return @() }
        return @($text.TrimEnd([char]0).Split([char]0) | Where-Object { $_ -ne '' } | ForEach-Object { $_.Replace('\', '/') })
    }
    finally {
        Remove-Item -LiteralPath $temp -Force -ErrorAction SilentlyContinue
    }
}

# Windows PowerShell 5.1-safe override. The earlier native NUL reader is kept
# for audit history but this definition is the active one used below.
function Get-NulSeparatedGitPaths {
    param([string]$Root, [string[]]$Arguments)
    $safeArguments = @($Arguments | Where-Object { $_ -ne '-z' })
    $result = Invoke-Git -Root $Root -Arguments $safeArguments
    return @($result.output |
        Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
        ForEach-Object { ([string]$_).Replace('\', '/') })
}

function Get-GitInventory {
    param([string]$Root)
    $staged = Get-NulSeparatedGitPaths -Root $Root -Arguments @('diff', '--cached', '--name-only', '-z')
    $modified = Get-NulSeparatedGitPaths -Root $Root -Arguments @('diff', '--name-only', '-z')
    $untracked = Get-NulSeparatedGitPaths -Root $Root -Arguments @('ls-files', '--others', '--exclude-standard', '-z')
    return [ordered]@{
        staged = @($staged | Sort-Object -Unique)
        modified = @($modified | Sort-Object -Unique)
        untracked = @($untracked | Sort-Object -Unique)
    }
}

function Get-FileDigestRecord {
    param([string]$Root, [string]$RelativePath, [string]$State)
    $full = Join-Path $Root ($RelativePath.Replace('/', '\'))
    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
        return [ordered]@{ path = $RelativePath; state = $State; exists = $false; sha256 = $null; length = 0 }
    }
    $item = Get-Item -LiteralPath $full
    $hash = (Get-FileHash -LiteralPath $full -Algorithm SHA256).Hash
    return [ordered]@{ path = $RelativePath; state = $State; exists = $true; sha256 = $hash; length = [int64]$item.Length }
}

function Get-ProtectedLabFingerprint {
    param([string]$Root)
    $inventory = Get-GitInventory -Root $Root
    $records = New-Object System.Collections.ArrayList
    foreach ($path in $inventory.modified) { [void]$records.Add((Get-FileDigestRecord -Root $Root -RelativePath $path -State 'modified')) }
    foreach ($path in $inventory.untracked) { [void]$records.Add((Get-FileDigestRecord -Root $Root -RelativePath $path -State 'untracked')) }
    $stable = [ordered]@{
        modified = @($inventory.modified)
        untracked = @($inventory.untracked)
        records = @($records)
    }
    $json = $stable | ConvertTo-Json -Depth 8 -Compress
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
    $sha = [System.Security.Cryptography.SHA256]::Create()
    try { $digest = ([System.BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '') }
    finally { $sha.Dispose() }
    $stable.digest = $digest
    return $stable
}

function Assert-SameStringSet {
    param([string[]]$Actual, [string[]]$Expected, [string]$Label)
    $a = @($Actual | Sort-Object -Unique)
    $e = @($Expected | Sort-Object -Unique)
    if (($a -join "`n") -ne ($e -join "`n")) {
        throw "$Label mismatch.`nExpected:`n$($e -join "`n")`nActual:`n$($a -join "`n")"
    }
}

function Assert-LabProtectedInventory {
    param([object]$Before, [object]$After, [string]$Phase)
    if ($Before.digest -ne $After.digest) {
        throw "Lab protected modified/untracked inventory changed during $Phase. Before=$($Before.digest), after=$($After.digest)."
    }
    if (@($After.modified).Count -ne 10 -or @($After.untracked).Count -ne 66) {
        throw "Lab protected inventory count changed during $Phase. Expected 10 modified and 66 untracked; found $(@($After.modified).Count) modified and $(@($After.untracked).Count) untracked."
    }
    $inventory = Get-GitInventory -Root $LabRoot
    $protected = @($After.modified) + @($After.untracked)
    $intersection = @($inventory.staged | Where-Object { $protected -contains $_ })
    if ($intersection.Count -gt 0) {
        throw "Protected Lab paths became staged during ${Phase}: $($intersection -join ', ')"
    }
}

function Get-ListeningProcess {
    param([int]$Port)
    $connections = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
    if ($connections.Count -eq 0) { throw "No listening process found on required port $Port." }
    $pids = @($connections | Select-Object -ExpandProperty OwningProcess -Unique)
    if ($pids.Count -ne 1) { throw "Expected one listening process on port $Port; found PIDs: $($pids -join ', ')." }
    $process = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $pids[0])
    if (-not $process) { throw "Could not inspect process $($pids[0]) for port $Port." }
    return $process
}

function Get-ProcessAncestry {
    param([uint32]$ProcessId, [int]$Depth = 8)
    $result = New-Object System.Collections.ArrayList
    $seen = @{}
    $current = $ProcessId
    for ($i = 0; $i -lt $Depth -and $current -gt 0; $i++) {
        if ($seen.ContainsKey([string]$current)) { break }
        $seen[[string]$current] = $true
        $proc = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $current) -ErrorAction SilentlyContinue
        if (-not $proc) { break }
        [void]$result.Add([ordered]@{
            processId = [uint32]$proc.ProcessId
            parentProcessId = [uint32]$proc.ParentProcessId
            name = [string]$proc.Name
            executablePath = [string]$proc.ExecutablePath
            commandLine = [string]$proc.CommandLine
        })
        $current = [uint32]$proc.ParentProcessId
    }
    return @($result)
}

function Get-AncestryText {
    param([object[]]$Ancestry)
    return (($Ancestry | ForEach-Object { "{0} {1} {2}" -f $_.name, $_.executablePath, $_.commandLine }) -join "`n")
}

function Assert-ProcessIdentity {
    param(
        [string]$ServiceName,
        [int]$Port,
        [string[]]$RequiredAnyMarkers,
        [string[]]$RequiredProcessNames
    )
    $proc = Get-ListeningProcess -Port $Port
    $ancestry = Get-ProcessAncestry -ProcessId ([uint32]$proc.ProcessId)
    $text = Get-AncestryText -Ancestry $ancestry
    $markerHit = $false
    foreach ($marker in $RequiredAnyMarkers) {
        if ($text.IndexOf($marker, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $markerHit = $true; break }
    }
    if (-not $markerHit) {
        throw "$ServiceName on port $Port does not match any required identity marker: $($RequiredAnyMarkers -join ', ')."
    }
    $leafName = ([string]$proc.Name).ToLowerInvariant()
    if ($RequiredProcessNames.Count -gt 0 -and -not ($RequiredProcessNames | Where-Object { $leafName -like $_.ToLowerInvariant() })) {
        throw "$ServiceName on port $Port has unexpected process name '$($proc.Name)'."
    }
    return [ordered]@{
        name = $ServiceName
        port = $Port
        processId = [uint32]$proc.ProcessId
        processName = [string]$proc.Name
        executablePath = [string]$proc.ExecutablePath
        commandLine = [string]$proc.CommandLine
        ancestry = $ancestry
    }
}

function Get-HealthCheck {
    param([int]$Port, [int]$Attempts = 1, [int]$DelayMilliseconds = 500)
    $paths = @('/health', '/healthz', '/status', '/')
    for ($attempt = 1; $attempt -le $Attempts; $attempt++) {
        foreach ($path in $paths) {
            try {
                $response = Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:{0}{1}" -f $Port, $path) -TimeoutSec 3
                if ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 400) {
                    return [ordered]@{ healthy = $true; path = $path; statusCode = [int]$response.StatusCode }
                }
            }
            catch { }
        }
        if ($attempt -lt $Attempts) { Start-Sleep -Milliseconds $DelayMilliseconds }
    }
    return [ordered]@{ healthy = $false; path = $null; statusCode = $null }
}
function Assert-StableTunnelHealth {
    param([Parameter(Mandatory = $true)][int]$Port, [Parameter(Mandatory = $true)][string]$Label)
    for ($cycle = 1; $cycle -le 3; $cycle++) {
        $health = Get-HealthCheck -Port $Port -Attempts 20 -DelayMilliseconds 500
        if (-not $health.healthy) { throw "$Label failed stabilized health cycle $cycle on port $Port." }
        [void](Get-ListeningProcess -Port $Port)
        if ($cycle -lt 3) { Start-Sleep -Seconds 2 }
    }
}


function Get-TextFilesUnderRoots {
    param([string[]]$Roots, [string[]]$NamePatterns)
    $files = New-Object System.Collections.ArrayList
    foreach ($root in $Roots | Select-Object -Unique) {
        if (-not (Test-Path -LiteralPath $root -PathType Container)) { continue }
        Get-ChildItem -LiteralPath $root -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object {
                if ($_.Length -ge 2MB -or $_.FullName -match '\\.git\\|\\node_modules\\|\\__pycache__\\') { return $false }
                foreach ($pattern in $NamePatterns) {
                    if ($_.Name -like $pattern) { return $true }
                }
                return $false
            } |
            ForEach-Object { [void]$files.Add($_.FullName) }
    }
    return @($files | Sort-Object -Unique)
}

function Find-LauncherFile {
    param(
        [string]$ServiceName,
        [int]$Port,
        [string]$LaneRoot,
        [string[]]$SearchRoots,
        [string[]]$ExtraMarkers
    )
    $files = Get-TextFilesUnderRoots -Roots $SearchRoots -NamePatterns @('*.ps1', '*.bat', '*.cmd', '*.env', '*.json')
    $scored = New-Object System.Collections.ArrayList
    foreach ($file in $files) {
        if ($file -match '(?i)CONTROLSTACK_ENVIRONMENT_REPAIR|ControlStack-ManagedServices|controlstack-managed-services|ControlStack-TunnelHost|service.*manager|managed.*service') { continue }
        try { $content = [System.IO.File]::ReadAllText($file) } catch { continue }
        $score = 0
        if ($content -match [regex]::Escape([string]$Port)) { $score += 4 }
        if ($content.IndexOf($LaneRoot, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $score += 5 }
        foreach ($marker in $ExtraMarkers) {
            if ($content.IndexOf($marker, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $score += 2 }
        }
        if ([System.IO.Path]::GetFileName($file).IndexOf('start', [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $score += 1 }
        if ($score -ge 7) {
            [void]$scored.Add([ordered]@{ path = $file; score = $score; content = $content })
        }
    }
    if ($scored.Count -eq 0) { throw "No launcher/config candidate found for $ServiceName on port $Port." }
    $ordered = @($scored | Sort-Object -Property @{Expression='score';Descending=$true}, @{Expression='path';Descending=$false})
    $topScore = $ordered[0].score
    $top = @($ordered | Where-Object { $_.score -eq $topScore })
    if ($top.Count -gt 1) {
        $preferred = @($top | Where-Object { $_.path -match '\.(ps1|bat|cmd)$' })
        if ($preferred.Count -eq 1) { return $preferred[0] }
        throw "Ambiguous launcher/config discovery for $ServiceName. Top candidates: $($top.path -join ', ')"
    }
    return $top[0]
}

function Protect-PrivateDirectory {
    param([Parameter(Mandatory = $true)][string]$Path, [Parameter(Mandatory = $true)][string]$Sid)
    $inheritance = Invoke-External -FilePath 'icacls.exe' -Arguments @($Path, '/inheritance:r') -AllowFailure
    if ($inheritance.exitCode -ne 0) { throw "Failed to disable inherited ACLs on private directory $Path." }
    $grant = Invoke-External -FilePath 'icacls.exe' -Arguments @($Path, '/grant:r', ("*{0}:(OI)(CI)F" -f $Sid)) -AllowFailure
    if ($grant.exitCode -ne 0) { throw "Failed to restrict private directory $Path to SID $Sid." }
}

function Backup-ChangedFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    Ensure-Directory -Path $BackupRoot
    Protect-PrivateDirectory -Path $BackupRoot -Sid $CurrentUserSid
    $safeName = ($Path -replace '[:\\/]', '_')
    $pathBytes = [System.Text.Encoding]::UTF8.GetBytes([System.IO.Path]::GetFullPath($Path).ToLowerInvariant())
    $pathHasher = [System.Security.Cryptography.SHA256]::Create()
    try { $pathId = ([System.BitConverter]::ToString($pathHasher.ComputeHash($pathBytes))).Replace('-', '').Substring(0, 12) }
    finally { $pathHasher.Dispose() }
    $backup = Join-Path $BackupRoot ($safeName + '.' + $pathId + '.bak')
    Copy-Item -LiteralPath $Path -Destination $backup -Force
    Add-ReceiptChange -Kind 'backup' -Path 'configuration' -Detail 'created-before-mutation'
    return $backup
}

function Write-Utf8NoBomAtomic {
    param([string]$Path, [string]$Content)
    $parent = Split-Path -Parent $Path
    Ensure-Directory -Path $parent
    $temp = Join-Path $parent (([System.IO.Path]::GetRandomFileName()) + '.tmp')
    [System.IO.File]::WriteAllText($temp, $Content, (New-Object System.Text.UTF8Encoding($false)))
    if (Test-Path -LiteralPath $Path) {
        [System.IO.File]::Replace($temp, $Path, $null)
    }
    else {
        Move-Item -LiteralPath $temp -Destination $Path
    }
}

function Find-SelectorScopeSource {
    $pythonFiles = Get-TextFilesUnderRoots -Roots @($ToolingRoot, $SelectorRoot) -NamePatterns @('*.py')
    $matches = New-Object System.Collections.ArrayList
    foreach ($file in $pythonFiles) {
        try { $content = [System.IO.File]::ReadAllText($file) } catch { continue }
        if ($content -match '(?i)allowed_write_globs|write_allowed_globs|write.*glob') {
            $envMatches = [regex]::Matches($content, 'CONTROLSTACK_[A-Z0-9_]*WRITE[A-Z0-9_]*GLOB[A-Z0-9_]*')
            foreach ($match in $envMatches) {
                [void]$matches.Add([ordered]@{ path = $file; envName = $match.Value; content = $content })
            }
        }
    }
    $distinct = @($matches | Group-Object envName | ForEach-Object { $_.Group[0] })
    if ($distinct.Count -ne 1) {
        throw "Expected one Selector write-scope environment variable in deployed tooling; found $($distinct.Count): $($distinct.envName -join ', ')."
    }
    return $distinct[0]
}

function Get-ListEncoding {
    param([string]$SourceText, [string]$EnvName)
    $index = $SourceText.IndexOf($EnvName, [System.StringComparison]::Ordinal)
    if ($index -lt 0) { throw "Scope parser source does not contain $EnvName." }
    $start = [Math]::Max(0, $index - 500)
    $length = [Math]::Min(1500, $SourceText.Length - $start)
    $window = $SourceText.Substring($start, $length)
    if ($window -match '(?i)json\.loads') { return 'json' }
    if ($window -match 'split\([''"];[''"]\)') { return 'semicolon' }
    if ($window -match 'split\([''"],[''"]\)') { return 'comma' }
    if ($window -match '(?i)os\.pathsep') { return 'semicolon' }
    throw "Could not prove the list encoding used by $EnvName; refusing to guess."
}

function Decode-ScopeValue {
    param([string]$Value, [string]$Encoding)
    if ([string]::IsNullOrWhiteSpace($Value)) { return @() }
    switch ($Encoding) {
        'json' { return @((ConvertFrom-Json $Value) | ForEach-Object { [string]$_ }) }
        'semicolon' { return @($Value.Split(';') | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }
        'comma' { return @($Value.Split(',') | ForEach-Object { $_.Trim() } | Where-Object { $_ }) }
        default { throw "Unsupported scope encoding: $Encoding" }
    }
}

function Encode-ScopeValue {
    param([string[]]$Values, [string]$Encoding)
    switch ($Encoding) {
        'json' { return ($Values | ConvertTo-Json -Compress) }
        'semicolon' { return ($Values -join ';') }
        'comma' { return ($Values -join ',') }
        default { throw "Unsupported scope encoding: $Encoding" }
    }
}

function Get-LauncherEnvironmentValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Name
    )
    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    if ($extension -in @('.bat', '.cmd')) {
        $quotedPattern = '(?im)^\s*set\s+"' + [regex]::Escape($Name) + '=(.*)"\s*$'
        $match = [regex]::Match($Content, $quotedPattern)
        if ($match.Success) { return $match.Groups[1].Value.Trim() }
        $plainPattern = '(?im)^\s*set\s+' + [regex]::Escape($Name) + '=(.*)\s*$'
        $match = [regex]::Match($Content, $plainPattern)
        if ($match.Success) { return $match.Groups[1].Value.Trim() }
        return $null
    }
    if ($extension -eq '.ps1') {
        $pattern = '(?im)^\s*\$env:' + [regex]::Escape($Name) + '\s*=\s*["'']([^"'']*)["'']\s*$'
        $match = [regex]::Match($Content, $pattern)
        if ($match.Success) { return $match.Groups[1].Value }
        return $null
    }
    if ($extension -eq '.env') {
        $pattern = '(?im)^\s*' + [regex]::Escape($Name) + '=([^\r\n]*)$'
        $match = [regex]::Match($Content, $pattern)
        if ($match.Success) { return $match.Groups[1].Value.Trim().Trim('"').Trim("'") }
        return $null
    }
    if ($extension -eq '.json') {
        $json = $Content | ConvertFrom-Json
        foreach ($propertyName in @('environment', 'env', 'variables')) {
            if (-not ($json.PSObject.Properties.Name -contains $propertyName)) { continue }
            $environment = $json.$propertyName
            if ($environment.PSObject.Properties.Name -contains $Name) { return [string]$environment.$Name }
        }
        return $null
    }
    throw "Unsupported launcher format: $Path"
}

function Set-LauncherEnvironmentValue {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][string]$Content,
        [Parameter(Mandatory = $true)][string]$Name,
        [Parameter(Mandatory = $true)][string]$Value
    )
    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    $replacement = $null
    if ($extension -in @('.bat', '.cmd')) {
        $replacement = 'set "' + $Name + '=' + $Value + '"'
        $pattern = '(?im)^\s*set\s+"?' + [regex]::Escape($Name) + '=[^\r\n]*$'
        if ([regex]::IsMatch($Content, $pattern)) {
            return [regex]::Replace($Content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, 1)
        }
        $anchor = [regex]::Match($Content, '(?im)^.*controlstack.*\.py.*$')
        if (-not $anchor.Success) { throw "Cannot identify a safe environment insertion point in $Path." }
        return $Content.Insert($anchor.Index, $replacement + [Environment]::NewLine)
    }
    if ($extension -eq '.ps1') {
        $replacement = '$env:' + $Name + " = '" + $Value.Replace("'", "''") + "'"
        $pattern = '(?im)^\s*\$env:' + [regex]::Escape($Name) + '\s*=\s*[^\r\n]*$'
        if ([regex]::IsMatch($Content, $pattern)) {
            return [regex]::Replace($Content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, 1)
        }
        $anchor = [regex]::Match($Content, '(?im)^.*controlstack.*\.py.*$')
        if (-not $anchor.Success) { throw "Cannot identify a safe environment insertion point in $Path." }
        return $Content.Insert($anchor.Index, $replacement + [Environment]::NewLine)
    }
    if ($extension -eq '.env') {
        $replacement = $Name + '=' + $Value
        $pattern = '(?im)^\s*' + [regex]::Escape($Name) + '=[^\r\n]*$'
        if ([regex]::IsMatch($Content, $pattern)) {
            return [regex]::Replace($Content, $pattern, [System.Text.RegularExpressions.MatchEvaluator]{ param($m) $replacement }, 1)
        }
        return $Content.TrimEnd() + [Environment]::NewLine + $replacement + [Environment]::NewLine
    }
    if ($extension -eq '.json') {
        $json = $Content | ConvertFrom-Json
        $environmentProperty = $null
        foreach ($propertyName in @('environment', 'env', 'variables')) {
            if ($json.PSObject.Properties.Name -contains $propertyName) { $environmentProperty = $propertyName; break }
        }
        if (-not $environmentProperty) { throw "Selector JSON config $Path has no recognised environment object." }
        $environment = $json.$environmentProperty
        if ($environment.PSObject.Properties.Name -contains $Name) { $environment.$Name = $Value }
        else { $environment | Add-Member -NotePropertyName $Name -NotePropertyValue $Value }
        return ($json | ConvertTo-Json -Depth 30)
    }
    throw "Unsupported Selector launcher format: $Path"
}

function Set-LauncherPortValue {
    param([string]$Content, [int]$OldPort, [int]$NewPort)
    $escaped = [regex]::Escape([string]$OldPort)
    $patterns = @(
        ('(?im)^\s*\$env:(?:CONTROLSTACK_HTTP_PORT|CONTROLSTACK_MCP_PORT|MCP_PORT|PORT)\s*=\s*["''](?<port>' + $escaped + ')["'']\s*$'),
        ('(?im)^\s*set\s+"?(?:CONTROLSTACK_HTTP_PORT|CONTROLSTACK_MCP_PORT|MCP_PORT|PORT)=(?<port>' + $escaped + ')"?\s*$'),
        ('(?i)--port(?:=|\s+)(?<port>' + $escaped + ')\b')
    )
    $groups = New-Object System.Collections.ArrayList
    foreach ($pattern in $patterns) {
        foreach ($match in [regex]::Matches($Content, $pattern)) { [void]$groups.Add($match.Groups['port']) }
    }
    if ($groups.Count -ne 1) { Set-FailureCode -Code 'SELECTOR_PORT_REWRITE_NOT_EXACT'; throw 'SELECTOR_PORT_REWRITE_NOT_EXACT' }
    $group = $groups[0]
    return $Content.Remove($group.Index, $group.Length).Insert($group.Index, [string]$NewPort)
}

function Start-LauncherProcess {
    param([string]$Path, [string]$WorkingDirectory)
    $extension = [System.IO.Path]::GetExtension($Path).ToLowerInvariant()
    if ($extension -in @('.bat','.cmd')) {
        return Start-Process cmd.exe -ArgumentList @('/d','/s','/c',('"' + $Path + '"')) -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -PassThru
    }
    if ($extension -eq '.ps1') {
        return Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$Path) -WorkingDirectory $WorkingDirectory -WindowStyle Hidden -PassThru
    }
    Set-FailureCode -Code 'SELECTOR_LAUNCHER_FORMAT_REJECTED'
    throw 'SELECTOR_LAUNCHER_FORMAT_REJECTED'
}

function Wait-SelectorMcpHealthy {
    param([int]$Port, [string]$Label)
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        try {
            $record = Assert-ProcessIdentity -ServiceName $Label -Port $Port -RequiredAnyMarkers @($SelectorRoot, [string]$Port, 'controlstack_mcp') -RequiredProcessNames @('python*.exe')
            $health = Get-HealthCheck -Port $Port -Attempts 1
            if ($health.healthy) { return $record }
        }
        catch { }
        Start-Sleep -Milliseconds 500
    }
    Set-FailureCode -Code 'SELECTOR_CANDIDATE_HEALTH_FAILED'
    throw 'SELECTOR_CANDIDATE_HEALTH_FAILED'
}

function New-SelectorConfigPlan {
    param([object]$ScopeSource)
    $envName = $ScopeSource.envName
    $candidate = Find-LauncherFile -ServiceName 'Selector MCP configuration' -Port $ExpectedPorts.SelectorMcp -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot, $SelectorRoot) -ExtraMarkers @($envName, 'CONTROLSTACK_RUNTIME_ROOT', 'selector-engine')
    $path = $candidate.path
    $content = $candidate.content
    $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
    if ($extension -notin @('.ps1','.bat','.cmd')) { Set-FailureCode -Code 'SELECTOR_LAUNCHER_FORMAT_REJECTED'; throw 'SELECTOR_LAUNCHER_FORMAT_REJECTED' }
    $boundRuntimeRoot = Get-LauncherEnvironmentValue -Path $path -Content $content -Name 'CONTROLSTACK_RUNTIME_ROOT'
    if ($boundRuntimeRoot -ne $SelectorRoot) { Set-FailureCode -Code 'SELECTOR_ROOT_BINDING_MISMATCH'; throw 'SELECTOR_ROOT_BINDING_MISMATCH' }
    $encoding = Get-ListEncoding -SourceText $ScopeSource.content -EnvName $envName
    $currentValue = Get-LauncherEnvironmentValue -Path $path -Content $content -Name $envName
    if ($null -eq $currentValue) { $currentValue = '' }
    $currentScopes = Decode-ScopeValue -Value $currentValue -Encoding $encoding
    if (@($currentScopes | Where-Object { $_ -ne $SelectorWriteScope }).Count -gt 0) { Set-FailureCode -Code 'SELECTOR_EXISTING_SCOPE_REJECTED'; throw 'SELECTOR_EXISTING_SCOPE_REJECTED' }
    $newContent = Set-LauncherEnvironmentValue -Path $path -Content $content -Name $envName -Value (Encode-ScopeValue -Values @($SelectorWriteScope) -Encoding $encoding)
    $newContent = Set-LauncherEnvironmentValue -Path $path -Content $newContent -Name 'CONTROLSTACK_ENABLE_WRITE' -Value '1'
    $writtenScopes = Decode-ScopeValue -Value (Get-LauncherEnvironmentValue -Path $path -Content $newContent -Name $envName) -Encoding $encoding
    Assert-SameStringSet -Actual $writtenScopes -Expected @($SelectorWriteScope) -Label 'Selector repaired write scope'
    if ((Get-LauncherEnvironmentValue -Path $path -Content $newContent -Name 'CONTROLSTACK_ENABLE_WRITE') -ne '1') { Set-FailureCode -Code 'SELECTOR_WRITE_NOT_ENABLED'; throw 'SELECTOR_WRITE_NOT_ENABLED' }
    if ($newContent -match '(?im)CONTROLSTACK_ENABLE_(ARBITRARY_SHELL|DELETE|MOVEMENT|MOVE|CROSS_ROOT_COPY)\s*=\s*(1|true|yes|on)') { Set-FailureCode -Code 'SELECTOR_PROHIBITED_CAPABILITY'; throw 'SELECTOR_PROHIBITED_CAPABILITY' }
    if ($newContent.IndexOf($SelectorRoot, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) { Set-FailureCode -Code 'SELECTOR_ROOT_NOT_RETAINED'; throw 'SELECTOR_ROOT_NOT_RETAINED' }
    $candidateContent = Set-LauncherPortValue -Content $newContent -OldPort $ExpectedPorts.SelectorMcp -NewPort $ExpectedPorts.SelectorMcpCandidate
    $candidatePath = Join-Path $BackupRoot ("selector-mcp-candidate-{0}{1}" -f $Timestamp, $extension)
    if ($extension -eq '.ps1') {
        Assert-PowerShellTextParses -Text $newContent -Label 'Selector canonical launcher'
        Assert-PowerShellTextParses -Text $candidateContent -Label 'Selector candidate launcher'
    }
    return [ordered]@{
        path = $path
        envName = $envName
        encoding = $encoding
        oldContent = $content
        newContent = $newContent
        candidateContent = $candidateContent
        candidatePath = $candidatePath
        changed = ($content -cne $newContent)
    }
}

function Invoke-SelectorBlueGreenActivation {
    param([object]$Plan, [object]$OriginalEvidence)
    if (-not $Plan.changed) { $Receipt.selector.activation = 'already-current'; return $OriginalEvidence }
    Ensure-Directory -Path $BackupRoot
    Protect-PrivateDirectory -Path $BackupRoot -Sid $CurrentUserSid
    Write-Utf8NoBomAtomic -Path $Plan.candidatePath -Content $Plan.candidateContent
    $candidate = $null
    $canonical = $null
    $originalRestored = $false
    try {
        [void](Start-LauncherProcess -Path $Plan.candidatePath -WorkingDirectory $SelectorRoot)
        $candidate = Wait-SelectorMcpHealthy -Port $ExpectedPorts.SelectorMcpCandidate -Label 'Selector MCP blue-green candidate'
        if ((Get-GitBranch -Root $SelectorRoot) -ne $ExpectedBranches.Selector) { Set-FailureCode -Code 'SELECTOR_CANDIDATE_BRANCH_MISMATCH'; throw 'SELECTOR_CANDIDATE_BRANCH_MISMATCH' }
        $candidateText = [System.IO.File]::ReadAllText($Plan.candidatePath)
        $candidateScope = Decode-ScopeValue -Value (Get-LauncherEnvironmentValue -Path $Plan.candidatePath -Content $candidateText -Name $Plan.envName) -Encoding $Plan.encoding
        Assert-SameStringSet -Actual $candidateScope -Expected @($SelectorWriteScope) -Label 'Selector candidate scope'
        [void](Assert-ProcessIdentity -ServiceName 'Selector MCP original preserved' -Port $ExpectedPorts.SelectorMcp -RequiredAnyMarkers @($SelectorRoot, [string]$ExpectedPorts.SelectorMcp, 'controlstack_mcp') -RequiredProcessNames @('python*.exe'))
        $SelectorConfigBackup = Backup-ChangedFile -Path $Plan.path
        if (-not $SelectorConfigBackup) { Set-FailureCode -Code 'SELECTOR_BACKUP_MISSING'; throw 'SELECTOR_BACKUP_MISSING' }
        Write-Utf8NoBomAtomic -Path $Plan.path -Content $Plan.newContent
        Stop-ExactProcess -ProcessId ([uint32]$OriginalEvidence.processId) -Name 'selector-mcp-original' -ExpectedPort $ExpectedPorts.SelectorMcp -ExpectedExecutable $OriginalEvidence.executablePath -IdentityMarkers @($SelectorRoot,[string]$ExpectedPorts.SelectorMcp)
        [void](Start-LauncherProcess -Path $Plan.path -WorkingDirectory $SelectorRoot)
        $canonical = Wait-SelectorMcpHealthy -Port $ExpectedPorts.SelectorMcp -Label 'Selector MCP canonical replacement'
        Stop-ExactProcess -ProcessId ([uint32]$candidate.processId) -Name 'selector-mcp-candidate' -ExpectedPort $ExpectedPorts.SelectorMcpCandidate -ExpectedExecutable $candidate.executablePath -IdentityMarkers @($SelectorRoot,[string]$ExpectedPorts.SelectorMcpCandidate)
        $Receipt.selector.activation = 'blue-green-completed'
        return $canonical
    }
    catch {
        Set-FailureCode -Code 'SELECTOR_BLUE_GREEN_FAILED'
        if ($null -ne $canonical) {
            try { Stop-ExactProcess -ProcessId ([uint32]$canonical.processId) -Name 'selector-mcp-failed-canonical' -ExpectedPort $ExpectedPorts.SelectorMcp -ExpectedExecutable $canonical.executablePath -IdentityMarkers @($SelectorRoot,[string]$ExpectedPorts.SelectorMcp) } catch { }
        }
        if ($SelectorConfigBackup -and (Test-Path -LiteralPath $SelectorConfigBackup -PathType Leaf)) { Copy-Item -LiteralPath $SelectorConfigBackup -Destination $Plan.path -Force }
        try {
            $listener = @(Get-NetTCPConnection -State Listen -LocalPort $ExpectedPorts.SelectorMcp -ErrorAction SilentlyContinue)
            if ($listener.Count -eq 0) { [void](Start-LauncherProcess -Path $Plan.path -WorkingDirectory $SelectorRoot) }
            [void](Wait-SelectorMcpHealthy -Port $ExpectedPorts.SelectorMcp -Label 'Selector MCP restored original')
            $originalRestored = $true
        }
        catch { }
        if ($originalRestored -and $null -ne $candidate) {
            try { Stop-ExactProcess -ProcessId ([uint32]$candidate.processId) -Name 'selector-mcp-candidate' -ExpectedPort $ExpectedPorts.SelectorMcpCandidate -ExpectedExecutable $candidate.executablePath -IdentityMarkers @($SelectorRoot,[string]$ExpectedPorts.SelectorMcpCandidate) } catch { }
        }
        $Receipt.selector.activation = $(if ($originalRestored) { 'rolled-back-original-restored' } else { 'candidate-preserved' })
        throw 'SELECTOR_BLUE_GREEN_FAILED'
    }
}

function Get-ManagerDiscovery {
    $candidateRoots = @(
        $ToolingRoot,
        'C:\ControlStack_ServiceManager',
        'C:\ControlStack_Services',
        'C:\ControlStack_Tooling',
        (Join-Path $env:LOCALAPPDATA 'ControlStack'),
        (Join-Path $env:ProgramData 'ControlStack')
    ) | Select-Object -Unique
    $files = Get-TextFilesUnderRoots -Roots $candidateRoots -NamePatterns @('*.ps1', '*.py', '*.cmd', '*.bat', '*.json')
    $explicit = New-Object System.Collections.ArrayList
    $additiveManagerRoot = Join-Path $env:LOCALAPPDATA 'ControlStack\lane-managed-services'
    foreach ($file in $files) {
        if ($file.StartsWith($additiveManagerRoot, [System.StringComparison]::OrdinalIgnoreCase)) { continue }
        $name = [System.IO.Path]::GetFileName($file)
        $isNamedManager = $name -match '(?i)service.*manager|managed.*service'
        $isContentManager = $false
        if (-not $isNamedManager) {
            try {
                $content = [System.IO.File]::ReadAllText($file)
                $isContentManager = ($content -match '(?i)ControlStack|managed service') -and
                    ($content -match '(?i)start') -and ($content -match '(?i)stop') -and
                    ($content -match '(?i)restart') -and ($content -match '(?i)status') -and
                    ($content -match '(?i)Get-NetTCPConnection|Start-Process|Stop-Process|Win32_Service|subprocess')
            }
            catch { }
        }
        if ($isNamedManager -or $isContentManager) { [void]$explicit.Add($file) }
    }
    $explicit = @($explicit | Sort-Object -Unique)
    $roots = @($explicit | ForEach-Object { Split-Path -Parent $_ } | Sort-Object -Unique)
    return [ordered]@{
        discoveredFiles = @($explicit)
        explicitManagerFiles = @($explicit)
        legacyManagerRootCount = $roots.Count
    }
}

function Protect-ReceiptText {
    param([string]$Text)
    if ($null -eq $Text) { return $null }
    $redacted = $Text
    $redacted = [regex]::Replace($redacted, '(?i)(api[_-]?key|token|secret)(\s*[:=]\s*)([^\s;"'']+)', '$1$2<redacted>')
    $redacted = [regex]::Replace($redacted, '(?i)(--(?:api-key|token|secret|openai-api-key|service-api-key)\s+)([^\s]+)', '$1<redacted>')
    return $redacted
}

function Find-CSRuntimeReferences {
    param([string[]]$Roots)
    $results = New-Object System.Collections.ArrayList
    $files = Get-TextFilesUnderRoots -Roots $Roots -NamePatterns @('*.ps1', '*.bat', '*.cmd', '*.json', '*.yaml', '*.yml', '*.env', '*.config', '*.xml', '*.md')
    foreach ($file in $files) {
        try {
            $matches = Select-String -LiteralPath $file -Pattern 'CS_tunnel_runtime' -SimpleMatch -ErrorAction Stop
            foreach ($match in $matches) {
                [void]$results.Add([ordered]@{ source = 'file'; location = $file; line = $match.LineNumber; text = (Protect-ReceiptText -Text $match.Line.Trim()) })
            }
        }
        catch { }
    }
    Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match 'CS_tunnel_runtime' } | ForEach-Object {
        [void]$results.Add([ordered]@{ source = 'process'; location = [string]$_.ProcessId; line = $null; text = (Protect-ReceiptText -Text ([string]$_.CommandLine)) })
    }
    try {
        Get-ScheduledTask | ForEach-Object {
            $task = $_
            foreach ($action in $task.Actions) {
                $text = "{0} {1} {2}" -f $action.Execute, $action.Arguments, $action.WorkingDirectory
                if ($text -match 'CS_tunnel_runtime') {
                    [void]$results.Add([ordered]@{ source = 'scheduled-task'; location = ($task.TaskPath + $task.TaskName); line = $null; text = (Protect-ReceiptText -Text $text) })
                }
            }
        }
    }
    catch { }
    try {
        Get-CimInstance Win32_Service | Where-Object { $_.PathName -and $_.PathName -match 'CS_tunnel_runtime' } | ForEach-Object {
            [void]$results.Add([ordered]@{ source = 'windows-service'; location = [string]$_.Name; line = $null; text = (Protect-ReceiptText -Text ([string]$_.PathName)) })
        }
    }
    catch { }
    foreach ($scope in @('Machine', 'User', 'Process')) {
        try {
            [Environment]::GetEnvironmentVariables($scope).GetEnumerator() | Where-Object { ([string]$_.Key + '=' + [string]$_.Value) -match 'CS_tunnel_runtime' } | ForEach-Object {
                [void]$results.Add([ordered]@{ source = "environment-$scope"; location = [string]$_.Key; line = $null; text = (Protect-ReceiptText -Text ([string]$_.Value)) })
            }
        }
        catch { }
    }
    return @($results)
}

function Get-ControlStackRegistryReferences {
    $results = New-Object System.Collections.ArrayList
    foreach ($root in @('HKCU:\Software\ControlStack', 'HKLM:\SOFTWARE\ControlStack', 'HKLM:\SOFTWARE\WOW6432Node\ControlStack')) {
        if (-not (Test-Path -LiteralPath $root)) { continue }
        Get-ChildItem -LiteralPath $root -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
            $key = $_
            try {
                $properties = Get-ItemProperty -LiteralPath $key.PSPath -ErrorAction Stop
                foreach ($property in $properties.PSObject.Properties) {
                    if ($property.Name -like 'PS*') { continue }
                    $text = [string]$property.Value
                    if ($property.Name -match 'CS_tunnel_runtime' -or $text -match 'CS_tunnel_runtime') {
                        [void]$results.Add([ordered]@{
                            source = 'registry'
                            location = ($key.Name + '\' + $property.Name)
                            line = $null
                            text = (Protect-ReceiptText -Text $text)
                        })
                    }
                }
            }
            catch { }
        }
    }
    return @($results)
}

function Get-CommandLineArguments {
    param([string]$CommandLine)
    if (-not ('CommandLine.NativeMethods' -as [type])) {
        Add-Type -Namespace CommandLine -Name NativeMethods -MemberDefinition @'
[System.Runtime.InteropServices.DllImport("shell32.dll", SetLastError=true)]
public static extern System.IntPtr CommandLineToArgvW(
    [System.Runtime.InteropServices.MarshalAs(System.Runtime.InteropServices.UnmanagedType.LPWStr)] string lpCmdLine,
    out int pNumArgs);
[System.Runtime.InteropServices.DllImport("kernel32.dll")]
public static extern System.IntPtr LocalFree(System.IntPtr hMem);
'@
    }
    $argc = 0
    $ptr = [CommandLine.NativeMethods]::CommandLineToArgvW($CommandLine, [ref]$argc)
    if ($ptr -eq [IntPtr]::Zero) { throw 'CommandLineToArgvW failed.' }
    try {
        $args = New-Object string[] $argc
        for ($i = 0; $i -lt $argc; $i++) {
            $itemPtr = [Runtime.InteropServices.Marshal]::ReadIntPtr($ptr, $i * [IntPtr]::Size)
            $args[$i] = [Runtime.InteropServices.Marshal]::PtrToStringUni($itemPtr)
        }
        return $args
    }
    finally { [void][CommandLine.NativeMethods]::LocalFree($ptr) }
}

function Assert-SafeTunnelIdentifier {
    param([string]$Value, [string]$FailureCode)
    if ($Value -notmatch '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$') {
        Set-FailureCode -Code $FailureCode
        throw $FailureCode
    }
}

function ConvertTo-ApprovedLoopbackTarget {
    param([string]$Value, [int]$ExpectedPort)
    try { $uri = [Uri]$Value } catch { Set-FailureCode -Code 'TUNNEL_TARGET_REJECTED'; throw 'TUNNEL_TARGET_REJECTED' }
    if ($uri.Scheme -ne 'http' -or $uri.Host -notin @('127.0.0.1','localhost','::1') -or $uri.Port -ne $ExpectedPort -or $uri.AbsolutePath.TrimEnd('/') -ne '/mcp' -or $uri.Query -or $uri.Fragment) {
        Set-FailureCode -Code 'TUNNEL_TARGET_REJECTED'
        throw 'TUNNEL_TARGET_REJECTED'
    }
    return $uri.AbsoluteUri.TrimEnd('/')
}

function ConvertTo-ApprovedHealthAddress {
    param([string]$Value, [int]$ExpectedPort)
    $hadScheme = $Value -match '^https?://'
    $candidate = $(if ($hadScheme) { $Value } else { 'http://' + $Value })
    try { $uri = [Uri]$candidate } catch { Set-FailureCode -Code 'TUNNEL_HEALTH_REJECTED'; throw 'TUNNEL_HEALTH_REJECTED' }
    if ($uri.Scheme -ne 'http' -or $uri.Host -notin @('127.0.0.1','localhost','::1') -or $uri.Port -ne $ExpectedPort -or $uri.AbsolutePath -ne '/' -or $uri.Query -or $uri.Fragment) {
        Set-FailureCode -Code 'TUNNEL_HEALTH_REJECTED'
        throw 'TUNNEL_HEALTH_REJECTED'
    }
    if ($hadScheme) { return $uri.AbsoluteUri.TrimEnd('/') }
    return ("{0}:{1}" -f $uri.Host, $uri.Port)
}

function Set-ApprovedHealthPort {
    param([string]$Address, [int]$NewPort)
    $hadScheme = $Address -match '^https?://'
    $candidate = $(if ($hadScheme) { $Address } else { 'http://' + $Address })
    $builder = New-Object System.UriBuilder([Uri]$candidate)
    $builder.Port = $NewPort
    if ($hadScheme) { return $builder.Uri.AbsoluteUri.TrimEnd('/') }
    return ("{0}:{1}" -f $builder.Host, $builder.Port)
}

function ConvertFrom-ApprovedTunnelArguments {
    param([string[]]$Arguments, [int]$McpPort, [int]$HealthPort)
    if ($Arguments.Count -lt 9 -or $Arguments[0] -ne 'run') {
        Set-FailureCode -Code 'TUNNEL_OPERATION_REJECTED'
        throw 'TUNNEL_OPERATION_REJECTED'
    }
    $allowed = [ordered]@{
        '--profile' = 'profileName'
        '--tunnel' = 'tunnelIdentity'
        '--target' = 'mcpTarget'
        '--health-address' = 'healthAddress'
        '--log-level' = 'logLevel'
        '--log-format' = 'logFormat'
    }
    $values = [ordered]@{}
    for ($i = 1; $i -lt $Arguments.Count; $i++) {
        $token = [string]$Arguments[$i]
        if ($token -match '^[A-Za-z_][A-Za-z0-9_]*=') { Set-FailureCode -Code 'TUNNEL_ENV_ASSIGNMENT_REJECTED'; throw 'TUNNEL_ENV_ASSIGNMENT_REJECTED' }
        $name = $token
        $value = $null
        $equals = $token.IndexOf('=')
        if ($equals -gt 0) { $name = $token.Substring(0,$equals); $value = $token.Substring($equals + 1) }
        if (-not $allowed.Contains($name)) { Set-FailureCode -Code 'TUNNEL_ARGUMENT_REJECTED'; throw 'TUNNEL_ARGUMENT_REJECTED' }
        $property = [string]$allowed[$name]
        if ($values.Contains($property)) { Set-FailureCode -Code 'TUNNEL_ARGUMENT_DUPLICATED'; throw 'TUNNEL_ARGUMENT_DUPLICATED' }
        if ($null -eq $value) {
            $i++
            if ($i -ge $Arguments.Count) { Set-FailureCode -Code 'TUNNEL_ARGUMENT_VALUE_MISSING'; throw 'TUNNEL_ARGUMENT_VALUE_MISSING' }
            $value = [string]$Arguments[$i]
        }
        if ([string]::IsNullOrWhiteSpace($value) -or $value -match '\s' -or $value -match '^[A-Za-z_][A-Za-z0-9_]*=') {
            Set-FailureCode -Code 'TUNNEL_ARGUMENT_VALUE_REJECTED'
            throw 'TUNNEL_ARGUMENT_VALUE_REJECTED'
        }
        $values[$property] = $value
    }
    foreach ($required in @('profileName','tunnelIdentity','mcpTarget','healthAddress')) {
        if (-not $values.Contains($required)) { Set-FailureCode -Code 'TUNNEL_REQUIRED_ARGUMENT_MISSING'; throw 'TUNNEL_REQUIRED_ARGUMENT_MISSING' }
    }
    Assert-SafeTunnelIdentifier -Value ([string]$values.profileName) -FailureCode 'TUNNEL_PROFILE_REJECTED'
    Assert-SafeTunnelIdentifier -Value ([string]$values.tunnelIdentity) -FailureCode 'TUNNEL_IDENTITY_REJECTED'
    $logLevel = $null
    if ($values.Contains('logLevel')) {
        $logLevel = ([string]$values.logLevel).ToLowerInvariant()
        if ($logLevel -notin @('error','warn','info')) { Set-FailureCode -Code 'TUNNEL_LOG_LEVEL_REJECTED'; throw 'TUNNEL_LOG_LEVEL_REJECTED' }
    }
    $logFormat = $null
    if ($values.Contains('logFormat')) {
        $logFormat = ([string]$values.logFormat).ToLowerInvariant()
        if ($logFormat -notin @('json','text')) { Set-FailureCode -Code 'TUNNEL_LOG_FORMAT_REJECTED'; throw 'TUNNEL_LOG_FORMAT_REJECTED' }
    }
    return [ordered]@{
        operation = 'run'
        profileName = [string]$values.profileName
        tunnelIdentity = [string]$values.tunnelIdentity
        mcpTarget = ConvertTo-ApprovedLoopbackTarget -Value ([string]$values.mcpTarget) -ExpectedPort $McpPort
        healthAddress = ConvertTo-ApprovedHealthAddress -Value ([string]$values.healthAddress) -ExpectedPort $HealthPort
        logLevel = $logLevel
        logFormat = $logFormat
    }
}

function New-ApprovedTunnelArguments {
    param([object]$Definition, [string]$HealthAddress)
    $result = New-Object System.Collections.ArrayList
    [void]$result.Add('run')
    [void]$result.Add('--profile'); [void]$result.Add([string]$Definition.profileName)
    [void]$result.Add('--tunnel'); [void]$result.Add([string]$Definition.tunnelIdentity)
    [void]$result.Add('--target'); [void]$result.Add([string]$Definition.mcpTarget)
    [void]$result.Add('--health-address'); [void]$result.Add($HealthAddress)
    if ($Definition.logLevel) { [void]$result.Add('--log-level'); [void]$result.Add([string]$Definition.logLevel) }
    if ($Definition.logFormat) { [void]$result.Add('--log-format'); [void]$result.Add([string]$Definition.logFormat) }
    return @($result)
}

function Get-TunnelDefinition {
    param([string]$Id, [string]$Name, [int]$HealthPort, [string]$LaneRoot, [int]$TemporaryPort)
    $mcpPort = switch ($Id) {
        'selector-openai-tunnel' { $ExpectedPorts.SelectorMcp }
        'lab-openai-tunnel' { $ExpectedPorts.LabMcp }
        'program-openai-tunnel' { $ExpectedPorts.ProgramMcp }
        default { Set-FailureCode -Code 'TUNNEL_SERVICE_ID_REJECTED'; throw 'TUNNEL_SERVICE_ID_REJECTED' }
    }
    $evidence = Assert-ProcessIdentity -ServiceName $Name -Port $HealthPort -RequiredAnyMarkers @('run') -RequiredProcessNames @('*')
    $argv = Get-CommandLineArguments -CommandLine $evidence.commandLine
    if ($argv.Count -lt 2) { Set-FailureCode -Code 'TUNNEL_COMMAND_LINE_EMPTY'; throw 'TUNNEL_COMMAND_LINE_EMPTY' }
    $exe = $evidence.executablePath
    if ([string]::IsNullOrWhiteSpace($exe)) { Set-FailureCode -Code 'TUNNEL_EXECUTABLE_MISSING'; throw 'TUNNEL_EXECUTABLE_MISSING' }
    $approved = ConvertFrom-ApprovedTunnelArguments -Arguments @($argv | Select-Object -Skip 1) -McpPort $mcpPort -HealthPort $HealthPort
    return [ordered]@{
        id = $Id
        name = $Name
        laneRoot = $LaneRoot
        healthPort = $HealthPort
        temporaryPort = $TemporaryPort
        oldProcessId = $evidence.processId
        executable = $exe
        executableName = [System.IO.Path]::GetFileName($exe)
        operation = 'run'
        profileName = $approved.profileName
        tunnelIdentity = $approved.tunnelIdentity
        mcpTarget = $approved.mcpTarget
        healthAddress = $approved.healthAddress
        temporaryHealthAddress = Set-ApprovedHealthPort -Address $approved.healthAddress -NewPort $TemporaryPort
        logLevel = $approved.logLevel
        logFormat = $approved.logFormat
        workingDirectory = $LaneRoot
        identityMarkers = @('run', $approved.profileName, $approved.tunnelIdentity)
        evidence = $evidence
    }
}

function Start-ProcessWithCredential {
    param([object]$Definition, [string]$HealthAddress, [System.Security.SecureString]$SecureCredential)
    $bstr = [IntPtr]::Zero
    try {
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureCredential)
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        $oldOpenAi = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'Process')
        $prohibitedCredentialVariables = @('OPENAI_SERVICE_API_KEY','OPENAI_TOKEN','OPENAI_API_TOKEN','OPENAI_SERVICE_TOKEN')
        $previousProhibitedValues = @{}
        foreach ($name in $prohibitedCredentialVariables) {
            $previousProhibitedValues[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
        }
        try {
            foreach ($name in $prohibitedCredentialVariables) { [Environment]::SetEnvironmentVariable($name, $null, 'Process') }
            [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $plain, 'Process')
            $arguments = New-ApprovedTunnelArguments -Definition $Definition -HealthAddress $HealthAddress
            return Start-Process -FilePath $Definition.executable -ArgumentList $arguments -WorkingDirectory $Definition.workingDirectory -WindowStyle Hidden -PassThru
        }
        finally {
            [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $oldOpenAi, 'Process')
            foreach ($name in $prohibitedCredentialVariables) { [Environment]::SetEnvironmentVariable($name, $previousProhibitedValues[$name], 'Process') }
            $plain = $null
        }
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
}

function Stop-ExactProcess {
    param(
        [uint32]$ProcessId,
        [string]$Name,
        [int]$ExpectedPort,
        [string]$ExpectedExecutable,
        [string[]]$IdentityMarkers
    )
    if ($ExpectedPort -le 0 -or [string]::IsNullOrWhiteSpace($ExpectedExecutable) -or @($IdentityMarkers).Count -eq 0) {
        Set-FailureCode -Code 'PROCESS_STOP_GUARD_MISSING'
        throw 'PROCESS_STOP_GUARD_MISSING'
    }
    $listener = Get-ListeningProcess -Port $ExpectedPort
    if ([uint32]$listener.ProcessId -ne $ProcessId) { Set-FailureCode -Code 'PROCESS_STOP_PORT_OWNER_MISMATCH'; throw 'PROCESS_STOP_PORT_OWNER_MISMATCH' }
    if ([System.IO.Path]::GetFullPath([string]$listener.ExecutablePath) -ne [System.IO.Path]::GetFullPath($ExpectedExecutable)) {
        Set-FailureCode -Code 'PROCESS_STOP_EXECUTABLE_MISMATCH'
        throw 'PROCESS_STOP_EXECUTABLE_MISMATCH'
    }
    $commandLine = [string]$listener.CommandLine
    foreach ($marker in $IdentityMarkers) {
        if ($commandLine.IndexOf([string]$marker, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
            Set-FailureCode -Code 'PROCESS_STOP_IDENTITY_MISMATCH'
            throw 'PROCESS_STOP_IDENTITY_MISMATCH'
        }
    }
    Stop-Process -Id $ProcessId -Force
    try { Wait-Process -Id $ProcessId -Timeout 15 -ErrorAction SilentlyContinue } catch { }
    Add-ReceiptChange -Kind 'process-stop' -Path $Name -Detail 'verified-exact-pid'
}

function Assert-FreshTunnelRollbackRoute {
    param([object]$Definition, [uint32]$TemporaryProcessId)
    $listener = Get-ListeningProcess -Port $Definition.temporaryPort
    if ([uint32]$listener.ProcessId -ne $TemporaryProcessId) { Set-FailureCode -Code 'TUNNEL_ROLLBACK_ROUTE_MISSING'; throw 'TUNNEL_ROLLBACK_ROUTE_MISSING' }
    if ([System.IO.Path]::GetFullPath([string]$listener.ExecutablePath) -ne [System.IO.Path]::GetFullPath([string]$Definition.executable)) {
        Set-FailureCode -Code 'TUNNEL_ROLLBACK_EXECUTABLE_MISMATCH'
        throw 'TUNNEL_ROLLBACK_EXECUTABLE_MISMATCH'
    }
    foreach ($marker in $Definition.identityMarkers) {
        if ([string]$listener.CommandLine -notlike ('*' + [string]$marker + '*')) { Set-FailureCode -Code 'TUNNEL_ROLLBACK_IDENTITY_MISMATCH'; throw 'TUNNEL_ROLLBACK_IDENTITY_MISMATCH' }
    }
    Assert-StableTunnelHealth -Port $Definition.temporaryPort -Label ($Definition.name + ' fresh-key rollback route')
    return $listener
}

function Protect-SecretFile {
    param([string]$Path, [string]$Sid)
    $inheritance = Invoke-External -FilePath 'icacls.exe' -Arguments @($Path, '/inheritance:r') -AllowFailure
    if ($inheritance.exitCode -ne 0) { throw "Failed to disable inherited ACLs on secret file $Path." }
    $grant = Invoke-External -FilePath 'icacls.exe' -Arguments @($Path, '/grant:r', ("*{0}:(R,W)" -f $Sid)) -AllowFailure
    if ($grant.exitCode -ne 0) { throw "Failed to restrict secret file $Path to SID $Sid." }
}

function Write-ManagedTunnelPid {
    param([Parameter(Mandatory = $true)][string]$TunnelId, [Parameter(Mandatory = $true)][uint32]$ListenerProcessId)
    $pidFile = Join-Path $ManagerRoot ('pids\' + $TunnelId + '.pid')
    $pidDirectory = Split-Path -Parent $pidFile
    Ensure-Directory -Path $pidDirectory
    [System.IO.File]::WriteAllText($pidFile, [string]$ListenerProcessId, (New-Object System.Text.UTF8Encoding($false)))
    return $pidFile
}

function Convert-DefinitionForRegistry {
    param([object]$Definition, [string]$SecretFile)
    $branch = $ExpectedBranches.Program
    if ($Definition.id -like 'selector*') { $branch = $ExpectedBranches.Selector }
    elseif ($Definition.id -like 'lab*') { $branch = $ExpectedBranches.Lab }
    return [ordered]@{
        id = $Definition.id
        name = $Definition.name
        category = 'openai-tunnel'
        laneRoot = $Definition.laneRoot
        branch = $branch
        port = $Definition.healthPort
        healthPort = $Definition.healthPort
        executable = $Definition.executable
        executableName = $Definition.executableName
        operation = 'run'
        profileName = $Definition.profileName
        tunnelIdentity = $Definition.tunnelIdentity
        mcpTarget = $Definition.mcpTarget
        healthAddress = $Definition.healthAddress
        logLevel = $Definition.logLevel
        logFormat = $Definition.logFormat
        workingDirectory = $Definition.workingDirectory
        secretFile = $SecretFile
        ownerSid = $CurrentUserSid
        pidFile = (Join-Path $ManagerRoot ('pids\' + $Definition.id + '.pid'))
        identityMarkers = @($Definition.identityMarkers)
        managedCredential = $true
        managedByRepair = $true
        laneManagerOwned = $true
    }
}

function New-NonTunnelRegistryDefinition {
    param([string]$Id, [string]$Name, [int]$Port, [string]$LaneRoot, [string]$Branch, [object]$Evidence, [object]$Launcher, [string]$Category)
    $markers = New-Object System.Collections.ArrayList
    [void]$markers.Add($LaneRoot)
    if ($Category -eq 'mcp') { [void]$markers.Add('controlstack_mcp') }
    elseif ($Category -eq 'runtime') { [void]$markers.Add('server.js') }
    elseif ($Category -eq 'specification') {
        [void]$markers.Add('streamlit')
        [void]$markers.Add('specification')
    }
    return [ordered]@{
        id = $Id
        name = $Name
        category = $Category
        laneRoot = $LaneRoot
        branch = $Branch
        port = $Port
        healthPort = $Port
        launcher = $Launcher.path
        workingDirectory = $LaneRoot
        executable = $Evidence.executablePath
        executableName = $Evidence.processName
        identityMarkers = @($markers | Select-Object -Unique)
        managedCredential = $false
        managedByRepair = $true
        laneManagerOwned = $true
    }
}

function Test-ManagerRegistrySchema {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return }
    $parsed = [System.IO.File]::ReadAllText($Path) | ConvertFrom-Json
    if (-not ($parsed.PSObject.Properties.Name -contains 'services')) {
        throw "Existing manager registry $Path has no services array."
    }
    $ids = New-Object System.Collections.ArrayList
    foreach ($service in @($parsed.services)) {
        if (-not ($service.PSObject.Properties.Name -contains 'id') -or [string]::IsNullOrWhiteSpace([string]$service.id)) {
            throw "Existing manager registry $Path contains a service without an id."
        }
        if ($ids -contains [string]$service.id) { throw "Existing manager registry $Path contains duplicate service id '$($service.id)'." }
        [void]$ids.Add([string]$service.id)
    }
}

function Merge-ManagerRegistry {
    param([string]$Path, [object[]]$ManagedDefinitions, [object]$Discovery)
    $existing = $null
    if (Test-Path -LiteralPath $Path -PathType Leaf) { $existing = ([System.IO.File]::ReadAllText($Path) | ConvertFrom-Json) }
    if (-not $existing) { $existing = [pscustomobject]@{ schemaVersion = 2; services = @() } }
    if (-not ($existing.PSObject.Properties.Name -contains 'services')) { Set-FailureCode -Code 'LANE_MANAGER_REGISTRY_INVALID'; throw 'LANE_MANAGER_REGISTRY_INVALID' }

    $externalMatches = @{}
    foreach ($file in @($Discovery.discoveredFiles)) {
        if ([System.IO.Path]::GetExtension($file).ToLowerInvariant() -ne '.json') { continue }
        try {
            $json = [System.IO.File]::ReadAllText($file) | ConvertFrom-Json
            if (-not ($json.PSObject.Properties.Name -contains 'services')) { continue }
            foreach ($service in @($json.services)) {
                if (-not ($service.PSObject.Properties.Name -contains 'id') -or -not $service.id) { continue }
                $id = [string]$service.id
                if (-not $externalMatches.ContainsKey($id)) { $externalMatches[$id] = New-Object System.Collections.ArrayList }
                [void]$externalMatches[$id].Add($service)
            }
        }
        catch { }
    }

    $map = [ordered]@{}
    foreach ($service in @($existing.services)) {
        if (-not ($service.PSObject.Properties.Name -contains 'id') -or -not $service.id) { Set-FailureCode -Code 'LANE_MANAGER_SERVICE_ID_MISSING'; throw 'LANE_MANAGER_SERVICE_ID_MISSING' }
        $map[[string]$service.id] = $service
    }

    $repairOwnedNames = @(
        'id','name','category','laneRoot','branch','port','healthPort','executable','executableName',
        'arguments','args','command','commandLine','environment','env','variables','workingDirectory',
        'secretFile','ownerSid','pidFile','identityMarkers','managedCredential','managedByRepair','launcher',
        'observedProcess','operation','profileName','tunnelIdentity','mcpTarget','healthAddress','logLevel',
        'logFormat','laneManagerOwned'
    )

    foreach ($definition in $ManagedDefinitions) {
        $id = [string]$definition.id
        $base = $null
        if ($map.Contains($id)) { $base = $map[$id] }
        elseif ($externalMatches.ContainsKey($id)) {
            if (@($externalMatches[$id]).Count -ne 1) { Set-FailureCode -Code 'EXISTING_SERVICE_ID_AMBIGUOUS'; throw 'EXISTING_SERVICE_ID_AMBIGUOUS' }
            $base = $externalMatches[$id][0]
        }
        $merged = [ordered]@{}
        if ($null -ne $base) {
            foreach ($property in $base.PSObject.Properties) {
                if ($repairOwnedNames -notcontains $property.Name) { $merged[$property.Name] = $property.Value }
            }
        }
        foreach ($key in $definition.Keys) { $merged[[string]$key] = $definition[$key] }
        $map[$id] = [pscustomobject]$merged
    }

    $result = [ordered]@{}
    foreach ($property in $existing.PSObject.Properties) {
        if ($property.Name -notin @('services','schemaVersion','updatedAt','updatedBy')) { $result[$property.Name] = $property.Value }
    }
    $result.schemaVersion = 2
    $result.updatedAt = (Get-Date).ToString('o')
    $result.updatedBy = "$env:USERDOMAIN\$env:USERNAME"
    $result.services = @($map.Values)
    return ($result | ConvertTo-Json -Depth 30)
}

function Assert-PowerShellTextParses {
    param([Parameter(Mandatory = $true)][string]$Text, [Parameter(Mandatory = $true)][string]$Label)
    $tokens = $null
    $parseErrors = $null
    [void][System.Management.Automation.Language.Parser]::ParseInput($Text, [ref]$tokens, [ref]$parseErrors)
    if (@($parseErrors).Count -gt 0) {
        $details = @($parseErrors | ForEach-Object { "line $($_.Extent.StartLineNumber): $($_.Message)" }) -join '; '
        throw "$Label did not pass PowerShell parser validation: $details"
    }
}

function Get-ManagerScriptContent {
    return @'
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][ValidateSet('start','stop','restart','status')][string]$Action,
    [string]$Service = 'all'
)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RegistryPath = Join-Path $PSScriptRoot 'controlstack-managed-services.json'
$TunnelHostPath = Join-Path $PSScriptRoot 'ControlStack-TunnelHost.ps1'
if (-not (Test-Path -LiteralPath $RegistryPath)) { throw "Registry missing: $RegistryPath" }
$registry = Get-Content -LiteralPath $RegistryPath -Raw | ConvertFrom-Json
$services = @($registry.services | Where-Object { $_.PSObject.Properties.Name -contains 'laneManagerOwned' -and $_.laneManagerOwned -eq $true })
if ($Service -ne 'all') {
    $services = @($services | Where-Object { $_.id -eq $Service })
    if ($services.Count -ne 1) { throw "Unknown managed service: $Service" }
}
function Get-Listener([int]$Port) {
    return @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
}
function Test-ManagedHealth($entry) {
    if ($entry.category -ne 'openai-tunnel') { return $true }
    foreach ($path in @('/health','/healthz','/status','/')) {
        try {
            $response = Invoke-WebRequest -UseBasicParsing -Uri ("http://127.0.0.1:{0}{1}" -f $entry.healthPort, $path) -TimeoutSec 3
            if ([int]$response.StatusCode -ge 200 -and [int]$response.StatusCode -lt 400) { return $true }
        }
        catch { }
    }
    return $false
}
function Get-IdentityText([uint32]$ListenerProcessId) {
    $p = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $ListenerProcessId) -ErrorAction SilentlyContinue
    if (-not $p) { return '' }
    return "{0} {1} {2}" -f $p.Name, $p.ExecutablePath, $p.CommandLine
}
function Assert-Identity($entry, [uint32]$ListenerProcessId) {
    $currentOwners = Get-Listener ([int]$entry.port)
    if ($currentOwners.Count -ne 1 -or [uint32]$currentOwners[0] -ne $ListenerProcessId) { throw 'Current port ownership does not match the expected PID.' }
    $process = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $ListenerProcessId) -ErrorAction SilentlyContinue
    if (-not $process) { throw 'Expected listener process no longer exists.' }
    $expectedExecutable = [string]$entry.executable
    if ([string]::IsNullOrWhiteSpace($expectedExecutable)) { throw 'Expected executable is missing.' }
    $actualExecutable = [string]$process.ExecutablePath
    if ([System.IO.Path]::GetFullPath($actualExecutable) -ne [System.IO.Path]::GetFullPath($expectedExecutable)) { throw 'Listener executable identity mismatch.' }
    $text = "{0} {1} {2}" -f $process.Name, $process.ExecutablePath, $process.CommandLine
    foreach ($marker in @($entry.identityMarkers)) {
        if ($text.IndexOf([string]$marker, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) { throw 'Listener command-line identity mismatch.' }
    }
}
function Start-Entry($entry) {
    $listeners = Get-Listener ([int]$entry.port)
    if ($listeners.Count -gt 0) {
        foreach ($listenerProcessId in $listeners) { Assert-Identity $entry ([uint32]$listenerProcessId) }
        if (Test-ManagedHealth $entry) {
            Write-Host "$($entry.id): already running (PID $($listeners[0]))"
            return
        }
        throw 'Recognised service is present but unhealthy; refusing non-transactional replacement.'
    }
    if ($entry.category -eq 'openai-tunnel') {
        Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',$TunnelHostPath,'-ServiceId',$entry.id) -WorkingDirectory $PSScriptRoot -WindowStyle Hidden | Out-Null
    }
    else {
        $extension = [System.IO.Path]::GetExtension([string]$entry.launcher).ToLowerInvariant()
        if ($extension -in @('.bat','.cmd')) {
            Start-Process cmd.exe -ArgumentList @('/d','/s','/c',('"' + [string]$entry.launcher + '"')) -WorkingDirectory ([string]$entry.workingDirectory) -WindowStyle Hidden | Out-Null
        }
        elseif ($extension -eq '.ps1') {
            Start-Process powershell.exe -ArgumentList @('-NoProfile','-ExecutionPolicy','Bypass','-File',[string]$entry.launcher) -WorkingDirectory ([string]$entry.workingDirectory) -WindowStyle Hidden | Out-Null
        }
        else { throw "Unsupported launcher type for $($entry.id): $($entry.launcher)" }
    }
    for ($i=0; $i -lt 60; $i++) {
        Start-Sleep -Milliseconds 500
        $listeners = Get-Listener ([int]$entry.port)
        if ($listeners.Count -gt 0) {
            Assert-Identity $entry ([uint32]$listeners[0])
            if (-not (Test-ManagedHealth $entry)) { continue }
            Write-Host "$($entry.id): started (PID $($listeners[0]))"
            return
        }
    }
    throw "$($entry.id) did not become healthy on port $($entry.port)."
}
function Stop-Entry($entry) {
    $listeners = Get-Listener ([int]$entry.port)
    if ($listeners.Count -eq 0) { Write-Host "$($entry.id): already stopped"; return }
    foreach ($listenerProcessId in $listeners) {
        Assert-Identity $entry ([uint32]$listenerProcessId)
        Stop-Process -Id ([uint32]$listenerProcessId) -Force
        Write-Host "$($entry.id): stopped PID $listenerProcessId"
    }
}
function Status-Entry($entry) {
    $listeners = Get-Listener ([int]$entry.port)
    if ($listeners.Count -eq 0) { Write-Host "$($entry.id): stopped"; return }
    foreach ($listenerProcessId in $listeners) {
        try {
            Assert-Identity $entry ([uint32]$listenerProcessId)
            if (Test-ManagedHealth $entry) { Write-Host "$($entry.id): running PID $listenerProcessId port $($entry.port) healthy" }
            else { Write-Host "$($entry.id): running PID $listenerProcessId port $($entry.port) unhealthy" }
        }
        catch { Write-Host "$($entry.id): port occupied by unrecognised PID $listenerProcessId" }
    }
}
foreach ($entry in $services) {
    switch ($Action) {
        'start' { Start-Entry $entry }
        'stop' { Stop-Entry $entry }
        'restart' { Stop-Entry $entry; Start-Entry $entry }
        'status' { Status-Entry $entry }
    }
}
'@
}

function Get-TunnelHostScriptContent {
    return @'
[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$ServiceId)
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$RegistryPath = Join-Path $PSScriptRoot 'controlstack-managed-services.json'
$registry = Get-Content -LiteralPath $RegistryPath -Raw | ConvertFrom-Json
$entry = @($registry.services | Where-Object { $_.id -eq $ServiceId -and $_.laneManagerOwned -eq $true })
if ($entry.Count -ne 1 -or $entry[0].category -ne 'openai-tunnel') { throw 'Unknown lane-managed tunnel.' }
$entry = $entry[0]
$currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
if ($currentSid -ne [string]$entry.ownerSid) { throw 'Tunnel credential owner mismatch.' }
if ([string]$entry.operation -ne 'run') { throw 'Tunnel operation rejected.' }
if ([string]$entry.profileName -notmatch '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$') { throw 'Tunnel profile rejected.' }
if ([string]$entry.tunnelIdentity -notmatch '^[A-Za-z0-9][A-Za-z0-9._:-]{0,127}$') { throw 'Tunnel identity rejected.' }
$target = [Uri]([string]$entry.mcpTarget)
if ($target.Scheme -ne 'http' -or $target.Host -notin @('127.0.0.1','localhost','::1') -or $target.AbsolutePath.TrimEnd('/') -ne '/mcp' -or $target.Query -or $target.Fragment) { throw 'Tunnel target rejected.' }
$healthText = [string]$entry.healthAddress
$healthCandidate = $(if ($healthText -match '^https?://') { $healthText } else { 'http://' + $healthText })
$health = [Uri]$healthCandidate
if ($health.Scheme -ne 'http' -or $health.Host -notin @('127.0.0.1','localhost','::1') -or $health.Port -ne [int]$entry.healthPort -or $health.AbsolutePath -ne '/' -or $health.Query -or $health.Fragment) { throw 'Tunnel health address rejected.' }
if ($entry.logLevel -and [string]$entry.logLevel -notin @('error','warn','info')) { throw 'Tunnel log level rejected.' }
if ($entry.logFormat -and [string]$entry.logFormat -notin @('json','text')) { throw 'Tunnel log format rejected.' }
$encrypted = Get-Content -LiteralPath ([string]$entry.secretFile) -Raw
$secure = ConvertTo-SecureString $encrypted
$bstr = [IntPtr]::Zero
try {
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $previous = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY','Process')
    $prohibitedCredentialVariables = @('OPENAI_SERVICE_API_KEY','OPENAI_TOKEN','OPENAI_API_TOKEN','OPENAI_SERVICE_TOKEN')
    $previousProhibitedValues = @{}
    foreach ($name in $prohibitedCredentialVariables) { $previousProhibitedValues[$name] = [Environment]::GetEnvironmentVariable($name,'Process') }
    try {
        foreach ($name in $prohibitedCredentialVariables) { [Environment]::SetEnvironmentVariable($name,$null,'Process') }
        [Environment]::SetEnvironmentVariable('OPENAI_API_KEY',$plain,'Process')
        $arguments = New-Object System.Collections.ArrayList
        [void]$arguments.Add('run')
        [void]$arguments.Add('--profile'); [void]$arguments.Add([string]$entry.profileName)
        [void]$arguments.Add('--tunnel'); [void]$arguments.Add([string]$entry.tunnelIdentity)
        [void]$arguments.Add('--target'); [void]$arguments.Add([string]$entry.mcpTarget)
        [void]$arguments.Add('--health-address'); [void]$arguments.Add([string]$entry.healthAddress)
        if ($entry.logLevel) { [void]$arguments.Add('--log-level'); [void]$arguments.Add([string]$entry.logLevel) }
        if ($entry.logFormat) { [void]$arguments.Add('--log-format'); [void]$arguments.Add([string]$entry.logFormat) }
        Start-Process -FilePath ([string]$entry.executable) -ArgumentList @($arguments) -WorkingDirectory ([string]$entry.workingDirectory) -WindowStyle Hidden | Out-Null
    }
    finally {
        [Environment]::SetEnvironmentVariable('OPENAI_API_KEY',$previous,'Process')
        foreach ($name in $prohibitedCredentialVariables) { [Environment]::SetEnvironmentVariable($name,$previousProhibitedValues[$name],'Process') }
        $plain = $null
    }
}
finally {
    if ($bstr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
}
'@
}

function Get-CommandEntryContent {
    param([string]$Action)
    return "@echo off`r`npowershell.exe -NoProfile -ExecutionPolicy Bypass -File `"%~dp0ControlStack-ManagedServices.ps1`" -Action $Action -Service all`r`nexit /b %ERRORLEVEL%`r`n"
}

function Register-ManagerFiles {
    param([object[]]$Definitions, [object]$Discovery)
    Ensure-Directory -Path $ManagerRoot
    $registryContent = Merge-ManagerRegistry -Path $ManagerRegistryPath -ManagedDefinitions $Definitions -Discovery $Discovery
    $files = New-Object System.Collections.Specialized.OrderedDictionary
    $files.Add($ManagerRegistryPath, $registryContent)
    $files.Add($ManagerScriptPath, (Get-ManagerScriptContent))
    $files.Add($TunnelHostPath, (Get-TunnelHostScriptContent))
    $files.Add((Join-Path $ManagerRoot 'ControlStack-Start.cmd'), (Get-CommandEntryContent -Action 'start'))
    $files.Add((Join-Path $ManagerRoot 'ControlStack-Stop.cmd'), (Get-CommandEntryContent -Action 'stop'))
    $files.Add((Join-Path $ManagerRoot 'ControlStack-Restart.cmd'), (Get-CommandEntryContent -Action 'restart'))
    $files.Add((Join-Path $ManagerRoot 'ControlStack-Status.cmd'), (Get-CommandEntryContent -Action 'status'))
    foreach ($entry in $files.GetEnumerator()) {
        $path = [string]$entry.Key
        $content = [string]$entry.Value
        $old = $null
        if (Test-Path -LiteralPath $path -PathType Leaf) { $old = [System.IO.File]::ReadAllText($path) }
        if ($old -cne $content) {
            $backup = Backup-ChangedFile -Path $path
            Write-Utf8NoBomAtomic -Path $path -Content $content
            Add-ReceiptChange -Kind 'manager-file' -Path $path -Detail $(if ($backup) { "Updated; backup $backup" } else { 'Created additive manager file.' })
        }
        else { Add-ReceiptChange -Kind 'manager-file' -Path $path -Detail 'Already current; no write required.' }
    }

    $startupFolder = [Environment]::GetFolderPath('Startup')
    $script:StartupEntryPath = Join-Path $startupFolder 'ControlStack-LaneManagedServices.cmd'
    $startupContent = "@echo off`r`ncall `"$ManagerRoot\ControlStack-Start.cmd`"`r`n"
    $oldStartup = $null
    if (Test-Path -LiteralPath $StartupEntryPath -PathType Leaf) { $oldStartup = [System.IO.File]::ReadAllText($StartupEntryPath) }
    if ($oldStartup -cne $startupContent) {
        $backup = Backup-ChangedFile -Path $StartupEntryPath
        Write-Utf8NoBomAtomic -Path $StartupEntryPath -Content $startupContent
        Add-ReceiptChange -Kind 'startup-entry' -Path $StartupEntryPath -Detail $(if ($backup) { "Updated; backup $backup" } else { 'Created additive current-user startup entry.' })
    }
}

function Assert-NoDownstreamArtifactsActivation {
    param([string[]]$Files)
    $activeProcesses = @(Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match '(?i)downstream[-_ ]artifacts' })
    if ($activeProcesses.Count -gt 0) { throw 'downstream-artifacts appears in an active process and must remain inactive.' }
    foreach ($file in $Files) {
        try {
            $text = [System.IO.File]::ReadAllText($file)
            if ($text -match '(?i)downstream[-_ ]artifacts' -and $text -match '(?i)enabled\s*[:=]\s*(true|1|yes|on)') {
                throw "downstream-artifacts appears enabled in $file."
            }
        }
        catch [System.IO.IOException] { }
    }
}

function Get-ExistingManagerServiceNames {
    param([string[]]$Files)
    $names = New-Object System.Collections.ArrayList
    foreach ($file in $Files) {
        try {
            if ([System.IO.Path]::GetExtension($file) -eq '.json') {
                $json = [System.IO.File]::ReadAllText($file) | ConvertFrom-Json
                if ($json.PSObject.Properties.Name -contains 'services') {
                    foreach ($service in @($json.services)) {
                        $name = '<unnamed>'
                        if ($service.PSObject.Properties.Name -contains 'id' -and $service.id) { $name = [string]$service.id }
                        elseif ($service.PSObject.Properties.Name -contains 'name' -and $service.name) { $name = [string]$service.name }
                        [void]$names.Add([ordered]@{ name = $name; source = $file })
                    }
                }
            }
        }
        catch { }
    }
    return @($names)
}

function Get-ExistingOperationalServices {
    $items = New-Object System.Collections.ArrayList
    try {
        Get-ScheduledTask | ForEach-Object {
            $task = $_
            $actionText = (($task.Actions | ForEach-Object { "{0} {1} {2}" -f $_.Execute, $_.Arguments, $_.WorkingDirectory }) -join ' ')
            $combined = ($task.TaskPath + $task.TaskName + ' ' + $actionText)
            if ($combined -match '(?i)ControlStack|logo|asset') {
                [void]$items.Add([ordered]@{ name = ($task.TaskPath + $task.TaskName); source = 'scheduled-task'; detail = 'Existing task preserved unchanged.' })
            }
        }
    }
    catch { }
    try {
        Get-CimInstance Win32_Service | ForEach-Object {
            $combined = "{0} {1} {2}" -f $_.Name, $_.DisplayName, $_.PathName
            if ($combined -match '(?i)ControlStack|logo|asset') {
                [void]$items.Add([ordered]@{ name = [string]$_.Name; source = 'windows-service'; detail = 'Existing Windows service preserved unchanged.' })
            }
        }
    }
    catch { }
    try {
        Get-CimInstance Win32_Process | Where-Object { $_.CommandLine -and $_.CommandLine -match '(?i)C:\\ControlStack|logo|asset' } | ForEach-Object {
            [void]$items.Add([ordered]@{ name = ("process-{0}-{1}" -f $_.ProcessId, $_.Name); source = 'process'; detail = 'Existing ControlStack-related process preserved unless it is one of the three explicitly migrated tunnel PIDs.' })
        }
    }
    catch { }
    return @($items)
}

function Find-LabMemoryCommit {
    $log = Invoke-Git -Root $LabRoot -Arguments @('log', '-50', '--format=%H%x09%s')
    foreach ($line in $log.output) {
        $parts = @(([string]$line) -split "`t", 2)
        if ($parts.Count -eq 2 -and $parts[1] -eq $LabCommitMessage) {
            $commitHash = $parts[0]
            $paths = @((Invoke-Git -Root $LabRoot -Arguments @('show', '--pretty=format:', '--name-only', $commitHash)).output |
                Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
                ForEach-Object { ([string]$_).Replace('\', '/') })
            Assert-SameStringSet -Actual $paths -Expected $LabStagedPaths -Label "Previously committed Lab durable-memory parcel $commitHash"
            return $commitHash
        }
    }
    return $null
}

function Invoke-LabGateCommitPush {
    param([object]$FingerprintBefore, [bool]$AlreadyCommitted)
    if ($AlreadyCommitted) {
        Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'rerun verification'
        $Receipt.lab.commit = Find-LabMemoryCommit
        $Receipt.lab.push = 'not-required-already-present'
        return
    }

    $inventory = Get-GitInventory -Root $LabRoot
    Assert-SameStringSet -Actual $inventory.staged -Expected $LabStagedPaths -Label 'Lab staged documentation set before gate'
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'pre-gate verification'

    $gateRunner = Join-Path $ToolingRoot 'scripts\controlstack_lane_gate.py'
    if (-not (Test-Path -LiteralPath $gateRunner -PathType Leaf)) { throw "Gate runner missing: $gateRunner" }
    $python = (Get-Command python.exe -ErrorAction Stop).Source
    $gateResult = Invoke-External -FilePath $python -Arguments @($gateRunner, $LabGate, '--root', $LabRoot) -WorkingDirectory $ToolingRoot
    $Receipt.lab.gate = $LabGate
    $Receipt.lab.gateExitCode = [int]$gateResult.exitCode
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab gate'
    Assert-SameStringSet -Actual (Get-GitInventory -Root $LabRoot).staged -Expected $LabStagedPaths -Label 'Lab staged documentation set after gate'

    if ((Get-GitBranch -Root $LabRoot) -ne $ExpectedBranches.Lab) { throw 'Lab branch changed before commit.' }
    $commit = Invoke-Git -Root $LabRoot -Arguments @('commit', '-m', $LabCommitMessage)
    $head = (Invoke-Git -Root $LabRoot -Arguments @('rev-parse', 'HEAD')).output -join ''
    $Receipt.lab.commit = $head.Trim()

    $postCommitInventory = Get-GitInventory -Root $LabRoot
    if ($postCommitInventory.staged.Count -ne 0) { throw "Lab staged index is not empty after commit: $($postCommitInventory.staged -join ', ')." }
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab commit'

    if ((Get-GitBranch -Root $LabRoot) -ne $ExpectedBranches.Lab) { throw 'Lab branch changed before push.' }
    $push = Invoke-Git -Root $LabRoot -Arguments @('push', 'origin', ($ExpectedBranches.Lab + ':' + $ExpectedBranches.Lab))
    $Receipt.lab.push = 'pushed-lane-code-pilot-lab'
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab push'
}

try {
    Write-Host ("ControlStack environment repair {0} preflight..." -f $RepairMode.ToLowerInvariant())

    Set-AuditPhase -Phase 'COMMAND_AVAILABILITY'
    foreach ($command in @('git.exe','python.exe','powershell.exe','icacls.exe')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { Set-FailureCode -Code 'REQUIRED_COMMAND_MISSING'; throw 'REQUIRED_COMMAND_MISSING' }
    }

    Set-AuditPhase -Phase 'WINDOWS_IDENTITY'
    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $CurrentUserSid = $identity.User.Value

    Set-AuditPhase -Phase 'REQUIRED_ROOTS'
    foreach ($root in @($ProgramRoot,$SelectorRoot,$LabRoot,$ToolingRoot)) {
        if (-not (Test-Path -LiteralPath $root -PathType Container)) { Set-FailureCode -Code 'REQUIRED_ROOT_MISSING'; throw 'REQUIRED_ROOT_MISSING' }
    }

    Set-AuditPhase -Phase 'SELF_PARSE'
    $scriptExpected = Join-Path $ProgramRoot 'scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1'
    if ([System.IO.Path]::GetFullPath($PSCommandPath) -ne [System.IO.Path]::GetFullPath($scriptExpected)) { Set-FailureCode -Code 'SCRIPT_PATH_MISMATCH'; throw 'SCRIPT_PATH_MISMATCH' }
    Assert-PowerShellTextParses -Text ([System.IO.File]::ReadAllText($PSCommandPath)) -Label 'Repair script'

    Set-AuditPhase -Phase 'BRANCH_VALIDATION'
    $Receipt.branches.program = Get-GitBranch -Root $ProgramRoot
    $Receipt.branches.selector = Get-GitBranch -Root $SelectorRoot
    $Receipt.branches.lab = Get-GitBranch -Root $LabRoot
    if ($Receipt.branches.program -ne $ExpectedBranches.Program) { Set-FailureCode -Code 'PROGRAM_BRANCH_MISMATCH'; throw 'PROGRAM_BRANCH_MISMATCH' }
    if ($Receipt.branches.selector -ne $ExpectedBranches.Selector) { Set-FailureCode -Code 'SELECTOR_BRANCH_MISMATCH'; throw 'SELECTOR_BRANCH_MISMATCH' }
    if ($Receipt.branches.lab -ne $ExpectedBranches.Lab) { Set-FailureCode -Code 'LAB_BRANCH_MISMATCH'; throw 'LAB_BRANCH_MISMATCH' }
    Add-ReceiptValidation -Code 'ROOTS_BRANCHES_AND_SCRIPT' -Status 'passed'

    Set-AuditPhase -Phase 'PROGRAM_GIT_STATE'
    $programInventory = Get-GitInventory -Root $ProgramRoot
    if ($programInventory.staged.Count -gt 0 -or $programInventory.modified.Count -gt 0 -or $programInventory.untracked.Count -gt 0) { Set-FailureCode -Code 'PROGRAM_WORKTREE_NOT_CLEAN'; throw 'PROGRAM_WORKTREE_NOT_CLEAN' }

    Set-AuditPhase -Phase 'LAB_GIT_STATE'
    $labInventory = Get-GitInventory -Root $LabRoot
    $labMemoryCommit = Find-LabMemoryCommit
    $labAlreadyCommitted = $false
    if ($labInventory.staged.Count -eq 0 -and $labMemoryCommit) { $labAlreadyCommitted = $true }
    elseif ($labInventory.staged.Count -gt 0) { Assert-SameStringSet -Actual $labInventory.staged -Expected $LabStagedPaths -Label 'Lab staged documentation set' }
    else { Set-FailureCode -Code 'LAB_DOCUMENTATION_STATE_INVALID'; throw 'LAB_DOCUMENTATION_STATE_INVALID' }
    if ($labInventory.modified.Count -ne 10 -or $labInventory.untracked.Count -ne 66) { Set-FailureCode -Code 'LAB_PROTECTED_COUNT_MISMATCH'; throw 'LAB_PROTECTED_COUNT_MISMATCH' }
    $protectedIntersection = @($labInventory.staged | Where-Object { $labInventory.modified -contains $_ -or $labInventory.untracked -contains $_ })
    if ($protectedIntersection.Count -gt 0) { Set-FailureCode -Code 'LAB_PROTECTED_PATH_STAGED'; throw 'LAB_PROTECTED_PATH_STAGED' }
    $ProtectedLabFingerprintBefore = Get-ProtectedLabFingerprint -Root $LabRoot
    $Receipt.lab.protectedDigest = $ProtectedLabFingerprintBefore.digest
    Add-ReceiptValidation -Code 'LAB_PROTECTED_STATE' -Status 'passed'

    Set-AuditPhase -Phase 'SERVICE_IDENTITIES'
    $serviceEvidence = [ordered]@{}
    $serviceEvidence.selectorMcp = Assert-ProcessIdentity -ServiceName 'Selector MCP' -Port $ExpectedPorts.SelectorMcp -RequiredAnyMarkers @($SelectorRoot,$ToolingRoot,'controlstack_mcp') -RequiredProcessNames @('python*.exe')
    $serviceEvidence.selectorRuntime = Assert-ProcessIdentity -ServiceName 'Selector runtime' -Port $ExpectedPorts.SelectorRuntime -RequiredAnyMarkers @($SelectorRoot,'server.js','workspace') -RequiredProcessNames @('node*.exe')
    $serviceEvidence.labMcp = Assert-ProcessIdentity -ServiceName 'Lab MCP' -Port $ExpectedPorts.LabMcp -RequiredAnyMarkers @($LabRoot,$ToolingRoot,'controlstack_mcp') -RequiredProcessNames @('python*.exe')
    $serviceEvidence.labSpecification = Assert-ProcessIdentity -ServiceName 'Lab specification service' -Port $ExpectedPorts.LabSpecification -RequiredAnyMarkers @($LabRoot,'streamlit','specification','demo') -RequiredProcessNames @('python*.exe','node*.exe')
    $serviceEvidence.programMcp = Assert-ProcessIdentity -ServiceName 'Program MCP' -Port $ExpectedPorts.ProgramMcp -RequiredAnyMarkers @($ProgramRoot,$ToolingRoot,'controlstack_mcp') -RequiredProcessNames @('python*.exe')
    Add-ReceiptValidation -Code 'SERVICE_IDENTITIES' -Status 'passed'

    Set-AuditPhase -Phase 'LAUNCHER_DISCOVERY'
    $launchers = [ordered]@{}
    $launchers.selectorMcp = Find-LauncherFile -ServiceName 'Selector MCP' -Port $ExpectedPorts.SelectorMcp -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot,$SelectorRoot) -ExtraMarkers @('controlstack_mcp','selector-engine')
    $launchers.selectorRuntime = Find-LauncherFile -ServiceName 'Selector runtime' -Port $ExpectedPorts.SelectorRuntime -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot,$SelectorRoot) -ExtraMarkers @('server.js','runtime')
    $launchers.labMcp = Find-LauncherFile -ServiceName 'Lab MCP' -Port $ExpectedPorts.LabMcp -LaneRoot $LabRoot -SearchRoots @($ToolingRoot,$LabRoot) -ExtraMarkers @('controlstack_mcp','lab-ies')
    $launchers.labSpecification = Find-LauncherFile -ServiceName 'Lab specification service' -Port $ExpectedPorts.LabSpecification -LaneRoot $LabRoot -SearchRoots @($ToolingRoot,$LabRoot) -ExtraMarkers @('streamlit','specification','demo')
    $launchers.programMcp = Find-LauncherFile -ServiceName 'Program MCP' -Port $ExpectedPorts.ProgramMcp -LaneRoot $ProgramRoot -SearchRoots @($ToolingRoot,$ProgramRoot) -ExtraMarkers @('controlstack_mcp','program-integrate')
    Add-ReceiptValidation -Code 'LAUNCHER_DISCOVERY' -Status 'passed'

    Set-AuditPhase -Phase 'SELECTOR_SCOPE_PLAN'
    $scopeSource = Find-SelectorScopeSource
    $SelectorConfigPlan = New-SelectorConfigPlan -ScopeSource $scopeSource
    Add-ReceiptValidation -Code 'SELECTOR_BLUE_GREEN_PLAN' -Status 'passed' -ServiceId 'selector-mcp' -Port $ExpectedPorts.SelectorMcpCandidate

    Set-AuditPhase -Phase 'MANAGER_DISCOVERY'
    $managerDiscovery = Get-ManagerDiscovery
    $ManagerRoot = Join-Path $env:LOCALAPPDATA 'ControlStack\lane-managed-services'
    $ManagerRegistryPath = Join-Path $ManagerRoot 'controlstack-managed-services.json'
    $ManagerScriptPath = Join-Path $ManagerRoot 'ControlStack-ManagedServices.ps1'
    $TunnelHostPath = Join-Path $ManagerRoot 'ControlStack-TunnelHost.ps1'
    $StartupEntryPath = Join-Path ([Environment]::GetFolderPath('Startup')) 'ControlStack-LaneManagedServices.cmd'

    Set-AuditPhase -Phase 'GENERATED_SCRIPT_PARSE'
    Assert-PowerShellTextParses -Text (Get-ManagerScriptContent) -Label 'Generated lane service manager'
    Assert-PowerShellTextParses -Text (Get-TunnelHostScriptContent) -Label 'Generated lane tunnel host'
    Add-ReceiptValidation -Code 'GENERATED_SCRIPT_PARSE' -Status 'passed'

    Set-AuditPhase -Phase 'MANAGER_PRESERVATION'
    Test-ManagerRegistrySchema -Path $ManagerRegistryPath
    $existingManagerServices = Get-ExistingManagerServiceNames -Files $managerDiscovery.discoveredFiles
    $Receipt.preservation.existingManagerFileCount = @($managerDiscovery.discoveredFiles).Count
    $Receipt.preservation.existingServiceCount = @($existingManagerServices).Count
    $managedIds = @('selector-mcp','selector-runtime','selector-openai-tunnel','lab-mcp','lab-specification','lab-openai-tunnel','program-mcp','program-openai-tunnel')
    $Receipt.preservation.unknownServiceCount = @($existingManagerServices | Where-Object { $managedIds -notcontains $_.name }).Count
    Add-ReceiptValidation -Code 'MANAGER_PRESERVATION' -Status 'passed'

    Set-AuditPhase -Phase 'DOWNSTREAM_INACTIVITY'
    Assert-NoDownstreamArtifactsActivation -Files $managerDiscovery.discoveredFiles

    Set-AuditPhase -Phase 'LEGACY_REFERENCE_SCAN'
    $topLevelControlStackRoots = @(Get-ChildItem -LiteralPath 'C:\' -Directory -Filter 'ControlStack*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
    $referenceRoots = @($ToolingRoot,$ProgramRoot,$SelectorRoot,$LabRoot,$ManagerRoot,(Join-Path $env:LOCALAPPDATA 'ControlStack'),(Join-Path $env:ProgramData 'ControlStack'),([Environment]::GetFolderPath('Startup'))) + $topLevelControlStackRoots
    $references = @(Find-CSRuntimeReferences -Roots @($referenceRoots | Where-Object { $_ } | Sort-Object -Unique))
    $references += @(Get-ControlStackRegistryReferences)
    $Receipt.preservation.csTunnelRuntimeReferenceCount = $references.Count
    $references = $null
    Add-ReceiptValidation -Code 'LEGACY_REFERENCE_SCAN' -Status 'passed'

    Set-AuditPhase -Phase 'TEMPORARY_PORTS'
    foreach ($temporaryPort in @($ExpectedPorts.SelectorMcpCandidate,8180,8181,8182)) {
        if (@(Get-NetTCPConnection -State Listen -LocalPort $temporaryPort -ErrorAction SilentlyContinue).Count -gt 0) { Set-FailureCode -Code 'TEMPORARY_PORT_OCCUPIED'; throw 'TEMPORARY_PORT_OCCUPIED' }
    }
    Add-ReceiptValidation -Code 'TEMPORARY_PORTS' -Status 'passed'

    Set-AuditPhase -Phase 'TUNNEL_DEFINITIONS'
    $tunnels = [ordered]@{}
    $tunnels.selector = Get-TunnelDefinition -Id 'selector-openai-tunnel' -Name 'Selector OpenAI tunnel' -HealthPort $ExpectedPorts.SelectorTunnel -LaneRoot $SelectorRoot -TemporaryPort 8182
    $tunnels.lab = Get-TunnelDefinition -Id 'lab-openai-tunnel' -Name 'Lab OpenAI tunnel' -HealthPort $ExpectedPorts.LabTunnel -LaneRoot $LabRoot -TemporaryPort 8181
    $tunnels.program = Get-TunnelDefinition -Id 'program-openai-tunnel' -Name 'Program OpenAI tunnel' -HealthPort $ExpectedPorts.ProgramTunnel -LaneRoot $ProgramRoot -TemporaryPort 8180
    Add-ReceiptValidation -Code 'TUNNEL_DEFINITIONS' -Status 'passed'

    Set-AuditPhase -Phase 'TUNNEL_HEALTH'
    foreach ($tunnel in $tunnels.Values) {
        $health = Get-HealthCheck -Port $tunnel.healthPort -Attempts 3 -DelayMilliseconds 300
        if (-not $health.healthy) { Set-FailureCode -Code 'EXISTING_TUNNEL_UNHEALTHY'; throw 'EXISTING_TUNNEL_UNHEALTHY' }
        $OldTunnelProcesses[$tunnel.id] = $tunnel
        $TunnelLoadBearing[$tunnel.id] = 'original'
        Add-ReceiptValidation -Code 'TUNNEL_ARGUMENT_ALLOWLIST' -Status 'passed' -ServiceId $tunnel.id -Port $tunnel.healthPort -ProcessId $tunnel.oldProcessId
    }
    Add-ReceiptValidation -Code 'TUNNEL_HEALTH' -Status 'passed'

    Set-AuditPhase -Phase 'RECEIPT_SERVICE_SUMMARY'
    foreach ($entry in @(
        [ordered]@{ id='selector-mcp'; port=$ExpectedPorts.SelectorMcp; evidence=$serviceEvidence.selectorMcp },
        [ordered]@{ id='selector-runtime'; port=$ExpectedPorts.SelectorRuntime; evidence=$serviceEvidence.selectorRuntime },
        [ordered]@{ id='lab-mcp'; port=$ExpectedPorts.LabMcp; evidence=$serviceEvidence.labMcp },
        [ordered]@{ id='lab-specification'; port=$ExpectedPorts.LabSpecification; evidence=$serviceEvidence.labSpecification },
        [ordered]@{ id='program-mcp'; port=$ExpectedPorts.ProgramMcp; evidence=$serviceEvidence.programMcp }
    )) { Add-ReceiptService -ServiceId $entry.id -Port $entry.port -ProcessId $entry.evidence.processId -ExecutableName $entry.evidence.processName -Status 'running-validated' }
    foreach ($tunnel in $tunnels.Values) { Add-ReceiptService -ServiceId $tunnel.id -Port $tunnel.healthPort -ProcessId $tunnel.oldProcessId -ExecutableName $tunnel.executableName -Status 'running-validated' }

    Set-AuditPhase -Phase 'AUDIT_RECEIPT'
    if ($AuditOnly) {
        $Receipt.lab.gate = 'not-run-audit-only'
        $Receipt.lab.push = 'not-run-audit-only'
        $Receipt.selector.activation = 'validated-not-run'
        Write-Receipt -Status 'audit-passed'
        Write-Host 'CONTROLSTACK ENVIRONMENT REPAIR AUDIT PASSED'
        exit 0
    }

    Write-Host 'Preflight passed. Create a fresh dedicated OpenAI service API key, copy it to the Windows clipboard, then return here.'
    [void](Read-Host 'Press Enter after the fresh key is on the clipboard')
    $SecretPlainText = Get-Clipboard -Raw
    if ([string]::IsNullOrWhiteSpace($SecretPlainText)) { Set-FailureCode -Code 'CLIPBOARD_KEY_MISSING'; throw 'CLIPBOARD_KEY_MISSING' }
    $SecretPlainText = $SecretPlainText.Trim()
    if ($SecretPlainText.Length -lt 20 -or $SecretPlainText -match '\s') { Set-FailureCode -Code 'CLIPBOARD_KEY_REJECTED'; throw 'CLIPBOARD_KEY_REJECTED' }
    $SecretSecure = ConvertTo-SecureString -String $SecretPlainText -AsPlainText -Force
    Set-Clipboard -Value 'ControlStack credential captured securely.'
    $SecretPlainText = $null
    $MutationStarted = $true

    $secretRoot = Join-Path $env:LOCALAPPDATA 'ControlStack\secrets'
    Ensure-Directory -Path $secretRoot
    Protect-PrivateDirectory -Path $secretRoot -Sid $CurrentUserSid
    $NewSecretFile = Join-Path $secretRoot ("openai-service-api-key-{0}.dpapi" -f $Timestamp)
    $encrypted = ConvertFrom-SecureString -SecureString $SecretSecure
    Write-Utf8NoBomAtomic -Path $NewSecretFile -Content $encrypted
    Protect-SecretFile -Path $NewSecretFile -Sid $CurrentUserSid
    Add-ReceiptChange -Kind 'dpapi-credential' -Path 'credential' -Detail 'current-user-dpapi'

    foreach ($tunnel in $tunnels.Values) {
        [void](Start-ProcessWithCredential -Definition $tunnel -HealthAddress $tunnel.temporaryHealthAddress -SecureCredential $SecretSecure)
        Assert-StableTunnelHealth -Port $tunnel.temporaryPort -Label ($tunnel.name + ' fresh-key temporary replacement')
        $temporaryListener = Get-ListeningProcess -Port $tunnel.temporaryPort
        [void](Assert-FreshTunnelRollbackRoute -Definition $tunnel -TemporaryProcessId ([uint32]$temporaryListener.ProcessId))
        $record = [ordered]@{ definition=$tunnel; listenerProcessId=[uint32]$temporaryListener.ProcessId }
        [void]$TemporaryTunnelProcesses.Add($record)
    }

    Invoke-LabGateCommitPush -FingerprintBefore $ProtectedLabFingerprintBefore -AlreadyCommitted $labAlreadyCommitted
    $serviceEvidence.selectorMcp = Invoke-SelectorBlueGreenActivation -Plan $SelectorConfigPlan -OriginalEvidence $serviceEvidence.selectorMcp

    $definitions = @(
        (New-NonTunnelRegistryDefinition -Id 'selector-mcp' -Name 'Selector MCP' -Port $ExpectedPorts.SelectorMcp -LaneRoot $SelectorRoot -Branch $ExpectedBranches.Selector -Evidence $serviceEvidence.selectorMcp -Launcher $launchers.selectorMcp -Category 'mcp'),
        (New-NonTunnelRegistryDefinition -Id 'selector-runtime' -Name 'Selector runtime' -Port $ExpectedPorts.SelectorRuntime -LaneRoot $SelectorRoot -Branch $ExpectedBranches.Selector -Evidence $serviceEvidence.selectorRuntime -Launcher $launchers.selectorRuntime -Category 'runtime'),
        (Convert-DefinitionForRegistry -Definition $tunnels.selector -SecretFile $NewSecretFile),
        (New-NonTunnelRegistryDefinition -Id 'lab-mcp' -Name 'Lab MCP' -Port $ExpectedPorts.LabMcp -LaneRoot $LabRoot -Branch $ExpectedBranches.Lab -Evidence $serviceEvidence.labMcp -Launcher $launchers.labMcp -Category 'mcp'),
        (New-NonTunnelRegistryDefinition -Id 'lab-specification' -Name 'Lab specification service' -Port $ExpectedPorts.LabSpecification -LaneRoot $LabRoot -Branch $ExpectedBranches.Lab -Evidence $serviceEvidence.labSpecification -Launcher $launchers.labSpecification -Category 'specification'),
        (Convert-DefinitionForRegistry -Definition $tunnels.lab -SecretFile $NewSecretFile),
        (New-NonTunnelRegistryDefinition -Id 'program-mcp' -Name 'Program MCP' -Port $ExpectedPorts.ProgramMcp -LaneRoot $ProgramRoot -Branch $ExpectedBranches.Program -Evidence $serviceEvidence.programMcp -Launcher $launchers.programMcp -Category 'mcp'),
        (Convert-DefinitionForRegistry -Definition $tunnels.program -SecretFile $NewSecretFile)
    )
    if ($definitions.Count -ne 8) { Set-FailureCode -Code 'MANAGED_SERVICE_COUNT_MISMATCH'; throw 'MANAGED_SERVICE_COUNT_MISMATCH' }
    Register-ManagerFiles -Definitions $definitions -Discovery $managerDiscovery

    foreach ($temporary in @($TemporaryTunnelProcesses)) {
        $tunnel = $temporary.definition
        [void](Assert-FreshTunnelRollbackRoute -Definition $tunnel -TemporaryProcessId ([uint32]$temporary.listenerProcessId))
        Stop-ExactProcess -ProcessId ([uint32]$tunnel.oldProcessId) -Name ($tunnel.id + '-original') -ExpectedPort $tunnel.healthPort -ExpectedExecutable $tunnel.executable -IdentityMarkers @($tunnel.identityMarkers)
        $TunnelLoadBearing[$tunnel.id] = 'temporary'
        $canonicalStarted = $null
        try {
            $canonicalStarted = Start-ProcessWithCredential -Definition $tunnel -HealthAddress $tunnel.healthAddress -SecureCredential $SecretSecure
            Assert-StableTunnelHealth -Port $tunnel.healthPort -Label ($tunnel.name + ' canonical replacement')
            $canonicalListener = Get-ListeningProcess -Port $tunnel.healthPort
            $canonicalRecord = [ordered]@{ definition=$tunnel; listenerProcessId=[uint32]$canonicalListener.ProcessId }
            [void]$NewCanonicalTunnelProcesses.Add($canonicalRecord)
            $TunnelLoadBearing[$tunnel.id] = 'canonical'
            Stop-ExactProcess -ProcessId ([uint32]$temporary.listenerProcessId) -Name ($tunnel.id + '-temporary') -ExpectedPort $tunnel.temporaryPort -ExpectedExecutable $tunnel.executable -IdentityMarkers @($tunnel.identityMarkers)
            $temporary.listenerProcessId = $null
            $managedPidFile = Write-ManagedTunnelPid -TunnelId $tunnel.id -ListenerProcessId ([uint32]$canonicalListener.ProcessId)
            Add-ReceiptChange -Kind 'tunnel-cutover' -Path $tunnel.id -Detail 'fresh-key-canonical-healthy'
        }
        catch {
            $TunnelLoadBearing[$tunnel.id] = 'temporary'
            if ($null -ne $canonicalStarted) {
                try {
                    $owners = @(Get-NetTCPConnection -State Listen -LocalPort $tunnel.healthPort -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
                    if ($owners.Count -eq 1 -and [uint32]$owners[0] -eq [uint32]$canonicalStarted.Id) {
                        Stop-ExactProcess -ProcessId ([uint32]$owners[0]) -Name ($tunnel.id + '-failed-canonical') -ExpectedPort $tunnel.healthPort -ExpectedExecutable $tunnel.executable -IdentityMarkers @($tunnel.identityMarkers)
                    }
                }
                catch { }
            }
            Set-FailureCode -Code 'TUNNEL_CANONICAL_CUTOVER_FAILED'
            throw 'TUNNEL_CANONICAL_CUTOVER_FAILED'
        }
    }

    $finalLab = Get-GitInventory -Root $LabRoot
    Assert-LabProtectedInventory -Before $ProtectedLabFingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'final verification'
    if ($finalLab.staged.Count -ne 0) { Set-FailureCode -Code 'LAB_FINAL_INDEX_NOT_EMPTY'; throw 'LAB_FINAL_INDEX_NOT_EMPTY' }

    foreach ($definition in $definitions) {
        $listener = Get-ListeningProcess -Port ([int]$definition.port)
        Add-ReceiptService -ServiceId ([string]$definition.id) -Port ([int]$definition.port) -ProcessId ([uint32]$listener.ProcessId) -ExecutableName ([string]$listener.Name) -Status 'running-managed'
    }

    $SecretSecure.Dispose()
    $SecretSecure = $null
    Write-Receipt -Status 'completed'
    Write-Host 'CONTROLSTACK ENVIRONMENT REPAIR COMPLETED'
}
catch {
    $failureRecord = $_
    $Receipt.failure.phase = $CurrentPhase
    try {
        $line = [int]$failureRecord.InvocationInfo.ScriptLineNumber
        if ($line -gt 0) { $Receipt.failure.scriptLine = $line }
    }
    catch { }
    try { $Receipt.failure.exceptionType = [string]$failureRecord.Exception.GetType().Name }
    catch { $Receipt.failure.exceptionType = 'UnknownException' }
    if ($FailureCode -eq 'NONE') {
        Set-FailureCode -Code ("{0}_{1}_FAILED" -f $RepairMode, $CurrentPhase)
    }
    foreach ($temporary in @($TemporaryTunnelProcesses)) {
        try {
            $tunnel = $temporary.definition
            $state = [string]$TunnelLoadBearing[$tunnel.id]
            if (($state -eq 'original' -or $state -eq 'canonical') -and $temporary.listenerProcessId) {
                Stop-ExactProcess -ProcessId ([uint32]$temporary.listenerProcessId) -Name ($tunnel.id + '-temporary-cleanup') -ExpectedPort $tunnel.temporaryPort -ExpectedExecutable $tunnel.executable -IdentityMarkers @($tunnel.identityMarkers)
            }
        }
        catch { }
    }
    if ($SecretPlainText) { $SecretPlainText = '<cleared-after-failure>'; $SecretPlainText = $null }
    if ($SecretSecure) { $SecretSecure.Dispose(); $SecretSecure = $null }
    if (-not $AuditOnly) { try { Set-Clipboard -Value 'ControlStack repair stopped safely.' } catch { } }
    try { Write-Receipt -Status $(if ($MutationStarted) { 'failed-after-mutation-started' } else { 'preflight-failed-no-mutation' }) } catch { }
    Write-Error ("ControlStack repair failed with safe result code {0}; phase {1}; line {2}; type {3}." -f $FailureCode, $Receipt.failure.phase, $Receipt.failure.scriptLine, $Receipt.failure.exceptionType)
    exit 1
}
