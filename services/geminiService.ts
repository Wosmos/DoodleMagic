
import { GoogleGenAI } from "@google/genai";
import { ArtStyle } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const transformDrawing = async (base64Image: string, prompt: string, style: ArtStyle) => {
  const ai = getAI();
  const imageData = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: 'image/png' } },
        { text: `You are a world-class professional illustrator. A child has provided this rough sketch of "${prompt}". 
        Your job is to RE-INTERPRET this sketch ${style.promptSuffix}
        
        CRITICAL INSTRUCTIONS:
        1. DO NOT simply stylize the wobbly or crude lines. Instead, recognize the INTENDED subject and replace the rough shapes with professional, finished artwork.
        2. Preserve the GENERAL COMPOSITION (placement of objects, characters' poses, and camera angle).
        3. Use the colors from the sketch as a guide, but upgrade them to professional color palettes.
        4. The output must be a clean, high-fidelity masterpiece illustration that looks like it belongs in a professional art portfolio or high-end animation movie.` }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const enhanceDrawing = async (base64Image: string) => {
  const ai = getAI();
  const imageData = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: 'image/png' } },
        { text: `You are a professional illustrator. A child has provided this rough sketch.
        Your job is to ENHANCE this sketch into a cleaner, better version of the EXACT SAME DRAWING.
        
        CRITICAL INSTRUCTIONS:
        1. Keep it as a 2D drawing/illustration. DO NOT turn it into 3D or real life.
        2. Fix the wobbly lines, improve the proportions, and add neat, professional coloring and shading.
        3. Preserve the exact composition, characters, and intent of the original sketch.
        4. The output must look like a high-quality digital illustration of the original sketch.` }
      ]
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });

  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  return part ? `data:image/png;base64,${part.inlineData.data}` : null;
};

export const guessWhatIAmDrawing = async (base64Image: string) => {
  const ai = getAI();
  const imageData = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: 'image/png' } },
        { text: "Look at this child's sketch. What is the subject? Be a very friendly and supportive teacher. Respond with one short, fun sentence like 'Is that a super fast space-car zooming to the stars?' or 'I see a very fluffy kitten!'. Be extremely encouraging and focus on the character or object they tried to draw." }
      ]
    }
  });

  return response.text || "I see a masterpiece in the making!";
};

export const getArtFeedback = async (base64Image: string, promptTitle: string) => {
  const ai = getAI();
  const imageData = base64Image.split(',')[1];

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { inlineData: { data: imageData, mimeType: 'image/png' } },
        { text: `You are a supportive art mentor for children. Feedback for a drawing of "${promptTitle}". Give 1 sentence of enthusiastic praise about a specific choice (like composition or character intent) and 1 simple tip for next time (e.g. 'try adding some light and shadow to make your character pop!').` }
      ]
    }
  });

  return response.text || "You have a great artist's soul!";
};
