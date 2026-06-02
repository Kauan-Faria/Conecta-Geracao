import { NestMiddleware } from '@nestjs/common';
export declare const REQUEST_ID_HEADER = "x-request-id";
export interface RequestWithId {
    requestId?: string;
    headers: Record<string, string | string[] | undefined>;
}
export interface ResponseWithSetHeader {
    setHeader(name: string, value: string): void;
}
export declare class RequestIdMiddleware implements NestMiddleware {
    use(req: RequestWithId, res: ResponseWithSetHeader, next: () => void): void;
}
