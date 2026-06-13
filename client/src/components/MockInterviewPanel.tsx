import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Square,
  Volume2,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Loader2,
} from "lucide-react";

export interface InterviewQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: string;
  tips: string[];
}

export interface SessionAnswer {
  questionIndex: number;
  question: string;
  transcript: string;
  durationSeconds: number;
  words: WordTimestamp[];
}

export interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface MockInterviewPanelProps {
  questions: InterviewQuestion[];
  role: string;
  onSessionComplete: (answers: SessionAnswer[]) => void;
}

type Phase =
  | "intro"
  | "permission_denied"
  | "asking"
  | "recording"
  | "transcribing"
  | "reviewing"
  | "done";

export default function MockInterviewPanel({
  questions,
  role,
  onSessionComplete,
}: MockInterviewPanelProps) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTranscript, setCurrentTranscript] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const [ttsActive, setTtsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionError, setPermissionError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mimeTypeRef = useRef("audio/webm");
  const answersRef = useRef<SessionAnswer[]>([]);

  useEffect(() => {
    return () => {
      stopAllTracks();
      if (timerRef.current) clearInterval(timerRef.current);
      window.speechSynthesis.cancel();
    };
  }, []);

  function stopAllTracks() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }

  async function startSession() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.muted = true;
      }
      setPhase("asking");
    } catch (err: any) {
      const msg =
        err.name === "NotAllowedError" || err.name === "PermissionDeniedError"
          ? "Camera and microphone access was denied. Please allow access in your browser settings and try again."
          : err.name === "NotFoundError"
          ? "No camera or microphone detected. Please connect a device and try again."
          : `Could not access camera/microphone: ${err.message}`;
      setPermissionError(msg);
      setPhase("permission_denied");
    }
  }

  function speakQuestion(text: string) {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.rate = 0.92;
    utt.onstart = () => setTtsActive(true);
    utt.onend = () => setTtsActive(false);
    utt.onerror = () => setTtsActive(false);
    window.speechSynthesis.speak(utt);
  }

  function stopTTS() {
    window.speechSynthesis.cancel();
    setTtsActive(false);
  }

  function startRecording() {
    if (!streamRef.current) return;
    stopTTS();
    setError(null);
    chunksRef.current = [];

    const audioStream = new MediaStream(streamRef.current.getAudioTracks());

    const preferredMime = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/ogg;codecs=opus",
      "audio/mp4",
    ].find((t) => MediaRecorder.isTypeSupported(t));

    mimeTypeRef.current = preferredMime || "audio/webm";

    let mr: MediaRecorder;
    try {
      mr = new MediaRecorder(
        audioStream,
        preferredMime ? { mimeType: preferredMime } : undefined
      );
    } catch {
      mr = new MediaRecorder(audioStream);
      mimeTypeRef.current = mr.mimeType;
    }

    mr.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    mr.start(200);
    mediaRecorderRef.current = mr;
    startTimeRef.current = Date.now();
    setElapsed(0);

    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 1000);

    setPhase("recording");
  }

  async function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    const mr = mediaRecorderRef.current;
    if (!mr || mr.state === "inactive") return;
    const durationMs = Date.now() - startTimeRef.current;

    await new Promise<void>((resolve) => {
      mr.onstop = () => resolve();
      mr.stop();
    });

    const blob = new Blob(chunksRef.current, { type: mimeTypeRef.current });
    setPhase("transcribing");
    await transcribeAudio(blob, Math.round(durationMs / 1000));
  }

  async function transcribeAudio(blob: Blob, durationSeconds: number) {
    try {
      const base64 = await blobToBase64(blob);
      const res = await fetch("/api/mock-interview/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({
          audio: base64,
          mimeType: blob.type || "audio/webm",
        }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || "Transcription failed");
      }
      const data = await res.json();
      const text: string = data.text || "";
      const words: WordTimestamp[] = data.words || [];

      const answer: SessionAnswer = {
        questionIndex: currentIndex,
        question: questions[currentIndex].question,
        transcript: text,
        durationSeconds,
        words,
      };

      answersRef.current = [...answersRef.current, answer];
      setCurrentTranscript(text);
      setPhase("reviewing");
    } catch (err: any) {
      setError(err.message || "Transcription failed. Please try again.");
      setPhase("asking");
    }
  }

  function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  function handleNext() {
    setCurrentTranscript("");
    setError(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((i) => i + 1);
      setPhase("asking");
    } else {
      finishSession();
    }
  }

  function finishSession() {
    stopAllTracks();
    window.speechSynthesis.cancel();
    setPhase("done");
    onSessionComplete(answersRef.current);
  }

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  }

  const q = questions[currentIndex];
  const isLast = currentIndex === questions.length - 1;
  const progressPct = (currentIndex / questions.length) * 100;

  return (
    <div className="border border-border/60 rounded-2xl bg-card shadow-sm overflow-hidden w-full max-w-2xl mt-2">
      {/* Header */}
      <div className="px-5 pt-4 pb-3 border-b border-border/40 bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-sm text-foreground">
              🎤 Mock Interview
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {role} · {questions.length} questions
            </p>
          </div>
          {phase !== "intro" &&
            phase !== "permission_denied" &&
            phase !== "done" && (
              <div className="text-right">
                <span className="text-xs text-muted-foreground">
                  Q{currentIndex + 1} of {questions.length}
                </span>
                <div className="w-24 h-1.5 bg-muted rounded-full mt-1 overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="p-5 space-y-4">
        {/* ── INTRO ────────────────────────────────────────────────── */}
        {phase === "intro" && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              You'll be asked {questions.length} questions one at a time. Each
              question can be read aloud. Record your answer, then move to the
              next. Your full critique will appear after the last question.
            </p>
            <div className="space-y-1.5">
              {questions.map((iq, i) => (
                <div
                  key={iq.id}
                  className="flex items-start gap-2 text-xs text-muted-foreground"
                >
                  <span className="mt-0.5 font-medium text-foreground/50 w-4 flex-shrink-0">
                    {i + 1}.
                  </span>
                  <span className="line-clamp-1">{iq.question}</span>
                </div>
              ))}
            </div>
            <Button
              data-testid="button-start-session"
              onClick={startSession}
              className="w-full"
              size="sm"
            >
              Start Session
            </Button>
          </div>
        )}

        {/* ── PERMISSION DENIED ────────────────────────────────────── */}
        {phase === "permission_denied" && (
          <div className="space-y-3">
            <div className="flex items-start gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>{permissionError}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setPermissionError("");
                setPhase("intro");
              }}
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Try Again
            </Button>
          </div>
        )}

        {/* ── ASKING / RECORDING / TRANSCRIBING / REVIEWING ────────── */}
        {(phase === "asking" ||
          phase === "recording" ||
          phase === "transcribing" ||
          phase === "reviewing") &&
          q && (
            <div className="space-y-4">
              {/* Question */}
              <div className="bg-muted/40 rounded-xl p-4">
                <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                  Question {currentIndex + 1}
                </p>
                <p className="text-sm font-medium text-foreground leading-relaxed">
                  {q.question}
                </p>
                {phase === "asking" && (
                  <button
                    onClick={() =>
                      ttsActive ? stopTTS() : speakQuestion(q.question)
                    }
                    className="mt-2.5 flex items-center gap-1.5 text-xs text-primary hover:text-primary/70 transition-colors"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {ttsActive ? "Stop reading" : "Hear question"}
                  </button>
                )}
              </div>

              {/* Error banner */}
              {error && (
                <div className="flex items-start gap-2 text-xs text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Camera preview */}
              {(phase === "asking" ||
                phase === "recording" ||
                phase === "transcribing") && (
                <div className="relative rounded-xl overflow-hidden bg-black aspect-video">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  {phase === "recording" && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/60 rounded-full px-2.5 py-1">
                      <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                      <span className="text-xs text-white font-mono">
                        {formatTime(elapsed)}
                      </span>
                    </div>
                  )}
                  {phase === "transcribing" && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <div className="flex items-center gap-2 text-white text-sm">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Transcribing…
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Record / Stop buttons */}
              {phase === "asking" && (
                <Button
                  data-testid="button-start-recording"
                  onClick={startRecording}
                  size="sm"
                  className="w-full bg-red-600 hover:bg-red-700 text-white"
                >
                  <Mic className="w-3.5 h-3.5 mr-1.5" />
                  Start Recording
                </Button>
              )}

              {phase === "recording" && (
                <Button
                  data-testid="button-stop-recording"
                  onClick={stopRecording}
                  variant="outline"
                  size="sm"
                  className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-950/20"
                >
                  <Square className="w-3.5 h-3.5 mr-1.5 fill-current" />
                  Stop Recording
                </Button>
              )}

              {/* Transcript review */}
              {phase === "reviewing" && (
                <div className="space-y-3">
                  <div className="bg-muted/30 border border-border/40 rounded-xl p-3">
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Your answer (transcript)
                    </p>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {currentTranscript || (
                        <span className="italic text-muted-foreground">
                          No speech detected — try recording again.
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    data-testid="button-next-question"
                    onClick={handleNext}
                    size="sm"
                    className="w-full"
                  >
                    {isLast ? (
                      <>
                        Finish &amp; Get Critique
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    ) : (
                      <>
                        Next Question
                        <ChevronRight className="w-3.5 h-3.5 ml-1" />
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          )}

        {/* ── DONE ─────────────────────────────────────────────────── */}
        {phase === "done" && (
          <div className="flex items-center gap-3 py-1">
            <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Session complete!
              </p>
              <p className="text-xs text-muted-foreground">
                Generating your full critique below…
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
