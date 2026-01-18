/**
 * Diagnostics aggregator
 * Combines diagnostics from multiple sources
 * @module domain/analytics/diagnostics/DiagnosticAggregator
 */

import type { Diagnostic, DiagnosticSource } from '@core';

export interface SeverityCount {
  readonly error: number;
  readonly warning: number;
  readonly info: number;
  readonly note: number;
}

export interface GroupedBySources {
  readonly eslint: readonly Diagnostic[];
  readonly typescript: readonly Diagnostic[];
  readonly vitest: readonly Diagnostic[];
}

/**
 * Aggregates diagnostics from multiple sources
 */
const aggregate = (sources: readonly (readonly Diagnostic[])[]): readonly Diagnostic[] => {
  const results: Diagnostic[] = [];

  for (const source of sources) {
    results.push(...source);
  }

  // TODO: для чего Object.freeze? Нужно ли это здесь? Либо дать объяснение в комментарии, либо убрать.
  return Object.freeze(results);
};

// TODO: Повторяется логика StatisticsCalculator.calculateDiagnosticStats? Убрать дублирование кода
// TODO: Сделать тип Severity токеном или enum'ом, это должно быть Core DDD
const countBySeverity = (diagnostics: readonly Diagnostic[]): SeverityCount => {
  let error = 0;
  let warning = 0;
  let info = 0;
  let note = 0;

  for (const diagnostic of diagnostics) {
    if (diagnostic.severity === 'error') {
      error++;
    } else if (diagnostic.severity === 'warning') {
      warning++;
    } else if (diagnostic.severity === 'info') {
      info++;
    } else {
      note++;
    }
  }

  return {
    error,
    warning,
    info,
    note,
  };
};

const groupBySource = (diagnostics: readonly Diagnostic[]): GroupedBySources => {
  const eslint: Diagnostic[] = [];
  const typescript: Diagnostic[] = [];
  const vitest: Diagnostic[] = [];

  // TODO: зачем Object.freeze? Нужно ли это здесь? Либо дать объяснение в комментарии, либо убрать.
  // Сделать название инструментов токенами или enum'ами, это должно быть Core DDD
  for (const diagnostic of diagnostics) {
    if (diagnostic.source === 'eslint') {
      eslint.push(diagnostic);
    } else if (diagnostic.source === 'typescript') {
      typescript.push(diagnostic);
    } else {
      vitest.push(diagnostic);
    }
  }

  return {
    eslint: Object.freeze(eslint),
    typescript: Object.freeze(typescript),
    vitest: Object.freeze(vitest),
  };
};

const filterBySeverity = (
  diagnostics: readonly Diagnostic[],
  severity: string
): readonly Diagnostic[] => Object.freeze(diagnostics.filter((d) => d.severity === severity));

const filterByFile = (
  diagnostics: readonly Diagnostic[],
  filePath: string
): readonly Diagnostic[] => Object.freeze(diagnostics.filter((d) => d.filePath === filePath));

const groupByFile = (diagnostics: readonly Diagnostic[]): Map<string, readonly Diagnostic[]> => {
  const grouped = new Map<string, Diagnostic[]>();

  for (const diagnostic of diagnostics) {
    const { filePath } = diagnostic;

    let fileDiagnostics = grouped.get(filePath);
    if (fileDiagnostics === undefined) {
      fileDiagnostics = [];
      grouped.set(filePath, fileDiagnostics);
    }

    fileDiagnostics.push(diagnostic);
  }

  // Freeze inner arrays
  for (const [, diags] of grouped) {
    Object.freeze(diags);
  }

  return grouped;
};

const groupBySourceAndFile = (
  diagnostics: readonly Diagnostic[]
): Map<DiagnosticSource, Map<string, readonly Diagnostic[]>> => {
  const bySource = groupBySource(diagnostics);
  const result = new Map<DiagnosticSource, Map<string, readonly Diagnostic[]>>();

  for (const source of ['eslint', 'typescript', 'vitest'] as const) {
    const diags = bySource[source];
    const fileMap = groupByFile(diags);
    // TODO: типизировать без type assertion: https://www.allthingstypescript.dev/p/avoid-using-type-assertions-in-typescript
    // https://basarat.gitbook.io/typescript/type-system/type-assertion
    // Добавить отдельный документ про типизацию и best practices по ней
    result.set(source as DiagnosticSource, fileMap);
  }

  return result;
};

// TODO: Это должен быть класс, реализующий абстракцию с четким API
// Проверить необходимость экспорта всех методов и их использование
// Отказаться от freeze, если это не нужно
export const DiagnosticAggregator = Object.freeze({
  aggregate,
  countBySeverity,
  groupBySource,
  filterBySeverity,
  filterByFile,
  groupByFile,
  groupBySourceAndFile,
});
