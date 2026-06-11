export const ACTIVE_USER_QUERY = Symbol('ACTIVE_USER_QUERY');

export interface ActiveUserQuery {
  findAllWithActiveTokensAndPreference(): Promise<string[]>;
}
