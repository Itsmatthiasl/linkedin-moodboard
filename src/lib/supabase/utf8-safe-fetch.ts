/**
 * Vercel's Node.js runtime has a bug where undici's fetch throws
 * "Cannot convert argument to a ByteString" for a JSON string body that
 * contains characters outside Latin-1 (e.g. a bullet in a password),
 * even though the Fetch spec doesn't restrict body content — only header
 * values. Not reproducible on a local Node install. Pre-encoding the body
 * to a Buffer of UTF-8 bytes sidesteps whatever internal path mishandles
 * the string case.
 */
export const utf8SafeFetch: typeof fetch = (input, init) => {
  const bodyType = init?.body == null ? "none" : typeof init.body;
  console.error("[utf8SafeFetch]", {
    url: String(input),
    bodyType,
    bodyIsBuffer: init?.body instanceof Uint8Array,
  });
  if (init?.body && typeof init.body === "string") {
    return fetch(input, { ...init, body: Buffer.from(init.body, "utf-8") });
  }
  return fetch(input, init);
};
