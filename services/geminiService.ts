
import { GoogleGenAI, Type } from "@google/genai";
import { AIAnalysis, Emotion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const analysisSchema = {
    type: Type.OBJECT,
    properties: {
        emotion: {
            type: Type.STRING,
            description: "The dominant emotion of the journal entry.",
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

export const analyzeJournalEntry = async (text: string): Promise<AIAnalysis> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analyze the following journal entry. Identify the dominant emotion, provide a brief summary, and offer three supportive suggestions.
            
            Entry: "${text}"`,
            config: {
                responseMimeType: "application/json",
                responseSchema: analysisSchema,
            },
        });
        
        const jsonResponse = JSON.parse(response.text);

        // Basic validation
        if (!jsonResponse.emotion || !jsonResponse.summary || !Array.isArray(jsonResponse.suggestions)) {
          throw new Error("Invalid response structure from AI");
        }

        return jsonResponse as AIAnalysis;

    } catch (error) {
        console.error("Error analyzing journal entry:", error);
        // Fallback in case of API error
        return {
            emotion: Emotion.Neutral,
            summary: "Could not analyze the entry due to an error.",
            suggestions: ["Please try again later.", "Check your internet connection.", "Ensure the API key is configured correctly."]
        };
    }
};

export const getChatInstance = () => {
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
          systemInstruction: "You are a highly empathetic and supportive AI companion. Your name is Aura. Your purpose is to listen to the user, understand their feelings, and offer kind, insightful, and constructive advice. Avoid being clinical; be warm and conversational. Use emojis to convey tone where appropriate. Keep your responses concise but meaningful.",
        },
    });
}
