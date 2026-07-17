#requires -Version 5.1

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$RepairVersion = '1.0.0'
$StartedAt = Get-Date
$Timestamp = $StartedAt.ToString('yyyyMMdd-HHmmss')
$ReceiptRoot = 'C:\ControlStack_Receipts'
$ReceiptPath = Join-Path $ReceiptRoot ("CONTROLSTACK_ENVIRONMENT_REPAIR_{0}.json" -f $Timestamp)
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
    startedAt = $StartedAt.ToString('o')
    computer = $env:COMPUTERNAME
    user = "$env:USERDOMAIN\$env:USERNAME"
    userSid = $null
    status = 'started'
    preflight = [ordered]@{}
    changes = New-Object System.Collections.ArrayList
    preservedServices = New-Object System.Collections.ArrayList
    backups = New-Object System.Collections.ArrayList
    tunnelRuntimeReferences = New-Object System.Collections.ArrayList
    lab = [ordered]@{}
    selector = [ordered]@{}
    services = [ordered]@{}
    errors = New-Object System.Collections.ArrayList
}

$MutationStarted = $false
$TemporaryTunnelProcesses = New-Object System.Collections.ArrayList
$NewCanonicalTunnelProcesses = New-Object System.Collections.ArrayList
$OldTunnelProcesses = @{}
$StoppedOriginalTunnelIds = New-Object System.Collections.ArrayList
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

function Add-ReceiptChange {
    param([string]$Kind, [string]$Path, [string]$Detail)
    [void]$Receipt.changes.Add([ordered]@{ kind = $Kind; path = $Path; detail = $Detail })
}

function Add-PreservedService {
    param([string]$Name, [string]$Source, [string]$Detail)
    [void]$Receipt.preservedServices.Add([ordered]@{ name = $Name; source = $Source; detail = $Detail })
}

function Add-ReceiptError {
    param([string]$Message)
    [void]$Receipt.errors.Add($Message)
}

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        New-Item -ItemType Directory -Path $Path -Force | Out-Null
    }
}

