export interface PaginatedPayload<T> {
  paginated: true;
  items: T[];
  page: number;
  limit: number;
  total: number;
}

export function paginated<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
): PaginatedPayload<T> {
  return { paginated: true, items, page, limit, total };
}

export function isPaginatedPayload(value: unknown): value is PaginatedPayload<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    'paginated' in value &&
    (value as PaginatedPayload<unknown>).paginated === true
  );
}
