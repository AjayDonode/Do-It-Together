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

/** One individual piece to be cut from lumber or sheet goods */
export interface WoodPiece {
  /** Short label shown in the diagram, e.g. "Seat Top" */
  label: string;
  /** Wood species / sheet type, e.g. "Pine 2×4", "3/4\" Plywood", "MDF" */
  woodType: string;
  /** Finished thickness in inches, e.g. 1.5 */
  thicknessIn: number;
  /** Finished width in inches */
  widthIn: number;
  /** Finished length in inches */
  lengthIn: number;
  /** How many of this piece to cut */
  quantity: number;
  /** Optional note shown on the piece card, e.g. "Sand edges smooth" */
  notes?: string;
}

/** One numbered step in the assembly process */
export interface AssemblyStep {
  step: number;
  description: string;
  /** Labels of pieces involved in this step (must match WoodPiece.label) */
  pieces: string[];
  /** Any fasteners / hardware needed, e.g. "2\" wood screws × 8" */
  hardwareNeeded?: string;
}

/** Full wood diagram payload — only present for wood-based projects */
export interface WoodDiagram {
  pieces: WoodPiece[];
  assemblySteps: AssemblyStep[];
  /** General build notes shown at the top of the cut-list section */
  overallNotes?: string;
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
  /** Only present for woodworking projects */
  woodDiagram?: WoodDiagram;
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
  /** Set when image generation fails — contains the API error message */
  imageError?: string;

  // Status
  status: 'generating' | 'complete' | 'error';
}
