# D45 Generic Group By Implementation Plan

**Goal:** Implement a reusable, type-safe `groupBy` and demonstrate inference and key constraints with the D44 task model.

**Architecture:** Add a generic helper to the search app's TypeScript source and a compile-checked usage example. Add a D45 lesson section to the task board.

**Tech Stack:** TypeScript 7, pnpm, the existing strict `tsconfig.json`.

**Spec:** `notes/W3-W8-任务.md`, D45.

## Constraints and Review Focus

- Match `groupBy<T, K extends keyof T>(items: T[], key: K): Record<string, T[]>`.
- Infer `T` and `K` at the task call site without explicit generic arguments.
- Reject an unknown task key; keep its example under `@ts-expect-error` so typecheck remains green.
- Group labels are stringified because the result uses string record keys.

## Files

- Add `projects/task-board/search-app/src/group-by.ts` and `src/d45-group-by-example.ts`.
- Modify `projects/task-board/index.html` with the D45 navigation and lesson.

## Steps

1. Implement the generic helper and an inferred task grouping example.
2. Add explanations for `T`, the `keyof` constraint, and `any` to the task board.
3. Run `pnpm typecheck`, inspect the diff, commit, and push.