function Write-Receipt {
    param([string]$Status)
    $Receipt.status = $Status
    $Receipt.completedAt = (Get-Date).ToString('o')
    Ensure-Directory -Path $ReceiptRoot
    $json = $Receipt | ConvertTo-Json -Depth 20
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
    try {
        if ($WorkingDirectory) { Set-Location -LiteralPath $WorkingDirectory }
        $output = & $FilePath @Arguments 2>&1
        $exitCode = $LASTEXITCODE
    }
    finally {
        Set-Location -LiteralPath $original
    }
    if (-not $AllowFailure -and $exitCode -ne 0) {
        throw "Command failed with exit code $exitCode: $FilePath $($Arguments -join ' ')`n$($output -join [Environment]::NewLine)"
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
        throw "Protected Lab paths became staged during $Phase: $($intersection -join ', ')"
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
    & icacls.exe $Path /inheritance:r | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to disable inherited ACLs on private directory $Path." }
    & icacls.exe $Path /grant:r ("*{0}:(OI)(CI)F" -f $Sid) | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to restrict private directory $Path to SID $Sid." }
}

function Backup-ChangedFile {
    param([string]$Path)
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { return $null }
    Ensure-Directory -Path $BackupRoot
    Protect-PrivateDirectory -Path $BackupRoot -Sid $Receipt.userSid
    $safeName = ($Path -replace '[:\\/]', '_')
    $pathBytes = [System.Text.Encoding]::UTF8.GetBytes([System.IO.Path]::GetFullPath($Path).ToLowerInvariant())
    $pathHasher = [System.Security.Cryptography.SHA256]::Create()
    try { $pathId = ([System.BitConverter]::ToString($pathHasher.ComputeHash($pathBytes))).Replace('-', '').Substring(0, 12) }
    finally { $pathHasher.Dispose() }
    $backup = Join-Path $BackupRoot ($safeName + '.' + $pathId + '.bak')
    Copy-Item -LiteralPath $Path -Destination $backup -Force
    [void]$Receipt.backups.Add([ordered]@{ source = $Path; backup = $backup })
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

function New-SelectorConfigPlan {
    param([object]$ScopeSource)
    $envName = $ScopeSource.envName
    $candidate = Find-LauncherFile -ServiceName 'Selector MCP configuration' -Port $ExpectedPorts.SelectorMcp -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot, $SelectorRoot) -ExtraMarkers @($envName, 'CONTROLSTACK_RUNTIME_ROOT', 'selector-engine')
    $path = $candidate.path
    $content = $candidate.content
    $extension = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
    $boundRuntimeRoot = Get-LauncherEnvironmentValue -Path $path -Content $content -Name 'CONTROLSTACK_RUNTIME_ROOT'
    if ($boundRuntimeRoot -ne $SelectorRoot) {
        throw "Selector launcher runtime-root binding mismatch. Expected '$SelectorRoot'; found '$boundRuntimeRoot'."
    }
    $encoding = Get-ListEncoding -SourceText $ScopeSource.content -EnvName $envName
    $currentValue = Get-LauncherEnvironmentValue -Path $path -Content $content -Name $envName
    if ($null -eq $currentValue) { $currentValue = '' }
    $encoded = Encode-ScopeValue -Values @($SelectorWriteScope) -Encoding $encoding
    $newContent = Set-LauncherEnvironmentValue -Path $path -Content $content -Name $envName -Value $encoded
    $newContent = Set-LauncherEnvironmentValue -Path $path -Content $newContent -Name 'CONTROLSTACK_ENABLE_WRITE' -Value '1'
    $writeValue = Get-LauncherEnvironmentValue -Path $path -Content $newContent -Name 'CONTROLSTACK_ENABLE_WRITE'
    if ($writeValue -ne '1') { throw 'Selector write capability was not enabled in the selected launcher.' }

    $currentScopes = Decode-ScopeValue -Value $currentValue -Encoding $encoding
    $unexpected = @($currentScopes | Where-Object { $_ -ne $SelectorWriteScope })
    if ($unexpected.Count -gt 0) {
        throw "Selector write scope contains unexpected existing paths and will not be rewritten: $($unexpected -join ', ')."
    }
    $writtenScopeValue = Get-LauncherEnvironmentValue -Path $path -Content $newContent -Name $envName
    $writtenScopes = Decode-ScopeValue -Value $writtenScopeValue -Encoding $encoding
    Assert-SameStringSet -Actual $writtenScopes -Expected @($SelectorWriteScope) -Label 'Selector repaired write scope'
    if ($newContent -match '(?im)CONTROLSTACK_ENABLE_(ARBITRARY_SHELL|DELETE|MOVEMENT|MOVE|CROSS_ROOT_COPY)\s*=\s*(1|true|yes|on)') {
        throw 'Selector configuration enables a prohibited capability; refusing repair.'
    }
    if ($newContent.IndexOf($SelectorRoot, [System.StringComparison]::OrdinalIgnoreCase) -lt 0) {
        throw 'Selector configuration does not retain the exact Selector root.'
    }
    if ($newContent -notmatch [regex]::Escape([string]$ExpectedPorts.SelectorMcp)) {
        throw 'Selector configuration does not retain MCP port 8000.'
    }
    return [ordered]@{
        path = $path
        envName = $envName
        encoding = $encoding
        oldScopes = @($currentScopes)
        newScopes = @($SelectorWriteScope)
        oldContent = $content
        newContent = $newContent
        changed = ($content -cne $newContent)
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
    foreach ($file in $files) {
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
    if ($explicit.Count -eq 0) {
        throw 'No existing ControlStack service manager could be proven. No manager files will be created by guesswork.'
    }
    $grouped = @($explicit | Group-Object { Split-Path -Parent $_ } | Sort-Object Count -Descending)
    $topCount = $grouped[0].Count
    $topGroups = @($grouped | Where-Object { $_.Count -eq $topCount })
    if ($topGroups.Count -ne 1) {
        throw "Ambiguous ControlStack service-manager discovery: $($topGroups.Name -join ', ')."
    }
    $root = [string]$topGroups[0].Name
    return [ordered]@{ root = $root; discoveredFiles = @($explicit); explicitManagerFiles = @($explicit) }
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

function Remove-CredentialArguments {
    param([string[]]$Arguments)
    $result = New-Object System.Collections.ArrayList
    $secretSwitches = @('--api-key', '--token', '--secret', '--openai-api-key', '--service-api-key', '-k')
    for ($i = 0; $i -lt $Arguments.Count; $i++) {
        $arg = $Arguments[$i]
        $lower = $arg.ToLowerInvariant()
        if ($secretSwitches -contains $lower) { $i++; continue }
        if ($lower -match '^--(api-key|token|secret|openai-api-key|service-api-key)=') { continue }
        [void]$result.Add($arg)
    }
    return @($result)
}

function Replace-HealthPortArgument {
    param([string[]]$Arguments, [int]$OldPort, [int]$NewPort)
    $copy = @($Arguments)
    $changed = $false
    for ($i = 0; $i -lt $copy.Count; $i++) {
        if ($copy[$i] -match "^(--[^=]*(health|status|metrics|listen)[^=]*)=$OldPort$") {
            $copy[$i] = $Matches[1] + '=' + [string]$NewPort
            $changed = $true
            continue
        }
        if ($copy[$i] -eq [string]$OldPort -and $i -gt 0 -and $copy[$i - 1] -match '(?i)health|status|metrics|listen') {
            $copy[$i] = [string]$NewPort
            $changed = $true
        }
    }
    if (-not $changed) {
        $indices = New-Object System.Collections.ArrayList
        for ($i = 0; $i -lt $copy.Count; $i++) {
            if ($copy[$i] -eq [string]$OldPort -or $copy[$i] -match "=$OldPort$") { [void]$indices.Add($i) }
        }
        if ($indices.Count -eq 1) {
            $idx = [int]$indices[0]
            if ($copy[$idx] -eq [string]$OldPort) { $copy[$idx] = [string]$NewPort }
            else { $copy[$idx] = $copy[$idx] -replace "=$OldPort$", ('=' + [string]$NewPort) }
            $changed = $true
        }
    }
    if (-not $changed) { throw "Could not prove which tunnel argument controls health port $OldPort." }
    return $copy
}

function Get-ExistingManagedTunnelSecretFile {
    param([Parameter(Mandatory = $true)][string]$ServiceId)
    if ([string]::IsNullOrWhiteSpace($ManagerRegistryPath) -or -not (Test-Path -LiteralPath $ManagerRegistryPath -PathType Leaf)) { return $null }
    $registry = [System.IO.File]::ReadAllText($ManagerRegistryPath) | ConvertFrom-Json
    $matches = @($registry.services | Where-Object {
        $_.PSObject.Properties.Name -contains 'id' -and [string]$_.id -eq $ServiceId
    })
    if ($matches.Count -eq 0) { return $null }
    if ($matches.Count -ne 1) { throw "Existing manager registry contains multiple entries for $ServiceId." }
    $entry = $matches[0]
    if (-not ($entry.PSObject.Properties.Name -contains 'secretFile') -or [string]::IsNullOrWhiteSpace([string]$entry.secretFile)) { return $null }
    if ($entry.PSObject.Properties.Name -contains 'ownerSid' -and [string]$entry.ownerSid -ne $Receipt.userSid) {
        throw "Existing managed secret for $ServiceId belongs to a different Windows SID."
    }
    $path = [string]$entry.secretFile
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) { throw "Existing managed secret file is missing for $ServiceId: $path" }
    return $path
}

function Get-TunnelDefinition {
    param([string]$Id, [string]$Name, [int]$HealthPort, [string]$LaneRoot, [int]$TemporaryPort)
    $evidence = Assert-ProcessIdentity -ServiceName $Name -Port $HealthPort -RequiredAnyMarkers @('openai', 'tunnel', 'cloudflared', 'ngrok') -RequiredProcessNames @('*')
    $argv = Get-CommandLineArguments -CommandLine $evidence.commandLine
    if ($argv.Count -lt 1) { throw "Cannot parse command line for $Name." }
    $exe = $evidence.executablePath
    if ([string]::IsNullOrWhiteSpace($exe)) { $exe = $argv[0] }
    $args = @($argv | Select-Object -Skip 1)
    $sanitized = Remove-CredentialArguments -Arguments $args
    $tempArgs = Replace-HealthPortArgument -Arguments $sanitized -OldPort $HealthPort -NewPort $TemporaryPort
    $canonicalArgs = Replace-HealthPortArgument -Arguments $tempArgs -OldPort $TemporaryPort -NewPort $HealthPort
    return [ordered]@{
        id = $Id
        name = $Name
        laneRoot = $LaneRoot
        healthPort = $HealthPort
        temporaryPort = $TemporaryPort
        oldProcessId = $evidence.processId
        executable = $exe
        oldArguments = $args
        rollbackSecretFile = (Get-ExistingManagedTunnelSecretFile -ServiceId $Id)
        managedArguments = $canonicalArgs
        temporaryArguments = $tempArgs
        workingDirectory = $LaneRoot
        identityMarkers = @('openai', 'tunnel')
        evidence = $evidence
    }
}

function Start-ProcessWithCredential {
    param([object]$Definition, [string[]]$Arguments, [System.Security.SecureString]$SecureCredential)
    $bstr = [IntPtr]::Zero
    try {
        $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($SecureCredential)
        $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
        $oldOpenAi = [Environment]::GetEnvironmentVariable('OPENAI_API_KEY', 'Process')
        $oldService = [Environment]::GetEnvironmentVariable('OPENAI_SERVICE_API_KEY', 'Process')
        try {
            [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $plain, 'Process')
            [Environment]::SetEnvironmentVariable('OPENAI_SERVICE_API_KEY', $plain, 'Process')
            $proc = Start-Process -FilePath $Definition.executable -ArgumentList $Arguments -WorkingDirectory $Definition.workingDirectory -WindowStyle Hidden -PassThru
            return $proc
        }
        finally {
            [Environment]::SetEnvironmentVariable('OPENAI_API_KEY', $oldOpenAi, 'Process')
            [Environment]::SetEnvironmentVariable('OPENAI_SERVICE_API_KEY', $oldService, 'Process')
            $plain = $null
        }
    }
    finally {
        if ($bstr -ne [IntPtr]::Zero) { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($bstr) }
    }
}

function Stop-ExactProcess {
    param([uint32]$ProcessId, [string]$Name)
    $proc = Get-Process -Id $ProcessId -ErrorAction SilentlyContinue
    if (-not $proc) { return }
    Stop-Process -Id $ProcessId -Force
    try { Wait-Process -Id $ProcessId -Timeout 15 -ErrorAction SilentlyContinue } catch { }
    Add-ReceiptChange -Kind 'process-stop' -Path ([string]$ProcessId) -Detail $Name
}

function Start-OldTunnelRollback {
    param([object]$Definition)
    $rollbackSecure = $null
    try {
        if ($Definition.rollbackSecretFile) {
            $encryptedRollbackSecret = [System.IO.File]::ReadAllText([string]$Definition.rollbackSecretFile)
            $rollbackSecure = ConvertTo-SecureString $encryptedRollbackSecret
            $proc = Start-ProcessWithCredential -Definition $Definition -Arguments $Definition.oldArguments -SecureCredential $rollbackSecure
        }
        else {
            $proc = Start-Process -FilePath $Definition.executable -ArgumentList $Definition.oldArguments -WorkingDirectory $Definition.workingDirectory -WindowStyle Hidden -PassThru
        }
        Assert-StableTunnelHealth -Port $Definition.healthPort -Label ($Definition.name + ' rollback')
        Add-ReceiptChange -Kind 'rollback' -Path $Definition.name -Detail $(if ($Definition.rollbackSecretFile) { 'Previous DPAPI-managed tunnel credential restored after replacement failure.' } else { 'Original tunnel command restarted after replacement failure.' })
        return $proc
    }
    catch {
        Add-ReceiptError -Message ("Rollback failed for {0}: {1}" -f $Definition.name, $_.Exception.Message)
        throw
    }
    finally {
        if ($rollbackSecure) { $rollbackSecure.Dispose() }
    }
}

function Protect-SecretFile {
    param([string]$Path, [string]$Sid)
    & icacls.exe $Path /inheritance:r | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to disable inherited ACLs on secret file $Path." }
    & icacls.exe $Path /grant:r ("*{0}:(R,W)" -f $Sid) | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Failed to restrict secret file $Path to SID $Sid." }
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
        arguments = @($Definition.managedArguments)
        workingDirectory = $Definition.workingDirectory
        secretFile = $SecretFile
        ownerSid = $Receipt.userSid
        pidFile = (Join-Path $ManagerRoot ('pids\' + $Definition.id + '.pid'))
        identityMarkers = @($Definition.identityMarkers)
        managedCredential = $true
        managedByRepair = $true
    }
}

function New-NonTunnelRegistryDefinition {
    param([string]$Id, [string]$Name, [int]$Port, [string]$LaneRoot, [string]$Branch, [object]$Evidence, [object]$Launcher, [string]$Category)
    $markers = New-Object System.Collections.ArrayList
    [void]$markers.Add($LaneRoot)
    [void]$markers.Add([System.IO.Path]::GetFileName($Launcher.path))
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
        identityMarkers = @($markers | Select-Object -Unique)
        observedProcess = [ordered]@{ name = $Evidence.processName; executable = $Evidence.executablePath }
        managedCredential = $false
        managedByRepair = $true
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
    if (Test-Path -LiteralPath $Path -PathType Leaf) {
        $existing = ([System.IO.File]::ReadAllText($Path) | ConvertFrom-Json)
    }
    if (-not $existing) {
        $existing = [pscustomobject]@{ schemaVersion = 1; services = @(); preservedExternalManagerFiles = @() }
    }
    if (-not ($existing.PSObject.Properties.Name -contains 'services')) { throw "Existing manager registry $Path has no services array." }
    $map = [ordered]@{}
    foreach ($service in @($existing.services)) {
        if (-not ($service.PSObject.Properties.Name -contains 'id') -or -not $service.id) {
            throw "Existing manager registry contains a service without an id; refusing destructive merge."
        }
        $map[[string]$service.id] = $service
    }
    foreach ($service in $ManagedDefinitions) { $map[[string]$service.id] = $service }
    foreach ($service in @($existing.services)) {
        if (-not ($ManagedDefinitions.id -contains [string]$service.id)) {
            Add-PreservedService -Name ([string]$service.id) -Source $Path -Detail 'Unknown existing managed entry preserved unchanged.'
        }
    }
    $result = [ordered]@{}
    foreach ($property in $existing.PSObject.Properties) { $result[$property.Name] = $property.Value }
    $result['schemaVersion'] = 1
    $result['updatedAt'] = (Get-Date).ToString('o')
    $result['updatedBy'] = "$env:USERDOMAIN\$env:USERNAME"
    $result['services'] = @($map.Values)
    $existingExternalFiles = @()
    if ($existing.PSObject.Properties.Name -contains 'preservedExternalManagerFiles') { $existingExternalFiles = @($existing.preservedExternalManagerFiles) }
    $result['preservedExternalManagerFiles'] = @($existingExternalFiles + @($Discovery.discoveredFiles | Where-Object { $_ -ne $Path }) | Where-Object { $_ } | Sort-Object -Unique)
    $result['downstreamArtifactsActive'] = $false
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
$services = @($registry.services | Where-Object { $_.PSObject.Properties.Name -contains 'managedByRepair' -and $_.managedByRepair -eq $true })
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
    $process = Get-CimInstance Win32_Process -Filter ("ProcessId={0}" -f $ListenerProcessId) -ErrorAction SilentlyContinue
    if (-not $process) { throw "Listener PID $ListenerProcessId no longer exists." }
    $expectedExecutable = $null
    if ($entry.category -eq 'openai-tunnel') { $expectedExecutable = [string]$entry.executable }
    elseif ($entry.PSObject.Properties.Name -contains 'observedProcess' -and $entry.observedProcess) { $expectedExecutable = [string]$entry.observedProcess.executable }
    if (-not [string]::IsNullOrWhiteSpace($expectedExecutable)) {
        $actualExecutable = [string]$process.ExecutablePath
        if ([System.IO.Path]::GetFullPath($actualExecutable) -ne [System.IO.Path]::GetFullPath($expectedExecutable)) {
            throw "Port $($entry.port) executable mismatch for PID $ListenerProcessId; refusing action."
        }
    }
    $text = "{0} {1} {2}" -f $process.Name, $process.ExecutablePath, $process.CommandLine
    $hit = $false
    foreach ($marker in @($entry.identityMarkers)) {
        if ($text.IndexOf([string]$marker, [System.StringComparison]::OrdinalIgnoreCase) -ge 0) { $hit = $true; break }
    }
    if (-not $hit) { throw "Port $($entry.port) is owned by PID $ListenerProcessId with an unexpected identity; refusing action." }
}
function Start-Entry($entry) {
    $listeners = Get-Listener ([int]$entry.port)
    if ($listeners.Count -gt 0) {
        foreach ($listenerProcessId in $listeners) { Assert-Identity $entry ([uint32]$listenerProcessId) }
        if ($entry.category -eq 'openai-tunnel') {
            $managedPid = $null
            if ($entry.PSObject.Properties.Name -contains 'pidFile' -and (Test-Path -LiteralPath ([string]$entry.pidFile) -PathType Leaf)) {
                $managedPidText = (Get-Content -LiteralPath ([string]$entry.pidFile) -Raw).Trim()
                if ($managedPidText -match '^\d+$') { $managedPid = [uint32]$managedPidText }
            }
            if ($listeners.Count -eq 1 -and $managedPid -eq [uint32]$listeners[0] -and (Test-ManagedHealth $entry)) {
                Write-Host "$($entry.id): already running with managed credential (PID $($listeners[0]))"
                return
            }
            foreach ($listenerProcessId in $listeners) { Stop-Process -Id ([uint32]$listenerProcessId) -Force }
            Write-Host "$($entry.id): replaced recognised legacy or stale tunnel listener"
        }
        else {
            Write-Host "$($entry.id): already running (PID $($listeners[0]))"
            return
        }
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
$entry = @($registry.services | Where-Object { $_.id -eq $ServiceId })
if ($entry.Count -ne 1 -or $entry[0].category -ne 'openai-tunnel') { throw "Unknown tunnel service: $ServiceId" }
$entry = $entry[0]
$currentSid = [System.Security.Principal.WindowsIdentity]::GetCurrent().User.Value
if ($currentSid -ne [string]$entry.ownerSid) { throw "Tunnel credential is bound to SID $($entry.ownerSid); current SID is $currentSid." }
$encrypted = Get-Content -LiteralPath ([string]$entry.secretFile) -Raw
$secure = ConvertTo-SecureString $encrypted
$bstr = [IntPtr]::Zero
try {
    $bstr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($bstr)
    $env:OPENAI_API_KEY = $plain
    $env:OPENAI_SERVICE_API_KEY = $plain
    $process = Start-Process -FilePath ([string]$entry.executable) -ArgumentList @($entry.arguments) -WorkingDirectory ([string]$entry.workingDirectory) -WindowStyle Hidden -PassThru
    for ($attempt = 0; $attempt -lt 60; $attempt++) {
        Start-Sleep -Milliseconds 500
        $listeners = @(Get-NetTCPConnection -State Listen -LocalPort ([int]$entry.healthPort) -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)
        if ($listeners.Count -eq 1) {
            $pidDirectory = Split-Path -Parent ([string]$entry.pidFile)
            if (-not (Test-Path -LiteralPath $pidDirectory -PathType Container)) { New-Item -ItemType Directory -Path $pidDirectory -Force | Out-Null }
            [System.IO.File]::WriteAllText([string]$entry.pidFile, [string]$listeners[0], (New-Object System.Text.UTF8Encoding($false)))
            Write-Host "$ServiceId started with managed listener PID $($listeners[0])."
            return
        }
    }
    throw "$ServiceId did not expose one listener on health port $($entry.healthPort)."
}
finally {
    $env:OPENAI_API_KEY = $null
    $env:OPENAI_SERVICE_API_KEY = $null
    $plain = $null
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
    $script:StartupEntryPath = Join-Path $startupFolder 'ControlStack-ManagedServices.cmd'
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
    $Receipt.lab.gate = [ordered]@{ name = $LabGate; exitCode = $gateResult.exitCode; output = @($gateResult.output) }
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab gate'
    Assert-SameStringSet -Actual (Get-GitInventory -Root $LabRoot).staged -Expected $LabStagedPaths -Label 'Lab staged documentation set after gate'

    if ((Get-GitBranch -Root $LabRoot) -ne $ExpectedBranches.Lab) { throw 'Lab branch changed before commit.' }
    $commit = Invoke-Git -Root $LabRoot -Arguments @('commit', '-m', $LabCommitMessage)
    $head = (Invoke-Git -Root $LabRoot -Arguments @('rev-parse', 'HEAD')).output -join ''
    $Receipt.lab.commit = $head.Trim()
    $Receipt.lab.commitOutput = @($commit.output)

    $postCommitInventory = Get-GitInventory -Root $LabRoot
    if ($postCommitInventory.staged.Count -ne 0) { throw "Lab staged index is not empty after commit: $($postCommitInventory.staged -join ', ')." }
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab commit'

    if ((Get-GitBranch -Root $LabRoot) -ne $ExpectedBranches.Lab) { throw 'Lab branch changed before push.' }
    $push = Invoke-Git -Root $LabRoot -Arguments @('push', 'origin', ($ExpectedBranches.Lab + ':' + $ExpectedBranches.Lab))
    $Receipt.lab.push = [ordered]@{ branch = $ExpectedBranches.Lab; output = @($push.output) }
    Assert-LabProtectedInventory -Before $FingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'Lab push'
}

try {
    Write-Host 'ControlStack environment repair preflight...'

    foreach ($command in @('git.exe', 'python.exe', 'powershell.exe', 'icacls.exe')) {
        if (-not (Get-Command $command -ErrorAction SilentlyContinue)) { throw "Required command is unavailable: $command" }
    }

    $identity = [System.Security.Principal.WindowsIdentity]::GetCurrent()
    $Receipt.userSid = $identity.User.Value
    $Receipt.preflight.identity = [ordered]@{ name = $identity.Name; sid = $identity.User.Value }

    foreach ($root in @($ProgramRoot, $SelectorRoot, $LabRoot, $ToolingRoot)) {
        if (-not (Test-Path -LiteralPath $root -PathType Container)) { throw "Required root is missing: $root" }
    }
    $scriptExpected = Join-Path $ProgramRoot 'scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1'
    if ([System.IO.Path]::GetFullPath($PSCommandPath) -ne [System.IO.Path]::GetFullPath($scriptExpected)) {
        throw "Run the tracked script from its exact Program path: $scriptExpected"
    }

    $branches = [ordered]@{
        Program = Get-GitBranch -Root $ProgramRoot
        Selector = Get-GitBranch -Root $SelectorRoot
        Lab = Get-GitBranch -Root $LabRoot
    }
    if ($branches.Program -ne $ExpectedBranches.Program) { throw "Program branch mismatch: $($branches.Program)" }
    if ($branches.Selector -ne $ExpectedBranches.Selector) { throw "Selector branch mismatch: $($branches.Selector)" }
    if ($branches.Lab -ne $ExpectedBranches.Lab) { throw "Lab branch mismatch: $($branches.Lab)" }
    $Receipt.preflight.rootsAndBranches = [ordered]@{
        program = [ordered]@{ root = $ProgramRoot; branch = $branches.Program }
        selector = [ordered]@{ root = $SelectorRoot; branch = $branches.Selector }
        lab = [ordered]@{ root = $LabRoot; branch = $branches.Lab }
        tooling = $ToolingRoot
    }

    $programInventory = Get-GitInventory -Root $ProgramRoot
    if ($programInventory.staged.Count -gt 0 -or $programInventory.modified.Count -gt 0 -or $programInventory.untracked.Count -gt 0) {
        throw 'Program worktree must be clean before executing the environment repair.'
    }

    $labInventory = Get-GitInventory -Root $LabRoot
    $labMemoryCommit = Find-LabMemoryCommit
    $labAlreadyCommitted = $false
    if ($labInventory.staged.Count -eq 0 -and $labMemoryCommit) {
        $labAlreadyCommitted = $true
    }
    elseif ($labInventory.staged.Count -gt 0) {
        Assert-SameStringSet -Actual $labInventory.staged -Expected $LabStagedPaths -Label 'Lab staged documentation set'
    }
    else {
        throw 'Lab staged documentation is neither exactly present nor already committed in recent reachable history.'
    }
    if ($labInventory.modified.Count -ne 10 -or $labInventory.untracked.Count -ne 66) {
        throw "Lab protected inventory mismatch. Expected 10 modified and 66 untracked; found $($labInventory.modified.Count) modified and $($labInventory.untracked.Count) untracked."
    }
    $protectedIntersection = @($labInventory.staged | Where-Object { $labInventory.modified -contains $_ -or $labInventory.untracked -contains $_ })
    if ($protectedIntersection.Count -gt 0) { throw "Protected Lab files are staged: $($protectedIntersection -join ', ')" }
    $ProtectedLabFingerprintBefore = Get-ProtectedLabFingerprint -Root $LabRoot
    $Receipt.lab.preflight = [ordered]@{
        staged = @($labInventory.staged)
        modifiedCount = $labInventory.modified.Count
        untrackedCount = $labInventory.untracked.Count
        protectedDigest = $ProtectedLabFingerprintBefore.digest
        alreadyCommitted = $labAlreadyCommitted
        existingCommit = $labMemoryCommit
    }

    $serviceEvidence = [ordered]@{}
    $serviceEvidence.selectorMcp = Assert-ProcessIdentity -ServiceName 'Selector MCP' -Port $ExpectedPorts.SelectorMcp -RequiredAnyMarkers @($SelectorRoot, $ToolingRoot, 'controlstack_mcp') -RequiredProcessNames @('python*.exe')
    $serviceEvidence.selectorRuntime = Assert-ProcessIdentity -ServiceName 'Selector runtime' -Port $ExpectedPorts.SelectorRuntime -RequiredAnyMarkers @($SelectorRoot, 'server.js', 'workspace') -RequiredProcessNames @('node*.exe')
    $serviceEvidence.labMcp = Assert-ProcessIdentity -ServiceName 'Lab MCP' -Port $ExpectedPorts.LabMcp -RequiredAnyMarkers @($LabRoot, $ToolingRoot, 'controlstack_mcp') -RequiredProcessNames @('python*.exe')
    $serviceEvidence.labSpecification = Assert-ProcessIdentity -ServiceName 'Lab specification service' -Port $ExpectedPorts.LabSpecification -RequiredAnyMarkers @($LabRoot, 'streamlit', 'specification', 'demo') -RequiredProcessNames @('python*.exe', 'node*.exe')
    $serviceEvidence.programMcp = Assert-ProcessIdentity -ServiceName 'Program MCP' -Port $ExpectedPorts.ProgramMcp -RequiredAnyMarkers @($ProgramRoot, $ToolingRoot, 'controlstack_mcp') -RequiredProcessNames @('python*.exe')

    $launchers = [ordered]@{}
    $launchers.selectorMcp = Find-LauncherFile -ServiceName 'Selector MCP' -Port $ExpectedPorts.SelectorMcp -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot, $SelectorRoot) -ExtraMarkers @('controlstack_mcp', 'selector-engine')
    $launchers.selectorRuntime = Find-LauncherFile -ServiceName 'Selector runtime' -Port $ExpectedPorts.SelectorRuntime -LaneRoot $SelectorRoot -SearchRoots @($ToolingRoot, $SelectorRoot) -ExtraMarkers @('server.js', 'runtime')
    $launchers.labMcp = Find-LauncherFile -ServiceName 'Lab MCP' -Port $ExpectedPorts.LabMcp -LaneRoot $LabRoot -SearchRoots @($ToolingRoot, $LabRoot) -ExtraMarkers @('controlstack_mcp', 'lab-ies')
    $launchers.labSpecification = Find-LauncherFile -ServiceName 'Lab specification service' -Port $ExpectedPorts.LabSpecification -LaneRoot $LabRoot -SearchRoots @($ToolingRoot, $LabRoot) -ExtraMarkers @('streamlit', 'specification', 'demo')
    $launchers.programMcp = Find-LauncherFile -ServiceName 'Program MCP' -Port $ExpectedPorts.ProgramMcp -LaneRoot $ProgramRoot -SearchRoots @($ToolingRoot, $ProgramRoot) -ExtraMarkers @('controlstack_mcp', 'program-integrate')

    $scopeSource = Find-SelectorScopeSource
    $SelectorConfigPlan = New-SelectorConfigPlan -ScopeSource $scopeSource
    $Receipt.selector.preflight = [ordered]@{
        configPath = $SelectorConfigPlan.path
        scopeEnvironmentVariable = $SelectorConfigPlan.envName
        scopeEncoding = $SelectorConfigPlan.encoding
        existingScopes = @($SelectorConfigPlan.oldScopes)
        intendedScopes = @($SelectorConfigPlan.newScopes)
        changed = $SelectorConfigPlan.changed
        writeEnabled = $true
    }

    $managerDiscovery = Get-ManagerDiscovery
    $ManagerRoot = $managerDiscovery.root
    $ManagerRegistryPath = Join-Path $ManagerRoot 'controlstack-managed-services.json'
    $ManagerScriptPath = Join-Path $ManagerRoot 'ControlStack-ManagedServices.ps1'
    $TunnelHostPath = Join-Path $ManagerRoot 'ControlStack-TunnelHost.ps1'
    $StartupEntryPath = Join-Path ([Environment]::GetFolderPath('Startup')) 'ControlStack-ManagedServices.cmd'
    Assert-PowerShellTextParses -Text (Get-ManagerScriptContent) -Label 'Generated ControlStack service manager'
    Assert-PowerShellTextParses -Text (Get-TunnelHostScriptContent) -Label 'Generated ControlStack tunnel host'
    Test-ManagerRegistrySchema -Path $ManagerRegistryPath
    foreach ($protectedTarget in @($ManagerRegistryPath, $ManagerScriptPath, $TunnelHostPath, $StartupEntryPath)) {
        if (Test-Path -LiteralPath $protectedTarget -PathType Leaf) {
            $protectedText = [System.IO.File]::ReadAllText($protectedTarget)
            if ($protectedText -match 'CS_tunnel_runtime') {
                throw "Protected CS_tunnel_runtime reference exists in a repair target and will not be touched: $protectedTarget"
            }
        }
    }
    $existingManagerServices = Get-ExistingManagerServiceNames -Files $managerDiscovery.discoveredFiles
    foreach ($service in $existingManagerServices) { Add-PreservedService -Name $service.name -Source $service.source -Detail 'Existing service discovered before repair and preserved.' }
    $existingOperationalServices = Get-ExistingOperationalServices
    foreach ($service in $existingOperationalServices) { Add-PreservedService -Name $service.name -Source $service.source -Detail $service.detail }
    Assert-NoDownstreamArtifactsActivation -Files $managerDiscovery.discoveredFiles

    $topLevelControlStackRoots = @(Get-ChildItem -LiteralPath 'C:\' -Directory -Filter 'ControlStack*' -ErrorAction SilentlyContinue | Select-Object -ExpandProperty FullName)
    $referenceRoots = @(
        $ToolingRoot,
        $ProgramRoot,
        $SelectorRoot,
        $LabRoot,
        $ManagerRoot,
        (Join-Path $env:LOCALAPPDATA 'ControlStack'),
        (Join-Path $env:ProgramData 'ControlStack'),
        ([Environment]::GetFolderPath('Startup'))
    ) + $topLevelControlStackRoots
    $referenceRoots = @($referenceRoots | Where-Object { $_ } | Sort-Object -Unique)
    $Receipt.preflight.csTunnelRuntimeScanRoots = @($referenceRoots)
    $references = Find-CSRuntimeReferences -Roots $referenceRoots
    $references += @(Get-ControlStackRegistryReferences)
    foreach ($reference in $references) { [void]$Receipt.tunnelRuntimeReferences.Add($reference) }

    foreach ($temporaryPort in @(8180, 8181, 8182)) {
        $temporaryListeners = @(Get-NetTCPConnection -State Listen -LocalPort $temporaryPort -ErrorAction SilentlyContinue)
        if ($temporaryListeners.Count -gt 0) { throw "Temporary tunnel health port $temporaryPort is already occupied." }
    }

    $tunnels = [ordered]@{}
    $tunnels.selector = Get-TunnelDefinition -Id 'selector-openai-tunnel' -Name 'Selector OpenAI tunnel' -HealthPort $ExpectedPorts.SelectorTunnel -LaneRoot $SelectorRoot -TemporaryPort 8182
    $tunnels.lab = Get-TunnelDefinition -Id 'lab-openai-tunnel' -Name 'Lab OpenAI tunnel' -HealthPort $ExpectedPorts.LabTunnel -LaneRoot $LabRoot -TemporaryPort 8181
    $tunnels.program = Get-TunnelDefinition -Id 'program-openai-tunnel' -Name 'Program OpenAI tunnel' -HealthPort $ExpectedPorts.ProgramTunnel -LaneRoot $ProgramRoot -TemporaryPort 8180
    foreach ($tunnel in $tunnels.Values) {
        $health = Get-HealthCheck -Port $tunnel.healthPort -Attempts 3 -DelayMilliseconds 300
        if (-not $health.healthy) { throw "$($tunnel.name) is not healthy on port $($tunnel.healthPort)." }
        $OldTunnelProcesses[$tunnel.id] = $tunnel
    }

    $Receipt.preflight.services = [ordered]@{
        selectorMcp = [ordered]@{ port = $ExpectedPorts.SelectorMcp; pid = $serviceEvidence.selectorMcp.processId; launcher = $launchers.selectorMcp.path }
        selectorRuntime = [ordered]@{ port = $ExpectedPorts.SelectorRuntime; pid = $serviceEvidence.selectorRuntime.processId; launcher = $launchers.selectorRuntime.path }
        labMcp = [ordered]@{ port = $ExpectedPorts.LabMcp; pid = $serviceEvidence.labMcp.processId; launcher = $launchers.labMcp.path }
        labSpecification = [ordered]@{ port = $ExpectedPorts.LabSpecification; pid = $serviceEvidence.labSpecification.processId; launcher = $launchers.labSpecification.path }
        programMcp = [ordered]@{ port = $ExpectedPorts.ProgramMcp; pid = $serviceEvidence.programMcp.processId; launcher = $launchers.programMcp.path }
        selectorTunnel = [ordered]@{ healthPort = $ExpectedPorts.SelectorTunnel; pid = $tunnels.selector.oldProcessId }
        labTunnel = [ordered]@{ healthPort = $ExpectedPorts.LabTunnel; pid = $tunnels.lab.oldProcessId }
        programTunnel = [ordered]@{ healthPort = $ExpectedPorts.ProgramTunnel; pid = $tunnels.program.oldProcessId }
    }
    $Receipt.preflight.manager = [ordered]@{ root = $ManagerRoot; discoveredFiles = @($managerDiscovery.discoveredFiles) }
    $Receipt.preflight.complete = $true

    Write-Host ''
    Write-Host 'Preflight passed. Create a fresh dedicated OpenAI service API key, copy it to the Windows clipboard, then return here.'
    [void](Read-Host 'Press Enter after the fresh key is on the clipboard')
    $SecretPlainText = Get-Clipboard -Raw
    if ([string]::IsNullOrWhiteSpace($SecretPlainText)) { throw 'Clipboard did not contain a non-empty service API key.' }
    $SecretPlainText = $SecretPlainText.Trim()
    if ($SecretPlainText.Length -lt 20 -or $SecretPlainText -match '\s') { throw 'Clipboard content does not have a plausible API-key shape.' }
    $SecretSecure = ConvertTo-SecureString -String $SecretPlainText -AsPlainText -Force
    $MutationStarted = $true
    Set-Clipboard -Value 'ControlStack credential captured securely.'
    $SecretPlainText = $null
    $secretRoot = Join-Path $env:LOCALAPPDATA 'ControlStack\secrets'
    Ensure-Directory -Path $secretRoot
    $NewSecretFile = Join-Path $secretRoot ("openai-service-api-key-{0}.dpapi" -f $Timestamp)
    $encrypted = ConvertFrom-SecureString -SecureString $SecretSecure
    Write-Utf8NoBomAtomic -Path $NewSecretFile -Content $encrypted
    Protect-SecretFile -Path $NewSecretFile -Sid $Receipt.userSid
    Add-ReceiptChange -Kind 'credential' -Path $NewSecretFile -Detail 'Created a versioned DPAPI CurrentUser credential; no existing key was removed.'

    Write-Host 'Testing replacement tunnels on temporary health ports while current tunnels remain running...'
    foreach ($tunnel in $tunnels.Values) {
        $proc = Start-ProcessWithCredential -Definition $tunnel -Arguments $tunnel.temporaryArguments -SecureCredential $SecretSecure
        $temporaryRecord = [ordered]@{ definition = $tunnel; process = $proc; listenerProcessId = $null }
        [void]$TemporaryTunnelProcesses.Add($temporaryRecord)
        Assert-StableTunnelHealth -Port $tunnel.temporaryPort -Label ($tunnel.name + ' temporary replacement')
        $temporaryListener = Get-ListeningProcess -Port $tunnel.temporaryPort
        $temporaryRecord.listenerProcessId = [uint32]$temporaryListener.ProcessId
        Add-ReceiptChange -Kind 'tunnel-parallel-health' -Path $tunnel.name -Detail ("Replacement healthy on temporary port {0}; original PID {1} still running." -f $tunnel.temporaryPort, $tunnel.oldProcessId)
    }

    Invoke-LabGateCommitPush -FingerprintBefore $ProtectedLabFingerprintBefore -AlreadyCommitted $labAlreadyCommitted

    if ($SelectorConfigPlan.changed) {
        $SelectorConfigBackup = Backup-ChangedFile -Path $SelectorConfigPlan.path
        Write-Utf8NoBomAtomic -Path $SelectorConfigPlan.path -Content $SelectorConfigPlan.newContent
        Add-ReceiptChange -Kind 'selector-scope' -Path $SelectorConfigPlan.path -Detail ("Set only {0} through {1}; backup {2}." -f $SelectorWriteScope, $SelectorConfigPlan.envName, $SelectorConfigBackup)
    }
    else {
        Add-ReceiptChange -Kind 'selector-scope' -Path $SelectorConfigPlan.path -Detail 'Exact restricted documentation scope already configured; no write required.'
    }

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
    Register-ManagerFiles -Definitions $definitions -Discovery $managerDiscovery

    if ($SelectorConfigPlan.changed) {
        try {
            $selectorRestart = Invoke-External -FilePath 'powershell.exe' -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ManagerScriptPath, '-Action', 'restart', '-Service', 'selector-mcp') -WorkingDirectory $ManagerRoot
            $restartedSelector = Assert-ProcessIdentity -ServiceName 'Restarted Selector MCP' -Port $ExpectedPorts.SelectorMcp -RequiredAnyMarkers @($SelectorRoot, $ToolingRoot, 'controlstack_mcp') -RequiredProcessNames @('python*.exe')
            $Receipt.selector.restart = [ordered]@{ exitCode = $selectorRestart.exitCode; processId = $restartedSelector.processId; port = $ExpectedPorts.SelectorMcp }
            Add-ReceiptChange -Kind 'service-restart' -Path 'selector-mcp' -Detail 'Restarted only Selector MCP to activate the restricted documentation write scope.'
        }
        catch {
            if ($SelectorConfigBackup -and (Test-Path -LiteralPath $SelectorConfigBackup -PathType Leaf)) {
                Copy-Item -LiteralPath $SelectorConfigBackup -Destination $SelectorConfigPlan.path -Force
                try {
                    [void](Invoke-External -FilePath 'powershell.exe' -Arguments @('-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $ManagerScriptPath, '-Action', 'start', '-Service', 'selector-mcp') -WorkingDirectory $ManagerRoot)
                    [void](Assert-ProcessIdentity -ServiceName 'Rolled-back Selector MCP' -Port $ExpectedPorts.SelectorMcp -RequiredAnyMarkers @($SelectorRoot, $ToolingRoot, 'controlstack_mcp') -RequiredProcessNames @('python*.exe'))
                    Add-ReceiptChange -Kind 'rollback' -Path $SelectorConfigPlan.path -Detail 'Restored original Selector launcher and restarted Selector MCP after activation failure.'
                }
                catch { Add-ReceiptError -Message ("Selector launcher was restored but MCP restart also failed: {0}" -f $_.Exception.Message) }
            }
            throw
        }
    }
    else {
        $Receipt.selector.restart = 'not-required-already-current'
    }

    Write-Host 'Cutting over tunnel processes to the managed DPAPI credential...'
    foreach ($temporary in @($TemporaryTunnelProcesses)) {
        $tunnel = $temporary.definition
        Stop-ExactProcess -ProcessId ([uint32]$tunnel.oldProcessId) -Name ("Original " + $tunnel.name)
        if (-not ($StoppedOriginalTunnelIds -contains $tunnel.id)) { [void]$StoppedOriginalTunnelIds.Add($tunnel.id) }
        Stop-ExactProcess -ProcessId ([uint32]$temporary.listenerProcessId) -Name ("Temporary replacement " + $tunnel.name)
        try {
            $newProc = Start-ProcessWithCredential -Definition $tunnel -Arguments $tunnel.managedArguments -SecureCredential $SecretSecure
            $canonicalRecord = [ordered]@{ definition = $tunnel; process = $newProc; listenerProcessId = $null }
            [void]$NewCanonicalTunnelProcesses.Add($canonicalRecord)
            Assert-StableTunnelHealth -Port $tunnel.healthPort -Label ($tunnel.name + ' canonical replacement')
            $canonicalListener = Get-ListeningProcess -Port $tunnel.healthPort
            $canonicalRecord.listenerProcessId = [uint32]$canonicalListener.ProcessId
            $managedPidFile = Write-ManagedTunnelPid -TunnelId $tunnel.id -ListenerProcessId ([uint32]$canonicalListener.ProcessId)
            Add-ReceiptChange -Kind 'managed-pid' -Path $managedPidFile -Detail ("Recorded managed listener PID {0}." -f $canonicalListener.ProcessId)
            Add-ReceiptChange -Kind 'tunnel-cutover' -Path $tunnel.name -Detail ("Managed credential healthy on canonical port {0}." -f $tunnel.healthPort)
        }
        catch {
            Start-OldTunnelRollback -Definition $tunnel | Out-Null
            throw
        }
    }

    $finalLab = Get-GitInventory -Root $LabRoot
    Assert-LabProtectedInventory -Before $ProtectedLabFingerprintBefore -After (Get-ProtectedLabFingerprint -Root $LabRoot) -Phase 'final verification'
    if ($finalLab.staged.Count -ne 0) { throw "Lab has staged files after final verification: $($finalLab.staged -join ', ')" }
    $Receipt.lab.final = [ordered]@{
        modifiedCount = $finalLab.modified.Count
        untrackedCount = $finalLab.untracked.Count
        stagedCount = $finalLab.staged.Count
        protectedDigest = (Get-ProtectedLabFingerprint -Root $LabRoot).digest
    }

    foreach ($definition in $definitions) {
        $listeners = @(Get-NetTCPConnection -State Listen -LocalPort ([int]$definition.port) -ErrorAction SilentlyContinue)
        if ($listeners.Count -eq 0) { throw "Managed service final status failed: $($definition.id) has no listener on $($definition.port)." }
        $Receipt.services[$definition.id] = [ordered]@{ port = $definition.port; status = 'running'; managerRoot = $ManagerRoot }
    }
    $Receipt.services.downstreamArtifacts = [ordered]@{ status = 'inactive'; preserved = $true }
    $Receipt.services.csTunnelRuntime = [ordered]@{ status = 'untouched'; referenceCount = $Receipt.tunnelRuntimeReferences.Count }

    $SecretSecure.Dispose()
    $SecretSecure = $null
    Write-Receipt -Status 'completed'
    Write-Host 'CONTROLSTACK ENVIRONMENT REPAIR COMPLETED'
}
catch {
    $message = $_.Exception.Message
    Add-ReceiptError -Message $message
    Write-Error $message

    foreach ($temporary in @($TemporaryTunnelProcesses)) {
        try {
            $temporaryStopId = [uint32]$temporary.process.Id
            if ($temporary.listenerProcessId) { $temporaryStopId = [uint32]$temporary.listenerProcessId }
            Stop-ExactProcess -ProcessId $temporaryStopId -Name ("Failed temporary replacement " + $temporary.definition.name)
        }
        catch { }
    }
    foreach ($canonical in @($NewCanonicalTunnelProcesses)) {
        try {
            $canonicalStopId = [uint32]$canonical.process.Id
            if ($canonical.listenerProcessId) { $canonicalStopId = [uint32]$canonical.listenerProcessId }
            Stop-ExactProcess -ProcessId $canonicalStopId -Name ("Failed canonical replacement " + $canonical.definition.name)
        }
        catch { }
    }
    foreach ($stoppedId in @($StoppedOriginalTunnelIds)) {
        try {
            $definition = $OldTunnelProcesses[$stoppedId]
            if (-not $definition) { continue }
            $listeners = @(Get-NetTCPConnection -State Listen -LocalPort ([int]$definition.healthPort) -ErrorAction SilentlyContinue)
            if ($listeners.Count -eq 0) {
                Start-OldTunnelRollback -Definition $definition | Out-Null
            }
            else {
                $rollbackHealth = Get-HealthCheck -Port $definition.healthPort -Attempts 10 -DelayMilliseconds 500
                if (-not $rollbackHealth.healthy) {
                    Add-ReceiptError -Message ("A listener remained on {0} during rollback, but its health check failed; no duplicate process was started." -f $definition.healthPort)
                }
            }
        }
        catch { Add-ReceiptError -Message ("Cross-lane tunnel rollback failed for {0}: {1}" -f $stoppedId, $_.Exception.Message) }
    }
    if ($SecretPlainText) { $SecretPlainText = $null }
    if ($SecretSecure) { $SecretSecure.Dispose(); $SecretSecure = $null }
    try { Set-Clipboard -Value 'ControlStack repair stopped safely.' } catch { }
    try { Write-Receipt -Status $(if ($MutationStarted) { 'failed-after-mutation-started' } else { 'preflight-failed-no-mutation' }) } catch { }
    exit 1
}
