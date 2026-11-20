/**
 * Bing / IndexNow integration for https://naisiaetextiles.com
 * Verification file: public/90cada1f1bd1423984db2a609d09d79c.txt
 * Vercel environment variable: INDEXNOW_KEY=90cada1f1bd1423984db2a609d09d79c
 */
const SITE_HOST = "naisiaetextiles.com";
const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export async function notifyIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key) throw new Error("Missing INDEXNOW_KEY environment variable.");

  const validUrls = [...new Set(urls)].filter((value) => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" &&
        (url.hostname === SITE_HOST || url.hostname === `www.${SITE_HOST}`);
    } catch {
      return false;
    }
  });
  if (validUrls.length === 0) return;

  for (let i = 0; i < validUrls.length; i += 10_000) {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: SITE_HOST,
        key,
        keyLocation: `https://${SITE_HOST}/${key}.txt`,
        urlList: validUrls.slice(i, i + 10_000),
      }),
      cache: "no-store",
    });
    if (!response.ok) {
      const details = await response.text().catch(() => "");
      throw new Error(`IndexNow submission failed (${response.status}): ${details}`);
    }
  }
}
