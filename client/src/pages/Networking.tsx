import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";
import { queryClient } from "@/lib/queryClient";
import {
  Calendar,
  MapPin,
  Users,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  Wifi,
  Building2,
  Globe,
  Target,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { SiLinkedin, SiFacebook, SiReddit, SiSlack, SiDiscord } from "react-icons/si";

interface NetworkingEvent {
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

interface SocialGroup {
  id: string;
  name: string;
  platform: "LinkedIn" | "Facebook";
  description: string;
  whyRelevant: string;
  url: string;
  memberCount?: string;
}

interface CommunityForum {
  id: string;
  name: string;
  platform: "Reddit" | "Slack" | "Discord" | "Forum" | "Other";
  description: string;
  whyRelevant: string;
  url: string;
}

interface NetworkingRecommendations {
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

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "LinkedIn":
      return <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />;
    case "Facebook":
      return <SiFacebook className="w-4 h-4 text-[#1877F2]" />;
    case "Reddit":
      return <SiReddit className="w-4 h-4 text-[#FF4500]" />;
    case "Slack":
      return <SiSlack className="w-4 h-4 text-[#4A154B]" />;
    case "Discord":
      return <SiDiscord className="w-4 h-4 text-[#5865F2]" />;
    default:
      return <Globe className="w-4 h-4 text-gray-500" />;
  }
}

function EventCard({ event }: { event: NetworkingEvent }) {
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-event-${event.id}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {event.isOnline ? (
                <Badge variant="secondary" className="text-xs flex items-center gap-1">
                  <Wifi className="w-3 h-3" /> Online
                </Badge>
              ) : (
                <Badge variant="outline" className="text-xs flex items-center gap-1">
                  <Building2 className="w-3 h-3" /> In-Person
                </Badge>
              )}
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 bg-orange-50 dark:bg-orange-950/20">
                Eventbrite
              </Badge>
            </div>
            <h4 className="font-semibold text-sm leading-snug mb-1">{event.name}</h4>
            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{event.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3" /> {event.date}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {event.location}
              </span>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded-md px-2 py-1.5">
              <Target className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{event.whyRelevant}</span>
            </div>
          </div>
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-event-${event.id}`}
          >
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              View <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function GroupCard({ group }: { group: SocialGroup }) {
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-group-${group.id}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PlatformIcon platform={group.platform} />
              <Badge variant="outline" className="text-xs">{group.platform}</Badge>
              {group.memberCount && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" /> {group.memberCount}
                </span>
              )}
            </div>
            <h4 className="font-semibold text-sm leading-snug mb-1">{group.name}</h4>
            <p className="text-xs text-muted-foreground mb-2">{group.description}</p>
            <div className="flex items-start gap-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded-md px-2 py-1.5">
              <Target className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{group.whyRelevant}</span>
            </div>
          </div>
          <a
            href={group.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-group-${group.id}`}
          >
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Join <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function ForumCard({ forum }: { forum: CommunityForum }) {
  return (
    <Card className="hover:shadow-md transition-shadow" data-testid={`card-forum-${forum.id}`}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <PlatformIcon platform={forum.platform} />
              <Badge variant="outline" className="text-xs">{forum.platform}</Badge>
            </div>
            <h4 className="font-semibold text-sm leading-snug mb-1">{forum.name}</h4>
            <p className="text-xs text-muted-foreground mb-2">{forum.description}</p>
            <div className="flex items-start gap-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded-md px-2 py-1.5">
              <Target className="w-3 h-3 mt-0.5 shrink-0" />
              <span>{forum.whyRelevant}</span>
            </div>
          </div>
          <a
            href={forum.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`link-forum-${forum.id}`}
          >
            <Button variant="outline" size="sm" className="shrink-0 text-xs">
              Join <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

function SkeletonCard() {
  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-5/6" />
            <Skeleton className="h-8 w-full rounded-md" />
          </div>
          <Skeleton className="h-8 w-16 shrink-0" />
        </div>
      </CardContent>
    </Card>
  );
}

function NetworkingContent() {
  const { user } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, error, isFetching } = useQuery<NetworkingRecommendations>({
    queryKey: ["/api/networking/recommendations"],
    staleTime: 1000 * 60 * 30,
    enabled: !!user,
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await queryClient.invalidateQueries({ queryKey: ["/api/networking/recommendations"] });
    setIsRefreshing(false);
  };

  const ctx = data?.userContext;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-600" />
            Networking Opportunities
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Curated events, groups, and communities matched to your target role and resume gaps.
          </p>
          {ctx && (
            <div className="flex flex-wrap gap-2 mt-2">
              {ctx.targetRole && (
                <Badge variant="secondary" className="text-xs">
                  🎯 {ctx.targetRole}
                </Badge>
              )}
              {ctx.location && (
                <Badge variant="secondary" className="text-xs">
                  <MapPin className="w-3 h-3 mr-1" /> {ctx.location}
                </Badge>
              )}
              {ctx.topGaps.slice(0, 3).map((g, i) => (
                <Badge key={i} variant="outline" className="text-xs text-amber-700 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                  Gap: {g}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading || isFetching || isRefreshing}
          data-testid="button-refresh-networking"
        >
          <RefreshCw className={`w-4 h-4 mr-1.5 ${(isFetching || isRefreshing) ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* No profile warning */}
      {!isLoading && !error && data && !ctx?.targetRole && (
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Add a target role and location to your profile for more personalized recommendations. Upload and analyze a resume to surface your gaps.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            {(error as any).message || "Failed to load recommendations. Please try again."}
          </AlertDescription>
        </Alert>
      )}

      {/* AI label */}
      {!isLoading && data && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="w-3 h-3" />
          <span>Groups and forums are AI-curated — verify links before joining. Events are live from Eventbrite.</span>
        </div>
      )}

      {/* ── Events ─────────────────────────────────────── */}
      <section data-testid="section-events">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            Local &amp; Online Events
            {data?.events.length ? (
              <Badge variant="secondary" className="text-xs ml-1">{data.events.length}</Badge>
            ) : null}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Live events from Eventbrite near you or in your field.</p>
        </CardHeader>
        <div className="space-y-3">
          {isLoading || isFetching
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.events.length
            ? data.events.map((e) => <EventCard key={e.id} event={e} />)
            : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No events found near your location right now. Try updating your location in your profile, or check back later.
                </CardContent>
              </Card>
            )}
        </div>
      </section>

      {/* ── Social Groups ─────────────────────────────── */}
      <section data-testid="section-groups">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
            LinkedIn &amp; Facebook Groups
            {data?.socialGroups.length ? (
              <Badge variant="secondary" className="text-xs ml-1">{data.socialGroups.length}</Badge>
            ) : null}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Professional groups matched to your role and gaps. AI-curated — verify links before joining.</p>
        </CardHeader>
        <div className="space-y-3">
          {isLoading || isFetching
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.socialGroups.length
            ? data.socialGroups.map((g) => <GroupCard key={g.id} group={g} />)
            : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No groups generated yet.
                </CardContent>
              </Card>
            )}
        </div>
      </section>

      {/* ── Forums & Communities ───────────────────────── */}
      <section data-testid="section-forums">
        <CardHeader className="px-0 pt-0 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-500" />
            Forums &amp; Communities
            {data?.forums.length ? (
              <Badge variant="secondary" className="text-xs ml-1">{data.forums.length}</Badge>
            ) : null}
          </CardTitle>
          <p className="text-xs text-muted-foreground">Reddit communities, Slack workspaces, Discord servers, and industry forums. AI-curated.</p>
        </CardHeader>
        <div className="space-y-3">
          {isLoading || isFetching
            ? Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)
            : data?.forums.length
            ? data.forums.map((f) => <ForumCard key={f.id} forum={f} />)
            : (
              <Card>
                <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  No communities generated yet.
                </CardContent>
              </Card>
            )}
        </div>
      </section>

      {data?.generatedAt && (
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {new Date(data.generatedAt).toLocaleString()}
        </p>
      )}
    </div>
  );
}

export default function Networking() {
  return (
    <Layout title="Networking Opportunities" subtitle="Find your people — events, groups, and communities tailored to your career">
      <NetworkingContent />
    </Layout>
  );
}
