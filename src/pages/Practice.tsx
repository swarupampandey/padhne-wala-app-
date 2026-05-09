import { useState, useRef, useEffect } from "react";
import { useGetSubjectChapterTree, useStartPracticeSession, useSubmitPracticeAnswer, useAiChat } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  BrainCircuit, Play, CheckCircle2, XCircle, Loader2,
  Send, ArrowRight, Zap, Lightbulb, Trophy, AlertCircle, X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import type { Question } from "@workspace/api-client-react";

const QUICK_PROMPTS = [
  { label: "Why correct?", msg: "Why is this the correct answer? Explain clearly." },
  { label: "Why wrong?", msg: "Explain why the wrong options are incorrect." },
  { label: "Memory trick", msg: "Give me a quick memory trick or mnemonic for this concept." },
  { label: "NEET pattern", msg: "How is this type of question commonly asked in NEET? What patterns should I watch for?" },
  { label: "Related topics", msg: "What related topics or concepts should I revise along with this?" },
  { label: "Simplify", msg: "Explain this in the simplest terms possible, like I'm a beginner." },
];

export default function Practice() {
  const { toast } = useToast();
  const { userId } = useAuth();
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const { data: tree, isLoading: treeLoading } = useGetSubjectChapterTree();
  const startSessionMutation = useStartPracticeSession();
  const submitAnswerMutation = useSubmitPracticeAnswer();
  const chatMutation = useAiChat();

  const [selectedChapters, setSelectedChapters] = useState<{ subject: string; chapter: string }[]>([]);
  const [mode, setMode] = useState<"sudden" | "after">("sudden");
  const [count, setCount] = useState("10");

  const [sessionActive, setSessionActive] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [sessionFinished, setSessionFinished] = useState(false);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);
  const [chatError, setChatError] = useState<string | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory, chatMutation.isPending]);

  const handleToggleChapter = (subject: string, chapter: string) => {
    setSelectedChapters(prev => {
      const exists = prev.find(p => p.subject === subject && p.chapter === chapter);
      if (exists) return prev.filter(p => !(p.subject === subject && p.chapter === chapter));
      return [...prev, { subject, chapter }];
    });
  };

  const handleSelectAllChapters = (subject: string, chapters: string[]) => {
    const allSelected = chapters.every(ch => selectedChapters.find(p => p.subject === subject && p.chapter === ch));
    if (allSelected) {
      setSelectedChapters(prev => prev.filter(p => p.subject !== subject));
    } else {
      const newOnes = chapters.filter(ch => !selectedChapters.find(p => p.subject === subject && p.chapter === ch)).map(ch => ({ subject, chapter: ch }));
      setSelectedChapters(prev => [...prev, ...newOnes]);
    }
  };

  const handleStart = async () => {
    if (selectedChapters.length === 0) {
      toast({ title: "Select at least one chapter", variant: "destructive" });
      return;
    }
    try {
      const res = await startSessionMutation.mutateAsync({
        data: { subjectChapters: selectedChapters, mode, limit: parseInt(count) }
      });
      if (res.length === 0) {
        toast({ title: "No questions found for selected chapters" });
        return;
      }
      setQuestions(res);
      setCurrentIndex(0);
      setAnswers({});
      setSessionFinished(false);
      setSessionActive(true);
      setChatHistory([]);
      setChatError(null);
    } catch {
      toast({ title: "Failed to start session", variant: "destructive" });
    }
  };

  const handleAnswer = async (optIndex: number) => {
    const q = questions[currentIndex];
    if (answers[q.id] !== undefined) return;
    setAnswers(prev => ({ ...prev, [q.id]: optIndex }));
    if (mode === "sudden") {
      setChatHistory([]);
      setChatError(null);
      try {
        await submitAnswerMutation.mutateAsync({ data: { questionId: q.id, selectedAnswer: optIndex, userId } });
      } catch { }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1);
      setChatHistory([]);
      setChatError(null);
    } else {
      if (mode === "after") {
        Promise.all(questions.map(q => {
          if (answers[q.id] !== undefined) {
            return submitAnswerMutation.mutateAsync({ data: { questionId: q.id, selectedAnswer: answers[q.id], userId } });
          }
          return Promise.resolve();
        }));
      }
      setSessionFinished(true);
    }
  };

  const handleSendChat = async (overrideMsg?: string) => {
    const msg = overrideMsg ?? chatMessage;
    if (!msg.trim()) return;
    const q = questions[currentIndex];
    setChatMessage("");
    setChatError(null);
    setChatHistory(prev => [...prev, { role: "user", content: msg }]);
    try {
      const res = await chatMutation.mutateAsync({
        data: {
          questionId: q.id,
          questionText: q.originalText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          userMessage: msg,
          history: chatHistory,
        }
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e: any) {
      const errMsg = e?.data?.error ?? e?.message ?? "AI chat failed";
      setChatError(errMsg);
      setChatHistory(prev => prev.slice(0, -1));
    }
  };

  // Session finished screen
  if (sessionFinished) {
    const score = questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-full p-8">
        <div className="w-full max-w-lg text-center">
          <Trophy className={`w-20 h-20 mx-auto mb-6 ${pct >= 80 ? 'text-chart-2' : pct >= 60 ? 'text-chart-5' : 'text-muted-foreground'}`} />
          <div className="text-xs tracking-widest text-muted-foreground uppercase mb-2">Session Complete</div>
          <div className="text-7xl font-black text-primary mb-2">{score}<span className="text-3xl text-muted-foreground font-normal"> / {questions.length}</span></div>
          <div className="text-2xl font-bold mb-6">{pct >= 80 ? "Excellent!" : pct >= 60 ? "Good Work!" : "Keep Practicing!"}</div>
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: "Correct", value: score, color: "text-chart-1" },
              { label: "Wrong", value: questions.length - score, color: "text-destructive" },
              { label: "Accuracy", value: `${pct}%`, color: "text-primary" },
            ].map(stat => (
              <div key={stat.label} className="bg-card border border-border rounded-xl p-4">
                <div className={`text-3xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted-foreground mb-6">Wrong answers have been saved to your Mistake Book.</p>
          <Button size="lg" className="font-bold tracking-wider px-12" onClick={() => setSessionActive(false)}>
            Return to Command
          </Button>
        </div>
      </div>
    );
  }

  // Active session screen
  if (sessionActive && questions.length > 0) {
    const q = questions[currentIndex];
    const answeredOpt = answers[q.id];
    const isAnswered = answeredOpt !== undefined;
    const showFeedback = mode === "sudden" && isAnswered;

    return (
      <div className="flex flex-col h-full bg-background relative">
        {/* Progress bar */}
        <div className="h-1 bg-secondary absolute top-0 left-0 right-0 z-10">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(currentIndex / questions.length) * 100}%` }} />
        </div>

        <div className="flex flex-1 min-h-0 pt-1">
          {/* Main question area */}
          <div className="flex-1 overflow-y-auto p-8 max-w-3xl mx-auto w-full">
            <div className="text-xs font-bold text-muted-foreground mb-6 tracking-widest uppercase flex justify-between items-center">
              <span>Question {currentIndex + 1} <span className="text-muted-foreground/50">of {questions.length}</span></span>
              <span className="flex items-center gap-2">
                <span className="text-primary">{q.subject}</span>
                <span className="text-muted-foreground/40">•</span>
                <span>{q.chapter}</span>
              </span>
            </div>

            <div className="text-xl font-medium leading-relaxed mb-8">{q.originalText}</div>

            {q.aiGeneratedImageUrl && (
              <div className="mb-6 border border-border rounded-xl p-3 bg-secondary/20 flex justify-center">
                <img src={q.aiGeneratedImageUrl} alt="Diagram" className="max-h-56 object-contain rounded" />
              </div>
            )}

            <div className="grid gap-3 mb-6">
              {q.options.map((opt, idx) => {
                let cls = "border-border hover:bg-secondary/50 bg-card";
                let icon = null;
                if (showFeedback) {
                  if (idx === q.correctAnswer) {
                    cls = "border-chart-1 bg-chart-1/10 text-chart-1 font-semibold";
                    icon = <CheckCircle2 className="w-5 h-5 ml-auto flex-shrink-0 text-chart-1" />;
                  } else if (idx === answeredOpt) {
                    cls = "border-destructive bg-destructive/10 text-destructive";
                    icon = <XCircle className="w-5 h-5 ml-auto flex-shrink-0 text-destructive" />;
                  }
                } else if (isAnswered && idx === answeredOpt) {
                  cls = "border-primary bg-primary/10 text-primary";
                }
                return (
                  <button
                    key={idx}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold flex-shrink-0 text-sm ${showFeedback && idx === q.correctAnswer ? 'bg-chart-1 text-white' : 'bg-secondary text-muted-foreground'}`}>
                      {String.fromCharCode(65 + idx)}
                    </div>
                    <span className="text-base flex-1">{opt}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation card */}
            {showFeedback && q.explanation && (
              <Card className="border-primary/30 bg-primary/5 mb-4 animate-in fade-in slide-in-from-bottom-2">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest mb-2">
                    <Lightbulb className="w-4 h-4" /> Explanation
                  </div>
                  <p className="text-sm leading-relaxed">{q.explanation}</p>
                </CardContent>
              </Card>
            )}

            {/* Next button */}
            {(showFeedback || (mode === "after" && isAnswered)) && (
              <div className="flex justify-end mt-4">
                <Button size="lg" className="font-bold tracking-wider gap-2" onClick={handleNext}>
                  {currentIndex < questions.length - 1 ? "Next Question" : "Finish Session"} <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>

          {/* AI Tutor Sidebar (only in sudden mode after answering) */}
          {showFeedback && (
            <div className="w-80 border-l border-border bg-card flex flex-col shrink-0 animate-in slide-in-from-right-4">
              <div className="p-3 border-b border-border bg-primary/10 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-primary" />
                <div className="font-bold text-xs text-primary uppercase tracking-widest flex-1">AI Tutor</div>
                <div className="text-[10px] text-muted-foreground">Ask anything</div>
              </div>

              {/* Chat messages */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatHistory.length === 0 && (
                  <div className="text-xs text-muted-foreground text-center py-4">
                    Tap a quick prompt or type your own question below.
                  </div>
                )}
                {chatHistory.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-xl px-3 py-2 leading-relaxed ${msg.role === "assistant"
                      ? "bg-primary/10 text-foreground border border-primary/20"
                      : "bg-secondary text-foreground ml-3"
                    }`}
                  >
                    <div className="font-bold mb-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {msg.role === "assistant" ? "AI" : "You"}
                    </div>
                    {msg.content}
                  </div>
                ))}
                {chatMutation.isPending && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground px-3 py-2">
                    <Loader2 className="w-3 h-3 animate-spin text-primary" /> Thinking...
                  </div>
                )}
                {chatError && (
                  <div className="text-xs text-destructive px-3 py-2 flex items-start gap-2 bg-destructive/10 rounded-lg">
                    <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    <span>{chatError}</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick prompts */}
              {chatHistory.length === 0 && (
                <div className="p-2 border-t border-border grid grid-cols-1 gap-1">
                  {QUICK_PROMPTS.map(p => (
                    <button
                      key={p.label}
                      onClick={() => handleSendChat(p.msg)}
                      disabled={chatMutation.isPending}
                      className="text-[10px] text-left px-2.5 py-1.5 rounded-lg border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Zap className="w-2.5 h-2.5 text-primary flex-shrink-0" /> {p.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Chat input */}
              <div className="p-2 border-t border-border flex gap-2 bg-background">
                <Input
                  placeholder="Ask about this question..."
                  value={chatMessage}
                  onChange={e => setChatMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSendChat()}
                  className="border-none bg-secondary/50 h-8 text-xs"
                  disabled={chatMutation.isPending}
                />
                <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={() => handleSendChat()} disabled={chatMutation.isPending}>
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Setup Screen
  return (
    <div className="flex h-full">
      {/* Chapter selector sidebar */}
      <div className="w-80 border-r border-border bg-card p-5 overflow-y-auto shrink-0">
        <h2 className="font-bold text-xs text-muted-foreground mb-4 tracking-widest uppercase">Chapter Select</h2>
        {treeLoading ? (
          <div className="space-y-3">{[1, 2, 3].map(i => <div key={i} className="h-6 bg-secondary rounded animate-pulse" />)}</div>
        ) : (
          <div className="space-y-5">
            {tree?.map(subjectNode => {
              const allChapters = subjectNode.chapters.map(c => c.chapter);
              const allSelected = allChapters.every(ch => selectedChapters.find(p => p.subject === subjectNode.subject && p.chapter === ch));
              return (
                <div key={subjectNode.subject}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-bold text-sm text-primary">{subjectNode.subject}</div>
                    <button
                      onClick={() => handleSelectAllChapters(subjectNode.subject, allChapters)}
                      className="text-[10px] text-muted-foreground hover:text-primary transition-colors"
                    >
                      {allSelected ? "Deselect all" : "Select all"}
                    </button>
                  </div>
                  <div className="space-y-2 pl-2 border-l-2 border-border/50">
                    {subjectNode.chapters.map(chapterNode => {
                      const checked = !!selectedChapters.find(p => p.subject === subjectNode.subject && p.chapter === chapterNode.chapter);
                      return (
                        <div key={chapterNode.chapter} className="flex items-center gap-2">
                          <Checkbox
                            id={`chk-${subjectNode.subject}-${chapterNode.chapter}`}
                            checked={checked}
                            onCheckedChange={() => handleToggleChapter(subjectNode.subject, chapterNode.chapter)}
                          />
                          <label htmlFor={`chk-${subjectNode.subject}-${chapterNode.chapter}`} className="text-sm cursor-pointer flex-1 leading-none">
                            {chapterNode.chapter} <span className="text-xs text-muted-foreground">({chapterNode.count})</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Config panel */}
      <div className="flex-1 p-12 flex flex-col justify-center max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold tracking-tighter mb-1">TRAINING GROUNDS</h1>
        <p className="text-muted-foreground mb-10">Configure your practice parameters and start a session.</p>

        {selectedChapters.length > 0 && (
          <div className="mb-6 p-3 bg-primary/10 border border-primary/30 rounded-xl flex flex-wrap gap-1.5">
            {selectedChapters.map(s => (
              <span key={`${s.subject}-${s.chapter}`} className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full flex items-center gap-1">
                {s.chapter}
                <button onClick={() => handleToggleChapter(s.subject, s.chapter)} className="hover:text-destructive"><X className="w-2.5 h-2.5" /></button>
              </span>
            ))}
          </div>
        )}

        <div className="space-y-6 mb-10">
          <div>
            <div className="text-xs text-muted-foreground tracking-widest font-bold mb-3 uppercase">Evaluation Mode</div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "sudden", label: "Sudden Solution", desc: "Instant feedback + AI Tutor after each question. Best for learning." },
                { id: "after", label: "After Solve", desc: "Mock test mode. No feedback until the end. Best for speed." },
              ].map(m => (
                <div
                  key={m.id}
                  className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${mode === m.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                  onClick={() => setMode(m.id as "sudden" | "after")}
                >
                  <div className="font-bold text-sm text-primary mb-1">{m.label}</div>
                  <div className="text-xs text-muted-foreground">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground tracking-widest font-bold mb-3 uppercase">Question Count</div>
            <Select value={count} onValueChange={setCount}>
              <SelectTrigger className="bg-secondary border-none h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 Questions (Sprint)</SelectItem>
                <SelectItem value="10">10 Questions (Quick)</SelectItem>
                <SelectItem value="20">20 Questions (Standard)</SelectItem>
                <SelectItem value="40">40 Questions (Intense)</SelectItem>
                <SelectItem value="100">100 Questions (Full Mock)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          size="lg"
          className="w-full h-14 text-base font-bold tracking-widest gap-3"
          onClick={handleStart}
          disabled={startSessionMutation.isPending || selectedChapters.length === 0}
        >
          {startSessionMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
          {selectedChapters.length === 0 ? "Select chapters to start" : "Initialize Session"}
        </Button>
      </div>
    </div>
  );
}
