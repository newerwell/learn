# D46 Type Narrowing Implementation Plan

**Goal:** Safely handle unknown API responses and teach narrowing with guards and exhaustive unions.

**Architecture:** Add reusable string/object guards, an unknown response parser, and a `never` exhaustive switch example under the search app's TypeScript source. Add the D46 lesson to the task board.

**Tech Stack:** TypeScript 7, pnpm, the existing strict `tsconfig.json`.

**Spec:** `notes/W3-W8-任务.md`, D46.

## Constraints and Review Focus

- Implement `isString(value: unknown): value is string`.
- Accept API data only after checking whether it is a string or a valid message object.
- Keep the deliberately invalid unknown operation under `@ts-expect-error` so the overall typecheck passes while asserting the compiler rejects it.
- Use a `never` helper as the default arm of an exhaustive discriminated-union switch.

## Files

- Add `projects/task-board/search-app/src/d46-narrowing.ts` and `src/d46-type-check.ts`.
- Modify `projects/task-board/index.html` with the D46 navigation and explanation.

## Steps

1. Implement the custom guards, API response handling, and exhaustive union example.
2. Add the lesson explaining `any`, `unknown`, and `never`.
3. Run `pnpm typecheck`, inspect the diff, commit, and push.
