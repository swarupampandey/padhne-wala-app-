import { useState, useEffect } from "react";
import { Settings2, Brain, Zap, CheckCircle2, AlertCircle, Eye, EyeOff, Loader2, Cpu, Bot, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type ActiveModel = "gemini" | "openai" | "azure";

interface AISettings {
  activeModel: ActiveModel;
  openaiKey: string;
  openaiModel: string;
  azureKey: string;
  azureEndpoint: string;
  azureDeployment: string;
}

const OPENAI_MODELS = [
  { id: "gpt-4o", label: "GPT-4o (Best)" },
  { id: "gpt-4o-mini", label: "GPT-4o Mini (Fast)" },
  { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
  { id: "gpt-3.5-turbo", label: "GPT-3.5 Turbo (Cheap)" },
];

function loadSettings(): AISettings {
  return {
    activeModel: (localStorage.getItem("zenith-active-model") as ActiveModel) || "gemini",
    openaiKey: localStorage.getItem("zenith-openai-key") || "",
    openaiModel: localStorage.getItem("zenith-openai-model") || "gpt-4o-mini",
    azureKey: localStorage.getItem("zenith-azure-key") || "",
    azureEndpoint: localStorage.getItem("zenith-azure-endpoint") || "",
    azureDeployment: localStorage.getItem("zenith-azure-deployment") || "",
  };
}

function saveSettings(s: AISettings) {
  localStorage.setItem("zenith-active-model", s.activeModel);
  localStorage.setItem("zenith-openai-key", s.openaiKey);
  localStorage.setItem("zenith-openai-model", s.openaiModel);
  localStorage.setItem("zenith-azure-key", s.azureKey);
  localStorage.setItem("zenith-azure-endpoint", s.azureEndpoint);
  localStorage.setItem("zenith-azure-deployment", s.azureDeployment);
}

function maskKey(key: string) {
  if (!key || key.length < 8) return key;
  return key.slice(0, 6) + "•".repeat(Math.min(20, key.length - 8)) + key.slice(-4);
}

export default function Settings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AISettings>(loadSettings);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showAzureKey, setShowAzureKey] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, boolean | null>>({});

  useEffect(() => { setSettings(loadSettings()); }, []);

  const set = (k: keyof AISettings, v: string) => {
    setSettings(prev => {
      const next = { ...prev, [k]: v };
      saveSettings(next);
      return next;
    });
  };

  const handleSave = () => {
    saveSettings(settings);
    toast({ title: "Settings saved", description: "AI configuration updated successfully.", className: "border-chart-1" });
  };

  const testConnection = async (model: ActiveModel) => {
    setTesting(model);
    setTestResults(prev => ({ ...prev, [model]: null }));
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "x-active-model": model,
      };
      if (model === "openai" && settings.openaiKey) {
        headers["x-openai-key"] = settings.openaiKey;
        headers["x-openai-model"] = settings.openaiModel;
      }
      if (model === "azure" && settings.azureKey) {
        headers["x-azure-key"] = settings.azureKey;
        headers["x-azure-endpoint"] = settings.azureEndpoint;
        headers["x-azure-deployment"] = settings.azureDeployment;
      }
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers,
        body: JSON.stringify({
          questionText: "What is the powerhouse of the cell?",
          options: ["Nucleus", "Mitochondria", "Ribosome", "Golgi"],
          correctAnswer: 1,
          userMessage: "Reply with just: OK",
          history: [],
        }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      if (data.reply) {
        setTestResults(prev => ({ ...prev, [model]: true }));
        toast({ title: `${model.toUpperCase()} connected!`, description: `Response: "${data.reply.slice(0, 60)}"`, className: "border-chart-1" });
      } else throw new Error("No reply");
    } catch {
      setTestResults(prev => ({ ...prev, [model]: false }));
      toast({ title: `${model.toUpperCase()} connection failed`, description: "Check your API key and settings.", variant: "destructive" });
    } finally {
      setTesting(null);
    }
  };

  const models: { id: ActiveModel; label: string; icon: React.ReactNode; desc: string; color: string }[] = [
    { id: "gemini", label: "Google Gemini", icon: <Brain className="w-5 h-5" />, desc: "Built-in — Gemini 1.5 Flash. No key needed.", color: "text-chart-5" },
    { id: "openai", label: "OpenAI ChatGPT", icon: <Bot className="w-5 h-5" />, desc: "GPT-4o, GPT-4o Mini, GPT-3.5 Turbo.", color: "text-chart-1" },
    { id: "azure", label: "Microsoft Copilot / Azure OpenAI", icon: <Globe className="w-5 h-5" />, desc: "Enterprise Azure OpenAI or Copilot endpoint.", color: "text-primary" },
  ];

  return (
    <div className="p-8 max-w-3xl mx-auto overflow-y-auto h-full">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tighter flex items-center gap-2.5">
          <Settings2 className="w-6 h-6 text-primary" /> AI SETTINGS
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Configure AI providers. Gemini is always active as fallback. Add OpenAI or Azure to unlock GPT models.</p>
      </div>

      {/* Active model selector */}
      <div className="mb-6">
        <div className="text-xs font-bold text-muted-foreground tracking-widest uppercase mb-3">Active AI Model</div>
        <div className="grid gap-3">
          {models.map(m => {
            const isActive = settings.activeModel === m.id;
            const testResult = testResults[m.id];
            return (
              <button
                key={m.id}
                onClick={() => set("activeModel", m.id)}
                className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${isActive ? "border-primary bg-primary/10" : "border-border bg-card hover:border-primary/40"}`}
              >
                <div className={`${m.color} ${isActive ? "" : "opacity-50"}`}>{m.icon}</div>
                <div className="flex-1">
                  <div className={`font-bold text-sm ${isActive ? "" : "text-muted-foreground"}`}>{m.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{m.desc}</div>
                </div>
                <div className="flex items-center gap-2">
                  {testResult === true && <CheckCircle2 className="w-4 h-4 text-chart-1" />}
                  {testResult === false && <AlertCircle className="w-4 h-4 text-destructive" />}
                  {isActive && (
                    <span className="text-[10px] font-bold bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* OpenAI Configuration */}
      <div className="bg-card border border-border rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-chart-1" />
            <div className="font-bold text-sm">OpenAI / ChatGPT</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            disabled={testing === "openai" || !settings.openaiKey}
            onClick={() => testConnection("openai")}
          >
            {testing === "openai" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Test
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">API Key</Label>
            <div className="relative mt-1">
              <Input
                type={showOpenAIKey ? "text" : "password"}
                value={settings.openaiKey}
                onChange={e => set("openaiKey", e.target.value)}
                placeholder="sk-..."
                className="pr-10 font-mono text-sm h-9"
              />
              <button
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowOpenAIKey(!showOpenAIKey)}
              >
                {showOpenAIKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {settings.openaiKey && !showOpenAIKey && (
              <div className="text-[10px] text-muted-foreground mt-1 font-mono">{maskKey(settings.openaiKey)}</div>
            )}
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Model</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {OPENAI_MODELS.map(m => (
                <button
                  key={m.id}
                  onClick={() => set("openaiModel", m.id)}
                  className={`text-left px-3 py-2 rounded-lg border text-xs transition-all ${settings.openaiModel === m.id ? "border-chart-1/50 bg-chart-1/10 text-chart-1 font-bold" : "border-border hover:bg-secondary"}`}
                >
                  <Cpu className="w-3 h-3 inline mr-1.5" />{m.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Azure / Copilot Configuration */}
      <div className="bg-card border border-border rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <div className="font-bold text-sm">Microsoft Azure OpenAI / Copilot</div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            disabled={testing === "azure" || !settings.azureKey}
            onClick={() => testConnection("azure")}
          >
            {testing === "azure" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
            Test
          </Button>
        </div>

        <div className="space-y-3">
          <div>
            <Label className="text-xs text-muted-foreground">API Key</Label>
            <div className="relative mt-1">
              <Input
                type={showAzureKey ? "text" : "password"}
                value={settings.azureKey}
                onChange={e => set("azureKey", e.target.value)}
                placeholder="Your Azure OpenAI key"
                className="pr-10 font-mono text-sm h-9"
              />
              <button
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowAzureKey(!showAzureKey)}
              >
                {showAzureKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Endpoint URL</Label>
            <Input
              value={settings.azureEndpoint}
              onChange={e => set("azureEndpoint", e.target.value)}
              placeholder="https://YOUR-RESOURCE.openai.azure.com"
              className="mt-1 text-sm h-9 font-mono"
            />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Deployment Name</Label>
            <Input
              value={settings.azureDeployment}
              onChange={e => set("azureDeployment", e.target.value)}
              placeholder="gpt-4o"
              className="mt-1 text-sm h-9"
            />
          </div>
        </div>
      </div>

      {/* Gemini note */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-chart-5/10 border border-chart-5/30 mb-6">
        <Brain className="w-4 h-4 text-chart-5 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-muted-foreground">
          <span className="font-bold text-chart-5">Gemini 1.5 Flash</span> is always active as the built-in AI — no key needed. It handles image understanding, PDF reading, and diagram generation (via Together AI). OpenAI/Azure models are used for chat and extraction when selected.
        </div>
      </div>

      <Button onClick={handleSave} className="w-full font-bold h-11 text-sm">
        Save AI Settings
      </Button>
    </div>
  );
}
