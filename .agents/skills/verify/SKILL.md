---
name: verify
description: Verify frontend changes in the running Promocode Checker before committing. Compare baseline/head screenshots and element geometry, exercise changed flows, and account for every visual difference; use after UI code changes and before claiming completion.
---

# Verify — Promocode Checker

## What counts as proof

A working interaction is not proof that the screen is correct. Storybook isolates a component; it cannot prove its integration in a page. Screenshots without comparison are not a visual review. Use all three: behavior, before/after geometry+pixels, and the design reference.

1. Read `frontend/AGENTS.md`, `frontend/docs/VERIFY.md`, the relevant component's stories and the actual Figma reference. Reuse the existing Storybook/Vitest/Playwright tools. Never introduce a second browser framework.
2. **Before editing:** list intended visual changes and capture the affected state plus neighboring controls in a real browser. Match viewport (390×844 and 1440×900), theme, data and font readiness.
3. Implement using existing UI-kit components and Figma tokens. A baseline may already be wrong: matching it is not design approval.
4. Run the smallest relevant unit/story checks, `pnpm lint:tokens`, then `pnpm verify:ui` from `frontend/`. It launches baseline `HEAD` and current app with mocks, produces `.verify/report.md`, JSON, full-page base/head/diff images and enlarged before/after crops. `--only merchant` is diagnostic, never sufficient for a commit. Before PR use `--base origin/main` as well if the branch includes multiple UI commits.
5. Read the **text findings**, then open the before/after crops and the relevant full-page frames. Account for each added/removed icon/control, changed size, alignment, typography, clipping, colors and spacing. Also inspect neighboring controls. An icon-only button must retain its intended dimensions and centered icon. Never dismiss an unexplained diff as “cosmetic”.
6. Use real input to exercise the changed flow in a real browser: click, keyboard/focus, loading/error/success, narrow viewport and dark theme where relevant. Inspect fresh frames and console/network errors. The automated scenario matrix is smoke coverage, not all user behavior. Add a scenario for a new screen or significant interactive state to `frontend/scripts/verify/scenarios.ts`.
7. Fix unexpected differences. Re-run after fixes. Accept an intended diff only when the task explicitly requires it: `pnpm verify:ui accept 'ID=precise reason from BR-task'`, each ID separately. No `all`, acceptance loops or rubber-stamping. Include IDs/reasons in the delivery. Rules/scenarios and acceptance are review-sensitive: do not weaken checks to pass your change.
8. If still failing after three targeted correction rounds, stop and escalate with exact steps, before/head/diff paths, measured dimensions and unresolved findings. A stronger review can help interpret the evidence but is not a substitute for it; do not call paid models without the required approval.
9. Install the repo gate with the documented hooks installer (`pnpm verify:install`). A fresh verification stamp must match the staged source **and verification tooling**. Stage exactly the tested state; later edits require another run. Never manufacture/edit `.verify/stamp.json`, disable the hook, change baselines or suppress failures to get a commit through.

## Delivery

State backend and scenarios actually exercised, test commands/results, visual differences intended vs fixed, evidence paths and limits. Do not claim Figma parity or untested browser coverage. For repeated misses add a focused regression check, not a longer generic checklist.
