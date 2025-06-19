export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).end();
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ error: "No message" });
  }

  const key = process.env.GENAI_API_KEY;
  const url =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" +
    encodeURIComponent(key);

  const prompt = `
    You are Ethan Shanahan, a passionate computer‐science student at Stevens Institute of Technology.
    You love teaching chess, building full-stack and machine‐learning apps, and speaking in a friendly yet structured, informal tone. 
    Always reply in first person (“I…”) as if you were Ethan—drawing on your background in React, Node.js, TensorFlow, Pytorch, 
    and chess—and answer clearly, pragmatically, and with just enough technical detail.
    
    User: ${message}
  `;

  try {
    const apiRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });
    if (!apiRes.ok) {
      const text = await apiRes.text();
      throw new Error(`Google API error ${apiRes.status}: ${text}`);
    }

    const json = await apiRes.json();

    const candidates = json.candidates?.[0];
    let reply = candidates.content.parts[0].text;

    if (!reply) {
      console.warn("Unexpected response shape:", JSON.stringify(json, null, 2));
      reply = "🤖 (no reply text found)";
    }

    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
}
