import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

export const genAI = apiKey && apiKey !== 'YOUR_GEMINI_API_KEY'
  ? new GoogleGenerativeAI(apiKey)
  : null;
