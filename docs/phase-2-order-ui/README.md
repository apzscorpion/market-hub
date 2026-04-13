# Phase 2 — Real Order UI (Table-Based Ordering)

## Goal

Replace the Phase 1 cart (browse + add to cart) with a **table-based ordering interface** that's fast, professional, and built for wholesale ordering speed. Think Excel for orders — not Amazon for shopping.

## Why Replace the Cart?

The Phase 1 cart works like an e-commerce store: browse products, click "Add to Cart", go to cart page, checkout. That's fine for consumers buying 2-3 things. But wholesale retailers order **20-50 items** routinely. The browse-and-add flow is painfully slow for that.

The table UI lets a retailer type a product name, tab to quantity, type the number, move to next row. The entire order can be built in under 60 seconds.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 2.1 | [Table Component](./2.1-table-component.md) | Core editable table with add/remove rows |
| 2.2 | [Product Autocomplete](./2.2-product-autocomplete.md) | Type-ahead product search in the table |
| 2.3 | [Nickname & Alias Matching](./2.3-nickname-alias-matching.md) | Match "vanilla" to "Vanilla Big Pack" |
| 2.4 | [Quick Reorder](./2.4-quick-reorder.md) | Repeat a previous order with one tap |
| 2.5 | [Frequent Items & Smart Ordering](./2.5-frequent-items-smart-ordering.md) | Show most-ordered products first, frequency-boosted search |

## The Table UI

```
┌──────────────────────────────────────────────────┐
│  New Order                          [🎤 Voice]   │
├──────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┬──────┬────────┬──────┬──────┐ │
│  │ Product      │ Qty  │ Unit   │ Price│ Total│ │
│  ├──────────────┼──────┼────────┼──────┼──────┤ │
│  │ Vanilla B... │  2   │ box    │ ₹250 │ ₹500 │ │
│  │ Choco Bar    │  5   │ piece  │ ₹180 │ ₹900 │ │
│  │ [type here]  │      │        │      │      │ │
│  └──────────────┴──────┴────────┴──────┴──────┘ │
│                                                  │
│  [+ Add Row]                     Total: ₹1,400  │
│                                                  │
│  Notes: ________________________________         │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │             Place Order                   │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
└──────────────────────────────────────────────────┘
```

## UX Principles

1. **Keyboard-first**: Tab between cells, Enter to confirm, arrow keys to navigate
2. **Autocomplete always visible**: Start typing a product name, suggestions appear immediately
3. **Nickname priority**: Show nicknames in suggestions (they're shorter and faster to scan)
4. **Auto-fill on select**: Selecting a product fills in unit type and price automatically
5. **Last row is always empty**: An empty row at the bottom invites the next entry
6. **Delete is easy**: Delete key or trash icon removes a row
7. **No page navigation**: The entire order is built on a single page

## Completion Criteria

- [ ] Table-based order interface replaces the browse-and-cart flow
- [ ] Autocomplete searches by name, nickname, and aliases
- [ ] Selecting a product auto-fills unit and price
- [ ] Quantities are editable inline
- [ ] Rows can be added and removed
- [ ] Keyboard navigation works (Tab, Enter, Delete)
- [ ] "Quick Reorder" loads a previous order into the table
- [ ] Frequent items section shows personalized top products
- [ ] Tapping a frequent item adds it to the table
- [ ] Autocomplete results boosted by order frequency
- [ ] Order can be submitted from the table
- [ ] Table works well on mobile (responsive)

## Estimated Effort

2-3 days. The autocomplete and keyboard navigation need careful attention.
