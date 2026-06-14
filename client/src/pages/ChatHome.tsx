import React, { useState, useRef, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Send,
  Paperclip,
  Sparkles,
  ArrowRight,
  User,
  Bot,
  Loader2,
  X,
  Link2,
  ExternalLink,
  FolderOpen,
  LogOut,
  FileText,
  Route,
  Briefcase,
  Zap,
  MessageSquare,
  ChevronDown,
  ClipboardList,
  Clock,
  RotateCcw,
  TrendingUp,
  Download,
  CheckCircle2,
  DollarSign,
  Users,
  Calendar,
  MapPin,
  Target,
  Globe,
  Wifi,
  Building2,
  RefreshCw,
  Video,
  Menu,
  Plus,
  Search,
} from "lucide-react";
import { SiLinkedin, SiReddit, SiSlack, SiDiscord } from "react-icons/si";
import MockInterviewPanel, { type InterviewQuestion, type SessionAnswer } from "@/components/MockInterviewPanel";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";

type ConversationState =
  | "idle"
  | "collecting"
  | "resume_upload"
  | "job_details"
  | "job_posting"
  | "generating_match"
  | "generating_docs"
  | "targeting"
  | "generating"
  | "networking_intake"
  | "mock_interview_intake"
  | "complete";

interface NetworkingIntake {
  steps: string[];
  stepIndex: number;
  collected: {
    targetRole?: string;
    background?: string;
    location?: string;
    resumeText?: string;
  };
}

interface NetworkingParams {
  intakeRole?: string;
  intakeBackground?: string;
  intakeLocation?: string;
  intakeResumeText?: string;
}

type GoalType = "competitiveness" | "job_match" | "readiness" | "roadmap" | "interview" | "projects" | "resume_score" | "salary_negotiation" | "career_match" | "mock_interview" | "general" | null;

type UserProfile = {
  background: string; // raw answer to the background question
  schoolYear?: string;
  yearsOfExperience?: string;
  major?: string;
  university?: string;
  company?: string;
};

type CollectedData = {
  userMessage: string;
  goal: GoalType;
  answers: Record<string, string>;
  resumeText: string;
  jobDetails: string;
  // targeting fields for resume score
  targetRole: string;
  targetIndustry: string;
  targetCompanies: string;
  preferredLocation: string;
  targetingStep: number;
  // job match documents
  tailoredResume: string;
  tailoredCoverLetter: string;
};

interface NetworkingEvent {
  id: string; name: string; description: string; whyRelevant: string;
  url: string; date: string; location: string; isOnline: boolean;
  source: "eventbrite" | "meetup" | "other";
}
interface SocialGroup {
  id: string; name: string; platform: "LinkedIn";
  description: string; whyRelevant: string; url: string;
  requiresLogin?: boolean;
}
interface CommunityForum {
  id: string; name: string; platform: "Reddit" | "Slack" | "Discord" | "Forum" | "Other";
  description: string; whyRelevant: string; url: string;
}
interface NetworkingRecommendations {
  events: NetworkingEvent[]; socialGroups: SocialGroup[]; forums: CommunityForum[];
  generatedAt: string; userContext: { targetRole: string; location: string; topGaps: string[] };
}

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  networkingData?: NetworkingRecommendations;
  mockInterviewData?: { questions: InterviewQuestion[]; role: string };
};

// Targeting questions specifically for resume score flow
const RESUME_SCORE_TARGETING_QUESTIONS = [
  { key: "targetRole", question: "What is your target role or career? (e.g. Software Engineer, Product Manager, Data Analyst)" },
  { key: "targetIndustry", question: "What industry or field are you targeting? (e.g. Technology, Finance, Healthcare, Marketing)" },
  { key: "targetCompanies", question: "What type of companies are you targeting? You can name specific companies or describe the type. (e.g. Google, startups, mid-size tech firms, Fortune 500)" },
  { key: "preferredLocation", question: "Any preferred location or work arrangement? (e.g. New York, remote, open to relocation — type \"skip\" to skip)" },
];

const FOLLOW_UP_QUESTIONS: Record<string, { key: string; question: string }[]> = {
  job_match: [
    { key: "background", question: "Tell me a bit about yourself — what's your school year (or years of experience), major/field, and university (or current company)?" },
    { key: "goal", question: "What specific outcome are you hoping for from this analysis?" },
  ],
  competitiveness: [
    { key: "background", question: "Tell me a bit about your background — what's your current school year, major, and university?" },
    { key: "target", question: "What specific job title or company are you targeting?" },
  ],
  readiness: [
    { key: "background", question: "What's your current school year, major, and university?" },
    { key: "target", question: "What career, role, or industry are you trying to break into?" },
  ],
  roadmap: [
    { key: "background", question: "Tell me about yourself — school year, major, and university?" },
    { key: "goal", question: "What role or career are you aiming for in the next 3–6 months?" },
    { key: "timeline", question: "Any specific deadlines or milestones? (e.g. graduation, internship season)" },
  ],
  interview: [
    { key: "background", question: "What's your background — school year, major, and university?" },
    { key: "role", question: "What role or company are you interviewing for? Paste any job details if you have them." },
    { key: "type", question: "What type of interview is it? (e.g. behavioral, technical, case study)" },
  ],
  projects: [
    { key: "background", question: "Tell me your background — school year, major, and university?" },
    { key: "skills", question: "What skills or tools are you looking to build or practice?" },
    { key: "goal", question: "What's your end goal? (e.g. build a portfolio, land a specific role, learn something new)" },
  ],
  resume_score: [
    { key: "background", question: "Tell me a bit about yourself — what's your school year (or years of experience), major/field, and university (or current company)?" },
  ],
  general: [
    { key: "background", question: "Tell me a bit about yourself — school year, major, and university?" },
    { key: "goal", question: "What specific outcome are you hoping for from our conversation?" },
  ],
  salary_negotiation: [
    { key: "negotiation_type", question: "Great! First, what type of negotiation is this?\n\n**A)** New job offer\n**B)** Promotion or raise at current job\n\nJust reply A or B." },
    { key: "current_role", question: "What is your current job title and company? (If this is a new offer, describe your most recent or current role.)" },
    { key: "target_role", question: "What is the target role or title you're negotiating for? (e.g. 'Senior Software Engineer at Stripe' or 'Promotion to VP of Marketing')" },
    { key: "location", question: "What city/region is this role based in, and is it remote, hybrid, or in-office? (Location affects market rates significantly.)" },
    { key: "years_experience", question: "How many years of total work experience do you have? And how many years specifically in this type of role or field?" },
    { key: "current_salary", question: "What is your current base salary (or most recent if you're transitioning)? Include any bonuses or equity if relevant." },
    { key: "offer_or_desired", question: "What is the offer amount or the salary you're hoping to achieve? (Include base salary, bonus targets, equity, or other compensation if known.)" },
    { key: "benefits", question: "What benefits or perks are included (or expected)? Think about: health insurance, 401k match, PTO, remote work stipend, signing bonus, equity/RSUs, etc. Type 'skip' if you're focused on base only." },
    { key: "competing_offers", question: "Do you have any competing offers or outside options? If yes, briefly describe them. If not, type 'none'. (Competing offers are powerful leverage.)" },
    { key: "performance_or_strengths", question: "What makes your case strong? Examples: recent wins, performance reviews, skills hard to find, certifications, measurable impact, or market data you've researched." },
    { key: "constraints_deadlines", question: "Are there any constraints or deadlines I should know about? For example: offer expiry date, financial needs, relocation requirements, or anything else that limits your flexibility. Type 'none' if not applicable." },
  ],
};

function detectGoal(message: string): GoalType {
  const lower = message.toLowerCase();
  if (lower.match(/salary|negotiat|raise|promotion|pay|compensation|offer.*negot|counter.?offer|increment|wage|pay.?raise|pay.?increase/)) return "salary_negotiation";
  if (lower.match(/career match|what careers fit|careers for me|career suggestions|best career.*me|careers based on|suggest.*careers|what should i do with my|careers.*resume|match.*career/)) return "career_match";
  if (lower.match(/job match|match.*job|match.*position|match.*role|fit.*job|qualify.*job|how.*competitive|stack up|apply to|job posting|hiring/)) return "job_match";
  if (lower.match(/competi|qualify|fit for/)) return "competitiveness";
  if (lower.match(/readiness|ready|career readiness|assess|prepared/)) return "readiness";
  if (lower.match(/roadmap|plan|next steps|action plan|3.?month|6.?month|path/)) return "roadmap";
  if (lower.match(/interview|prep|practice|behav|technical interview|case study/)) return "interview";
  if (lower.match(/project|portfolio|build|practice project|side project/)) return "projects";
  if (lower.match(/score|analyze.*resume|resume.*analys|feedback.*resume|resume.*feedback|rate.*resume|resume.*rate/)) return "resume_score";
  return "general";
}

const STARTER_PROMPTS = [
  "I want to know how competitive I am for a product manager role",
  "Help me build a career roadmap for breaking into tech",
  "I have an interview at Google next week — help me prep",
  "Am I ready for a data analyst role?",
  "Suggest some portfolio projects for a marketing career",
];

const CHAT_HISTORY_KEY = "pathwise_chat_sessions";
const MAX_SAVED_SESSIONS = 5;

type SavedSession = {
  id: string;
  prompt: string;
  timestamp: number;
  messages: Message[];
};

function loadSavedSessions(userId: string): SavedSession[] {
  try {
    const raw = localStorage.getItem(`${CHAT_HISTORY_KEY}_${userId}`);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSession[];
  } catch {
    return [];
  }
}

function saveSession(userId: string, prompt: string, messages: Message[]) {
  try {
    const sessions = loadSavedSessions(userId);
    const newSession: SavedSession = {
      id: Date.now().toString(),
      prompt,
      timestamp: Date.now(),
      messages,
    };
    // Prepend and keep only MAX_SAVED_SESSIONS
    const updated = [newSession, ...sessions].slice(0, MAX_SAVED_SESSIONS);
    localStorage.setItem(`${CHAT_HISTORY_KEY}_${userId}`, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:0ms]" />
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:150ms]" />
      <span className="w-2 h-2 rounded-full bg-primary/60 animate-bounce [animation-delay:300ms]" />
    </div>
  );
}

