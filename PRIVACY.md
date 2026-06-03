# 隐私政策

better-XiaoHeiHe 是一个用于优化小黑盒网页社区首页展示效果的浏览器插件。

## 数据处理

本插件不会收集或出售用户个人数据。AI 总结入口默认开启显示；只有用户配置 AI 接口并点击 AI 总结后，插件才会将当前帖子标题、正文、话题和评论文本发送到用户选择并填写的 AI 接口服务商，用于生成总结。用户点击拉取模型时，插件会向该 AI 服务商请求模型列表。

插件只在用户访问小黑盒网页社区时运行，用于调整页面布局并展示评论预览。评论数据来自小黑盒网页自身使用的接口；右侧评论区的评论列表和楼中楼回复查询会先使用去除个人标识后的 Cookie 请求，过滤请求头中的 `heybox_id` 和 `user_heybox_id`，且不携带 `heybox_id` URL 参数。如果请求失败或接口未正常返回，会回退到携带当前 Cookie 和 `heybox_id` URL 参数的正常请求。插件不会临时移除或修改浏览器中的 `heybox_id`、`user_heybox_id` Cookie，避免刷新页面时影响小黑盒网页登录态。点赞等用户主动操作请求会携带浏览器当前页面已有的登录态 Cookie，由浏览器直接发送给小黑盒域名。

## 本地存储

本插件使用浏览器扩展本地存储保存用户主动设置的偏好，包括是否屏蔽 CY 评论、评论/帖子屏蔽关键词列表、等级过滤规则、每个屏蔽关键词在本地生效的次数，以及 AI 总结设置。屏蔽关键词和等级过滤规则仅用于当前浏览器内的内容过滤，不会发送到小黑盒或其他服务器。

AI 总结设置包括是否开启 AI、服务商类型、Base URL、模型、总结提示词和 API Key。API Key 仅在用户拉取模型、测试连通或点击 AI 总结时，由扩展后台随请求发送到用户配置的 AI 接口。

## 网络请求

插件会请求以下小黑盒接口以展示评论预览：

```text
https://api.xiaoheihe.cn/bbs/app/link/tree
https://api.xiaoheihe.cn/bbs/app/comment/sub/comments
https://api.xiaoheihe.cn/bbs/app/api/emojis/list
https://api.xiaoheihe.cn/bbs/app/comment/support
https://api.xiaoheihe.cn/bbs/app/profile/award/link
```

请求仅用于获取当前首页帖子对应的评论数据、楼中楼回复、评论表情图片映射，以及向小黑盒提交用户主动触发的点赞操作，不会发送到小黑盒以外的服务器。

如果用户配置并使用 AI 总结功能，插件还会请求用户配置的接口：

```text
OpenAI Compatible: {baseUrl}/chat/completions
OpenAI Responses: {baseUrl}/responses
Anthropic: {baseUrl}/messages
Gemini: {baseUrl}/models/{model}:generateContent
```

该请求由扩展后台发起，用于测试连通和生成帖子总结，请求内容包含用户当前主动总结的帖子文本和最多 30 条评论文本；评论超过 30 条时优先选取点赞量更高的评论。用户点击拉取模型时，插件还会请求对应服务商的模型列表接口，例如 `{baseUrl}/models`。

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

插件申请 `storage` 权限，用于在用户浏览器本地保存 AI 总结设置、屏蔽关键词、等级过滤规则和相关本地偏好。插件申请 `declarativeNetRequestWithHostAccess` 权限，仅用于右侧评论区读取接口发送前替换请求头 Cookie，去除 `heybox_id` 和 `user_heybox_id`；插件不申请 `cookies` 权限，也不会移除或修改小黑盒 Cookie。插件申请主机权限以支持用户自定义 AI Base URL 的模型拉取、连通测试和总结请求。

## 联系方式

如需反馈问题，请通过项目仓库或插件发布页提供的反馈入口联系维护者。

