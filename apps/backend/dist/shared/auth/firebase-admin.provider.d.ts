import * as admin from 'firebase-admin';
export declare const FIREBASE_ADMIN: unique symbol;
export declare const firebaseAdminProvider: {
    provide: symbol;
    useFactory: () => admin.app.App;
};
