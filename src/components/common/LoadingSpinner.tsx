import React from "react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "primary",
  className = "",
  text,
}) => {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    white: "border-white",
    black: "border-black",
  };

  const spinnerColor =
    colorClasses[color as keyof typeof colorClasses] || colorClasses.primary;

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} rounded-full border-t-transparent ${spinnerColor} animate-spin`}
        role="status"
        aria-label="Loading"
      />
      {text && <p className="mt-2 text-sm text-muted-foreground">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
