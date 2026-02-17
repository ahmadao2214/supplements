import { useState, useMemo, useCallback } from "react";
import { supplements, type Supplement } from "../data/supplements";
import { buildCartUrl, initSupplementMap, getSupplementById } from "../lib/cart-utils";
import { readMapParam } from "./useUrlState";

export function useCart(filtered: Supplement[], prices: Record<number, number>) {
  // Initialize supplement map for cart URL building
  initSupplementMap(supplements);

  const [cartItems, setCartItems] = useState<Map<number, number>>(() => readMapParam("cart"));

  const toggleCartItem = useCallback((id: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.set(id, 1);
      }
      return next;
    });
  }, []);

  const setCartQty = useCallback((id: number, qty: number) => {
    setCartItems((prev) => {
      const next = new Map(prev);
      if (qty <= 0) {
        next.delete(id);
      } else {
        next.set(id, qty);
      }
      return next;
    });
  }, []);

  const clearCart = useCallback(() => setCartItems(new Map()), []);

  const filteredPurchasable = useMemo(
    () => filtered.filter((s) => s.purchaseUrl),
    [filtered]
  );

  const selectAllState = useMemo(() => {
    if (filteredPurchasable.length === 0) return "none" as const;
    const selectedCount = filteredPurchasable.filter((s) => cartItems.has(s.id)).length;
    if (selectedCount === 0) return "none" as const;
    if (selectedCount === filteredPurchasable.length) return "all" as const;
    return "some" as const;
  }, [filteredPurchasable, cartItems]);

  const handleSelectAll = useCallback(() => {
    if (selectAllState === "all") {
      setCartItems((prev) => {
        const next = new Map(prev);
        for (const s of filteredPurchasable) next.delete(s.id);
        return next;
      });
    } else {
      setCartItems((prev) => {
        const next = new Map(prev);
        for (const s of filteredPurchasable) {
          if (!next.has(s.id)) next.set(s.id, 1);
        }
        return next;
      });
    }
  }, [selectAllState, filteredPurchasable]);

  const cartTotal = useMemo(() => {
    let count = 0;
    for (const qty of cartItems.values()) count += qty;
    return count;
  }, [cartItems]);

  const cartSubtotal = useMemo(() => {
    let total = 0;
    let allPriced = true;
    for (const [id, qty] of cartItems) {
      if (prices[id]) {
        total += prices[id] * qty;
      } else {
        allPriced = false;
      }
    }
    return { total, allPriced };
  }, [cartItems, prices]);

  const openSwansonCart = useCallback(() => {
    if (cartItems.size === 0) return;
    const url = buildCartUrl(cartItems);
    window.open(url, "_blank", "noopener,noreferrer");
  }, [cartItems]);

  const cartNames = useMemo(() => {
    return [...cartItems]
      .map(([id, qty]) => {
        const s = getSupplementById(id);
        if (!s) return null;
        const shortName = s.name.replace(/\s*\(.*\)/, "");
        return qty > 1 ? `${shortName} x${qty}` : shortName;
      })
      .filter(Boolean)
      .join(", ");
  }, [cartItems]);

  return {
    cartItems,
    toggleCartItem,
    setCartQty,
    clearCart,
    selectAllState,
    handleSelectAll,
    cartTotal,
    cartSubtotal,
    openSwansonCart,
    cartNames,
  };
}
