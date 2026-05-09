import { useState, useEffect, useRef } from "react";
import { useGetStudyStats, useListStudySessions, useCreateStudySession } from "@workspace/api-client-react";
import { Play, Square, RotateCcw, Activity, BarChart2, History, Zap, Coffee, Target, Clock, Flame, TrendingUp, Music, Wind, Volume2, VolumeX } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQueryClient } from "@tanstack/react-query";
import { getListStudySessionsQueryKey, getGetStudyStatsQueryKey } from "@workspace/api-client-react";

const POMODORO_PRESETS = {
  classic: { focus: 25 * 60, break: 5 * 60, label: "25 / 5", desc: "Classic Pomodoro" },
  deep: { focus: 50 * 60, break: 10 * 60, label: "50 / 10", desc: "Deep Work" },
  quick: { focus: 15 * 60, break: 3 * 60, label: "15 / 3", desc: "Quick Sprint" },
  ultra: { focus: 90 * 60, break: 20 * 60, label: "90 / 20", desc: "Ultra Focus" },
};

const SUBJECTS = [
  { name: "Physics", color: "#00d4b4" },
  { name: "Chemistry", color: "#f59e0b" },
  { name: "Biology", color: "#10b981" },
  { name: "General", color: "#8b5cf6" },
];

const VIBES = [
  { id: "silence", icon: VolumeX, label: "Silence" },
  { id: "lofi", icon: Music, label: "Lo-Fi" },
  { id: "rain", icon: Wind, label: "Rain" },
  { id: "focus", icon: Volume2, label: "Focus" },
];

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

