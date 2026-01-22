/**
 * Diagnostic Grouper
 * Groups diagnostics for structured reporting
 * @module application/DiagnosticGrouper
 */

import type { Diagnostic, IntegrationName } from '@core';

/**
 * Groups diagnostics by source and file for structured reporting
 */
export function groupBySourceAndFile(
  diagnostics: readonly Diagnostic[]
): Map<IntegrationName, Map<string, Diagnostic[]>> {
  const grouped = new Map<IntegrationName, Map<string, Diagnostic[]>>();

  for (const diagnostic of diagnostics) {
    addDiagnosticToGroup(grouped, diagnostic);
  }

  return grouped;
}

function addDiagnosticToGroup(
  grouped: Map<IntegrationName, Map<string, Diagnostic[]>>,
  diagnostic: Diagnostic
): void {
  const fileMap = getOrCreateFileMap(grouped, diagnostic.source);
  const diagnosticList = getOrCreateDiagnosticList(fileMap, diagnostic.filePath);

  diagnosticList.push(diagnostic);
}

function getOrCreateFileMap(
  grouped: Map<IntegrationName, Map<string, Diagnostic[]>>,
  source: IntegrationName
): Map<string, Diagnostic[]> {
  let fileMap = grouped.get(source);

  if (fileMap === undefined) {
    fileMap = new Map<string, Diagnostic[]>();
    grouped.set(source, fileMap);
  }

  return fileMap;
}

function getOrCreateDiagnosticList(
  fileMap: Map<string, Diagnostic[]>,
  filePath: string
): Diagnostic[] {
  let diagnosticList = fileMap.get(filePath);

  if (diagnosticList === undefined) {
    diagnosticList = [];
    fileMap.set(filePath, diagnosticList);
  }

  return diagnosticList;
}
