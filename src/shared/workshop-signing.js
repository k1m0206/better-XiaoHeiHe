// Workshop 写接口附加签名。当前网页端以版本 15 的 HMAC-SHA256 生成 _rnd。
// 本文件由 content 和 background 入口共同复用，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const WORKSHOP_RND_VERSION = "15";
  const WORKSHOP_RND_SECRET = "Z7mFG4tQp9Ws2LxB8H";

  async function createWorkshopRndParam(signedParams) {
    const nonce = String(signedParams?.nonce || "");
    const time = String(signedParams?._time || "");
    if (!nonce || !time || !globalThis.crypto?.subtle) {
      throw new Error("无法生成 Workshop 接口签名");
    }

    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
      "raw",
      encoder.encode(WORKSHOP_RND_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signature = await globalThis.crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`${WORKSHOP_RND_SECRET}${nonce}${time}:${nonce}`)
    );
    const hex = Array.from(new Uint8Array(signature))
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("");
    return `${WORKSHOP_RND_VERSION}:${hex}`;
  }
