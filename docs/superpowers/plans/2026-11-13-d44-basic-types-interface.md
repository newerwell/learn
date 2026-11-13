# D44 Basic Types and Interface Implementation Plan

**Goal:** Define the task model and demonstrate how TypeScript checks inputs to `createTask`.

**Architecture:** Add reusable `Task` and `TaskInput` interfaces plus a typed creator under the existing search app's `src/` directory. Add a compile-checked invalid-call example and a D44 lesson section to the task board.

**Tech Stack:** TypeScript 7, pnpm, the existing strict `tsconfig.json`.

**Spec:** `notes/W3-W8-任务.md`, D44.

## Constraints and Review Focus

- `Task` has `id`, `title`, `done`, optional `dueAt`, and `tags: string[]`.
- `createTask(input: TaskInput): Task` generates `id` and defaults `done` to `false`.
- The invalid `title` example must be rejected by the compiler and stay marked with `@ts-expect-error` so the overall typecheck passes.
- Explain optional-property reads and `interface`/`type` use accurately.

## Files

- Add `projects/task-board/search-app/src/task-model.ts` and `src/d44-type-check.ts`.
- Modify `projects/task-board/index.html` with the D44 lesson and navigation link.

## Steps

1. Implement the task model and a valid/invalid typed call example.
2. Add the lesson explanations and source link to the board.
3. Run `pnpm typecheck`, inspect the diff, commit, and push.
