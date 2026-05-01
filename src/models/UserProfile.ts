import { ProDetails } from "./Helper";

export interface UserProfile {
    uid:string;
    firstName?: string;
    lastName?: string;
    address: Address;
    phoneNumber:string;
    bannerUrl?:string;
    avatarUrl?:string;
    createdAt: Date; // Timestamp, auto-set
    role: 'regular' | 'pro'; 
    proDetails?: ProDetails;
}

export interface Address {
    street:string;
    city:string;
    state:string;
    zip:string;
    country?: string; 
}