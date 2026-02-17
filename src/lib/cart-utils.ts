import type { Supplement } from "../data/supplements";

const supplementMap = new Map<number, Supplement>();

export function initSupplementMap(supplements: Supplement[]) {
  if (supplementMap.size === 0) {
    for (const s of supplements) supplementMap.set(s.id, s);
  }
}

export function getSupplementById(id: number): Supplement | undefined {
  return supplementMap.get(id);
}

export function extractVariantId(purchaseUrl: string): string | null {
  const match = purchaseUrl.match(/variant=(\d+)/);
  return match ? match[1] : null;
}

export function buildCartUrl(cartItems: Map<number, number>): string {
  const parts: string[] = [];
  for (const [suppId, qty] of cartItems) {
    const supp = supplementMap.get(suppId);
    if (!supp?.purchaseUrl) continue;
    const variantId = extractVariantId(supp.purchaseUrl);
    if (variantId) parts.push(`${variantId}:${qty}`);
  }
  return `https://www.swansonvitamins.com/cart/${parts.join(",")}`;
}
