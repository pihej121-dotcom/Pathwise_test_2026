import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Map,
  TrendingUp,
  Send,
  Paperclip,
  ChevronRight,
  Sparkles,
  ArrowRight,
  User,
  Bot,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Logo } from "@/components/Logo";

type Goal = {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  prompt: string;
};

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
};

type IntakeStep =
  | "goal_select"
  | "collecting"
  | "resume_upload"
  | "generating"
  | "complete";

const GOALS: Goal[] = [
  {
    id: "competitiveness",
    icon: <Target className="w-5 h-5" />,
    title: "Check Job Competitiveness",
    description: "See how you stack up against a specific job or company",
    color: "from-blue-500/10 to-blue-600/5 border-blue-200",
    prompt:
      "I'd like to check how competitive I am for a specific job or company.",
  },
  {
    id: "readiness",
    icon: <TrendingUp className="w-5 h-5" />,
    title: "Evaluate Career Readiness",
    description: "Assess your readiness for a target career or industry",
    color: "from-violet-500/10 to-violet-600/5 border-violet-200",
    prompt:
      "I want to evaluate my readiness for a target career or industry.",
  },
  {
    id: "roadmap",
    icon: <Map className="w-5 h-5" />,
    title: "Build a Career Roadmap",
    description: "Get a personalized 3–6 month action plan",
    color: "from-emerald-500/10 to-emerald-600/5 border-emerald-200",
    prompt: "I want to build a personalized 3–6 month career roadmap.",
  },
];

