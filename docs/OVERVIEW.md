# Wholesale Deal Hub — Project Overview

## The Idea

Wholesale Deal Hub is an **Intelligent Ice Cream Wholesale Ordering Platform** — a voice-first B2B commerce system built for the Kerala market. It connects wholesalers (distributors) with retailers (shop owners) through a fast, voice-enabled ordering system that supports **Malayalam and English**.

The core problem: retailers currently place orders via phone calls, WhatsApp messages, or handwritten notes. This is slow, error-prone, and impossible to track. Wholesale Deal Hub replaces this chaos with a structured, digital ordering system that feels as fast as a phone call but gives the reliability of software.

This is NOT just an "ordering app". It's a complete wholesale business operating system with voice intelligence, smart product classification, real-time stock visibility, automated invoicing, and delivery tracking.

## The Core Flow

```
🎤 Speak → 🧠 Understand → 📊 Show → ✏️ Edit → ✅ Confirm → 🧾 Invoice → 🚚 Deliver
```

## Who Uses This

The system is a single application that behaves differently based on role:

| Role | What They Do |
|------|-------------|
| **Wholesaler (Super Admin)** | Controls everything — products, pricing, orders, users, stock, analytics. The brain of the system. |
| **Retailer (Shop Owner)** | Places orders via voice or table UI. Views products, tracks orders, receives invoices. The primary user. |
| **Delivery Boy** | Fulfills orders. Picks up, delivers, updates status. Simple mobile interface. |
| **Analytics Layer** (future) | Business intelligence — sales trends, top products, retailer insights. |

## What Makes This Different

1. **Voice-First Ordering** — Retailers speak their order in Malayalam or English. A 4-layer intelligence pipeline (Speech → Translation → Alias Matching → Parser) converts speech to structured orders. This is the killer feature.
2. **Smart Product Classification** — Products are classified across 5 dimensions: Type, Flavor, Variant, Packaging, and Temperature Sensitivity. Not just "name and category".
3. **Nickname/Alias Matching** — Products have short names and aliases in multiple languages. "Vanilla" matches "Vanilla Big Pack". "വാനില" matches "Vanilla". Retailers don't need to remember full product names.
4. **Table-Based Order UI** — Orders are built in an editable table (like Excel), not a traditional e-commerce cart. This matches how wholesale ordering actually works — fast, bulk, no browsing.
5. **Stock Visibility** — Retailers see what's available and what's out of stock in real-time.
6. **Auto-Invoicing** — Every confirmed order generates an invoice automatically.
7. **Smart Product Creation** — Wholesaler can add products by photo (OCR) or voice description, not just manual forms.
8. **Frequent Items Intelligence** — The system learns what each retailer orders most and surfaces those items first.
9. **Bilingual** — Full Malayalam + English support across the platform.

## Product Classification System

Every product is classified across 5 dimensions:

### 1. Type (Primary Category) — How it's sold
- Stick / Bar (Choco Bar)
- Cone
- Cup
- Scoop
- Family Pack (500ml / 1L)
- Bulk Pack (5L / 10L)
- Party Pack
- Tub
- Stick Ice / Popsicle

### 2. Flavor
- Vanilla, Chocolate, Strawberry, Mango, Butterscotch, Pista, Mixed Fruit, Tender Coconut
- Custom (wholesaler can add any flavor)

### 3. Variant / Special Type
- Sugar-free, Premium, Kids Special, Seasonal, Limited Edition

### 4. Packaging Type
- Single piece, Box (contains X items), Carton, Loose

### 5. Temperature Sensitivity (optional)
- Quick melt, Standard, Long-hold

A fully classified product looks like:
**"Choco Bar → Chocolate → Premium → Box (20 pcs) → Standard"**

### Product Badges

Products can be flagged as:
- **New** — Recently added, highlighted to retailers
- **Trending** — Hot seller, promoted in UI
- **Recommended** — Wholesaler's pick, shown prominently

