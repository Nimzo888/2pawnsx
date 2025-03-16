import React from "react";

interface SkipLinkProps {
  targetId: string;
  className?: string;
}

/**
 * Accessibility component that allows keyboard users to skip to main content
 */
const SkipLink: React.FC<SkipLinkProps> = ({ targetId, className = "" }) => {
  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:p-4 focus:bg-background focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
    >
      Skip to main content
    </a>
  );
};

export default SkipLink;
