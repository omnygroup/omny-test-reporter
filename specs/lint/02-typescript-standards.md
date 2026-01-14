# TypeScript Standards for AI Code Generation

**Last Updated:** January 12, 2026
**Configuration:** `tsconfig.json` strict mode + `@typescript-eslint` rules
**Policy:** 100% strict, no compromises

---

## Overview

All TypeScript code must be written in **strict mode** with full type safety. The project enforces a highly restrictive TypeScript configuration to ensure code reliability, maintainability, and early bug detection.

---

## TypeScript Compiler Options Checklist

All options below are ENABLED and REQUIRED:

### Core Type Checking

- ☐ `strict: true` — Master flag enabling all strict type checking options
- ☐ `noImplicitAny: true` — Never infer `any`
- ☐ `strictNullChecks: true` — Explicit null/undefined handling
- ☐ `strictFunctionTypes: true` — Strict checking of function parameter and return types
- ☐ `strictBindCallApply: true` — Strict checking of `bind()`, `call()`, `apply()`
- ☐ `strictPropertyInitialization: true` — Properties must be initialized or use definite assignment
- ☐ `noImplicitThis: true` — `this` must be explicitly typed
- ☐ `alwaysStrict: true` — Emit `'use strict'`

### Code Quality

- ☐ `noUnusedLocals: true` — No unused local variables
- ☐ `noUnusedParameters: true` — No unused parameters
- ☐ `noImplicitReturns: true` — All code paths must return for non-void functions
- ☐ `noFallthroughCasesInSwitch: true` — No fallthrough in `switch`
- ☐ `noUncheckedIndexedAccess: true` — Index access returns `T | undefined` when applicable
- ☐ `noImplicitOverride: true` — Use `override` for overridden methods
- ☐ `noPropertyAccessFromIndexSignature: true` — Restrict property access from index signatures

### Module Resolution

- ☐ `module: ESNext` — Output ES modules (ESM)
- ☐ `target: ES2022` — Compile target
- ☐ `moduleResolution: bundler` — Bundler-style resolution
- ☐ `esModuleInterop: true` — Allow default imports from CommonJS
- ☐ `isolatedModules: true` — Safe for independent-file compilation
- ☐ `declaration: true` — Generate declaration files
- ☐ `declarationMap: true` — Generate declaration maps
- ☐ `sourceMap: true` — Generate source maps

### Path Aliases

- ☐ Configure path aliases in tsconfig.json to map common import paths
- ☐ Use path aliases instead of deep relative imports

---

## @typescript-eslint Rules Checklist

### Strict Type-Checked Rules (ERROR)

- ☐ `@typescript-eslint/no-explicit-any` — `any` is absolutely forbidden everywhere
- ☐ `@typescript-eslint/no-floating-promises` — All Promises must be `await`ed or `.catch()`ed
- ☐ `@typescript-eslint/no-misused-promises` — Prevent incorrect Promise usage in conditionals
- ☐ `@typescript-eslint/no-unnecessary-type-assertion` — Prohibit unnecessary `as` assertions
- ☐ `@typescript-eslint/no-unsafe-argument` — Disallow passing `any`-typed values
- ☐ `@typescript-eslint/no-unsafe-assignment` — Disallow assigning `any` to typed variables
- ☐ `@typescript-eslint/no-unsafe-call` — Disallow calling values typed as `any`
- ☐ `@typescript-eslint/no-unsafe-member-access` — Disallow member access on `any`
- ☐ `@typescript-eslint/no-unsafe-return` — Disallow returning `any`
- ☐ `@typescript-eslint/restrict-plus-operands` — Restrict addition to compatible types
- ☐ `@typescript-eslint/restrict-template-expressions` — Restrict template expressions to primitives or safe values
- ☐ `@typescript-eslint/unbound-method` — Disallow unbound method calls without explicit binding
- ☐ `@typescript-eslint/await-thenable` — Await only actual awaitables
- ☐ `@typescript-eslint/no-unnecessary-boolean-literal-compare` — Simplify boolean comparisons
- ☐ `@typescript-eslint/prefer-nullish-coalescing` — Prefer `??` over `||` for nullish coalescing
- ☐ `@typescript-eslint/prefer-optional-chain` — Prefer optional chaining `?.`
- ☐ `@typescript-eslint/switch-exhaustiveness-check` — Enforce exhaustiveness for unions/enums

### Stylistic Type-Checked Rules (ERROR)

