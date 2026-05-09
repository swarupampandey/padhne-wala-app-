import { useState, useRef } from "react";
import { useAiExtractQuestion, useAiGenerateImage, useCreateQuestion, useGetSubjectChapterTree } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  BrainCircuit, Upload, ArrowRight, Wand2, Check, Image as ImageIcon, Loader2, FileText,
  FileSpreadsheet, File, X, BookOpen, User, ChevronRight, Sparkles, AlertTriangle
} from "lucide-react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";

type FileType = "image" | "pdf" | "csv" | "text" | null;

interface ParsedFile {
  type: FileType;
  name: string;
  base64?: string;
  mimeType?: string;
  rawText?: string;
  preview?: string;
}

function detectFileType(file: File): FileType {
  if (file.type.startsWith("image/")) return "image";
  if (file.type === "application/pdf") return "pdf";
  if (file.type === "text/csv" || file.name.endsWith(".csv")) return "csv";
  if (file.type.startsWith("text/") || file.name.endsWith(".txt")) return "text";
  return null;
}

function FileTypeIcon({ type }: { type: FileType }) {
  if (type === "image") return <ImageIcon className="w-8 h-8 text-chart-5" />;
  if (type === "pdf") return <FileText className="w-8 h-8 text-destructive" />;
  if (type === "csv") return <FileSpreadsheet className="w-8 h-8 text-chart-1" />;
  if (type === "text") return <FileText className="w-8 h-8 text-primary" />;
  return <File className="w-8 h-8 text-muted-foreground" />;
}

