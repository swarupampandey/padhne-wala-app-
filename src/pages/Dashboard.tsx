import { useGetQuestionStats, useGetStudyStats, useListStudySessions } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Flame, Play, Square, RotateCcw, ArrowRight, Database, UploadCloud } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "wouter";

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function Dashboard() {
  const { data: qStats, isLoading: qLoading } = useGetQuestionStats();
  const { data: sStats, isLoading: sLoading } = useGetStudyStats();
  const { data: sessions, isLoading: sessionsLoading } = useListStudySessions({ limit: 5 });

  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerActive) {
      interval = setInterval(() => setTimerSeconds(s => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-bold tracking-tighter mb-2">SYSTEM DASHBOARD</h1>
          <p className="text-muted-foreground">Welcome back. Ready for mastery?</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-primary mb-1 uppercase tracking-wider">Session Active</div>
          <div className="font-mono text-3xl font-bold bg-secondary px-4 py-2 rounded-md border border-border">
            {formatTime(timerSeconds)}
          </div>
          <div className="flex gap-2 mt-2 justify-end">
            <Button variant={timerActive ? "destructive" : "default"} size="sm" onClick={() => setTimerActive(!timerActive)}>
              {timerActive ? <Square className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
              {timerActive ? "STOP" : "START"}
            </Button>
            <Button variant="outline" size="sm" onClick={() => { setTimerActive(false); setTimerSeconds(0); }}>
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Flame className="w-4 h-4 text-accent" /> CURRENT STREAK
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sLoading ? "..." : sStats?.streakDays || 0} <span className="text-xl text-muted-foreground">DAYS</span></div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" /> TODAY'S TIME
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{sLoading ? "..." : formatTime(sStats?.todaySeconds || 0)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-2">
              <Database className="w-4 h-4 text-chart-5" /> TOTAL QUESTIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{qLoading ? "..." : qStats?.total || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>QUICK ACTIONS</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Link href="/practice">
              <div className="bg-secondary/50 border border-border p-4 rounded-lg hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer group">
                <Activity className="w-8 h-8 text-primary mb-2" />
                <div className="font-bold mb-1">Start Practice</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-primary transition-colors">Enter focus mode <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
            <Link href="/import">
              <div className="bg-secondary/50 border border-border p-4 rounded-lg hover:bg-primary/10 hover:border-primary transition-colors cursor-pointer group">
                <UploadCloud className="w-8 h-8 text-chart-5 mb-2" />
                <div className="font-bold mb-1">AI Import</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1 group-hover:text-chart-5 transition-colors">Extract questions <ArrowRight className="w-3 h-3" /></div>
              </div>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>RECENT SESSIONS</CardTitle>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="animate-pulse space-y-2">
                {[1,2,3].map(i => <div key={i} className="h-10 bg-secondary rounded" />)}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map(s => (
                  <div key={s.id} className="flex justify-between items-center p-3 rounded bg-secondary/50 border border-border">
                    <div className="flex flex-col">
                      <span className="font-bold">{s.subject || "General"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()} • {s.sessionType}</span>
                    </div>
                    <div className="font-mono">{formatTime(s.durationSeconds)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-muted-foreground text-center py-8">No sessions recorded yet.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
