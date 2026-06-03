# 更好的小黑盒

一个用于优化小黑盒网页社区信息流浏览体验的浏览器插件。

## 功能

- 在小黑盒社区首页、话题链接页、个人主页、收藏页和搜索页的信息流右侧展示评论预览。
- 右侧评论区高度跟随左侧帖子内容，评论过多时在右侧内部裁切，避免撑高帖子列表。
- 首页、话题链接页、个人主页、收藏页和搜索页帖子底部展示发布时间，并支持直接点击原点赞区域给内容点赞。
- 评论预览支持展示：
  - 用户头像、昵称、等级
  - 评论内容
  - 评论图片，并支持点击预览
  - 评论中的游戏链接
  - 发布时间
  - IP 属地
  - 点赞数，并支持直接点赞评论和楼中楼回复
  - 楼中楼回复
  - 作者标识
- 评论预览支持滚动加载更多评论。
- 评论预览支持按默认顺序、热度、最新和作者优先切换排序。
- 适配页面的左侧菜单会统一折叠到顶部栏按钮中，点击后展开；点击页面其他区域可关闭菜单。
- 适配页面的原右侧推荐栏会隐藏，释放页面横向空间；帖子详情页不会额外生成右侧评论预览。
- 顶部栏提供收藏入口，可直接跳转到个人收藏内容页。
- 顶部栏设置支持添加评论和帖子屏蔽关键词；帖子关键词会同时匹配正文、分区/话题和分区入口，并在本地记录每个关键词的生效次数。
- 支持在信息流帖子分区/话题标签上右键，确认后快速加入帖子屏蔽关键词。

## 更新记录

### 0.1.4.7

- AI 总结设置支持选择 OpenAI Compatible、OpenAI Responses、Anthropic 和 Gemini 接入方式。
- AI 总结设置支持按当前服务商、Base URL 和 API Key 拉取模型列表，同时保留手动填写模型能力。
- AI 总结请求会根据不同服务商自动适配 Chat Completions、Responses、Messages 和 Gemini Generate Content 端点。

### 0.1.4.5

- 不再临时移除小黑盒身份 Cookie，彻底避免刷新页面时登录态短暂丢失。
- 移除 `cookies` 权限，仅保留评论接口 URL 参数中的身份字段过滤。
- 右侧评论区读取接口优先替换为去除个人标识后的 Cookie 请求，失败时回退到携带当前 Cookie 的正常请求，且不修改浏览器 Cookie。

### 0.1.4.4

- 修复 Firefox 刷新页面时临时移除身份 Cookie 可能导致小黑盒登录态丢失的问题。
- 为身份 Cookie 临时移除流程增加页面卸载恢复和后台自动恢复兜底。

### 0.1.4.1

- 新增 AI 总结能力，支持在帖子列表和帖子详情页总结帖子正文与评论区内容。
- AI 总结设置支持配置 OpenAI 兼容接口、模型、密钥和总结提示词，并提供连通性测试。
- AI 总结弹窗支持继续追问、重新总结，并展示总结和追问耗时。
- 优化帖子样式、图片文字间距、AI 总结设置界面和按钮图标表现。

### 0.1.4

- 设置面板支持按帖子/评论分别管理关键词和等级过滤规则，并在多个页面和标签页之间同步状态。
- 扩展帖子屏蔽范围，支持匹配标题、正文、分区/话题和左侧话题入口。
- 优化帖子详情页左右分栏、用户等级展示、屏蔽设置布局，并将插件名称和描述改为本地化文案。

### 0.1.3

- 新增按范围管理屏蔽关键词、右键快速屏蔽话题/分区、屏蔽插眼评论和命中次数统计。
- 评论预览支持图片展示、大图预览、多图切换和楼中楼继续加载。
- 将评论预览扩展到话题链接页、个人主页、收藏页和搜索页，并统一整理顶部栏、左侧菜单和右侧推荐栏。

### 0.1.2

- 右侧评论区支持分页滚动加载、用户信息展示、游戏链接渲染和主评论/楼中楼点赞。
- 首页帖子底部支持直接点赞并显示发布时间。
- 优化顶部折叠菜单交互。

## 安装调试

1. 打开 Edge 或 Chrome 的扩展管理页面。
2. 开启开发者模式。
3. 选择“加载解压缩的扩展程序”。
4. 选择本项目目录。
5. 打开 `https://www.xiaoheihe.cn/app/bbs/home`、`https://www.xiaoheihe.cn/app/topic/link`、`https://www.xiaoheihe.cn/app/user/profile`、`https://www.xiaoheihe.cn/app/user/favour/content` 或 `https://www.xiaoheihe.cn/app/search` 查看效果。

修改代码后，在扩展管理页面点击重新加载插件，再刷新小黑盒页面。

## 打包上架

用于 Chrome Web Store 上传的压缩包可以通过脚本生成：

```powershell
.\scripts\build-extension.ps1
```

生成结果：

```text
dist/better-XiaoHeiHe.zip
```

上架资料可参考：

- `CHROME_STORE.md`
- `PRIVACY.md`

上架前还需要准备至少 1 张商店截图，并把隐私政策发布到可公开访问的链接。

## 项目结构

