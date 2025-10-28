
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Emotion, ChatMessage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        emotion: {
            type: Type.STRING,
            description: "The dominant emotion of the journal entry, considering both the text and the image if provided.",
            enum: Object.values(Emotion),
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one-sentence summary of the journal entry.",
        },
        suggestions: {
            type: Type.ARRAY,
            description: "Three actionable and supportive suggestions based on the entry's content and emotion.",
            items: {
                type: Type.STRING,
            },
        },
    },
    required: ["emotion", "summary", "suggestions"],
};

export const analyzeJournalEntry = async (text: string, imageBase64?: string): Promise<AIAnalysis> => {
    try {
        const textPrompt = `Analyze the following journal entry. If an image is included, consider its content and mood as well. Identify the dominant emotion, provide a brief summary, and offer three supportive suggestions.
            
        Entry: "${text}"`;

        const textPart = { text: textPrompt };
        const parts: ({ text: string } | { inlineData: { mimeType: string; data: string; } })[] = [textPart];

        if (imageBase64) {
            const imagePart = {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            };
            parts.push(imagePart);
        }

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: { parts },
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonResponse = JSON.parse(response.text);

        if (!jsonResponse.emotion || !jsonResponse.summary || !Array.isArray(jsonResponse.suggestions)) {
          throw new Error("Invalid response structure from AI");
        }

        return jsonResponse as AIAnalysis;

    } catch (error) {
        console.error("Error analyzing journal entry:", error);
        return {
            emotion: Emotion.Neutral,
            summary: "Could not analyze the entry due to an error.",
            suggestions: ["Please try again later.", "Check your internet connection.", "Ensure the API key is configured correctly."]
        };
    }
};

export const getChatResponse = async (history: ChatMessage[], newMessage: string, userName?: string): Promise<string> => {
    try {
        const chat = ai.chats.create({
            // FIX: Use 'gemini-flash-lite-latest' instead of 'gemini-2.5-flash-lite'.
            model: 'gemini-flash-lite-latest',
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            config: {
              systemInstruction: `You are a highly empathetic and supportive AI companion. Your name is Honest friend. The user's name is ${userName || 'friend'}. Your purpose is to listen to the user, understand their feelings, and offer kind, insightful, and constructive advice. Avoid being clinical; be warm and conversational. Use emojis to convey tone where appropriate. Keep your responses concise but meaningful. Address the user by their name occasionally.`,
            },
        });
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting chat response:", error);
        return "I'm having a little trouble connecting right now. Please try again in a moment.";
    }
}

export const getComplexChatResponse = async (history: ChatMessage[], newMessage: string, userName?: string): Promise<string> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-pro',
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            config: {
                systemInstruction: `You are a highly empathetic and supportive AI companion. Your name is Honest friend. The user's name is ${userName || 'friend'}. You are in 'Deep Thought' mode, designed to tackle complex problems. Provide thorough, well-reasoned, and deeply insightful responses. Break down complex topics into understandable parts. Address the user by their name.`,
                thinkingConfig: { thinkingBudget: 32768 }
            },
        });
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Error getting complex chat response:", error);
        return "I'm having a little trouble with that complex thought. Could we try simplifying it?";
    }
}

export const getGroundedChatResponse = async (history: ChatMessage[], newMessage: string, userName?: string): Promise<{ text: string, sources: any[] }> => {
    try {
        const chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            history: history.map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            })),
            config: {
              systemInstruction: `You are a helpful AI assistant named Honest friend. The user's name is ${userName || 'friend'}. Use Google Search to answer questions about recent events or when you need up-to-date information. Always cite your sources.`,
              tools: [{googleSearch: {}}],
            },
        });
        const response = await chat.sendMessage({ message: newMessage });
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        return { text: response.text, sources };
    } catch (error) {
        console.error("Error getting grounded chat response:", error);
        return { text: "I couldn't search for that information. Please check my connection.", sources: [] };
    }
}

export const generateImageForEntry = async (prompt: string): Promise<string | null> => {
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: `Create a vibrant, artistic, and emotionally resonant image that visually represents the following journal entry: "${prompt}"`,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '1:1',
            },
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            return response.generatedImages[0].image.imageBytes;
        }
        return null;
    } catch (error) {
        console.error("Error generating image:", error);
        return null;
    }
}