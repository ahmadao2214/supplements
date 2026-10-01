import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  allTemplates, readStored, writeStored, withSaved, withoutSaved, withCheckout,
  STORAGE_KEY, type CartItems, type StoredTemplates,
} from "../lib/templates";

const empty: StoredTemplates = { saved: [], checkouts: [] };

export function useTemplates() {
  // Start empty so server and first client render match; load after hydration
  const [stored, setStored] = useState<StoredTemplates>(empty);
  const storedRef = useRef(stored);

  useEffect(() => {
    const load = () => {
      storedRef.current = readStored();
      setStored(storedRef.current);
    };
    load();
    // Keep other open tabs in sync
    const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY) load(); };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const update = useCallback((fn: (s: StoredTemplates) => StoredTemplates) => {
    const next = fn(storedRef.current);
    storedRef.current = next;
    writeStored(next);
    setStored(next);
    return next;
  }, []);

  const saveTemplate = useCallback((name: string, cart: CartItems) => {
    const next = update((s) => withSaved(s, name, cart));
    return next.saved.find((t) => t.name.toLowerCase() === name.trim().toLowerCase())!;
  }, [update]);

  const deleteTemplate = useCallback((id: string) => update((s) => withoutSaved(s, id)), [update]);
  const recordCheckout = useCallback((cart: CartItems) => update((s) => withCheckout(s, cart)), [update]);

  const templates = useMemo(() => allTemplates(stored), [stored]);
  /** Current list even before the next render — for agent tools called back to back */
  const getTemplates = useCallback(() => allTemplates(storedRef.current), []);

  return { templates, getTemplates, saveTemplate, deleteTemplate, recordCheckout };
}
