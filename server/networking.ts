import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── result cache ──────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const resultCache = new Map<string, { data: NetworkingRecommendations; expiresAt: number }>();

function cacheKey(role: string, industries: string[], location: string): string {
  return [role, ...industries, location].join("|").toLowerCase();
}

function pruneCache(): void {
  const now = Date.now();
  for (const [k, v] of resultCache) {
    if (v.expiresAt < now) resultCache.delete(k);
  }
}

export interface NetworkingEvent {
  id: string;
  name: string;
  description: string;
  whyRelevant: string;
  url: string;
  date: string;
  location: string;
  isOnline: boolean;
  source: "eventbrite" | "meetup" | "other";
}

export interface SocialGroup {
  id: string;
  name: string;
  platform: "LinkedIn" | "Facebook";
  description: string;
  whyRelevant: string;
  url: string;
  requiresLogin?: boolean;
}

export interface CommunityForum {
  id: string;
  name: string;
  platform: "Reddit" | "Discord" | "Slack" | "Forum" | "Other";
  description: string;
  whyRelevant: string;
  url: string;
}

export interface NetworkingRecommendations {
  events: NetworkingEvent[];
  socialGroups: SocialGroup[];
  forums: CommunityForum[];
  generatedAt: string;
  userContext: {
    targetRole: string;
    location: string;
    topGaps: string[];
  };
}

interface SearXNGResult {
  url: string;
  title: string;
  content: string;
  engine?: string;
}

// ── helpers ──────────────────────────────────────────────────────────────────

async function validateUrl(url: string, timeoutMs = 6000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const res = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Pathwise/1.0)" },
    });
    clearTimeout(timer);
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  }
}

async function searxSearch(query: string, timeoutMs = 10000): Promise<SearXNGResult[]> {
  const base = process.env.SEARXNG_URL;
  if (!base) {
    console.warn("SEARXNG_URL not set");
    return [];
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url = `${base}/search?q=${encodeURIComponent(query)}&format=json`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timer);

    if (res.status === 403) {
      console.error(
        "SearXNG returned 403 — JSON format may not be enabled in settings.yml. " +
        "Add 'json' to search.formats in your SearXNG instance."
      );
      return [];
    }
    if (!res.ok) {
      console.error(`SearXNG error: ${res.status}`);
      return [];
    }

    const data = await res.json() as { results?: SearXNGResult[] };
    return data.results || [];
  } catch (err: any) {
    console.error("SearXNG fetch failed:", err.message);
    return [];
  }
}

function inferPlatform(url: string): string {
  if (url.includes("reddit.com")) return "Reddit";
  if (url.includes("discord.com") || url.includes("discord.gg")) return "Discord";
  if (url.includes("slack.com")) return "Slack";
  if (url.includes("linkedin.com")) return "LinkedIn";
  if (url.includes("facebook.com")) return "Facebook";
  if (url.includes("eventbrite.com")) return "Eventbrite";
  if (url.includes("meetup.com")) return "Meetup";
  return "Other";
}

// ── events ───────────────────────────────────────────────────────────────────

export async function fetchEvents(
  targetRole: string,
  location: string
): Promise<NetworkingEvent[]> {
  const loc = location || "online";

  const [ebResults, muResults] = await Promise.all([
    searxSearch(`site:eventbrite.com ${targetRole} networking ${loc}`),
    searxSearch(`site:meetup.com ${targetRole} ${loc}`),
  ]);

  const candidates = [
    ...ebResults.slice(0, 6).map((r) => ({ ...r, source: "eventbrite" as const })),
    ...muResults.slice(0, 6).map((r) => ({ ...r, source: "meetup" as const })),
  ].filter(
    (r) =>
      r.url &&
      (r.url.includes("eventbrite.com/e/") || r.url.includes("meetup.com/"))
  );

  const validated = await Promise.all(
    candidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;

      const isOnline =
        r.title.toLowerCase().includes("online") ||
        r.title.toLowerCase().includes("virtual") ||
        r.url.includes("online");

      return {
        id: `ev-${i}`,
        name: r.title || "Networking Event",
        description: (r.content || "").slice(0, 200),
        whyRelevant: `Found for "${targetRole}" professionals${location ? ` in ${location}` : ""}.`,
        url: r.url,
        date: "See event page",
        location: isOnline ? "Online" : location || "See event page",
        isOnline,
        source: r.source,
      } satisfies NetworkingEvent;
    })
  );

  return validated.filter((e): e is NetworkingEvent => e !== null).slice(0, 5);
}

