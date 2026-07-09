# shared

这里放跨 `content`、`background`、`ai-bridge` 复用的协议常量和归一化逻辑。

当前项目没有运行时模块加载链，`scripts/build-source-bundles.ps1` 会先拼入 `constants.js` 和 `normalizers.js`，再拼入各入口自己的模块源码。
