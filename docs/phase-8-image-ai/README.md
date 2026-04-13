# Phase 8 — Image + AI

## Goal

Enhance product management with image-based features. Start with manual image handling improvements, then optionally add AI-powered product recognition for faster catalog building.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 8.1 | [Image Pipeline](./8.1-image-pipeline.md) | Advanced image handling: thumbnails, gallery, optimization |
| 8.2 | [AI Recognition](./8.2-ai-recognition.md) | Optional: auto-detect product from photo using Google Vision |

## Why This Phase Exists

Phase 4 added basic image upload. This phase improves it:

**Problem**: Wholesalers have hundreds of products. Manually entering names, categories, and details for each one is tedious.

**Solution (Basic)**: Better image tools — bulk upload, image gallery, better compression.

**Solution (Advanced)**: Take a photo of a product → AI suggests the product name and category. The wholesaler confirms or corrects.

## Priority

This is a "nice to have" phase. If time is limited, skip 8.2 (AI) and focus on 8.1 (image pipeline improvements). The core app works perfectly without AI.

## Completion Criteria

- [ ] Image thumbnails are generated and cached for fast loading
- [ ] Product gallery view works (swipe through images)
- [ ] Bulk image upload works (drag multiple files)
- [ ] (Optional) AI can suggest product name from a photo
- [ ] (Optional) AI suggestions have accuracy > 70% for common products

## Estimated Effort

- 8.1 (Image Pipeline): 1 day
- 8.2 (AI Recognition): 2-3 days (if implemented)
