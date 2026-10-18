#Requires -Version 7.0
# 用法：pwsh -NoProfile -File .\new-note.ps1              → 生成今天的笔记
#       pwsh -NoProfile -File .\new-note.ps1 2026-10-20   → 生成指定日期的笔记
param([string]$Date = (Get-Date -Format 'yyyy-MM-dd'))

$root     = $PSScriptRoot
$template = Join-Path $root 'notes/_template.md'
$out      = Join-Path $root "notes/$Date.md"

if (-not (Test-Path -LiteralPath $template)) {
    Write-Host "模板缺失：$template"
    exit 1
}
if (Test-Path -LiteralPath $out) {
    Write-Host "已存在，直接打开：$out"
    exit 0
}

(Get-Content -LiteralPath $template -Raw -Encoding utf8).Replace('YYYY-MM-DD', $Date) |
    Set-Content -LiteralPath $out -Encoding utf8NoBOM

Write-Host "已创建：$out"
