# AI assistant placement strategy

## Recommendation

Add a small, user-opened **Atelier Guide** at the bottom right of the showroom. Keep it closed by default. Its strongest context is the collection and vehicle details dialog, where visitors are deciding what to explore or comparing cars. On narrow screens, open it as a bottom sheet so it does not cover the inventory cards.

## Useful moments

| Location | Example invitation | What the assistant should do |
| --- | --- | --- |
| Collection toolbar | “Help me find a car” | Turn a natural-language preference into the existing make, category, and price filters; show matching live listings. |
| Vehicle details dialog | “Ask about this vehicle” | Explain listing fields, answer questions about that specific car, and compare it with another current listing. |
| About / experience | “How does this work?” | Answer the three published FAQs and explain the account and selection flow. |
| Empty search results | “Try a broader search” | Suggest a specific filter change and apply it only after the visitor chooses it. |

## Interaction design

1. Use the same blue-gray palette and restrained translucent panels as the rest of the site. The launch button should be visible but smaller than the primary vehicle actions.
2. Open with three short prompts: “Find an SUV under $80k”, “Compare two cars”, and “How does selection work?”. Offer a persistent close button and keyboard focus management.
3. Show listing cards with price and stock inside the conversation. Each card links to its real vehicle details. Make stock information explicitly live only when it comes from the API.
4. Keep the assistant out of the purchase confirmation flow. It may guide a visitor to the existing button, but cannot purchase, restock, edit, or delete on their behalf.

## Delivery phases

**Phase 1 — Useful without model cost:** Build a guided assistant using the current FAQ and deterministic inventory search. This validates placement, prompts, and accessibility on the free hosting setup.

**Phase 2 — Grounded AI answers:** Add a server-side `/api/assistant` endpoint. Give the model only the published site guidance and selected, current inventory records. Translate search intent into validated existing filters. Keep the model provider key on the server; never ship it in React. Add rate limits, output length limits, request timeouts, and a fixed budget before enabling a paid provider.

**Phase 3 — Measure and improve:** Track only aggregate interactions such as opens, suggested prompt clicks, listing views, and useful-answer feedback. Do not store chat text by default. Use results to decide whether the assistant genuinely helps visitors find vehicles.

## Guardrails and success criteria

- Clearly identify the feature as an AI assistant and distinguish generated guidance from live inventory fields.
- Answer from known vehicle records and site guidance; admit when information such as financing, inspection, warranty, payment, or delivery is unavailable. Do not invent specifications or company policies.
- Require normal authentication for live inventory results if the API continues to protect vehicle endpoints. Do not expose admin data or actions.
- Start with a keyboard-accessible drawer, readable contrast, and a mobile bottom sheet. Avoid automatic popups.
- Consider the feature successful when visitors can find a relevant listing faster and still understand that the app records inventory selection, not a real payment.
