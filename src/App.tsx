import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider, type AppTheme } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppLayout } from "@/components/layout/AppLayout";
import { setExtraHeadersGetter } from "@workspace/api-client-react";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Questions from "@/pages/Questions";
import Import from "@/pages/Import";
import Practice from "@/pages/Practice";
import Mistakes from "@/pages/Mistakes";
import StudyBloom from "@/pages/StudyBloom";
import Settings from "@/pages/Settings";

// Inject AI provider headers from localStorage into every API request
setExtraHeadersGetter(() => {
  const activeModel = localStorage.getItem("zenith-active-model") || "gemini";
  const headers: Record<string, string> = { "x-active-model": activeModel };
  if (activeModel === "openai") {
    const key = localStorage.getItem("zenith-openai-key") || "";
    const model = localStorage.getItem("zenith-openai-model") || "gpt-4o-mini";
    if (key) { headers["x-openai-key"] = key; headers["x-openai-model"] = model; }
  }
  if (activeModel === "azure") {
    const key = localStorage.getItem("zenith-azure-key") || "";
    const endpoint = localStorage.getItem("zenith-azure-endpoint") || "";
    const deployment = localStorage.getItem("zenith-azure-deployment") || "";
    if (key) headers["x-azure-key"] = key;
    if (endpoint) headers["x-azure-endpoint"] = endpoint;
    if (deployment) headers["x-azure-deployment"] = deployment;
  }
  return headers;
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/questions" component={Questions} />
        <Route path="/import" component={Import} />
        <Route path="/practice" component={Practice} />
        <Route path="/mistakes" component={Mistakes} />
        <Route path="/studybloom" component={StudyBloom} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme={"cockpit" as AppTheme} storageKey="zenith-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
