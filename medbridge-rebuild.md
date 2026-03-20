# MedBridgeAI Rebuild Plan

## Overview
Rebuilding the MedBridgeAI application architecture to strictly fulfill the 6 Hackathon Evaluation Criteria (Code Quality, Security, Efficiency, Testing, Accessibility, Google Services). We will apply the `.agent` Antigravity Kit principles (Clean Code, Frontend Specialist, Security Auditor).

## Project Type
WEB (React 19 / Vite / Node.js Backend)

## Success Criteria
- **Code Quality**: `App.tsx` is broken down into small, focused, maintainable components.
- **Security**: Node.js backend uses strong validation and headers (via `helmet`). No sensitive PHI logging.
- **Efficiency**: Proper React memoization and lazy loading where applicable.
- **Testing**: Excellent component separation allows for isolated testing.
- **Accessibility**: 100% WCAG AA compliance (keyboard nav, ARIA labels).
- **Google Services**: Seamless and deterministic Gemini API interactions with Search Grounding.

## File Structure
```
medbridge-ai/
├── src/
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── TriageReportCard.tsx
│   │   ├── ChaosTerminal.tsx
│   │   └── SystemFailure.tsx
│   ├── services/
│   │   └── geminiService.ts
│   ├── types/
│   │   └── index.ts
│   └── App.tsx
├── server/
│   └── index.js
```

## Task Breakdown
1. **Task 1: Component Refactor (`frontend-specialist`)**
   - *Input:* Monolithic `App.tsx` (450 lines)
   - *Output:* Modular React components (`src/components/*`)
   - *Verify:* Run `npm run lint` and `npm run build` cleanly.
2. **Task 2: Backend Hardening (`security-auditor` & `backend-specialist`)**
   - *Input:* `server.js` missing security headers
   - *Output:* Advanced backend with `helmet` for HTTP headers and HIPAA-aware data processing (clean logging).
   - *Verify:* Server boot without errors.
3. **Task 3: Hackathon Criteria Review (`orchestrator`)**
   - *Input:* Modularized frontend and hardened backend.
   - *Output:* Final project matches 100% of Hackathon evaluation metrics.
   - *Verify:* `npm run test` passes, zero TypeScript errors.

## Phase X: Verification
- [x] Code Quality: `npm run lint` && `npx tsc --noEmit`
- [x] Security: Server uses strict policies (`helmet`, `express-rate-limit`).
- [x] Accessibility: Keyboard navigation fully intact post-refactor.
- [x] Tests: `npm run test` passes with modular structure.
