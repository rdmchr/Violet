import { Timestamp } from "firebase-admin/firestore";

export interface UserData {
    invite?: string | null;
    lastSeen?: Timestamp;
    xPass?: string;
    xUser?: string;
    enlightened?: boolean;
    isAdmin?: boolean;
    name?: string;
}

export interface User {
    uid: string;
    name: string;
    email: string;
    emailVerified: boolean;
    disabled: boolean;
    lastSeen: number | null;
}

export interface InviteData {
    createdAt: Timestamp;
    createdBy: string;
    expiresAt: Timestamp;
    usedAt: Timestamp | null;
    usedBy: string | null;
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