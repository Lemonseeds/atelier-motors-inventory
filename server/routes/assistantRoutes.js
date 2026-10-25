import { Router } from 'express';
import { assistantBoundary, companyKnowledge } from '../companyKnowledge.js';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const normalize = (value) => String(value).toLowerCase().normalize('NFKD').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
const inText = (text, phrase) => ` ${text} `.includes(` ${normalize(phrase)} `);
const domainWords = ['atelier', 'your', 'you', 'company', 'showroom', 'test drive', 'configurator'];

function namedVehicle(text, vehicles) {
  const full = vehicles.find((vehicle) => inText(text, `${vehicle.make} ${vehicle.model}`));
  if (full) return full;
  return vehicles.find((vehicle) => inText(text, vehicle.make) && vehicles.filter((item) => item.make === vehicle.make).length === 1) || null;
}

export function formatVehicleMention(vehicles, modelQuery, fallbackName, fallbackPrice) {
  const found = vehicles.find((v) => `${v.make} ${v.model}`.toLowerCase().includes(modelQuery.toLowerCase()) || v.model.toLowerCase().includes(modelQuery.toLowerCase()));
  if (found) return `${found.make} ${found.model} (${money.format(found.price)})`;
  return `${fallbackName}${fallbackPrice ? ` (${money.format(fallbackPrice)})` : ''}`;
}

export function buildGroqSystemPrompt(vehicles) {
  const inventoryList = vehicles.map((v) =>
    `- ${v.make} ${v.model} (${v.year}): Category: ${v.category}, Starting Price: ${money.format(v.price)}, Stock: ${v.quantity} available. Description: ${v.description}`
  ).join('\n');

  const policies = companyKnowledge.map((k) =>
    `- ${k.id.toUpperCase()}: ${k.answer}`
  ).join('\n');

  const aurelia = formatVehicleMention(vehicles, 'Aurelia GT S', 'Aurelia GT S', 89400);
  const solenne = formatVehicleMention(vehicles, 'Solenne R8', 'Solenne R8', 112500);
  const summit = formatVehicleMention(vehicles, 'Northline Summit X', 'Northline Summit X', 76200);
  const meridian = formatVehicleMention(vehicles, 'Meridian LX', 'Meridian LX', 96300);
  const lucent = formatVehicleMention(vehicles, 'Eon Lucent', 'Eon Lucent', 68500);
  const arc = formatVehicleMention(vehicles, 'Eon Arc', 'Eon Arc', 82400);
  const vesper = formatVehicleMention(vehicles, 'Vesper S2', 'Vesper S2', 78500);

  return `You are the Atelier Assistant, an intelligent, poised, and articulate digital showroom concierge for Atelier Motors.

LIVE SHOWROOM INVENTORY (${vehicles.length} MODELS):
${inventoryList}

OFFICIAL COMPANY POLICIES & INFORMATION:
${policies}

STRICT CONCIERGE GUIDELINES:
1. When asked recommendation or matchmaking questions (e.g. "which car is best for me?", "what car do you recommend?", "I need a family car"):
   - Actively match on their driving priorities, lifestyle, space, or budget.
   - Summarize the top matching choices from our live catalog by lifestyle:
     • Grand touring & performance: ${aurelia} or convertible ${solenne}
     • Spacious luxury SUV & family: ${summit} or ${meridian}
     • Advanced electric driving: ${lucent} sedan or ${arc} coupe
     • Understated executive sedan: ${vesper}
2. Keep answers concise, helpful, and elegant (2–4 sentences or clean bullet points). Do not write huge walls of text.
3. Ground all specifications, prices, and stock numbers strictly in the LIVE INVENTORY above. Never invent cars or specs.
4. If asked about financing, delivery terms, or physical showroom addresses, cite our official policies above (e.g. an Atelier Motors team member confirms payment and delivery directly; online card payments are not processed).
5. If a question is completely unrelated to Atelier Motors, vehicles, or the buying/customizing process (e.g. general trivia, coding, other topics), politely decline with: "${assistantBoundary}".
6. CONVERSATION CONTEXT & FOLLOW-UPS:
   - Always maintain conversational context from preceding turns in the chat history.
   - If the user provides a brief answer or preference (e.g. "i want it for speed", "performance", "which ones??", "family car", "budget under 90k"), immediately present the concrete matching models from our live inventory with exact prices and stock.
   - Never get stuck in an endless loop asking clarifying questions if the user has already expressed their priority. Name the cars directly!`;
}

