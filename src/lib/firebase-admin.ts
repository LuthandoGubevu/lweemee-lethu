import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let db: admin.firestore.Firestore;
let auth: admin.auth.Auth;

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
            console.log("Firebase Admin SDK initialized successfully.");
        } catch (error: any) {
            console.error("Firebase Admin SDK initialization error:", error.message);
            // Throwing here will stop the process if initialization fails, which is better for debugging.
            throw new Error(`Firebase Admin SDK failed to initialize: ${error.message}`);
        }
    } else {
        const missing = [
            !projectId && "FIREBASE_PROJECT_ID",
            !clientEmail && "FIREBASE_ADMIN_CLIENT_EMAIL",
            !privateKey && "FIREBASE_ADMIN_PRIVATE_KEY"
        ].filter(Boolean).join(", ");

        // This will now be a critical, build-failing error if env vars are missing.
        throw new Error(`CRITICAL: Firebase Admin SDK failed to initialize. Missing env vars: [${missing}]`);
    }
}

// Initialize db and auth after the app is successfully initialized.
db = admin.firestore();
auth = admin.auth();


export { db, auth, admin };
