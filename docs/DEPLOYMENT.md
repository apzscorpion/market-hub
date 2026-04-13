# Market Hub — Deployment Guide

> **Last Updated**: 2026-04-14

## Live URLs

- **Web App**: https://market-hub-ee86b.web.app
- **Firebase Console**: https://console.firebase.google.com/u/3/project/market-hub-ee86b/overview
- **GitHub Repo**: https://github.com/apzscorpion/market-hub

## Project IDs

| Service | ID |
|---------|-----|
| Firebase Project | `market-hub-ee86b` |
| Firebase Web App | `1:342590880807:web:66d9712f500211ac5a6202` |
| GCP Project | `market-hub-ee86b` (same as Firebase) |
| Firestore Location | `asia-south1` (Mumbai) |

## Architecture

```
Nuxt 4 (Vue 3 + TypeScript)
  → Static site generation (nuxt generate)
  → Firebase Hosting (CDN)
  → Firebase Auth (Phone OTP)
  → Firestore (Database)
  → Firebase Storage (Files/Images)
```

## Environment Variables

All Firebase config is stored in `.env` (not committed to git). Copy from `.env.example`:

```bash
cp .env.example .env
```

Required variables:
- `NUXT_PUBLIC_FIREBASE_API_KEY`
- `NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NUXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NUXT_PUBLIC_FIREBASE_APP_ID`

## Deploy Commands

### Full deploy (Hosting + Firestore rules + Storage rules)
```bash
npm run generate
npx firebase deploy --project market-hub-ee86b
```

### Hosting only (after code changes)
```bash
npm run generate
npx firebase deploy --only hosting --project market-hub-ee86b
```

### Firestore rules only
```bash
npx firebase deploy --only firestore --project market-hub-ee86b
```

### Storage rules only
```bash
npx firebase deploy --only storage --project market-hub-ee86b
```

## Local Development

```bash
# Start dev server
npm run dev

# Start with Firebase emulators
npm run emulators  # In one terminal
npm run dev        # In another terminal
```

Emulator ports:
- Auth: 9099
- Firestore: 8080
- Storage: 9199
- Emulator UI: 4000

## Firebase Console Setup Checklist

These must be done manually in the Firebase Console:

- [x] Create Firebase project
- [x] Create Web App
- [x] Enable Firestore (asia-south1)
- [x] Deploy Firestore rules
- [ ] **Enable Authentication** → Go to [Authentication](https://console.firebase.google.com/u/3/project/market-hub-ee86b/authentication) → Get Started → Enable **Phone** provider
- [ ] **Enable Storage** → Go to [Storage](https://console.firebase.google.com/u/3/project/market-hub-ee86b/storage) → Get Started → Choose asia-south1

## Google Account

- **Email**: wholesalehubtrade12@gmail.com
- **Firebase CLI Token**: Stored locally (use `npx firebase login:ci` to regenerate)

## Testing Roles

The app supports 4 roles. To test each:

1. **Wholesaler (Admin)**: Full dashboard, order management, product CRUD
2. **Retailer**: Browse products, cart, place orders, view invoices
3. **Delivery**: Order pickup/delivery interface
4. **End User**: Currently same as Retailer flow

All roles use Phone OTP login. User roles are assigned in Firestore `users` collection.
