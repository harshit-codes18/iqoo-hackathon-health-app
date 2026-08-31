# AI Health Companion — iQOO Hackathon Prototype

## What we're building
A camera-first app that scans lab reports (photo or PDF), explains results
in plain language via AI, flags abnormal values, generates a Doctor Visit
Brief, and lets one account manage multiple family members' health records.

## Current status (Sharvin's build — core skeleton complete)
- ✅ Camera capture (single + multi-page) → Gemini API → structured results
- ✅ PDF upload → same pipeline
- ✅ Color-coded results screen (green/yellow/red by severity)
- ✅ Doctor Visit Brief screen (flagged findings + suggested questions)
- ✅ Family profile switcher (Dad/Mom tabs, sample data, report history)
- ⏳ Not yet built: voice output, real UI polish, trend chart (cut for time, causing too many errors)

## Tech stack
- React Native + Expo (SDK 54)
- Gemini API (free tier) — gemini-3.6-flash model, called directly from the app
- expo-camera, expo-document-picker, expo-file-system
- No backend — Gemini called client-side

## Data schema (used across the app)

{
tests: [
{
name: string,
value: string,
referenceRange: string,
severity: "normal" | "mild" | "high" | "low",
explanation: string
}
]
}

See `/sample-data/sample-profiles.ts` for the full shape used in the Family tab.

## How to run locally
1. `npm install`
2. Create a `.env` file in the project root:

EXPO_PUBLIC_GEMINI_API_KEY=your_key_here

   Get a free key at https://aistudio.google.com/apikey
3. `npx expo start --tunnel` (tunnel mode is more reliable across networks)
4. Scan the QR code with Expo Go (iOS) or the camera app (Android)

## Task split — what's left

### Harshit
- Polish UI across all screens (Home/scan, Results, Doctor Brief, Family) —
  better spacing, typography, icons, transitions. Functionality is done;
  this is visual polish only.
- Files to work in: `app/(tabs)/index.tsx`, `app/(tabs)/family.tsx`
- Use `/sample-data/sample-profiles.ts` if you need to tweak sample data

### Sara
- Deck (PDF/PPT): problem, solution, differentiators, tech stack, team slide
- Video walkthrough: script + record + light edit (show camera scan →
  results → Doctor Brief → Family tab)
- Submission form write-up (description, what makes team stand out, prior builds)

### Sharvin (if time remains)
- Voice output (English + Marathi) — deprioritized, add back only if time allows
- On-device OCR (ML Kit) — only relevant once we have Android/iQOO hardware,
  for the actual 30-hour event, not this submission

## Known limitations (be upfront about these in the pitch)
- Family/trend data is currently hardcoded sample data, not yet connected
  to real scanned reports being saved per-profile
- No accounts/auth — single-device prototype only
- OCR/reasoning currently runs via cloud API (Gemini), not on-device —
  on-device processing is roadmap for the live 30-hour build