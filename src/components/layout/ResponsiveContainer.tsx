import React from "react";
import { useIsMobile, useIsTablet, useIsDesktop } from "@/hooks/useMediaQuery";

type ResponsiveContainerProps = {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  tabletClassName?: string;
  desktopClassName?: string;
};

/**
 * A container component that applies different classes based on screen size
 */
const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  className = "",
  mobileClassName = "",
  tabletClassName = "",
  desktopClassName = "",
}) => {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  const responsiveClass = isMobile
    ? mobileClassName
    : isTablet
      ? tabletClassName
      : desktopClassName;

  return <div className={`${className} ${responsiveClass}`}>{children}</div>;
};

export default ResponsiveContainer;
