param(
  [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$SourceRoot = 'C:\ControlStack_Worktrees\program-integrate'
$TargetRoot = 'C:\ControlStack_Worktrees\governance-shell'
$BootstrapRoot = 'C:\ControlStack_Worktrees\governance-shell-bootstrap'
$TargetBranch = 'lane/governance-shell'
$LaneContext = 'docs\_context\lanes\governance-shell'
$Installer = Join-Path $SourceRoot 'scripts\CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs'
$Python = 'C:\Users\Patrick\AppData\Local\Programs\Python\Python311\python.exe'
$Node = 'C:\Program Files\nodejs\node.exe'
$GateRunnerRelative = 'scripts\governance_shell_lane_gate.py'
$FoundingFiles = [ordered]@{
  'LANE_CHARTER.md' = @('LANE_CHARTER.md', 'GOVERNANCE_SHELL_LANE_CHARTER.md', 'GOVERNANCE_LANE_CHARTER.md')
  'LANE_STATE.md' = @('LANE_STATE.md', 'GOVERNANCE_SHELL_LANE_STATE.md', 'GOVERNANCE_LANE_STATE.md')
  'WORK_QUEUE.md' = @('WORK_QUEUE.md', 'GOVERNANCE_SHELL_WORK_QUEUE.md', 'GOVERNANCE_WORK_QUEUE.md')
  'SESSION_HANDOFF.md' = @('SESSION_HANDOFF.md', 'GOVERNANCE_SHELL_SESSION_HANDOFF.md', 'GOVERNANCE_SESSION_HANDOFF.md')
}
$GeneratedFoundingFiles = [ordered]@{
  'DECISION_LOG.md' = ((@(
    '# Governance & Shell Decision Log',
    '',
    '## 2026-07-21 — Lane foundation',
    '',
    '**Status:** APPROVED AND ISOLATED.',
    '',
    'Governance & Shell is separate from Selector & Engine. It owns human and project identity, permissions, ownership, timeline, handoff, persistence, the single outward data-retrieval gateway and optional external CRM orchestration.',
    '',
    'Selector and Engine remain selections-only. Identity and traceability do not gate computation or alter output. Provider failure cannot reverse technical readiness or block Engine execution.',
    '',
    'Every download, export, artifact retrieval and delivery path must terminate through one Governance gateway. Readiness and identity are separate checks. Direct module-owned retrieval paths are prohibited.',
    '',
    'CRM item 7 remains blocked pending its portal-scope pre-check. No separate CRM lane exists yet.'
  ) -join "`n") + "`n")
  'EVIDENCE_INDEX.md' = ((@(
    '# Governance & Shell Evidence Index',
    '',
    '## Foundation evidence',
    '',
    '- Program approved the separate Governance & Shell lane.',
    '- The lane uses its own worktree, branch, MCP identity, exact write scope and fixed gate.',
    '- The four drafted bootstrap records are copied verbatim into the canonical lane context.',
    '- Decision and evidence records are generated from the approved Program ruling only.',
    '- Selector, Engine, Lab authority and broad module writes remain outside the lane guard.',
    '- The standing acceptance lock remains binding: envelope independence including no-envelope execution, changed-optic movement, varied-row movement for placeholder rows and ownership-wide assertions.',
    '- No direct download, export, delivery or CRM mutation is activated by lane provisioning.'
  ) -join "`n") + "`n")
}
$CanonicalFoundingNames = @(
  'LANE_CHARTER.md',
  'LANE_STATE.md',
  'WORK_QUEUE.md',
  'DECISION_LOG.md',
  'EVIDENCE_INDEX.md',
  'SESSION_HANDOFF.md'
)
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function ConvertTo-NativeArgument {
  param([AllowEmptyString()][string]$Value)
  if ($null -eq $Value -or $Value.Length -eq 0) { return '""' }
  if ($Value -notmatch '[\s"]') { return $Value }
  $escaped = $Value -replace '(\\*)"', '$1$1\"'
  $escaped = $escaped -replace '(\\+)$', '$1$1'
  return '"' + $escaped + '"'
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [switch]$AllowFailure
  )

  $processInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processInfo.FileName = 'git.exe'
  $processInfo.UseShellExecute = $false
  $processInfo.CreateNoWindow = $true
  $processInfo.RedirectStandardOutput = $true
  $processInfo.RedirectStandardError = $true
  $nativeArguments = @('-C', $Root) + $Arguments
  $processInfo.Arguments = (($nativeArguments | ForEach-Object { ConvertTo-NativeArgument ([string]$_) }) -join ' ')

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $processInfo
  if (-not $process.Start()) { throw 'A bounded Git process could not start.' }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()
  $stdout = $stdoutTask.Result.TrimEnd()
  $stderr = $stderrTask.Result.TrimEnd()
  $code = $process.ExitCode
  $process.Dispose()

  if (-not $AllowFailure -and $code -ne 0) {
    throw "A bounded Git operation failed: git $($Arguments -join ' ')"
  }
  $output = @($stdout, $stderr) | Where-Object { $_ }
  [pscustomobject]@{ ExitCode = $code; Output = ($output -join "`n") }
}

function Assert-FileEqual {
  param(
    [Parameter(Mandatory = $true)][string]$Source,
    [Parameter(Mandatory = $true)][string]$Destination
  )
  if (-not (Test-Path -LiteralPath $Destination -PathType Leaf)) { return $false }
  $left = (Get-FileHash -LiteralPath $Source -Algorithm SHA256).Hash
  $right = (Get-FileHash -LiteralPath $Destination -Algorithm SHA256).Hash
  if ($left -ne $right) {
    throw "A canonical Governance lane file already exists with different content: $([IO.Path]::GetFileName($Destination))"
  }
  return $true
}

function Resolve-BootstrapFile {
  param(
    [Parameter(Mandatory = $true)][string]$CanonicalName,
    [Parameter(Mandatory = $true)][string[]]$Aliases
  )

  $aliasMatches = @()
  foreach ($alias in $Aliases) {
    $candidate = Join-Path $BootstrapRoot $alias
    if ((Test-Path -LiteralPath $candidate -PathType Leaf) -and -not $script:UsedBootstrapPaths.Contains($candidate)) {
      $aliasMatches += $candidate
    }
  }
  if ($aliasMatches.Count -gt 1) {
    throw "The Governance bootstrap has more than one recognised source for $CanonicalName."
  }
  if ($aliasMatches.Count -eq 1) { return $aliasMatches[0] }

  $candidates = @(
    Get-ChildItem -LiteralPath $BootstrapRoot -File -Filter '*.md' |
      Where-Object { -not $script:UsedBootstrapPaths.Contains($_.FullName) }
  )
  $scored = foreach ($file in $candidates) {
    $name = $file.BaseName.ToLowerInvariant()
    $content = Get-Content -LiteralPath $file.FullName -Raw
    $score = 0
    switch ($CanonicalName) {
      'LANE_CHARTER.md' {
        if ($name -match 'charter|scope|ownership') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:lane\s+charter|scope|ownership)\b') { $score += 50 }
      }
      'LANE_STATE.md' {
        if ($name -match 'lane[_ -]?state|current[_ -]?state|status') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:lane\s+state|current\s+state|status)\b') { $score += 50 }
      }
      'WORK_QUEUE.md' {
        if ($name -match 'queue|backlog|work[_ -]?items') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:work\s+queue|backlog|work\s+items)\b') { $score += 50 }
      }
      'DECISION_LOG.md' {
        if ($name -match 'decision|ruling|adr|record|history') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:decision|ruling|architecture\s+record|approved\s+rules?)\b') { $score += 60 }
        if ($content -match '(?im)^\s*(?:decision|ruling|status)\s*:') { $score += 20 }
      }
      'EVIDENCE_INDEX.md' {
        if ($name -match 'evidence|proof|acceptance|verification|test') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:evidence|proof|acceptance|verification|test\s+index)\b') { $score += 60 }
        if ($content -match '(?im)\b(?:verified|passed|acceptance)\b') { $score += 10 }
      }
      'SESSION_HANDOFF.md' {
        if ($name -match 'handoff|session|start[_ -]?here|continue|brief') { $score += 100 }
        if ($content -match '(?im)^\s*#{1,6}\s+.*\b(?:session\s+handoff|handoff|start\s+here|continue|next\s+session)\b') { $score += 60 }
        if ($content -match '(?im)^\s*(?:next|resume|continue)\s*:') { $score += 20 }
      }
      default { throw "Unknown canonical Governance founding file: $CanonicalName" }
    }
    [pscustomobject]@{ Path = $file.FullName; Name = $file.Name; Score = $score }
  }
  $ranked = @($scored | Sort-Object -Property @{ Expression = 'Score'; Descending = $true }, @{ Expression = 'Name'; Descending = $false })
  $remainingNames = @($candidates | Select-Object -ExpandProperty Name) -join ', '
  if ($ranked.Count -eq 0 -or $ranked[0].Score -le 0) {
    throw "The Governance bootstrap could not identify the drafted source for $CanonicalName. Remaining drafts: $remainingNames"
  }
  if ($ranked.Count -gt 1 -and $ranked[1].Score -eq $ranked[0].Score) {
    throw "The Governance bootstrap has an ambiguous drafted source for $CanonicalName. Remaining drafts: $remainingNames"
  }
  return $ranked[0].Path
}

