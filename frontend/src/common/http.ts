import type { z } from 'zod'

import { logger } from './logger.ts'

export class ApiError extends Error {
  override readonly name = 'ApiError'
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`API ${status} on ${path}`)
  }
}

export class ApiContractError extends Error {
  override readonly name = 'ApiContractError'
  constructor(
    readonly path: string,
    readonly issues: z.core.$ZodIssue[],
  ) {
    super(`API response for ${path} does not match the contract`)
  }
}

export function isNotFound(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404
}

// SSR loaders run on the server and need an absolute URL; the browser uses the page origin.
function apiBase(): string {
  if (import.meta.env.SSR) return process.env['API_ORIGIN'] ?? `http://localhost:${process.env['PORT'] ?? 3000}`
  return ''
}

export async function apiGet<Schema extends z.ZodType>(
  path: string,
  schema: Schema,
  init?: RequestInit,
): Promise<z.output<Schema>> {
  const response = await fetch(`${apiBase()}/api${path}`, {
    ...init,
    headers: { accept: 'application/json', ...init?.headers },
  })
  if (!response.ok) throw new ApiError(response.status, path)
  return parseContract(path, schema, await response.json())
}

export async function apiSend<Schema extends z.ZodType>(
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  path: string,
  body: unknown,
  schema: Schema,
): Promise<z.output<Schema>> {
  const response = await fetch(`${apiBase()}/api${path}`, {
    method,
    headers: { accept: 'application/json', 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new ApiError(response.status, path)
  return parseContract(path, schema, await response.json())
}

// ADR 0003: strict parse everywhere; a drifted contract must surface, not render wrong conditions.
function parseContract<Schema extends z.ZodType>(path: string, schema: Schema, data: unknown): z.output<Schema> {
  const result = schema.safeParse(data)
  if (result.success) return result.data
  logger.error('ApiContractError', { path, issues: result.error.issues })
  throw new ApiContractError(path, result.error.issues)
}
