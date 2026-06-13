import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const EVENTBRITE_API_KEY = process.env.EVENTBRITE_API_KEY;

export interface NetworkingEvent {
  id: string;
  name: string;
  description: string;
  whyRelevant: string;
  url: string;
  date: string;
  location: string;
  isOnline: boolean;
  source: "eventbrite";
}

export interface SocialGroup {
  id: string;
  name: string;
  platform: "LinkedIn" | "Facebook";
  description: string;
  whyRelevant: string;
  url: string;
  memberCount?: string;
}

export interface CommunityForum {
  id: string;
  name: string;
  platform: "Reddit" | "Slack" | "Discord" | "Forum" | "Other";
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

async function validateUrl(url: string, timeoutMs = 5000): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(url, {
      method: "HEAD",
      signal: controller.signal,
      redirect: "follow",
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Pathwise/1.0)" },
    });
    clearTimeout(timer);
    return response.status >= 200 && response.status < 400;
  } catch {
    return false;
  }
}

export async function fetchEventbriteEvents(
  targetRole: string,
  industries: string[],
  location: string
): Promise<NetworkingEvent[]> {
  if (!EVENTBRITE_API_KEY) {
    console.warn("EVENTBRITE_API_KEY not set, skipping events fetch");
    return [];
  }

  try {
    const query = [targetRole, ...industries.slice(0, 2)].filter(Boolean).join(" ");
    const params = new URLSearchParams({
      q: query,
      sort_by: "best",
      expand: "venue",
    });

    if (location) {
      params.set("location.address", location);
      params.set("location.within", "50mi");
    }

    const response = await fetch(
      `https://www.eventbriteapi.com/v3/events/search/?${params.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${EVENTBRITE_API_KEY}`,
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error("Eventbrite API error:", response.status, await response.text());
      return [];
    }

    const data = await response.json() as any;
    const rawEvents = (data.events || []).slice(0, 10);

    const mapped: NetworkingEvent[] = rawEvents
      .filter((evt: any) => evt.url && evt.url !== "https://eventbrite.com")
      .map((evt: any, i: number) => {
        const venueName = evt.venue?.name || "";
        const venueCity = evt.venue?.address?.city || "";
        const venueDisplay = evt.venue?.address?.localized_address_display || "";
        const locationStr = evt.online_event
          ? "Online"
          : venueDisplay || venueCity || venueName || location || "Location TBD";

        const startDate = evt.start?.local
          ? new Date(evt.start.local).toLocaleDateString("en-US", {
              weekday: "short",
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "Date TBD";

        const descText: string =
          evt.description?.text ||
          evt.summary ||
          `A professional networking event for ${targetRole} professionals.`;

        return {
          id: evt.id || `eb-${i}`,
          name: evt.name?.text || "Professional Networking Event",
          description: descText.slice(0, 200) + (descText.length > 200 ? "..." : ""),
          whyRelevant: `Relevant to your target role as a ${targetRole}${industries.length ? ` in ${industries[0]}` : ""}.`,
          url: evt.url as string,
          date: startDate,
          location: locationStr,
          isOnline: evt.online_event || false,
          source: "eventbrite" as const,
        };
      });

    const validated = await Promise.all(
      mapped.map(async (evt) => {
        const ok = await validateUrl(evt.url);
        return ok ? evt : null;
      })
    );

    return validated.filter((e): e is NetworkingEvent => e !== null).slice(0, 6);
  } catch (err: any) {
    console.error("Failed to fetch Eventbrite events:", err.message);
    return [];
  }
}

export async function buildSocialGroupSearchLinks(
  targetRole: string,
  industries: string[],
  topGaps: string[]
): Promise<SocialGroup[]> {
  const terms = [targetRole, ...industries.slice(0, 1), ...topGaps.slice(0, 1)]
    .filter(Boolean)
    .join(" ");
  const encoded = encodeURIComponent(terms);

  return [
    {
      id: "sg-linkedin",
      name: `LinkedIn Groups — "${terms}"`,
      platform: "LinkedIn" as const,
      description: `Browse LinkedIn groups for ${targetRole} professionals and related communities.`,
      whyRelevant: `Search results filtered for your target role${industries.length ? ` in ${industries[0]}` : ""}. Join groups to connect with peers and recruiters.`,
      url: `https://www.linkedin.com/search/results/groups/?keywords=${encoded}`,
    },
    {
      id: "sg-facebook",
      name: `Facebook Groups — "${terms}"`,
      platform: "Facebook" as const,
      description: `Discover Facebook groups for ${targetRole} professionals, job seekers, and industry insiders.`,
      whyRelevant: `Facebook hosts many niche career communities${topGaps.length ? ` including groups focused on ${topGaps[0]}` : ""}.`,
      url: `https://www.facebook.com/groups/search/?q=${encoded}`,
    },
  ];
}

export async function fetchValidatedRedditCommunities(
  targetRole: string,
  industries: string[],
  topGaps: string[]
): Promise<CommunityForum[]> {
  if (!process.env.OPENAI_API_KEY) {
    return [];
  }

  const gapsText = topGaps.length
    ? `Resume gaps to address: ${topGaps.slice(0, 5).join(", ")}`
    : "No specific gaps identified.";

  const industriesText = industries.length
    ? `Industries: ${industries.join(", ")}`
    : "";

  const prompt = `You are a career expert. Suggest up to 8 Reddit subreddits that would be genuinely useful for someone targeting a "${targetRole}" role.
${industriesText}
${gapsText}

Rules:
- Only suggest subreddits that DEFINITELY exist (e.g. r/cscareerquestions, r/datascience, r/learnprogramming — well-known, high-traffic subreddits)
- Do NOT invent subreddits. If you are not certain it exists, omit it.
- Format each as exactly: https://reddit.com/r/subredditname (no trailing slash)
- Return a JSON array of objects: [{ "name": "r/subredditname", "description": "one sentence", "whyRelevant": "why this helps with their role or a specific gap" }]
- Return only valid JSON, no markdown`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.2,
    });

    const raw = JSON.parse(response.choices[0].message.content || "{}");
    const candidates: Array<{ name: string; description: string; whyRelevant: string }> =
      Array.isArray(raw) ? raw : (raw.subreddits || raw.communities || raw.forums || []);

    if (!candidates.length) return [];

    const subreddits = candidates.map((c) => {
      const match = c.name.match(/r\/([a-zA-Z0-9_]+)/);
      const slug = match ? match[1] : c.name.replace(/^r\//, "");
      return { ...c, url: `https://www.reddit.com/r/${slug}` };
    });

    const validated = await Promise.all(
      subreddits.map(async (s, i) => {
        const ok = await validateUrl(s.url);
        if (!ok) return null;
        return {
          id: `fo-${i}`,
          name: s.name.startsWith("r/") ? s.name : `r/${s.name}`,
          platform: "Reddit" as const,
          description: s.description,
          whyRelevant: s.whyRelevant,
          url: s.url,
        };
      })
    );

    return validated.filter((f): f is CommunityForum => f !== null);
  } catch (err: any) {
    console.error("Failed to generate Reddit suggestions:", err.message);
    return [];
  }
}

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
    fetchEventbriteEvents(targetRole, industries, location),
    buildSocialGroupSearchLinks(targetRole, industries, topGaps),
    fetchValidatedRedditCommunities(targetRole, industries, topGaps),
  ]);

  return {
    events,
    socialGroups,
    forums,
    generatedAt: new Date().toISOString(),
    userContext: {
      targetRole,
      location,
      topGaps,
    },
  };
}