- ☐ `@typescript-eslint/consistent-type-imports` — Use `import type {}` for type-only imports
- ☐ `@typescript-eslint/naming-convention` — Enforce naming conventions across symbols
- ☐ `@typescript-eslint/explicit-function-return-type` — All functions must have explicit return types
- ☐ `@typescript-eslint/explicit-member-accessibility` — All class members must have visibility modifiers
- ☐ `@typescript-eslint/explicit-module-boundary-types` — Exported functions must have explicit return types
- ☐ `@typescript-eslint/no-use-before-define` — Disallow use before definition
- ☐ `@typescript-eslint/no-unused-vars` — No unused variables

---

## Naming Conventions Checklist

- ☐ Interfaces: PascalCase; do not use `I` prefix
- ☐ Type aliases: PascalCase
- ☐ Classes: PascalCase
- ☐ Enums: PascalCase for names; values: UPPER_SNAKE_CASE or lowercase according to pattern
- ☐ Variables/constants: camelCase or UPPER_SNAKE_CASE for true constants
- ☐ Functions: camelCase
- ☐ Methods: camelCase
- ☐ Properties: camelCase or UPPER_SNAKE_CASE for constants
- ☐ Unused identifiers must not appear; remove unused identifiers

---

## Type Safety Practices Checklist

### `any` Policy

- ☐ `any` is strictly prohibited everywhere in the codebase. No inline exceptions, comments, or suppressions that allow `any` are permitted.

### Type Assertions (`as`) Policy

- ☐ `as` type assertions are strictly prohibited everywhere in the codebase.

### `unknown` and Type Guards

- ☐ Treat `unknown` as untrusted; always narrow with type guards before use
- ☐ Use `typeof`, `instanceof`, or user-defined type guards to narrow `unknown`

### Error Handling Must Be Typed

- ☐ Catch clauses must type the error as `unknown` and narrow before use
- ☐ Prefer returning typed error/result objects instead of throwing for predictable flows
- ☐ Custom error classes should extend a common base error class and include readonly contextual properties

### Immutability and Readonly

- ☐ Use `readonly` for properties intended to be immutable
- ☐ Use `readonly` arrays and `Readonly<T>` for immutable structures

### Discriminated Unions and Modeling

- ☐ Prefer discriminated unions over multiple booleans for state
- ☐ Use `Record<K, V>` for maps with string/number keys
- ☐ Use `Map<K, V>` for complex-key maps

### Modern TypeScript Features

- ☐ Use `satisfies` operator to validate type without widening: `const config = {...} satisfies Config`
- ☐ Use private class fields with `#` prefix for true privacy: `#privateField`
- ☐ Use `structuredClone()` for deep cloning objects instead of JSON.parse/stringify
- ☐ Prefer modern array methods: `.at()` for index access, `.findLast()`, `.findLastIndex()`, `.toReversed()`, `.toSorted()`, `.toSpliced()` for immutable operations

### Generics and Explicit Types

- ☐ Use generics with constraints (e.g., `<T extends Base>`) for reusable functions
- ☐ Public and exported functions must have explicit return types
- ☐ Avoid `any` by designing precise generic constraints

---

## Import/Export Type Patterns Checklist

- ☐ Type imports: `import type { MyType } from './file.js'`
- ☐ Value imports: `import { MyClass } from './file.js'`
- ☐ Keep type imports separate and ordered after value imports when mixing is necessary
- ☐ Barrel exports: organize and group exports logically (enums → types → errors → classes)
- ☐ Prefer path aliases over deep relative paths

---

## Error Types and Handling Checklist

- ☐ Catch clause: `catch (error: unknown)` — always type as `unknown`
- ☐ Narrow `unknown` errors with guards before accessing properties
- ☐ Prefer typed result objects over throwing for validation flows
- ☐ Custom errors should extend a common base error class and include readonly contextual properties
- ☐ Use `AbortController` and `AbortSignal` for cancellable async operations

---

## Advanced Type Patterns Checklist

- ☐ Use conditional types only when necessary; keep them readable
- ☐ Prefer utility types (`Partial`, `Required`, `Readonly`, `Pick`, `Omit`, `Record`, `Exclude`, `Extract`) over custom ad-hoc types when applicable
- ☐ Use `infer` sparingly for advanced extraction patterns
- ☐ Constrain generics where appropriate to keep types narrow and safe

---

## Pre-Push Checklist

- ☐ Type check command passes (no TypeScript errors)
- ☐ No `// @ts-ignore` or `// @ts-expect-error` present anywhere
- ☐ All exported/public functions have explicit return types
- ☐ All parameters are typed (no implicit `any`)
- ☐ Error handling is type-safe (`catch (error: unknown)` and narrowed)
- ☐ Naming follows conventions
- ☐ Path aliases used instead of relative imports where applicable

---
