import { useCallback, useEffect, useRef, useState } from "react";

/** A short-lived status message, announced to screen readers by the component that renders it. */
export function useNotice(duration = 3500) {
  const [notice, setNotice] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = useCallback((message: string) => {
    clearTimeout(timer.current);
    setNotice(message);
    timer.current = setTimeout(() => setNotice(null), duration);
  }, [duration]);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { notice, notify };
}
