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
- 适配页面的左侧菜单会统一折叠到顶部栏按钮中，点击后展开；点击页面其他区域可关闭菜单。
- 适配页面的原右侧推荐栏会隐藏，释放页面横向空间；帖子详情页不会额外生成右侧评论预览。
- 顶部栏提供收藏入口，可直接跳转到个人收藏内容页。
- 顶部栏设置支持添加评论和帖子屏蔽关键词；帖子关键词会同时匹配正文、分区/话题和分区入口，并在本地记录每个关键词的生效次数。
- 支持在信息流帖子分区/话题标签上右键，确认后快速加入帖子屏蔽关键词。

## 更新记录

### 0.1.3

- 设置中的屏蔽关键词支持按范围添加：评论关键词隐藏评论，帖子关键词会同时匹配正文、分区/话题和分区入口并隐藏命中内容。
- 信息流分区/话题标签支持右键快速屏蔽，会自动加入帖子屏蔽关键词。
- 支持屏蔽插眼评论，屏蔽状态会在多个小黑盒页面和标签页之间共享。
- 屏蔽 CY 开关会在右侧显示本次因 CY 隐藏的评论数量，并保持开关状态回显。
- 支持通过顶部栏设置维护屏蔽关键词，关键词状态和生效次数会在多个小黑盒页面和标签页之间共享。
- 被 CY 或关键词屏蔽的楼中楼回复不会继续撑起“全部 N 条回复”的原始数量。
- 评论预览支持展示评论区图片。
- 评论图片支持点击后在当前页面打开大图预览。
- 同一条评论内多张图片支持左右切换，并支持点击遮罩或按 `Esc` 关闭预览。
- 楼中楼支持点击“全部 N 条回复”继续加载更多回复。
- 话题链接页、个人主页、收藏页和搜索页也会在帖子右侧展示同样的评论预览。
- 搜索页原右侧“黑盒热搜”会移动到左侧可收纳侧边栏。
- 适配页面的左侧菜单统一收到顶部菜单，右侧推荐信息统一隐藏。
- 顶部栏新增收藏入口和设置入口，收藏入口使用五角星图标。

### 0.1.2

- 右侧评论区支持分页滚动加载，第一页和后续页按小黑盒原接口参数请求。
- 评论用户信息复用原站头像、昵称、等级结构，点击可跳转到用户主页。
- 等级标签复用原站 `level-*` 样式，保持不同等级颜色一致。
- 评论内容支持渲染游戏链接，不再把 `<a>` 链接显示成转义文本。
- 支持在右侧评论区给主评论和楼中楼回复点赞。
- 支持在首页帖子底部原点赞区域直接给内容点赞，不需要进入详情页。
- 首页帖子底部会在评论数量左侧显示发布时间。
- 顶部折叠菜单优化了“发布内容”按钮居中，并支持点击页面其他区域关闭。

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
    content.js
```

## 实现说明

插件通过 content script 注入到小黑盒网页中：

- 监听小黑盒 BBS 页面路由变化。
- 首页、帖子详情页、话题链接页、个人主页和搜索页时调整页面布局，移除原右侧推荐栏。
- 识别每条帖子链接 ID，请求评论接口并缓存结果。
- 根据左侧帖子实际高度同步右侧评论预览高度。
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

评论列表接口会按页请求，第一页使用 `is_first=1&page=1`，继续滚动时使用 `is_first=0&page=2/3/...`，每页 `limit=20`。楼中楼更多回复接口使用 `root_comment_id` 和最后一条已展示回复的 `lastval` 继续请求。评论点赞接口使用 `comment_id` 和 `support_type=1` 提交点赞；内容点赞接口使用 `link_id` 和 `award_type=1` 提交点赞。

接口签名参数 `hkey`、`_time`、`nonce` 在 `src/content.js` 中生成。后续如果修改接口参数或签名逻辑，需要同步更新代码里的接口注释和本文档。
评论文本中的表情标记会根据表情列表接口返回的 `code` 和 `img` 映射成图片展示；表情列表只做运行时内存缓存。

## 注意事项

- 插件匹配 `https://www.xiaoheihe.cn/app/bbs`、`https://www.xiaoheihe.cn/app/topic/link`、`https://www.xiaoheihe.cn/app/user/profile`、`https://www.xiaoheihe.cn/app/user/favour`、`https://www.xiaoheihe.cn/app/search` 和它们的子路径。
- 评论接口依赖当前网页登录态，未登录或登录态失效时可能无法展示评论。
- 小黑盒网页结构或接口签名变化时，插件可能需要适配。
- 本项目只在页面内做展示优化，不保存用户 Cookie 或登录凭据。