const INTAKE_QUESTIONS: Record<string, string[]> = {
  competitiveness: [
    "What's your current school year? (e.g. Junior, Senior, Graduate)",
    "What university do you attend?",
    "What's your major or field of study?",
    "What specific job title or company are you targeting?",
    "What industry is this role in?",
    "What city or region are you open to working in?",
  ],
  readiness: [
    "What's your current school year? (e.g. Junior, Senior, Graduate)",
    "What university do you attend?",
    "What's your major or field of study?",
    "What target career or industry are you evaluating?",
    "What role do you ultimately want to land?",
    "What city or region are you targeting?",
  ],
  roadmap: [
    "What's your current school year? (e.g. Junior, Senior, Graduate)",
    "What university do you attend?",
    "What's your major or field of study?",
    "What role are you aiming for in the next 3–6 months?",
    "What industry are you targeting?",
    "What city or region are you open to working in?",
  ],
};

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
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [step, setStep] = useState<IntakeStep>("goal_select");
  const [intakeAnswers, setIntakeAnswers] = useState<string[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeText, setResumeText] = useState<string>("");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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

  const handleGoalSelect = async (goal: Goal) => {
    setSelectedGoal(goal);
    setStep("collecting");
    addMessage("user", goal.prompt);
    const questions = INTAKE_QUESTIONS[goal.id];
    await simulateAssistantReply(
      `Great choice! I'll help you ${goal.title.toLowerCase()}. I just need a few quick details.\n\n${questions[0]}`
    );
  };

  const handleSendMessage = async () => {
    const text = inputValue.trim();
    if (!text || step === "generating") return;

    setInputValue("");
    addMessage("user", text);

    if (step === "collecting" && selectedGoal) {
      const questions = INTAKE_QUESTIONS[selectedGoal.id];
      const newAnswers = [...intakeAnswers, text];
      setIntakeAnswers(newAnswers);

      if (newAnswers.length < questions.length) {
        await simulateAssistantReply(questions[newAnswers.length]);
        setCurrentQuestion(newAnswers.length);
      } else {
        // All questions answered — ask for resume
        setStep("resume_upload");
        await simulateAssistantReply(
          "Almost there! Please upload your resume so I can personalize your feedback. You can attach a PDF or paste your resume text directly."
        );
      }
    } else if (step === "resume_upload") {
      // User pasted resume text
      setResumeText(text);
      await generateAnalysis(text);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeFile(file);
    addMessage("user", `📄 Uploaded: ${file.name}`);
    await generateAnalysis(null, file);
  };

  const generateAnalysis = async (pastedText: string | null, file?: File) => {
    if (!selectedGoal) return;
    setStep("generating");
    await simulateAssistantReply(
      "Got it! Analyzing your profile now... This will take just a moment. ✨",
      600
    );

    setIsTyping(true);

    try {
      const questions = INTAKE_QUESTIONS[selectedGoal.id];
      const profileSummary = questions
        .map((q, i) => `${q}\n→ ${intakeAnswers[i] ?? "N/A"}`)
        .join("\n\n");

      let resumeContent = pastedText || "";
      if (file) {
        resumeContent = `[Resume file: ${file.name} — analyzing content]`;
      }

      const systemPrompt = `You are Pathwise, an expert career guidance AI for students and early-career professionals. 
Your tone is encouraging, clear, and actionable. Format your response with clear sections using markdown-style headers (##).
Be specific and personalized based on the student's profile.`;

      const userPrompt = `Goal: ${selectedGoal.title}

Student Profile:
${profileSummary}

Resume:
${resumeContent || "Not provided — give general advice based on profile."}

Please provide:
1. A brief assessment of their current position relative to their goal
2. Key strengths they bring
3. 3-5 specific gaps or areas to improve
4. Clear next steps (prioritized action items for the next 30–90 days)
5. An encouraging closing note

Keep it concise, honest, and motivating.`;

      const response = await fetch("/api/ai/career-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemPrompt, userPrompt }),
      });

      if (!response.ok) throw new Error("Analysis failed");

      const data = await response.json();
      setIsTyping(false);
      addMessage("assistant", data.analysis || data.message || "Here's your personalized analysis!");
      setStep("complete");
    } catch (err) {
      setIsTyping(false);
      addMessage(
        "assistant",
        "I couldn't complete the full AI analysis right now, but based on your profile here's what I'd focus on:\n\n## Next Steps\n- Polish your resume to highlight relevant projects and skills\n- Research 5–10 target companies in your desired industry\n- Build 1–2 portfolio projects specific to your target role\n- Connect with 3 professionals on LinkedIn in your target field\n- Practice talking about your work in a concise 2-minute pitch\n\nSign up or log in to get your full personalized roadmap and track your progress!"
      );
      setStep("complete");
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
    setSelectedGoal(null);
    setStep("goal_select");
    setIntakeAnswers([]);
    setCurrentQuestion(0);
    setIsTyping(false);
    setResumeFile(null);
    setResumeText("");
    setInputValue("");
  };

  const isInputEnabled = step === "collecting" || step === "resume_upload";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Logo size="sm" />
          <div className="flex items-center gap-2">
            {user ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {/* Welcome + Goal Selection */}
        {step === "goal_select" && messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 gap-8">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-1.5 text-sm font-medium mb-2">
                <Sparkles className="w-4 h-4" />
                AI-Powered Career Guidance
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
                What's your career goal
                <span className="text-primary"> today?</span>
              </h1>
              <p className="text-muted-foreground text-base max-w-md mx-auto">
                Choose a goal below and I'll guide you through a personalized
                analysis in just a few minutes.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {GOALS.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => handleGoalSelect(goal)}
                  className={`group relative text-left p-5 rounded-2xl border bg-gradient-to-br ${goal.color} hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 cursor-pointer`}
                >
                  <div className="flex flex-col gap-3">
                    <div className="text-primary">{goal.icon}</div>
                    <div>
                      <p className="font-semibold text-sm text-foreground leading-snug">
                        {goal.title}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {goal.description}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="absolute bottom-4 right-4 w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
                </button>
              ))}
            </div>

            <p className="text-xs text-muted-foreground/70">
              No account needed to get started
            </p>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="flex-1 flex flex-col gap-4 pb-4">
            {/* Goal badge */}
            {selectedGoal && (
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="gap-1.5">
                  {selectedGoal.icon}
                  {selectedGoal.title}
                </Badge>
                {step === "complete" && (
                  <button
                    onClick={resetChat}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 ml-auto"
                  >
                    <X className="w-3 h-3" /> Start over
                  </button>
                )}
              </div>
            )}

            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div
                  className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs ${
                    msg.role === "assistant"
                      ? "bg-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>

                {/* Bubble */}
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

            {/* Typing indicator */}
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

            {/* CTA after complete */}
            {step === "complete" && !user && (
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-5 mt-2">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-foreground">
                      Save your results & track progress
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5 mb-3">
                      Create a free account to save this analysis, track your
                      goals, and get weekly updates.
                    </p>
                    <div className="flex gap-2">
                      <Link href="/register">
                        <Button size="sm">
                          Create free account
                          <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                        </Button>
                      </Link>
                      <Link href="/login">
                        <Button variant="outline" size="sm">
                          Sign in
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      {(step === "collecting" || step === "resume_upload") && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-3">
            {step === "resume_upload" && (
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
                <span className="text-xs text-muted-foreground">
                  or paste your resume text below
                </span>
              </div>
            )}
            <div className="flex gap-2 items-end">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  step === "resume_upload"
                    ? "Paste your resume text here…"
                    : "Type your answer…"
                }
                rows={1}
                className="resize-none min-h-[44px] max-h-[160px] text-sm rounded-xl"
                style={{ height: "44px" }}
                onInput={(e) => {
                  const t = e.currentTarget;
                  t.style.height = "44px";
                  t.style.height = `${Math.min(t.scrollHeight, 160)}px`;
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
            <p className="text-xs text-muted-foreground/60 mt-1.5 text-center">
              Press Enter to send · Shift+Enter for new line
            </p>
          </div>
        </div>
      )}

      {step === "generating" && (
        <div className="sticky bottom-0 bg-background/80 backdrop-blur-sm border-t border-border/50">
          <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            Generating your personalized analysis…
          </div>
        </div>
      )}
    </div>
  );
}

function MessageContent({ content }: { content: string }) {
  // Simple markdown-ish renderer for ## headers and bullet points
  const lines = content.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) {
          return (
            <p key={i} className="font-semibold text-sm mt-2 first:mt-0">
              {line.slice(3)}
            </p>
          );
        }
        if (line.startsWith("- ") || line.startsWith("• ")) {
          return (
            <p key={i} className="flex gap-1.5 text-sm">
              <span className="text-primary mt-0.5">•</span>
              <span>{line.slice(2)}</span>
            </p>
          );
        }
        if (line.startsWith("→ ")) {
          return (
            <p key={i} className="text-sm pl-2 text-muted-foreground">
              {line}
            </p>
          );
        }
        if (line.trim() === "") return <div key={i} className="h-1" />;
        return (
          <p key={i} className="text-sm">
            {line}
          </p>
        );
      })}
    </div>
  );
}
