import React, { ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
  }

  public resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  public override render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="bg-card border border-destructive/20 rounded-lg p-8 max-w-md w-full">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <h2 className="text-lg font-bold">Something went wrong</h2>
              </div>
              {process.env.NODE_ENV === "development" && this.state.error && (
                <pre className="bg-secondary p-3 rounded text-xs text-muted-foreground mb-4 overflow-auto max-h-40">
                  {this.state.error.message}
                </pre>
              )}
              <p className="text-sm text-muted-foreground mb-6">
                An unexpected error occurred. Try refreshing the page or contact support.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Reload Page
                </Button>
                <Button
                  onClick={this.resetError}
                  className="flex-1"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
