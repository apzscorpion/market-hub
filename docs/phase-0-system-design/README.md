# Phase 0 — System Design

## Goal

Lock down every architectural decision BEFORE writing a single line of application code. This phase produces the blueprint that every other phase builds on. If this is wrong, everything else is wrong.

## What This Phase Produces

- Finalized user roles with exact permissions
- Complete data model (every collection, every field, every relationship)
- Tech stack confirmed with reasoning
- Firebase project created and configured
- Nuxt 3 project scaffolded with folder structure
- Firebase security rules drafted
- Coding conventions documented

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 0.1 | [User Roles & Permissions](./0.1-user-roles-permissions.md) | Who uses the system, what each role can do |
| 0.2 | [Data Models & Entities](./0.2-data-models-entities.md) | Firestore collections, document structure, relationships |
| 0.3 | [Tech Stack & Architecture](./0.3-tech-stack-architecture.md) | Why Nuxt 3, why Firebase, how they connect |
| 0.4 | [Firebase Setup](./0.4-firebase-setup.md) | Create project, enable services, security rules |
| 0.5 | [Project Scaffolding](./0.5-project-scaffolding.md) | Nuxt 3 init, folder structure, base config |
| 0.6 | [Coding Conventions](./0.6-coding-conventions.md) | Naming, file structure, component patterns |

## Completion Criteria

- [ ] All three roles documented with permissions matrix
- [ ] Firestore data model finalized — no "we'll figure it out later"
- [ ] Firebase project created, Auth + Firestore + Storage enabled
- [ ] Nuxt 3 project runs locally with base layout
- [ ] Security rules drafted for all collections
- [ ] Folder structure matches the conventions doc

## Estimated Effort

Half a day to one day. Do not rush this. Every shortcut here becomes a rewrite later.
