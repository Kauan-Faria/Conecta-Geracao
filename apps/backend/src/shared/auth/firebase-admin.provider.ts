import * as admin from 'firebase-admin';

export const FIREBASE_ADMIN = Symbol('FIREBASE_ADMIN');

export const firebaseAdminProvider = {
  provide: FIREBASE_ADMIN,
  useFactory: (): admin.app.App => {
    if (admin.apps.length > 0) {
      return admin.app();
    }

    const projectId = process.env.FIREBASE_PROJECT_ID ?? 'conecta-geracao';

    return admin.initializeApp({
      projectId,
      credential: admin.credential.applicationDefault(),
    });
  },
};
