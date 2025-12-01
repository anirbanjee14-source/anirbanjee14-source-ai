import { GoogleGenAI } from "@google/genai";
import { AspectRatio, ImageStyle } from '../types';

const generateSingleImage = async (
  prompt: string,
  aspectRatio: AspectRatio,
  style: ImageStyle,
  characterImage: { data: string; mimeType: string } | null,
  inspirationImage: { data: string; mimeType: string } | null,
  colors: string,
  ai: GoogleGenAI
): Promise<string> => {
    let augmentedPrompt = prompt;
    if (style !== ImageStyle.NONE) {
        augmentedPrompt += `, in a ${style.toLowerCase()} style`;
    }
    if (colors.trim()) {
        augmentedPrompt += `, with a color palette focusing on ${colors.trim()}`;
    }

    const parts: any[] = [];
    
    if (characterImage) {
        augmentedPrompt += `. Use the first provided image as a character reference.`
        parts.push({
            inlineData: {
                mimeType: characterImage.mimeType,
                data: characterImage.data,
            },
        });
    }
    if (inspirationImage) {
        augmentedPrompt += `. Use the next provided image as a style reference.`
        parts.push({
            inlineData: {
                mimeType: inspirationImage.mimeType,
                data: inspirationImage.data,
            },
        });
    }

    parts.unshift({ text: augmentedPrompt });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: {
            imageConfig: {
                aspectRatio: aspectRatio,
            },
        },
    });

    if (response.candidates && response.candidates[0].content.parts) {
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64EncodeString: string = part.inlineData.data;
                return `data:image/png;base64,${base64EncodeString}`;
            }
        }
    }
    throw new Error('No image data found in a response.');
}

export const generateImages = async (
  prompt: string,
  aspectRatio: AspectRatio,
  quantity: number,
  style: ImageStyle,
  characterImage: { data: string; mimeType: string } | null,
  inspirationImage: { data: string; mimeType: string } | null,
  colors: string
): Promise<string[]> => {
    // A new instance must be created before each call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
        const imagePromises: Promise<string>[] = [];
        for (let i = 0; i < quantity; i++) {
            imagePromises.push(generateSingleImage(prompt, aspectRatio, style, characterImage, inspirationImage, colors, ai));
        }

        const imageUrls = await Promise.all(imagePromises);
        return imageUrls;

    } catch (error) {
        console.error('Error generating image:', error);
        if (error instanceof Error && error.message.includes('API key')) {
            throw new Error('API key is invalid or missing. Please check your configuration.');
        }
        throw new Error('Failed to generate image. Please try again.');
    }
};