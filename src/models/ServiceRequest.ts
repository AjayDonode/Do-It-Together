import { Address } from "./UserProfile";

//Optional model for future features like bookings/payments.
export interface ServiceRequest {
  requestId: string; // Auto-generated
  userId: string; // Requester (regular User.uid)
  proProfileId?: string; // Assigned Pro (optional, for accepted requests)
  serviceType: string; // e.g., 'Electrical'
  description: string; // Details of request
  location: Address; // Request location
  status: 'pending' | 'accepted' | 'completed'; // Workflow state
  createdAt: Date;
}
