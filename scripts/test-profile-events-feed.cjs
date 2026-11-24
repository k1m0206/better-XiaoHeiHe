const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const readSource = (file) => readFileSync(path.join(root, file), "utf8");

function createFeedContext() {
  const updatedFallbackImages = [];
  const commentCache = new Map();
  const context = vm.createContext({
    URL,
    window: { location: { href: "https://www.xiaoheihe.cn/app/user/profile/23075420" } },
    commentCache,
    updateFeedItemFallbackImages(linkId, detail) {
      updatedFallbackImages.push({ linkId, detail });
    },
    uniqueStrings: (arr) => Array.from(new Set((arr || []).filter(Boolean))),
    parseLinkRichText: () => ({ content: "", imageUrls: [] }),
    getLinkCreateTime: (link) => link?.create_at || ""
  });

  const state = readSource("src/content/state.js");
  for (const name of ["API_ORIGIN", "FEEDS_API_PATH", "PROFILE_EVENTS_API_PATH"]) {
    const declaration = state.match(new RegExp(`const ${name} = [^;]+;`));
    assert.ok(declaration, `缺少常量 ${name}`);
    vm.runInContext(declaration[0], context);
  }

  // comment-cache.js 末尾的 delay 函数头在源分块中跨文件闭合，测试中补全函数体以独立执行
  const commentCacheSource = readSource("src/content/comment-cache.js") + "\n    return Promise.resolve();\n  }";
  vm.runInContext(commentCacheSource, context);
  vm.runInContext(readSource("src/content/request-context.js"), context);

  return { context, commentCache, updatedFallbackImages };
}

test("isFeedApiUrl 能够正确识别 /bbs/app/feeds 和 /bbs/app/profile/events 接口", () => {
  const { context } = createFeedContext();
  const isFeedApiUrl = context.isFeedApiUrl;

  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/feeds"), true);
  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/feeds/"), true);
  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/feeds?limit=20"), true);
  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/profile/events?list_type=moment&userid=23075420"), true);
  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/profile/events/"), true);
  assert.equal(isFeedApiUrl("https://api.xiaoheihe.cn/bbs/app/profile/award/link"), false);
  assert.equal(isFeedApiUrl("https://other.domain.com/bbs/app/profile/events"), false);
});

test("cacheFeedApiData 能够解析 profile/events 的 moments 并提取图片与作者等级", () => {
  const { context, commentCache, updatedFallbackImages } = createFeedContext();
  const cacheFeedApiData = context.cacheFeedApiData;

  cacheFeedApiData({
    msg: "",
    result: {
      moments: [
        {
          linkid: 185526794,
          userid: 23075420,
          title: "《更好的小黑盒》插件交流群👥",
          description: "方便大家交流，下方加入⬇",
          create_at: 1783755479,
          imgs: [
            "https://imgheybox1.max-c.com/bbs/2026/07/11/test.webp"
          ],
          thumbs: [
            "https://imgheybox1.max-c.com/bbs/2026/07/11/thumb.webp"
          ],
          share_url: "https://api.xiaoheihe.cn/v3/bbs/app/api/web/share?h_camp=link&h_src=YXBwX3NoYXJl&link_id=e88872249ce7",
          user: {
            username: "故事的小黄花kim",
            level_info: { level: 20 }
          }
        },
        {
          linkid: 197619277,
          title: "汉斯新版中文配音",
          has_video: 1,
          video_info: {
            thumb: "https://imgheybox1.max-c.com/video/thumb.webp"
          },
          user: {
            username: "故事的小黄花kim",
            level_info: { level: 20 }
          }
        }
      ]
    }
  });

  const numericEntry = commentCache.get("185526794");
  assert.ok(numericEntry, "应缓存数字 linkid 记录");
  assert.deepEqual([...numericEntry.linkDetail.feedImageUrls], ["https://imgheybox1.max-c.com/bbs/2026/07/11/test.webp"]);
  assert.deepEqual([...numericEntry.linkDetail.feedThumbnailUrls], ["https://imgheybox1.max-c.com/bbs/2026/07/11/thumb.webp"]);
  assert.equal(numericEntry.linkDetail.author, "故事的小黄花kim");
  assert.equal(numericEntry.linkDetail.authorLevel, "Lv.20");
  assert.equal(numericEntry.linkCreateAt, 1783755479);

  const shareEntry = commentCache.get("e88872249ce7");
  assert.ok(shareEntry, "应兼容缓存 share_url 中的字母数字 link_id 记录");
  assert.deepEqual([...shareEntry.linkDetail.feedImageUrls], ["https://imgheybox1.max-c.com/bbs/2026/07/11/test.webp"]);

  const videoEntry = commentCache.get("197619277");
  assert.ok(videoEntry, "应缓存视频动态");
  assert.deepEqual([...videoEntry.linkDetail.feedImageUrls], ["https://imgheybox1.max-c.com/video/thumb.webp"], "视频封面应作为图片兜底");

  assert.ok(updatedFallbackImages.some((u) => u.linkId === "185526794"), "应触发 DOM 兜底图片刷新");
});