function formatShort(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

type Tab = "timer" | "analytics" | "history";

export default function StudyBloom() {
  const queryClient = useQueryClient();
  const { data: stats } = useGetStudyStats();
  const { data: sessions } = useListStudySessions();
  const createSessionMutation = useCreateStudySession();

  const [tab, setTab] = useState<Tab>("timer");
  const [mode, setMode] = useState<"stopwatch" | "pomodoro">("pomodoro");
  const [preset, setPreset] = useState<keyof typeof POMODORO_PRESETS>("classic");
  const [subject, setSubject] = useState("Physics");
  const [vibe, setVibe] = useState("silence");
  const [time, setTime] = useState(POMODORO_PRESETS.classic.focus);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionCount, setSessionCount] = useState(0);
  const [todayGoal] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setTime(t => {
          if (mode === "pomodoro") {
            if (t <= 1) {
              handleSessionComplete();
              return 0;
            }
            return t - 1;
          }
          return t + 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isActive, mode]);

  useEffect(() => {
    if (!isActive) {
      if (mode === "pomodoro") setTime(isBreak ? POMODORO_PRESETS[preset].break : POMODORO_PRESETS[preset].focus);
      else setTime(0);
    }
  }, [mode, preset, isBreak]);

  const handleSessionComplete = () => {
    setIsActive(false);
    if (Notification.permission === "granted") {
      new Notification(isBreak ? "Break Over!" : "Session Complete! 🎯", {
        body: isBreak ? "Time to focus again." : "Great work! Take a break.",
      });
    }
    if (!isBreak) {
      const duration = POMODORO_PRESETS[preset].focus;
      saveSession(duration);
      setSessionCount(c => c + 1);
    }
    setIsBreak(b => !b);
    setTime(isBreak ? POMODORO_PRESETS[preset].focus : POMODORO_PRESETS[preset].break);
  };

  const handleStop = () => {
    setIsActive(false);
    if (mode === "stopwatch" && time > 60) saveSession(time);
  };

  const handleReset = () => {
    setIsActive(false);
    setIsBreak(false);
    setTime(mode === "pomodoro" ? POMODORO_PRESETS[preset].focus : 0);
  };

  const saveSession = (durationSeconds: number) => {
    createSessionMutation.mutate(
      { data: { subject, durationSeconds, sessionType: mode } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListStudySessionsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStudyStatsQueryKey() });
        },
      }
    );
  };

  const maxTime = mode === "pomodoro"
    ? (isBreak ? POMODORO_PRESETS[preset].break : POMODORO_PRESETS[preset].focus)
    : 3600;
  const progress = mode === "pomodoro"
    ? (1 - time / maxTime) * 100
    : (time % 3600) / 3600 * 100;

  const subjectColor = SUBJECTS.find(s => s.name === subject)?.color || "#00d4b4";
  const chartData = stats?.bySubject.map(s => ({ name: s.subject, minutes: Math.round(s.totalSeconds / 60) })) || [];
  const circumference = 2 * Math.PI * 130;

  const todaySessionCount = sessions?.filter(s => {
    const d = new Date(s.createdAt);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }).length || 0;

  return (
    <div className="h-full bg-background flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="border-b border-border bg-card/60 backdrop-blur px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-md bg-primary/20 flex items-center justify-center">
            <Flame className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tighter">STUDYBLOOM</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Time Intelligence</p>
          </div>
        </div>

        {/* Quick stats */}
        <div className="flex items-center gap-6">
          <div className="text-center">
            <div className="font-mono font-bold text-primary text-sm">{formatShort(stats?.todaySeconds || 0)}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Today</div>
          </div>
          <div className="text-center">
            <div className="font-mono font-bold text-accent text-sm flex items-center gap-1"><Activity className="w-3 h-3" />{stats?.streakDays || 0}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="font-mono font-bold text-sm">{sessionCount}/{todayGoal}</div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Sessions</div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-secondary rounded-lg p-1">
          {([["timer", Clock], ["analytics", BarChart2], ["history", History]] as [Tab, React.ElementType][]).map(([t, Icon]) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="capitalize">{t}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* TIMER TAB */}
        {tab === "timer" && (
          <div className="flex h-full min-h-[500px]">
            {/* Left config panel */}
            <div className="w-64 border-r border-border p-5 flex flex-col gap-5 flex-shrink-0">
              {/* Mode toggle */}
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Mode</div>
                <div className="flex gap-1 bg-secondary rounded-md p-1">
                  <button
                    onClick={() => { setMode("pomodoro"); setIsActive(false); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${mode === "pomodoro" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Pomodoro
                  </button>
                  <button
                    onClick={() => { setMode("stopwatch"); setIsActive(false); }}
                    className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${mode === "stopwatch" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"}`}
                  >
                    Stopwatch
                  </button>
                </div>
              </div>

              {/* Subject selector */}
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Subject</div>
                <div className="space-y-1">
                  {SUBJECTS.map(s => (
                    <button
                      key={s.name}
                      onClick={() => setSubject(s.name)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs transition-all border ${subject === s.name ? "border-opacity-100 bg-secondary" : "border-transparent hover:bg-secondary/50"}`}
                      style={{ borderColor: subject === s.name ? s.color : undefined }}
                    >
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="font-medium">{s.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preset (pomodoro only) */}
              {mode === "pomodoro" && (
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Preset</div>
                  <div className="space-y-1">
                    {Object.entries(POMODORO_PRESETS).map(([k, v]) => (
                      <button
                        key={k}
                        onClick={() => { setPreset(k as keyof typeof POMODORO_PRESETS); setIsActive(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-xs transition-all border ${preset === k ? "border-primary/30 bg-primary/10 text-primary" : "border-transparent hover:bg-secondary/50 text-muted-foreground hover:text-foreground"}`}
                      >
                        <span className="font-bold">{v.label}</span>
                        <span className="text-[10px]">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Vibe selector */}
              <div>
                <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Vibe</div>
                <div className="grid grid-cols-2 gap-1">
                  {VIBES.map(v => (
                    <button
                      key={v.id}
                      onClick={() => setVibe(v.id)}
                      className={`flex flex-col items-center gap-1 py-2 rounded-md text-xs transition-all border ${vibe === v.id ? "border-primary/30 bg-primary/10 text-primary" : "border-border/50 hover:bg-secondary text-muted-foreground"}`}
                    >
                      <v.icon className="w-3.5 h-3.5" />
                      <span>{v.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main timer area */}
            <div className="flex-1 flex flex-col items-center justify-center gap-8 py-10 px-8">
              {mode === "pomodoro" && (
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${!isBreak ? "border-primary/30 bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                    <Zap className="w-3 h-3 inline mr-1" />Focus
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${isBreak ? "border-accent/30 bg-accent/10 text-accent" : "border-border text-muted-foreground"}`}>
                    <Coffee className="w-3 h-3 inline mr-1" />Break
                  </span>
                </div>
              )}

              {/* Ring timer */}
              <div className="relative w-72 h-72 flex items-center justify-center">
                {/* Outer glow */}
                <div
                  className="absolute inset-4 rounded-full opacity-20 blur-xl transition-all duration-1000"
                  style={{ backgroundColor: isActive ? subjectColor : "transparent" }}
                />

                <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 300 300">
                  {/* Track */}
                  <circle cx="150" cy="150" r="130" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  {/* Break ring (lighter) */}
                  {mode === "pomodoro" && (
                    <circle
                      cx="150" cy="150" r="130"
                      fill="none"
                      stroke={subjectColor}
                      strokeWidth="6"
                      strokeOpacity="0.15"
                      strokeDasharray={circumference}
                      strokeDashoffset="0"
                    />
                  )}
                  {/* Progress ring */}
                  <circle
                    cx="150" cy="150" r="130"
                    fill="none"
                    stroke={subjectColor}
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference * (1 - progress / 100)}
                    className="transition-all duration-1000 ease-linear"
                    style={{ filter: isActive ? `drop-shadow(0 0 8px ${subjectColor})` : undefined }}
                  />
                </svg>

                {/* Inner content */}
                <div className="relative text-center">
                  <div className="font-mono font-black text-6xl tabular-nums tracking-tighter" style={{ color: isActive ? subjectColor : undefined }}>
                    {formatTime(time)}
                  </div>
                  {mode === "pomodoro" && (
                    <div className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">
                      {isBreak ? "Take a break" : POMODORO_PRESETS[preset].desc}
                    </div>
                  )}
                  {mode === "stopwatch" && isActive && (
                    <div className="text-xs text-primary mt-2 animate-pulse">● RECORDING</div>
                  )}
                </div>
              </div>

              {/* Session dots */}
              {mode === "pomodoro" && (
                <div className="flex gap-2">
                  {Array.from({ length: todayGoal }).map((_, i) => (
                    <div
                      key={i}
                      className="w-3 h-3 rounded-full border-2 transition-all"
                      style={{
                        borderColor: subjectColor,
                        backgroundColor: i < todaySessionCount ? subjectColor : "transparent",
                      }}
                    />
                  ))}
                  <div className="text-xs text-muted-foreground ml-2 self-center">{todaySessionCount}/{todayGoal} today</div>
                </div>
              )}

              {/* Controls */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleReset}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  onClick={() => isActive ? handleStop() : setIsActive(true)}
                  className="w-20 h-20 rounded-full font-bold text-sm flex flex-col items-center justify-center gap-1 transition-all shadow-lg active:scale-95"
                  style={{
                    backgroundColor: isActive ? "hsl(var(--destructive))" : subjectColor,
                    color: "hsl(var(--background))",
                    boxShadow: isActive ? undefined : `0 0 30px ${subjectColor}50`,
                  }}
                >
                  {isActive ? <Square className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
                  <span className="text-[10px] uppercase tracking-wider">{isActive ? "Stop" : "Start"}</span>
                </button>

                <button
                  onClick={() => {
                    if (Notification.permission !== "granted") Notification.requestPermission();
                  }}
                  className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
                  title="Enable notifications"
                >
                  <Target className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right mini stats */}
            <div className="w-56 border-l border-border p-5 flex flex-col gap-4 flex-shrink-0">
              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Live Stats</div>

              <div className="space-y-3">
                {SUBJECTS.map(s => {
                  const subjectStat = stats?.bySubject.find(b => b.subject === s.name);
                  const mins = subjectStat ? Math.round(subjectStat.totalSeconds / 60) : 0;
                  const maxMins = Math.max(...(stats?.bySubject.map(b => Math.round(b.totalSeconds / 60)) || [1]), 1);
                  return (
                    <div key={s.name}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium" style={{ color: s.color }}>{s.name}</span>
                        <span className="text-muted-foreground font-mono">{mins}m</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${(mins / maxMins) * 100}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-border space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Total Life</span>
                  <span className="font-mono font-bold">{formatShort(stats?.totalSeconds || 0)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Streak</span>
                  <span className="font-mono font-bold text-accent">{stats?.streakDays || 0}d 🔥</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-mono font-bold">{sessions?.length || 0}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYTICS TAB */}
        {tab === "analytics" && (
          <div className="p-6 space-y-6 max-w-4xl">
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Lifetime Study", value: formatShort(stats?.totalSeconds || 0), icon: Clock, color: "text-primary" },
                { label: "Today", value: formatShort(stats?.todaySeconds || 0), icon: TrendingUp, color: "text-accent" },
                { label: "Streak", value: `${stats?.streakDays || 0} days`, icon: Flame, color: "text-chart-2" },
              ].map(card => (
                <div key={card.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <card.icon className={`w-4 h-4 ${card.color}`} />
                    <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{card.label}</span>
                  </div>
                  <div className={`font-mono font-black text-3xl ${card.color}`}>{card.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-xl p-5">
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Subject Distribution</div>
              <div className="h-52">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                      <Tooltip
                        cursor={{ fill: "hsl(var(--secondary))" }}
                        contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px", fontSize: 12 }}
                        formatter={(val: number) => [`${val} mins`, "Time Studied"]}
                      />
                      <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground text-sm">No data yet — start a session!</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {SUBJECTS.map(s => {
                const subjectStat = stats?.bySubject.find(b => b.subject === s.name);
                const mins = subjectStat ? Math.round(subjectStat.totalSeconds / 60) : 0;
                const totalMins = stats ? Math.round(stats.totalSeconds / 60) : 1;
                const pct = totalMins > 0 ? Math.round((mins / totalMins) * 100) : 0;
                return (
                  <div key={s.name} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-black" style={{ backgroundColor: s.color + "20", color: s.color }}>
                      {pct}%
                    </div>
                    <div>
                      <div className="font-bold text-sm" style={{ color: s.color }}>{s.name}</div>
                      <div className="font-mono text-muted-foreground text-xs">{mins}m total</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div className="p-6 max-w-2xl space-y-3">
            <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Session Logs</div>
            {sessions?.length === 0 && (
              <div className="text-center py-20 text-muted-foreground text-sm">No sessions yet. Start the timer!</div>
            )}
            {sessions?.map((s, i) => {
              const subColor = SUBJECTS.find(sub => sub.name === s.subject)?.color || "#00d4b4";
              return (
                <div key={s.id} className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-border/80 transition-all">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black" style={{ backgroundColor: subColor + "20", color: subColor }}>
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm" style={{ color: subColor }}>{s.subject || "General"}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                      {s.sessionType} • {new Date(s.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="font-mono font-black text-lg">{formatTime(s.durationSeconds)}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
