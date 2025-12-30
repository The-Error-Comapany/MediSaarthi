import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export const askGemini = async (fullPrompt) => {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing Gemini API key");
  }

  const response = await axios.post(
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
    { contents: [{ role: "user", parts: [{ text: fullPrompt }] }] },
    {
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": GEMINI_API_KEY
      }
    }
  );

  return response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
};
