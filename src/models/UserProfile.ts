import { ProDetails } from "./Helper";

export interface UserProfile {
    uid:string;
    address: Address;
    phoneNumber:string;
    bannerUrl?:string;
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