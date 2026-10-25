# Atelier Motors assistant knowledge base

The public assistant answers only from `server/companyKnowledge.js` and current vehicle records in the showroom database. It makes no external AI request and needs no API key. If it cannot match a company or vehicle fact, it declines the question.

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
