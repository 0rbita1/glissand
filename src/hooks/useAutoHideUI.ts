import { useState, useEffect, useRef, useCallback } from "react";
import { debounce } from "../utils/debounce";

const AUTO_HIDE_DELAY_MS = 3000;

/**
 * Returns `visible` boolean that is true when the UI should be shown.
 * Visibility resets to true on any mouse movement, then fades after
 * AUTO_HIDE_DELAY_MS of inactivity.
 *
 * When `disabled` is true the UI is permanently hidden and mouse movement
 * does not reveal it.
 */
export function useAutoHideUI(disabled = false): boolean {
  const [visible, setVisible] = useState(true);

  // Stable debounced hide function — created once for the component lifetime.
  const debouncedHide = useRef(
    debounce(() => {
      setVisible(false);
    }, AUTO_HIDE_DELAY_MS),
  ).current;

  const handleMouseMove = useCallback(() => {
    if (disabled) return;
    setVisible(true);
    debouncedHide();
  }, [debouncedHide, disabled]);

  useEffect(() => {
    if (disabled) {
      setVisible(false);
      return;
    }

    setVisible(true);
    debouncedHide();

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseMove, debouncedHide, disabled]);

  return visible;
}
