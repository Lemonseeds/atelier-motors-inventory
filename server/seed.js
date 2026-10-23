import { createVehicleRepository } from './repositories/vehicleRepository.js';

/** Showroom vehicles inserted into an empty database so the app is never blank. */
export const sampleVehicles = [
  { make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, imageUrl: '/coupe.webp', description: 'Sculpted lines and exhilarating performance, crafted for the open road.' },
  { make: 'Northline', model: 'Summit X', category: 'SUV', year: 2025, price: 76200, quantity: 5, imageUrl: '/suv.webp', description: 'Space, presence, and a composed drive for every journey.' },
  { make: 'Eon', model: 'Lucent', category: 'Electric', year: 2026, price: 68500, quantity: 2, imageUrl: '/sedan.webp', description: 'Effortless electric travel with understated design.' },
];

/** Seeds sample vehicles only when the inventory is empty (safe to call on every start). */
export async function seedVehicles(db) {
  const vehicles = createVehicleRepository(db);
  if (await vehicles.count() > 0) return;
  for (const vehicle of sampleVehicles) await vehicles.create(vehicle, null);
}