export default function ChatHome() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Fetch resume analysis history for logged-in users
  const { data: resumeHistory } = useQuery<any[]>({
    queryKey: ["/api/resume-analysis-history"],
    enabled: !!user,
  });

  // Fetch active resume for score display
  const { data: activeResume } = useQuery<any>({
    queryKey: ["/api/resumes/active"],
    enabled: !!user,
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<ConversationState>("idle");
  const [data, setData] = useState<CollectedData>({
    userMessage: "",
    goal: null,
    answers: {},
    resumeText: "",
    jobDetails: "",
    targetRole: "",
    targetIndustry: "",
    targetCompanies: "",
    preferredLocation: "",
    targetingStep: 0,
    tailoredResume: "",
    tailoredCoverLetter: "",
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem("sidebarCollapsed") === "true");
  const [sidebarSearch, setSidebarSearch] = useState("");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [currentSessionPrompt, setCurrentSessionPrompt] = useState<string>("");
  const [resumeScore, setResumeScore] = useState<number | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  // Load saved sessions when user is available
  useEffect(() => {
    if (user) {
      setSavedSessions(loadSavedSessions(user.id));
    }
  }, [user?.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const networkingIntakeRef = useRef<NetworkingIntake | null>(null);
  const networkingParamsRef = useRef<NetworkingParams>({});
  const mockInterviewIntakeRef = useRef<{ step: number; role?: string } | null>(null);
  const mockInterviewRoleRef = useRef<string>("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const addMessage = (role: "user" | "assistant", content: string) => {
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role, content, timestamp: new Date() },
    ]);
  };

  const simulateAssistantReply = (content: string, delay = 800) => {
    setIsTyping(true);
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        setIsTyping(false);
        addMessage("assistant", content);
        resolve();
      }, delay);
    });
  };

  const handleInitialMessage = async (text: string) => {
    addMessage("user", text);
    const goal = detectGoal(text);

    // Career Match: skip background questions, go straight to resume upload
    if (goal === "career_match") {
      setData((prev) => ({ ...prev, userMessage: text, goal, answers: {} }));
      setState("resume_upload");
      setCurrentSessionPrompt(text);
      await simulateAssistantReply(
        "I'll scan your resume and match you with careers that genuinely fit your background — no target role needed.\n\nPlease share your resume — upload a file (PDF, DOCX, TXT) or paste the text directly below."
      );
      return;
    }

    const allQuestions = FOLLOW_UP_QUESTIONS[goal!] || FOLLOW_UP_QUESTIONS.general;

    // If we already have user profile, pre-fill the background answer and skip that question
    let startIndex = 0;
    let prefilledAnswers: Record<string, string> = {};
    if (userProfile?.background) {
      const backgroundQuestion = allQuestions.find((q) => q.key === "background");
      if (backgroundQuestion) {
        prefilledAnswers = { background: userProfile.background };
        startIndex = allQuestions.findIndex((q) => q.key !== "background");
        if (startIndex === -1) startIndex = allQuestions.length; // all questions are background
      }
    }

    setData((prev) => ({ ...prev, userMessage: text, goal, answers: prefilledAnswers }));
    setState("collecting");
    setQuestionIndex(startIndex);
    setCurrentSessionPrompt(text);

    const remainingQuestions = allQuestions.slice(startIndex);

    if (userProfile?.background && remainingQuestions.length === 0) {
      // All questions answered (only background was needed) — go straight to resume upload
      const resumePrompt = (goal === "job_match")
        ? `Welcome back! I already know your background — ${userProfile.background}.\n\nPlease share your resume — upload a file or paste the text below.\n\nAfter your resume, I'll ask for the specific job posting.`
        : `Welcome back! I already know your background — ${userProfile.background}.\n\nAlmost there! Please share your resume — upload a file or paste the text below.\n\nIf you don't have one ready, just type "skip".`;
      setState("resume_upload");
      await simulateAssistantReply(resumePrompt);
    } else if (userProfile?.background && remainingQuestions.length > 0) {
      await simulateAssistantReply(
        `Welcome back! I already have your background on file *(${userProfile.background})*.\n\n${remainingQuestions[0].question}`
      );
    } else {
      await simulateAssistantReply(
        `Got it! I can help with that. Let me ask you a couple of quick questions so I can give you a personalized response.\n\n${allQuestions[0].question}`
      );
    }
  };

  // ── networking intake helpers ────────────────────────────────────────────────

  function getIntakeQuestion(step: string): string {
    switch (step) {
      case "role":
        return "What role are you targeting? *(e.g. Software Engineer, Product Manager, Data Analyst)*";
      case "background":
        return "Tell me a bit about yourself — what's your school year (or years of experience), major/field, and university (or current company)?";
      case "location":
        return "What city or area should I search for local events in?";
      case "resume":
        return "Almost there! Please share your resume — upload a file or paste the text directly below.\n\nIf you don't have one ready, just type **skip**.";
      default:
        return "Tell me a bit more about your background.";
    }
  }

  // Networking intake always asks all questions from scratch — no DB lookups.
  function buildIntakeSteps(): string[] {
    return ["role", "background", "location", "resume"];
  }

  const doFetchNetworking = async (forceRefresh = false) => {
    setState("generating");
    setIsTyping(true);
    try {
      const params = networkingParamsRef.current;
      const res = await fetch("/api/networking/recommendations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          force: forceRefresh,
          intakeRole: params.intakeRole,
          intakeBackground: params.intakeBackground,
          intakeLocation: params.intakeLocation,
          intakeResumeText: params.intakeResumeText,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to fetch networking recommendations");
      }
      const rec: NetworkingRecommendations = await res.json();
      setIsTyping(false);
      const ctx = rec.userContext;
      const intro = `Here are personalised networking opportunities for **${ctx.targetRole || "your career"}**${ctx.location ? ` near ${ctx.location}` : ""}${ctx.topGaps.length ? `, focusing on your development areas: *${ctx.topGaps.slice(0, 3).join(", ")}*` : ""}.`;
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: "assistant",
          content: intro,
          timestamp: new Date(),
          networkingData: rec,
        },
      ]);
      setState("complete");
    } catch (err: any) {
      setIsTyping(false);
      await simulateAssistantReply(`Sorry, I couldn't load networking recommendations right now. ${err.message || "Please try again."}`);
      setState("complete");
    }
  };

  const handleNetworkingIntakeAnswer = async (text: string) => {
    const intake = networkingIntakeRef.current;
    if (!intake) return;

    const step = intake.steps[intake.stepIndex];

    switch (step) {
      case "role":
        intake.collected.targetRole = text;
        break;
      case "background":
        intake.collected.background = text;
        break;
      case "location":
        intake.collected.location = text;
        break;
      case "resume":
        intake.collected.resumeText = text.toLowerCase() === "skip" ? "" : text;
        break;
    }

    intake.stepIndex += 1;

    if (intake.stepIndex < intake.steps.length) {
      await simulateAssistantReply(getIntakeQuestion(intake.steps[intake.stepIndex]));
      return;
    }

    // All answered — store in session ref (not DB) and fetch
    networkingParamsRef.current = {
      intakeRole: intake.collected.targetRole,
      intakeBackground: intake.collected.background,
      intakeLocation: intake.collected.location,
      intakeResumeText: intake.collected.resumeText || undefined,
    };
    networkingIntakeRef.current = null;

    await simulateAssistantReply("Got it! Let me find the best networking opportunities for you…", 400);
    await doFetchNetworking();
  };

  const handleNetworkingClick = async () => {
    addMessage("user", "Find me networking opportunities — events, groups, and communities for my career");
    setCurrentSessionPrompt("Find me networking opportunities");

    networkingParamsRef.current = {};
    const steps = buildIntakeSteps();
    networkingIntakeRef.current = { steps, stepIndex: 0, collected: {} };
    setState("networking_intake");

    await simulateAssistantReply(
      `I'll find networking opportunities tailored to your profile. Just a few quick questions first!\n\n${getIntakeQuestion(steps[0])}`
    );
  };

  // ── Mock Interview handlers ──────────────────────────────────────────────

  const handleMockInterviewClick = async () => {
    addMessage("user", "I want to practice a mock interview");
    setCurrentSessionPrompt("Mock Interview session");
    mockInterviewIntakeRef.current = { step: 0 };
    setState("mock_interview_intake");
    await simulateAssistantReply(
      "Let's set up your mock interview! I'll ask questions one at a time, record your answers, and give you a full critique at the end.\n\n**What role are you preparing for?** *(e.g. Software Engineer, Product Manager, Data Analyst)*"
    );
  };

  const handleMockInterviewIntakeAnswer = async (text: string) => {
    const intake = mockInterviewIntakeRef.current;
    if (!intake) return;

    if (intake.step === 0) {
      intake.role = text;
      intake.step = 1;
      await simulateAssistantReply(
        `Got it — **${text}** interview. What type of questions would you like?\n\n- **behavioral** — past experiences & teamwork\n- **technical** — role-specific skills & knowledge\n- **situational** — hypothetical problem-solving\n- **mix** — a blend of all three`
      );
    } else {
      const raw = text.toLowerCase();
      const category =
        raw.includes("tech") ? "technical"
        : raw.includes("situ") ? "situational"
        : raw.includes("behav") ? "behavioral"
        : raw.includes("mix") || raw.includes("all") || raw.includes("blend") ? "mix"
        : "behavioral";

      const role = intake.role || "Professional";
      mockInterviewRoleRef.current = role;
      mockInterviewIntakeRef.current = null;

      await simulateAssistantReply("Generating your interview questions…", 400);
      setState("generating");
      setIsTyping(true);

      try {
        const res = await fetch("/api/mock-interview/generate-questions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
          },
          body: JSON.stringify({ role, category, count: 5 }),
        });
        if (!res.ok) {
          const e = await res.json().catch(() => ({}));
          throw new Error(e.error || "Failed to generate questions");
        }
        const questions: InterviewQuestion[] = await res.json();
        setIsTyping(false);
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now().toString(),
            role: "assistant",
            content: `Here are your **5 ${category === "mix" ? "mixed" : category} interview questions** for a **${role}** role. Each question will be shown on screen and can be read aloud. Record your answer, then move to the next. Your full critique will appear when the session is complete.`,
            timestamp: new Date(),
            mockInterviewData: { questions, role },
          },
        ]);
        setState("complete");
      } catch (err: any) {
        setIsTyping(false);
        await simulateAssistantReply(
          `Sorry, I couldn't generate interview questions. ${err.message || "Please try again."}`
        );
        setState("complete");
      }
    }
  };

  const handleMockInterviewSessionComplete = async (answers: SessionAnswer[]) => {
    setState("generating");
    setIsTyping(true);
    try {
      const res = await fetch("/api/mock-interview/critique", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ role: mockInterviewRoleRef.current, answers }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Critique failed");
      }
      const { critique } = await res.json();
      setIsTyping(false);
      addMessage("assistant", critique);
      setState("complete");
      if (user) {
        setMessages((prev) => {
          const updated = saveSession(user.id, currentSessionPrompt, prev);
          setSavedSessions(updated);
          return prev;
        });
      }
    } catch (err: any) {
      setIsTyping(false);
      await simulateAssistantReply(
        `Sorry, I couldn't generate your critique. ${err.message || "Please try again."}`
      );
      setState("complete");
    }
  };

  const resumeSession = (session: SavedSession) => {
    setMessages(session.messages);
    setCurrentSessionPrompt(session.prompt);
    setState("complete");
    setActiveSessionId(session.id);
  };

  const handleCollectingAnswer = async (text: string) => {
    const goal = data.goal || "general";
    const questions = FOLLOW_UP_QUESTIONS[goal] || FOLLOW_UP_QUESTIONS.general;
    const currentQ = questions[questionIndex];

    const newAnswers = { ...data.answers, [currentQ.key]: text };
    setData((prev) => ({ ...prev, answers: newAnswers }));

    // If this was the background question, save it to userProfile for future conversations
    if (currentQ.key === "background") {
      setUserProfile((prev) => ({ background: text, ...prev }));
    }

    const nextIndex = questionIndex + 1;

    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      await simulateAssistantReply(questions[nextIndex].question);
    } else {
      // Salary negotiation doesn't need a resume — go straight to analysis
      if (data.goal === "salary_negotiation") {
        await generateAnalysis({ ...data, answers: newAnswers });
      } else {
        setState("resume_upload");
        const resumePrompt = (data.goal === "job_match")
          ? "Perfect! Now please share your resume — upload a file or paste the text directly below.\n\nAfter your resume, I'll ask for the specific job posting to generate your match score, tailored resume, and cover letter."
          : "Almost there! Please share your resume — upload a file or paste the text directly below.\n\nIf you don't have one ready, just type \"skip\" and I'll do my best with what you've shared.";
        await simulateAssistantReply(resumePrompt);
      }
    }
  };

  const handleResumeInput = async (text: string) => {
    const resumeText = text.toLowerCase() === "skip" ? "" : text;
    setData((prev) => ({ ...prev, resumeText }));

    if (data.goal === "career_match") {
      if (!resumeText.trim()) {
        await simulateAssistantReply(
          "Career Match needs your resume to work — without it I have nothing to match careers against!\n\nPlease upload a file (PDF, DOCX, TXT) using the paperclip button, or paste your resume text directly below."
        );
        return;
      }
      await generateCareerMatch({ ...data, resumeText });
      return;
    }

    if (data.goal === "job_match") {
      setState("job_posting");
      await simulateAssistantReply(
        "Great — I have your resume! Now I need the specific job you're targeting.\n\n**Paste the full job posting** (title, responsibilities, and qualifications) directly below for the most accurate analysis.\n\nYou can also paste a job URL, but pasting the actual text gives a much more precise match score."
      );
    } else if (data.goal === "competitiveness") {
      setState("job_details");
      await simulateAssistantReply(
        "One more thing — to give you an accurate competitiveness analysis, I need the actual job requirements.\n\n**Best option:** Paste the qualifications and responsibilities text directly from the job posting.\n\n**Also works:** Paste the job URL (note: I'll do my best but may ask you to copy/paste the text if I can't access it).\n\nThe more detail you give me, the more precise my analysis will be."
      );
    } else if (data.goal === "resume_score") {
      // Move into targeting collection
      setState("targeting");
      setData((prev) => ({ ...prev, resumeText, targetingStep: 0 }));
      await simulateAssistantReply(
        `Great! Now I need a few targeting details so I can score your resume accurately.\n\n${RESUME_SCORE_TARGETING_QUESTIONS[0].question}`
      );
    } else {
      await generateAnalysis({ ...data, resumeText });
    }
  };

  const handleTargetingAnswer = async (text: string) => {
    const step = data.targetingStep;
    const q = RESUME_SCORE_TARGETING_QUESTIONS[step];
    const value = text.toLowerCase() === "skip" ? "" : text;

    // Store answer in the right field
    const fieldUpdates: Partial<CollectedData> = {};
    if (q.key === "targetRole") fieldUpdates.targetRole = value;
    else if (q.key === "targetIndustry") fieldUpdates.targetIndustry = value;
    else if (q.key === "targetCompanies") fieldUpdates.targetCompanies = value;
    else if (q.key === "preferredLocation") fieldUpdates.preferredLocation = value;

    const updatedData: CollectedData = { ...data, ...fieldUpdates, targetingStep: step + 1 };
    setData(updatedData);

    const nextStep = step + 1;
    if (nextStep < RESUME_SCORE_TARGETING_QUESTIONS.length) {
      await simulateAssistantReply(RESUME_SCORE_TARGETING_QUESTIONS[nextStep].question);
    } else {
      // All targeting data collected — generate score
      await generateResumeScore(updatedData);
    }
  };

  const generateResumeScore = async (finalData: CollectedData) => {
    setState("generating");
    await simulateAssistantReply(
      "Perfect! I have everything I need. Scoring your resume now… ✨",
      600
    );
    setIsTyping(true);

    try {
      if (user) {
        // Authenticated path: call the persist endpoint
        const authToken = localStorage.getItem("auth_token");
        const response = await fetch("/api/ai/chat-resume-score", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          credentials: "include",
          body: JSON.stringify({
            resumeText: finalData.resumeText,
            targetRole: finalData.targetRole,
            targetIndustry: finalData.targetIndustry,
            targetCompanies: finalData.targetCompanies,
            preferredLocation: finalData.preferredLocation,
            background: finalData.answers.background,
          }),
        });

        if (!response.ok) {
          const errBody = await response.json().catch(() => ({}));
          throw new Error(errBody.error || `Score generation failed (${response.status})`);
        }
        const result = await response.json();
        const score = result.rmsScore;
        setResumeScore(score);

        const insights = result.overallInsights || {};
        const sectionAnalysis = result.sectionAnalysis || {};
        const gaps: any[] = result.gaps || [];

        const skillsScore = result.skillsScore ?? null;
        const expScore = result.experienceScore ?? null;
        const kwScore = result.keywordsScore ?? null;
        const eduScore = result.educationScore ?? null;
        const certScore = result.certificationsScore ?? null;

        setIsTyping(false);

        // Helper to build a score bar label
        const scoreBand = (s: number | null) => {
          if (s === null) return "";
          if (s >= 85) return "🟢 Exceptional";
          if (s >= 70) return "🔵 Strong";
          if (s >= 55) return "🟡 Moderate";
          if (s >= 40) return "🟠 Needs Work";
          return "🔴 Critical Gap";
        };

        let msg = `# 📊 Career Readiness Report\n\n`;

        // ── Overall Score Block ──────────────────────────────────────────────
        msg += `## Overall Resume Score: **${score}/100** ${scoreBand(score)}\n\n`;
        if (insights.scoreExplanation) msg += `${insights.scoreExplanation}\n\n`;
        if (insights.careerFitAssessment) msg += `**Career Fit:** ${insights.careerFitAssessment}\n\n`;
        if (insights.competitivePositioning) msg += `**Market Position:** ${insights.competitivePositioning}\n\n`;
        if (insights.timeToReady) msg += `⏱️ **Estimated time to become competitive:** ${insights.timeToReady}\n\n`;

        // ── Section Score Breakdown ──────────────────────────────────────────
        const sectionRows = [
          ["🛠️ Skills", skillsScore],
          ["💼 Experience", expScore],
          ["🔍 ATS Keywords", kwScore],
          ["🎓 Education", eduScore],
          ["📜 Certifications", certScore],
        ].filter(([, v]) => v !== null) as [string, number][];

        if (sectionRows.length > 0) {
          msg += `## 📋 Section-by-Section Breakdown\n\n`;
          sectionRows.forEach(([label, val]) => {
            msg += `**${label}:** ${val}/100 — ${scoreBand(val)}\n`;
          });
          msg += `\n`;
        }

        // ── Skills Section ────────────────────────────────────────────────────
        const skills = sectionAnalysis.skills;
        if (skills) {
          msg += `## 🛠️ Skills Analysis\n\n`;
          if (skills.explanation) msg += `${skills.explanation}\n\n`;
          if (skills.strengths?.length) {
            msg += `**Strengths:**\n`;
            skills.strengths.slice(0, 4).forEach((s: string) => { msg += `- ${s}\n`; });
            msg += `\n`;
          }
          if (skills.gaps?.length) {
            msg += `**Gaps:**\n`;
            skills.gaps.slice(0, 4).forEach((g: string) => { msg += `- ${g}\n`; });
            msg += `\n`;
          }
          if (skills.improvements?.length) {
            msg += `**How to improve:**\n`;
            skills.improvements.slice(0, 3).forEach((imp: string) => { msg += `- ${imp}\n`; });
            msg += `\n`;
          }
          if (skills.resources?.length) {
            msg += `**Resources:**\n`;
            skills.resources.slice(0, 2).forEach((r: any) => {
              msg += `- [${r.title}](${r.url}) — ${r.provider}${r.cost ? ` (${r.cost})` : ""}\n`;
            });
            msg += `\n`;
          }
        }

        // ── Experience Section ────────────────────────────────────────────────
        const experience = sectionAnalysis.experience;
        if (experience) {
          msg += `## 💼 Experience Analysis\n\n`;
          if (experience.explanation) msg += `${experience.explanation}\n\n`;
          if (experience.strengths?.length) {
            msg += `**Strengths:**\n`;
            experience.strengths.slice(0, 4).forEach((s: string) => { msg += `- ${s}\n`; });
            msg += `\n`;
          }
          if (experience.gaps?.length) {
            msg += `**Gaps:**\n`;
            experience.gaps.slice(0, 4).forEach((g: string) => { msg += `- ${g}\n`; });
            msg += `\n`;
          }
          if (experience.improvements?.length) {
            msg += `**How to improve:**\n`;
            experience.improvements.slice(0, 3).forEach((imp: string) => { msg += `- ${imp}\n`; });
            msg += `\n`;
          }
          if (experience.resources?.length) {
            msg += `**Resources:**\n`;
            experience.resources.slice(0, 2).forEach((r: any) => {
              msg += `- [${r.title}](${r.url}) — ${r.provider}${r.cost ? ` (${r.cost})` : ""}\n`;
            });
            msg += `\n`;
          }
        }

        // ── ATS & Keywords Section ────────────────────────────────────────────
        const keywords = sectionAnalysis.keywords;
        if (keywords) {
          msg += `## 🔍 ATS & Keyword Alignment\n\n`;
          if (keywords.explanation) msg += `${keywords.explanation}\n\n`;
          if (keywords.presentKeywords?.length) {
            msg += `**✅ Keywords present:** ${keywords.presentKeywords.slice(0, 8).join(", ")}\n\n`;
          }
          if (keywords.missingKeywords?.length) {
            msg += `**❌ Critical missing keywords:** ${keywords.missingKeywords.slice(0, 8).join(", ")}\n\n`;
          }
          if (keywords.improvements?.length) {
            msg += `**How to optimize:**\n`;
            keywords.improvements.slice(0, 3).forEach((imp: string) => { msg += `- ${imp}\n`; });
            msg += `\n`;
          }
          if (keywords.resources?.length) {
            msg += `**Resources:**\n`;
            keywords.resources.slice(0, 2).forEach((r: any) => {
              msg += `- [${r.title}](${r.url}) — ${r.provider}${r.cost ? ` (${r.cost})` : ""}\n`;
            });
            msg += `\n`;
          }
        }

        // ── Education Section ─────────────────────────────────────────────────
        const education = sectionAnalysis.education;
        if (education) {
          msg += `## 🎓 Education Analysis\n\n`;
          if (education.explanation) msg += `${education.explanation}\n\n`;
          if (education.gaps?.length) {
            msg += `**Gaps to address:**\n`;
            education.gaps.slice(0, 3).forEach((g: string) => { msg += `- ${g}\n`; });
            msg += `\n`;
          }
          if (education.resources?.length) {
            msg += `**Recommended learning:**\n`;
            education.resources.slice(0, 2).forEach((r: any) => {
              msg += `- [${r.title}](${r.url}) — ${r.provider}${r.cost ? ` (${r.cost})` : ""}\n`;
            });
            msg += `\n`;
          }
        }

        // ── Top Priority Gaps with Action Plans ────────────────────────────────
        if (gaps.length > 0) {
          msg += `## 🚨 Top Priority Gaps & Action Plans\n\n`;
          const highPriority = gaps.filter((g: any) => g.priority === "high").slice(0, 5);
          const toShow = highPriority.length > 0 ? highPriority : gaps.slice(0, 5);
          toShow.forEach((gap: any, i: number) => {
            msg += `### ${i + 1}. ${gap.category}\n`;
            if (gap.rationale) msg += `${gap.rationale}\n\n`;
            if (gap.resources?.length) {
              msg += `**Close this gap:**\n`;
              gap.resources.slice(0, 2).forEach((r: any) => {
                msg += `- [${r.title}](${r.url}) — ${r.provider}${r.cost ? ` (${r.cost})` : ""}\n`;
              });
              msg += `\n`;
            }
          });
        }

        // ── Overall Strengths & Weaknesses ────────────────────────────────────
        if (insights.strengthsOverview) {
          msg += `## ✅ Competitive Advantages\n\n${insights.strengthsOverview}\n\n`;
        }
        if (insights.weaknessesOverview) {
          msg += `## ⚠️ Critical Weaknesses\n\n${insights.weaknessesOverview}\n\n`;
        }

        // ── Key Recommendations ───────────────────────────────────────────────
        const recommendations: string[] = insights.keyRecommendations || [];
        if (recommendations.length > 0) {
          msg += `## 🚀 Priority Action Plan\n\n`;
          recommendations.forEach((r, i) => {
            msg += `${i + 1}. ${r}\n`;
          });
          msg += `\n`;
        }

        msg += `---\n📁 Your full analysis has been saved to your profile. Visit the **Resume Analysis** page for an interactive deep-dive with charts and tracking.`;

        addMessage("assistant", msg);
      } else {
        // Guest path: use regular AI analysis without saving
        await generateAnalysis(finalData);
        setIsTyping(false);
        return;
      }

      setState("complete");
      // Refresh the resume query to update the score card
      if (user) {
        queryClient.invalidateQueries({ queryKey: ["/api/resumes/active"] });
        queryClient.invalidateQueries({ queryKey: ["/api/resume-analysis-history"] });
        const updated = saveSession(user.id, currentSessionPrompt || finalData.userMessage, [
          ...messages,
        ]);
        setSavedSessions(updated);
      }
    } catch (err: any) {
      setIsTyping(false);
      const errMsg = err?.message || "Unknown error";
      console.error("Resume score error:", errMsg);
      if (user) {
        addMessage(
          "assistant",
          `❌ I ran into an error while scoring your resume: **${errMsg}**\n\nPlease try again in a moment. If the issue persists, you can also use the full **Resume Analysis** tool from the sidebar for a detailed breakdown.`
        );
      } else {
        addMessage(
          "assistant",
          "I had trouble generating your full score. Let me give you some quick feedback instead:\n\n## Quick Resume Tips\n- Quantify your achievements with numbers and metrics\n- Tailor keywords to match your target role and industry\n- Keep it to 1 page (or 2 for 10+ years of experience)\n- Add a strong summary section at the top\n- Highlight relevant skills in a dedicated sections\n\nSign in to get your full AI-powered score and track your progress!"
        );
      }
      setState("complete");
    }
  };

  const generateCareerMatch = async (finalData: CollectedData) => {
    setState("generating");
    await simulateAssistantReply("Great — I have your resume! Matching careers now… ✨", 600);
    setIsTyping(true);

    try {
      const systemPrompt = `You are an expert career counselor and talent strategist. Your task is to analyze a candidate's resume and identify the best-fitting career paths based purely on evidence in the resume.

Rules:
- Base ALL suggestions solely on what is in the resume: skills, experience, education, projects, certifications, achievements.
- Do NOT ask about interests or invent details not present in the resume.
- Cite specific, real content from the resume in each explanation — actual job titles, companies, tools, skills, degrees, projects.
- Be honest: scores should reflect genuine alignment. 90+ means the resume is almost tailor-made for that career. Don't inflate scores.
- For each career, note both why it fits well AND any stretch areas or gaps the candidate would need to address.
- Format every response using markdown. Use ## for career headers, **bold** for key terms.`;

      const userPrompt = `Analyze the resume below and suggest 5–7 career paths that best fit this candidate, ranked from highest to lowest fit.

For each career, provide:
1. A specific career/role title (e.g. "Product Manager" not just "Business")
2. A fit score out of 100 in the header
3. A detailed explanation (at least 3–4 sentences) that:
   - Cites specific evidence from the resume (tools, job titles, companies, skills, achievements, degrees, projects)
   - Explains WHY this career fits based on that evidence
   - Honestly notes any stretch areas or skills the candidate would need to develop

Use exactly this format for each entry:

## [Career Title] — [score]/100

[Detailed explanation...]

---

After all careers, add:

## 🔍 Resume Signal Summary

[2–3 sentences summarizing what the resume most strongly signals overall]

Resume:
---
${finalData.resumeText}
---`;

      const res = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(localStorage.getItem("auth_token")
            ? { Authorization: `Bearer ${localStorage.getItem("auth_token")}` }
            : {}),
        },
        body: JSON.stringify({ systemPrompt, userPrompt, maxTokens: 3000 }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate career matches");
      }

      const { analysis } = await res.json();
      setIsTyping(false);
      addMessage("assistant", analysis);
      setState("complete");

      if (user) {
        const updated = saveSession(
          user.id,
          currentSessionPrompt || finalData.userMessage,
          [...messages]
        );
        setSavedSessions(updated);
      }
    } catch (err: any) {
      setIsTyping(false);
      await simulateAssistantReply(
        `Sorry, I ran into a problem generating your career matches. ${err.message || "Please try again."}`
      );
      setState("complete");
    }
  };

  const handleJobDetails = async (text: string) => {
    const updatedData = { ...data, jobDetails: text };
    setData(updatedData);
    await generateAnalysis(updatedData);
  };

  const handleJobPosting = async (text: string) => {
    if (!text.trim()) {
      await simulateAssistantReply(
        "I need the job posting to run an accurate analysis. Please paste the job description text or URL below."
      );
      return;
    }
    const updatedData = { ...data, jobDetails: text };
    setData(updatedData);
    await generateJobMatchAnalysis(updatedData);
  };

  const generateJobMatchAnalysis = async (finalData: CollectedData) => {
    setState("generating_match");
    await simulateAssistantReply(
      "Perfect, I have everything I need! Analyzing your job match now… ✨",
      600
    );
    setIsTyping(true);

    try {
      const answersText = Object.entries(finalData.answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const systemPrompt = `You are Pathwise, an expert career guidance AI. You perform deep, structured job match analyses.
Your tone is warm, honest, and actionable. Format your response using markdown.
Use **bold** for key terms. Use ## for section headers. Use numbered/bulleted lists.

IMPORTANT — Resources: Whenever you mention a course, tool, or resource to close a gap, ALWAYS include the real URL as a markdown link: [Resource Name](https://url.com)
Only include URLs you are highly confident are correct. If unsure, omit the URL.`;

      const userPrompt = `Perform a comprehensive Job Match Analysis.

Candidate Background:
${answersText}

Candidate Resume:
${finalData.resumeText || "Not provided — analyze based on background details."}

Job Posting:
${finalData.jobDetails}

Please provide a structured analysis with EXACTLY these sections:

## 📊 Job Match Score
Give a match score out of 100 (e.g. "78/100") with a 2–3 sentence explanation of what the score means for this candidate.

## ✅ Alignment Breakdown
List 4–6 specific areas where the candidate's background aligns with the job requirements. Be specific — reference actual requirements from the job posting and corresponding candidate experience.

## 💪 Role-Specific Strengths
List 3–5 concrete strengths this candidate brings to THIS specific role. Quote or reference actual items from both the resume and job posting.

## ⚠️ Key Gaps to Address
List 3–5 specific gaps between the candidate's profile and what the job requires. Be honest but constructive. For each gap, note how critical it is (High / Medium / Low priority).

## 🚀 Strategic Next Steps
Provide 4–6 concrete, prioritized action items to close the gaps and strengthen this application. For each step, include specific resources with real URLs to help close the gap.

## 📝 Application Strategy
Give 2–3 specific tips for how to position this application (what to emphasize in cover letter, what to address proactively, any concerns to pre-empt).

End with a brief encouraging note about the candidate's prospects for this role.`;

      const response = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (!response.ok) throw new Error("Job match analysis failed");
      const result = await response.json();
      setIsTyping(false);

      const analysisContent = result.analysis || result.message || "";
      addMessage("assistant", analysisContent);

      // Now generate the tailored documents
      await generateTailoredDocuments(finalData, analysisContent);
    } catch (err) {
      setIsTyping(false);
      addMessage(
        "assistant",
        "I ran into an issue generating your job match analysis. Please try again in a moment."
      );
      setState("complete");
    }
  };

  const generateTailoredDocuments = async (finalData: CollectedData, analysisContent: string) => {
    setState("generating_docs");
    setIsTyping(true);
    await new Promise<void>((resolve) => setTimeout(() => {
      setIsTyping(false);
      addMessage("assistant", "Now generating your **tailored resume** and **cover letter** for this specific role… ✍️");
      resolve();
    }, 800));
    setIsTyping(true);

    try {
      const systemPrompt = `You are an expert resume writer and career coach. You create highly tailored, ATS-optimized resumes and compelling cover letters.
Format output EXACTLY as instructed. Use clean, professional language.`;

      const userPrompt = `Based on the job posting and the candidate's original resume, generate two documents:

ORIGINAL RESUME:
${finalData.resumeText}

JOB POSTING:
${finalData.jobDetails}

JOB MATCH ANALYSIS INSIGHTS:
${analysisContent}

---

Generate BOTH documents below. Use EXACTLY these delimiters:

===TAILORED_RESUME_START===
[Full tailored resume here — rewrite and reorder the original resume to best match the job posting. Incorporate relevant keywords from the JD. Lead with the most relevant experience. Keep clean formatting with sections: Summary, Experience, Skills, Education. Do NOT invent new experience — only reframe and prioritize existing content.]
===TAILORED_RESUME_END===

===COVER_LETTER_START===
[Full cover letter here — 3–4 paragraphs. Opening: hook with enthusiasm for the specific role/company and the strongest alignment. Body: 2 paragraphs highlighting the top 2–3 strongest matches to specific job requirements. Closing: confident call to action. Keep it under 400 words. Professional but warm tone.]
===COVER_LETTER_END===`;

      const response = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (!response.ok) throw new Error("Document generation failed");
      const result = await response.json();
      const raw = result.analysis || result.message || "";

      const resumeMatch = raw.match(/===TAILORED_RESUME_START===([\s\S]*?)===TAILORED_RESUME_END===/);
      const coverMatch = raw.match(/===COVER_LETTER_START===([\s\S]*?)===COVER_LETTER_END===/);

      const tailoredResume = resumeMatch ? resumeMatch[1].trim() : "";
      const tailoredCoverLetter = coverMatch ? coverMatch[1].trim() : "";

      setData((prev) => ({ ...prev, tailoredResume, tailoredCoverLetter }));
      setIsTyping(false);

      addMessage(
        "assistant",
        `✅ Your tailored documents are ready!\n\n## 📄 What I Created\n\n**Tailored Resume** — Reordered and rewritten to highlight your most relevant experience for this specific role, with job-specific keywords woven in.\n\n**Cover Letter** — A personalized letter addressing the job's key requirements and positioning your strongest selling points.\n\n👇 Use the **Download** buttons below to save both documents.`
      );

      setState("complete");
      if (user) {
        const updated = saveSession(user.id, currentSessionPrompt || finalData.userMessage, messages);
        setSavedSessions(updated);
      }
    } catch (err) {
      setIsTyping(false);
      addMessage(
        "assistant",
        "I generated your job match analysis above, but ran into an issue creating the tailored documents. Try starting a new conversation to generate them."
      );
      setState("complete");
    }
  };

  const generateAnalysis = async (finalData: CollectedData) => {
    setState("generating");
    await simulateAssistantReply(
      "Perfect, I have everything I need! Analyzing your profile now… ✨",
      600
    );
    setIsTyping(true);

    try {
      const goal = finalData.goal || "general";
      const answersText = Object.entries(finalData.answers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n");

      const goalDescriptions: Record<string, string> = {
        competitiveness: "Job Competitiveness Analysis",
        readiness: "Career Readiness Assessment",
        roadmap: "3–6 Month Career Roadmap",
        interview: "Interview Preparation",
        projects: "Portfolio Project Recommendations",
        salary_negotiation: "Salary Negotiation Strategy",
        general: "Career Guidance",
      };

      const goalLabel = goalDescriptions[goal] || "Career Guidance";

      const systemPrompt = `You are Pathwise, an expert career guidance AI for students, early-career professionals, and experienced professionals navigating career decisions including salary negotiation.
Your tone is warm, encouraging, clear, and actionable.
Format your response using markdown with ## headers for sections, numbered lists, and bullet points.
Use **bold** for key terms and important points.
Be specific, honest, and personalized. ONLY reference the company, role, and details explicitly provided by the user.
DO NOT assume or invent details about companies or roles that weren't mentioned. If the user provided a job URL but you cannot access it, ask them to paste the job description text instead.

IMPORTANT — Resources: Whenever you mention a course, book, tool, dataset, GitHub repo, or learning resource, ALWAYS include the real URL as a clickable markdown link immediately after the resource name. Use this format: [Resource Name](https://actual-url.com)
Examples:
- [Introduction to Machine Learning](https://www.coursera.org/learn/machine-learning) on Coursera
- [Python for Everybody](https://www.coursera.org/specializations/python) on Coursera
- [CS50](https://www.edx.org/learn/computer-science/harvard-university-cs50-s-introduction-to-computer-science) on edX
- [LeetCode](https://leetcode.com)
- [freeCodeCamp](https://www.freecodecamp.org)
- [Kaggle Datasets](https://www.kaggle.com/datasets)
- [UCI ML Repository](https://archive.ics.uci.edu/datasets)
For project recommendations specifically, ALWAYS include: direct dataset links (Kaggle, UCI, government open data), tutorial links (YouTube, Coursera, edX, freeCodeCamp), and GitHub starter repo links.
Only include URLs you are highly confident are correct and real. If unsure about a URL, write the resource name without a link rather than providing a wrong URL.

IMPORTANT — Projects: Whenever you reference a project someone should complete (e.g. "build a portfolio project", "complete a machine learning project", "create a web app"), end that sentence or bullet with the tag [MICRO_PROJECT: <short project title>] so the system can auto-generate it.
Example: "Complete at least two projects that involve building and training ML models [MICRO_PROJECT: ML Model Training Project]"`;


      let userPrompt = `Goal: ${goalLabel}

User's initial request: ${finalData.userMessage}

Background details:
${answersText}

Resume:
${finalData.resumeText || "Not provided — give advice based on profile details only."}`;

      if (finalData.jobDetails) {
        const isUrl = finalData.jobDetails.trim().startsWith("http");
        userPrompt += `\n\nJob Posting / Requirements (${isUrl ? "URL provided — analyze based on the URL context if possible, otherwise ask for text" : "text provided"}):\n${finalData.jobDetails}`;
      }

      if (goal === "competitiveness") {
        userPrompt += `\n\nPlease provide:
1. A match score estimate (e.g. "You're ~65% match") with a brief explanation
2. Strongest qualifications they bring to this role
3. Key gaps vs. the job requirements (be specific, reference the actual JD if provided)
4. Concrete action items to close those gaps (next 30–60 days)
5. An honest, encouraging summary`;
      } else if (goal === "readiness") {
        userPrompt += `\n\nPlease provide:
1. A readiness assessment (percentage ready and why)
2. Core strengths they already have for this career
3. Top 3–5 skill or experience gaps
4. Specific steps to fill those gaps
5. Realistic timeline to reach their goal
6. Encouraging closing note`;
      } else if (goal === "roadmap") {
        userPrompt += `\n\nPlease provide a structured 3–6 month roadmap:
## Month 1 – Foundation
## Month 2–3 – Build
## Month 4–6 – Execute
For each phase: key tasks, skills to develop, milestones, and resources. End with a motivating summary.`;
      } else if (goal === "interview") {
        userPrompt += `\n\nPlease provide:
1. Key themes to expect in this interview
2. 5 likely questions with guidance on how to answer them
3. Specific preparation tips for their background
4. Common mistakes to avoid
5. Confidence-building closing note`;
      } else if (goal === "projects") {
        userPrompt += `\n\nPlease provide 3–5 specific, actionable portfolio project ideas tailored to their background and goals.

For EACH project, include ALL of the following sections using this exact format:

### [Project Number]. [Project Title]
**What to Build:** [1–2 sentence description]
**Skills Demonstrated:** [comma-separated list]
**Estimated Time:** [X–Y weeks]

**📦 Datasets / APIs to Use:**
- [Resource Name](URL) — [one-line description]
- [Resource Name](URL) — [one-line description]

**📚 Tutorials & Courses:**
- [Tutorial/Course Name](URL) — [platform, e.g. YouTube / Coursera / freeCodeCamp]
- [Tutorial/Course Name](URL) — [platform]

**💻 GitHub Examples & Starter Code:**
- [Repo Name](GitHub URL) — [one-line description]
- [Repo Name](GitHub URL) — [one-line description]

**🚀 How to Showcase It:**
- [specific tip]
- [specific tip]

IMPORTANT: Every URL must be real and functional. Only include links you are highly confident exist. For datasets, prefer Kaggle, UCI ML Repository, government open data, or well-known APIs. For tutorials, prefer official YouTube channels (Sentdex, Corey Schafer, Tech With Tim, Traversy Media, etc.) or major platforms (Coursera, edX, freeCodeCamp). For GitHub repos, use well-known repositories with many stars.

After all projects, add a brief **Encouraging Closing Note**.`;
      } else if (goal === "salary_negotiation") {
        userPrompt += `\n\nPlease provide a comprehensive salary negotiation assessment with EXACTLY these sections:

## 🔍 Reality Check
Before anything else, critically evaluate the user's salary expectations against real market data for their role, experience level, and location. If their desired salary is significantly above market (more than ~20–30% above typical ranges), say so directly and respectfully — e.g., "Asking for $X as a [title] in [city] is well above market and could jeopardize your offer." If their expectations are reasonable or below market, affirm that. Be honest and specific with numbers. Do NOT sugarcoat unrealistic expectations.

## 💰 Negotiation Feasibility
State clearly whether negotiating is realistic in this situation and why. Rate feasibility as High / Medium / Low.

## 📊 Likelihood of Success
Give an honest probability estimate (e.g. "70% likely to succeed") with a 2–3 sentence explanation. If the user's desired amount is unrealistic, reflect that honestly (e.g. "20% — the ask is significantly above market for this role and experience level").

## 💪 Leverage Assessment
Analyze the user's negotiating strength. What cards do they hold? Rate overall leverage as Strong / Moderate / Weak and explain the key factors.

## 🌍 Market Alignment
Compare BOTH the current offer/salary AND the user's desired salary to real market rates for this role, experience level, and location. Reference realistic ranges from Glassdoor, Levels.fyi, LinkedIn Salary, or Payscale. For each, indicate: Below Market / At Market / Above Market / Significantly Above Market. Be specific with numbers.

## 🎯 Suggested Salary Range
Provide a realistic recommended ask range grounded in market data. If the user's desired number is unrealistic, do NOT validate it — provide what a credible negotiation range looks like instead. Include what to aim for, the floor, and total comp context (bonuses/equity) if relevant.

## 🗣️ Key Talking Points
List 4–6 specific, persuasive talking points personalized to this situation. Only include points that are credible given their experience level and market position.

## ⚠️ Risks to Avoid
List 3–5 mistakes or red flags specific to their situation. If they risk losing the offer by asking for too much, call that out explicitly.

## 📝 Negotiation Script / Email
Provide a ready-to-use script or email template. If the user's desired amount was unrealistic, use the corrected realistic range in the script instead of their stated figure. Make it professional and personalized. Include placeholders like [Company Name] where needed.

End with a candid, constructive closing note. If their expectations need adjusting, say so kindly but clearly — then be encouraging about what a realistic negotiation can achieve.`;
      } else {
        userPrompt += `\n\nPlease provide:
1. A clear, honest assessment of their situation
2. Key strengths to build on
3. 3–5 most important next steps
4. Resources or tools to help
5. Encouraging closing note`;
      }

      const response = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const result = await response.json();
      setIsTyping(false);
      addMessage(
        "assistant",
        result.analysis || result.message || "Here's your personalized analysis!"
      );
      setState("complete");
      // Save session to localStorage
      if (user) {
        const finalMessages = [
          ...messages,
          { id: Date.now().toString(), role: "assistant" as const, content: result.analysis || result.message || "", timestamp: new Date() },
        ];
        const updated = saveSession(user.id, currentSessionPrompt || finalData.userMessage, finalMessages);
        setSavedSessions(updated);
      }
    } catch (err) {
      setIsTyping(false);
      addMessage(
        "assistant",
        "I ran into an issue generating your full analysis, but here are some key next steps:\n\n## Quick Action Plan\n- Polish your resume to highlight relevant projects and skills\n- Research 5–10 target companies in your desired field\n- Build 1–2 portfolio projects relevant to your goal\n- Connect with 3 professionals on LinkedIn in your target field\n- Practice your 2-minute career pitch\n\nSign up to get your full personalized roadmap and save your progress!"
      );
      setState("complete");
    }
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || state === "generating" || state === "generating_match" || state === "generating_docs") return;
    setInputValue("");

    if (state === "idle") {
      await handleInitialMessage(text);
    } else if (state === "collecting") {
      addMessage("user", text);
      await handleCollectingAnswer(text);
    } else if (state === "resume_upload") {
      addMessage("user", text);
      await handleResumeInput(text);
    } else if (state === "job_details") {
      addMessage("user", text);
      await handleJobDetails(text);
    } else if (state === "job_posting") {
      addMessage("user", text);
      await handleJobPosting(text);
    } else if (state === "targeting") {
      addMessage("user", text);
      await handleTargetingAnswer(text);
    } else if (state === "networking_intake") {
      addMessage("user", text);
      await handleNetworkingIntakeAnswer(text);
    } else if (state === "mock_interview_intake") {
      addMessage("user", text);
      await handleMockInterviewIntakeAnswer(text);
    }
  };

  const extractTextFromFile = async (file: File): Promise<string> => {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    const isDocx =
      file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      file.type === "application/msword" ||
      file.name.toLowerCase().match(/\.(docx|doc)$/);
    const isTxt = file.type === "text/plain" || file.name.toLowerCase().endsWith(".txt");

    if (isPdf) {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(" ");
        fullText += pageText + "\n";
      }
      return fullText.trim();
    } else if (isDocx) {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer });
      return result.value.trim();
    } else if (isTxt) {
      return await file.text();
    }
    throw new Error("Unsupported file type. Please upload a PDF, DOCX, DOC, or TXT file.");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-selected if needed
    if (fileInputRef.current) fileInputRef.current.value = "";

    addMessage("user", `📄 Uploaded: ${file.name}`);

    let resumeText = "";
    try {
      await simulateAssistantReply("⏳ Reading your resume file, just a moment…");
      resumeText = await extractTextFromFile(file);
      if (!resumeText.trim()) {
        throw new Error("No text could be extracted from the file. Please try pasting the text directly.");
      }
    } catch (err: any) {
      await simulateAssistantReply(
        `❌ I couldn't read that file: ${err.message}\n\nPlease try pasting your resume text directly instead.`
      );
      return;
    }

    if (state === "networking_intake") {
      await handleNetworkingIntakeAnswer(resumeText);
      return;
    }

    if (data.goal === "career_match") {
      await generateCareerMatch({ ...data, resumeText });
      return;
    }

    if (data.goal === "job_match") {
      const updatedData = { ...data, resumeText };
      setData(updatedData);
      setState("job_posting");
      await simulateAssistantReply(
        "Got your resume! Now I need the specific job you're targeting.\n\n**Paste the full job posting** (title, responsibilities, and qualifications) directly below for the most accurate analysis.\n\nPasting the actual text gives a much more precise match score than a URL."
      );
    } else if (data.goal === "competitiveness") {
      const updatedData = { ...data, resumeText };
      setData(updatedData);
      setState("job_details");
      await simulateAssistantReply(
        "Got your resume! One more thing — to give you an accurate competitiveness analysis, I need the specific job details.\n\nPlease paste:\n• The job posting URL, OR\n• The qualifications and responsibilities from the posting"
      );
    } else if (data.goal === "resume_score") {
      setData((prev) => ({ ...prev, resumeText, targetingStep: 0 }));
      setState("targeting");
      await simulateAssistantReply(
        `Got your resume! Now I need a few targeting details so I can score it accurately.\n\n${RESUME_SCORE_TARGETING_QUESTIONS[0].question}`
      );
    } else {
      await generateAnalysis({ ...data, resumeText });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const resetChat = () => {
    setMessages([]);
    setState("idle");
    setData({ userMessage: "", goal: null, answers: {}, resumeText: "", jobDetails: "", targetRole: "", targetIndustry: "", targetCompanies: "", preferredLocation: "", targetingStep: 0, tailoredResume: "", tailoredCoverLetter: "" });
    setQuestionIndex(0);
    setIsTyping(false);
    setInputValue("");
    setCurrentSessionPrompt("");
    setActiveSessionId(null);
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const networkingOnResumeStep =
    state === "networking_intake" &&
    networkingIntakeRef.current != null &&
    networkingIntakeRef.current.steps[networkingIntakeRef.current.stepIndex] === "resume";

  const showFileUpload = state === "resume_upload" || networkingOnResumeStep;

  const getInputPlaceholder = () => {
    if (state === "idle") return "Tell me what you need help with…";
    if (state === "resume_upload") return "Paste your resume text, or type \"skip\"…";
    if (networkingOnResumeStep) return "Paste your resume text, or type \"skip\"…";
    if (state === "mock_interview_intake") {
      return mockInterviewIntakeRef.current?.step === 0
        ? "e.g. Software Engineer, Product Manager…"
        : "behavioral / technical / situational / mix";
    }
    if (state === "job_details") return "Paste the job URL or qualifications/responsibilities…";
    if (state === "job_posting") return "Paste the full job posting text here (or a URL)…";
    if (state === "targeting") {
      const q = RESUME_SCORE_TARGETING_QUESTIONS[data.targetingStep];
      if (q?.key === "preferredLocation") return "Type your preferred location, or \"skip\"…";
      return "Type your answer…";
    }
    return "Type your answer…";
  };

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={() => {
                  setSidebarOpen((o) => !o);
                  setSidebarCollapsed((c) => {
                    const next = !c;
                    localStorage.setItem("sidebarCollapsed", String(next));
                    return next;
                  });
                }}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <Logo size="md" />
            {state !== "idle" && (
              <button
                onClick={resetChat}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <X className="w-3 h-3" /> New chat
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2 h-8 px-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="bg-primary/20 text-primary text-[10px] font-semibold">
                        {`${user.firstName?.[0] || ""}${user.lastName?.[0] || ""}`.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline max-w-[120px] truncate">
                      {user.firstName}
                    </span>
                    <ChevronDown className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{user.firstName} {user.lastName}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  </div>                
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => { logout(); }}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Sign in</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Body: sidebar + main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar – logged-in users only */}
        {user && (
          <>
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-30 bg-black/40 md:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
            <aside className={`fixed inset-y-0 left-0 z-40 bg-background border-r border-border/50 flex flex-col pt-14 transition-all duration-200 ease-in-out md:relative md:inset-auto md:z-auto md:pt-0 w-64 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 ${sidebarCollapsed ? "md:w-0 md:min-w-0 md:overflow-hidden md:border-r-0" : "md:w-64"}`}>
              <div className="p-3 border-b border-border/50 flex-shrink-0 min-w-[16rem]">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={sidebarSearch}
                    onChange={(e) => setSidebarSearch(e.target.value)}
                    placeholder="Search conversations…"
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md border border-border/60 bg-background placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-primary/40"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-2 min-w-[16rem]">
                {savedSessions.length > 0 ? (() => {
                  const filtered = savedSessions.filter((s) =>
                    sidebarSearch === "" || s.prompt.toLowerCase().includes(sidebarSearch.toLowerCase())
                  );
                  return filtered.length > 0 ? (
                    <div className="flex flex-col gap-0.5">
                      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide px-2 pt-2 pb-1">Recent</p>
                      {filtered.map((session) => (
                        <button
                          key={session.id}
                          onClick={() => { resumeSession(session); setSidebarOpen(false); }}
                          className={`w-full text-left px-2 py-2.5 rounded-lg transition-colors ${activeSessionId === session.id ? "bg-primary/10 font-medium" : "hover:bg-muted/60"}`}
                        >
                          <p className="text-xs text-foreground/90 truncate leading-snug">{session.prompt}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {new Date(session.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                          </p>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations found</p>
                  );
                })() : (
                  <p className="text-xs text-muted-foreground text-center py-6 px-3">No conversations yet — start one above!</p>
                )}
              </div>
            </aside>
          </>
        )}

        {/* Main chat column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Welcome screen */}
        {state === "idle" && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Your Personal Career Assistant
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                {user ? (
                  <>
                    Welcome back,{" "}
                    <span className="text-primary">{user.firstName}</span> 👋
                  </>
                ) : (
                  <>
                    What can I help you with
                    <span className="text-primary"> today?</span>
                  </>
                )}
              </h1>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                {user
                  ? "Pick up where you left off or start a new conversation."
                  : "Describe what you need in your own words — I'll guide you through a personalized conversation and deliver actionable results."}
              </p>

              {/* Remembered profile chip */}
              {userProfile?.background && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs text-primary/80 max-w-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="truncate">
                    <span className="font-semibold text-primary">Profile remembered:</span>{" "}
                    {userProfile.background}
                  </span>
                  <button
                    onClick={() => setUserProfile(null)}
                    className="flex-shrink-0 ml-1 text-primary/50 hover:text-primary transition-colors"
                    title="Clear remembered profile"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              )}
            </div>

            {/* Logged-in: stats row */}
            {user && (
              <div className="w-full max-w-xl flex flex-wrap gap-3">
                {/* Resume score card — always shown */}
                <div className="flex-1 min-w-[130px] bg-card border border-border/60 rounded-xl p-4">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="w-3.5 h-3.5 text-primary" />
                    Resume Score
                  </div>
                  {(resumeScore != null || activeResume?.rmsScore != null) ? (
                    <>
                      <p className="text-2xl font-bold text-primary leading-tight">
                        {resumeScore ?? activeResume?.rmsScore}
                        <span className="text-sm font-normal text-muted-foreground">/100</span>
                      </p>
                      <button
                        onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")}
                        className="text-xs text-primary/70 hover:text-primary mt-0.5 transition-colors"
                      >
                        Improve score →
                      </button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-semibold text-muted-foreground leading-tight">—</p>
                      <button
                        onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")}
                        className="text-xs text-primary/70 hover:text-primary mt-0.5 transition-colors"
                      >
                        Get your score →
                      </button>
                    </>
                  )}
                </div>

                {/* Analyses count */}
                {resumeHistory && resumeHistory.length > 0 && (
                  <div className="flex-1 min-w-[130px] bg-card border border-border/60 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <FileText className="w-3.5 h-3.5 text-primary" />
                      Analyses Run
                    </div>
                    <p className="text-2xl font-bold text-foreground leading-tight">{resumeHistory.length}</p>
                    <button
                      onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")}
                      className="text-xs text-primary/70 hover:text-primary mt-0.5 transition-colors"
                    >
                      Run again →
                    </button>
                  </div>
                )}

              </div>
            )}

            {/* Quick access tools for logged-in users */}
            {user && (
              <div className="w-full max-w-xl">
                <p className="text-xs text-muted-foreground mb-2.5 font-medium uppercase tracking-wide">Quick tools</p>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { label: "Resume Analysis", icon: FileText, onClick: () => handleInitialMessage("Analyze my resume and give me detailed feedback"), cls: "border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" },
                    { label: "Job Match Analysis", icon: Briefcase, onClick: () => handleInitialMessage("Help me find jobs that match my skills and experience — I want a job match score and tailored resume"), cls: "border-sky-200 dark:border-sky-800/60 bg-sky-50 dark:bg-sky-950/20 hover:border-sky-400 hover:bg-sky-100 dark:hover:bg-sky-900/30 text-sky-700 dark:text-sky-400 hover:text-sky-800 dark:hover:text-sky-300" },
                    { label: "Career Roadmap", icon: Route, onClick: () => handleInitialMessage("Help me build a career roadmap for my goals"), cls: "border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/20 hover:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300" },
                    { label: "Micro-Projects", icon: Zap, onClick: () => handleInitialMessage("Suggest portfolio projects I can build to strengthen my resume"), cls: "border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/20 hover:border-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 text-amber-700 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300" },
                    { label: "Salary Negotiation", icon: DollarSign, onClick: () => handleInitialMessage("Help me negotiate my salary — I want to understand my leverage and get a negotiation strategy"), cls: "border-green-200 dark:border-green-800/60 bg-green-50 dark:bg-green-950/20 hover:border-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 text-green-700 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300" },
                    { label: "Career Match", icon: Target, onClick: () => handleInitialMessage("Match careers to my resume based on my background"), cls: "border-emerald-200 dark:border-emerald-800/60 bg-emerald-50 dark:bg-emerald-950/20 hover:border-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300", testId: "button-career-match-quick-tool" },
                    { label: "Networking", icon: Users, onClick: handleNetworkingClick, cls: "border-violet-200 dark:border-violet-800/60 bg-violet-50 dark:bg-violet-950/20 hover:border-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-700 dark:text-violet-400 hover:text-violet-800 dark:hover:text-violet-300", testId: "button-networking-quick-tool" },
                    { label: "Mock Interview", icon: Video, onClick: handleMockInterviewClick, cls: "border-indigo-200 dark:border-indigo-800/60 bg-indigo-50 dark:bg-indigo-950/20 hover:border-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300", testId: "button-mock-interview-quick-tool" },
                  ].map(({ label, icon: Icon, onClick, cls, testId }: { label: string; icon: React.FC<{ className?: string }>; onClick: () => void; cls: string; testId?: string }) => (
                    <button
                      key={label}
                      onClick={onClick}
                      data-testid={testId}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all ${cls}`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Starter prompts */}
            <div className="flex flex-col gap-2 w-full max-w-xl">
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Ask me anything</p>
              {STARTER_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleInitialMessage(prompt)}
                  className="group text-left px-4 py-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 text-sm text-muted-foreground hover:text-foreground flex items-center justify-between"
                >
                  <span>{prompt}</span>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 text-primary transition-all duration-200 flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>

            {!user && (
              <p className="text-xs text-muted-foreground/60">
                No account needed · Powered by GPT-4o
              </p>
            )}
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex flex-col gap-4 pb-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs ${
                    msg.role === "assistant"
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                {msg.mockInterviewData ? (
                  <div className="flex-1 min-w-0 max-w-[92%]">
                    <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm shadow-sm px-5 py-4 text-sm mb-3">
                      <MessageContent content={msg.content} />
                    </div>
                    <MockInterviewPanel
                      questions={msg.mockInterviewData.questions}
                      role={msg.mockInterviewData.role}
                      onSessionComplete={handleMockInterviewSessionComplete}
                    />
                  </div>
                ) : msg.networkingData ? (
                  <div className="flex-1 min-w-0 max-w-[92%]">
                    <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm shadow-sm px-5 py-4 text-sm mb-3">
                      <MessageContent content={msg.content} />
                    </div>
                    <NetworkingPanel
                      data={msg.networkingData}
                      onRefresh={async () => {
                        const params = networkingParamsRef.current;
                        const res = await fetch("/api/networking/recommendations", {
                          method: "POST",
                          headers: {
                            Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            force: true,
                            intakeRole: params.intakeRole,
                            intakeBackground: params.intakeBackground,
                            intakeLocation: params.intakeLocation,
                            intakeResumeText: params.intakeResumeText,
                          }),
                        });
                        if (!res.ok) {
                          const err = await res.json().catch(() => ({}));
                          throw new Error(err.error || "Refresh failed");
                        }
                        const fresh: NetworkingRecommendations = await res.json();
                        setMessages((prev) =>
                          prev.map((m) =>
                            m.id === msg.id ? { ...m, networkingData: fresh } : m
                          )
                        );
                      }}
                    />
                  </div>
                ) : (
                  <div
                    className={`max-w-[88%] rounded-2xl text-sm leading-relaxed ${
                      msg.role === "assistant"
                        ? "bg-card border border-border/60 text-foreground rounded-tl-sm shadow-sm px-5 py-4"
                        : "bg-primary text-primary-foreground rounded-tr-sm px-4 py-2.5"
                    }`}
                  >
                    <MessageContent content={msg.content} />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3 flex-row">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-card border border-border/50 rounded-2xl rounded-tl-sm">
                  <TypingIndicator />
                </div>
              </div>
            )}

            {state === "complete" && !user && (
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    {data.tailoredResume && data.tailoredCoverLetter ? (
                      <>
                        <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Your tailored documents are ready
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          Download below. Create a free account to save your analysis and track your applications.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            size="sm"
                            onClick={() => downloadTextFile(data.tailoredResume, "Tailored_Resume.txt")}
                            className="gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Resume
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTextFile(data.tailoredCoverLetter, "Cover_Letter.txt")}
                            className="gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Cover Letter
                          </Button>
                        </div>
                        <div className="flex gap-2">
                          <Link href="/register">
                            <Button size="sm" variant="outline">
                              Create free account
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </Link>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-foreground">
                          Save your results & unlock full access
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          Create a free account to save this analysis, track your goals, and get ongoing guidance.
                        </p>
                        <div className="flex gap-2">
                          <Link href="/register">
                            <Button size="sm">
                              Create free account
                              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                            </Button>
                          </Link>
                          <Link href="/login">
                            <Button variant="outline" size="sm">Sign in</Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state === "complete" && user && (
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    {data.tailoredResume && data.tailoredCoverLetter ? (
                      <>
                        <p className="font-semibold text-sm text-foreground flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          Your tailored documents are ready to download
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          Both documents are customized for this specific job posting and ready to use.
                        </p>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Button
                            size="sm"
                            onClick={() => downloadTextFile(data.tailoredResume, "Tailored_Resume.txt")}
                            className="gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Resume
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => downloadTextFile(data.tailoredCoverLetter, "Cover_Letter.txt")}
                            className="gap-1.5"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Cover Letter
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          Want to explore more tools?
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleInitialMessage("Help me build a career roadmap for my goals")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/20 hover:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300">
                            <Route className="w-3.5 h-3.5" />
                            Career Roadmap
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-sm text-foreground">
                          Dive deeper with Pathwise tools
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                          Continue with full AI-powered tools to get scored analysis, career plans, and practice.
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all border-blue-200 dark:border-blue-800/60 bg-blue-50 dark:bg-blue-950/20 hover:border-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                            <FileText className="w-3.5 h-3.5" />
                            Resume Analysis
                          </button>
                          <button onClick={() => handleInitialMessage("Help me build a career roadmap for my goals")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm transition-all border-teal-200 dark:border-teal-800/60 bg-teal-50 dark:bg-teal-950/20 hover:border-teal-400 hover:bg-teal-100 dark:hover:bg-teal-900/30 text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300">
                            <Route className="w-3.5 h-3.5" />
                            Career Roadmap
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {state === "complete" && (
              <div className="flex justify-center mt-2">
                <button
                  onClick={resetChat}
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  <X className="w-3 h-3" /> Start a new conversation
                </button>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
            </div>
          </div>

          {/* Input area */}
          {state !== "generating" && state !== "generating_match" && state !== "generating_docs" && state !== "complete" && (
            <div className="bg-background/90 backdrop-blur-sm border-t border-border/50 flex-shrink-0">
              <div className="max-w-3xl mx-auto px-4 py-3">
                {showFileUpload && (
                  <div className="mb-2 flex items-center gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      Upload resume
                    </Button>
                    <span className="text-xs text-muted-foreground">or paste text below</span>
                  </div>
                )}
                {state === "job_details" && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="w-3.5 h-3.5 flex-shrink-0" />
                    Paste the job description text <span className="font-medium text-foreground">(recommended)</span> or a job URL
                  </div>
                )}
                {state === "job_posting" && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Briefcase className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    <span>Paste the <span className="font-medium text-foreground">full job posting</span> — title, responsibilities, and qualifications — for the most accurate match score</span>
                  </div>
                )}
                {state === "targeting" && (
                  <div className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <TrendingUp className="w-3.5 h-3.5 flex-shrink-0 text-primary" />
                    <span>Targeting details — step <span className="font-medium text-foreground">{data.targetingStep + 1}</span> of {RESUME_SCORE_TARGETING_QUESTIONS.length}</span>
                  </div>
                )}
                <div className="flex gap-2 items-end">
                  <Textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getInputPlaceholder()}
                    rows={1}
                    className="resize-none min-h-[44px] max-h-[200px] text-sm rounded-xl"
                    style={{ height: "44px" }}
                    onInput={(e) => {
                      const t = e.currentTarget;
                      t.style.height = "44px";
                      t.style.height = `${Math.min(t.scrollHeight, 200)}px`;
                    }}
                  />
                  <Button
                    size="icon"
                    className="h-11 w-11 rounded-xl flex-shrink-0"
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim()}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/50 mt-1.5 text-center">
                  Enter to send · Shift+Enter for new line
                </p>
              </div>
            </div>
          )}

          {(state === "generating" || state === "generating_match" || state === "generating_docs") && (
            <div className="bg-background/90 backdrop-blur-sm border-t border-border/50 flex-shrink-0">
              <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                {state === "generating_docs" ? "Generating tailored resume & cover letter…" : "Generating your personalized analysis…"}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InlineText({ text }: { text: string }) {
  // Parse markdown links [text](url), **bold**, *italic*, `code`, and bare URLs
  const parts: React.ReactNode[] = [];
  // Order: markdown links first, then bold, italic, code, bare URLs
  const regex = /(\[(.+?)\]\((https?:\/\/[^\s)]+)\)|\*\*(.+?)\*\*|\*(.+?)\*|`(.+?)`|(https?:\/\/[^\s,)"'<>]+))/g;
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[2] && match[3]) {
      // Markdown link [text](url)
      parts.push(
        <a
          key={key++}
          href={match[3]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2 hover:opacity-80 font-medium"
        >
          {match[2]}
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    } else if (match[4]) {
      parts.push(<strong key={key++} className="font-semibold text-foreground">{match[4]}</strong>);
    } else if (match[5]) {
      parts.push(<em key={key++} className="italic">{match[5]}</em>);
    } else if (match[6]) {
      parts.push(<code key={key++} className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">{match[6]}</code>);
    } else if (match[7]) {
      // Bare URL
      parts.push(
        <a
          key={key++}
          href={match[7]}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-0.5 text-primary underline underline-offset-2 hover:opacity-80 break-all"
        >
          {match[7]}
          <ExternalLink className="w-3 h-3 flex-shrink-0" />
        </a>
      );
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return <>{parts}</>;
}

function MicroProjectButton({ title }: { title: string }) {
  const [, setLocation] = useLocation();
  const [generating, setGenerating] = React.useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await fetch("/api/micro-projects/generate-from-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetRole: title, count: 1, difficulty: "beginner" }),
      });
      setLocation("/micro-projects");
    } catch {
      setLocation("/micro-projects");
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={generating}
      className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-medium border border-primary/20 transition-colors"
    >
      {generating ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : (
        <FolderOpen className="w-3 h-3" />
      )}
      Generate Micro Project: {title}
    </button>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "LinkedIn": return <SiLinkedin className="w-3.5 h-3.5 text-[#0A66C2]" />;
    case "Reddit": return <SiReddit className="w-3.5 h-3.5 text-[#FF4500]" />;
    case "Slack": return <SiSlack className="w-3.5 h-3.5 text-[#4A154B]" />;
    case "Discord": return <SiDiscord className="w-3.5 h-3.5 text-[#5865F2]" />;
    default: return <Globe className="w-3.5 h-3.5 text-muted-foreground" />;
  }
}

function NetworkingPanel({
  data,
  onRefresh,
}: {
  data: NetworkingRecommendations;
  onRefresh?: () => Promise<void>;
}) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-5" data-testid="networking-panel">
      {/* Events */}
      {data.events.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Local &amp; Online Events
            </span>
            <span className="text-xs bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full px-1.5 py-0.5">{data.events.length}</span>
          </div>
          <div className="space-y-2">
            {data.events.map((evt) => (
              <div key={evt.id} className="bg-card border border-border/60 rounded-xl p-3 text-sm" data-testid={`networking-event-${evt.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap mb-1">
                      {evt.isOnline
                        ? <span className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 rounded px-1.5 py-0.5"><Wifi className="w-3 h-3" />Online</span>
                        : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5"><Building2 className="w-3 h-3" />In-Person</span>}
                      {evt.source === "meetup" && (
                        <span className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 rounded px-1.5 py-0.5">Meetup</span>
                      )}
                      {evt.source === "eventbrite" && (
                        <span className="text-xs text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/20 rounded px-1.5 py-0.5">Eventbrite</span>
                      )}
                    </div>
                    <p className="font-medium text-sm leading-snug">{evt.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{evt.description}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-1.5">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>
                    </div>
                    <div className="flex items-start gap-1 mt-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded px-2 py-1">
                      <Target className="w-3 h-3 mt-0.5 shrink-0" /><span>{evt.whyRelevant}</span>
                    </div>
                  </div>
                  <a href={evt.url} target="_blank" rel="noopener noreferrer" data-testid={`link-event-${evt.id}`}>
                    <button className="shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all">
                      View <ExternalLink className="w-3 h-3" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Social Groups */}
      {data.socialGroups.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SiLinkedin className="w-4 h-4 text-[#0A66C2]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              LinkedIn Groups
            </span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Pre-filled LinkedIn group search for your role — browse and join groups after logging in.
          </p>
          <div className="space-y-2">
            {data.socialGroups.map((grp) => (
              <div key={grp.id} className="bg-card border border-border/60 rounded-xl p-3 text-sm" data-testid={`networking-group-${grp.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <PlatformIcon platform={grp.platform} />
                      <span className="text-xs text-muted-foreground">{grp.platform}</span>
                      {grp.requiresLogin && (
                        <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 rounded px-1.5 py-0.5">Login required</span>
                      )}
                    </div>
                    <p className="font-medium text-sm leading-snug">{grp.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{grp.description}</p>
                    <div className="flex items-start gap-1 mt-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded px-2 py-1">
                      <Target className="w-3 h-3 mt-0.5 shrink-0" /><span>{grp.whyRelevant}</span>
                    </div>
                  </div>
                  <a href={grp.url} target="_blank" rel="noopener noreferrer" data-testid={`link-group-${grp.id}`}>
                    <button className="shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all">
                      Search <ExternalLink className="w-3 h-3" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Forums */}
      {data.forums.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <SiReddit className="w-4 h-4 text-[#FF4500]" />
            <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Reddit Communities
            </span>
            <span className="text-xs bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-full px-1.5 py-0.5">{data.forums.length}</span>
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            Verified subreddits — each link was confirmed active before being shown.
          </p>
          <div className="space-y-2">
            {data.forums.map((frm) => (
              <div key={frm.id} className="bg-card border border-border/60 rounded-xl p-3 text-sm" data-testid={`networking-forum-${frm.id}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      <PlatformIcon platform={frm.platform} />
                      <span className="text-xs text-muted-foreground">{frm.platform}</span>
                    </div>
                    <p className="font-medium text-sm leading-snug">{frm.name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{frm.description}</p>
                    <div className="flex items-start gap-1 mt-1.5 text-xs text-violet-700 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/20 rounded px-2 py-1">
                      <Target className="w-3 h-3 mt-0.5 shrink-0" /><span>{frm.whyRelevant}</span>
                    </div>
                  </div>
                  <a href={frm.url} target="_blank" rel="noopener noreferrer" data-testid={`link-forum-${frm.id}`}>
                    <button className="shrink-0 inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all">
                      Join <ExternalLink className="w-3 h-3" />
                    </button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between pt-1">
        <p className="text-xs text-muted-foreground">
          Updated {new Date(data.generatedAt).toLocaleString()}
        </p>
        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            data-testid="button-refresh-networking"
            className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 text-muted-foreground hover:text-foreground transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        )}
      </div>
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Collect all micro-project tags from full content first
  const microProjectTags: string[] = [];
  const microProjectRegex = /\[MICRO_PROJECT:\s*([^\]]+)\]/g;
  let mpMatch;
  while ((mpMatch = microProjectRegex.exec(content)) !== null) {
    microProjectTags.push(mpMatch[1].trim());
  }

  // Strip MICRO_PROJECT tags from content before rendering
  const cleanContent = content.replace(/\s*\[MICRO_PROJECT:[^\]]+\]/g, "");

  const lines = cleanContent.split("\n");
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // H1 header — styled as the main report title
    if (line.startsWith("# ")) {
      elements.push(
        <div key={i} className="mt-2 mb-3 first:mt-0">
          <h2 className="font-bold text-lg text-foreground tracking-tight flex items-center gap-2">
            <InlineText text={line.slice(2)} />
          </h2>
        </div>
      );
      i++;
      continue;
    }

    // H2 header — styled as a prominent section title
    if (line.startsWith("## ")) {
      elements.push(
        <div key={i} className="mt-5 mb-2 first:mt-1">
          <div className="flex items-center gap-2">
            <div className="w-1 h-4 bg-primary rounded-full flex-shrink-0" />
            <h3 className="font-bold text-base text-foreground tracking-tight">
              <InlineText text={line.slice(3)} />
            </h3>
          </div>
        </div>
      );
      i++;
      continue;
    }

    // H3 header
    if (line.startsWith("### ")) {
      elements.push(
        <p key={i} className="font-semibold text-sm mt-3 mb-1 text-foreground/90">
          <InlineText text={line.slice(4)} />
        </p>
      );
      i++;
      continue;
    }

    // Bullet point
    if (line.match(/^[-•*]\s/)) {
      elements.push(
        <div key={i} className="flex gap-2.5 items-start py-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary/70 flex-shrink-0 mt-[7px]" />
          <p className="text-sm leading-relaxed">
            <InlineText text={line.slice(2)} />
          </p>
        </div>
      );
      i++;
      continue;
    }

    // Numbered list
    const numMatch = line.match(/^(\d+)\.\s(.+)/);
    if (numMatch) {
      elements.push(
        <div key={i} className="flex gap-2.5 items-start py-0.5">
          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
            {numMatch[1]}
          </span>
          <p className="text-sm leading-relaxed flex-1">
            <InlineText text={numMatch[2]} />
          </p>
        </div>
      );
      i++;
      continue;
    }

    // Arrow indicator
    if (line.startsWith("→ ") || line.startsWith("> ")) {
      elements.push(
        <p key={i} className="text-sm pl-3 border-l-2 border-primary/30 text-muted-foreground italic py-0.5">
          <InlineText text={line.slice(2)} />
        </p>
      );
      i++;
      continue;
    }

    // Horizontal rule
    if (line.trim() === "---" || line.trim() === "***" || line.trim() === "___") {
      elements.push(<hr key={i} className="border-border/40 my-3" />);
      i++;
      continue;
    }

    // Empty line — spacing
    if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
      i++;
      continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} className="text-sm leading-relaxed">
        <InlineText text={line} />
      </p>
    );
    i++;
  }

  return (
    <div className="space-y-0.5">
      {elements}
      {microProjectTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/40">
          {microProjectTags.map((title, idx) => (
            <MicroProjectButton key={idx} title={title} />
          ))}
        </div>
      )}
    </div>
  );
}
