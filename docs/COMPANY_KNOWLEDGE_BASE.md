# Atelier Motors assistant knowledge base

The public showroom assistant operates with strict policy grounding in a resilient dual mode:
- **Local Engine (Default):** Evaluates queries purely against `server/companyKnowledge.js` and live vehicle records in the database. Operates completely offline with zero external network requests and needs no API key.
- **Groq Cloud LLM (Optional):** When `GROQ_API_KEY` is configured, queries route to `llama-3.3-70b-versatile` over RAG live inventory and approved policies. If any external call encounters rate limits, timeouts, or network failures, the server automatically falls back to the deterministic local engine.

In both modes, out-of-scope trivia and unauthorized policy inventions are politely declined.

## Company facts

- Atelier Motors is a digital showroom for a curated vehicle collection.
- Visitors can browse, compare, and configure cars before signing in.
- The design page offers Signature and Performance editions, six exterior colors, and Slate or Ivory interiors. Displayed option prices update the configured total.
- A recorded purchase decreases showroom inventory. The website does not take card payment; an Atelier Motors team member confirms payment and delivery details.
- The optional delivery ZIP is a preference. No delivery fee, timeline, physical address, phone number, opening hours, financing terms, or leasing terms are published.
- The 3D cars are licensed concept visualizations of real vehicle designs. Each page includes attribution. They are not manufactured Atelier Motors vehicles.

## Vehicle facts

Current model names, prices, categories, descriptions, and availability come from the live vehicle database, so the assistant does not keep a stale copy of mutable inventory data. The seed catalogue is defined in `server/seed.js`.

## Scope

The assistant returns a company fact, a live inventory fact, or a scope reminder. It does not answer general knowledge questions, give third-party car advice, invent unpublished policies, or follow instructions embedded in a question. Update the structured facts and corresponding tests whenever the site's actual policies or features change.
