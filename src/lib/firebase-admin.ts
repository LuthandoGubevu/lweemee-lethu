import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (getApps().length === 0) {
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_ADMIN_CLIENT_EMAIL && process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
        const serviceAccount = {
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }
        try {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
            });
            console.log("Firebase Admin SDK initialized.");
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
        }
    } else {
        if (process.env.NODE_ENV === 'production') {
            console.warn('Firebase Admin environment variables are not fully set. Admin SDK not initialized.');
        }
    }
}

if (admin.apps.length > 0) {
    db = admin.firestore();
    auth = admin.auth();
}

export { db, auth, admin };
