# D43 TypeScript Environment Implementation Plan

**Goal:** Set up a small TypeScript toolchain for the D42 search app and teach the key compiler options.

**Architecture:** Keep the TypeScript dependency, config, and starter file inside `projects/task-board/search-app/` so later migration work has a clear home. Add a D43 lesson section to the existing task board.

**Tech Stack:** pnpm, TypeScript, JSON `tsconfig`.

**Spec:** `notes/W3-W8-任务.md`, D43.

## Constraints and Review Focus

- Keep `strict` and `noUncheckedIndexedAccess` enabled.
- `pnpm exec tsc --noEmit` must type-check the included starter source without emitting JavaScript.
- Explain that `outDir` chooses an output folder only when emit is enabled; `noEmit` suppresses output.

## Files

- Modify `projects/task-board/search-app/package.json`; add its pnpm lockfile, `tsconfig.json`, and `src/d43-environment.ts`.
- Modify `projects/task-board/index.html` with the D43 navigation and lesson.

## Steps

1. Install TypeScript as a development dependency and add the strict config plus one starter source file.
2. Add the lesson text and commands to the task board.
3. Run `pnpm exec tsc --noEmit`, inspect the diff, then commit and push.
