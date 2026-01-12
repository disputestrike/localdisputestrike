import { useEffect } from "react";
import { useLocation } from "wouter";

/**
 * ScrollToTop component - scrolls to top of page on route change
 * This fixes the issue where navigating to a new page lands at the bottom
 */
export function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    // Scroll to top whenever the location changes
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "instant" // Use instant to avoid jarring scroll animation
    });
  }, [location]);

  return null; // This component doesn't render anything
}

export default ScrollToTop;