// ── social groups ─────────────────────────────────────────────────────────────

export async function fetchSocialGroups(
  targetRole: string,
  industries: string[]
): Promise<SocialGroup[]> {
  // LinkedIn only — always return a pre-filled search link (no SearXNG, no 200-check).
  // Query is role/topic only; location is intentionally excluded for groups.
  // encodeURIComponent ensures spaces become %20, not +.
  const terms = [targetRole, ...industries.slice(0, 1)].filter(Boolean).join(" ");
  const encoded = encodeURIComponent(terms);

  return [
    {
      id: "sg-linkedin",
      name: `LinkedIn Groups — ${terms}`,
      platform: "LinkedIn",
      description: `Browse LinkedIn groups for ${targetRole} professionals and related communities.`,
      whyRelevant: `Connects you with peers, recruiters, and industry insiders in the ${targetRole} space${industries.length ? ` (${industries[0]})` : ""}.`,
      url: `https://www.linkedin.com/search/results/groups/?keywords=${encoded}`,
      requiresLogin: true,
    },
  ];
}

// ── forums ────────────────────────────────────────────────────────────────────

export async function fetchForums(
  targetRole: string,
  topGaps: string[]
): Promise<CommunityForum[]> {
  const gapTerm = topGaps.length ? topGaps[0] : "";

  const [redditResults, discordResults, slackResults] = await Promise.all([
    searxSearch(`site:reddit.com ${targetRole} ${gapTerm} community`),
    searxSearch(`${targetRole} discord community server`),
    searxSearch(`${targetRole} slack community workspace`),
  ]);

  const candidates: Array<SearXNGResult & { inferredPlatform: string }> = [
    ...redditResults
      .filter((r) => /reddit\.com\/r\/[a-zA-Z0-9_]+\/?$/.test(r.url))
      .slice(0, 6)
      .map((r) => ({ ...r, inferredPlatform: "Reddit" })),
    ...discordResults
      .filter((r) => r.url.includes("discord.com") || r.url.includes("discord.gg"))
      .slice(0, 3)
      .map((r) => ({ ...r, inferredPlatform: "Discord" })),
    ...slackResults
      .filter((r) => r.url.includes("slack.com"))
      .slice(0, 3)
      .map((r) => ({ ...r, inferredPlatform: "Slack" })),
  ];

  const validated = await Promise.all(
    candidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;

      const platform = r.inferredPlatform as CommunityForum["platform"];
      return {
        id: `fo-${i}`,
        name: r.title || `${platform} Community`,
        platform,
        description: (r.content || "").slice(0, 180),
        whyRelevant:
          gapTerm
            ? `Relevant to your gap in ${gapTerm} and your target role as a ${targetRole}.`
            : `A ${platform} community for ${targetRole} professionals.`,
        url: r.url,
      } satisfies CommunityForum;
    })
  );

  return validated.filter((f): f is CommunityForum => f !== null).slice(0, 6);
}

// ── main export ───────────────────────────────────────────────────────────────

export async function getNetworkingRecommendations(
  targetRole: string,
  industries: string[],
  gaps: any[],
  location: string
): Promise<NetworkingRecommendations> {
  const topGaps = Array.isArray(gaps)
    ? gaps
        .filter((g) => g && (g.area || g.skill || g.description))
        .slice(0, 5)
        .map((g) => g.area || g.skill || g.description || String(g))
    : [];

  const key = cacheKey(targetRole, industries, location);
  const cached = resultCache.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[networking] cache hit for "${key}"`);
    return cached.data;
  }

  const [events, socialGroups, forums] = await Promise.all([
    fetchEvents(targetRole, location),
    fetchSocialGroups(targetRole, industries),
    fetchForums(targetRole, topGaps),
  ]);

  const result: NetworkingRecommendations = {
    events,
    socialGroups,
    forums,
    generatedAt: new Date().toISOString(),
    userContext: { targetRole, location, topGaps },
  };

  pruneCache();
  resultCache.set(key, { data: result, expiresAt: Date.now() + CACHE_TTL_MS });
  console.log(`[networking] cached result for "${key}" (expires in 30 min)`);

  return result;
}
