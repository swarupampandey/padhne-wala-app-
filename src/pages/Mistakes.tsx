import { useState } from "react";
import { useListWeakAreas, useGetWeakAreaStats, useUpdateWeakArea, useDeleteWeakArea, useCreateWeakArea } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BookX, CheckCircle, Trash2, ShieldAlert, Plus, X, PenLine, BarChart2, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { getListWeakAreasQueryKey, getGetWeakAreaStatsQueryKey } from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

const SUBJECTS = ["Physics", "Chemistry", "Biology", "General"];
const SUBJECT_COLORS: Record<string, string> = {
  Physics: "hsl(var(--chart-1))",
  Chemistry: "hsl(var(--chart-2))",
  Biology: "hsl(var(--chart-5))",
  General: "hsl(var(--chart-3))",
};

interface ManualForm {
  subject: string;
  chapter: string;
  questionText: string;
  correctAnswer: string;
  explanation: string;
  studentNotes: string;
}

const emptyForm = (): ManualForm => ({
  subject: "Physics",
  chapter: "",
  questionText: "",
  correctAnswer: "",
  explanation: "",
  studentNotes: "",
});

export default function Mistakes() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { toast } = useToast();
  const [subjectTab, setSubjectTab] = useState("All");
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState<ManualForm>(emptyForm());
  const [viewMode, setViewMode] = useState<"list" | "chart">("list");

  const { data: stats } = useGetWeakAreaStats();
  const { data: weakAreas, isLoading } = useListWeakAreas({
    subject: subjectTab !== "All" ? subjectTab : undefined,
  });

  const updateMutation = useUpdateWeakArea();
  const deleteMutation = useDeleteWeakArea();
  const createMutation = useCreateWeakArea();

  const handleUpdateNotes = (id: number, notes: string) => {
    updateMutation.mutate({ id, data: { studentNotes: notes } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListWeakAreasQueryKey() }),
    });
  };

  const handleToggleResolved = (id: number, resolved: boolean) => {
    updateMutation.mutate({ id, data: { resolved } }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWeakAreasQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeakAreaStatsQueryKey() });
      },
    });
  };

  const handleDelete = (id: number) => {
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListWeakAreasQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetWeakAreaStatsQueryKey() });
      },
    });
  };

  const handleManualAdd = async () => {
    if (!form.questionText || !form.correctAnswer || !form.chapter) {
      toast({ title: "Fill in subject, chapter, question, and correct answer", variant: "destructive" });
      return;
    }
    try {
      await createMutation.mutateAsync({
        data: {
          subject: form.subject,
          chapter: form.chapter,
          questionText: form.questionText,
          correctAnswer: form.correctAnswer,
          explanation: form.explanation || null,
          studentNotes: form.studentNotes || null,
          userId: userId ?? null,
        },
      });
      toast({ title: "Mistake logged!", className: "bg-chart-1 text-white border-none" });
      setForm(emptyForm());
      setShowAddForm(false);
      queryClient.invalidateQueries({ queryKey: getListWeakAreasQueryKey() });
      queryClient.invalidateQueries({ queryKey: getGetWeakAreaStatsQueryKey() });
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const chartData = stats?.map(s => ({
    name: s.chapter.length > 12 ? s.chapter.slice(0, 12) + "…" : s.chapter,
    total: s.count,
    unresolved: s.count - s.resolved,
    subject: s.subject,
  })) || [];

  const totalUnresolved = weakAreas?.filter(w => !w.resolved).length || 0;
  const totalResolved = weakAreas?.filter(w => w.resolved).length || 0;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-card/60 px-6 py-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-destructive/20 flex items-center justify-center">
              <BookX className="w-4 h-4 text-destructive" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tighter">MISTAKE BOOK</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Identify & Neutralize Weaknesses</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Stats pills */}
            <div className="flex gap-2">
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-destructive/10 text-destructive text-xs font-bold border border-destructive/20">
                <ShieldAlert className="w-3 h-3" />{totalUnresolved} Active
              </span>
              <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-chart-1/10 text-chart-1 text-xs font-bold border border-chart-1/20">
                <CheckCircle className="w-3 h-3" />{totalResolved} Resolved
              </span>
            </div>

            {/* View toggle */}
            <div className="flex gap-1 bg-secondary rounded-md p-1">
              <button onClick={() => setViewMode("list")} className={`px-2 py-1 rounded text-xs font-medium transition-all ${viewMode === "list" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>List</button>
              <button onClick={() => setViewMode("chart")} className={`px-2 py-1 rounded text-xs font-medium transition-all flex items-center gap-1 ${viewMode === "chart" ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>
                <BarChart2 className="w-3 h-3" />Map
              </button>
            </div>

            <Button
              size="sm"
              onClick={() => setShowAddForm(true)}
              className="gap-1.5 text-xs h-8"
            >
              <Plus className="w-3.5 h-3.5" /> Add Mistake
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Chart view */}
        {viewMode === "chart" && chartData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4">Vulnerability Map — Unresolved by Chapter</div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    cursor={{ fill: "hsl(var(--secondary))" }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                  />
                  <Bar dataKey="unresolved" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={SUBJECT_COLORS[entry.subject] || "hsl(var(--destructive))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Manual Add Form (inline slide-down) */}
        {showAddForm && (
          <div className="mb-5 bg-card border border-primary/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-primary/5">
              <div className="flex items-center gap-2">
                <PenLine className="w-4 h-4 text-primary" />
                <span className="font-bold text-sm">Log a Manual Mistake</span>
              </div>
              <button onClick={() => { setShowAddForm(false); setForm(emptyForm()); }} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Subject *</Label>
                  <Select value={form.subject} onValueChange={v => setForm(f => ({ ...f, subject: v }))}>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Chapter *</Label>
                  <Input
                    value={form.chapter}
                    onChange={e => setForm(f => ({ ...f, chapter: e.target.value }))}
                    placeholder="e.g. Laws of Motion"
                    className="h-8 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">What I Got Wrong / What Confused Me *</Label>
                <Textarea
                  value={form.questionText}
                  onChange={e => setForm(f => ({ ...f, questionText: e.target.value }))}
                  placeholder="Describe the question or concept you got wrong..."
                  className="resize-none text-sm min-h-[70px]"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Correct Answer / Right Concept *</Label>
                <Input
                  value={form.correctAnswer}
                  onChange={e => setForm(f => ({ ...f, correctAnswer: e.target.value }))}
                  placeholder="The correct answer or what you should have known..."
                  className="h-8 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Explanation (optional)</Label>
                  <Textarea
                    value={form.explanation}
                    onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))}
                    placeholder="Why is this the correct answer?"
                    className="resize-none text-sm min-h-[60px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Your Notes (optional)</Label>
                  <Textarea
                    value={form.studentNotes}
                    onChange={e => setForm(f => ({ ...f, studentNotes: e.target.value }))}
                    placeholder="What will you do differently next time?"
                    className="resize-none text-sm min-h-[60px]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <Button variant="outline" size="sm" onClick={() => { setShowAddForm(false); setForm(emptyForm()); }}>Cancel</Button>
                <Button size="sm" onClick={handleManualAdd} disabled={createMutation.isPending} className="gap-1.5">
                  {createMutation.isPending ? "Saving..." : <><Plus className="w-3.5 h-3.5" /> Log Mistake</>}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Subject filter tabs */}
        <div className="flex gap-1 mb-5 bg-secondary/50 rounded-lg p-1 w-fit">
          {["All", ...SUBJECTS].map(tab => (
            <button
              key={tab}
              onClick={() => setSubjectTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${subjectTab === tab ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Mistakes list */}
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse border border-border" />)}
          </div>
        ) : weakAreas && weakAreas.length > 0 ? (
          <div className="space-y-3">
            {weakAreas.map(wa => (
              <div
                key={wa.id}
                className={`bg-card border rounded-xl overflow-hidden transition-all ${wa.resolved ? "border-chart-1/25 opacity-75" : "border-destructive/25"}`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Main content */}
                  <div className="flex-1 p-5 border-r border-border min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={wa.resolved ? "text-chart-1 border-chart-1/30" : "text-destructive border-destructive/30"}
                        >
                          {wa.subject}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{wa.chapter}</Badge>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {wa.resolved ? (
                          <span className="flex items-center text-[10px] text-chart-1 font-bold gap-1 uppercase tracking-wider">
                            <CheckCircle className="w-3.5 h-3.5" />Done
                          </span>
                        ) : (
                          <span className="flex items-center text-[10px] text-destructive font-bold gap-1 uppercase tracking-wider">
                            <AlertTriangle className="w-3.5 h-3.5" />Active
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm font-medium leading-relaxed mb-4">{wa.question?.originalText}</p>

                    {wa.question && (
                      <div className="bg-secondary/50 rounded-lg p-3">
                        <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Correct Answer</div>
                        <div className="text-sm font-semibold text-chart-1">
                          {wa.question.options[wa.question.correctAnswer]}
                        </div>
                      </div>
                    )}

                    {wa.question?.aiGeneratedImageUrl && (
                      <div className="mt-3">
                        <img src={wa.question.aiGeneratedImageUrl} alt="Diagram" className="max-h-32 rounded-lg border border-border" />
                      </div>
                    )}
                  </div>

                  {/* Notes panel */}
                  <div className="w-full md:w-72 p-4 bg-card flex flex-col gap-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Post-Mortem Notes</div>
                    <Textarea
                      defaultValue={wa.studentNotes || ""}
                      onBlur={e => handleUpdateNotes(wa.id, e.target.value)}
                      placeholder="Why did I get this wrong? What's the core concept?"
                      className="flex-1 min-h-[100px] bg-secondary/30 resize-none font-mono text-xs border-border/50 focus-visible:ring-1"
                    />

                    <div className="flex items-center justify-between pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Switch
                          id={`resolved-${wa.id}`}
                          checked={wa.resolved}
                          onCheckedChange={v => handleToggleResolved(wa.id, v)}
                        />
                        <Label htmlFor={`resolved-${wa.id}`} className="text-xs cursor-pointer">
                          {wa.resolved ? "Resolved ✓" : "Mark Done"}
                        </Label>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(wa.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <CheckCircle className="w-14 h-14 text-chart-1 opacity-20 mb-4" />
            <p className="text-muted-foreground text-sm">No mistakes here.</p>
            <p className="text-muted-foreground text-xs mt-1">Practice questions or add one manually above.</p>
          </div>
        )}
      </div>
    </div>
  );
}
