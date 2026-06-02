export interface AuthenticatedUser {
    uid: string;
}
export declare const CurrentUser: (...dataOrPipes: unknown[]) => ParameterDecorator;
