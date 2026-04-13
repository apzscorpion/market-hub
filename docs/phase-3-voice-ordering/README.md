# Phase 3 — Voice Ordering

## Goal

Let retailers place orders by speaking. The user taps a mic button, speaks their order in Malayalam or English, and the system converts the speech into a structured order table that they can review and edit before submitting.

This is the killer feature. It's what makes this app different from a basic ordering form.

## How It Works (End to End)

```
1. Retailer taps 🎤 mic button on the order page
2. Mic activates, UI shows listening state
3. Retailer speaks: "5 vanilla, 2 choco bar, 10 strawberry cone"
4. Speech-to-Text converts audio to text
5. Parser extracts: [{product: "vanilla", qty: 5}, {product: "choco bar", qty: 2}, ...]
6. Matcher maps text to actual products using nicknames/aliases
7. Results populate the order table
8. Retailer reviews, edits if needed, submits
```

## Reality Check

Voice recognition is **never** 100% accurate. Especially for:
- Malayalam words
- Product names that sound similar
- Noisy environments
- Accented speech

The design must assume voice will fail sometimes. The table is always editable. Voice is a fast input method, not a final one.

## Sub-Phases

| Sub-Phase | File | What It Covers |
|-----------|------|---------------|
| 3.1 | [Speech-to-Text](./3.1-speech-to-text.md) | Capture audio, convert to text |
| 3.2 | [Voice Parser](./3.2-voice-parser.md) | Extract product names and quantities from text |
| 3.3 | [Malayalam Support](./3.3-malayalam-support.md) | Handle Malayalam input, number words, mixed language |
| 3.4 | [Voice-to-Table Pipeline](./3.4-voice-to-table-pipeline.md) | Connect STT → parser → matcher → table UI |
| 3.5 | [Error Handling & Confidence](./3.5-error-handling-confidence.md) | Handle unrecognized products, low confidence matches |
| 3.6 | [Voice Confirmation & Translation](./3.6-voice-confirmation-translation.md) | Say "Confirm" to place order, Malayalam→English translation layer |

## Completion Criteria

- [ ] Mic button works in Chrome and Safari
- [ ] English voice input converts to order items
- [ ] Malayalam voice input converts to order items
- [ ] Mixed language input works (some English, some Malayalam)
- [ ] Unmatched products are flagged for manual correction
- [ ] The order table is populated from voice input
- [ ] User can edit the table after voice input
- [ ] Mic can be used multiple times (add more items)
- [ ] Voice confirmation ("Confirm") triggers order placement
- [ ] Malayalam product terms are translated before matching

## Estimated Effort

3-5 days. The parser is the hard part — expect iteration.
