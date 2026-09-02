// 离线运行真实请求构造代码；fetch 仅为桩函数，不读取或使用真实登录凭据。
const assert = require("node:assert/strict");
const { createHmac, webcrypto } = require("node:crypto");
const { readFileSync } = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const readSource = (file) => readFileSync(path.join(root, file), "utf8");

function createContext(fetch = () => { throw new Error("未预期的网络请求"); }) {
  const context = vm.createContext({
    crypto: webcrypto,
    TextEncoder,
    URLSearchParams,
    fetch,
    captureExistingApiEntries() {},
    getCookie: () => "fixture-cookie-id",
    capturedApiParams: { heybox_id: "fixture-captured-id", web_version: "2.5" },
    CAPTURED_API_PARAM_KEYS: ["heybox_id", "web_version"]
  });
  // 读取实际常量，避免测试桩掩盖生产域名或路径的变更。
  const state = readSource("src/content/state.js");
  for (const name of ["API_ORIGIN", "WORKSHOP_API_ORIGIN", "COMMENT_CREATE_API_PATH"]) {
    const declaration = state.match(new RegExp(`const ${name} = [^;]+;`));
    assert.ok(declaration, `缺少常量 ${name}`);
    vm.runInContext(declaration[0], context);
  }
  for (const file of ["src/shared/workshop-signing.js", "src/content/api-signing.js"]) {
    vm.runInContext(readSource(file), context, { filename: file });
  }
  // feed.js 与前一模块存在跨文件函数边界，只加载完整的表单发送函数。
  const feed = readSource("src/content/feed.js");
  const start = feed.indexOf("  function postCommentApiForm(");
  const end = feed.indexOf("  function requestCommentUploadInfo(", start);
  assert.ok(start >= 0 && end > start, "找不到表单发送函数");
  vm.runInContext(feed.slice(start, end), context);
  return context;
}

test("评论创建使用 api 域名，参数对齐网页且不携带身份 ID", async () => {
  const context = createContext();
  const url = new URL(await context.buildCommentCreateApiUrl());
  assert.equal(url.origin, "https://api.xiaoheihe.cn");
  assert.equal(url.pathname, "/bbs/app/comment/create");
  const params = Object.fromEntries(url.searchParams);
  const { hkey, _time, nonce, _rnd, ...base } = params;
  assert.deepEqual(base, {
    app: "heybox", os_type: "web", x_app: "heybox_website",
    x_client_type: "web", x_os_type: "Windows", x_client_version: "",
    client_type: "web", web_version: "3.0", version: "999.0.4"
  });
  assert.match(hkey, /^[A-Z0-9]{7}$/);
  assert.match(nonce, /^[A-F0-9]{32}$/);
  assert.ok(Math.abs(Number(_time) - Math.floor(Date.now() / 1000)) < 5);
  const key = vm.runInContext("WORKSHOP_RND_SECRET", context);
  const expected = createHmac("sha256", key)
    .update(`${key}${nonce}${_time}:${nonce}`).digest("hex");
  assert.equal(_rnd, `15:${expected}`);
});

test("每次创建请求都重新生成签名", async () => {
  const context = createContext();
  vm.runInContext("let testTime = 1780000000000; Date.now = () => testTime;", context);
  const first = new URL(await context.buildCommentCreateApiUrl()).searchParams;
  vm.runInContext("testTime += 1000;", context);
  const second = new URL(await context.buildCommentCreateApiUrl()).searchParams;
  assert.equal(Number(second.get("_time")), Number(first.get("_time")) + 1);
  assert.notEqual(second.get("nonce"), first.get("nonce"));
  assert.notEqual(second.get("_rnd"), first.get("_rnd"));
});

for (const [label, target] of [
  ["主评论", { reply_id: "-1", root_id: "-1" }],
  ["楼中楼回复", { reply_id: "1002", root_id: "1001" }]
]) {
  test(`${label}以表单 POST 发送，保留 Cookie、表情及特殊字符`, async () => {
    const calls = [];
    const response = { status: "ok", commentid: "fixture-comment" };
    const context = createContext(async (url, options) => {
      calls.push({ url, options });
      return { json: async () => response };
    });
    const url = await context.buildCommentCreateApiUrl();
    const body = { is_cy: "0", link_id: "1000", ...target, text: "测试 [cube_傲娇助手] & + %\n第二行" };
    assert.equal(await context.postCommentApiForm(url, body), response);
    assert.equal(calls.length, 1);
    const call = calls[0];
    assert.equal(call.url, url);
    assert.equal(call.options.method, "POST");
    assert.equal(call.options.credentials, "include");
    assert.equal(call.options.headers["content-type"], "application/x-www-form-urlencoded;charset=utf-8");
    assert.deepEqual(Object.fromEntries(new URLSearchParams(call.options.body)), body);
  });
}

test("网络失败时不自动重发评论", async () => {
  let calls = 0;
  const error = new Error("模拟网络失败");
  const context = createContext(async () => { calls++; throw error; });
  await assert.rejects(context.postCommentApiForm(await context.buildCommentCreateApiUrl(), {
    is_cy: "0", link_id: "1000", reply_id: "-1", root_id: "-1", text: "离线测试"
  }), (actual) => actual === error);
  assert.equal(calls, 1);
});