Write-Host 'Governance & Shell provisioning: preflight'
if (-not (Test-Path -LiteralPath $SourceRoot -PathType Container)) { throw 'The Program worktree is missing.' }
if (-not (Test-Path -LiteralPath $BootstrapRoot -PathType Container)) { throw 'The Governance bootstrap folder is missing.' }
if (-not (Test-Path -LiteralPath $Installer -PathType Leaf)) { throw 'The Deployment v2 installer is missing.' }
if (-not (Test-Path -LiteralPath $Python -PathType Leaf)) { throw 'The approved Python executable is missing.' }
if (-not (Test-Path -LiteralPath $Node -PathType Leaf)) { throw 'The approved Node executable is missing.' }

$ResolvedFoundingFiles = [ordered]@{}
$script:UsedBootstrapPaths = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($canonicalName in $FoundingFiles.Keys) {
  $source = Resolve-BootstrapFile -CanonicalName $canonicalName -Aliases $FoundingFiles[$canonicalName]
  [void]$script:UsedBootstrapPaths.Add($source)
  $ResolvedFoundingFiles[$canonicalName] = $source
  Write-Host ("Governance & Shell provisioning: {0} <= {1}" -f $canonicalName, [IO.Path]::GetFileName($source))
}
foreach ($canonicalName in $GeneratedFoundingFiles.Keys) {
  Write-Host ("Governance & Shell provisioning: {0} <= approved Program ruling" -f $canonicalName)
}

