export type WasteCategory = 'Wet' | 'Dry' | 'E-Waste' | 'Hazardous' | 'Harmful' | 'Recyclable';

export interface ClassificationResult {
  itemDescription: string;
  category: WasteCategory;
  explanation: string;
  disposalInstructions: string[];
  ecoTip?: string;
  source?: 'gemini' | 'rule-engine';
  modelUsed?: string;
  imageUrl?: string;
  detectedMaterial?: string;
}

export interface WasteCategoryConfig {
  label: WasteCategory;
  badgeBg: string;
  badgeText: string;
  borderColor: string;
  bgLight: string;
  iconColor: string;
  binColor: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  image?: string;
  result?: ClassificationResult;
  timestamp: number;
}

export interface HistoryItem {
  id: string;
  itemDescription: string;
  category: WasteCategory;
  timestamp: number;
  result: ClassificationResult;
}
