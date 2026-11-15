import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import { buildSystemInstruction } from './prompts.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

if (!process.env.GEMINI_API_KEY) {
  console.warn('WARNING: GEMINI_API_KEY is not set. /api/chat requests will fail until configured.');
}

const ai = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  : null;

app.use(
  helmet({
    contentSecurityPolicy: false // Allow Vite/PWA inline styles & Google grounding entry point HTML when enabled
  })
);
app.use(cors());
app.use(express.json({ limit: '12mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    configured: Boolean(ai),
    model: GEMINI_MODEL,
    owner: 'Kälte-Klimatechnik Said'
  });
});

app.post('/api/chat', async (req, res) => {
  if (!ai) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured on the server.'
    });
  }

  try {
    const {
      messages = [],
      language = 'ar',
      mode = 'assistant',
      useWebSearch = false
    } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Keep recent 20 turns to avoid exceeding context/payload limits unnecessarily
    const recentMessages = messages.slice(-20);

    let hasImage = false;
    const contents = recentMessages
      .filter((msg) => msg && (msg.role === 'user' || msg.role === 'model'))
      .map((msg) => {
        const parts = [];
        if (typeof msg.text === 'string' && msg.text.trim()) {
          parts.push({ text: msg.text.trim() });
        }
        if (msg.image && msg.image.data && msg.image.mimeType) {
          hasImage = true;
          parts.push({
            inlineData: {
              mimeType: msg.image.mimeType,
              data: msg.image.data
            }
          });
        }
        return {
          role: msg.role,
          parts
        };
      })
      .filter((c) => c.parts.length > 0);

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No valid message content provided.' });
    }

    const systemInstruction = buildSystemInstruction({ language, mode, hasImage });

    const config = {
      systemInstruction,
      temperature: mode === 'hvac' || hasImage ? 0.2 : 0.5
    };

    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents,
      config
    });

    const text = response.text || '';
    const candidate = response.candidates?.[0];
    const grounding = candidate?.groundingMetadata;

    const sources = [];
    const seenUrls = new Set();

    if (Array.isArray(grounding?.groundingChunks)) {
      for (const chunk of grounding.groundingChunks) {
        const uri = chunk?.web?.uri;
        const title = chunk?.web?.title;
        if (uri && !seenUrls.has(uri)) {
          seenUrls.add(uri);
          sources.push({
            uri,
            title: title || uri
          });
        }
      }
    }

    return res.json({
      text,
      sources,
      webSearchQueries: grounding?.webSearchQueries || [],
      searchEntryPointHtml: grounding?.searchEntryPoint?.renderedContent || null,
      model: GEMINI_MODEL
    });
  } catch (err) {
    console.error('Gemini API error:', err);
    const status = err?.status && Number.isInteger(err.status) ? err.status : 500;
    return res.status(status).json({
      error: err?.message || 'Failed to get response from Gemini API.'
    });
  }
});

// Serve built React app in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`SAID AI server running on http://localhost:${PORT} (model: ${GEMINI_MODEL})`);
});
