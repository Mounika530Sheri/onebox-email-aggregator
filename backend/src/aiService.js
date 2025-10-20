const OpenAI = require("openai");
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateReply(emailBody, context) {
  try {
    const prompt = `
You are an AI assistant helping generate professional email replies.

Email received:
${emailBody}

Context:
${context}

Write a short, polite and professional reply.
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt
    });

    return response.output[0].content[0].text;
  } catch (error) {
    console.error("OpenAI API Error:", error);
    throw error;
  }
}

module.exports = { generateReply };
