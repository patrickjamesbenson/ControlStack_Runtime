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
  'DECISION_LOG.md' = @('DECISION_LOG.md', 'DECISIONS.md', 'LANE_DECISIONS.md', 'GOVERNANCE_DECISION_LOG.md', 'GOVERNANCE_SHELL_DECISIONS.md')
  'EVIDENCE_INDEX.md' = @('EVIDENCE_INDEX.md', 'GOVERNANCE_SHELL_EVIDENCE_INDEX.md', 'GOVERNANCE_EVIDENCE_INDEX.md')
  'SESSION_HANDOFF.md' = @('SESSION_HANDOFF.md', 'GOVERNANCE_SHELL_SESSION_HANDOFF.md', 'GOVERNANCE_SESSION_HANDOFF.md')
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [switch]$AllowFailure
  )
  $output = & git.exe -C $Root @Arguments 2>&1
  $code = $LASTEXITCODE
  if (-not $AllowFailure -and $code -ne 0) {
    throw "A bounded Git operation failed: git $($Arguments -join ' ')"
  }
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
    [Parameter(Mandatory = $true)][string[]]$Aliases,
    [Parameter(Mandatory = $true)][AllowEmptyCollection()][System.Collections.Generic.HashSet[string]]$UsedPaths
  )

  $aliasMatches = @()
  foreach ($alias in $Aliases) {
    $candidate = Join-Path $BootstrapRoot $alias
    if ((Test-Path -LiteralPath $candidate -PathType Leaf) -and -not $UsedPaths.Contains($candidate)) {
      $aliasMatches += $candidate
    }
  }
  if ($aliasMatches.Count -gt 1) {
    throw "The Governance bootstrap has more than one recognised source for $CanonicalName."
  }
  if ($aliasMatches.Count -eq 1) { return $aliasMatches[0] }

  $headingPattern = switch ($CanonicalName) {
    'LANE_CHARTER.md' { '(?im)^\s*#{1,6}\s+.*\blane\s+charter\b' }
    'LANE_STATE.md' { '(?im)^\s*#{1,6}\s+.*\blane\s+state\b' }
    'WORK_QUEUE.md' { '(?im)^\s*#{1,6}\s+.*\bwork\s+queue\b' }
    'DECISION_LOG.md' { '(?im)^\s*#{1,6}\s+.*\b(?:decision\s+log|decisions)\b' }
    'EVIDENCE_INDEX.md' { '(?im)^\s*#{1,6}\s+.*\bevidence\s+index\b' }
    'SESSION_HANDOFF.md' { '(?im)^\s*#{1,6}\s+.*\bsession\s+handoff\b' }
    default { throw "Unknown canonical Governance founding file: $CanonicalName" }
  }
  $semanticMatches = @(
    Get-ChildItem -LiteralPath $BootstrapRoot -File -Filter '*.md' |
      Where-Object {
        -not $UsedPaths.Contains($_.FullName) -and
        (Get-Content -LiteralPath $_.FullName -Raw) -match $headingPattern
      } |
      Select-Object -ExpandProperty FullName
  )
  if ($semanticMatches.Count -ne 1) {
    throw "The Governance bootstrap could not uniquely identify the drafted source for $CanonicalName."
  }
  return $semanticMatches[0]
}

Write-Host 'Governance & Shell provisioning: preflight'
if (-not (Test-Path -LiteralPath $SourceRoot -PathType Container)) { throw 'The Program worktree is missing.' }
if (-not (Test-Path -LiteralPath $BootstrapRoot -PathType Container)) { throw 'The Governance bootstrap folder is missing.' }
if (-not (Test-Path -LiteralPath $Installer -PathType Leaf)) { throw 'The Deployment v2 installer is missing.' }
if (-not (Test-Path -LiteralPath $Python -PathType Leaf)) { throw 'The approved Python executable is missing.' }
if (-not (Test-Path -LiteralPath $Node -PathType Leaf)) { throw 'The approved Node executable is missing.' }

$sourceBranch = (Invoke-Git -Root $SourceRoot -Arguments @('branch', '--show-current')).Output.Trim()
if ($sourceBranch -ne 'lane/program-integrate') { throw 'The Program worktree is on the wrong branch.' }
$sourceDirty = (Invoke-Git -Root $SourceRoot -Arguments @('status', '--porcelain=v1')).Output.Trim()
if ($sourceDirty) { throw 'The Program worktree must be clean before lane provisioning.' }

$ResolvedFoundingFiles = [ordered]@{}
$UsedBootstrapPaths = [System.Collections.Generic.HashSet[string]]::new([StringComparer]::OrdinalIgnoreCase)
foreach ($canonicalName in $FoundingFiles.Keys) {
  $source = Resolve-BootstrapFile -CanonicalName $canonicalName -Aliases $FoundingFiles[$canonicalName] -UsedPaths $UsedBootstrapPaths
  [void]$UsedBootstrapPaths.Add($source)
  $ResolvedFoundingFiles[$canonicalName] = $source
  Write-Host ("Governance & Shell provisioning: {0} <= {1}" -f $canonicalName, [IO.Path]::GetFileName($source))
}

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
$targetContextRoot = Join-Path $TargetRoot $LaneContext
New-Item -ItemType Directory -Path $targetContextRoot -Force | Out-Null

foreach ($canonicalName in $FoundingFiles.Keys) {
  $source = $ResolvedFoundingFiles[$canonicalName]
  $destination = Join-Path $targetContextRoot $canonicalName
  if (-not (Assert-FileEqual -Source $source -Destination $destination)) {
    Copy-Item -LiteralPath $source -Destination $destination
  }
}

$gateRunner = Join-Path $TargetRoot $GateRunnerRelative
if (-not (Test-Path -LiteralPath $gateRunner -PathType Leaf)) { throw 'The Governance lane gate is missing.' }

Write-Host 'Governance & Shell provisioning: running fixed lane gate'
& $Python $gateRunner 'governance-shell' '--root' $TargetRoot '--required-branch' $TargetBranch '--json'
if ($LASTEXITCODE -ne 0) { throw 'The Governance & Shell lane gate failed.' }

$relativeFoundingFiles = $FoundingFiles.Keys | ForEach-Object { "$LaneContext\$_" }
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
