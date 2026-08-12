$ErrorActionPreference = "Stop"
$ProjectFolder = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$SecretsFile = Join-Path $ProjectFolder "backup-secrets.ps1"
if (-not (Test-Path $SecretsFile)) { throw "Missing backup-secrets.ps1 in the project folder." }
. $SecretsFile
Set-Location $ProjectFolder
node .\scripts\backup-ledger.mjs
