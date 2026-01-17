/**
 * Integration tests for GenerateReport use case
 * @module tests/integration/usecases/GenerateReport
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

import { GenerateReportUseCase } from '../../../src/application/usecases';
import { createTestConfig } from '../../helpers/index.js';
import { MockDiagnosticSource, MockDirectoryService, createTestDiagnostics } from '../../mocks';

import type { CollectionConfig } from '../../../src/core/types/index.js';

describe('GenerateReportUseCase', () => {
  let useCase: GenerateReportUseCase;
  let mockSource: MockDiagnosticSource;
  let mockDirectoryService: MockDirectoryService;

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createMockEnricher = () => ({
    enrichAll: vi.fn().mockResolvedValue({ isOk: () => true, value: new Map() }),
  });

  // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
  const createMockWriter = () => ({
    write: vi.fn().mockResolvedValue({
      isOk: () => true,
      value: {
        filesWritten: 0,
        bytesWritten: 0,
        duration: 0,
        timestamp: new Date(),
      },
    }),
  });

  beforeEach(() => {
    mockSource = new MockDiagnosticSource('eslint');
    mockDirectoryService = new MockDirectoryService();

    const enricher = createMockEnricher();
    const writer = createMockWriter();

    // Type cast is necessary for mocking third-party dependencies
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
    useCase = new GenerateReportUseCase(
      [mockSource],
      enricher as any,
      writer as any,
      mockDirectoryService
    );
  });

  describe('execute', () => {
    it('should clear all errors before collection', async () => {
      const diagnostics = createTestDiagnostics(1, 'eslint');
      mockSource.setDiagnostics(diagnostics);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      expect(mockDirectoryService.wasClearedAll()).toBe(true);
    });

    it('should collect diagnostics from sources', async () => {
      const diagnostics = createTestDiagnostics(3, 'eslint');
      mockSource.setDiagnostics(diagnostics);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
      expect(mockSource.getCallCount()).toBe(1);
    });

    it('should handle empty diagnostics', async () => {
      mockSource.setDiagnostics([]);

      const config = createTestConfig();
      const result = await useCase.execute(config);

      expect(result.isOk()).toBe(true);
    });

    it('should pass config to sources', async () => {
      mockSource.setDiagnostics(createTestDiagnostics(1, 'eslint'));

      const config: CollectionConfig = {
        patterns: ['custom/**/*.ts'],
        rootPath: process.cwd(),
        concurrency: 2,
        timeout: 5000,
        cache: true,
        ignorePatterns: ['node_modules'],
        eslint: true,
        typescript: false,
        configPath: undefined,
      };

      await useCase.execute(config);

      expect(mockSource.getCallCount()).toBe(1);
    });

    it('should clear errors even if sources fail', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      mockSource.setError(new Error('Collection failed'));

      const config = createTestConfig();
      await useCase.execute(config);

      // Should still have cleared errors
      expect(mockDirectoryService.wasClearedAll()).toBe(true);
    });
  });
});
