/**
 * Utility for creating nominal (branded) types on top of primitives.
 * Prevents mixing IDs that share the same base type.
 */
export type Brand<T, K extends string> = T & { __brand: K };

/**
 * Generic shape for paginated API responses.
 */
export interface PaginatedResponse<T> {
  total: number;
  items: T[];
}
