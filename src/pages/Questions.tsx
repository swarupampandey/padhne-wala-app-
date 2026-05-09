import { useState } from "react";
import {
  useGetSubjectChapterTree, useListQuestions, useDeleteQuestion,
  useUpdateQuestion, useAiChat
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Search, Filter, UploadCloud, ChevronRight, CheckCircle2, Database, BookOpen,
  User, Trash2, Edit2, X, Save, Loader2, CheckSquare, Square,
  MessageSquare, Send, BrainCircuit
} from "lucide-react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import type { Question } from "@workspace/api-client-react";

type Source = "main" | "mine";

export default function Questions() {
  const { toast } = useToast();
  const qc = useQueryClient();

  const [source, setSource] = useState<Source>("main");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);

  // Multi-select
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // Edit mode inside drawer
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState<Partial<Question> & { options?: string[] }>({});

  // AI chat inside drawer
  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([]);

  const { data: tree, isLoading: treeLoading } = useGetSubjectChapterTree();
  const { data: questions, isLoading: questionsLoading } = useListQuestions({
    subject: selectedSubject ?? undefined,
    chapter: selectedChapter ?? undefined,
    search: search || undefined,
    source: source as "main" | "mine",
  });

  const deleteMutation = useDeleteQuestion();
  const updateMutation = useUpdateQuestion();
  const chatMutation = useAiChat();

  const selectedQuestion = questions?.find(q => q.id === selectedQuestionId);

  const handleSourceChange = (val: string) => {
    setSource(val as Source);
    setSelectedSubject(null); setSelectedChapter(null);
    setSearch(""); setSelectedQuestionId(null);
    setSelectMode(false); setSelectedIds(new Set());
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === questions?.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(questions?.map(q => q.id) ?? []));
  };

  const handleBulkDelete = async () => {
    if (!selectedIds.size) return;
    if (!confirm(`Delete ${selectedIds.size} question(s)? This cannot be undone.`)) return;
    for (const id of selectedIds) {
      await deleteMutation.mutateAsync({ id });
    }
    setSelectedIds(new Set());
    setSelectMode(false);
    qc.invalidateQueries({ queryKey: ["listQuestions"] });
    qc.invalidateQueries({ queryKey: ["getSubjectChapterTree"] });
    toast({ title: `Deleted ${selectedIds.size} questions` });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this question? This cannot be undone.")) return;
    await deleteMutation.mutateAsync({ id });
    setSelectedQuestionId(null);
    qc.invalidateQueries({ queryKey: ["listQuestions"] });
    qc.invalidateQueries({ queryKey: ["getSubjectChapterTree"] });
    toast({ title: "Question deleted" });
  };

  const handleOpenEdit = () => {
    if (!selectedQuestion) return;
    setEditData({
      subject: selectedQuestion.subject,
      chapter: selectedQuestion.chapter,
      topic: selectedQuestion.topic ?? "",
      originalText: selectedQuestion.originalText,
      options: [...selectedQuestion.options],
      correctAnswer: selectedQuestion.correctAnswer,
      explanation: selectedQuestion.explanation ?? "",
    });
    setEditMode(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedQuestionId) return;
    await updateMutation.mutateAsync({
      id: selectedQuestionId,
      data: {
        subject: editData.subject ?? null,
        chapter: editData.chapter ?? null,
        topic: editData.topic || null,
        originalText: editData.originalText ?? null,
        options: editData.options ?? null,
        correctAnswer: editData.correctAnswer ?? null,
        explanation: editData.explanation || null,
      },
    });
    setEditMode(false);
    qc.invalidateQueries({ queryKey: ["listQuestions"] });
    toast({ title: "Question updated" });
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !selectedQuestion) return;
    const msg = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", content: msg }]);
    try {
      const res = await chatMutation.mutateAsync({
        data: {
          questionText: selectedQuestion.originalText,
          options: selectedQuestion.options,
          correctAnswer: selectedQuestion.correctAnswer,
          explanation: selectedQuestion.explanation,
          userMessage: msg,
          history: chatHistory,
        },
      });
      setChatHistory(prev => [...prev, { role: "assistant", content: res.reply }]);
    } catch {
      toast({ title: "AI chat failed", variant: "destructive" });
    }
  };

  const quickPrompts = [
    "Why is this the correct answer?",
    "Explain with a real example",
    "Give me a memory trick",
    "What are common traps in this type of Q?",
  ];

  return (
    <div className="flex h-full flex-col">
      {/* Top Tab Bar */}
      <div className="border-b border-border bg-card px-6 pt-4 pb-0 flex items-center justify-between gap-4">
        <Tabs value={source} onValueChange={handleSourceChange}>
          <TabsList className="bg-secondary h-10">
            <TabsTrigger value="main" className="gap-2 data-[state=active]:bg-background">
              <BookOpen className="w-4 h-4" /> MAIN QUESTIONS
            </TabsTrigger>
            <TabsTrigger value="mine" className="gap-2 data-[state=active]:bg-background">
              <User className="w-4 h-4" /> MY QUESTIONS
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2 pb-2">
          {/* Multi-select mode toggle */}
          <Button
            size="sm"
            variant={selectMode ? "default" : "outline"}
            className="gap-2 h-9"
            onClick={() => { setSelectMode(!selectMode); setSelectedIds(new Set()); }}
          >
            <CheckSquare className="w-4 h-4" />
            {selectMode ? "Cancel" : "Select"}
          </Button>

          {selectMode && selectedIds.size > 0 && (
            <Button
              size="sm"
              variant="destructive"
              className="gap-2 h-9"
              onClick={handleBulkDelete}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedIds.size}
            </Button>
          )}

          {selectMode && (
            <Button size="sm" variant="outline" className="h-9 text-xs" onClick={handleSelectAll}>
              {selectedIds.size === questions?.length ? "Deselect All" : "Select All"}
            </Button>
          )}

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              className="pl-9 h-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Link href="/import">
            <Button size="sm" className="gap-2 h-9">
              <UploadCloud className="w-4 h-4" /> AI Import
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Sidebar Filter */}
        <div className="w-60 border-r border-border bg-card overflow-y-auto p-4 shrink-0">
          <h2 className="font-bold text-xs text-muted-foreground mb-3 flex items-center gap-2 tracking-widest">
            <Filter className="w-3 h-3" /> SUBJECT FILTER
          </h2>
          <div className="space-y-1">
            <button
              className={`w-full text-left px-2 py-1.5 rounded text-sm ${!selectedSubject ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-secondary'}`}
              onClick={() => { setSelectedSubject(null); setSelectedChapter(null); }}
            >All Subjects</button>
            {treeLoading ? (
              <div className="animate-pulse space-y-2 mt-4">
                <div className="h-4 bg-secondary rounded w-2/3" />
                <div className="h-4 bg-secondary rounded w-1/2" />
              </div>
            ) : (
              tree?.map(subjectNode => (
                <div key={subjectNode.subject} className="pt-2">
                  <button
                    className={`w-full text-left px-2 py-1.5 rounded text-sm font-bold flex justify-between items-center ${selectedSubject === subjectNode.subject && !selectedChapter ? 'bg-primary/10 text-primary' : 'hover:bg-secondary'}`}
                    onClick={() => { setSelectedSubject(subjectNode.subject); setSelectedChapter(null); }}
                  >
                    {subjectNode.subject}
                    <span className="text-xs bg-secondary px-1.5 rounded text-muted-foreground">{subjectNode.count}</span>
                  </button>
                  {(selectedSubject === subjectNode.subject || !selectedSubject) && (
                    <div className="ml-2 pl-2 border-l border-border mt-1 space-y-1">
                      {subjectNode.chapters.map(chapterNode => (
                        <button
                          key={chapterNode.chapter}
                          className={`w-full text-left px-2 py-1 rounded text-xs flex justify-between items-center ${selectedChapter === chapterNode.chapter ? 'bg-primary/10 text-primary font-bold' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'}`}
                          onClick={() => { setSelectedSubject(subjectNode.subject); setSelectedChapter(chapterNode.chapter); }}
                        >
                          <span className="truncate mr-2">{chapterNode.chapter}</span>
                          <span className="text-[10px]">{chapterNode.count}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Question List */}
        <div className="flex-1 p-6 overflow-y-auto bg-secondary/20">
          <div className="mb-4 flex items-center gap-3">
            {source === "main" ? (
              <><BookOpen className="w-5 h-5 text-primary" /><div><div className="font-bold text-sm">Main Questions</div><div className="text-xs text-muted-foreground">Official NEET question bank</div></div></>
            ) : (
              <><User className="w-5 h-5 text-chart-5" /><div><div className="font-bold text-sm">My Questions</div><div className="text-xs text-muted-foreground">Your imported questions</div></div></>
            )}
            {!questionsLoading && (
              <span className="ml-auto text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">{questions?.length ?? 0} questions</span>
            )}
          </div>

          {questionsLoading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-28 bg-card rounded-lg border border-border animate-pulse" />)}</div>
          ) : questions && questions.length > 0 ? (
            <div className="space-y-3">
              {questions.map(q => {
                const isSelected = selectedIds.has(q.id);
                return (
                  <Card
                    key={q.id}
                    className={`transition-all ${selectMode ? 'cursor-pointer' : 'cursor-pointer hover:border-primary hover:shadow-md'} ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                    onClick={() => {
                      if (selectMode) { toggleSelect(q.id); }
                      else { setSelectedQuestionId(q.id); setEditMode(false); setChatHistory([]); setChatOpen(false); }
                    }}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex gap-2 flex-wrap flex-1">
                          {selectMode && (
                            <span className="flex-shrink-0">{isSelected ? <CheckSquare className="w-4 h-4 text-primary" /> : <Square className="w-4 h-4 text-muted-foreground" />}</span>
                          )}
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{q.subject}</Badge>
                          <Badge variant="outline">{q.chapter}</Badge>
                          {q.topic && <Badge variant="secondary">{q.topic}</Badge>}
                        </div>
                        {!selectMode && (
                          <div className="flex items-center gap-1 ml-2">
                            <span className="text-xs text-muted-foreground mr-1">#{q.id}</span>
                            <button
                              className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                              onClick={e => { e.stopPropagation(); setSelectedQuestionId(q.id); setEditMode(false); setChatHistory([]); setChatOpen(false); setTimeout(handleOpenEdit, 50); }}
                              title="Edit"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              onClick={e => { e.stopPropagation(); handleDelete(q.id); }}
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className="line-clamp-2 font-medium text-sm">{q.originalText}</p>
                      {q.aiGeneratedImageUrl && (
                        <div className="mt-1.5 flex items-center gap-1 text-xs text-chart-5">
                          <span className="w-1.5 h-1.5 rounded-full bg-chart-5 inline-block" /> AI diagram attached
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              {source === "mine" ? (
                <><UploadCloud className="w-12 h-12 mb-4 opacity-20" /><p className="mb-4">No imported questions yet.</p>
                  <Link href="/import"><Button variant="outline" size="sm" className="gap-2"><UploadCloud className="w-4 h-4" /> Go to AI Import</Button></Link></>
              ) : (
                <><Database className="w-12 h-12 mb-4 opacity-20" /><p>No questions found for this filter.</p></>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Question Detail Drawer */}
      <Sheet open={!!selectedQuestionId} onOpenChange={open => { if (!open) { setSelectedQuestionId(null); setEditMode(false); setChatOpen(false); setChatHistory([]); } }}>
        <SheetContent className="w-[640px] sm:w-[640px] sm:max-w-none overflow-y-auto flex flex-col">
          {selectedQuestion && (
            <>
              <SheetHeader className="mb-4 border-b border-border pb-4 flex-shrink-0">
                <div className="flex gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{selectedQuestion.subject}</Badge>
                  <Badge variant="outline">{selectedQuestion.chapter}</Badge>
                  {selectedQuestion.topic && <Badge variant="secondary">{selectedQuestion.topic}</Badge>}
                </div>
                <div className="flex items-center justify-between">
                  <SheetTitle className="text-lg">Question #{selectedQuestion.id}</SheetTitle>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={() => { setChatOpen(!chatOpen); }}>
                      <MessageSquare className="w-3.5 h-3.5" /> Ask AI
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 gap-1.5 text-xs" onClick={editMode ? () => setEditMode(false) : handleOpenEdit}>
                      {editMode ? <X className="w-3.5 h-3.5" /> : <Edit2 className="w-3.5 h-3.5" />}
                      {editMode ? "Cancel" : "Edit"}
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(selectedQuestion.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </SheetHeader>

              {/* AI Chat Panel */}
              {chatOpen && (
                <div className="border border-border rounded-xl overflow-hidden mb-4 flex-shrink-0">
                  <div className="bg-primary/10 px-3 py-2 text-xs font-bold text-primary flex items-center gap-2 border-b border-border">
                    <BrainCircuit className="w-3.5 h-3.5" /> AI TUTOR
                  </div>
                  <div className="p-3 max-h-40 overflow-y-auto space-y-2 bg-card">
                    {chatHistory.length === 0 && (
                      <div className="text-xs text-muted-foreground text-center py-2">Ask anything about this question.</div>
                    )}
                    {chatHistory.map((m, i) => (
                      <div key={i} className={`text-xs rounded-lg px-3 py-2 ${m.role === "assistant" ? "bg-primary/10 text-foreground" : "bg-secondary text-foreground ml-4"}`}>
                        <span className="font-bold mr-1.5 text-primary">{m.role === "assistant" ? "AI:" : "You:"}</span>{m.content}
                      </div>
                    ))}
                    {chatMutation.isPending && <Loader2 className="w-4 h-4 animate-spin text-primary mx-auto" />}
                  </div>
                  <div className="p-2 flex flex-wrap gap-1.5 border-t border-border bg-secondary/30">
                    {chatHistory.length === 0 && quickPrompts.map(p => (
                      <button key={p} onClick={() => { setChatMessage(p); }} className="text-[10px] px-2 py-1 rounded-full border border-border bg-card hover:bg-secondary text-muted-foreground transition-colors">
                        {p}
                      </button>
                    ))}
                  </div>
                  <div className="p-2 flex gap-2 bg-background border-t border-border">
                    <Input
                      placeholder="Ask the AI tutor..." value={chatMessage}
                      onChange={e => setChatMessage(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSendChat()}
                      className="h-8 text-xs border-none bg-secondary/50"
                    />
                    <Button size="sm" className="h-8 w-8 p-0 shrink-0" onClick={handleSendChat}>
                      <Send className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )}

              {/* View Mode */}
              {!editMode ? (
                <div className="space-y-6 flex-1 overflow-y-auto">
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 tracking-widest uppercase">
                      <ChevronRight className="w-4 h-4 text-primary" /> Question
                    </h3>
                    <div className="bg-secondary/50 p-4 rounded-md leading-relaxed">{selectedQuestion.originalText}</div>
                    {selectedQuestion.aiGeneratedImageUrl && (
                      <div className="mt-3 border border-border rounded-md overflow-hidden"><img src={selectedQuestion.aiGeneratedImageUrl} alt="Diagram" className="w-full h-auto" /></div>
                    )}
                    {selectedQuestion.originalImageUrl && !selectedQuestion.aiGeneratedImageUrl && (
                      <div className="mt-3 border border-border rounded-md overflow-hidden"><img src={selectedQuestion.originalImageUrl} alt="Original" className="w-full h-auto opacity-70" /></div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 tracking-widest uppercase">
                      <ChevronRight className="w-4 h-4 text-primary" /> Options
                    </h3>
                    <div className="grid gap-2">
                      {selectedQuestion.options.map((opt, idx) => (
                        <div key={idx} className={`p-3 rounded border flex items-center gap-3 text-sm ${idx === selectedQuestion.correctAnswer ? 'border-chart-1 bg-chart-1/10 text-chart-1' : 'border-border bg-card'}`}>
                          <div className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold flex-shrink-0 ${idx === selectedQuestion.correctAnswer ? 'bg-chart-1 text-white' : 'bg-secondary text-muted-foreground'}`}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          {opt}
                          {idx === selectedQuestion.correctAnswer && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedQuestion.explanation && (
                    <div>
                      <h3 className="text-xs font-bold text-muted-foreground mb-2 flex items-center gap-2 tracking-widest uppercase">
                        <ChevronRight className="w-4 h-4 text-primary" /> Explanation
                      </h3>
                      <div className="bg-primary/5 border border-primary/20 p-4 rounded-md text-sm leading-relaxed">{selectedQuestion.explanation}</div>
                    </div>
                  )}
                </div>
              ) : (
                /* Edit Mode */
                <div className="space-y-4 flex-1 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-3">
                    <div><Label className="text-xs">Subject</Label><Input value={editData.subject ?? ""} onChange={e => setEditData(d => ({ ...d, subject: e.target.value }))} className="h-8 text-sm mt-1" /></div>
                    <div><Label className="text-xs">Chapter</Label><Input value={editData.chapter ?? ""} onChange={e => setEditData(d => ({ ...d, chapter: e.target.value }))} className="h-8 text-sm mt-1" /></div>
                    <div className="col-span-2"><Label className="text-xs">Topic (optional)</Label><Input value={editData.topic ?? ""} onChange={e => setEditData(d => ({ ...d, topic: e.target.value }))} className="h-8 text-sm mt-1" /></div>
                  </div>
                  <div>
                    <Label className="text-xs">Question Text</Label>
                    <Textarea value={editData.originalText ?? ""} onChange={e => setEditData(d => ({ ...d, originalText: e.target.value }))} className="mt-1 text-sm min-h-[80px]" />
                  </div>
                  <div>
                    <Label className="text-xs mb-2 block">Options — click letter to mark correct</Label>
                    <div className="grid gap-2">
                      {(editData.options ?? []).map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <button
                            onClick={() => setEditData(d => ({ ...d, correctAnswer: idx }))}
                            className={`w-7 h-7 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-bold transition-all ${editData.correctAnswer === idx ? "bg-chart-1 text-white" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                          >
                            {String.fromCharCode(65 + idx)}
                          </button>
                          <Input value={opt} className="h-8 text-sm" onChange={e => {
                            const opts = [...(editData.options ?? [])];
                            opts[idx] = e.target.value;
                            setEditData(d => ({ ...d, options: opts }));
                          }} />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Explanation</Label>
                    <Textarea value={editData.explanation ?? ""} onChange={e => setEditData(d => ({ ...d, explanation: e.target.value }))} className="mt-1 text-sm min-h-[60px]" />
                  </div>
                  <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="w-full gap-2 font-bold">
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Save Changes
                  </Button>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
