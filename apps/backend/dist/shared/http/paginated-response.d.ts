export interface PaginatedPayload<T> {
    paginated: true;
    items: T[];
    page: number;
    limit: number;
    total: number;
}
export declare function paginated<T>(items: T[], page: number, limit: number, total: number): PaginatedPayload<T>;
export declare function isPaginatedPayload(value: unknown): value is PaginatedPayload<unknown>;
