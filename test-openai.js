import OpenAI from 'openai';
import * as dotenv from 'dotenv';
dotenv.config();

// Initialize OpenAI client
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Sample questionnaire data
const questionnaire = {
  q1: "6",
  q2: "5",
  q3: "4",
  q4: "6",
  q5: "5",
  q6: "7",
  q7: "6",
  q8: "3",
  q9: "4",
  q10: "2", // This is reversed
  q11: "5",
  q12: "4",
  q13: "3",
  q14: "6",
  q15: "5"
};

// Create the prompt
const prompt = `
I have a patient questionnaire about cosmetic surgery. The patient rated the following statements on a scale from 1 (strongly disagree) to 7 (strongly agree):

1. It makes sense to have cosmetic surgery rather than spending years feeling bad about the way I look. - Rating: ${questionnaire.q1}
2. Cosmetic surgery is a good thing because it can help me feel better about myself. - Rating: ${questionnaire.q2}
3. Within next 2 months, I will end up having some cosmetic surgery. - Rating: ${questionnaire.q3}
4. I am very unhappy with my physical appearance, and I am considering cosmetic surgery. - Rating: ${questionnaire.q4}
5. I think cosmetic surgery can make me happier with the way I look, and I am willing to go for it. - Rating: ${questionnaire.q5}
6. If I could have a cosmetic surgery done for a fair price, I would consider cosmetic surgery. - Rating: ${questionnaire.q6}
7. If I knew there would be no negative side effects such as pain, I would like to try cosmetic surgery. - Rating: ${questionnaire.q7}
8. I am constantly thinking about having cosmetic surgery. - Rating: ${questionnaire.q8}
9. I would seriously consider having cosmetic surgery if my partner thought it, was a good idea. - Rating: ${questionnaire.q9}
10. I would never have any kind of cosmetic surgery. - Rating: ${questionnaire.q10} (Note: This score is reversed)
11. I would have cosmetic surgery to keep looking young. - Rating: ${questionnaire.q11}
12. It would benefit my career, I will have cosmetic surgery. - Rating: ${questionnaire.q12}
13. I am considering having cosmetic surgery as I think my partner would find me more attractive. - Rating: ${questionnaire.q13}
14. Cosmetic surgery can be a big benefit to my self-image. - Rating: ${questionnaire.q14}
15. I think Cosmetic procedure would make me more attractive to others, and that's why I will go for it. - Rating: ${questionnaire.q15}

Analyze these responses and provide:

1. Likelihood of having cosmetic surgery score (0-10 scale)
2. Perceived benefits of cosmetic surgery score (0-10 scale)
3. An overall assessment category: "High Intent", "Medium Intent", or "Low Intent"

Note that question 10 is reverse-scored, meaning a low score indicates higher likelihood.

Return ONLY a JSON object in this format:
{
  "likelihood": number,
  "benefits": number,
  "overall": string
}
`;

// Test function
async function testOpenAI() {
  try {
    console.log("Testing OpenAI API...");
    console.log("Using API key:", process.env.OPENAI_API_KEY ? "✓ API key found" : "✗ No API key");
    
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

    const result = JSON.parse(content);
    
    console.log("OpenAI API response received successfully!");
    console.log("Result:", JSON.stringify(result, null, 2));
    
    // Validate the response format
    if (
      typeof result.likelihood !== "number" ||
      typeof result.benefits !== "number" ||
      typeof result.overall !== "string" ||
      !["High Intent", "Medium Intent", "Low Intent"].includes(result.overall)
    ) {
      throw new Error("Invalid response format from OpenAI");
    }
    
    console.log("✓ Response validation passed");
    
  } catch (error) {
    console.error("Error testing OpenAI API:", error);
  }
}

// Run the test
testOpenAI();