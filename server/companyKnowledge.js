/** Approved public facts for the Atelier Motors assistant. Keep policies here, not in prompts. */
export const companyKnowledge = [
  {
    id: 'about',
    prompts: ['who are you', 'what is atelier', 'about atelier', 'about the company', 'what do you do', 'your company'],
    answer: 'Atelier Motors is a digital showroom for a curated collection of distinctive vehicles. You can explore the cars, compare their details, configure a look, and make a selection through the website.',
  },
  {
    id: 'catalog',
    prompts: ['cars', 'vehicles', 'models', 'collection', 'sell', 'available cars', 'what do you have'],
    answer: 'Our collection includes the Aurelia GT S, Northline Summit X, Eon Lucent, Solenne R8, Vesper S2, Meridian LX, and Eon Arc. Open Vehicles in the menu to explore each model.',
  },
  {
    id: 'configure',
    prompts: ['configure', 'customize', 'customise', 'design', 'color', 'colour', 'paint', 'interior', 'edition', 'trim'],
    answer: 'Each design page lets you choose Signature or Performance, six exterior colors, and a Slate or Ivory interior. You can rotate the 3D model and switch between front, side, rear, and cabin views. The configured price updates as you choose options.',
  },
  {
    id: 'purchase',
    prompts: ['buy', 'purchase', 'order', 'checkout', 'payment', 'reserve'],
    answer: 'Choose a car and open its design page. Sign in before confirming your selection. The site updates available inventory when a purchase is recorded; it does not collect a card payment online. An Atelier Motors team member confirms delivery and payment details.',
  },
  {
    id: 'account',
    prompts: ['account', 'register', 'sign in', 'login', 'log in'],
    answer: 'You can browse the collection and use the configurator without an account. Create an account or sign in when you are ready to make a selection.',
  },
  {
    id: 'delivery',
    prompts: ['delivery', 'zip', 'shipping', 'pickup'],
    answer: 'You can enter an optional delivery ZIP on a design page. Delivery and payment arrangements are confirmed directly with an Atelier Motors team member. The website does not publish a delivery fee or timeline.',
  },
  {
    id: 'finance',
    prompts: ['financing', 'finance', 'leasing', 'lease', 'loan'],
    answer: 'Atelier Motors has not published financing or leasing terms on this website. An Atelier Motors team member confirms any available payment arrangements directly.',
  },
  {
    id: 'imagery',
    prompts: ['3d', 'model images', 'visualization', 'visualisation', 'real car', 'badge', 'photo'],
    answer: 'The interactive 3D cars are concept visualizations adapted from licensed real-vehicle models. Each page credits its source. They illustrate customization and do not represent a manufactured Atelier Motors vehicle.',
  },
  {
    id: 'contact',
    prompts: ['contact', 'phone', 'email', 'address', 'location', 'hours', 'opening'],
    answer: 'The website does not currently publish a phone number, showroom address, or opening hours. I cannot provide a contact detail that Atelier Motors has not listed.',
  },
];

export const assistantBoundary = 'I can answer questions about Atelier Motors and its vehicles only. Try asking about a model, price, availability, customization, or buying process.';
