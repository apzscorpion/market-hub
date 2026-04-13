# Wholesale Deal Hub — Claude Instructions

## Mandatory Progress Tracking Rule

**RULE: Every time you work on any feature or functionality, you MUST update the progress tracker at `docs/PROGRESS.md`.**

How it works:

1. Before starting any work, read `docs/PROGRESS.md` to understand the current state.
2. While working, update the relevant feature section with:
   - What was implemented (specific files changed, components added, etc.)
   - The current completion percentage (0% to 100%)
   - What remains to be done
3. After completing work, update the percentage and mark completed items.

The progress document is organized by: `Phase > Feature > Sub-tasks` with percentages at every level.

This ensures that if work is interrupted at any point, the next session can immediately see what was done and continue from exactly where things left off.

## Project Overview

- **Stack**: Nuxt 4 + Vue 3 + TypeScript + Firebase + Tailwind CSS + Pinia + i18n
- **Firebase**: Auth (Phone OTP), Firestore, Storage — with emulator for local dev
- **Languages**: English + Malayalam (bilingual)
- **Roles**: Wholesaler (admin), Retailer (shop owner), Delivery personnel

## Key Conventions

- Use Composition API with `<script setup lang="ts">`
- Composables in `app/composables/`, stores in `app/stores/`
- All types defined in `app/types/`
- Phase docs live in `docs/phase-X-*/`
- Firebase emulator ports: Auth 9099, Firestore 8080, Storage 9199, UI 4000