export default function Import() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { userId } = useAuth();
  const { data: tree } = useGetSubjectChapterTree();
  const dropRef = useRef<HTMLDivElement>(null);

  const extractMutation = useAiExtractQuestion();
  const generateImageMutation = useAiGenerateImage();
  const createMutation = useCreateQuestion();

  const [step, setStep] = useState(1);
  const [section, setSection] = useState<"mine" | "main">("mine");
  const [subject, setSubject] = useState("");
  const [chapter, setChapter] = useState("");
  const [parsedFile, setParsedFile] = useState<ParsedFile | null>(null);
  const [rawText, setRawText] = useState("");
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [explanation, setExplanation] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  const readFile = (file: File): Promise<ParsedFile> => {
    return new Promise((resolve, reject) => {
      const type = detectFileType(file);
      if (!type) { reject(new Error("Unsupported file type")); return; }

      const reader = new FileReader();

      if (type === "image") {
        reader.onload = e => {
          const dataUrl = e.target?.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve({ type, name: file.name, base64, mimeType: file.type, preview: dataUrl });
        };
        reader.readAsDataURL(file);
      } else if (type === "pdf") {
        reader.onload = e => {
          const dataUrl = e.target?.result as string;
          const base64 = dataUrl.split(",")[1];
          resolve({ type, name: file.name, base64, mimeType: "application/pdf" });
        };
        reader.readAsDataURL(file);
      } else {
        reader.onload = e => {
          const text = e.target?.result as string;
          resolve({ type, name: file.name, rawText: text });
        };
        reader.readAsText(file);
      }
    });
  };

  const performOcr = async (file: ParsedFile) => {
    if (!file.base64 || !file.mimeType) return;
    setOcrError(null);
    setIsOcrLoading(true);

    try {
      const response = await fetch("/api/ai/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: file.base64, mimeType: file.mimeType }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "OCR extraction failed.");

      const text = (data.text ?? "").trim();
      setRawText(text);

      if (!text) {
        setOcrError("OCR returned no text. Try a cleaner scan or paste the text manually.");
      }
    } catch (err: any) {
      const message = err?.message || "OCR failed.";
      setOcrError(message);
      toast({ title: "OCR failed", description: message, variant: "destructive" });
    } finally {
      setIsOcrLoading(false);
    }
  };

  const handleFileChange = async (file: File) => {
    try {
      const parsed = await readFile(file);
      setParsedFile(parsed);
      setOcrError(null);
      if (parsed.rawText) {
        setRawText(parsed.rawText);
      } else {
        setRawText("");
      }

      if (parsed.type === "image" || parsed.type === "pdf") {
        await performOcr(parsed);
      }
    } catch {
      toast({ title: "Unsupported file. Use: Images, PDF, CSV, or TXT", variant: "destructive" });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileChange(file);
  };

  const handleExtract = async () => {
    if (!parsedFile && !rawText) {
      toast({ title: "Please provide a file or paste some text", variant: "destructive" });
      return;
    }
    setExtractError(null);

    let csvRawText: string | null = null;
    if (parsedFile?.type === "csv" && parsedFile.rawText) {
      const lines = parsedFile.rawText.split("\n").filter(l => l.trim());
      csvRawText = `This is CSV data. Extract a NEET MCQ from it:\n${lines.join("\n")}`;
    }

    try {
      const res = await extractMutation.mutateAsync({
        data: {
          imageBase64: (parsedFile?.type === "image" || parsedFile?.type === "pdf") ? parsedFile.base64 ?? null : null,
          mimeType: (parsedFile?.type === "image" || parsedFile?.type === "pdf") ? parsedFile.mimeType ?? null : null,
          rawText: csvRawText ?? parsedFile?.rawText ?? rawText ?? null,
          subject: subject || null,
          chapter: chapter || null,
        },
      });

      setQuestionText(res.originalText || "");
      setOptions(res.options?.length === 4 ? res.options : ["", "", "", ""]);
      setCorrectAnswer(res.correctAnswer ?? 0);
      setExplanation(res.explanation || "");
      setImagePrompt(res.imageGenPrompt || "");
      if (res.subject) setSubject(res.subject);
      if (res.chapter) setChapter(res.chapter);
      setStep(2);
    } catch (err: any) {
      const msg = err?.message || "Extraction failed. Check the file or try pasting text.";
      setExtractError(msg);
      toast({ title: "AI Extraction Failed", description: msg, variant: "destructive" });
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt) return;
    try {
      const res = await generateImageMutation.mutateAsync({ data: { prompt: imagePrompt } });
      setGeneratedImage(res.imageUrl);
    } catch {
      toast({ title: "Image generation failed", variant: "destructive" });
    }
  };

  const handleSave = async () => {
    try {
      await createMutation.mutateAsync({
        data: {
          subject: subject || "General",
          chapter: chapter || "Uncategorized",
          originalText: questionText,
          options,
          correctAnswer,
          explanation,
          aiGeneratedImageUrl: generatedImage,
          originalImageUrl: parsedFile?.preview ?? null,
          userId: section === "mine" ? (userId ?? null) : null,
        },
      });
      toast({ title: "✓ Saved to Question Bank", className: "bg-chart-1 text-white border-none" });
      setLocation("/questions");
    } catch {
      toast({ title: "Failed to save", variant: "destructive" });
    }
  };

  const subjectSuggestions = tree?.map(n => n.subject) || ["Physics", "Chemistry", "Biology"];

  return (
    <div className="p-6 max-w-3xl mx-auto h-full overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2.5 tracking-tighter">
          <BrainCircuit className="w-6 h-6 text-chart-5" /> AI IMPORT COCKPIT
        </h1>
        <p className="text-muted-foreground text-xs mt-1">Extract NEET questions from any file using AI vision and OCR.</p>
      </div>

      {/* Progress steps */}
      <div className="flex items-center gap-2 mb-6">
        {["Input Source", "Review & Edit", "Final Check"].map((label, i) => (
          <div key={i} className="flex items-center gap-2 flex-1">
            <div className={`flex items-center gap-1.5 ${step > i + 1 ? "text-chart-1" : step === i + 1 ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold border ${step > i + 1 ? "bg-chart-1 border-chart-1 text-white" : step === i + 1 ? "border-primary text-primary bg-primary/10" : "border-border"}`}>
                {step > i + 1 ? <Check className="w-3 h-3" /> : i + 1}
              </div>
              <span className="text-xs font-medium hidden sm:block">{label}</span>
            </div>
            {i < 2 && <ChevronRight className="w-3 h-3 text-border flex-shrink-0" />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          {/* Section selector */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Save To</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setSection("mine")}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${section === "mine" ? "border-primary/40 bg-primary/10" : "border-border hover:bg-secondary"}`}
              >
                <User className={`w-5 h-5 ${section === "mine" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-bold ${section === "mine" ? "text-primary" : ""}`}>My Questions</div>
                  <div className="text-[10px] text-muted-foreground">Private — your imports</div>
                </div>
                {section === "mine" && <Check className="w-4 h-4 text-primary ml-auto" />}
              </button>
              <button
                onClick={() => setSection("main")}
                className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${section === "main" ? "border-primary/40 bg-primary/10" : "border-border hover:bg-secondary"}`}
              >
                <BookOpen className={`w-5 h-5 ${section === "main" ? "text-primary" : "text-muted-foreground"}`} />
                <div>
                  <div className={`text-sm font-bold ${section === "main" ? "text-primary" : ""}`}>Main Questions</div>
                  <div className="text-[10px] text-muted-foreground">Official question bank</div>
                </div>
                {section === "main" && <Check className="w-4 h-4 text-primary ml-auto" />}
              </button>
            </div>
          </div>

          {/* Subject & Chapter */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Context (Optional — AI will auto-detect)</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Subject</Label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Physics, Chemistry..." className="h-8 text-sm" list="subject-suggestions" />
                <datalist id="subject-suggestions">
                  {subjectSuggestions.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Chapter</Label>
                <Input value={chapter} onChange={e => setChapter(e.target.value)} placeholder="Laws of Motion..." className="h-8 text-sm" />
              </div>
            </div>
          </div>

          {/* File upload zone */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">
              Upload File — JPG, PNG, PDF, CSV, TXT supported
            </div>

            <div
              ref={dropRef}
              onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl transition-all ${isDragging ? "border-primary bg-primary/10 scale-[1.01]" : "border-border hover:border-primary/50 hover:bg-secondary/30"}`}
              style={{ minHeight: parsedFile ? "auto" : "160px" }}
            >
              {parsedFile ? (
                <div className="flex items-center gap-4 p-4">
                  {parsedFile.type === "image" && parsedFile.preview ? (
                    <img src={parsedFile.preview} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-border" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                      <FileTypeIcon type={parsedFile.type} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{parsedFile.name}</div>
                    <div className="text-xs text-muted-foreground uppercase mt-0.5">{parsedFile.type} file — ready for extraction</div>
                    {parsedFile.type === "csv" && parsedFile.rawText && (
                      <div className="mt-2 text-xs text-muted-foreground bg-secondary rounded p-1.5 font-mono max-h-12 overflow-hidden">
                        {parsedFile.rawText.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                  <button onClick={() => setParsedFile(null)} className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center p-10 text-center">
                  <Upload className="w-10 h-10 text-muted-foreground mb-3" />
                  <div className="text-sm font-medium">Drop any file here</div>
                  <div className="text-xs text-muted-foreground mt-1">or click to browse</div>
                  <div className="flex gap-2 mt-3">
                    {["IMG", "PDF", "CSV", "TXT"].map(t => (
                      <span key={t} className="px-2 py-0.5 bg-secondary rounded text-[10px] font-mono text-muted-foreground">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              <input
                type="file"
                accept="image/*,application/pdf,text/plain,text/csv,.csv,.txt"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={e => { const f = e.target.files?.[0]; if (f) handleFileChange(f); }}
              />
            </div>

            {/* OR divider */}
            <div className="flex items-center gap-3 my-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">OR paste text</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Textarea
              className="resize-none font-mono text-xs bg-secondary/30 min-h-[80px]"
              placeholder="Paste question text, notes, or any NEET content here..."
              value={rawText}
              onChange={e => setRawText(e.target.value)}
            />

            {(parsedFile?.type === "image" || parsedFile?.type === "pdf") && (
              <div className="mt-4 bg-secondary/50 border border-border rounded-xl p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <div className="text-xs font-semibold">AI OCR Text</div>
                    <div className="text-[10px] text-muted-foreground">Auto-extracted text from your uploaded image or PDF. Edit the text above before extraction.</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => parsedFile && performOcr(parsedFile)} disabled={isOcrLoading}>
                    {isOcrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Re-run OCR"}
                  </Button>
                </div>
                {ocrError && <p className="text-destructive text-sm mt-3">{ocrError}</p>}
              </div>
            )}
          </div>

          {extractError && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{extractError}</span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleExtract}
              disabled={extractMutation.isPending || (!parsedFile && !rawText)}
              className="gap-2 font-bold"
            >
              {extractMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              {extractMutation.isPending ? "Extracting with AI..." : "Extract with AI"}
              {!extractMutation.isPending && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-border rounded-xl p-4 space-y-4">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Review Extraction</div>

            <div className="space-y-1.5">
              <Label className="text-xs">Question Text</Label>
              <Textarea
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                className="min-h-[80px] font-medium text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <button
                    onClick={() => setCorrectAnswer(idx)}
                    className={`w-7 h-7 flex-shrink-0 rounded-md flex items-center justify-center text-xs font-bold transition-all ${idx === correctAnswer ? "bg-chart-1 text-white shadow-sm" : "bg-secondary text-muted-foreground hover:bg-secondary/80"}`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </button>
                  <Input
                    value={opt}
                    className="h-8 text-sm"
                    onChange={e => {
                      const n = [...options];
                      n[idx] = e.target.value;
                      setOptions(n);
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Explanation</Label>
              <Textarea
                value={explanation}
                onChange={e => setExplanation(e.target.value)}
                className="bg-secondary/30 min-h-[60px] text-sm"
                placeholder="Why is this the correct answer?"
              />
            </div>
          </div>

          {/* Diagram generation */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-chart-5" />
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AI Diagram Generation</div>
              <div className="text-[10px] text-muted-foreground">(optional)</div>
            </div>
            <div className="flex gap-2">
              <Input
                value={imagePrompt}
                onChange={e => setImagePrompt(e.target.value)}
                placeholder="Describe the diagram to generate..."
                className="text-sm h-8"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateImage}
                disabled={generateImageMutation.isPending || !imagePrompt}
                className="shrink-0 gap-1"
              >
                {generateImageMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                Generate
              </Button>
            </div>
            {generatedImage && (
              <div className="mt-3 border border-border rounded-lg overflow-hidden bg-black/30 flex justify-center p-3">
                <img src={generatedImage} alt="Generated diagram" className="max-h-48 object-contain rounded" />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>← Back</Button>
            <Button onClick={() => setStep(3)}>Continue <ArrowRight className="w-4 h-4 ml-1" /></Button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
          <div className="bg-card border border-primary/30 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-[10px] font-bold text-primary uppercase tracking-widest">Final Verification</div>
              <div className="flex gap-1.5">
                <span className="bg-primary/20 text-primary px-2 py-0.5 rounded text-[10px] font-bold">{subject || "General"}</span>
                <span className="bg-secondary px-2 py-0.5 rounded text-[10px]">{chapter || "Uncategorized"}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${section === "mine" ? "bg-chart-5/20 text-chart-5" : "bg-chart-1/20 text-chart-1"}`}>
                  {section === "mine" ? "My Questions" : "Main Questions"}
                </span>
              </div>
            </div>

            <div className="bg-secondary/30 p-4 rounded-lg border border-border text-sm leading-relaxed">
              {questionText}
            </div>

            {generatedImage && (
              <div className="flex justify-center border border-border rounded-lg p-3 bg-black/30">
                <img src={generatedImage} alt="Diagram" className="max-h-48 object-contain" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border text-sm ${idx === correctAnswer ? "border-chart-1/50 bg-chart-1/10 text-chart-1 font-bold" : "border-border bg-card text-muted-foreground"}`}
                >
                  <span className="font-bold mr-1.5">{String.fromCharCode(65 + idx)}.</span>{opt}
                </div>
              ))}
            </div>

            {explanation && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs text-muted-foreground">
                <span className="font-bold text-primary">Explanation: </span>{explanation}
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>← Edit</Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
              className="gap-2 font-bold bg-chart-1 hover:bg-chart-1/90 text-white w-44"
            >
              {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              Commit to Vault
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
