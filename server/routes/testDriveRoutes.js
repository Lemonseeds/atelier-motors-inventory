import { Router } from 'express';

const windows = new Set(['Morning', 'Afternoon', 'Evening']);
const rowToRequest = (row) => row && ({
  id: Number(row.id),
  userId: Number(row.user_id),
  vehicleId: Number(row.vehicle_id),
  vehicleName: `${row.make} ${row.model}`,
  customerName: row.customer_name,
  customerEmail: row.customer_email,
  preferredDate: row.preferred_date,
  timeWindow: row.time_window,
  experienceType: row.experience_type || 'Showroom',
  location: row.location || 'Atelier Flagship',
  status: row.status,
  createdAt: row.created_at,
});

export function createTestDriveRouter({ db, vehicles, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const admin = req.user.role === 'admin';
    const rows = await db.prepare(`SELECT t.*, v.make, v.model, u.name AS customer_name, u.email AS customer_email FROM test_drives t JOIN vehicles v ON v.id = t.vehicle_id JOIN users u ON u.id = t.user_id ${admin ? '' : 'WHERE t.user_id = ?'} ORDER BY t.created_at DESC, t.id DESC`).all(...(admin ? [] : [req.user.id]));
    res.json({ requests: rows.map(rowToRequest) });
  });

  router.post('/', async (req, res) => {
    const { vehicleId, preferredDate, timeWindow, experienceType = 'Showroom', location = 'Atelier Flagship' } = req.body || {};
    if (!Number.isSafeInteger(vehicleId) || vehicleId < 1 || !/^\d{4}-\d{2}-\d{2}$/.test(preferredDate || '') || !windows.has(timeWindow)) return res.status(400).json({ error: 'Choose a vehicle, date, and time window.' });
    const date = new Date(`${preferredDate}T00:00:00Z`);
    const today = new Date();
    const first = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() + 1));
    const last = new Date(first.getTime() + 90 * 86400000);
    if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== preferredDate || date < first || date > last) return res.status(400).json({ error: 'Choose a valid date within the next 90 days, starting tomorrow.' });
    const vehicle = await vehicles.findById(vehicleId);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found.' });
    const row = await db.prepare('INSERT INTO test_drives (user_id, vehicle_id, preferred_date, time_window, experience_type, location) VALUES (?, ?, ?, ?, ?, ?) RETURNING *').get(req.user.id, vehicleId, preferredDate, timeWindow, experienceType, location);
    res.status(201).json({ request: rowToRequest({ ...row, make: vehicle.make, model: vehicle.model, customer_name: req.user.name, customer_email: req.user.email }) });
  });

  router.patch('/:id', async (req, res) => {
    const id = Number(req.params.id);
    const status = req.body?.status;
    if (!Number.isSafeInteger(id) || id < 1 || !['confirmed', 'cancelled'].includes(status)) return res.status(400).json({ error: 'Invalid request update.' });
    const existing = await db.prepare('SELECT * FROM test_drives WHERE id = ?').get(id);
    if (!existing) return res.status(404).json({ error: 'Test-drive request not found.' });
    if (status === 'confirmed' && req.user.role !== 'admin') return res.status(403).json({ error: 'Only an admin can confirm a test drive.' });
    if (status === 'cancelled' && req.user.role !== 'admin' && Number(existing.user_id) !== req.user.id) return res.status(403).json({ error: 'This is not your request.' });
    await db.prepare('UPDATE test_drives SET status = ? WHERE id = ?').run(status, id);
    const row = await db.prepare('SELECT t.*, v.make, v.model, u.name AS customer_name, u.email AS customer_email FROM test_drives t JOIN vehicles v ON v.id = t.vehicle_id JOIN users u ON u.id = t.user_id WHERE t.id = ?').get(id);
    res.json({ request: rowToRequest(row) });
  });
  return router;
}