These badges drive business growth by surfacing products retailers might not know about yet.

## Voice Intelligence Pipeline

The voice system is a 4-layer pipeline, not just speech-to-text:

```
Layer 1: Speech Recognition
  Web Speech API (free) → Google Cloud STT (upgrade)
  Input: Audio
  Output: Raw text in Malayalam or English

Layer 2: Translation & Normalization
  Malayalam → English mapping for known product terms
  Unicode normalization, filler word removal
  Input: Raw text
  Output: Clean text

Layer 3: Alias Matching
  Match cleaned text against product aliases database
  aliases = ["vanilla", "വാനില", "vanila", "vanilla ice"]
  Input: Clean text
  Output: Matched products with confidence scores

Layer 4: Order Parser
  Extract quantity-product pairs from matched text
  "5 vanilla" → { product: "Vanilla Big Pack", qty: 5 }
  Input: Matched text
  Output: Structured order items

  Bonus: Voice Confirmation
  User says "Confirm" → order is placed
```

## Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Frontend | **Nuxt 3** (Vue 3) | SSR, file-based routing, great DX |
| State | **Pinia** | Official Vue state management |
| Backend | **Firebase** | Auth, Firestore, Storage — free tier is generous |
| Voice | **Web Speech API** → later **Google Cloud STT** | Free to start, upgrade when needed |
| Hosting | **Firebase Hosting** or **Vercel** | Zero-config deployment |
| Mobile | **PWA** | No native app needed, installable from browser |
| AI (future) | **Google Cloud Vision** | OCR for product photos |

## System Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Retailer   │     │  Wholesaler │     │  Delivery   │
│  (Nuxt App) │     │  (Nuxt App) │     │  (Nuxt App) │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────┬───────┘───────────────────┘
                   │
            ┌──────▼──────┐
            │   Firebase   │
            │  ┌─────────┐ │
            │  │  Auth    │ │
            │  ├─────────┤ │
            │  │Firestore │ │
            │  ├─────────┤ │
            │  │ Storage  │ │
            │  ├─────────┤ │
            │  │Functions │ │
            │  └─────────┘ │
            └──────────────┘
                   │
            ┌──────▼──────┐
            │  Voice APIs  │
            │  Web Speech  │
            │  / Cloud STT │
            └──────────────┘
```

## Core Data Entities

```
User
├── id, name, phone, role, active
├── address
├── fcmTokens[] (push notifications)
└── createdAt, updatedAt

Product
├── id
├── name (full name)
├── nickname (short display name)
├── aliases[] (voice matching — English, Malayalam, misspellings)
├── classification
│   ├── typeId (cone / bar / cup / family pack / ...)
│   ├── flavor (vanilla / chocolate / ...)
│   ├── variant (premium / sugar-free / kids / ...)
│   ├── packagingType (single / box / carton / loose)
│   └── temperatureSensitivity (quick-melt / standard / long-hold)
├── categoryId, subcategoryId
├── unitType (box / piece / pack / kg / litre)
├── unitsPerPackage (e.g., 20 pieces per box)
├── price
├── images[]
├── stock
│   ├── quantity (current stock count)
│   ├── lowStockThreshold (alert when below this)
│   └── lastUpdated
├── badges
│   ├── isNew (boolean)
│   ├── isTrending (boolean)
│   └── isRecommended (boolean)
├── active (boolean)
├── sortOrder
└── createdAt, updatedAt

Category
├── id, name, nameML, sortOrder
└── subcategories[]

Order
├── id
├── retailerId, retailerName, retailerPhone
├── items[]
│   ├── productId, productName, nickname
│   ├── quantity, unitType, price
│   └── lineTotal
├── status (pending → accepted → shipped → delivered)
├── assignedDeliveryId, assignedDeliveryName
├── totalAmount
├── notes, adminNotes
├── orderSource (manual / voice)
├── invoiceId (reference to invoice)
├── createdAt, updatedAt
└── statusHistory[]

