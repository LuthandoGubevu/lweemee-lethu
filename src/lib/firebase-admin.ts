import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

if (!getApps().length) {
    const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
        // The private key must be formatted with escaped newlines.
        privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }

    try {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        });
        console.log("Firebase Admin SDK initialized.");
    } catch (error: any) {
        console.error("Firebase Admin SDK initialization error:", error.message);
    }
}

const db = admin.firestore();
const auth = admin.auth();

export { db, auth, admin };
