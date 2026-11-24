// 网页端写接口的 _rnd 版本 16：以请求路径、时间戳和 nonce 生成 AES-GCM 签名。
// 本文件由 content 和 background 入口共同复用，请通过 scripts/build-source-bundles.ps1 重新生成入口文件。
  const WORKSHOP_RND_VERSION = "16";
  const WORKSHOP_RND_KEY_BASE64 = "HFFSTsqmvG3uGxPNXDQW+1VARfqgG4nT6LS1PX7F8NQ=";

  async function createWorkshopRndParam(signedParams, pathname) {
    const nonce = String(signedParams?.nonce || "");
    const time = String(signedParams?._time || "");
    const path = String(pathname || "");
    if (!/^(0|[1-9]\d*)$/.test(time)
      || !Number.isSafeInteger(Number(time))
      || !/^[0-9A-F]{32}$/.test(nonce)
      || !path.startsWith("/")
      || /[\s?#\\]/.test(path)
      || /[^\x21-\x7e]/.test(path)
      || !globalThis.crypto?.subtle
      || !globalThis.crypto?.getRandomValues) {
      throw new Error("无法生成 Workshop 接口签名");
    }

    const keyBytes = Uint8Array.from(atob(WORKSHOP_RND_KEY_BASE64), (char) => char.charCodeAt(0));
    const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey("raw", keyBytes, { name: "AES-GCM" }, false, ["encrypt"]);
    const encrypted = await globalThis.crypto.subtle.encrypt({
      name: "AES-GCM",
      iv,
      additionalData: encoder.encode("heybox-rnd:v16"),
      tagLength: 128
    }, key, encoder.encode(JSON.stringify([time, nonce, path.endsWith("/") ? path : `${path}/`])));
    const payload = new Uint8Array(iv.length + encrypted.byteLength);
    payload.set(iv);
    payload.set(new Uint8Array(encrypted), iv.length);
    const encoded = btoa(Array.from(payload, (byte) => String.fromCharCode(byte)).join(""))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${WORKSHOP_RND_VERSION}:${encoded}`;
  }
