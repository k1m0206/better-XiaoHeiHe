# Firefox Add-ons (AMO) 上架资料

## 基本信息

名称：

```text
更好的小黑盒
```

简短说明：

```text
优化小黑盒社区首页，在帖子右侧直接预览热门评论。
```

详细说明：

```text
🔥 更好的小黑盒

让信息流不仅能看帖子，也能直接看讨论。

这是一款面向小黑盒网页社区的轻量增强插件。它会在帖子列表右侧增加评论预览区，让你不用频繁进入详情页，也能快速判断一条内容是否值得继续看。


【评论预览】

在首页、话题链接页、个人主页、收藏页和搜索页的信息流中，每条帖子右侧都会显示评论预览。

你可以直接看到：

  用户头像、昵称、等级
  评论正文、图片、游戏链接
  发布时间、IP 属地
  点赞数、作者标识
  楼中楼回复

看到有价值的讨论，再进入详情页；没营养的内容，直接略过。


【高效浏览】

评论区高度会跟随左侧帖子内容自动适配。

评论很多时，只在右侧评论区内部滚动，不会把整条帖子撑得很长，也不会打乱信息流节奏。

你可以在列表页直接：

  滚动加载更多评论
  点击“全部 N 条回复”展开楼中楼
  给主评论和楼中楼回复点赞
  点击用户信息跳转到主页
  点击评论图片查看大图
  在帖子底部直接点赞内容


【页面布局优化】

插件会把左侧菜单折叠到顶部栏，并隐藏原右侧推荐栏，释放更多横向空间。

顶部栏还提供：

  收藏入口
  设置入口
  左侧菜单入口

这些入口保持轻量，不改变小黑盒原有使用习惯。


【评论屏蔽】

支持屏蔽插眼评论。

开启后，开关右侧会显示本次被屏蔽的 CY 评论数量。

也支持添加评论屏蔽关键词。命中关键词的评论会直接隐藏，每个关键词的屏蔽生效次数会保存在浏览器本地。

被屏蔽的楼中楼回复不会继续显示在“全部 N 条回复”的数量中，避免出现回复数和实际展示不一致。


【AI Bot】

用户可在设置页独立配置 AI 服务商、Base URL、模型、API Key、轮询周期、只处理最近消息时间窗口、回复 @ 开关、回复评论开关、白名单用户 ID、评论提示词、是否允许表情，以及跨帖子历史对话开关和数量。

开启回复开关后，浏览器运行期间会自动查询当前登录账号的对应消息；符合白名单规则时，会读取帖子详情和评论区上下文，调用用户配置的 AI 接口生成回复，并使用当前小黑盒网页登录态回复到触发消息的评论下。回复开关默认关闭。


【适合谁】

  高频浏览小黑盒社区的用户
  想快速判断帖子讨论质量的用户
  更关注评论区观点和氛围的玩家
  不想反复点进详情页再退回列表的用户


【隐私说明】

除用户主动配置并触发 AI 功能时向其配置的 AI 服务端点发送内容外，插件不向作者服务器收集或上传用户个人数据。评论数据来自小黑盒网页自身接口，只用于当前页面展示。屏蔽状态、关键词、过滤规则和本地偏好只保存在当前浏览器的扩展本地存储中。
```

分类建议：

```text
Productivity（效率工具）
```

语言：

```text
中文（简体）
```

## Firefox 兼容与 Manifest 说明

Firefox 包由 `scripts/build-extension.ps1 -Target firefox` 在 Chrome `manifest.json` 基础上自动生成，差异仅限以下键，业务代码与 Chrome 版完全一致：

| 键 | Chrome | Firefox |
|----|--------|---------|
| `background` | `{ "service_worker": "src/background.js" }` | `{ "scripts": ["src/background.js"] }` |
| `browser_specific_settings.gecko.id` | 无 | `better-xiaoheihe@k1m0206.github.io` |
| `browser_specific_settings.gecko.strict_min_version` | 无 | `140.0` |
| `browser_specific_settings.gecko.data_collection_permissions` | 无 | `{ "required": ["websiteContent", "personalCommunications"], "optional": [] }` |

