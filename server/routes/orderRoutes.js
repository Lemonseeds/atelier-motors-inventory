import { Router } from 'express';
import { requireAdmin } from '../middleware.js';

export const ORDER_STAGES = [
  { key: 'confirmed', label: 'Order Confirmed', description: 'Bespoke allocation secured and verified.' },
  { key: 'handcrafting', label: 'Handcrafted Assembly', description: 'Paint finish and interior tailoring in progress.' },
  { key: 'inspection', label: '150-Point Inspection', description: 'Atelier master technician mechanical certification.' },
  { key: 'transit', label: 'En Route in Enclosed Transport', description: 'Climate-controlled white-glove transport in transit.' },
  { key: 'delivered', label: 'Delivered to Owner', description: 'Private handover completed.' },
];

export function createOrderRouter({ db, requireAuth }) {
  const router = Router();
  router.use(requireAuth);

  router.get('/', async (req, res) => {
    const admin = req.user.role === 'admin';
    const rows = await db.prepare(`
      SELECT o.*, v.make, v.model, v.category, v.year, v.image_url, v.description,
             u.name AS customer_name, u.email AS customer_email
      FROM orders o
      JOIN vehicles v ON v.id = o.vehicle_id
      JOIN users u ON u.id = o.user_id
      ${admin ? '' : 'WHERE o.user_id = ?'}
      ORDER BY o.created_at DESC, o.id DESC
    `).all(...(admin ? [] : [req.user.id]));

    res.json({
      orders: rows.map((r) => {
        let config = {};
        try { config = JSON.parse(r.configuration || '{}'); } catch {}

        return {
          id: Number(r.id),
          userId: Number(r.user_id),
          vehicleId: Number(r.vehicle_id),
          vin: r.vin,
          status: r.status,
          configuration: config,
          totalPrice: Number(r.total_price),
          deliveryAddress: r.delivery_address || '',
          estimatedDelivery: r.estimated_delivery,
          createdAt: r.created_at,
          vehicle: {
            id: Number(r.vehicle_id),
            make: r.make,
            model: r.model,
            category: r.category,
            year: Number(r.year),
            imageUrl: r.image_url,
            description: r.description,
          },
          customerName: r.customer_name,
          customerEmail: r.customer_email,
        };
      }),
    });
  });

  router.patch('/:id/status', requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body || {};
    const validStatuses = ORDER_STAGES.map((s) => s.key);

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid order status stage.' });
    }

    const order = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!order) return res.status(404).json({ error: 'Order not found.' });

    await db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, id);
    const updated = await db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    res.json({ order: updated });
  });

  return router;
}
