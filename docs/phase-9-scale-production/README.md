# Phase 9 — Scale & Production

## Goal

Prepare the application for real-world usage. Optimize performance, secure the system, manage costs, and set up automated deployment. This is the "make it production-ready" phase.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 9.1 | [Performance Optimization](./9.1-performance.md) | Loading speed, bundle size, Firestore optimization |
| 9.2 | [Security Hardening](./9.2-security.md) | Security rules audit, input validation, rate limiting |
| 9.3 | [Cost Management](./9.3-cost-management.md) | Firebase usage monitoring, staying on free tier, scaling plan |
| 9.4 | [CI/CD & Deployment](./9.4-cicd-deployment.md) | GitHub Actions, automated deploy, staging/production |

## Why This Phase Last

Performance, security, and deployment are important, but they shouldn't slow down feature development. Build the product first (Phases 0-8), then polish for production.

That said, basic security (Firestore rules) was done in Phase 0. This phase is about the deeper hardening and operational readiness.

## Completion Criteria

- [ ] Lighthouse performance score > 90
- [ ] Lighthouse accessibility score > 90
- [ ] All Firestore security rules tested and verified
- [ ] Firebase usage stays within free tier limits
- [ ] CI/CD pipeline deploys on push to main
- [ ] Staging environment for testing before production
- [ ] Error monitoring in place (crash reporting)
- [ ] App loads in < 3 seconds on 3G

## Estimated Effort

2-3 days. Spread across multiple focus areas.