- 最低版本 `140.0`：`content_scripts` 中的 `world: "MAIN"`（`src/content.js`）自 Firefox 128 起受支持；而 Firefox 内置的数据收集同意提示自桌面版 140 起受支持。本扩展声明了数据传输且未自带自定义同意流程，按 Mozilla 要求须将 `strict_min_version` 设为 `140.0`，故取两者较高值。
- `src/content.js` 运行于 MAIN world 且不调用任何 `chrome.*`；`src/ai-bridge.js` 与 `src/background.js` 使用 `chrome.*` 命名空间，Firefox 原生兼容，首版无需 `webextension-polyfill`。

## 数据收集声明（data_collection_permissions）

AMO 自 2025-11-03 起要求新提交声明数据收集权限。本扩展声明：

```json
{
  "required": ["websiteContent", "personalCommunications"],
  "optional": []
}
```

声明理由：用户主动配置并触发 AI 总结或 AI Bot 后，扩展会将当前帖子文本、评论文本（`websiteContent`）以及 @ 我的消息、评论/回复我的消息（`personalCommunications`）发送到用户自行配置的 AI 服务端点，用于生成总结或自动回复。除此之外不向作者服务器收集或上传任何数据。AI 功能默认仅显示入口，未配置或未触发时不发送任何内容。

## 权限说明

| 权限 | 用途 |
|------|------|
| `storage` | 在浏览器本地保存 AI 总结设置、AI Bot 设置与日志、屏蔽关键词、等级过滤规则和本地偏好；不上传到作者服务器。 |
| `alarms` | AI Bot 任一回复开关开启后，按用户设置周期轮询对应消息。 |
| `notifications` | AI Bot 检测到小黑盒登录状态过期时提醒用户。 |
| `cookies` | AI Bot 在后台读取当前小黑盒登录 Cookie 中的用户 ID 并让请求复用现有登录态；不保存、不上传、不删除、不修改这些 Cookie。 |
| `declarativeNetRequestWithHostAccess` | 右侧评论读取接口发送前替换请求头 Cookie，去除 `heybox_id` 和 `user_heybox_id`；AI Bot 评论提交时设置 `origin`/`referer` 请求头。 |
| `host_permissions` (`<all_urls>`) | 支持用户自定义 AI Base URL 的模型拉取、连通测试、总结请求和 AI Bot 回复生成请求；内容脚本本身仅匹配 `https://www.xiaoheihe.cn/*`。 |

### `<all_urls>` 与 `cookies` 必要性说明（AMO 审核重点）

- `<all_urls>` 不用于在任意站点注入脚本（`content_scripts.matches` 仅限 `https://www.xiaoheihe.cn/*`），而是因为 AI 服务商 Base URL 由用户在设置中自由填写，后台 `fetch`（见 `src/ai-bridge.js`、`src/background.js`）目标域名在安装时不可预知，故需 `<all_urls>` host 权限以发起用户配置的 AI 请求。
- `cookies` 仅用于读取小黑盒域 Cookie 中的登录用户 ID，使 AI Bot 后台请求复用用户既有登录态；不跨域读取，不写入或删除 Cookie。

## DNR 兼容性说明

扩展使用 `declarativeNetRequest.updateSessionRules`（见 `src/background.js`）改写 `cookie`、`origin`、`referer` 三类请求头。Firefox 128+ 支持会话级 DNR `modifyHeaders`；若在目标版本实测发现头改写不生效，可启用 `webRequest.onBeforeSendHeaders` 回退（需新增 `webRequest`/`webRequestBlocking` 权限，仅 Firefox 构建条件加载）。提交前应完成该专项验证。

## 数据使用声明

```text
不收集用户数据。
不出售用户数据。
不将用户数据用于广告或追踪。

除用户主动配置并触发 AI 功能时向其配置的 AI 服务端点发送内容外，插件不向作者服务器收集或上传任何数据。用户配置 AI 服务并点击总结后，当前帖子和评论文本会由扩展后台发送到指定的 AI 接口。AI Bot 回复开关默认关闭；用户主动开启后，插件会按规则将消息、帖子和评论上下文发送到配置的 AI 接口以生成回复。所有传输均基于用户明确配置的外部端点，未触发时不发生任何数据传输。
```

## 上架前仍需准备

- 通过 `web-ext lint`（无 error）：构建会在打包后自动清理 staging 目录，故需先解压 `dist/better-XiaoHeiHe-firefox.zip` 到临时目录，再运行 `web-ext lint --source-dir <解压目录>`。
- 隐私政策公开链接（指向 `PRIVACY.md`）。
- 至少 1 张商店截图。
- AMO 开发者账号。
- 完成 DNR 头改写在 Firefox 128+ 的专项验收（见上）。
