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

function localAnswer(question, vehicles) {
  const text = normalize(question);
  const car = namedVehicle(text, vehicles);
  const inDomain = Boolean(car) || domainWords.some((word) => inText(text, word)) || /(?:what|which|available|sell|offer) (?:cars|vehicles|models)|(?:buy|purchase|customize|customise|configure|compare) (?:a |the |my )?(?:car|vehicle)|delivery zip/.test(text);
  if (!inDomain) return { answer: assistantBoundary, source: null };
  if (/ignore (all |the )?(previous|instructions)|jailbreak|system prompt/.test(text)) return { answer: assistantBoundary, source: null };

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
/** Public, bounded chat route. Only approved knowledge and live inventory facts are returned. */
export function createAssistantRouter({ vehicles }) {
  const router = Router();
  const hits = new Map();
  router.post('/', async (req, res) => {
    const question = req.body?.message;
    if (typeof question !== 'string' || question.trim().length < 2 || question.length > 300) return res.status(400).json({ error: 'Enter a question of 2–300 characters.' });
    const key = req.ip || 'unknown';
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((time) => now - time < 60_000);
    if (recent.length >= 20) return res.status(429).json({ error: 'Please wait a minute before asking more questions.' });
    recent.push(now);
    hits.set(key, recent);
    const inventory = await vehicles.list();
    const result = localAnswer(question, inventory);
    res.json({ answer: result.answer, source: result.source });
  });
  return router;
}
