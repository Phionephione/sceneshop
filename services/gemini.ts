
import { GoogleGenAI, Type } from "@google/genai";
import { DetectedProduct } from "../types";

/**
 * Robustly parses JSON from a potentially markdown-wrapped string
 */
const parseGeminiJson = (text: string) => {
  try {
    // Attempt standard parse
    return JSON.parse(text);
  } catch (e) {
    // Attempt to extract from markdown block
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/```\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        return JSON.parse(jsonMatch[1]);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON:", innerE);
      }
    }
    throw new Error("Failed to parse model response as JSON");
  }
};

export const analyzeFrame = async (base64Image: string): Promise<DetectedProduct[]> => {
  // Initializing GoogleGenAI right before the call to ensure freshness
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: base64Image,
              },
            },
            {
              text: `Analyze this movie scene frame. Identify up to 5 prominent physical items that a viewer might want to buy (e.g., fashion accessories, furniture, tech gadgets, vehicles, clothing). 
              For each item, provide:
              - name: A specific, catchy product name.
              - category: The type of product.
              - description: A one-sentence sleek marketing description.
              - priceEstimate: An approximate price (e.g., "₹8,999").
              - shopLinks: An array of shopping objects. Each object should have 'storeName' (e.g., 'Amazon', 'Flipkart', 'Meesho', 'Myntra') and a 'url' which is a simulated search link for that specific store for the item.
              Format the output strictly as a JSON array.`,
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
              description: { type: Type.STRING },
              priceEstimate: { type: Type.STRING },
              shopLinks: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    storeName: { type: Type.STRING },
                    url: { type: Type.STRING },
                  },
                  required: ["storeName", "url"],
                },
              },
            },
            required: ["name", "category", "description", "priceEstimate", "shopLinks"],
          },
        },
      },
    });

    const products: any[] = parseGeminiJson(response.text || "[]");
    
    return products.map((p, idx) => ({
      ...p,
      id: `prod-${idx}-${Date.now()}`,
      confidence: 0.95 - (idx * 0.05),
    }));
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
