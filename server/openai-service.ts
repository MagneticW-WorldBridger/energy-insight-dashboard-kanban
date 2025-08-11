import OpenAI from "openai";
import { Lead } from "@shared/schema";

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Define the QuestionnaireResponses type
export interface QuestionnaireResponses {
  q1?: string;
  q2?: string;
  q3?: string;
  q4?: string;
  q5?: string;
  q6?: string;
  q7?: string;
  q8?: string;
  q9?: string;
  q10?: string;
  q11?: string;
  q12?: string;
  q13?: string;
  q14?: string;
  q15?: string;
}

export interface AssessmentResult {
  likelihood: number;
  benefits: number;
  overall: string;
}

export async function analyzeQuestionnaire(
  questionnaire: QuestionnaireResponses
): Promise<AssessmentResult | null> {
  try {
    // Rural King: require at least 5 answered items
    const responses = Object.values(questionnaire).filter(Boolean);
    if (responses.length < 5) {
      console.warn(`Incomplete questionnaire: ${responses.length}/7 questions answered`);
      return null;
    }

    // Create a prompt for OpenAI analysis
    const prompt = `
    I have a customer questionnaire for a farm/ranch retail pipeline. The customer rated the following statements on a scale from 1 (strongly disagree) to 7 (strongly agree):

    1. I am actively shopping for farm, ranch, or outdoor products. - Rating: ${questionnaire.q1}
    2. I have a budget in mind for my next purchase. - Rating: ${questionnaire.q2}
    3. I prefer to buy within the next 30 days. - Rating: ${questionnaire.q3}
    4. I am the decision-maker for this purchase. - Rating: ${questionnaire.q4}
    5. I am comfortable ordering online for pickup or delivery. - Rating: ${questionnaire.q5}
    6. I’m interested in deals or financing options. - Rating: ${questionnaire.q6}
    7. I want personalized recommendations for my needs. - Rating: ${questionnaire.q7}

    Analyze these responses and provide:

    1. Purchase intent score (0-10 scale)
    2. Perceived value score (0-10 scale)
    3. An overall assessment category: "High Intent", "Medium Intent", or "Low Intent"

    Note that question 10 is reverse-scored, meaning a low score indicates higher likelihood.
    
    Return ONLY a JSON object in this format:
    {
      "likelihood": number,
      "benefits": number,
      "overall": string
    }
    `;

    // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    if (!content) {
      throw new Error("Empty response from OpenAI");
    }

    const result = JSON.parse(content) as AssessmentResult;
    
    // Validate the response format
    if (
      typeof result.likelihood !== "number" ||
      typeof result.benefits !== "number" ||
      typeof result.overall !== "string" ||
      !["High Intent", "Medium Intent", "Low Intent"].includes(result.overall)
    ) {
      throw new Error("Invalid response format from OpenAI");
    }

    return result;
  } catch (error) {
    console.error("Error analyzing questionnaire:", error);
    return null;
  }
}