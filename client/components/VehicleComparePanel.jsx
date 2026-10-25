import React from 'react';
import { ArrowRight, X } from 'lucide-react';
import { formatPrice } from '../lib/catalog.js';
import { PAINT_OPTIONS, configuredPrice } from '../lib/configuration.js';

const Model = React.lazy(() => import('./VehicleModel3D.jsx').then(({ VehicleModel3D }) => ({ default: VehicleModel3D })));

export function VehicleComparePanel({ items, onClose, onRemove, onUpdate, onDesign }) {
  return <div className="compare-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="compare-panel" role="dialog" aria-modal="true" aria-label="Compare vehicles">
      <div className="compare-header"><div><span>THE COLLECTION</span><h2>Compare your cars.</h2><p>Prices reflect the options shown below. Availability may change.</p></div><button type="button" onClick={onClose} aria-label="Close comparison"><X size={23}/></button></div>
      <div className="compare-grid">{items.map(({ vehicle, selection }) => <article key={vehicle.id} className="compare-car">
        <button type="button" className="compare-remove" onClick={() => onRemove(vehicle.id)} aria-label={`Remove ${vehicle.make} ${vehicle.model}`}><X size={16}/></button>
        <div className="compare-model"><React.Suspense fallback={<span>Loading model…</span>}><Model vehicle={vehicle} color={PAINT_OPTIONS[selection.paint].value} view="front" interior={selection.interior} trim={selection.trim} className="w-full h-full"/></React.Suspense></div>
        <h3>{vehicle.make} <em>{vehicle.model}</em></h3>
        <p className="compare-description">{vehicle.description}</p>
        <dl><div><dt>Body style</dt><dd>{vehicle.category}</dd></div><div><dt>Model year</dt><dd>{vehicle.year}</dd></div><div><dt>Availability</dt><dd>{vehicle.quantity} available</dd></div><div><dt>Starting price</dt><dd>{formatPrice(vehicle.price)}</dd></div></dl>
        <div className="compare-option"><label htmlFor={`compare-edition-${vehicle.id}`}>Edition</label><select id={`compare-edition-${vehicle.id}`} value={selection.trim} onChange={(event) => onUpdate(vehicle.id, { trim: Number(event.target.value) })}><option value={0}>Signature</option><option value={1}>Performance +$4,500</option></select></div>
        <div className="compare-option"><label htmlFor={`compare-paint-${vehicle.id}`}>Paint</label><select id={`compare-paint-${vehicle.id}`} value={selection.paint} onChange={(event) => onUpdate(vehicle.id, { paint: Number(event.target.value) })}>{PAINT_OPTIONS.map((paint, i) => <option key={paint.name} value={i}>{paint.name}{paint.price ? ` +${formatPrice(paint.price)}` : ''}</option>)}</select></div>
        <div className="compare-option"><label htmlFor={`compare-interior-${vehicle.id}`}>Interior</label><select id={`compare-interior-${vehicle.id}`} value={selection.interior} onChange={(event) => onUpdate(vehicle.id, { interior: Number(event.target.value) })}><option value={0}>Slate</option><option value={1}>Ivory +$1,500</option></select></div>
        <div className="compare-total"><span>Configured price</span><strong>{formatPrice(configuredPrice(vehicle, selection))}</strong></div>
        <button type="button" className="compare-design" onClick={() => { onClose(); onDesign(vehicle); }}>Design this car <ArrowRight size={17}/></button>
      </article>)}</div>
    </section>
  </div>;
}
