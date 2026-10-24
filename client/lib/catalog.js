/** Shared catalogue constants and pure helpers for the frontend. */

export const CATEGORIES = ['Coupe', 'SUV', 'Electric', 'Sedan', 'Convertible', 'Other'];
export const ALL_CATEGORIES = 'All vehicles';
export const EMPTY_FILTERS = { q: '', category: ALL_CATEGORIES, minPrice: '', maxPrice: '' };

/** Shown to signed-out visitors (vehicle endpoints require a token). Mirrors the server seed. */
export const PREVIEW_VEHICLES = [
  { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, imageUrl: '/coupe.webp', description: 'Sculpted lines and exhilarating performance.' },
  { id: 2, make: 'Northline', model: 'Summit X', category: 'SUV', year: 2025, price: 76200, quantity: 5, imageUrl: '/suv.webp', description: 'Space, presence, and a composed drive.' },
  { id: 3, make: 'Eon', model: 'Lucent', category: 'Electric', year: 2026, price: 68500, quantity: 2, imageUrl: '/sedan.webp', description: 'Effortless electric travel, thoughtfully designed.' },
  { id: 4, make: 'Solenne', model: 'R8', category: 'Convertible', year: 2026, price: 112500, quantity: 2, imageUrl: '', description: 'Open-air performance with an effortless sense of occasion.' },
  { id: 5, make: 'Vesper', model: 'S2', category: 'Sedan', year: 2026, price: 78500, quantity: 4, imageUrl: '', description: 'A grand touring sedan shaped around every journey.' },
  { id: 6, make: 'Meridian', model: 'LX', category: 'SUV', year: 2026, price: 96300, quantity: 3, imageUrl: '', description: 'A generous cabin and quiet confidence in every season.' },
  { id: 7, make: 'Eon', model: 'Arc', category: 'Electric', year: 2026, price: 82400, quantity: 3, imageUrl: '', description: 'Electric energy with the soul of a driver’s car.' },
];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
export const formatPrice = (value) => currency.format(value);

/** Builds the query string for GET /api/vehicles/search from UI filters. */
export function toSearchParams(filters) {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.category !== ALL_CATEGORIES) params.set('category', filters.category);
  if (filters.minPrice !== '') params.set('minPrice', filters.minPrice);
  if (filters.maxPrice !== '') params.set('maxPrice', filters.maxPrice);
  return params.toString();
}

/** Client-side equivalent of the server search, used for the signed-out preview. */
export function filterVehicles(vehicles, filters) {
  const query = filters.q.trim().toLowerCase();
  return vehicles.filter((vehicle) =>
    `${vehicle.make} ${vehicle.model}`.toLowerCase().includes(query)
    && (filters.category === ALL_CATEGORIES || vehicle.category === filters.category)
    && (filters.minPrice === '' || vehicle.price >= Number(filters.minPrice))
    && (filters.maxPrice === '' || vehicle.price <= Number(filters.maxPrice)));
}
