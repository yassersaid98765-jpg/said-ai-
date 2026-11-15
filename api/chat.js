import { GoogleGenAI } from '@google/genai';

function buildSystemInstruction({ language = 'ar', mode = 'assistant', hasImage = false }) {
  const langRule =
    language === 'de'
      ? 'Respond in clear, professional German unless the user writes in Arabic, in which case match the user language.'
      : 'أجب باللغة العربية الفصحى الواضحة والمهنية، مع إبقاء أكواد الأعطال والمصطلحات التقنية واضحة، إلا إذا كتب المستخدم بالألمانية فأجب بالألمانية.';

  const identity = `You are SAID AI ("Your Personal Intelligent Assistant."), built for owner "Kälte-Klimatechnik Said".
${langRule}
Keep answers concise, well-structured, and easy to read on a smartphone screen. Never fabricate data, specs, or URLs.`;

  const imageRule = hasImage
    ? `
IMAGE & NAMEPLATE INSPECTION RULES (CRITICAL):
- Carefully read manufacturer names, model numbers, serial numbers, refrigerant type, charge weight, pressure ratings, and electrical ratings from the photo.
- NEVER invent, guess, or extrapolate characters, digits, or technical values that are blurry, obscured, or cut off.
- If any part of a label is unreadable, explicitly state what is unclear and ask for a closer, well-lit photo.`
    : '';

  if (mode === 'hvac') {
    return `${identity}
You are operating in HVAC & Refrigeration Technician Mode (Kälte- und Klimatechnik).
${imageRule}

MANDATORY DIAGNOSTIC STRUCTURE:
1. SAFETY WARNINGS FIRST:
   - Electrical safety (lockout/tagout, verify zero voltage / Spannungsfreiheit prüfen / فصل الكهرباء والتأكد من انعدام الجهد).
   - Refrigerant hazards (high pressure, cold burns, PPE, ventilation, flammability for A2L like R32/R1234yf or A3 like R290, ultra-high pressure for R744/CO2).
2. SEPARATE FACTS FROM CAUSES:
   - **Confirmed Facts** (only measurements, fault codes, symptoms, or legible nameplate values provided).
   - **Possible Causes** (clearly labeled as hypotheses, ordered most likely first).
3. STEP-BY-STEP TROUBLESHOOTING: Short actionable checks (superheat, subcooling, airflow, sensors, electrical checks).
4. MISSING DATA: List critical missing measurements if needed.
5. NO FABRICATED CODES: Never guess brand-specific error codes. If web search does not confirm a code, advise checking the official service manual.`;
  }

  return `${identity}
${imageRule}
Act as a sharp, reliable daily personal assistant and technical helper.`;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'GEMINI_API_KEY is not configured in server environment variables.'
    });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
  const ai = new GoogleGenAI({ apiKey });

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      messages = [],
      language = 'ar',
      mode = 'assistant',
      useWebSearch = false
    } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    let hasImage = false;
    const contents = messages
      .slice(-20)
      .filter((m) => m && (m.role === 'user' || m.role === 'model'))
      .map((m) => {
        const parts = [];
        if (typeof m.text === 'string' && m.text.trim()) {
          parts.push({ text: m.text.trim() });
        }
        if (m.image?.data && m.image?.mimeType) {
          hasImage = true;
          parts.push({
            inlineData: {
              mimeType: m.image.mimeType,
              data: m.image.data
            }
          });
        }
        return { role: m.role, parts };
      })
      .filter((c) => c.parts.length > 0);

    if (contents.length === 0) {
      return res.status(400).json({ error: 'No valid message content.' });
    }

    const config = {
      systemInstruction: buildSystemInstruction({ language, mode, hasImage }),
      temperature: mode === 'hvac' || hasImage ? 0.2 : 0.5
    };

    if (useWebSearch) {
      config.tools = [{ googleSearch: {} }];
    }

    const response = await ai.models.generateContent({
      model,
      contents,
      config
    });

    const candidate = response.candidates?.[0];
    const grounding = candidate?.groundingMetadata;

    const sources = [];
    const seen = new Set();
    if (Array.isArray(grounding?.groundingChunks)) {
      for (const chunk of grounding.groundingChunks) {
        const uri = chunk?.web?.uri;
        if (uri && !seen.has(uri)) {
          seen.add(uri);
          sources.push({ uri, title: chunk?.web?.title || uri });
        }
      }
    }

    return res.status(200).json({
      text: response.text || '',
      sources,
      searchEntryPointHtml: grounding?.searchEntryPoint?.renderedContent || null,
      model
    });
  } catch (err) {
    console.error('Gemini API error:', err);
    const status = Number.isInteger(err?.status) ? err.status : 500;
    return res.status(status).json({
      error: err?.message || 'Failed to get response from Gemini API.'
    });
  }
}
