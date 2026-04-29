import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";

type ConversationState =
  | "idle"
  | "collecting"
  | "resume_upload"
  | "job_details"
  | "generating"
  | "complete";

type GoalType = "competitiveness" | "readiness" | "roadmap" | "interview" | "projects" | "general" | null;

type CollectedData = {
  userMessage: string;
  goal: GoalType;
  answers: Record<string, string>;
  resumeText: string;
  jobDetails: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

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
  return "general";
}

const STARTER_PROMPTS = [
  "I want to know how competitive I am for a product manager role",
  "Help me build a career roadmap for breaking into tech",
  "I have an interview at Google next week — help me prep",
  "Am I ready for a data analyst role?",
  "Suggest some portfolio projects for a marketing career",
];

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
  const { user } = useAuth();
  const [, navigate] = useLocation();

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [state, setState] = useState<ConversationState>("idle");
  const [data, setData] = useState<CollectedData>({
    userMessage: "",
    goal: null,
    answers: {},
    resumeText: "",
    jobDetails: "",
  });
  const [questionIndex, setQuestionIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

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

    await simulateAssistantReply(
      `Got it! I can help with that. Let me ask you a couple of quick questions so I can give you a personalized response.\n\n${questions[0].question}`
    );
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
        "One more thing — to give you an accurate competitiveness analysis, I need the specific job details.\n\nPlease paste:\n• The job posting URL, OR\n• The qualifications and responsibilities from the posting\n\nThis lets me match your profile directly against what the employer is looking for."
      );
    } else {
      await generateAnalysis({ ...data, resumeText });
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
Format your response using clear markdown sections with ## headers.
Be specific, honest, and personalized. Avoid generic advice — reference the user's actual situation.`;

      let userPrompt = `Goal: ${goalLabel}

User's initial request: ${finalData.userMessage}

Background details:
${answersText}

Resume:
${finalData.resumeText || "Not provided — give advice based on profile details only."}`;

      if (finalData.jobDetails) {
        userPrompt += `\n\nJob Posting / Requirements:\n${finalData.jobDetails}`;
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
        userPrompt += `\n\nPlease provide:
1. 3–5 specific project ideas tailored to their background and goals
2. For each: title, what to build, skills demonstrated, estimated time
3. Tips for showcasing these projects
4. Encouraging closing note`;
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
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addMessage("user", `📄 Uploaded: ${file.name}`);
    const resumeText = `[Resume file: ${file.name}]`;

    if (data.goal === "competitiveness") {
      const updatedData = { ...data, resumeText };
      setData(updatedData);
      setState("job_details");
      await simulateAssistantReply(
        "Got your resume! One more thing — to give you an accurate competitiveness analysis, I need the specific job details.\n\nPlease paste:\n• The job posting URL, OR\n• The qualifications and responsibilities from the posting"
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
    setData({ userMessage: "", goal: null, answers: {}, resumeText: "", jobDetails: "" });
    setQuestionIndex(0);
    setIsTyping(false);
    setInputValue("");
  };

  const showFileUpload = state === "resume_upload";

  const getInputPlaceholder = () => {
    if (state === "idle") return "Tell me what you need help with…";
    if (state === "resume_upload") return "Paste your resume text, or type \"skip\"…";
    if (state === "job_details") return "Paste the job URL or qualifications/responsibilities…";
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
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard →
              </Button>
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
          <div className="flex-1 flex flex-col items-center justify-center py-16 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                Your AI career assistant
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
                What can I help you with
                <span className="text-primary"> today?</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Describe what you need in your own words — I'll guide you through a personalized conversation and deliver actionable results.
              </p>
            </div>

            <div className="flex flex-col gap-2 w-full max-w-xl">
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

            <p className="text-xs text-muted-foreground/60">
              No account needed · Powered by GPT-4o
            </p>
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
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "assistant"
                      ? "bg-card border border-border/50 text-foreground rounded-tl-sm"
                      : "bg-primary text-primary-foreground rounded-tr-sm"
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
                Paste a job posting URL or the qualifications and responsibilities
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

function MessageContent({ content }: { content: string }) {
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="font-semibold text-sm mt-3 first:mt-0 text-foreground">
              {line.slice(3)}
            </p>
          );
        }
        if (line.startsWith("### ")) {
          return (
            <p key={i} className="font-medium text-sm mt-2 first:mt-0">
              {line.slice(4)}
            </p>
          );
        }
        if (line.match(/^[-•]\s/)) {
          return (
            <p key={i} className="flex gap-1.5 text-sm">
              <span className="text-primary mt-0.5 flex-shrink-0">•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }
        if (line.match(/^\d+\.\s/)) {
          return <p key={i} className="text-sm pl-1">{line}</p>;
        }
        if (line.startsWith("→ ")) {
          return (
            <p key={i} className="text-sm pl-2 text-muted-foreground">{line}</p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1.5" />;
        return <p key={i} className="text-sm">{line}</p>;
      })}
    </div>
  );
}
