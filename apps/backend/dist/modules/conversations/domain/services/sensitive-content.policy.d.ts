export declare class SensitiveContentPolicy {
    containsSensitiveInput(text: string): boolean;
    containsUnsafeOutput(text: string): boolean;
    refusalMessage(): string;
    sanitizeForLog(text: string): string;
}
