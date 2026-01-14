/**
 * Reporting config validation schema
 * @module domain/validation/schemas/reportingConfig.schema
 */

import { z } from 'zod';

/**
 * Schema for reporting configuration
 */
export const ReportingConfigSchema = z.object({
  eslint: z
    .object({
      enabled: z.boolean().default(true),
      patterns: z.array(z.string()).optional(),
      configPath: z.string().optional(),
    })
    .optional(),

  typescript: z
    .object({
      enabled: z.boolean().default(true),
      projectPath: z.string().optional(),
      configPath: z.string().optional(),
    })
    .optional(),

  vitest: z
    .object({
      enabled: z.boolean().default(true),
      configPath: z.string().optional(),
    })
    .optional(),

  output: z
    .object({
      format: z.enum(['json', 'pretty', 'table']).default('pretty'),
      path: z.string().optional(),
      overwrite: z.boolean().default(false),
    })
    .optional(),

  rootPath: z
    .string()
    .default(process.cwd())
    .describe('Root directory for collection'),
});

export type ReportingConfig = z.infer<typeof ReportingConfigSchema>;
