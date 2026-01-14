# Code Style Guide for AI Code Generation

**Last Updated:** January 12, 2026
**Scope:** File structure, naming, functions, classes, error handling, and code organization
**Enforcement:** ESLint + code review

---

## Overview

This guide defines the coding style and structural patterns. All generated code must follow these patterns for consistency, readability, and maintainability.

---

## File Structure and Organization

- ☐ One public class or interface per file
- ☐ Utilities and helpers may be combined in dedicated utility files
- ☐ Private types and classes may coexist with public exports in the same file
- ☐ Filenames must match primary export names
- ☐ Group files by domain (activity/, analytics/, core/, etc.)
- ☐ Follow layering inside modules: interfaces → entities → services → factories
- ☐ Every folder with multiple files must include a barrel export (index.ts)
- ☐ Maximum directory depth: 4 levels
- ☐ Barrel export order: Enums → Types → Errors → Classes

---

## Imports and Exports

- ☐ Import order: builtin → external → internal → parent → sibling → type imports
- ☐ Blank line between each import group
- ☐ Alphabetical order within each import group (case-insensitive)
- ☐ Use `.js` extension for local ESM import paths
- ☐ Prefer configured path aliases over deep relative paths
- ☐ Import from barrel exports (index.js) rather than nested internals
- ☐ Prefer named exports; default exports only for config files
- ☐ Use `export type {}` for type-only exports

---

## Class Structure

- ☐ Member ordering: public static → private static → public instance → protected instance → private instance → constructor → getters/setters → public methods → protected methods → private methods
- ☐ Static members before instance members
- ☐ Public before protected before private
- ☐ Fields declared before constructor; constructor before methods
- ☐ All members must have explicit access modifiers (`public`, `protected`, `private`)
- ☐ Use `#privateField` syntax for true private fields that should not appear in compiled JS
- ☐ Use simple parameters for 1–2 constructor args; use a config object for 3+ args
- ☐ Initialize all fields in the constructor
- ☐ Use `readonly` for immutable fields
- ☐ Avoid deferred initialization

---

## Functions and Methods

- ☐ All functions must have explicit return types
- ☐ All parameters must be typed (no implicit `any`)
- ☐ If using `this`, it must be explicitly typed
- ☐ For 1–2 parameters pass directly; for 3+ use a config/options object
- ☐ No default parameters; prefer explicit config objects
- ☐ Place all validation (guard clauses) at the start of functions
- ☐ Prefer short functions (target ≤ 30 lines)
- ☐ If longer, extract helper functions to reduce cognitive load
- ☐ Use named functions for public methods; arrow functions for callbacks/listeners

---

## Variables and Constants

- ☐ Prefer `const`; use `let` only when reassignment is required
- ☐ `var` is forbidden
- ☐ Variable names: camelCase; constants: UPPER_SNAKE_CASE
- ☐ Do not leave unused identifiers in code
- ☐ Use `Object.freeze()` or `readonly` for immutable values
- ☐ Use `as const` for literal types where appropriate
- ☐ Use `satisfies` to validate types without widening
- ☐ Avoid module-level mutable state
- ☐ Use `structuredClone()` for deep cloning instead of JSON methods or lodash
- ☐ Use `AbortController` for cancellable operations (fetch, timers, async workflows)

---

## Comments and Documentation

- ☐ Provide JSDoc for all public classes and public methods
- ☐ Document parameters with `@param` and return values with `@returns`
- ☐ Document thrown errors with `@throws` for public APIs
- ☐ Use inline comments only to explain non-obvious rationale (explain WHY, not WHAT)
- ☐ Tag TODO/FIXME/NOTE comments with issue/context identifiers
- ☐ Write all comments in English with professional tone
- ☐ Remove debug comments before commit

---

## Logging

- ☐ Inject logger via constructor and store as `private readonly` member
- ☐ Log structured objects (key-value) instead of string concatenation
- ☐ Include `category` or context fields for filtering and observability
- ☐ Do not log sensitive data (passwords, tokens, PII)
- ☐ Mask or omit sensitive fields when necessary

---

## Error Handling

- ☐ Use `catch (error: unknown)` and narrow before use
- ☐ Prefer typed result objects for predictable validation flows instead of throwing
- ☐ Custom errors should extend a common base error class and include readonly contextual properties
- ☐ Validate inputs at function start and fail-fast
- ☐ In loops, catch and log per-item failures and continue when appropriate

---

## Complexity and Nesting

- ☐ Nesting depth ≤ 3 levels; extract nested logic into functions
- ☐ Import nesting (directory depth) ≤ 3 levels

---

## Pre-Push Checklist

- ☐ Format command passed
- ☐ Lint command passed
- ☐ Type check command passed
- ☐ Functions ≤ 30 lines where possible
- ☐ Logging uses structured objects and no sensitive data
- ☐ One public class per file enforced

---
