import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface ImageFile {
  file: File;
  previewUrl: string;
  base64Data: string;
  mimeType: string;
}

export interface TryOnRequest {
  outfitId: string;
  userImage: ImageFile;
  garmentImages: ImageFile[];
  description: string;
}

export interface TryOnResult {
  outfitId: string;
  imageUrl: string | null;
  textResponse: string | null;
  error?: string;
}

export const generateTryOnImage = async (request: TryOnRequest): Promise<TryOnResult> => {
  try {
    const parts: any[] = [];

    // Add User Image
    parts.push({
      inlineData: {
        mimeType: request.userImage.mimeType,
        data: request.userImage.base64Data,
      },
    });
    parts.push({ text: "This is the user's photo." });

    // Add Garment Images
    if (request.garmentImages && request.garmentImages.length > 0) {
      request.garmentImages.forEach((img, index) => {
        parts.push({
          inlineData: {
            mimeType: img.mimeType,
            data: img.base64Data,
          },
        });
        parts.push({ text: `This is clothing item #${index + 1} for the outfit.` });
      });
    }

    let prompt = `
      Act as a professional fashion stylist and photo editor.
      Task: Generate a photorealistic image of the person from the first image wearing the outfit composed of the clothing items provided.
      
      Instructions:
      - Replace the current clothing of the person with the target clothing items.
      - YOU MUST USE ALL PROVIDED CLOTHING ITEMS. Combine them into a complete cohesive outfit.
      - Keep the person's face, pose, body shape, and the background exactly as they are in the first image.
      - Ensure the lighting and shadows on the new clothing match the original scene.
      - High fidelity and realistic fabric texture are required.
    `;

    if (request.description) {
      prompt += `\nAdditional Instructions: ${request.description}`;
    }

    if (request.garmentImages && request.garmentImages.length > 0) {
      prompt += `\nUse the visual details from the clothing images provided to apply the textures, colors, and cuts to the person.`;
    }

    parts.push({ text: prompt });

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
    const response = await model.generateContent(parts);

    let imageUrl: string | null = null;
    let textResponse: string | null = null;

    if (response.candidates && response.candidates[0].content && response.candidates[0].content.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64EncodeString = part.inlineData.data;
          imageUrl = `data:image/png;base64,${base64EncodeString}`;
        } else if (part.text) {
          textResponse = part.text;
        }
      }
    }

    if (!imageUrl && !textResponse) {
      throw new Error("No content generated.");
    }

    return { outfitId: request.outfitId, imageUrl, textResponse };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return { 
      outfitId: request.outfitId, 
      imageUrl: null, 
      textResponse: null, 
      error: error.message || "Failed to generate image" 
    };
  }
};