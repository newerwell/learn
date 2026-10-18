# Usage (Windows PowerShell 5.1 compatible):
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\new-note.ps1
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\new-note.ps1 2026-10-20
param([string]$Date)

if ([string]::IsNullOrWhiteSpace($Date)) { $Date = Get-Date -Format 'yyyy-MM-dd' }

$root = $PSScriptRoot
$tpl  = Join-Path $root 'notes\_template.md'
$out  = Join-Path $root ('notes\' + $Date + '.md')

if (-not (Test-Path -LiteralPath $tpl)) {
    Write-Host ('Template missing: ' + $tpl)
    exit 1
}
if (Test-Path -LiteralPath $out) {
    Write-Host ('Exists: ' + $out)
    exit 0
}

# Read/write explicitly as UTF-8: PS 5.1 defaults would mangle Chinese text.
$text = [System.IO.File]::ReadAllText($tpl, [System.Text.Encoding]::UTF8)
$text = $text.Replace('YYYY-MM-DD', $Date)
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($out, $text, $utf8NoBom)
Write-Host ('Created: ' + $out)
