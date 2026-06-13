import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

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
  const terms = [targetRole, ...industries.slice(0, 1)].filter(Boolean).join(" ");

  const [liResults, fbResults] = await Promise.all([
    searxSearch(`site:linkedin.com/groups ${terms} professional`),
    searxSearch(`site:facebook.com/groups ${terms}`),
  ]);

  const liCandidates = liResults
    .filter((r) => r.url.includes("linkedin.com/groups"))
    .slice(0, 5);

  const fbCandidates = fbResults
    .filter((r) => r.url.includes("facebook.com/groups"))
    .slice(0, 5);

  const allCandidates: Array<SearXNGResult & { platform: "LinkedIn" | "Facebook" }> = [
    ...liCandidates.map((r) => ({ ...r, platform: "LinkedIn" as const })),
    ...fbCandidates.map((r) => ({ ...r, platform: "Facebook" as const })),
  ];

  const validated = await Promise.all(
    allCandidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;
      return {
        id: `sg-${i}`,
        name: r.title || `${r.platform} Group`,
        platform: r.platform,
        description: (r.content || "").slice(0, 180),
        whyRelevant: `A ${r.platform} community for ${targetRole} professionals${industries.length ? ` in ${industries[0]}` : ""}.`,
        url: r.url,
        requiresLogin: true,
      } satisfies SocialGroup;
    })
  );

  const groups = validated.filter((g): g is SocialGroup => g !== null);

  // If SearXNG returned nothing usable, fall back to real platform search URLs
  if (groups.length === 0) {
    const encoded = encodeURIComponent(terms);
    return [
      {
        id: "sg-li-search",
        name: `Search LinkedIn Groups for "${terms}"`,
        platform: "LinkedIn",
        description: `Browse LinkedIn groups for ${targetRole} professionals.`,
        whyRelevant: `No specific groups were found via search — this takes you directly to LinkedIn's group search for your role.`,
        url: `https://www.linkedin.com/search/results/groups/?keywords=${encoded}`,
        requiresLogin: true,
      },
      {
        id: "sg-fb-search",
        name: `Search Facebook Groups for "${terms}"`,
        platform: "Facebook",
        description: `Discover Facebook groups for ${targetRole} professionals.`,
        whyRelevant: `No specific groups were found via search — this takes you directly to Facebook's group search for your role.`,
        url: `https://www.facebook.com/groups/search/?q=${encoded}`,
        requiresLogin: true,
      },
    ];
  }

  return groups.slice(0, 4);
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

  const [events, socialGroups, forums] = await Promise.all([
    fetchEvents(targetRole, location),
    fetchSocialGroups(targetRole, industries),
    fetchForums(targetRole, topGaps),
  ]);

  return {
    events,
    socialGroups,
    forums,
    generatedAt: new Date().toISOString(),
    userContext: { targetRole, location, topGaps },
  };
}
