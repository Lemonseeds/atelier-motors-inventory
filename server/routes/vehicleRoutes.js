import { Router } from 'express';
import { parseVehicleId, requireAdmin } from '../middleware.js';
import { parseSearchFilters, validateRestock, validateVehicle } from '../validation.js';

/**
 * Vehicle and inventory routes. Every route requires authentication;
 * delete and restock additionally require the admin role.
 */
export function createVehicleRouter({ vehicles, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  async function listVehicles(req, res) {
    const { value: filters, error } = parseSearchFilters(req.query);
    if (error) return res.status(400).json({ error });
    res.json({ vehicles: await vehicles.list(filters) });
  }

  router.get('/', listVehicles);
  router.get('/search', listVehicles);

  router.post('/', async (req, res) => {
    const { value, error } = validateVehicle(req.body);
    if (error) return res.status(400).json({ error });
    res.status(201).json({ vehicle: await vehicles.create(value, req.user.id) });
  });

  // Admins may edit anything; other users may edit only listings they created.
  router.put('/:id', parseVehicleId, async (req, res) => {
    const existing = await vehicles.findById(req.vehicleId);
    if (!existing) return res.status(404).json({ error: 'Vehicle not found.' });
    if (req.user.role !== 'admin' && req.user.id !== existing.createdBy) {
      return res.status(403).json({ error: 'You can only edit vehicles you added.' });
    }
    const { value, error } = validateVehicle(req.body, { partial: true });
    if (error) return res.status(400).json({ error });
    res.json({ vehicle: await vehicles.update(existing.id, value) });
  });

  router.delete('/:id', requireAdmin, parseVehicleId, async (req, res) => {
    if (!await vehicles.remove(req.vehicleId)) return res.status(404).json({ error: 'Vehicle not found.' });
    res.status(204).end();
  });

  router.post('/:id/purchase', parseVehicleId, async (req, res) => {
    const vehicle = await vehicles.purchase(req.vehicleId);
    if (vehicle) return res.json({ vehicle });
    const exists = await vehicles.findById(req.vehicleId);
    res.status(exists ? 409 : 404).json({ error: exists ? 'This vehicle is sold out.' : 'Vehicle not found.' });
  });

  router.post('/:id/restock', requireAdmin, parseVehicleId, async (req, res) => {
    const { value: quantity, error } = validateRestock(req.body?.quantity);
    if (error) return res.status(400).json({ error });
    const vehicle = await vehicles.restock(req.vehicleId, quantity);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    res.json({ vehicle });
  });

  return router;
}
