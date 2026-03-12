// src/types/correspondence.d.ts

export type CorrespondenceStatus = 'submitted' | 'process' | 'resolved' | 'rejected';

export interface Category {
    id_category: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Recipient {
    id_recipient: number;
    name: string;
    slug: string;
    description?: string;
}

export interface Correspondence {
    id: number;
    user_id: number;
    id_category: number;
    id_recipient: number;
    title: string;
    correspondence_body: string;
    status: CorrespondenceStatus;
    attachment_url?: string;
    response_text?: string;
    responded_at?: string;
    created_at: string;
    updated_at: string;
    // Relasi (biasanya backend mengirim object nested)
    category?: Category;
    recipient?: Recipient;
    user?: { name: string; email: string; nim?: string; nip?: string };

    // Flat sender fields — beberapa endpoint mengembalikan langsung di root
    sender_name?:  string;
    sender_email?: string;
    sender_nim?:   string;
    sender_nip?:   string;
    user_name?:    string;   // alias umum
    user_email?:   string;   // alias umum
}

export interface CorrespondencePayload {
    id_category: number;
    id_recipient: number;
    title: string;
    correspondence_body: string;
    attachment?: File;
}