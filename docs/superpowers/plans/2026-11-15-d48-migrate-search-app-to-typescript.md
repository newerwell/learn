# D48 Migrate Search App to TypeScript

**Goal:** Move the D42 GitHub repository search app to strict TypeScript without explicit `any`, while keeping its static page runnable.

**Architecture:** Keep `src/app.ts` as the sole runtime source, type all DOM and API boundaries with `unknown` plus guards, and compile it to the static `public/app.js` loaded by the page. The base `tsconfig.json` continues to type-check all lesson sources without emitting files.

**Tech Stack:** TypeScript 7, pnpm, browser DOM APIs.

**Spec:** `notes/W3-W8-任务.md`, D48.

## Constraints and Review Focus

- Work on the `ts` branch.
- `pnpm typecheck` must pass with `strict` and `noUncheckedIndexedAccess` enabled.
- `src` must contain no `any` text.
- Build output must keep `projects/task-board/search-app/index.html` loading the static `public/app.js`.
- Keep `public/app.js` generated from `src/app.ts` so the source and deployed behavior match.

## Files

- Add `projects/task-board/search-app/src/app.ts` and `tsconfig.app.json`.
- Regenerate `projects/task-board/search-app/public/app.js` and update its build script.
- Add a D48 note in `projects/task-board/index.html`.

## Steps

1. Port DOM, localStorage, request, response, and error handling into strict TypeScript.
2. Configure a separate emit build for `app.js`; keep normal typecheck non-emitting.
3. Run typecheck, build, no-`any` scan, and diff checks; commit and push the `ts` branch.
