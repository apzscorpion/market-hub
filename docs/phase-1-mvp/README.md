# Phase 1 — MVP (Make It Work)

## Goal

Get a working system where a retailer can log in, browse products, add them to a cart, and place an order. The wholesaler can see all orders and change their status. Nothing fancy — just the complete flow, end to end.

**No voice. No table UI. No delivery.** Just the core order loop.

## Why This Phase Matters

This is the proof that the system works. If a retailer can place an order and a wholesaler can see it, you have a product. Everything after this is enhancement.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 1.1 | [Firebase Integration](./1.1-firebase-integration.md) | Connect Nuxt to Firebase, initialize services |
| 1.2 | [Authentication Flow](./1.2-authentication-flow.md) | Phone OTP login, role detection, route guards |
| 1.3 | [Product Catalog](./1.3-product-catalog.md) | Display products for retailer, basic listing |
| 1.4 | [Cart System](./1.4-cart-system.md) | Add to cart, modify quantities, review before submit |
| 1.5 | [Order Placement](./1.5-order-placement.md) | Submit order to Firestore, handle success/error |
| 1.6 | [Wholesaler Dashboard](./1.6-wholesaler-dashboard.md) | View all orders, see details |
| 1.7 | [Order Status Management](./1.7-order-status-management.md) | Wholesaler changes order status, retailer sees updates |
| 1.8 | [Invoice Generation](./1.8-invoice-generation.md) | Auto-generate invoice on order accept, printable view |

## User Flows

### Retailer Flow
```
Login (phone OTP)
  → Product list
    → Add to cart
      → Review cart
        → Place order
          → See "Order placed" confirmation
            → View order in history with status
```

### Wholesaler Flow
```
Login (phone OTP)
  → Dashboard showing all recent orders
    → Click order → see details
      → Change status (pending → accepted → shipped)
```

## Pages Built in This Phase

| Page | Route | Role |
|------|-------|------|
| Login | `/login` | All |
| Product Catalog | `/retailer/products` | Retailer |
| Cart | `/retailer/cart` | Retailer |
| My Orders | `/retailer/orders` | Retailer |
| Order Dashboard | `/wholesaler/dashboard` | Wholesaler |
| Order Detail | `/wholesaler/orders/[id]` | Wholesaler |

## Edge Cases to Handle

- **Duplicate order submission**: Disable button after click, show loading state
- **Network failure during order**: Show error toast, keep cart intact so user can retry
- **Empty cart submit**: Prevent. Button should be disabled when cart is empty
- **User has no role document**: Show "Contact your wholesaler" screen
- **OTP doesn't arrive**: Allow resend after 30 seconds
- **Session expiry**: Detect auth state change, redirect to login

## Completion Criteria

- [ ] Retailer can log in with phone OTP
- [ ] Retailer sees product list
- [ ] Retailer can add products to cart and adjust quantities
- [ ] Retailer can submit order — it appears in Firestore
- [ ] Wholesaler can log in and see all orders
- [ ] Wholesaler can change order status
- [ ] Retailer sees status change on their order
- [ ] Invoice auto-generates when order is accepted
- [ ] Invoice is viewable and printable
- [ ] All routes are protected (can't access without login)
- [ ] Role-based routing works (retailer can't see wholesaler pages)

## Estimated Effort

2-3 days of focused work.
