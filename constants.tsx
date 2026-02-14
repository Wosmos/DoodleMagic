
import { ArtPrompt, ArtStyle } from './types';

export const ART_STYLES: ArtStyle[] = [
  {
    id: '3d_toy',
    name: '3D Toy',
    description: 'Shiny plastic toy style',
    emoji: '🧸',
    promptSuffix: 'into a high-end 3D character model or toy. Use vibrant colors, soft sub-surface scattering, studio lighting, and smooth plastic textures. The result should look like a professional character render from a modern animation film.'
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft and flowy paint',
    emoji: '🎨',
    promptSuffix: 'into a masterpiece watercolor illustration. Use professional techniques: wet-on-wet blending, soft paper texture, artistic pigment blooms, and delicate hand-drawn outlines. It should look like a high-quality children\'s book illustration.'
  },
  {
    id: 'oil_paint',
    name: 'Oil Paint',
    description: 'Rich and thick textures',
    emoji: '🖼️',
    promptSuffix: 'into a classic fine art oil painting. Use heavy impasto brushstrokes, visible paint texture, rich color depth, and dramatic chiaroscuro lighting. It should look like a museum-quality canvas painting.'
  },
  {
    id: 'pencil',
    name: 'Pencil Sketch',
    description: 'Hand-drawn graphite',
    emoji: '✏️',
    promptSuffix: 'into a highly detailed professional concept art pencil drawing. Use expert shading, fine cross-hatching, and clean artistic line work on textured sketch paper. It should look like a lead animator\'s character design sheet.'
  },
  {
    id: 'ghibli',
    name: 'Anime Studio',
    description: 'Magical anime style',
    emoji: '🌸',
    promptSuffix: 'into a magical, cinematic anime scene inspired by Studio Ghibli. Use lush backgrounds, soft sun-drenched lighting, hand-painted aesthetic, and a sense of nostalgic wonder. The final image must be a polished, clean animation frame.'
  }
];

export const ART_PROMPTS: ArtPrompt[] = [
  {
    id: 'free',
    title: 'Free Drawing',
    instruction: 'Draw whatever is in your heart today!',
    emoji: '✨'
  },
  {
    id: 'kitten',
    title: 'Kitten Guide',
    instruction: 'Trace the kitten or draw your own!',
    emoji: '🐱',
    traceUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'rocket',
    title: 'Space Explorer',
    instruction: 'Blast off! Draw a rocket in the stars.',
    emoji: '🚀',
    traceUrl: 'https://images.unsplash.com/photo-1541185933-ef5d8ed016c2?auto=format&fit=crop&q=80&w=1000'
  },
  {
    id: 'castle',
    title: 'Magic Castle',
    instruction: 'Build a fortress for a brave knight.',
    emoji: '🏰',
    traceUrl: 'https://images.unsplash.com/photo-1524397057410-1e775ed476f3?auto=format&fit=crop&q=80&w=1000'
  }
];

export const COLORS = [
  '#000000', '#4B5563', '#9CA3AF', '#FFFFFF',
  '#EF4444', '#F97316', '#F59E0B', '#10B981',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'
];

export const BRUSH_SIZES = [2, 6, 12, 24, 48, 96];
