import { db } from "@/src/firebase"; // adjust if your db export is elsewhere
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

type CreateWorkspaceInput = {
  name: string;
  industry?: string;
  ownerId: string; // auth.uid
};

export async function createWorkspace({ name, industry, ownerId }: CreateWorkspaceInput) {
  const workspacesRef = collection(db, "workspaces");
  const workspaceDocRef = doc(workspacesRef); // auto-id

  const memberDocRef = doc(db, "workspaces", workspaceDocRef.id, "members", ownerId);
  const userWorkspaceRef = doc(db, "users", ownerId, "workspaces", workspaceDocRef.id);

  const batch = writeBatch(db);

  // 1) workspace doc
  batch.set(workspaceDocRef, {
    name: name.trim(),
    industry: industry?.trim() || null,
    ownerId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 2) members/{uid} doc (THIS IS WHAT YOUR RULES DEPEND ON)
  batch.set(memberDocRef, {
    userId: ownerId,
    role: "admin", // creator should be admin
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // 3) user workspace lookup (if your UI lists workspaces under users/{uid}/workspaces)
  batch.set(userWorkspaceRef, {
    workspaceId: workspaceDocRef.id,
    role: "admin",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  // Optional: bootstrap billing/config to avoid "missing doc" UX issues later
  const billingConfigRef = doc(db, "workspaces", workspaceDocRef.id, "billing", "config");
  batch.set(billingConfigRef, {
    plan: "free",
    status: "trial",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await batch.commit();

  return workspaceDocRef.id;
}
