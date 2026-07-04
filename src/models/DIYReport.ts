// src/models/DIYReport.ts
import { Timestamp } from 'firebase/firestore';

export interface DIYStep {
  step: number;
  title: string;
  description: string;
  timeMinutes: number;
  tip?: string;
}

export interface DIYTool {
  name: string;
  required: boolean;
  searchQuery: string;
  estimatedPrice: string;
}

export interface DIYMaterial {
  name: string;
  quantity: string;
  unit: string;
  searchQuery: string;
  estimatedPrice: string;
}

export interface DIYPlan {
  title: string;
  difficulty: 'beginner' | 'intermediate' | 'expert';
  totalTime: string;
  totalCost: string;
  steps: DIYStep[];
  tools: DIYTool[];
  materials: DIYMaterial[];
  safetyNotes: string[];
  whenToHireInstead: string;
  imagePrompt: string;
}

export interface DIYReport {
  id?: string;
  userId: string;
  createdAt?: Timestamp;

  // From intake
  problem: string;
  skillLevel: string;
  budget: string;
  timeline: string;
  zipCode: string;

  // From AI
  plan: DIYPlan;

  // From image gen
  designImageUrl?: string;

  // Status
  status: 'generating' | 'complete' | 'error';
}