```text
better-XiaoHeiHe/
  assets/
    icons/
  manifest.json
  CHROME_STORE.md
  PRIVACY.md
  README.md
  scripts/
  src/
    ai-bridge.js
    content.js
    options.html
    options.css
    options.js
```

## 实现说明

插件通过 content script 注入到小黑盒网页中：

- 监听小黑盒 BBS 页面路由变化。
- 首页、帖子详情页、话题链接页、个人主页和搜索页时调整页面布局，移除原右侧推荐栏。
- 识别每条帖子链接 ID，请求评论接口并缓存结果。
- 根据左侧帖子实际高度同步右侧评论预览高度。
- 评论预览排序偏好保存在扩展本地存储中，并在多个页面和标签页之间同步。
- AI 功能默认开启，帖子右上角三个点左侧默认显示 AI 总结按钮；关闭后不再显示。未配置 Base URL 或模型时，点击 AI 按钮会打开设置界面；AI 请求统一由扩展后台发起，并支持多服务商端点适配。
- 离开适配页面时恢复原始左侧菜单位置。

## 接口说明

评论数据来自小黑盒接口：

```text
GET https://api.xiaoheihe.cn/bbs/app/link/tree
GET https://api.xiaoheihe.cn/bbs/app/comment/sub/comments
GET https://api.xiaoheihe.cn/bbs/app/api/emojis/list
POST https://api.xiaoheihe.cn/bbs/app/comment/support
POST https://api.xiaoheihe.cn/bbs/app/profile/award/link
```

AI 总结功能开启后，会请求用户在插件设置弹框中配置的 AI 接口。当前支持：

```text
OpenAI Compatible: POST {baseUrl}/chat/completions
OpenAI Responses: POST {baseUrl}/responses
Anthropic: POST {baseUrl}/messages
Gemini: POST {baseUrl}/models/{model}:generateContent
```

设置页可通过当前服务商、Base URL 和 API Key 拉取模型列表；如果接口不支持模型列表，也可以继续手动填写模型名称。

请求会复用页面中已出现过的基础参数，例如：

- `os_type`
- `app`
- `client_type`
- `version`
- `web_version`
- `x_client_type`
- `x_app`
- `heybox_id`
- `x_os_type`
- `device_info`
- `device_id`

右侧评论区的评论列表和楼中楼更多回复查询会先使用去除个人标识后的 Cookie 请求，请求头 `Cookie` 会过滤掉 `heybox_id` 和 `user_heybox_id`，同时不携带 `heybox_id` URL 参数；如果请求失败或接口未返回 `status: "ok"`，会回退到携带当前 Cookie 和 `heybox_id` URL 参数的正常请求。整个过程不会临时移除或修改浏览器中的 `heybox_id`、`user_heybox_id` Cookie，避免刷新页面时影响小黑盒网页登录态。评论列表接口会按页请求，第一页使用 `is_first=1&page=1`，继续滚动时使用 `is_first=0&page=2/3/...`，每页 `limit=20`。楼中楼更多回复接口使用 `root_comment_id` 和最后一条已展示回复的 `lastval` 继续请求。评论点赞接口使用 `comment_id` 和 `support_type=1` 提交点赞；内容点赞接口使用 `link_id` 和 `award_type=1` 提交点赞。点赞请求会携带当前网页登录态。

AI 接口使用设置弹框中填写的 `provider`、`baseUrl`、`model` 和可选 `apiKey`，由扩展后台按所选服务商格式发起请求。生成总结前会复用评论详情接口返回的 `result.link.text` 补全帖子完整正文，并在评论尚未缓存时复用同次返回的 `result.comments`；请求会发送当前帖子标题、正文、话题和最多 30 条评论文本用于生成总结；评论超过 30 条时优先选取点赞量更高的评论。模型列表拉取会请求对应服务商的模型列表端点，仅用于辅助选择模型。

接口签名参数 `hkey`、`_time`、`nonce` 在 `src/content.js` 中生成。后续如果修改接口参数或签名逻辑，需要同步更新代码里的接口注释和本文档。
评论文本中的表情标记会根据表情列表接口返回的 `code` 和 `img` 映射成图片展示；表情列表只做运行时内存缓存。

## 注意事项

- 插件匹配 `https://www.xiaoheihe.cn/app/bbs`、`https://www.xiaoheihe.cn/app/topic/link`、`https://www.xiaoheihe.cn/app/user/profile`、`https://www.xiaoheihe.cn/app/user/favour`、`https://www.xiaoheihe.cn/app/search` 和它们的子路径。
- 右侧评论区的评论列表和楼中楼查询优先使用去除 `heybox_id`、`user_heybox_id` 后的 Cookie 请求，且不携带 `heybox_id` URL 参数；失败时回退到当前网页登录态请求。整个过程不会移除或修改小黑盒登录 Cookie。点赞等用户主动操作仍依赖当前网页登录态。
- AI 总结接口由用户自行配置，开启且完成配置后，帖子内容和评论文本会发送到所选 AI 服务商；拉取模型时会向该服务商请求模型列表。
- 小黑盒网页结构或接口签名变化时，插件可能需要适配。
- 本项目只在页面内做展示优化，不保存用户 Cookie 或登录凭据。
