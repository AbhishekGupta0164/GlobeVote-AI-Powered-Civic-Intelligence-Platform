import OpenAI from "openai";

// If keys are missing, we log a warning but don't crash, allowing the app to run in standalone demo mode.
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "mock-api-key";
const baseURL = process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || "https://api.openai.com/v1";

if (apiKey === "mock-api-key") {
  console.warn("⚠️  Running in STANDALONE mode: No OpenAI API key provided. AI features will not work.");
}

export const openai = new OpenAI({
  apiKey,
  baseURL,
});
