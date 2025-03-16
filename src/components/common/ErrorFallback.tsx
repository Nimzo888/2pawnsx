import React from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary?: () => void;
  message?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
  message = "Something went wrong",
}) => {
  return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[200px]">
      <Alert variant="destructive" className="mb-4 max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{message}</AlertTitle>
        <AlertDescription className="mt-2">
          {error.message || "An unexpected error occurred"}
        </AlertDescription>
      </Alert>

      {resetErrorBoundary && (
        <Button onClick={resetErrorBoundary} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorFallback;
