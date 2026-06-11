export declare const ACTIVE_USER_QUERY: unique symbol;
export interface ActiveUserQuery {
    findAllWithActiveTokensAndPreference(): Promise<string[]>;
}
