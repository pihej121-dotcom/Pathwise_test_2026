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
    const rawEvents = (data.events || []).slice(0, 8);

    const events: NetworkingEvent[] = rawEvents.map((evt: any, i: number) => {
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
        url: evt.url || "https://eventbrite.com",
        date: startDate,
        location: locationStr,
        isOnline: evt.online_event || false,
        source: "eventbrite" as const,
      };
    });

    return events;
  } catch (err: any) {
    console.error("Failed to fetch Eventbrite events:", err.message);
    return [];
  }
}

export async function generateCommunityRecommendations(
  targetRole: string,
  industries: string[],
  topGaps: string[],
  location: string
): Promise<{ socialGroups: SocialGroup[]; forums: CommunityForum[] }> {
  if (!process.env.OPENAI_API_KEY) {
    return { socialGroups: [], forums: [] };
  }

  const gapsText = topGaps.length
    ? `Resume gaps to address: ${topGaps.slice(0, 5).join(", ")}`
    : "No specific gaps identified yet.";

  const industriesText = industries.length
    ? `Industries of interest: ${industries.join(", ")}`
    : "";

  const prompt = `You are a career networking expert. Based on the user's profile below, recommend highly specific and niche professional communities — NOT generic ones like "LinkedIn general networking."

User profile:
- Target role: ${targetRole}
- ${industriesText}
- ${gapsText}
- Location: ${location || "Not specified"}

Return a JSON object with exactly this structure:
{
  "socialGroups": [
    {
      "name": "exact group name",
      "platform": "LinkedIn" or "Facebook",
      "description": "1-sentence description of what the group is about",
      "whyRelevant": "specific reason tied to their target role OR one of their gaps — mention the gap explicitly",
      "url": "direct URL to the group (real, verifiable URL)",
      "memberCount": "approximate member count if known, else omit"
    }
  ],
  "forums": [
    {
      "name": "exact community name",
      "platform": "Reddit" | "Slack" | "Discord" | "Forum" | "Other",
      "description": "1-sentence description",
      "whyRelevant": "specific reason tied to their target role OR one of their gaps — mention the gap explicitly",
      "url": "direct URL"
    }
  ]
}

Rules:
- Return exactly 5 socialGroups and 6 forums
- Prioritize niche, specific communities over broad ones
- Every "whyRelevant" MUST reference either the target role (${targetRole}) or a specific gap from: ${topGaps.slice(0, 5).join(", ") || "general career development"}
- For Reddit: use format https://reddit.com/r/subredditname
- For Discord: use invite links or community landing pages
- For Slack: use the community's join page
- URLs must be real and currently active
- Return only valid JSON, no markdown`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.4,
  });

  const raw = JSON.parse(response.choices[0].message.content || "{}");

  const socialGroups: SocialGroup[] = (raw.socialGroups || []).map(
    (g: any, i: number) => ({
      id: `sg-${i}`,
      name: g.name || "Professional Group",
      platform: g.platform === "Facebook" ? "Facebook" : "LinkedIn",
      description: g.description || "",
      whyRelevant: g.whyRelevant || "",
      url: g.url || "https://linkedin.com",
      memberCount: g.memberCount,
    })
  );

  const forums: CommunityForum[] = (raw.forums || []).map(
    (f: any, i: number) => ({
      id: `fo-${i}`,
      name: f.name || "Professional Community",
      platform: (["Reddit", "Slack", "Discord", "Forum"].includes(f.platform)
        ? f.platform
        : "Other") as CommunityForum["platform"],
      description: f.description || "",
      whyRelevant: f.whyRelevant || "",
      url: f.url || "https://reddit.com",
    })
  );

  return { socialGroups, forums };
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

  const [events, { socialGroups, forums }] = await Promise.all([
    fetchEventbriteEvents(targetRole, industries, location),
    generateCommunityRecommendations(targetRole, industries, topGaps, location),
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
