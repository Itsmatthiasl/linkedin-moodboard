/**
 * LinkedIn's official "Embed this post" widget is served from
 * linkedin.com/embed/feed/update/urn:li:<type>:<id> and allows framing
 * (unlike the main site). We only need the URN, which is recoverable
 * from every public post URL shape LinkedIn issues.
 */
export function extractLinkedInEmbedUrl(rawUrl: string): string | null {
  let url: URL;
  try {
    url = new URL(rawUrl.trim());
  } catch {
    return null;
  }

  if (!/(^|\.)linkedin\.com$/.test(url.hostname)) return null;

  const urnMatch = url.pathname.match(/urn:li:(activity|share|ugcPost):(\d+)/);
  if (urnMatch) {
    return `https://www.linkedin.com/embed/feed/update/urn:li:${urnMatch[1]}:${urnMatch[2]}`;
  }

  const activityMatch = url.pathname.match(/activity-(\d+)/);
  if (activityMatch) {
    return `https://www.linkedin.com/embed/feed/update/urn:li:activity:${activityMatch[1]}`;
  }

  return null;
}
