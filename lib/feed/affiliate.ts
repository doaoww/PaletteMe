export type AffiliateEnv = {
  AFFILIATE_ENABLED?: string;
  AFFILIATE_NETWORK?: string;
  RAKUTEN_SITE_ID?: string;
  RAKUTEN_ASOS_MID?: string;
  AWIN_PUBLISHER_ID?: string;
  AWIN_ASOS_MID?: string;
  AMAZON_ASSOCIATE_TAG?: string;
};

export function buildAffiliateUrl(originalUrl: string, env: AffiliateEnv = process.env as AffiliateEnv): string {
  if (!isAffiliateEnabled(env)) return originalUrl;

  let url: URL;
  try {
    url = new URL(originalUrl);
  } catch {
    return originalUrl;
  }

  if (isAlreadyAffiliateUrl(url)) return originalUrl;
  if (isAmazonUrl(url)) return withAmazonTag(url, env) ?? originalUrl;
  if (!isAsosUrl(url)) return originalUrl;

  const network = env.AFFILIATE_NETWORK?.trim().toLowerCase();
  if (network === "rakuten") return withRakutenDeepLink(originalUrl, env) ?? originalUrl;
  if (network === "awin") return withAwinDeepLink(originalUrl, env) ?? originalUrl;

  return withAwinDeepLink(originalUrl, env) ?? withRakutenDeepLink(originalUrl, env) ?? originalUrl;
}

function isAffiliateEnabled(env: AffiliateEnv): boolean {
  const value = env.AFFILIATE_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "yes";
}

function isAlreadyAffiliateUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === "www.awin1.com" || host === "awin1.com" || host.endsWith("linksynergy.com");
}

function isAsosUrl(url: URL): boolean {
  return url.hostname.toLowerCase().endsWith("asos.com");
}

function isAmazonUrl(url: URL): boolean {
  const host = url.hostname.toLowerCase();
  return host === "amazon.com" || host.endsWith(".amazon.com");
}

function withAmazonTag(url: URL, env: AffiliateEnv): string | null {
  const tag = env.AMAZON_ASSOCIATE_TAG?.trim();
  if (!tag) return null;
  const next = new URL(url.toString());
  next.searchParams.set("tag", tag);
  return next.toString();
}

function withAwinDeepLink(originalUrl: string, env: AffiliateEnv): string | null {
  const publisherId = env.AWIN_PUBLISHER_ID?.trim();
  const merchantId = env.AWIN_ASOS_MID?.trim();
  if (!publisherId || !merchantId) return null;

  const url = new URL("https://www.awin1.com/cread.php");
  url.searchParams.set("awinaffid", publisherId);
  url.searchParams.set("awinmid", merchantId);
  url.searchParams.set("ued", originalUrl);
  return url.toString();
}

function withRakutenDeepLink(originalUrl: string, env: AffiliateEnv): string | null {
  const siteId = env.RAKUTEN_SITE_ID?.trim();
  const merchantId = env.RAKUTEN_ASOS_MID?.trim();
  if (!siteId || !merchantId) return null;

  const url = new URL("https://click.linksynergy.com/deeplink");
  url.searchParams.set("id", siteId);
  url.searchParams.set("mid", merchantId);
  url.searchParams.set("murl", originalUrl);
  return url.toString();
}
