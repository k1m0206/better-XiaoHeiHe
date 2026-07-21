# 更好的小黑盒

用于优化小黑盒网页社区浏览体验的浏览器扩展，主要增强信息流、评论预览、顶部导航、内容过滤和 AI 能力。

## 主要功能

### 信息流与详情页

- 在社区首页、话题页、个人主页、收藏页和搜索页的信息流右侧展示评论预览。
- 可在通用设置中统一调整所有信息流“帖子 + 评论区”的浏览器宽度占比，以及帖子与评论区的内部宽度比例。
- 评论预览高度跟随帖子内容，评论较多时在预览区域内滚动，不额外撑高信息流。
- 帖子底部显示发布时间，并支持直接点赞帖子。
- 支持评论图片、楼中楼回复、用户等级、作者标识、发布时间、IP 属地和点赞数展示。
- 支持在评论预览中直接发布主评论、回复评论、插入小黑盒表情以及点赞评论。
- 评论支持“默认”“最新”“作者优先”三种排序方式。
- 帖子详情页使用左右分栏布局，并在右侧提供评论排序和“屏蔽 CY”工具栏。
- 帖子图片支持大图预览、多图切换、滚轮缩放和放大后拖动查看。

### 顶部导航

- 提供全局搜索框，并读取 `website:bbs-search-history` 展示搜索历史。
- 搜索框支持历史筛选、点击历史项搜索，以及保存新搜索关键词。
- 提供回复消息和点赞消息入口，支持分页加载。
- 提供收藏入口，可在弹层中浏览收藏帖子。
- 将“小黑盒加速器”“黑盒语音”“黑盒工坊”“开放平台”“加入我们”收纳到“更多”二级菜单。
- 将社区左侧目录折叠到顶部菜单，点击页面其他区域可关闭。
- 点击扩展图标会打开小黑盒社区首页。

### 热搜

- 社区首页和搜索页左侧提供悬浮的黑盒热搜入口。
- 支持展开、收回、榜单切换和点击外部关闭。
- 原生热搜不可用时，会通过搜索欢迎页接口加载备用热搜数据。
- 热搜展开页底部和通用设置均可永久关闭热搜，并可从通用设置恢复显示。

### 内容过滤

- 支持分别管理帖子和评论屏蔽关键词。
- 帖子关键词可匹配标题、正文、分区、话题和话题入口。
- 支持按用户等级过滤评论。
- 支持屏蔽插眼/CY 评论。
- 支持在分区或话题标签上右键，快速添加帖子屏蔽关键词。
- 本地记录每个屏蔽关键词的生效次数。

### AI 总结

- 信息流帖子和帖子详情页均可使用 AI 总结。
- 支持继续追问、重新总结、表情渲染和耗时展示。
- 支持以下接口类型：
  - OpenAI Compatible
  - OpenAI Responses
  - Anthropic
  - Gemini
- 支持通过服务商、Base URL 和 API Key 拉取模型列表，也可手动填写模型。

### AI Bot

- 首次使用前需要单独阅读并确认风险授权。
- 支持自动回复 @、评论和回复消息。
- 支持为首页推荐帖生成主评论。
- 支持白名单、拒绝回复关键词、消息时间窗口、轮询周期和单用户回复次数限制。
- 支持同一用户的跨帖子历史对话。
- 提供运行日志、已发消息日志和待处理队列。
- 连续发送失败 3 次后会自动关闭回复功能并发送浏览器通知。

## 支持页面

扩展会在以下路径及其子路径运行：

```text
https://www.xiaoheihe.cn/app/bbs
https://www.xiaoheihe.cn/app/topic/link
https://www.xiaoheihe.cn/app/user/profile
https://www.xiaoheihe.cn/app/user/favour
https://www.xiaoheihe.cn/app/search
```

## 安装调试

1. 打开 Chrome 或 Edge 的扩展管理页面。
2. 开启“开发者模式”。
3. 点击“加载解压缩的扩展程序”。
4. 选择本项目根目录。
5. 打开小黑盒社区页面进行测试。

修改代码后，需要在扩展管理页面重新加载扩展，并刷新小黑盒页面。

## 开发说明

### 模块与入口

以下文件是生成后的扩展入口，不应直接修改：

```text
src/content.js
src/background.js
src/ai-bridge.js
```

日常开发应修改对应模块目录：

```text
src/content/
src/background/
src/ai-bridge/
src/shared/
```

修改模块后重新生成入口：

```powershell
.\scripts\build-source-bundles.ps1
```

### 打包

生成 Chrome/Edge 上传包：

```powershell
.\scripts\build-extension.ps1
```

输出文件：

```text
dist/better-XiaoHeiHe.zip
```

生成 Firefox 测试包和 AMO 上传包：

```powershell
.\scripts\build-firefox.ps1
```

输出文件：

```text
build/better-xiaoheihe-firefox-v*.xpi
dist/better-XiaoHeiHe-firefox-v*.zip
```

Firefox 本地调试与签名说明见 `FIREFOX_ADAPTATION.md`。

商店资料和隐私说明见：

- `CHROME_STORE.md`
- `PRIVACY.md`

## 项目结构

```text
better-XiaoHeiHe/
  _locales/               本地化文案
  assets/                 图标等静态资源
  doc/                    小黑盒接口说明
  scripts/                构建与打包脚本
  src/
    ai-bridge/            页面与扩展之间的 AI 设置桥接
    background/           后台请求、AI 服务和 AI Bot
    content/              页面布局、信息流、评论和顶部导航
    shared/               前后台共享常量与归一化逻辑
    ai-bridge.js           生成入口
    background.js          生成入口
    content.js             生成入口
  manifest.json
```

## 数据与接口

评论、消息、收藏、表情和信息流数据来自小黑盒网页接口，主要包括：

```text
GET  /bbs/app/link/tree
GET  /bbs/app/comment/sub/comments
GET  /bbs/app/api/emojis/list
GET  /bbs/app/user/message
GET  /bbs/app/feeds
POST /bbs/app/comment/support
POST /bbs/app/profile/award/link
POST /bbs/app/comment/create
```

其中评论创建接口使用 `https://workshopapi.xiaoheihe.cn`，其余上表接口仍使用各自当前的网页接口域名。

扩展会复用页面请求中已经出现的网页环境参数，并按请求实时生成 `hkey`、`_time`、`nonce`；Workshop 写接口还会生成 `_rnd`。修改接口参数或签名逻辑时，应同步更新对应代码注释和 `doc/` 中的接口文档。

评论列表和楼中楼查询会优先尝试去除个人标识的请求；失败时回退到当前网页登录态。扩展不会临时移除或修改浏览器中的小黑盒登录 Cookie。

点赞、评论、回复、消息查询和 AI Bot 操作依赖当前小黑盒网页登录状态。

## AI 数据说明

- AI 总结和 AI Bot 使用用户自行配置的 AI 服务商。
- API Key 保存在扩展本地存储中。
- 生成内容时，帖子正文、图片链接、相关评论和必要的对话上下文会发送给所选 AI 服务商。
- 开启跨帖子历史时，AI Bot 会从本地日志中读取符合条件的历史互动。
- 插件不会保存用户 Cookie、`user_pkey`、`x_xhh_tokenid` 等登录令牌。

详细隐私说明请阅读 `PRIVACY.md`。

## 注意事项

- 小黑盒网页结构或接口发生变化时，扩展可能需要重新适配。
- 自动回复和首页评论功能默认关闭，开启前请确认白名单、提示词和时间窗口设置。
- 未配置 AI 服务时，普通的信息流、评论预览、搜索、热搜和过滤功能仍可使用。
