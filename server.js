const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Mapping category keys to labels
const META = {
  life: "Life",
  random: "Random",
  deep: "Deep",
  experiences: "Experiences",
  ifyoucould: "If You Could...",
  wouldyourather: "Would You Rather..."
};

// Endpoint to generate a batch of new prompts
app.post('/api/generate', async (req, res) => {
  const { cat, recentHistory, count = 2 } = req.body;
  
  if (!cat || !META[cat]) {
    return res.status(400).json({ error: "Invalid or missing category" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("GEMINI_API_KEY is not set in environment variables.");
    return res.status(500).json({ 
      error: "Gemini API key is not configured. Please set GEMINI_API_KEY in your .env file." 
    });
  }

  const categoryLabel = META[cat];
  const historyText = Array.isArray(recentHistory) && recentHistory.length > 0
    ? recentHistory.map(p => `- "${p}"`).join('\n')
    : "- None yet";

  const nonce = Math.random().toString(36).substring(2, 9);
  const systemInstructions = `You are a creative writer for a social icebreaker card game.
Your task is to write high-quality conversation starter prompts for the category: "${categoryLabel}". (Session nonce: ${nonce})

CRITICAL REQUIREMENTS:
1. Write EXACTLY ${count} new prompt(s).
2. Each prompt MUST be a single, self-contained, engaging question or instruction in one sentence.
3. Keep the tone conversational, interesting, direct, and completely free of introductory filler or explanations.
4. Avoid repeating or echoing any of these recently used prompts:
${historyText}
5. Make sure the prompts cover unexpected, varied topics and angles, and are distinct from the list of recently used prompts.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: systemInstructions }]
          }],
          generationConfig: {
            temperature: 1.0,
            responseMimeType: "application/json",
            responseSchema: {
              type: "ARRAY",
              items: {
                type: "STRING"
              }
            }
          }
        })
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errText}`);
    }

    const data = await response.json();
    
    // Extract the text response which is guaranteed to be a JSON string array
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!textResponse) {
      throw new Error("Empty response received from Gemini API");
    }

    const prompts = JSON.parse(textResponse.trim());
    if (!Array.isArray(prompts)) {
      throw new Error("Invalid response format: Expected a JSON array.");
    }

    res.json({ prompts });
  } catch (error) {
    console.error("Error generating prompts:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fallback to index.html for single page app routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(` Icebreaker Deck App is running!`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`==================================================`);
});
