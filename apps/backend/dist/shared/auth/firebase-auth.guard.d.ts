import { CanActivate, ExecutionContext } from '@nestjs/common';
import type { App } from 'firebase-admin/app';
export declare class FirebaseAuthGuard implements CanActivate {
    private readonly firebaseApp;
    constructor(firebaseApp: App);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