export async function askGroq({
  question,
  vehicles,
  apiKey,
  model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
  history = [],
  fetchFn = globalThis.fetch,
}) {
  const systemPrompt = buildGroqSystemPrompt(vehicles);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);

  const formattedMessages = [
    { role: 'system', content: systemPrompt },
    ...history.slice(-8).map((h) => ({
      role: h.role === 'assistant' ? 'assistant' : 'user',
      content: String(h.content || h.text || '').slice(0, 500),
    })),
    { role: 'user', content: question },
  ];

  try {
    const response = await fetchFn('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: formattedMessages,
        temperature: 0.4,
        max_completion_tokens: 800,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`Groq API error ${response.status}: ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error('Empty response from Groq');
    return content;
  } finally {
    clearTimeout(timeout);
  }
}

export function localAnswer(question, vehicles) {
  const text = normalize(question);
  const car = namedVehicle(text, vehicles);
  const inDomain = Boolean(car) ||
    domainWords.some((word) => inText(text, word)) ||
    /\b(?:car|cars|vehicle|vehicles|model|models|suv|suvs|coupe|coupes|sedan|sedans|convertible|convertibles|ev|electric|hybrid)\b/.test(text) ||
    /\b(?:recommend|suggest|recommendation|advice|choose|pick|best|speed|fast|sport|sports|performance|track|quick|acceleration)\b/.test(text) ||
    /delivery zip|family|spacious|which ones/.test(text);
  if (!inDomain) return { answer: assistantBoundary, source: null };
  if (/ignore (all |the )?(previous|instructions)|jailbreak|system prompt/.test(text)) return { answer: assistantBoundary, source: null };

  const aurelia = formatVehicleMention(vehicles, 'Aurelia GT S', 'Aurelia GT S', 89400);
  const solenne = formatVehicleMention(vehicles, 'Solenne R8', 'Solenne R8', 112500);
  const summit = formatVehicleMention(vehicles, 'Northline Summit X', 'Northline Summit X', 76200);
  const meridian = formatVehicleMention(vehicles, 'Meridian LX', 'Meridian LX', 96300);
  const lucent = formatVehicleMention(vehicles, 'Eon Lucent', 'Eon Lucent', 68500);
  const arc = formatVehicleMention(vehicles, 'Eon Arc', 'Eon Arc', 82400);
  const vesper = formatVehicleMention(vehicles, 'Vesper S2', 'Vesper S2', 78500);

  if (/(?:which|what) (?:car|vehicle|model) (?:would be |is )?(?:the )?best|recommend|suggest|what should i (?:buy|choose|get)|help me (?:choose|pick|find)/.test(text)) {
    return {
      answer: `The best car depends on your driving style and needs:\n• For everyday space & family versatility: ${summit} or ${meridian}\n• For electric innovation: ${lucent} or ${arc}\n• For grand touring & open-road exhilaration: ${aurelia} or convertible ${solenne}\n• For executive composure: ${vesper}\n\nTell me your preferred body style, budget, or daily driving needs to narrow it down.`,
      source: 'recommendation',
    };
  }
  if (/speed|fast|sport|sports|performance|track|acceleration|quick/.test(text)) {
    return {
      answer: `For pure speed and exhilarating performance, our standout model is the ${aurelia}, an agile twin-turbo coupe engineered for open-road response, alongside the open-air ${solenne}.`,
      source: 'recommendation',
    };
  }
  if (/which ones|which one|what are they|tell me more/.test(text)) {
    return {
      answer: `Our showroom offers ${vehicles.length} distinguished models across performance coupes (Aurelia GT S, Solenne R8), luxury SUVs (Northline Summit X, Meridian LX), electric vehicles (Eon Lucent, Eon Arc), and executive sedans (Vesper S2). Tell me your preferred style or budget to explore further.`,
      source: 'recommendation',
    };
  }
  if (/family|kids|spacious|space|cargo|luggage|road trip/.test(text)) {
    return {
      answer: `For family comfort and cargo space, we recommend our two luxury SUVs: the ${summit} with commanding perspective and generous room, or the ${meridian} offering refined versatility with an expansive cabin.`,
      source: 'recommendation',
    };
  }
  if (/electric|ev|battery|clean energy|eco/.test(text)) {
    return {
      answer: `For electric driving, explore the ${lucent} for a quiet, fluid luxury sedan experience, or the ${arc} for responsive all-electric coupe performance.`,
      source: 'recommendation',
    };
  }

  if (/price|cost|how much|starting at/.test(text)) {
    if (car) return { answer: `The ${car.make} ${car.model} starts at ${money.format(car.price)}. Paint, interior, and edition choices can change the configured price.`, source: 'live-inventory' };
    const ordered = [...vehicles].sort((a, b) => a.price - b.price);
    return ordered.length ? { answer: `Current starting prices range from ${money.format(ordered[0].price)} for the ${ordered[0].make} ${ordered[0].model} to ${money.format(ordered.at(-1).price)} for the ${ordered.at(-1).make} ${ordered.at(-1).model}. Open a design page for option pricing.`, source: 'live-inventory' } : { answer: assistantBoundary, source: null };
  }
  if (/stock|available|availability|in inventory|sold out/.test(text)) {
    if (car) return { answer: `${car.quantity} ${car.make} ${car.model} ${car.quantity === 1 ? 'is' : 'are'} currently listed as available. Availability can change after a purchase.`, source: 'live-inventory' };
    const available = vehicles.filter((vehicle) => vehicle.quantity > 0);
    return { answer: `${available.length} models currently have stock in the showroom. Open the collection for each car's live availability.`, source: 'live-inventory' };
  }
  if (car && /spec|category|type|year|describe|tell me|about|what is|which/.test(text)) {
    return { answer: `The ${car.make} ${car.model} is a ${car.year} ${car.category.toLowerCase()} starting at ${money.format(car.price)}. ${car.description} ${car.quantity} currently listed as available.`, source: 'live-inventory' };
  }
  if (car && text.split(' ').length <= 5) {
    return { answer: `The ${car.make} ${car.model} is a ${car.year} ${car.category.toLowerCase()} starting at ${money.format(car.price)}. ${car.description}`, source: 'live-inventory' };
  }

  const matched = companyKnowledge
    .map((entry) => ({ entry, score: Math.max(...entry.prompts.map((prompt) => inText(text, prompt) ? normalize(prompt).split(' ').length + 1 : 0)) }))
    .sort((a, b) => b.score - a.score)[0];
  if (matched?.score) return { answer: matched.entry.answer, source: matched.entry.id };
  return { answer: assistantBoundary, source: null };
}

