import { Link, useLocation } from "wouter";
import { LayoutDashboard, Database, UploadCloud, BrainCircuit, BookX, Timer, Palette, Check, Settings2 } from "lucide-react";
import { useTheme, THEMES } from "@/components/theme-provider";
import { useState } from "react";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Question Bank", href: "/questions", icon: Database },
  { name: "AI Import", href: "/import", icon: UploadCloud },
  { name: "Practice", href: "/practice", icon: BrainCircuit },
  { name: "Mistake Book", href: "/mistakes", icon: BookX },
  { name: "StudyBloom", href: "/studybloom", icon: Timer },
  { name: "Settings", href: "/settings", icon: Settings2 },
];

export function Sidebar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const [showPicker, setShowPicker] = useState(false);

  return (
    <aside className="w-56 border-r border-border bg-sidebar flex flex-col h-full relative">
      <div className="p-5">
        <div className="flex items-center gap-2.5 mb-7">
          <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center font-bold font-mono text-primary-foreground text-sm tracking-tighter shadow-[var(--glow-primary,none)]">
            Z
          </div>
          <div>
            <span className="font-bold text-base tracking-tight leading-none block">ZENITH</span>
            <span className="text-[9px] text-muted-foreground tracking-widest uppercase">NEET AI</span>
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
                }`}
              >
                <item.icon className={`w-3.5 h-3.5 ${isActive ? "text-primary" : ""}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-5 space-y-2">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium border border-border bg-secondary/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-all"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="flex-1 text-left">Theme</span>
            <span className="flex items-center gap-1">
              <span
                className="w-2.5 h-2.5 rounded-full ring-1 ring-border"
                style={{ backgroundColor: THEMES.find(t => t.id === theme)?.color }}
              />
              <span className="capitalize text-foreground">{theme}</span>
            </span>
          </button>

          {showPicker && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-card border border-border rounded-lg p-2 shadow-xl z-50">
              <div className="text-[9px] text-muted-foreground uppercase tracking-widest px-1 mb-1.5">Select Theme</div>
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setShowPicker(false); }}
                  className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md hover:bg-secondary transition-colors text-xs"
                >
                  <span className="w-4 h-4 rounded-full flex-shrink-0 ring-1 ring-border" style={{ backgroundColor: t.color }} />
                  <span className="flex-1 text-left capitalize font-medium">{t.label}</span>
                  <span className="text-[9px] text-muted-foreground">{t.dark ? "dark" : "light"}</span>
                  {theme === t.id && <Check className="w-3 h-3 text-primary" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 px-2">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              title={t.label}
              className={`flex-1 h-1.5 rounded-full transition-all ${theme === t.id ? 'opacity-100 scale-y-150' : 'opacity-40 hover:opacity-70'}`}
              style={{ backgroundColor: t.color }}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}