if ($PreflightOnly) {
  Write-Host 'GOVERNANCE & SHELL PREFLIGHT: SIX FOUNDING RECORDS RESOLVED'
  exit 0
}

$sourceBranch = (Invoke-Git -Root $SourceRoot -Arguments @('branch', '--show-current')).Output.Trim()
if ($sourceBranch -ne 'lane/program-integrate') { throw 'The Program worktree is on the wrong branch.' }
$sourceDirty = (Invoke-Git -Root $SourceRoot -Arguments @('status', '--porcelain=v1')).Output.Trim()
if ($sourceDirty) { throw 'The Program worktree must be clean before lane provisioning.' }

if (-not (Test-Path -LiteralPath $TargetRoot -PathType Container)) {
  $branchExists = (Invoke-Git -Root $SourceRoot -Arguments @('show-ref', '--verify', '--quiet', "refs/heads/$TargetBranch") -AllowFailure).ExitCode -eq 0
  if ($branchExists) {
    Invoke-Git -Root $SourceRoot -Arguments @('worktree', 'add', $TargetRoot, $TargetBranch) | Out-Null
  } else {
    Invoke-Git -Root $SourceRoot -Arguments @('worktree', 'add', '-b', $TargetBranch, $TargetRoot, 'HEAD') | Out-Null
  }
}

$targetBranchActual = (Invoke-Git -Root $TargetRoot -Arguments @('branch', '--show-current')).Output.Trim()
if ($targetBranchActual -ne $TargetBranch) { throw 'The Governance worktree branch guard failed.' }

$targetTip = (Invoke-Git -Root $TargetRoot -Arguments @('rev-parse', 'HEAD')).Output.Trim()
$programTip = (Invoke-Git -Root $TargetRoot -Arguments @('rev-parse', 'lane/program-integrate')).Output.Trim()
$targetIsProgramAncestor = Invoke-Git -Root $TargetRoot -Arguments @('merge-base', '--is-ancestor', 'HEAD', 'lane/program-integrate') -AllowFailure
if ($targetIsProgramAncestor.ExitCode -eq 0 -and $targetTip -ne $programTip) {
  Write-Host 'Governance & Shell provisioning: fast-forwarding infrastructure baseline'
  Invoke-Git -Root $TargetRoot -Arguments @('merge', '--ff-only', 'lane/program-integrate') | Out-Null
} elseif ($targetIsProgramAncestor.ExitCode -notin @(0, 1)) {
  throw 'The Governance lane baseline relationship could not be verified.'
}

$targetContextRoot = Join-Path $TargetRoot $LaneContext
New-Item -ItemType Directory -Path $targetContextRoot -Force | Out-Null

