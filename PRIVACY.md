# 隐私政策

better-XiaoHeiHe 是一个用于优化小黑盒网页社区首页展示效果的浏览器插件。

## 数据处理

本插件不会收集或出售用户个人数据。AI 总结功能默认关闭；用户主动开启并配置 AI 接口后，插件会将当前帖子标题、正文、话题和评论文本发送到用户填写的 AI 接口服务商，用于生成总结。

插件只在用户访问小黑盒网页社区时运行，用于调整页面布局并展示评论预览。评论数据来自小黑盒网页自身使用的接口，请求会携带浏览器当前页面已有的登录态 Cookie，由浏览器直接发送给小黑盒域名。

## 本地存储

本插件使用 `localStorage` 在当前浏览器本地保存用户主动设置的偏好，包括是否屏蔽 CY 评论、评论屏蔽关键词列表，以及每个屏蔽关键词在本地生效的次数。屏蔽关键词仅用于当前浏览器内的评论过滤，不会发送到小黑盒或其他服务器。

AI 设置使用浏览器扩展存储保存在本地，包括是否开启 AI、Base URL、模型和 API Key。API Key 仅在用户测试连通或点击 AI 总结时随请求发送到用户配置的 AI 接口。

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

如果用户开启 AI 总结功能，插件还会请求用户配置的接口：

```text
{baseUrl}/chat/completions
```

该请求用于测试连通和生成帖子总结，请求内容包含用户当前主动总结的帖子和评论文本。

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

插件申请 `storage` 权限，用于保存 AI 设置。插件申请主机权限以支持用户自定义 AI Base URL 的连通测试和总结请求。

## 联系方式

如需反馈问题，请通过项目仓库或插件发布页提供的反馈入口联系维护者。

