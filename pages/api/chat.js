// pages/api/chat.js
import ollama from "ollama";

// Supported model you want to use
const MODEL_NAME = "gemma3:1b-it-qat";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { message } = req.body;
  if (typeof message !== "string" || !message.trim()) {
    return res
      .status(400)
      .json({ error: "Missing or invalid `message` field" });
  }

  try {
    // Try chatting; if model not found, pull then retry
    let response;
    try {
      response = await ollama.chat({
        model: MODEL_NAME,
        messages: [{ role: "user", content: message.trim() }],
      });
    } catch (err) {
      if (err.status_code === 404) {
        console.log(
          `Model ${MODEL_NAME} not found; pulling from repository...`
        );
        await ollama.pull({ model: MODEL_NAME });
        response = await ollama.chat({
          model: MODEL_NAME,
          messages: [{ role: "user", content: message.trim() }],
        });
      } else {
        throw err;
      }
    }

    return res.status(200).json({ reply: response.message.content });
  } catch (err) {
    console.error("Ollama chat error:", err);
    const msg =
      err.status_code === 404
        ? `Model ${MODEL_NAME} not available; pull it with 'ollama pull ${MODEL_NAME}'.`
        : "Failed to generate a reply.";
    return res.status(500).json({ error: msg });
  }
}
