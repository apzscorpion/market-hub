# Phase 7 — Mobile (PWA)

## Goal

Convert the Nuxt 3 app into a Progressive Web App that's installable on phones, sends push notifications, and works with basic offline support. The target users (retailers, delivery boys) primarily use mobile phones — the app must feel native.

## Why PWA Over Native App

| Factor | PWA | Native (React Native/Flutter) |
|--------|-----|------|
| Development cost | One codebase | Separate iOS + Android |
| Distribution | Just share a URL | App Store approval process |
| Updates | Instant (deploy to web) | Store review cycle |
| Install size | ~2MB | 30-100MB |
| Performance | Good (for this use case) | Better |
| Voice/mic access | Yes (Web APIs) | Yes |
| Push notifications | Yes (FCM) | Yes |
| Offline | Limited but sufficient | Full |

For this app, PWA is the right choice. The users don't need heavy native features (GPS tracking, Bluetooth, etc.). They need: ordering, notifications, and installability.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 7.1 | [PWA Configuration](./7.1-pwa-config.md) | Service worker, manifest, installability |
| 7.2 | [Push Notifications](./7.2-push-notifications.md) | FCM setup, notification triggers, handling |
| 7.3 | [Offline Support](./7.3-offline-support.md) | Cache strategies, offline fallback, data sync |

## Completion Criteria

- [ ] App is installable on Android and iOS
- [ ] "Add to Home Screen" prompt appears
- [ ] Push notifications work for order updates
- [ ] App loads and shows cached data when offline
- [ ] App icon and splash screen look professional

## Estimated Effort

2-3 days. Push notifications with Firebase Cloud Messaging require Cloud Functions setup.
