# 隐私政策

better-XiaoHeiHe 是一个用于优化小黑盒网页社区首页展示效果的浏览器插件。

## 数据处理

本插件不会收集、存储、出售或向第三方传输用户个人数据。

插件只在用户访问小黑盒网页社区时运行，用于调整页面布局并展示评论预览。评论数据来自小黑盒网页自身使用的接口，请求会携带浏览器当前页面已有的登录态 Cookie，由浏览器直接发送给小黑盒域名。

## 本地存储

本插件当前不使用 `chrome.storage`、`localStorage`、`IndexedDB` 或其他持久化存储保存用户数据。

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

## 权限说明

插件仅通过 content script 匹配小黑盒网页社区路径：

```text
https://www.xiaoheihe.cn/app/bbs
https://www.xiaoheihe.cn/app/bbs/*
```

插件不申请额外浏览器权限。

## 联系方式

如需反馈问题，请通过项目仓库或插件发布页提供的反馈入口联系维护者。

