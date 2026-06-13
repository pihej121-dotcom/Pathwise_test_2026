import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── result cache ──────────────────────────────────────────────────────────────
const CACHE_TTL_MS = 30 * 60 * 1000;
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

// ── interfaces ────────────────────────────────────────────────────────────────

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
  platform: "LinkedIn";
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

export interface UserNetworkingProfile {
  targetRole: string;
  industries: string[];
  topGaps: string[];
  location: string;
  background?: string;   // free-text from intake (major, school/company, experience level, etc.)
  resumeText?: string;   // optional resume paste
}

interface SearchKeywords {
  groupKeywords: string;   // for LinkedIn URL + Reddit/Discord/Slack SearXNG
  eventKeywords: string;   // for Eventbrite/Meetup SearXNG (location appended at search time)
}

interface SearXNGResult {
  url: string;
  title: string;
  content: string;
}

// ── GPT keyword generation ────────────────────────────────────────────────────

export async function generateSearchKeywords(
  profile: UserNetworkingProfile
): Promise<SearchKeywords> {
  const contextParts = [
    `Target role: ${profile.targetRole}`,
    profile.industries.length ? `Industries of interest: ${profile.industries.join(", ")}` : "",
    profile.background ? `Background (may include school year, major, university, company, experience level): ${profile.background}` : "",
    profile.topGaps.length ? `Skills to develop: ${profile.topGaps.slice(0, 4).join(", ")}` : "",
    profile.resumeText ? `Resume excerpt: ${profile.resumeText.slice(0, 600)}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = `You are a career expert generating search keywords for networking recommendations.

User profile:
${contextParts}

From the background description and resume excerpt, extract whatever is relevant (major/field, school or company, experience level, career stage) to inform the keywords. Do NOT ask for missing information — work with what's provided.

Generate two search keyword phrases:

1. GROUP/COMMUNITY keywords: For LinkedIn groups, Reddit, Discord, and Slack. Topic/role focused — NO location. Use professional terminology relevant to their career stage and field.

2. EVENT keywords: For Eventbrite and Meetup event searches. Topic/role focused — NO location (location is appended separately by the backend).

Rules:
- Output ONLY keyword strings — no URLs, no descriptions, no explanations.
- Each phrase should be 3–6 words, suitable as a search engine query.
- Keep them specific, not generic ("machine learning engineers" > "tech professionals").

Return exactly this JSON:
{
  "groupKeywords": "3-6 word phrase for community search",
  "eventKeywords": "3-6 word phrase for event search"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      groupKeywords: result.groupKeywords || profile.targetRole,
      eventKeywords: result.eventKeywords || profile.targetRole,
    };
  } catch (err: any) {
    console.error("[networking] keyword generation failed:", err.message);
    return {
      groupKeywords: profile.targetRole,
      eventKeywords: profile.targetRole,
    };
  }
}

// ── helpers ───────────────────────────────────────────────────────────────────

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
    const res = await fetch(
      `${base}/search?q=${encodeURIComponent(query)}&format=json`,
      { signal: controller.signal, headers: { Accept: "application/json" } }
    );
    clearTimeout(timer);
    if (res.status === 403) {
      console.error("SearXNG 403 — enable json in settings.yml: search.formats: [html, json]");
      return [];
    }
    if (!res.ok) { console.error(`SearXNG error: ${res.status}`); return []; }
    const data = await res.json() as { results?: SearXNGResult[] };
    return data.results || [];
  } catch (err: any) {
    console.error("SearXNG fetch failed:", err.message);
    return [];
  }
}

// ── events ────────────────────────────────────────────────────────────────────

export async function fetchEvents(
  eventKeywords: string,
  location: string
): Promise<NetworkingEvent[]> {
  const locSuffix = location ? ` ${location}` : "";

  const [ebResults, muResults] = await Promise.all([
    searxSearch(`site:eventbrite.com ${eventKeywords}${locSuffix}`),
    searxSearch(`site:meetup.com ${eventKeywords}${locSuffix}`),
  ]);

  const candidates = [
    ...ebResults.slice(0, 6).map((r) => ({ ...r, source: "eventbrite" as const })),
    ...muResults.slice(0, 6).map((r) => ({ ...r, source: "meetup" as const })),
  ].filter(
    (r) => r.url && (r.url.includes("eventbrite.com/e/") || r.url.includes("meetup.com/"))
  );

  const validated = await Promise.all(
    candidates.map(async (r, i) => {
      const ok = await validateUrl(r.url);
      if (!ok) return null;
      const isOnline =
        r.title.toLowerCase().includes("online") ||
        r.title.toLowerCase().includes("virtual");
      return {
        id: `ev-${i}`,
        name: r.title || "Networking Event",
        description: (r.content || "").slice(0, 200),
        whyRelevant: `Found for "${eventKeywords}"${location ? ` near ${location}` : ""}.`,
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

// ── social groups (LinkedIn pre-filled search — no SearXNG, no 200-check) ─────

export async function fetchSocialGroups(
  groupKeywords: string,
  targetRole: string,
  industries: string[]
): Promise<SocialGroup[]> {
  const encoded = encodeURIComponent(groupKeywords);
  return [
    {
      id: "sg-linkedin",
      name: `LinkedIn Groups — ${groupKeywords}`,
      platform: "LinkedIn",
      description: `Browse LinkedIn groups for ${targetRole} professionals and related communities.`,
      whyRelevant: `Connects you with peers, recruiters, and industry insiders in the ${targetRole} space${industries.length ? ` (${industries[0]})` : ""}.`,
      url: `https://www.linkedin.com/search/results/groups/?keywords=${encoded}`,
      requiresLogin: true,
    },
  ];
}

// ── forums (Reddit + Discord/Slack via SearXNG, validated) ───────────────────

export async function fetchForums(
  groupKeywords: string,
  targetRole: string,
  topGaps: string[]
): Promise<CommunityForum[]> {
  const [redditResults, discordResults, slackResults] = await Promise.all([
    searxSearch(`site:reddit.com ${groupKeywords}`),
    searxSearch(`${groupKeywords} discord community server`),
    searxSearch(`${groupKeywords} slack community workspace`),
  ]);

  const gapTerm = topGaps.length ? topGaps[0] : "";

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
        whyRelevant: gapTerm
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
  location: string,
  force = false,
  profileExtras: Partial<UserNetworkingProfile> = {}
): Promise<NetworkingRecommendations> {
  const topGaps = Array.isArray(gaps)
    ? gaps
        .filter((g) => g && (g.area || g.skill || g.description))
        .slice(0, 5)
        .map((g) => g.area || g.skill || g.description || String(g))
    : [];

  const key = cacheKey(targetRole, industries, location);

  if (!force) {
    const cached = resultCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
      console.log(`[networking] cache hit for "${key}"`);
      return cached.data;
    }
  } else {
    console.log(`[networking] force refresh for "${key}"`);
  }

  const profile: UserNetworkingProfile = {
    targetRole,
    industries,
    topGaps,
    location,
    ...profileExtras,
  };

  const { groupKeywords, eventKeywords } = await generateSearchKeywords(profile);
  console.log(`[networking] keywords — group: "${groupKeywords}", events: "${eventKeywords}"`);

  const [events, socialGroups, forums] = await Promise.all([
    fetchEvents(eventKeywords, location),
    fetchSocialGroups(groupKeywords, targetRole, industries),
    fetchForums(groupKeywords, targetRole, topGaps),
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
  console.log(`[networking] cached for "${key}" (30 min)`);

  return result;
}
