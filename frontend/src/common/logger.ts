export type LogContext = Record<string, unknown>

export interface LogTransport {
  error(message: string, context?: LogContext): void
  warn(message: string, context?: LogContext): void
}

let transport: LogTransport = {
  error: (message, context) => console.error(message, context),
  warn: (message, context) => console.warn(message, context),
}

// The app layer swaps the transport (e.g. for Sentry) without touching callers.
export function setLogTransport(next: LogTransport): void {
  transport = next
}

export const logger: LogTransport = {
  error: (message, context) => transport.error(message, context),
  warn: (message, context) => transport.warn(message, context),
}
