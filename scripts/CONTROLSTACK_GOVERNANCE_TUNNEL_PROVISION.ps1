param(
  [switch]$PreflightOnly
)

$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$ProgramRoot = 'C:\ControlStack_Worktrees\program-integrate'
$GovernanceRoot = 'C:\ControlStack_Worktrees\governance-shell'
$ProgramBranch = 'lane/program-integrate'
$GovernanceBranch = 'lane/governance-shell'
$TunnelClient = 'C:\ControlStack_Tunnel\tunnel-client.exe'
$Profile = 'controlstack-governance-shell-noauth'
$McpUrl = 'http://127.0.0.1:8023/mcp'
$ProfileFile = Join-Path $env:APPDATA "tunnel-client\$Profile.yaml"
$CredentialFile = 'C:\ControlStack_Service_Manager\deployment-v2\secrets\tunnel-runtime-key.dpapi'
$Node = 'C:\Program Files\nodejs\node.exe'
$Installer = Join-Path $ProgramRoot 'scripts\CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs'
$ManagerStatusUrl = 'http://127.0.0.1:8790/api/status'

function ConvertTo-NativeArgument {
  param([AllowEmptyString()][string]$Value)
  if ($null -eq $Value -or $Value.Length -eq 0) { return '""' }
  if ($Value -notmatch '[\s"]') { return $Value }
  $escaped = $Value -replace '(\\*)"', '$1$1\"'
  $escaped = $escaped -replace '(\\+)$', '$1$1'
  return '"' + $escaped + '"'
}

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)][string]$FileName,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [switch]$AllowFailure
  )

  $processInfo = New-Object System.Diagnostics.ProcessStartInfo
  $processInfo.FileName = $FileName
  $processInfo.UseShellExecute = $false
  $processInfo.CreateNoWindow = $true
  $processInfo.RedirectStandardOutput = $true
  $processInfo.RedirectStandardError = $true
  $processInfo.Arguments = (($Arguments | ForEach-Object { ConvertTo-NativeArgument ([string]$_) }) -join ' ')

  $process = New-Object System.Diagnostics.Process
  $process.StartInfo = $processInfo
  if (-not $process.Start()) { throw 'A bounded native process could not start.' }
  $stdoutTask = $process.StandardOutput.ReadToEndAsync()
  $stderrTask = $process.StandardError.ReadToEndAsync()
  $process.WaitForExit()
  $stdout = $stdoutTask.Result.TrimEnd()
  $stderr = $stderrTask.Result.TrimEnd()
  $code = $process.ExitCode
  $process.Dispose()

  if (-not $AllowFailure -and $code -ne 0) {
    throw "A bounded native operation failed: $([IO.Path]::GetFileName($FileName)) $($Arguments[0])"
  }
  $output = @($stdout, $stderr) | Where-Object { $_ }
  [pscustomobject]@{ ExitCode = $code; Output = ($output -join "`n") }
}

function Invoke-Git {
  param(
    [Parameter(Mandatory = $true)][string]$Root,
    [Parameter(Mandatory = $true)][string[]]$Arguments,
    [switch]$AllowFailure
  )
  Invoke-Native -FileName 'git.exe' -Arguments (@('-C', $Root) + $Arguments) -AllowFailure:$AllowFailure
}

function Wait-ForManagerServices {
  param(
    [Parameter(Mandatory = $true)][string[]]$RequiredIds,
    [int]$TimeoutSeconds = 180
  )

  $deadline = [DateTime]::UtcNow.AddSeconds($TimeoutSeconds)
  $lastResult = 'no completed manager status request'
  while ([DateTime]::UtcNow -lt $deadline) {
    try {
      $status = Invoke-RestMethod -Method Get -Uri $ManagerStatusUrl -TimeoutSec 30
      $lastResult = 'manager status received'
      $ready = $true
      foreach ($requiredId in $RequiredIds) {
        $service = @($status.services | Where-Object { $_.id -eq $requiredId })
        if ($service.Count -ne 1 -or $service[0].healthy -ne $true -or $service[0].managed -ne $true) {
          $ready = $false
          $lastResult = "service not ready: $requiredId"
          break
        }
      }
      if ($ready) { return $status }
    } catch {
      $lastResult = 'transient manager status timeout or transport failure'
    }

    if ([DateTime]::UtcNow -lt $deadline) { Start-Sleep -Seconds 1 }
  }

  throw "The required managed services did not become ready within the bounded retry window: $lastResult"
}

function Read-ProtectedRuntimeKey {
  if (-not (Test-Path -LiteralPath $CredentialFile -PathType Leaf)) {
    throw 'The protected tunnel runtime key is missing.'
  }
  $protected = (Get-Content -LiteralPath $CredentialFile -Raw).Trim()
  $secure = ConvertTo-SecureString $protected
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    if (-not $plain.StartsWith('sk-') -or $plain.Length -lt 23) {
      throw 'The protected tunnel runtime key is invalid.'
    }
    return $plain
  } finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

