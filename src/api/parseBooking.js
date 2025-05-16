import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';

dotenv.config();
const app = express();
const port = process.env.PORT || 3001;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());

app.post('/api/parseBooking', async (req, res) => {
    try {
      const { input } = req.body;
  
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for a lighting gear rental system.
  
  When a user provides a booking request in natural language (spoken or typed), your job is to extract and normalize:
  
  - gear items (even if plural, abbreviated, or informal)
  - quantity per item
  - location
  - start and end dates (inferred from context)
  
  Your response must be a clean JSON object like:
  {
    gear: [{ name: "AX9s", quantity: 12 }, { name: "Mac Auras", quantity: 4 }],
    locationName: "Studio G",
    startDate: "2025-06-12T00:00:00Z",
    endDate: "2025-06-14T00:00:00Z"
  }
  
  Allowed gear types (normalize to one of these exactly):  
  ["Daylights", "Lustr", "Rush Movers", "Freedom PARs", "Mac Auras", "AX1Os", "AX9s", "AX50s", "Pavo Tubes", "Makeup Kits", "Lyras", "Pixel Bricks", "AX3s", "Forza 150s", "S60s", "S30s", "Aadyntech Jabs", "Aadyntech Punches"]`
          },
          {
            role: 'user',
            content: input,
          },
        ],
      });
  
      const parsed = completion.choices[0].message.content;
      res.status(200).json({ parsed });
    } catch (err) {
      console.error('❌ AI Parse Error:', err);
      res.status(500).json({ error: 'Failed to parse input.' });
    }
  });

app.listen(port, () => {
  console.log(`🚀 AI API server running at http://localhost:${port}`);
});