Invoice
├── id
├── orderId
├── retailerId, retailerName
├── items[] (snapshot of order items at confirmation)
├── subtotal, tax, total
├── invoiceNumber (sequential: INV-2026-0001)
├── status (generated / sent / paid)
├── generatedAt
└── pdfUrl (optional — stored in Firebase Storage)

ActivityLog
├── id, action, performedBy, targetType, targetId
├── details
└── createdAt
```

## Build Phases

This project is built in **10 phases**, executed sequentially. Each phase produces a working, testable increment. You do NOT move to the next phase until the current one is complete and stable.

| Phase | Name | Sub-Phases | What You Get |
|-------|------|-----------|-------------|
| **0** | System Design | 6 | Locked data models, architecture decisions, project scaffolding |
| **1** | MVP | 8 | Retailer places orders, wholesaler sees them, auto-invoice generated |
| **2** | Real Order UI | 5 | Table-based ordering with autocomplete, nicknames, frequent items |
| **3** | Voice Ordering | 6 | 4-layer voice pipeline, Malayalam, voice confirmation |
| **4** | Product System | 6 | Classification, categories, search, stock visibility, badges |
| **5** | Full Admin Panel | 6 | Orders, users, bulk ops, invoices, stock alerts, sales insights |
| **6** | Delivery System | 3 | Delivery interface, assignment, tracking |
| **7** | Mobile (PWA) | 3 | Installable app, push notifications, offline |
| **8** | Image + AI | 2 | Image pipeline, AI recognition |
| **9** | Scale & Production | 4 | Performance, security, cost management, CI/CD |

**Total: 49 sub-phases across 10 phases**

## Smart Features (Across Phases)

These features don't fit neatly into one phase — they're woven throughout:

| Feature | Where Built | Why It Matters |
|---------|------------|---------------|
| Quick Reorder | Phase 2 | "Repeat last order" — huge time saver for routine orders |
| Frequent Items | Phase 2 | Show most-ordered products first per retailer |
| Stock Visibility | Phase 4 | Retailers see what's available before ordering |
| Product Badges | Phase 4 | New/Trending/Recommended drive product discovery |
| Auto-Invoice | Phase 1 | Every order generates an invoice automatically |
| Voice Confirmation | Phase 3 | Say "Confirm" to place order — zero taps |
| Low Stock Alerts | Phase 5 | Wholesaler gets warned before running out |
| Sales Insights | Phase 5 | Top products, fast-moving items, retailer analytics |
| Push Notifications | Phase 7 | New products, order updates, delivery status |

## Rules for Execution

1. **Complete each phase fully before moving on.** No half-built features.
2. **Every phase must be testable.** If you can't demo it, it's not done.
3. **Voice is NOT in MVP.** Get the basics working first. Voice comes in Phase 3.
4. **Don't over-engineer early.** Phase 0-1 should be simple. Complexity grows naturally.
5. **Always allow manual fallback.** Voice will fail sometimes. The UI must stand on its own.
6. **Design data models for the future.** Even if Phase 1 doesn't use product classification, the schema should support it from day one.

## Target Market

- **Geography**: Kerala, India
- **Vertical**: Ice cream wholesale distribution (expandable to other FMCG)
- **Language**: Malayalam primary, English secondary
- **Users**: Small-to-medium wholesale distributors and their retail shop network
- **Scale**: Start with 1 wholesaler + their retailers. Expand from there.

## Success Criteria

- A retailer can place a complete order in under 60 seconds
- Voice ordering works for 80%+ of common product names in both languages
- The wholesaler can manage 50+ orders/day without confusion
- Every order has an auto-generated invoice
- Stock levels are accurate and visible to retailers
- Delivery tracking is real-time
- The system runs on Firebase free tier for initial launch
- The app is installable as a PWA and feels native on mobile