/** Public, bounded chat route. Uses Groq Cloud LLM when configured, with local smart recommendation fallback. */
export function createAssistantRouter({ vehicles, groqApiKey = process.env.GROQ_API_KEY, groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile', fetchFn = globalThis.fetch }) {
  const router = Router();
  const hits = new Map();
  router.post('/', async (req, res) => {
    const question = req.body?.message;
    if (typeof question !== 'string' || question.trim().length < 2 || question.length > 300) return res.status(400).json({ error: 'Enter a question of 2–300 characters.' });
    const rawHistory = Array.isArray(req.body?.history) ? req.body.history : [];
    const history = rawHistory
      .slice(-8)
      .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && (typeof h.content === 'string' || typeof h.text === 'string'))
      .map((h) => ({ role: h.role, content: String(h.content || h.text || '').slice(0, 500) }));

    const key = req.ip || 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((time) => now - time < 60_000);
    if (recent.length >= 20) return res.status(429).json({ error: 'Please wait a minute before asking more questions.' });
    recent.push(now);
    hits.set(key, recent);
    const inventory = await vehicles.list();

    const apiKey = groqApiKey || process.env.GROQ_API_KEY;
    if (apiKey) {
      try {
        const groqAnswer = await askGroq({ question, vehicles: inventory, apiKey, model: groqModel, history, fetchFn });
        return res.json({ answer: groqAnswer, source: 'groq' });
      } catch (err) {
        console.warn('Groq assistant fallback:', err.message);
      }
    }

    const result = localAnswer(question, inventory);
    res.json({ answer: result.answer, source: result.source });
  });
  return router;
}

