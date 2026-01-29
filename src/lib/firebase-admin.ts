import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let db: admin.firestore.Firestore | null = null;
let auth: admin.auth.Auth | null = null;

if (getApps().length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

    if (projectId && clientEmail && privateKey) {
        try {
            admin.initializeApp({
                credential: admin.credential.cert({
                    project_id: projectId,
                    client_email: clientEmail,
                    private_key: privateKey.replace(/\\n/g, '\n'),
                }),
            });
            console.log("Firebase Admin SDK initialized.");
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
        }
    } else {
        if (process.env.NODE_ENV === 'production') {
            const missing = [
                !projectId && "FIREBASE_PROJECT_ID",
                !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
                !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY"
            ].filter(Boolean).join(", ");
            console.warn(`Firebase Admin environment variables are not fully set. Missing: [${missing}]. Admin SDK not initialized.`);
        }
    }
}

if (admin.apps.length > 0) {
    try {
        db = admin.firestore();
        auth = admin.auth();
    } catch (e: any) {
        console.error("Failed to get Firestore or Auth instance from initialized app.", e);
    }
}

export { db, auth, admin };
