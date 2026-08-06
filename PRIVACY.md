# 隐私政策

better-XiaoHeiHe 是一个用于优化小黑盒网页社区首页展示效果的浏览器插件。

## 数据处理

本插件不设置开发者数据服务器，不会把用户数据上传给插件开发者，不出售用户数据，也不将用户数据用于广告或跨站追踪。部分功能会按用户操作把必要数据发送给小黑盒或用户自行选择的第三方 AI 服务商，具体范围如下。

AI 总结入口默认显示。只有用户配置 AI 接口并点击 AI 总结后，插件才会将当前帖子标题、正文、话题、帖子图片链接和评论文本发送到用户选择并填写的 AI 接口服务商，用于生成总结；如果用户开启“允许表情”，还会随请求提供可用小黑盒表情短码列表。用户点击拉取模型时，插件会向该 AI 服务商请求模型列表。

插件在用户访问小黑盒网页社区时用于调整页面布局并展示评论预览。评论数据来自小黑盒网页自身使用的接口；右侧评论区的评论列表和楼中楼回复查询会先使用去除个人标识后的 Cookie 请求，过滤请求头中的 `heybox_id` 和 `user_heybox_id`，且不携带 `heybox_id` URL 参数。如果请求失败或接口未正常返回，会回退到携带当前 Cookie 和 `heybox_id` URL 参数的正常请求。插件不会临时移除或修改浏览器中的 `heybox_id`、`user_heybox_id` Cookie，避免刷新页面时影响小黑盒网页登录态。点赞、评论和回复等用户主动操作请求会携带浏览器当前页面已有的登录态 Cookie，由浏览器直接发送给小黑盒域名。

## 本地存储

本插件使用浏览器扩展本地存储保存用户主动设置的偏好，包括是否屏蔽 CY 评论、评论/帖子屏蔽关键词列表、等级过滤规则、每个屏蔽关键词在本地生效的次数、AI 总结设置、模型缓存和评论表情使用统计。屏蔽关键词和等级过滤规则仅用于当前浏览器内的内容过滤，不会发送到小黑盒或其他服务器。

AI 总结设置包括是否开启 AI、服务商类型、Base URL、模型、总结提示词、是否允许表情和 API Key。API Key 在小黑盒页面内的插件设置面板中填写，并保存在浏览器扩展本地存储中；由于设置面板运行在网页 JavaScript 主世界，页面脚本理论上可能访问该输入值。API Key 仅在用户拉取模型、测试连通或点击 AI 总结时，由扩展后台随请求发送到用户配置的 AI 接口。

用户可以在插件设置面板中关闭 AI 功能或清空 API Key。卸载扩展会删除扩展本地存储中的设置和密钥。

## 网络请求

插件会请求以下小黑盒接口以展示评论预览：

```text
https://api.xiaoheihe.cn/bbs/app/link/tree
https://api.xiaoheihe.cn/bbs/app/comment/sub/comments
https://api.xiaoheihe.cn/bbs/app/api/emojis/list
https://api.xiaoheihe.cn/bbs/app/comment/support
https://api.xiaoheihe.cn/bbs/app/profile/award/link
https://api.xiaoheihe.cn/bbs/app/user/message
https://api.xiaoheihe.cn/bbs/app/feeds
https://api.xiaoheihe.cn/bbs/app/comment/create
```

请求仅用于获取当前首页帖子对应的评论数据、楼中楼回复、评论表情图片映射、获取 AI 总结和小黑盒表情短码，以及向小黑盒提交用户主动触发的点赞、评论或回复操作。

如果用户配置并使用 AI 总结功能，插件还会请求用户配置的接口：

```text
OpenAI Compatible: {baseUrl}/chat/completions
OpenAI Responses: {baseUrl}/responses
Anthropic: {baseUrl}/messages
Gemini: {baseUrl}/models/{model}:generateContent
```

该请求由扩展后台发起，用于测试连通和生成帖子总结。总结请求内容包含用户当前主动总结的帖子标题、正文、话题、图片链接和最多 30 条评论文本，开启“允许表情”时还包含可用小黑盒表情短码列表。用户点击拉取模型时，插件还会请求对应服务商的模型列表接口，例如 `{baseUrl}/models`。

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

插件申请 `storage` 权限，用于在用户浏览器本地保存 AI 总结设置、模型缓存、屏蔽关键词、等级过滤规则和相关本地偏好。插件申请 `declarativeNetRequestWithHostAccess` 权限，仅用于右侧评论区读取接口发送前替换请求头 Cookie，去除 `heybox_id` 和 `user_heybox_id`。插件申请主机权限以支持用户自定义 AI Base URL 的模型拉取、连通测试和总结请求。

## 联系方式

如需反馈问题，请通过项目仓库或插件发布页提供的反馈入口联系维护者。

