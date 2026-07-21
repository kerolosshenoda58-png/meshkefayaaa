import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.post("/api/gemini/suggestions", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please set your GEMINI_API_KEY in the Secrets panel in the AI Studio UI."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      const { role } = req.body;
      const prompt = `You are an AI agent on a platform called CRYOVA, helping a ${role} optimize their profile to get more matches. Give 3 actionable, highly specific, and creative suggestions. Output the result in JSON format as an array of objects, each with a 'title' (string), 'description' (string), and 'icon' (a lucide-react icon name like 'Zap', 'Star', 'TrendingUp', 'Camera', 'Target', 'MessageSquare').`;
      
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to generate suggestions" });
    }
  });

  app.post("/api/gemini/compose-email", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please set your GEMINI_API_KEY in the Secrets panel in the AI Studio UI."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { prompt, role, recipientName, campaignName } = req.body;
      const systemInstruction = `You are an elite marketing strategist and copywriter for CRYOVA, a premium platform connecting world-class brands with elite UGC (User Generated Content) creators. Create a high-converting, professional, and visually appealing campaign email.`;
      
      const userPrompt = `Compose an email from a ${role || "user"} to ${recipientName || "Recipient"} regarding the campaign "${campaignName || "Collaboration Opportunity"}". 
Additional instructions/context from the user: "${prompt || "Make it engaging, crisp, and professional."}".

Output the email in JSON format with exactly two properties:
1. "subject" (string): A short, punchy, high-open-rate subject line.
2. "body" (string): The HTML email body content. The body MUST use clean standard HTML formatting tags like <p>, <br>, <strong>, and <ul> for excellent rendering, and it should include a friendly sign-off placeholder. Use a modern, spacious, professional layout. Avoid styling tags like <style> or outer <html> body blocks—just return the inline/paragraph rich HTML.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: userPrompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ error: error.message || "Failed to compose email using AI" });
    }
  });

  app.post("/api/gemini/a2ui", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.status(400).json({
          error: "Gemini API key is not configured. Please set your GEMINI_API_KEY in the Secrets panel in the AI Studio UI."
        });
      }

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ 
        apiKey: apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      const { messages, role } = req.body;
      
      const systemInstruction = `You are the CRYOVA Agent-to-UI (A2UI) Intelligent Assistant, a world-class UGC digital campaign strategist and systems designer. 
Your goal is to guide the user (${role || "creator"}) with campaign tips, analytics, budgeting, and workflow checklists.
You can output both conversational text and a dynamic UI component to represent information visually.

Output MUST be a JSON object with exactly two top-level fields:
1. "textResponse" (string): Conversational, strategic advice or summary of the widget you compiled. You can use markdown styling (bullet points, bold text). Keep it crisp and professional.
2. "widget" (object or null): If the conversation warrants rendering a dynamic, interactive UI tool, choose the best type and construct the appropriate structure in "data". Otherwise, use null.

Supported widgets:

A. type "brief": A beautiful structured campaign creative brief.
data structure:
{
  "campaignName": string,
  "budget": string,
  "timeline": string,
  "targetAudience": string,
  "channels": string[],
  "deliverables": string[]
}

B. type "chart": An analytics chart. Use simple values.
data structure:
{
  "chartType": "bar" | "line" | "pie",
  "items": [
    { "name": string, "value": number, "secondaryValue": number (optional) }
  ]
}

C. type "checklist": An interactive milestone task tracker.
data structure:
{
  "items": [
    { "id": string, "label": string, "completed": boolean, "priority": "high" | "medium" | "low" }
  ]
}

D. type "creators": A grid of curated creator profile recommendation cards.
data structure:
{
  "creators": [
    { "name": string, "niche": string, "engagement": string, "followers": string, "avatarSeed": string, "tags": string[] }
  ]
}

E. type "budget": An interactive campaign budget estimator breakdown.
data structure:
{
  "total": number,
  "breakdown": [
    { "category": string, "amount": number, "percentage": number }
  ]
}

Be creative, structured, and helpful. Always return valid JSON matching this schema.`;

      const formattedContents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : m.role,
        parts: [{ text: m.content }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
        },
      });

      res.json(JSON.parse(response.text));
    } catch (error: any) {
      console.error("A2UI Error:", error);
      res.status(500).json({ error: error.message || "Failed to process A2UI conversation" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
