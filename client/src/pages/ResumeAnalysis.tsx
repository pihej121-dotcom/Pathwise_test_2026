import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ProgressRing } from "@/components/ProgressRing";
import { FeatureGate } from "@/components/FeatureGate";
import { TourButton } from "@/components/TourButton";
import { apiRequest, queryClient as globalQueryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { 
  FileText, 
  TrendingUp, 
  AlertTriangle, 
  Target,
  Book,
  Award,
  Briefcase,
  GraduationCap,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Hash,
  Upload,
  RefreshCw,
  Clock,
  Users,
  Lightbulb,
  BookOpen,
  Tag,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import { ResumeHistoryChart } from "@/components/ResumeHistoryChart";
import { ResumeAnalysisHistory } from "@/components/ResumeAnalysisHistory";
import type { Resume } from "@shared/schema";

export default function ResumeAnalysis({ embedded = false }: { embedded?: boolean }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedResumeId, setSelectedResumeId] = useState<string | undefined>();
  const [showTargetForm, setShowTargetForm] = useState(false);
  const [targetRole, setTargetRole] = useState("");
  const [targetIndustry, setTargetIndustry] = useState("");
  const [targetCompanies, setTargetCompanies] = useState("");
  const [expandedGaps, setExpandedGaps] = useState<Set<number>>(new Set());

  const toggleGap = (idx: number) => {
    setExpandedGaps(prev => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  };

  // Check if user has free tier
  const isFreeUser = user?.subscriptionTier === "free";

  // Handle upgrade to Pro
  const handleUpgrade = async () => {
    try {
      const response = await apiRequest("POST", "/api/stripe/create-checkout-session", {});
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        toast({
          title: "Error",
          description: "Failed to create checkout session",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to start checkout",
        variant: "destructive",
      });
    }
  };

  const { data: resumes = [], isLoading } = useQuery<Resume[]>({
    queryKey: ["/api/resumes"],
  });

  const { data: activeResume = null } = useQuery<Resume | null>({
    queryKey: ["/api/resumes/active"],
  });

  const reanalyzeMutation = useMutation({
    mutationFn: async ({
      resumeId,
      targetRole,
      targetIndustry,
      targetCompanies,
    }: {
      resumeId: string;
      targetRole: string;
      targetIndustry?: string;
      targetCompanies?: string;
    }) => {
      const res = await apiRequest("POST", `/api/resumes/${resumeId}/analyze`, {
        targetRole,
        targetIndustry,
        targetCompanies,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/resumes"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resumes/active"] });
      queryClient.invalidateQueries({ queryKey: ["/api/resume-analysis-history"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Analysis Updated!",
        description: "Your resume has been re-analyzed with the new target criteria.",
      });
      setShowTargetForm(false);
      setTargetRole("");
      setTargetIndustry("");
      setTargetCompanies("");
    },
    onError: (error: any) => {
      toast({
        title: "Re-analysis failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleReanalyze = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!activeResume) {
      toast({
        title: "No resume found",
        description: "Please upload a resume first.",
        variant: "destructive",
      });
      return;
    }

    if (!targetRole.trim()) {
      toast({
        title: "Target role required",
        description: "Please enter a target role to re-analyze your resume.",
        variant: "destructive",
      });
      return;
    }

    reanalyzeMutation.mutate({
      resumeId: activeResume.id,
      targetRole: targetRole.trim(),
      targetIndustry: targetIndustry.trim() || undefined,
      targetCompanies: targetCompanies.trim() || undefined,
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-500/10";
    if (score >= 60) return "bg-yellow-500/10";
    return "bg-red-500/10";
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500 text-white";
      case "medium": return "bg-yellow-500 text-white";
      case "low": return "bg-green-500 text-white";
      default: return "bg-gray-500 text-white";
    }
  };

  const loadingContent = (
    <div className="animate-pulse space-y-6">
      <div className="h-32 bg-muted rounded-lg"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg"></div>
        ))}
      </div>
    </div>
  );

  if (isLoading) {
    return embedded ? loadingContent : (
      <Layout title="Resume Analysis" subtitle="AI-powered resume insights and recommendations">
        {loadingContent}
      </Layout>
    );
  }

  const content = (
    <FeatureGate featureKey="resume_analysis">
      <div className="flex justify-end mb-4">
        <TourButton 
          tourId="resume-analysis"
        />
      </div>
      <div className="space-y-6">
        {/* No Resume Message */}
        {!activeResume && (
          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
            <Upload className="h-4 h-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              No resume uploaded yet.{" "}
              <Link href="/resume-upload">
                <a className="font-medium underline hover:text-blue-900 dark:hover:text-blue-100" data-testid="link-upload-resume">
                  Upload your resume
                </a>
              </Link>
              {" "}to see AI-powered insights and analysis.
            </AlertDescription>
          </Alert>
        )}

        {/* Target Analysis Form */}
        {activeResume && (
          <Card className="border-none shadow-sm bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
            <CardHeader>
              <CardTitle className="text-base font-medium flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" />
                  Generate Analysis for Target Role
                </div>
                {!showTargetForm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowTargetForm(true);
                      setTargetRole((activeResume as any)?.targetRole || "");
                      setTargetIndustry((activeResume as any)?.targetIndustry || "");
                      setTargetCompanies((activeResume as any)?.targetCompanies || "");
                    }}
                    data-testid="button-show-target-form"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Target Criteria
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            {showTargetForm && (
              <CardContent>
                <form onSubmit={handleReanalyze} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="target-role">Target Role *</Label>
                      <Input
                        id="target-role"
                        value={targetRole}
                        onChange={(e) => setTargetRole(e.target.value)}
                        placeholder="e.g., Software Engineer"
                        required
                        data-testid="input-target-role"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-industry">Target Field/Industry</Label>
                      <Input
                        id="target-industry"
                        value={targetIndustry}
                        onChange={(e) => setTargetIndustry(e.target.value)}
                        placeholder="e.g., Technology, Finance"
                        data-testid="input-target-industry"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="target-companies">Target Companies</Label>
                      <Input
                        id="target-companies"
                        value={targetCompanies}
                        onChange={(e) => setTargetCompanies(e.target.value)}
                        placeholder="e.g., Google, Amazon, Meta"
                        data-testid="input-target-companies"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={!targetRole.trim() || reanalyzeMutation.isPending}
                      data-testid="button-reanalyze"
                    >
                      {reanalyzeMutation.isPending ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2" />
                          Generate Analysis
                        </>
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowTargetForm(false);
                        setTargetRole("");
                        setTargetIndustry("");
                        setTargetCompanies("");
                      }}
                      data-testid="button-cancel-target-form"
                    >
                      Cancel
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your target career role, field, and companies to get a personalized analysis of how well your resume matches.
                  </p>
                </form>
              </CardContent>
            )}
          </Card>
        )}

        {/* Active Resume Analysis */}
        {activeResume && (
          <>
            {/* Overall Score Hero */}
            <Card className="border-none shadow-sm bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900/40 dark:to-blue-950/20">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <ProgressRing progress={(activeResume as any)?.rmsScore || 0} size={80} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Overall Match Score</p>
                      <h3 className="text-4xl font-bold" data-testid="overall-score">
                        {(activeResume as any)?.rmsScore || 0}
                        <span className="text-2xl text-muted-foreground">/100</span>
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        {(activeResume as any)?.createdAt ? format(new Date((activeResume as any).createdAt), "MMM d, yyyy") : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex-1 md:border-l md:pl-6 space-y-2">
                    {(activeResume as any)?.overallInsights?.careerFitAssessment && (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1 flex items-center gap-1">
                          <Users className="w-3 h-3" /> Career Fit Assessment
                        </p>
                        <p className="text-sm">{(activeResume as any).overallInsights.careerFitAssessment}</p>
                      </div>
                    )}
                    {(activeResume as any)?.overallInsights?.timeToReady && (
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          Time to competitive: {(activeResume as any).overallInsights.timeToReady}
                        </span>
                      </div>
                    )}
                    {(activeResume as any)?.overallInsights?.competitivePositioning && (
                      <div className="flex items-start gap-2 mt-1">
                        <Target className="w-4 h-4 text-purple-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{(activeResume as any).overallInsights.competitivePositioning}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target Analysis Context */}
            {((activeResume as any)?.targetRole || (activeResume as any)?.targetIndustry || (activeResume as any)?.targetCompanies) && (
              <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <Target className="w-4 h-4" />
                    Analysis Target Context
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(activeResume as any)?.targetRole && (
                      <div className="space-y-1" data-testid="target-role-display">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Target Role</p>
                        <p className="text-sm font-medium">{(activeResume as any).targetRole}</p>
                      </div>
                    )}
                    {(activeResume as any)?.targetIndustry && (
                      <div className="space-y-1" data-testid="target-industry-display">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Target Industry</p>
                        <p className="text-sm font-medium">{(activeResume as any).targetIndustry}</p>
                      </div>
                    )}
                    {(activeResume as any)?.targetCompanies && (
                      <div className="space-y-1" data-testid="target-companies-display">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Target Companies</p>
                        <p className="text-sm font-medium">{(activeResume as any).targetCompanies}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Score Explanation + Recommendations */}
            {(activeResume as any)?.overallInsights && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      Score Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">{(activeResume as any).overallInsights.scoreExplanation}</p>
                    <Separator />
                    <div>
                      <p className="font-medium text-green-700 dark:text-green-400 flex items-center gap-1 mb-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Key Strengths
                      </p>
                      <p className="text-muted-foreground text-xs">{(activeResume as any).overallInsights.strengthsOverview}</p>
                    </div>
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400 flex items-center gap-1 mb-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Key Weaknesses
                      </p>
                      <p className="text-muted-foreground text-xs">{(activeResume as any).overallInsights.weaknessesOverview}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500" />
                      Top Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {((activeResume as any).overallInsights.keyRecommendations || []).map((rec: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-2 text-sm">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-muted-foreground">{rec}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Section Score Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: 'skills', label: 'Skills', icon: <Target className="w-4 h-4" />, score: (activeResume as any)?.skillsScore || 0 },
                { key: 'experience', label: 'Experience', icon: <Briefcase className="w-4 h-4" />, score: (activeResume as any)?.experienceScore || 0 },
                { key: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" />, score: (activeResume as any)?.educationScore || 0 },
                { key: 'keywords', label: 'Keywords', icon: <Hash className="w-4 h-4" />, score: (activeResume as any)?.keywordsScore || 0 },
              ].map(({ key, label, icon, score }) => (
                <Card 
                  key={key}
                  className={`cursor-pointer border-none shadow-sm hover:shadow-md transition-all ${selectedSection === key ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                  onClick={() => setSelectedSection(selectedSection === key ? null : key)}
                  data-testid={`card-${key}`}
                >
                  <CardContent className="pt-6 pb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
                        <p className={`text-xl sm:text-2xl font-semibold ${getScoreColor(score)}`}>{score}</p>
                      </div>
                      <div className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center ${getScoreBgColor(score)}`}>
                        {icon}
                      </div>
                    </div>
                    <Progress value={score} className="h-1.5" />
                    <p className="text-xs text-muted-foreground mt-2">
                      {selectedSection === key ? 'Click to collapse' : 'Click for details'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detailed Section Analysis */}
            {selectedSection && (activeResume as any)?.sectionAnalysis?.[selectedSection] && (() => {
              const sec = (activeResume as any).sectionAnalysis[selectedSection];
              return (
                <Card className="mt-2 border-none shadow-sm" data-testid="section-details">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2 capitalize">
                      {selectedSection === 'skills' && <Target className="w-4 h-4" />}
                      {selectedSection === 'experience' && <Briefcase className="w-4 h-4" />}
                      {selectedSection === 'education' && <GraduationCap className="w-4 h-4" />}
                      {selectedSection === 'keywords' && <Hash className="w-4 h-4" />}
                      {selectedSection} Deep Dive
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Explanation */}
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm" data-testid="section-explanation">{sec.explanation}</p>
                    </div>

                    {/* Keywords specific — present vs missing */}
                    {selectedSection === 'keywords' && (sec.presentKeywords || sec.missingKeywords) && (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {sec.presentKeywords && sec.presentKeywords.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide font-semibold text-green-700 dark:text-green-400 flex items-center gap-1 mb-2">
                              <Tag className="w-3.5 h-3.5" /> Keywords Present
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sec.presentKeywords.map((kw: string, i: number) => (
                                <Badge key={i} variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                        {sec.missingKeywords && sec.missingKeywords.length > 0 && (
                          <div>
                            <p className="text-xs uppercase tracking-wide font-semibold text-red-700 dark:text-red-400 flex items-center gap-1 mb-2">
                              <Tag className="w-3.5 h-3.5" /> Missing Keywords
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {sec.missingKeywords.map((kw: string, i: number) => (
                                <Badge key={i} variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 text-xs">{kw}</Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <Separator />

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-sm">Strengths ({(sec.strengths || []).length})</h4>
                        </div>
                        <ul className="space-y-2" data-testid="section-strengths">
                          {(sec.strengths || []).map((strength: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                              <span className="text-green-600 mt-0.5 flex-shrink-0">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-semibold text-sm">Gaps ({(sec.gaps || []).length})</h4>
                        </div>
                        <ul className="space-y-2" data-testid="section-gaps">
                          {(sec.gaps || []).map((gap: string, idx: number) => (
                            <li key={idx} className="text-sm flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                              <span className="text-amber-600 mt-0.5 flex-shrink-0">!</span>
                              <span>{gap}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-sm">How to Improve</h4>
                      </div>
                      <ul className="space-y-2" data-testid="section-improvements">
                        {(sec.improvements || []).map((improvement: string, idx: number) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-blue-600 mt-0.5 font-bold">→</span>
                            <span>{improvement}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Section Resources */}
                    {sec.resources && sec.resources.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-sm">Recommended Resources to Close These Gaps</h4>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {sec.resources.map((resource: any, resIdx: number) => (
                              <div key={resIdx} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-lg">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{resource.title}</p>
                                  <p className="text-xs text-muted-foreground">{resource.provider}</p>
                                  {resource.cost && (
                                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">{resource.cost}</span>
                                  )}
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="ml-2 flex-shrink-0"
                                  onClick={() => window.open(resource.url, '_blank')}
                                >
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Certifications Score Card */}
            {(activeResume as any)?.certificationsScore !== undefined && (
              <Card
                className={`cursor-pointer border-none shadow-sm hover:shadow-md transition-all ${selectedSection === 'certifications' ? 'bg-primary/5 ring-1 ring-primary/20' : ''}`}
                onClick={() => setSelectedSection(selectedSection === 'certifications' ? null : 'certifications')}
              >
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-9 h-9 flex-shrink-0 rounded-lg flex items-center justify-center ${getScoreBgColor((activeResume as any)?.certificationsScore || 0)}`}>
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Certifications</p>
                        <p className={`text-xl font-semibold ${getScoreColor((activeResume as any)?.certificationsScore || 0)}`}>
                          {(activeResume as any)?.certificationsScore || 0}/100
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={(activeResume as any)?.certificationsScore || 0} className="h-1.5" />
                      </div>
                      {selectedSection === 'certifications' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Certifications Detail */}
            {selectedSection === 'certifications' && (activeResume as any)?.sectionAnalysis?.certifications && (() => {
              const sec = (activeResume as any).sectionAnalysis.certifications;
              return (
                <Card className="border-none shadow-sm" data-testid="section-details-cert">
                  <CardHeader>
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                      <Award className="w-4 h-4" /> Certifications Deep Dive
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="p-4 bg-muted/30 rounded-lg">
                      <p className="text-sm">{sec.explanation}</p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <h4 className="font-semibold text-sm">Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                          {(sec.strengths || []).map((s: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-md bg-green-50 dark:bg-green-950/20 border border-green-100 dark:border-green-900/30">
                              <span className="text-green-600 flex-shrink-0">✓</span><span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle className="w-5 h-5 text-amber-600" />
                          <h4 className="font-semibold text-sm">Gaps</h4>
                        </div>
                        <ul className="space-y-2">
                          {(sec.gaps || []).map((g: string, i: number) => (
                            <li key={i} className="text-sm flex items-start gap-2 p-2 rounded-md bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30">
                              <span className="text-amber-600 flex-shrink-0">!</span><span>{g}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    {sec.resources && sec.resources.length > 0 && (
                      <>
                        <Separator />
                        <div>
                          <div className="flex items-center gap-2 mb-3">
                            <BookOpen className="w-5 h-5 text-purple-600" />
                            <h4 className="font-semibold text-sm">Resources to Get Certified</h4>
                          </div>
                          <div className="grid sm:grid-cols-2 gap-3">
                            {sec.resources.map((resource: any, resIdx: number) => (
                              <div key={resIdx} className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/30 rounded-lg">
                                <div className="min-w-0 flex-1">
                                  <p className="text-sm font-medium truncate">{resource.title}</p>
                                  <p className="text-xs text-muted-foreground">{resource.provider}</p>
                                  {resource.cost && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">{resource.cost}</span>}
                                </div>
                                <Button size="sm" variant="outline" className="ml-2 flex-shrink-0" onClick={() => window.open(resource.url, '_blank')}>
                                  <ExternalLink className="w-3.5 h-3.5" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              );
            })()}

            {/* Gap Action Plan */}
            {(activeResume as any)?.gaps && Array.isArray((activeResume as any)?.gaps) && (activeResume as any)?.gaps.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-medium flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Gap Closure Action Plan
                  </CardTitle>
                  <p className="text-xs text-muted-foreground">
                    These are the most impactful gaps to close — each comes with curated resources to help you get there.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {((activeResume as any)?.gaps || []).map((gap: any, index: number) => (
                      <div 
                        key={index}
                        className="border border-border rounded-lg overflow-hidden"
                        data-testid={`gap-${index}`}
                      >
                        {/* Gap Header - always visible */}
                        <button
                          className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                          onClick={() => toggleGap(index)}
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Badge className={getPriorityColor(gap.priority)}>
                              {gap.priority.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-sm truncate">{gap.category}</span>
                            <span className="text-xs text-green-600 font-medium flex-shrink-0">+{gap.impact} pts</span>
                          </div>
                          {expandedGaps.has(index) ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                          )}
                        </button>

                        {/* Gap Expanded Details */}
                        {expandedGaps.has(index) && (
                          <div className="px-4 pb-4 border-t border-border/50 bg-muted/10">
                            <p className="text-sm text-muted-foreground mt-3 mb-4">{gap.rationale}</p>
                            
                            {gap.resources && gap.resources.length > 0 && (
                              <div>
                                <p className="text-xs uppercase tracking-wide font-semibold text-purple-700 dark:text-purple-400 flex items-center gap-1 mb-3">
                                  <BookOpen className="w-3.5 h-3.5" /> Resources to Close This Gap
                                </p>
                                <div className="grid sm:grid-cols-2 gap-3">
                                  {gap.resources.map((resource: any, resIndex: number) => (
                                    <div 
                                      key={resIndex}
                                      className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-border rounded-lg shadow-sm"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <p className="text-sm font-medium">{resource.title}</p>
                                        <p className="text-xs text-muted-foreground">{resource.provider}</p>
                                        {resource.cost && (
                                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded mt-1 inline-block">
                                            {resource.cost}
                                          </span>
                                        )}
                                      </div>
                                      <Button 
                                        size="sm" 
                                        variant="outline"
                                        className="ml-3 flex-shrink-0 gap-1"
                                        onClick={() => window.open(resource.url, '_blank')}
                                        data-testid={`resource-link-${index}-${resIndex}`}
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                        View
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

          </>
        )}

        {/* Resume History */}
        {(resumes as any[]) && (resumes as any[]).length > 0 && (
          <ResumeHistoryChart 
            resumes={resumes as any[]}
            activeResumeId={(activeResume as any)?.id}
            onSelectResume={(id) => setSelectedResumeId(id)} // 👈 Add this line
          />
        )}

        {/* Resume Analysis History */}
        <div className="mt-8">
          <ResumeAnalysisHistory 
            embedded={true}
            selectedResumeId={selectedResumeId} // 👈 Add this line
          />
        </div>
      </div>
    </FeatureGate>
  );

  return embedded ? content : (
    <Layout title="Resume Analysis" subtitle="AI-powered resume insights and recommendations">
      {content}
    </Layout>
  );
}
