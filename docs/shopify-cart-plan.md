# Shopify Cart Integration — Implementation Plan

> **Source:** `docs/shopify-cart-integration.excalidraw`
> **Branch:** `claude/shopify-cart-integration-QpW18`
> **Status:** Approved

---

## Overview

Add a "bulk cart" feature to the supplement table. Users check off the supplements they want to buy, and a sticky bar at the bottom builds a Swanson Vitamins cart permalink that opens in a new tab — no API key needed.

**9 of 40 supplements** currently have Shopify variant IDs in their `purchaseUrl`:

| Supplement | Variant ID | Tier |
|---|---|---|
| Omega-3 Fish Oil | 46319082143882 | T1 |
| Magnesium L-Threonate | 46318854602890 | T1 |
| L-Theanine | 46319104753802 | T1 |
| Zinc | 46318802993290 | T1 |
| Vitamin D3 | 46319080964234 | T1 |
| B-Complex (Methylated) | 46319091122314 | T1 |
| L-Tyrosine | 46319081783434 | T1 |
| Bacopa Monnieri | 46319095677066 | T1 |
| Saffron Extract | 46319077163146 | T2 |

---

## UI Flow

```
SupplementTable (checkboxes) ──toggle──▶ Cart Summary Bar (sticky bottom) ──window.open──▶ Swanson Cart (new tab)
```

1. **Buy column with checkboxes** appears in the table (replaces the current "Buy" link column)
2. **Select-all checkbox** in the `<thead>` — only selects currently *filtered & purchasable* rows
3. **Rows without `purchaseUrl`** show a disabled/greyed-out checkbox (or no checkbox at all)
4. When >= 1 item is selected, a **sticky CartSummaryBar** slides up from the bottom
5. Bar shows: item count, selected supplement names, and an **"Open Swanson Cart"** button
6. Button calls `window.open(cartPermalink, '_blank')`

---

## Data Flow

```
supplement.purchaseUrl            e.g. "...?variant=46319081783434"
        │
        ▼
extractVariantId(url)             regex: /variant=(\d+)/  →  "46319081783434"
        │
        ▼
cartItems                         Map<supplementId, { variantId, qty }>
        │
        ▼
buildCartUrl(cartItems)           "https://www.swansonvitamins.com/cart/VID:QTY,VID:QTY,..."
```

**Example output:**
```
https://www.swansonvitamins.com/cart/46319081783434:2,46319082143882:1,46319104753802:3
```
(L-Tyrosine x2, Omega-3 x1, L-Theanine x3)

---

## Skills Used

| Skill | When |
|---|---|
| **frontend-design** | Steps 3–4: Build the checkbox UI and CartSummaryBar with polished, production-grade design |
| **astro** | Steps 5–6: Ensure Astro component patterns, Layout.astro styling, and SSR/hydration are correct |
| **core-web-vitals** | Step 5: Audit for LCP/INP/CLS impact — sticky bar, checkbox re-renders, layout shifts |
| **web-design-guidelines** | Final review: Accessibility audit (checkbox labels, focus states, ARIA), UX compliance |

---

## Implementation Steps

### Step 1: URL utility functions

Keep inline at the top of `SupplementTable.tsx`:

```ts
function extractVariantId(purchaseUrl: string): string | null {
  const match = purchaseUrl.match(/variant=(\d+)/);
  return match ? match[1] : null;
}

function buildCartUrl(items: Map<number, { variantId: string; qty: number }>): string {
  const parts = [...items.values()].map(({ variantId, qty }) => `${variantId}:${qty}`);
  return `https://www.swansonvitamins.com/cart/${parts.join(',')}`;
}
```

### Step 2: Cart state in SupplementTable

```ts
// Map of supplementId → quantity (presence in map = selected, value = qty)
const [cartItems, setCartItems] = useState<Map<number, number>>(new Map());
```

Helper functions:
- `toggleItem(id)` — add with qty 1, or remove if already present
- `setQty(id, qty)` — update quantity for a specific item (min 1, remove if set to 0)
- `selectAll()` — select all *filtered* supplements that have a `purchaseUrl` (qty 1 each)
- `clearAll()` — empty the map
- `isAllSelected` — derived: are all filtered purchasable items in the map?

### Step 3: Buy column checkboxes + quantity

Modify the existing `purchaseUrl` column rendering:
- **Header:** Select-all checkbox (tri-state: none / some / all)
- **Row (purchasable):** Checkbox + inline qty control when checked
  - Checkbox toggles item in/out of cart
  - When checked, show compact `−` `[qty]` `+` stepper (min 1)
- **Row (no purchaseUrl):** Disabled/greyed-out checkbox or `--` placeholder
- Keep the existing individual "Buy" link in the expanded detail card

### Step 4: CartSummaryBar component

A sticky bar at the bottom of `.table-container`:
- Only renders when `cartItems.size > 0`
- Shows: `"3 items: Omega-3 x1, L-Theanine x2, Zinc x1"`
- Total item count (sum of quantities)
- **"Open Swanson Cart"** button — builds the URL and opens in new tab
- **"Clear"** button to deselect all
- Smooth slide-up animation (CSS transition)

### Step 5: Styling

- Checkbox + qty stepper: compact inline layout, consistent with existing badge style
- Sticky bar: `position: sticky; bottom: 0` with top shadow and theme-consistent background
- Selected rows get a light highlight (`background-color` change)
- Qty stepper: small `−`/`+` buttons flanking the number, ~20px
- Responsive: bar stacks vertically on mobile, qty stepper stays inline

### Step 6: URL state sync

Persist cart selections in the URL query string (like existing filters):
- Format: `?cart=1:2,3:1,4:1` (supplementId:qty pairs)
- Enables shareable cart links — fits the existing URL sync pattern

---

## Decisions (Resolved)

1. **Checkbox replaces Buy link** in the table column. Individual "Buy on Swanson" link stays in the expanded detail card.
2. **Select-all scoped to filtered rows** — only selects currently filtered supplements that have a `purchaseUrl`.
3. **Cart state synced to URL** — `?cart=1:2,3:1` format, so selections persist on refresh and are shareable.
4. **Quantity support included** — +/- stepper appears inline when an item is checked. Default qty 1, min 1.
5. **Slide-up animation** for the cart bar via CSS transition.

---

## Files to Modify

| File | Changes |
|---|---|
| `src/components/SupplementTable.tsx` | Add cart state, checkbox column, CartSummaryBar |
| `src/layouts/Layout.astro` | Add styles for cart bar, checkboxes, selected row highlights |

**No new files needed** — everything fits within the existing component and stylesheet.

---

## Out of Scope (v1)

- Persisting cart state to localStorage
- Support for other vendors beyond Swanson
- Price display
- Cart item reordering
