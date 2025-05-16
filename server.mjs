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

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
  
    try {
      const response = await fetch('http://localhost:3001/api/parseBooking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input }),
      });
  
      const data = await response.json();
  
      const parsed = typeof data.parsed === 'string'
        ? JSON.parse(data.parsed)
        : data.parsed;
  
      if (!parsed || !parsed.startDate || !parsed.endDate || !parsed.gear || !parsed.locationName) {
        throw new Error('Missing required parsed fields');
      }
  
      console.log('🧠 Parsed:', parsed);
      onAIResult?.(parsed);  // Make sure this prop is passed in GearList
    } catch (err) {
      console.error('❌ Failed to parse AI response:', err);
      setError('Could not understand your input. Please try again.');
    } finally {
      setLoading(false);
    }
  };