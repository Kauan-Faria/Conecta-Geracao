import { CanActivate, ExecutionContext } from '@nestjs/common';
export declare class InternalServiceKeyGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean;
}
