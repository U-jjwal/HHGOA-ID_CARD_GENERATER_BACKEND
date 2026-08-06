import { escapeHtml } from './escapeHtml';

interface OgPageParams {
  title: string;
  description: string;
  imageUrl: string;
  pageUrl: string;
  redirectUrl: string;
}

/**
 * Renders a minimal, crawler-friendly HTML page with OG/Twitter meta tags.
 *
 * Social crawlers (X/Twitter, Slack, etc.) do NOT execute JavaScript, so a
 * client-side-rendered React app can never produce a correct link preview -
 * the crawler just sees an empty <div id="root">. This route exists purely
 * to be crawled: it has the tags a bot needs in the raw HTML, and separately
 * bounces real human visitors into the SPA via a meta-refresh + JS redirect
 * (meta-refresh as a no-JS fallback, JS redirect for the common case).
 */
export function renderOgPage(params: OgPageParams): string {
  const title = escapeHtml(params.title);
  const description = escapeHtml(params.description);
  const imageUrl = escapeHtml(params.imageUrl);
  const pageUrl = escapeHtml(params.pageUrl);
  const redirectUrl = escapeHtml(params.redirectUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />

  <meta property="og:type" content="website" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1080" />
  <meta property="og:image:height" content="1080" />
  <meta property="og:url" content="${pageUrl}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />

  <meta http-equiv="refresh" content="0; url=${redirectUrl}" />
  <script>window.location.replace(${JSON.stringify(params.redirectUrl)});</script>
</head>
<body>
  <p>Redirecting to <a href="${redirectUrl}">HH Goa 2026</a>&hellip;</p>
</body>
</html>`;
}
