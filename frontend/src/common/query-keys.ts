// Query key convention: [scope, entity, ...params]. Every module owns its scope and exports
// queryOptions factories built on it; invalidation across modules goes through those factories.
export function createQueryKeys<const Scope extends string>(scope: Scope) {
  return {
    all: [scope] as const,
    of: <const Parts extends readonly unknown[]>(...parts: Parts) => [scope, ...parts] as const,
  }
}
