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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Logo } from "@/components/Logo";

type ConversationState =
  | "idle"
  | "collecting"
  | "resume_upload"
  | "job_details"
  | "targeting"
  | "generating"
  | "complete";

type GoalType = "competitiveness" | "readiness" | "roadmap" | "interview" | "projects" | "resume_score" | "general" | null;

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
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

// Targeting questions specifically for resume score flow
const RESUME_SCORE_TARGETING_QUESTIONS = [
  { key: "targetRole", question: "What is your target role or career? (e.g. Software Engineer, Product Manager, Data Analyst)" },
  { key: "targetIndustry", question: "What industry or field are you targeting? (e.g. Technology, Finance, Healthcare, Marketing)" },
  { key: "targetCompanies", question: "What type of companies are you targeting? You can name specific companies or describe the type. (e.g. Google, startups, mid-size tech firms, Fortune 500)" },
  { key: "preferredLocation", question: "Any preferred location or work arrangement? (e.g. New York, remote, open to relocation — type \"skip\" to skip)" },
];

const FOLLOW_UP_QUESTIONS: Record<string, { key: string; question: string }[]> = {
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
};

function detectGoal(message: string): GoalType {
  const lower = message.toLowerCase();
  if (lower.match(/competi|job match|qualify|stack up|fit for|apply to|job posting|hiring/)) return "competitiveness";
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
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [savedSessions, setSavedSessions] = useState<SavedSession[]>([]);
  const [currentSessionPrompt, setCurrentSessionPrompt] = useState<string>("");
  const [resumeScore, setResumeScore] = useState<number | null>(null);

  // Load saved sessions when user is available
  useEffect(() => {
    if (user) {
      setSavedSessions(loadSavedSessions(user.id));
    }
  }, [user?.id]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    const questions = FOLLOW_UP_QUESTIONS[goal!] || FOLLOW_UP_QUESTIONS.general;

    setData((prev) => ({ ...prev, userMessage: text, goal }));
    setState("collecting");
    setQuestionIndex(0);
    setCurrentSessionPrompt(text);

    await simulateAssistantReply(
      `Got it! I can help with that. Let me ask you a couple of quick questions so I can give you a personalized response.\n\n${questions[0].question}`
    );
  };

  const resumeSession = (session: SavedSession) => {
    setMessages(session.messages);
    setCurrentSessionPrompt(session.prompt);
    setState("complete");
  };

  const handleCollectingAnswer = async (text: string) => {
    const goal = data.goal || "general";
    const questions = FOLLOW_UP_QUESTIONS[goal] || FOLLOW_UP_QUESTIONS.general;
    const currentQ = questions[questionIndex];

    const newAnswers = { ...data.answers, [currentQ.key]: text };
    setData((prev) => ({ ...prev, answers: newAnswers }));

    const nextIndex = questionIndex + 1;

    if (nextIndex < questions.length) {
      setQuestionIndex(nextIndex);
      await simulateAssistantReply(questions[nextIndex].question);
    } else {
      setState("resume_upload");
      await simulateAssistantReply(
        "Almost there! Please share your resume — upload a file or paste the text directly below.\n\nIf you don't have one ready, just type \"skip\" and I'll do my best with what you've shared."
      );
    }
  };

  const handleResumeInput = async (text: string) => {
    const resumeText = text.toLowerCase() === "skip" ? "" : text;
    setData((prev) => ({ ...prev, resumeText }));

    if (data.goal === "competitiveness") {
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
        const scoreExplanation = insights.scoreExplanation || "";
        const strengths = insights.strengthsOverview || "";
        const weaknesses = insights.weaknessesOverview || "";
        const recommendations: string[] = insights.keyRecommendations || [];

        setIsTyping(false);

        let msg = `## Your Resume Score: ${score}/100\n\n`;
        if (scoreExplanation) msg += `${scoreExplanation}\n\n`;
        if (strengths) msg += `## ✅ Key Strengths\n${strengths}\n\n`;
        if (weaknesses) msg += `## ⚠️ Areas to Improve\n${weaknesses}\n\n`;
        if (recommendations.length > 0) {
          msg += `## 🚀 Top Recommendations\n`;
          recommendations.forEach((r, i) => {
            msg += `${i + 1}. ${r}\n`;
          });
        }
        msg += `\nYour score has been saved to your profile and will appear on your dashboard.`;

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

  const handleJobDetails = async (text: string) => {
    const updatedData = { ...data, jobDetails: text };
    setData(updatedData);
    await generateAnalysis(updatedData);
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
        general: "Career Guidance",
      };

      const goalLabel = goalDescriptions[goal] || "Career Guidance";

      const systemPrompt = `You are Pathwise, an expert career guidance AI for students and early-career professionals.
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
    if (!text || state === "generating") return;
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
    } else if (state === "targeting") {
      addMessage("user", text);
      await handleTargetingAnswer(text);
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

    if (data.goal === "competitiveness") {
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
    setData({ userMessage: "", goal: null, answers: {}, resumeText: "", jobDetails: "", targetRole: "", targetIndustry: "", targetCompanies: "", preferredLocation: "", targetingStep: 0 });
    setQuestionIndex(0);
    setIsTyping(false);
    setInputValue("");
    setCurrentSessionPrompt("");
  };

  const showFileUpload = state === "resume_upload";

  const getInputPlaceholder = () => {
    if (state === "idle") return "Tell me what you need help with…";
    if (state === "resume_upload") return "Paste your resume text, or type \"skip\"…";
    if (state === "job_details") return "Paste the job URL or qualifications/responsibilities…";
    if (state === "targeting") {
      const q = RESUME_SCORE_TARGETING_QUESTIONS[data.targetingStep];
      if (q?.key === "preferredLocation") return "Type your preferred location, or \"skip\"…";
      return "Type your answer…";
    }
    return "Type your answer…";
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
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
                  <DropdownMenuItem onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")}>
                    <FileText className="w-4 h-4 mr-2" />
                    Resume Analysis
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInitialMessage("Help me build a career roadmap for my goals")}>
                    <Route className="w-4 h-4 mr-2" />
                    Career Roadmap
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInitialMessage("Help me find jobs that match my skills and experience")}>
                    <Briefcase className="w-4 h-4 mr-2" />
                    Job Matching
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInitialMessage("Suggest portfolio projects I can build to strengthen my resume")}>
                    <Zap className="w-4 h-4 mr-2" />
                    Micro-Projects
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInitialMessage("Help me prepare for an upcoming interview")}>
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Interview Prep
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleInitialMessage("Help me track and manage my job applications")}>
                    <ClipboardList className="w-4 h-4 mr-2" />
                    Applications
                  </DropdownMenuItem>
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

      {/* Main content */}
      <div className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col">
        {/* Welcome screen */}
        {state === "idle" && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Your AI career assistant
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

                {/* Last conversation resume card */}
                {savedSessions.length > 0 && (
                  <div className="flex-1 min-w-[160px] bg-card border border-border/60 rounded-xl p-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Last Conversation
                    </div>
                    <p className="text-xs font-medium text-foreground line-clamp-2 leading-snug mt-1">
                      {savedSessions[0].prompt}
                    </p>
                    <button
                      onClick={() => resumeSession(savedSessions[0])}
                      className="flex items-center gap-1 text-xs text-primary/70 hover:text-primary mt-1.5 transition-colors font-medium"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Resume conversation
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Quick access tools for logged-in users */}
            {user && (
              <div className="w-full max-w-xl">
                <p className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Quick tools</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: "Resume Analysis", prompt: "Analyze my resume and give me detailed feedback", icon: FileText },
                    { label: "Job Matching", prompt: "Help me find jobs that match my skills and experience", icon: Briefcase },
                    { label: "Career Roadmap", prompt: "Help me build a career roadmap for my goals", icon: Route },
                    { label: "Interview Prep", prompt: "Help me prepare for an upcoming interview", icon: MessageSquare },
                    { label: "Micro-Projects", prompt: "Suggest portfolio projects I can build to strengthen my resume", icon: Zap },
                  ].map(({ label, prompt, icon: Icon }) => (
                    <button
                      key={label}
                      onClick={() => handleInitialMessage(prompt)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 text-xs text-muted-foreground hover:text-foreground transition-all"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent conversations (for logged-in users) OR starter prompts (for guests) */}
            <div className="flex flex-col gap-2 w-full max-w-xl">
              {user && savedSessions.length > 0 ? (
                <>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Recent conversations</p>
                  {savedSessions.slice(0, 3).map((session) => (
                    <button
                      key={session.id}
                      onClick={() => resumeSession(session)}
                      className="group text-left px-4 py-3 rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-200 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground truncate">
                          {session.prompt}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-muted-foreground/60">
                          {new Date(session.timestamp).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                        </span>
                        <RotateCcw className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-primary transition-all duration-200" />
                      </div>
                    </button>
                  ))}
                </>
              ) : (
                <>
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
                </>
              )}
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
                <div
                  className={`max-w-[88%] rounded-2xl text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-card border border-border/60 text-foreground rounded-tl-sm shadow-sm px-5 py-4"
                      : "bg-primary text-primary-foreground rounded-tr-sm px-4 py-2.5"
                  }`}
                >
                  <MessageContent content={msg.content} />
                </div>
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
                    <p className="font-semibold text-sm text-foreground">
                      Dive deeper with Pathwise tools
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                      Continue with full AI-powered tools to get scored analysis, career plans, and practice.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => handleInitialMessage("Analyze my resume and give me detailed feedback")}>
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Resume Analysis
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleInitialMessage("Help me build a career roadmap for my goals")}>
                        <Route className="w-3.5 h-3.5 mr-1.5" />
                        Career Roadmap
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleInitialMessage("Help me prepare for an upcoming interview")}>
                        <MessageSquare className="w-3.5 h-3.5 mr-1.5" />
                        Interview Prep
                      </Button>
                    </div>
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

      {/* Input area */}
      {state !== "generating" && state !== "complete" && (
        <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50">
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

      {state === "generating" && (
        <div className="sticky bottom-0 bg-background/90 backdrop-blur-sm border-t border-border/50">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating your personalized analysis…
          </div>
        </div>
      )}
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
