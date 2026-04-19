import React, { Component, ErrorInfo, ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw, Home, ArrowLeft } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  level?: "app" | "page" | "component";
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
    
    // Log to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service (e.g., Sentry)
      console.error("Production error:", {
        error: error.toString(),
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString()
      });
    }
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.location.href = '/dashboard';
  };

  private handleGoBack = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    window.history.back();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
    this.props.onReset?.();
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const level = this.props.level || "component";
      const isAppLevel = level === "app";

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted/20 to-background">
          <Card className="p-8 max-w-lg w-full">
            {/* Icon */}
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>

            {/* Title */}
            <h2 className="font-display text-2xl text-center mb-2">
              {isAppLevel ? "Application Error" : "Something went wrong"}
            </h2>

            {/* Description */}
            <p className="text-muted-foreground text-center mb-6">
              {isAppLevel 
                ? "We're sorry, but something unexpected happened. Please try reloading the page."
                : "We encountered an error while loading this content. You can try again or go back."
              }
            </p>

            {/* Error details (only in development) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mb-6 p-4 bg-muted rounded-lg text-left">
                <summary className="cursor-pointer text-sm font-medium mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="text-xs overflow-auto max-h-40 text-destructive">
                  {this.state.error.message}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      {'\n\n'}
                      {this.state.errorInfo.componentStack}
                    </>
                  )}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {isAppLevel ? (
                <>
                  <Button onClick={this.handleReload} className="w-full" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reload Page
                  </Button>
                  <Button onClick={this.handleGoHome} variant="outline" className="w-full">
                    <Home className="w-4 h-4 mr-2" />
                    Go to Dashboard
                  </Button>
                </>
              ) : (
                <>
                  <Button onClick={this.handleReset} className="w-full" size="lg">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button onClick={this.handleGoBack} variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Go Back
                    </Button>
                    <Button onClick={this.handleGoHome} variant="outline">
                      <Home className="w-4 h-4 mr-2" />
                      Dashboard
                    </Button>
                  </div>
                </>
              )}
            </div>

            {/* Help text */}
            <p className="text-xs text-center text-muted-foreground mt-6">
              If this problem persists, please contact support
            </p>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
