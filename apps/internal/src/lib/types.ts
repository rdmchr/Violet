import type { Timestamp } from "firebase/firestore";

export interface User {
    uid: string;
    name: string;
    email: string;
    emailVerified: boolean;
    disabled: boolean;
    lastSeen: number | null;
}

export interface Invite {
    id: string;
    createdAt: number;
    expiresAt: number;
    usedAt: number | null;
    usedById: string | null;
    createdById: string;
    createdByEmail: string;
    usedByEmail: string | null;
}