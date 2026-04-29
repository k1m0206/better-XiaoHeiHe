# 更好的小黑盒

一个用于优化小黑盒网页社区首页浏览体验的浏览器插件。

## 功能

- 在小黑盒社区首页的信息流右侧展示评论预览。
- 右侧评论区高度跟随左侧帖子内容，评论过多时在右侧内部裁切，避免撑高帖子列表。
- 评论预览支持展示：
  - 用户头像、昵称、等级
  - 评论内容
  - 发布时间
  - IP 属地
  - 点赞数，并支持直接点赞
  - 楼中楼回复
  - 作者标识
- 评论预览支持滚动加载更多评论。
- 首页左侧菜单会折叠到顶部栏按钮中，点击后展开。
- 详情页保持小黑盒原始布局，不应用首页改造。

## 更新记录

### 0.1.2

- 复用小黑盒原站头像、昵称和等级样式，点击用户信息可跳转到对应主页。
- 右侧评论区支持滚动加载后续评论页。
- 右侧评论区支持对评论点赞。
- 等级标签复用原站 `level-*` 样式，保持不同等级颜色一致。

## 安装调试

1. 打开 Edge 或 Chrome 的扩展管理页面。
2. 开启开发者模式。
3. 选择“加载解压缩的扩展程序”。
4. 选择本项目目录。
5. 打开 `https://www.xiaoheihe.cn/app/bbs/home` 查看效果。

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
    content.js
```

## 实现说明

插件通过 content script 注入到小黑盒网页中：

- 监听小黑盒 BBS 页面路由变化。
- 首页时调整信息流布局，移除原右侧推荐栏。
- 识别每条帖子链接 ID，请求评论接口并缓存结果。
- 根据左侧帖子实际高度同步右侧评论预览高度。
- 离开首页或进入详情页时恢复原始左侧菜单位置。

## 接口说明

评论数据来自小黑盒接口：

```text
GET https://api.xiaoheihe.cn/bbs/app/link/tree
GET https://api.xiaoheihe.cn/bbs/app/api/emojis/list
POST https://api.xiaoheihe.cn/bbs/app/comment/support
```

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

评论列表接口会按页请求，第一页使用 `is_first=1&page=1`，继续滚动时使用 `is_first=0&page=2/3/...`，每页 `limit=20`。评论点赞接口使用 `comment_id` 和 `support_type=1` 提交点赞。

接口签名参数 `hkey`、`_time`、`nonce` 在 `src/content.js` 中生成。后续如果修改接口参数或签名逻辑，需要同步更新代码里的接口注释和本文档。
评论文本中的表情标记会根据表情列表接口返回的 `code` 和 `img` 映射成图片展示；表情列表只做运行时内存缓存。

## 注意事项

- 插件只匹配 `https://www.xiaoheihe.cn/app/bbs` 和其子路径。
- 评论接口依赖当前网页登录态，未登录或登录态失效时可能无法展示评论。
- 小黑盒网页结构或接口签名变化时，插件可能需要适配。
- 本项目只在页面内做展示优化，不保存用户 Cookie 或登录凭据。
