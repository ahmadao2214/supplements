import { useSyncExternalStore } from "react";

const isBrowser = typeof window !== "undefined";

/** The page's query string; empty on the server. */
export function currentParams(): URLSearchParams {
  return new URLSearchParams(isBrowser ? window.location.search : "");
}

const noopSubscribe = () => () => {};

/**
 * False on the server and during hydration, true afterwards. The site is built
 * without a query string, so anything rendered from the URL must wait for this
 * or the first client render won't match the static HTML.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}

export function readParam(params: URLSearchParams, key: string, fallback: string): string {
  return params.get(key) ?? fallback;
}

export function readSetParam(params: URLSearchParams, key: string, fallback: string[]): Set<string> {
  const raw = params.get(key);
  if (raw) return new Set(raw.split(",").filter(Boolean));
  return new Set(fallback);
}

export function readMapParam(params: URLSearchParams, key: string): Map<number, number> {
  const raw = params.get(key);
  if (!raw) return new Map();
  const map = new Map<number, number>();
  for (const pair of raw.split(",")) {
    const [idStr, qtyStr] = pair.split(":");
    const id = Number(idStr);
    const qty = Number(qtyStr) || 1;
    if (id) map.set(id, qty);
  }
  return map;
}

export function syncToUrl(params: Record<string, string | undefined>) {
  if (!isBrowser) return;
  const p = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) p.set(key, value);
  }
  const qs = p.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState(null, "", url);
}
