import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "../utils/debounce";

const AUTO_HIDE_DELAY_MS = 3000;

/**
 * Returns `visible` boolean that is true when the UI should be shown.
 * Visibility resets to true on any mouse movement, then fades after
 * AUTO_HIDE_DELAY_MS of inactivity.
 */
export function useAutoHideUI(): boolean {
  const [visible, setVisible] = useState(true);

  // Stable debounced hide function — created once for the component lifetime.
  const debouncedHide = useRef(
    debounce(() => {
      setVisible(false);
    }, AUTO_HIDE_DELAY_MS),
  ).current;

  const handleMouseMove = useCallback(() => {
    setVisible(true);
    debouncedHide();
  }, [debouncedHide]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    // Kick off the initial hide timer on mount.
    debouncedHide();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove, debouncedHide]);

  return visible;
}