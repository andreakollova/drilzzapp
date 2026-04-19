import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ReactNode } from "react";

interface RouteErrorBoundaryProps {
  children: ReactNode;
}

/**
 * Error boundary specifically for route-level errors
 * Provides context-aware error handling for page components
 */
export const RouteErrorBoundary = ({ children }: RouteErrorBoundaryProps) => {
  return (
    <ErrorBoundary level="page">
      {children}
    </ErrorBoundary>
  );
};
