# D47 Derived Utility Types Implementation Plan

**Goal:** Derive task DTOs and list types from the `Task` model using TypeScript utility types.

**Architecture:** Refactor `TaskInput` to alias an `Omit`-derived creation DTO, add update/list/index/field/return types, and demonstrate them in a compile-checked example. Add the D47 lesson to the board.

**Tech Stack:** TypeScript 7, pnpm, the existing strict `tsconfig.json`.

**Spec:** `notes/W3-W8-任务.md`, D47.

## Constraints and Review Focus

- Use `Partial`, `Pick`, `Omit`, `Record`, `ReturnType`, and `keyof` from the `Task` model.
- Create and update DTOs derive their fields from `Task`; `Pick` explicitly selects list display fields.
- Keep `TaskInput` compatible with the D44 `createTask` API.
- Keep the example type-safe with no `any` or unchecked casts.

## Files

- Modify `projects/task-board/search-app/src/task-model.ts`.
- Add `projects/task-board/search-app/src/d47-derived-types.ts`.
- Modify `projects/task-board/index.html` with D47 navigation and explanations.

## Steps

1. Derive the DTO, list, record, field, and return types from `Task`.
2. Demonstrate their usage in a source example and document the selection rules.
3. Run `pnpm typecheck`, inspect the diff, commit, and push.
