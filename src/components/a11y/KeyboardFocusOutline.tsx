import React, { useEffect } from "react";

/**
 * Component that adds a global style to show focus outlines only when using keyboard
 * and hides them when using mouse
 */
const KeyboardFocusOutline: React.FC = () => {
  useEffect(() => {
    // Add class to body when using mouse
    const handleMouseDown = () => {
      document.body.classList.add("using-mouse");
    };

    // Remove class when using keyboard
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Tab") {
        document.body.classList.remove("using-mouse");
      }
    };

    // Add event listeners
    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);

    // Add the necessary styles
    const style = document.createElement("style");
    style.innerHTML = `
      .using-mouse :focus {
        outline: none !important;
        box-shadow: none !important;
      }
    `;
    document.head.appendChild(style);

    // Clean up
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
      document.head.removeChild(style);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default KeyboardFocusOutline;
