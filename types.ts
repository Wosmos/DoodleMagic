
export enum Tool {
  BRUSH = 'brush',
  ERASER = 'eraser',
  PAN = 'pan'
}

export enum BrushStyle {
  SOLID = 'solid',
  MARKER = 'marker',
  CRAYON = 'crayon',
  SPRAY = 'spray',
  SPARKLE = 'sparkle',
  RAINBOW = 'rainbow'
}

export type ArtStyle = {
  id: string;
  name: string;
  description: string;
  emoji: string;
  promptSuffix: string;
};

export interface ArtPrompt {
  id: string;
  title: string;
  instruction: string;
  emoji: string;
  traceUrl?: string;
}

export interface CanvasState {
  zoom: number;
  offsetX: number;
  offsetY: number;
}

export interface GalleryItem {
  id: string;
  url: string;
  date: number;
  prompt: string;
}
