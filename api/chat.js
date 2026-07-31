import Groq from "groq-sdk";

const DEFAULT_MODEL = "llama-3.1-8b-instant";
const SYSTEM_PROMPT = "You are Deku AI, a helpful and intelligent AI assistant.";

function buildMessages(prompt, history = [], systemPrompt) {
  const messages = [
    { role: "system", content: (systemPrompt || "").trim() || SYSTEM_PROMPT },
  ];

  for (const item of history.slice(-8)) {
    if (!item || typeof item !== "object") continue;
    const role = item.role === "assistant" ? "assistant" : "user";
    const content = typeof item.content === "string" ? item.content.trim() : "";
    if (content) messages.push({ role, content });
  }

  messages.push({ role: "user", content: prompt });
  return messages;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server misconfiguration: GROQ_API_KEY is missing" });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const prompt = (body.prompt || "").trim();
    const image = body.image || null;

    if (!prompt && image) {
      return res.status(400).json({ error: "Image-only requests are not supported in this deployment. Please include a text prompt." });
    }

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const model = process.env.GROQ_MODEL || DEFAULT_MODEL;
    const messages = buildMessages(prompt, body.history, body.settings?.systemPrompt);

    const completion = await groq.chat.completions.create({
      model,
      messages,
      temperature: Number.isFinite(body.settings?.temperature)
        ? body.settings.temperature
        : 0.7,
      max_tokens: Number.isFinite(body.settings?.maxTokens)
        ? body.settings.maxTokens
        : 1024,
    });

    const text = completion.choices?.[0]?.message?.content?.trim();
    if (!text) {
      return res.status(502).json({ error: "Model returned an empty response" });
    }

    return res.status(200).json({
      text,
      stats: {
        source: "groq",
        model,
      },
    });
  } catch (error) {
    const status = Number.isInteger(error?.status) ? error.status : 500;
    const message =
      error?.error?.message ||
      error?.message ||
      "Chat request failed";

    return res.status(status).json({ error: message });
  }
}
