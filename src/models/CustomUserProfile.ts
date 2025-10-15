export interface CustomUserProfile {
    address: Address;
    phoneNumber:string;
    bannerUrl?:string;
}

export interface Address {
    street:string;
    city:string;
    state:string;
    zip:string;
}