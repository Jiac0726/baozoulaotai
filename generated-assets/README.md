# Generated Assets Inbox

把 ChatGPT / ImageGen 导出的原始 PNG 放到这个目录，然后在仓库根目录运行：

```powershell
.\import-generated-assets.ps1
```

脚本会自动把已知素材分类到：

- `assets/reference/gameplay`
- `assets/reference/characters`
- `assets/reference/scene`
- `assets/reference/ui`
- `assets/reference/effects`
- `assets/reference/concept`

随后自动执行：

```bash
git add assets/reference
git commit -m "assets: add generated visual references"
git push origin main
```

## 说明

这里保存的是 **原始生成图 / 参考图**，不是最终直接进游戏的切图。

后续真正运行时使用的素材应继续拆到：

- `assets/player`
- `assets/enemies`
- `assets/boss`
- `assets/skills`
- `assets/effects`
- `assets/drops`
- `assets/arena`
- `assets/scenery`
- `assets/ui`
