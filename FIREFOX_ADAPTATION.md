# Firefox 适配指南

Firefox 使用 `manifest-firefox.json` 打包，构建脚本会把它复制为包内的 `manifest.json`。

Firefox 版本与主版本一致，右侧评论区请求只移除 `heybox_id` URL 参数，不会临时移除或修改 `heybox_id` 和 `user_heybox_id` Cookie。这样可以避免页面刷新或导航时登录态短暂缺失并触发重新登录。

## 本地调试

运行：

```powershell
.\scripts\build-firefox.ps1
```

脚本会生成：

```text
build/firefox-package/
build/better-xiaoheihe-firefox-v*.xpi
```

在 Firefox 中本地调试时，打开 `about:debugging#/runtime/this-firefox`，点击“临时载入附加组件”。

推荐选择解包目录里的文件：

```text
build/firefox-package/src/content.js
```

也可以选择解包目录里的 manifest：

```text
build/firefox-package/manifest.json
```

如果 `manifest.json` 在文件选择器里不能选中，就选 `src/content.js`。Mozilla 的临时加载支持选择扩展目录里的任意文件，Firefox 会自动读取扩展根目录的 `manifest.json`。

如果选择：

```text
build/better-xiaoheihe-firefox-v*.xpi
```

Firefox 可能仍会按安装包处理并触发签名验证，提示“此附加组件无法安装，因为它未通过验证”。遇到这个提示时，不代表包内容校验失败，改选 `build/firefox-package/src/content.js` 临时加载即可。

不要把未签名的 `.xpi` 拖进 Firefox，也不要从 `about:addons` 的齿轮菜单安装。正式安装需要先提交到 Mozilla Add-ons 完成签名。

## 打包说明

默认会保留 `build/firefox-package/` 方便调试。如果只想保留 `.xpi`，可以运行：

```powershell
.\scripts\build-firefox.ps1 -CleanPackage
```

如果本机安装了 `web-ext`，脚本会自动执行 lint；没有安装时会跳过 lint 并继续打包。
