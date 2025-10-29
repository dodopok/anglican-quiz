import { GoogleGenAI, Type } from "@google/genai";
import type { Scores, HistoricalFigure } from '../types';
import en from '../locales/en.json';
import pt from '../locales/pt.json';

const translations = { en, pt };

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("API_KEY environment variable not set. Using a placeholder. Functionality will be limited.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function getHistoricalFigure(scores: Scores, lang: 'en' | 'pt'): Promise<HistoricalFigure> {
  const t = translations[lang];
  
  const prompt = t.gemini_prompt.main
    .replace('{{catholic}}', scores.catholic.toString())
    .replace('{{protestant}}', scores.protestant.toString())
    .replace('{{liberal}}', scores.liberal.toString())
    .replace('{{language}}', t.gemini_prompt.language_name);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "The name of the historical Anglican figure.",
            },
            explanation: {
              type: Type.STRING,
              description: "A brief, one-paragraph explanation of why the figure is a good match.",
            },
          },
          required: ["name", "explanation"],
        },
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);
    
    if (parsedResponse.name && parsedResponse.explanation) {
        return parsedResponse as HistoricalFigure;
    } else {
        throw new Error("Invalid JSON structure from API");
    }

  } catch (error) {
    console.error("Error fetching from Gemini API:", error);
    // Fallback in case of API error
    return {
      name: t.results.fallback_figure_name,
      explanation: t.results.fallback_figure_explanation,
    };
  }
}