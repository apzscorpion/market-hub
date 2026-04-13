# Phase 4 — Product System

## Goal

Build a proper product management system with categories, subcategories, search, filters, and a product admin interface. Until now, products were added manually to Firestore. This phase gives the wholesaler a real UI to manage their catalog.

## Why This Phase Now

Phases 1-3 assumed products already exist in the database. Someone had to seed them manually. Now we build the tools to manage products properly — add, edit, categorize, upload images.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 4.1 | [Category Structure](./4.1-category-structure.md) | Categories, subcategories, hierarchy |
| 4.2 | [Product CRUD](./4.2-product-crud.md) | Add, edit, delete products via admin UI |
| 4.3 | [Search & Filters](./4.3-search-filters.md) | Category filters, search bar, sort options |
| 4.4 | [Image Management](./4.4-image-management.md) | Upload, store, display product images |
| 4.5 | [Product Classification](./4.5-product-classification.md) | 5-dimensional classification: type, flavor, variant, packaging, temperature |
| 4.6 | [Stock Management & Badges](./4.6-stock-management-badges.md) | Stock tracking, low stock alerts, New/Trending/Recommended badges |

## How the Product Catalog Changes

**Before (Phase 1)**:
- Flat list of products
- No categories shown
- Basic search by name only
- No images (or placeholder only)

**After (Phase 4)**:
- Products organized by category → subcategory
- Retailer can browse by category tabs or search
- Product cards show real images
- Wholesaler can manage everything from admin panel

## Retailer Product View (After Phase 4)

```
┌──────────────────────────────────────────────┐
│  Products               🔍 Search    🛒 Cart │
├──────────────────────────────────────────────┤
│  [All] [Cones] [Bars] [Cups] [Family Pack]  │  ← category tabs
├──────────────────────────────────────────────┤
│  Cones › Vanilla                             │  ← subcategory header
│  ┌─────────┐  ┌─────────┐  ┌─────────┐     │
│  │ 🖼 Image │  │ 🖼 Image │  │ 🖼 Image │     │
│  │ Vanilla  │  │ Vanilla  │  │ Vanilla  │     │
│  │ Big Pack │  │ Cup      │  │ Cone     │     │
│  │ ₹250/box │  │ ₹120/pc  │  │ ₹80/pc   │     │
│  │ [Add]    │  │ [Add]    │  │ [Add]    │     │
│  └─────────┘  └─────────┘  └─────────┘     │
│                                              │
│  Cones › Chocolate                           │
│  ┌─────────┐  ┌─────────┐                  │
│  │ ...      │  │ ...      │                  │
│  └─────────┘  └─────────┘                  │
└──────────────────────────────────────────────┘
```

## Completion Criteria

- [ ] Categories and subcategories are manageable by wholesaler
- [ ] Products belong to categories
- [ ] Retailer can browse by category
- [ ] Product CRUD works (add, edit, delete)
- [ ] Product images can be uploaded and displayed
- [ ] Search works across name, nickname, aliases
- [ ] Products can be sorted and filtered
- [ ] Products classified by type, flavor, variant, packaging
- [ ] Retailers can filter by type and flavor
- [ ] Stock visibility shows on product cards (In Stock / Low / Out)
- [ ] Product badges (New / Trending / Recommended) display correctly
- [ ] Wholesaler can update stock via dedicated page

## Estimated Effort

2-3 days. Image upload needs careful attention for compression and storage.
