
export interface Scene {
  id: string;
  sceneNumber: number;
  description: string;
  visualPrompt: string;
  dialoguePreview?: string;
  imageUrl?: string;
  isGenerating?: boolean;
  error?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ImageSize = '1K' | '2K' | '4K';

export interface ScriptAnalysis {
  title: string;
  scenes: Scene[];
  genre: string;
  pacing: {
    label: string;
    value: number;
  }[];
}