foreach ($canonicalName in $FoundingFiles.Keys) {
  $source = $ResolvedFoundingFiles[$canonicalName]
  $destination = Join-Path $targetContextRoot $canonicalName
  if (-not (Assert-FileEqual -Source $source -Destination $destination)) {
    Copy-Item -LiteralPath $source -Destination $destination
  }
}
foreach ($canonicalName in $GeneratedFoundingFiles.Keys) {
  $destination = Join-Path $targetContextRoot $canonicalName
  $relativeDestination = "$LaneContext\$canonicalName"
  $content = $GeneratedFoundingFiles[$canonicalName]
  if (Test-Path -LiteralPath $destination -PathType Leaf) {
    $existing = Get-Content -LiteralPath $destination -Raw
    $existingNormalised = (($existing -replace "`r`n", "`n") -replace "`r", "`n").TrimEnd()
    $contentNormalised = (($content -replace "`r`n", "`n") -replace "`r", "`n").TrimEnd()
    if ($existingNormalised -ne $contentNormalised) {
      $status = (Invoke-Git -Root $TargetRoot -Arguments @('status', '--porcelain=v1', '--', $relativeDestination)).Output.Trim()
      $existingHeader = (($existingNormalised -split "`n", 2)[0]).Trim()
      $generatedHeader = (($contentNormalised -split "`n", 2)[0]).Trim()
      $tracked = (Invoke-Git -Root $TargetRoot -Arguments @('ls-files', '--error-unmatch', '--', $relativeDestination) -AllowFailure).ExitCode -eq 0
      if ($existingHeader -ne $generatedHeader) {
        throw "A generated Governance lane file already exists with the wrong identity: $canonicalName"
      }
      if ($status -match '^\?\?\s') {
        Write-Host ("Governance & Shell provisioning: refreshing interrupted generated record {0}" -f $canonicalName)
        [IO.File]::WriteAllText($destination, $content, $Utf8NoBom)
      } elseif ($tracked -and -not $status) {
        Write-Host ("Governance & Shell provisioning: preserving established generated record {0}" -f $canonicalName)
      } else {
        throw "A generated Governance lane file already exists with uncommitted different content: $canonicalName"
      }
    }
  } else {
    [IO.File]::WriteAllText($destination, $content, $Utf8NoBom)
  }
}

$gateRunner = Join-Path $TargetRoot $GateRunnerRelative
if (-not (Test-Path -LiteralPath $gateRunner -PathType Leaf)) { throw 'The Governance lane gate is missing.' }

Write-Host 'Governance & Shell provisioning: running fixed lane gate'
& $Python $gateRunner 'governance-shell' '--root' $TargetRoot '--required-branch' $TargetBranch '--json'
if ($LASTEXITCODE -ne 0) { throw 'The Governance & Shell lane gate failed.' }

$relativeFoundingFiles = $CanonicalFoundingNames | ForEach-Object { "$LaneContext\$_" }
Invoke-Git -Root $TargetRoot -Arguments (@('add', '--') + $relativeFoundingFiles) | Out-Null
$staged = (Invoke-Git -Root $TargetRoot -Arguments @('diff', '--cached', '--name-only')).Output.Trim()
if ($staged) {
  $stagedNames = @($staged -split "`r?`n" | Where-Object { $_ })
  $expectedNames = @($relativeFoundingFiles | ForEach-Object { $_ -replace '\\', '/' } | Sort-Object)
  $actualNames = @($stagedNames | ForEach-Object { $_ -replace '\\', '/' } | Sort-Object)
  if (($actualNames -join "`n") -ne ($expectedNames -join "`n")) {
    throw 'The founding checkpoint contains an unexpected path.'
  }
  Invoke-Git -Root $TargetRoot -Arguments @('commit', '-m', 'docs(governance): establish lane context') | Out-Null
}
Invoke-Git -Root $TargetRoot -Arguments @('push', '-u', 'origin', $TargetBranch) | Out-Null

Write-Host 'Governance & Shell provisioning: installing scoped MCP service'
& $Node $Installer '--install'
if ($LASTEXITCODE -ne 0) { throw 'Deployment v2 did not install the Governance MCP service.' }

$status = Invoke-RestMethod -Method Get -Uri 'http://127.0.0.1:8790/api/status' -TimeoutSec 30
$governance = @($status.services | Where-Object { $_.id -eq 'governance-mcp' })
if ($governance.Count -ne 1 -or $governance[0].healthy -ne $true -or $governance[0].managed -ne $true) {
  throw 'The Governance MCP service did not report ready and managed.'
}

$finalBranch = (Invoke-Git -Root $TargetRoot -Arguments @('branch', '--show-current')).Output.Trim()
$finalDirty = (Invoke-Git -Root $TargetRoot -Arguments @('status', '--porcelain=v1')).Output.Trim()
if ($finalBranch -ne $TargetBranch -or $finalDirty) {
  throw 'The Governance lane did not finish clean on its required branch.'
}

Write-Host ''
Write-Host 'GOVERNANCE & SHELL: READY TO START'
Write-Host 'The isolated lane, canonical founding records, fixed gate and scoped MCP service are active.'
