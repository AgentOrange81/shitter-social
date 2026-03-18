"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-shit-darker flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl mb-4 animate-float">💥</div>
            <h2 className="text-xl font-bold mb-2 text-cream">Something went wrong</h2>
            <p className="text-shit-medium mb-6">
              We hit an unexpected error. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-glass hover:bg-gold text-shit-darker font-bold rounded-xl transition-all shadow-glow"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
