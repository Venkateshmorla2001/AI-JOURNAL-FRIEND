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

export const getChatInstance = (history?: ChatMessage[]) => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        history: history?.map(msg => ({
            role: msg.role,
            parts: [{ text: msg.text }]
        })),
        config: {
          systemInstruction: "You are a highly empathetic and supportive AI companion. Your name is Aura. Your purpose is to listen to the user, understand their feelings, and offer kind, insightful, and constructive advice. Avoid being clinical; be warm and conversational. Use emojis to convey tone where appropriate. Keep your responses concise but meaningful.",
        },
    });
}