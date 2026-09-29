param(
  [string]$Source = "$PSScriptRoot\generated-assets"
)

$ErrorActionPreference = "Stop"

function Copy-Asset {
  param(
    [string]$Pattern,
    [string]$Destination,
    [string]$TargetName
  )

  $match = Get-ChildItem -Path $Source -File -ErrorAction Stop |
    Where-Object { $_.Name -like $Pattern } |
    Select-Object -First 1

  if (-not $match) {
    Write-Warning "未找到：$Pattern"
    return $false
  }

  $destDir = Join-Path $PSScriptRoot $Destination
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null

  $destFile = Join-Path $destDir $TargetName
  Copy-Item $match.FullName $destFile -Force
  Write-Host "[OK] $($match.Name) -> $Destination/$TargetName"
  return $true
}

if (-not (Test-Path $Source)) {
  throw "素材目录不存在：$Source"
}

$maps = @(
  @("*爆走奶奶团公园大战*.png", "assets/reference/gameplay", "park_battle.png"),
  @("*爆走奶奶团大战幸福公园*.png", "assets/reference/gameplay", "park_battle_arena.png"),
  @("*夜市奶奶大战锅霸厨王*.png", "assets/reference/gameplay", "night_market_boss.png"),
  @("*爆走奶奶团_选择强化*.png", "assets/reference/gameplay", "upgrade_choice.png"),

  @("*奶奶与紫怪_欢乐冒险图鉴*.png", "assets/reference/characters", "character_enemy_sheet.png"),

  @("*幸福公园晚霞资产图集*.png", "assets/reference/scene", "park_scene_sheet.png"),
  @("*爆走奶奶团_幸福公园基地*.png", "assets/reference/scene", "park_base_scene.png"),

  @("*爆走奶奶团游戏ui精灵图集*.png", "assets/reference/ui", "ui_sprite_sheet.png"),
  @("*爆走奶奶团_炫彩游戏界面资产集*.png", "assets/reference/ui", "ui_asset_sheet.png"),

  @("*爆走奶奶团技能特效图标合集*.png", "assets/reference/effects", "skill_effects_sheet.png"),

  @("*game_asset_sheet*.png", "assets/reference/concept", "combat_asset_overview.png")
)

$copied = 0
foreach ($m in $maps) {
  if (Copy-Asset -Pattern $m[0] -Destination $m[1] -TargetName $m[2]) {
    $copied++
  }
}

if ($copied -eq 0) {
  throw "没有匹配到任何素材，请检查 generated-assets 目录中的文件名。"
}

Set-Location $PSScriptRoot

git add assets/reference
git status --short

if (-not (git diff --cached --quiet)) {
  git commit -m "assets: add generated visual references"
  git push origin main
  Write-Host ""
  Write-Host "已提交并推送到 origin/main。"
} else {
  Write-Host "没有新的素材变更需要提交。"
}
