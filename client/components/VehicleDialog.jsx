import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '../lib/catalog.js';
import { Modal } from './Modal.jsx';

const initialForm = {
  make: '',
  model: '',
  category: 'Coupe',
  year: new Date().getFullYear(),
  price: '',
  quantity: '',
  imageUrl: '',
  description: '',
};

/**
 * Modal dialog for creating and updating vehicles.
 */
export function VehicleDialog({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState(vehicle ? { ...vehicle } : initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const update = (key, value) => setForm((curr) => ({ ...curr, [key]: value }));

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      await onSave({
        ...form,
        year: Number(form.year),
        price: Number(form.price),
        quantity: Number(form.quantity),
      });
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      title={vehicle ? 'Edit vehicle.' : 'Add a vehicle.'}
      subtitle="Keep your showroom details precise and inviting."
      onClose={onClose}
      width="wide"
    >
      <form onSubmit={submit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="field-label">
          Make
          <input
            required
            maxLength={80}
            className="field-input"
            value={form.make}
            onChange={(e) => update('make', e.target.value)}
            placeholder="e.g. Aurelia"
          />
        </label>
        <label className="field-label">
          Model
          <input
            required
            maxLength={80}
            className="field-input"
            value={form.model}
            onChange={(e) => update('model', e.target.value)}
            placeholder="e.g. GT S"
          />
        </label>
        <label className="field-label">
          Category
          <select
            className="field-input cursor-pointer"
            value={form.category}
            onChange={(e) => update('category', e.target.value)}
          >
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Model year
          <input
            required
            type="number"
            min={1900}
            max={new Date().getFullYear() + 2}
            className="field-input"
            value={form.year}
            onChange={(e) => update('year', e.target.value)}
          />
        </label>
        <label className="field-label">
          Price (USD)
          <input
            required
            type="number"
            min={0}
            step="0.01"
            className="field-input"
            value={form.price}
            onChange={(e) => update('price', e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="field-label">
          Quantity in stock
          <input
            required
            type="number"
            min={0}
            step={1}
            className="field-input"
            value={form.quantity}
            onChange={(e) => update('quantity', e.target.value)}
            placeholder="0"
          />
        </label>
        <label className="field-label sm:col-span-2">
          Image URL
          <input
            type="text"
            className="field-input"
            value={form.imageUrl}
            onChange={(e) => update('imageUrl', e.target.value)}
            placeholder="https://example.com/vehicle.jpg or /coupe.webp"
          />
        </label>
        <label className="field-label sm:col-span-2">
          Description
          <textarea
            rows={3}
            maxLength={2000}
            className="field-input resize-y"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            placeholder="What makes this vehicle special?"
          />
        </label>

        {error && (
          <p className="sm:col-span-2 border border-rose-200 bg-rose p-2.5 text-xs text-danger" role="alert">
            {error}
          </p>
        )}

        <div className="sm:col-span-2 mt-2 flex items-center justify-end gap-3">
          <button type="button" className="btn btn-light" onClick={onClose}>
            Cancel
          </button>
          <button disabled={busy} type="submit" className="btn btn-dark">
            {busy ? 'Saving…' : vehicle ? 'Save changes' : 'Add vehicle'} <ArrowRight size={17} />
          </button>
        </div>
      </form>
    </Modal>
  );
}