Write-Host 'Governance tunnel provisioning: preflight'
foreach ($required in @($ProgramRoot, $GovernanceRoot)) {
  if (-not (Test-Path -LiteralPath $required -PathType Container)) { throw 'A required ControlStack worktree is missing.' }
}
foreach ($required in @($TunnelClient, $CredentialFile, $Node, $Installer)) {
  if (-not (Test-Path -LiteralPath $required -PathType Leaf)) { throw 'A required Governance tunnel component is missing.' }
}

$programBranchActual = (Invoke-Git -Root $ProgramRoot -Arguments @('branch', '--show-current')).Output.Trim()
$governanceBranchActual = (Invoke-Git -Root $GovernanceRoot -Arguments @('branch', '--show-current')).Output.Trim()
if ($programBranchActual -ne $ProgramBranch -or $governanceBranchActual -ne $GovernanceBranch) {
  throw 'A Governance tunnel branch guard failed.'
}
if ((Invoke-Git -Root $ProgramRoot -Arguments @('status', '--porcelain=v1')).Output.Trim()) {
  throw 'The Program worktree must be clean before tunnel provisioning.'
}
if ((Invoke-Git -Root $GovernanceRoot -Arguments @('status', '--porcelain=v1')).Output.Trim()) {
  throw 'The Governance worktree must be clean before tunnel provisioning.'
}

$currentStatus = Wait-ForManagerServices -RequiredIds @('governance-mcp')

if ($PreflightOnly) {
  Write-Host 'GOVERNANCE TUNNEL PREFLIGHT: READY FOR TUNNEL REFERENCE'
  exit 0
}

$clipboard = (Get-Clipboard -Raw).Trim()
$tunnelMatch = [regex]::Match($clipboard, '(?i)\btunnel_[a-z0-9]{16,}\b')
if (-not $tunnelMatch.Success) {
  throw 'The clipboard does not contain a newly copied tunnel reference.'
}
$TunnelId = $tunnelMatch.Value

$key = $null
try {
  $key = Read-ProtectedRuntimeKey
  $env:CONTROL_PLANE_API_KEY = $key

  if (Test-Path -LiteralPath $ProfileFile -PathType Leaf) {
    $profileText = Get-Content -LiteralPath $ProfileFile -Raw
    if (-not $profileText.Contains($TunnelId) -or -not $profileText.Contains($McpUrl)) {
      throw 'The existing Governance tunnel profile has different fixed settings.'
    }
    Write-Host 'Governance tunnel provisioning: existing fixed profile verified'
  } else {
    Write-Host 'Governance tunnel provisioning: creating fixed profile'
    $initialised = Invoke-Native -FileName $TunnelClient -Arguments @('init', '--profile', $Profile, '--tunnel-id', $TunnelId, '--mcp-server-url', $McpUrl)
    if ($initialised.Output) { Write-Host $initialised.Output }
  }

  if (-not (Test-Path -LiteralPath $ProfileFile -PathType Leaf)) {
    throw 'The Governance tunnel profile was not created.'
  }
  $profileText = Get-Content -LiteralPath $ProfileFile -Raw
  if (-not $profileText.Contains($TunnelId) -or -not $profileText.Contains($McpUrl)) {
    throw 'The Governance tunnel profile validation failed.'
  }

  Write-Host 'Governance tunnel provisioning: validating fixed target'
  $doctor = Invoke-Native -FileName $TunnelClient -Arguments @('doctor', '--profile', $Profile, '--explain') -AllowFailure
  if ($doctor.Output -notmatch '(?im)^CHECK\s+tunnel_id\s+PASS\s+' -or $doctor.Output -notmatch '(?im)^CHECK\s+mcp_target\s+PASS\s+') {
    throw 'The Governance tunnel profile did not validate its tunnel and MCP target.'
  }

  Write-Host 'Governance tunnel provisioning: activating managed tunnel'
  $installed = Invoke-Native -FileName $Node -Arguments @($Installer, '--install')
  if ($installed.Output) { Write-Host $installed.Output }

  $finalStatus = Wait-ForManagerServices -RequiredIds @('governance-mcp', 'governance-tunnel')
} finally {
  $env:CONTROL_PLANE_API_KEY = $null
  $key = $null
  try { Set-Clipboard -Value '' } catch { }
}

Write-Host ''
Write-Host 'GOVERNANCE TUNNEL: READY FOR CHATGPT APP REGISTRATION'
Write-Host 'The fixed Governance MCP and its dedicated secure tunnel are healthy and managed.'
