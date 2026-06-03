# 隐私政策

better-XiaoHeiHe 是一个用于优化小黑盒网页社区首页展示效果的浏览器插件。

## 数据处理

本插件不会收集或出售用户个人数据。AI 总结入口默认开启显示；只有用户配置 AI 接口并点击 AI 总结后，插件才会将当前帖子标题、正文、话题和评论文本发送到用户选择并填写的 AI 接口服务商，用于生成总结。用户点击拉取模型时，插件会向该 AI 服务商请求模型列表。AI Bot 默认关闭；用户主动开启后，插件会在浏览器运行期间按用户开关查询当前登录账号的 @ 消息和评论/回复消息，并在符合规则时把消息内容、帖子详情、触发消息的评论和评论区上下文发送到用户配置的 AI 接口，用于生成自动回复内容。

插件在用户访问小黑盒网页社区时用于调整页面布局并展示评论预览。评论数据来自小黑盒网页自身使用的接口；右侧评论区的评论列表和楼中楼回复查询会先使用去除个人标识后的 Cookie 请求，过滤请求头中的 `heybox_id` 和 `user_heybox_id`，且不携带 `heybox_id` URL 参数。如果请求失败或接口未正常返回，会回退到携带当前 Cookie 和 `heybox_id` URL 参数的正常请求。插件不会临时移除或修改浏览器中的 `heybox_id`、`user_heybox_id` Cookie，避免刷新页面时影响小黑盒网页登录态。点赞等用户主动操作请求会携带浏览器当前页面已有的登录态 Cookie，由浏览器直接发送给小黑盒域名。AI Bot 开启后，即使未打开小黑盒社区页面，也会在后台读取当前小黑盒登录 Cookie 用于查询 @ 消息、评论/回复消息和发送自动回复；如果登录状态失效，插件会通知用户并停止 AI Bot。

## 本地存储

本插件使用浏览器扩展本地存储保存用户主动设置的偏好，包括是否屏蔽 CY 评论、评论/帖子屏蔽关键词列表、等级过滤规则、每个屏蔽关键词在本地生效的次数、AI 总结设置，以及 AI Bot 的开关、独立 AI 参数、轮询周期、只处理最近消息时间窗口、白名单用户 ID、评论提示词、7 天运行日志、AI 已发回复消息日志、已回复记录和小黑盒表情短码缓存。屏蔽关键词和等级过滤规则仅用于当前浏览器内的内容过滤，不会发送到小黑盒或其他服务器。

AI 总结设置包括是否开启 AI、服务商类型、Base URL、模型、总结提示词和 API Key。API Key 仅在用户拉取模型、测试连通或点击 AI 总结时，由扩展后台随请求发送到用户配置的 AI 接口。

AI Bot 设置包括是否开启、是否回复 @、是否回复评论、服务商类型、Base URL、模型、API Key、轮询周期、只处理最近消息时间窗口、白名单用户 ID 和评论提示词。API Key 仅在用户测试连通或 AI Bot 自动生成回复时，由扩展后台随请求发送到用户配置的 AI 接口。

## 网络请求

插件会请求以下小黑盒接口以展示评论预览：

```text
https://api.xiaoheihe.cn/bbs/app/link/tree
https://api.xiaoheihe.cn/bbs/app/comment/sub/comments
https://api.xiaoheihe.cn/bbs/app/api/emojis/list
https://api.xiaoheihe.cn/bbs/app/comment/support
https://api.xiaoheihe.cn/bbs/app/profile/award/link
https://api.xiaoheihe.cn/bbs/app/user/message
https://api.xiaoheihe.cn/bbs/app/comment/create
```

请求仅用于获取当前首页帖子对应的评论数据、楼中楼回复、评论表情图片映射、查询 AI Bot 使用的 @ 消息和评论/回复消息、获取 AI Bot 可用的小黑盒表情短码，以及向小黑盒提交用户主动触发的点赞操作或 AI Bot 自动回复评论。

如果用户配置并使用 AI 总结功能，插件还会请求用户配置的接口：

```text
OpenAI Compatible: {baseUrl}/chat/completions
OpenAI Responses: {baseUrl}/responses
Anthropic: {baseUrl}/messages
Gemini: {baseUrl}/models/{model}:generateContent
```

该请求由扩展后台发起，用于测试连通、生成帖子总结和生成 AI Bot 自动回复。总结请求内容包含用户当前主动总结的帖子文本和最多 30 条评论文本；AI Bot 请求内容包含消息文本、帖子详情、触发消息的评论、最多 30 条评论上下文和完整小黑盒表情短码列表。用户点击拉取模型时，插件还会请求对应服务商的模型列表接口，例如 `{baseUrl}/models`。

## 权限说明

插件仅通过 content script 匹配小黑盒网页社区路径：

```text
https://www.xiaoheihe.cn/app/bbs
https://www.xiaoheihe.cn/app/bbs/*
https://www.xiaoheihe.cn/app/topic/link
https://www.xiaoheihe.cn/app/topic/link/*
https://www.xiaoheihe.cn/app/user/profile
https://www.xiaoheihe.cn/app/user/profile/*
https://www.xiaoheihe.cn/app/user/favour
https://www.xiaoheihe.cn/app/user/favour/*
https://www.xiaoheihe.cn/app/search
https://www.xiaoheihe.cn/app/search*
```

插件申请 `storage` 权限，用于在用户浏览器本地保存 AI 总结设置、AI Bot 设置与日志、屏蔽关键词、等级过滤规则和相关本地偏好。插件申请 `alarms` 权限，用于 AI Bot 开启后按用户设置周期轮询 @ 消息。插件申请 `notifications` 权限，用于 AI Bot 检测到小黑盒登录状态过期时提醒用户。插件申请 `cookies` 权限，用于 AI Bot 在后台读取当前小黑盒登录 Cookie 中的用户 ID 并让请求使用现有登录态；插件不会保存、上传、删除或修改这些 Cookie。插件申请 `declarativeNetRequestWithHostAccess` 权限，仅用于右侧评论区读取接口发送前替换请求头 Cookie，去除 `heybox_id` 和 `user_heybox_id`。插件申请主机权限以支持用户自定义 AI Base URL 的模型拉取、连通测试、总结请求和 AI Bot 回复生成请求。

## 联系方式

如需反馈问题，请通过项目仓库或插件发布页提供的反馈入口联系维护者。

