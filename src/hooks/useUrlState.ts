const isBrowser = typeof window !== "undefined";

function getParams(): URLSearchParams {
  if (!isBrowser) return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export function readParam(key: string, fallback: string): string {
  return getParams().get(key) ?? fallback;
}

export function readSetParam(key: string, fallback: string[]): Set<string> {
  const raw = getParams().get(key);
  if (raw) return new Set(raw.split(",").filter(Boolean));
  return new Set(fallback);
}

export function readMapParam(key: string): Map<number, number> {
  const raw = getParams().get(key);
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
