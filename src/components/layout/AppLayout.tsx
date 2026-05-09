import { Sidebar } from "./Sidebar";
import { useAuth } from "@/hooks/use-auth";

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();
  
  if (!userId) {
    return <div className="min-h-screen bg-background flex items-center justify-center text-primary font-mono animate-pulse">INIT SYSTEM...</div>;
  }
  
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden font-mono">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto relative">
        <div className="absolute inset-0 pointer-events-none opacity-5 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
        {children}
      </main>
    </div>
  );
}
