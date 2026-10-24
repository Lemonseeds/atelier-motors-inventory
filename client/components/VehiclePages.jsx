import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, ShieldCheck, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/catalog.js';
import { VehicleArtwork } from './VehicleArtwork.jsx';

const palette = [
  { name: 'Glacier Silver', value: '#9faab5', price: 0 },
  { name: 'Obsidian Black', value: '#272d38', price: 1200 },
  { name: 'Pearl White', value: '#d9d9ce', price: 1200 },
  { name: 'Carmine Red', value: '#a43134', price: 1800 },
  { name: 'Midnight Blue', value: '#29486c', price: 1800 },
  { name: 'Forest Green', value: '#355d50', price: 1800 },
];
const views = [
  { key: 'front', label: 'Front view' },
  { key: 'side', label: 'Side profile' },
  { key: 'rear', label: 'Rear view' },
  { key: 'interior', label: 'Interior' },
];
const stories = {
  'Aurelia GT S': { line: 'Designed to make every road feel extraordinary.', detail: 'A sculpted grand tourer with a low silhouette, confident stance, and a cabin shaped for the drive ahead.', features: ['Grand touring form', 'Driver-focused cockpit', 'Considered craftsmanship'] },
  'Northline Summit X': { line: 'Go further. Bring more of life along.', detail: 'Generous space, a commanding perspective, and composed comfort make every departure feel effortless.', features: ['Room to roam', 'Elevated perspective', 'Everyday versatility'] },
  'Eon Lucent': { line: 'The quieter way to feel everything.', detail: 'A clean electric silhouette pairs effortless response with a calm, considered interior.', features: ['Electric character', 'Quiet cabin', 'Fluid design'] },
  'Solenne R8': { line: 'The open road, completely open.', detail: 'An expressive convertible that brings the elements closer and makes each journey an occasion.', features: ['Open-air freedom', 'Athletic proportions', 'Intimate cockpit'] },
  'Vesper S2': { line: 'Elegance that keeps moving.', detail: 'A beautifully balanced sedan for people who appreciate the details between destinations.', features: ['Tailored comfort', 'Sculptural profile', 'Confident composure'] },
  'Meridian LX': { line: 'A new perspective on possibility.', detail: 'A spacious SUV with quiet presence, crafted for the places you know and the ones you have yet to discover.', features: ['Expansive cabin', 'Confident stance', 'Refined versatility'] },
  'Eon Arc': { line: 'A spark in every turn.', detail: 'Electric driving meets a distinctly personal spirit, wrapped in a sleek, purposeful form.', features: ['Electric response', 'Expressive design', 'Focused interior'] },
};
const storyFor = (vehicle) => stories[`${vehicle.make} ${vehicle.model}`] || { line: 'Made for the way you move.', detail: vehicle.description || 'Discover a distinctive addition to the Atelier Motors collection.', features: ['Thoughtful design', 'A refined interior', 'The joy of the drive'] };

export function VehicleLearnPage({ vehicle, onBack, onDesign }) {
  const story = storyFor(vehicle);
  return <main className="vehicle-learn">
    <section className="vehicle-learn-hero">
      <div className="vehicle-learn-copy">
        <button type="button" className="vehicle-back" onClick={onBack}><ArrowLeft size={17}/> The collection</button>
        <span className="vehicle-kicker">ATELIER MOTORS / {vehicle.category.toUpperCase()}</span>
        <h1>{vehicle.make} <em>{vehicle.model}</em></h1>
        <p>{story.line}</p>
        <div className="vehicle-learn-actions"><button type="button" className="vehicle-solid-button" onClick={onDesign}>Design yours <ArrowRight size={18}/></button><span>From {formatPrice(vehicle.price)}</span></div>
      </div>
      <div className="vehicle-learn-art"><VehicleArtwork vehicle={vehicle} color="#5d6c7d" className="w-full h-full" /></div>
      <span className="vehicle-learn-number">{String(vehicle.id).padStart(2, '0')} / THE COLLECTION</span>
    </section>
    <section className="vehicle-learn-story shell">
      <div><span className="vehicle-kicker">THE EXPERIENCE</span><h2>Every detail,<br/><em>considered.</em></h2></div>
      <div><p>{story.detail}</p><div className="vehicle-learn-features">{story.features.map((feature, i) => <div key={feature}><span>0{i + 1}</span><strong>{feature}</strong><ArrowRight size={17}/></div>)}</div></div>
    </section>
    <section className="vehicle-learn-gallery shell"><div className="vehicle-learn-gallery-copy"><span className="vehicle-kicker">FORM & FUNCTION</span><h2>A different angle<br/>on what moves you.</h2><p>Explore the shape of your next chapter, then make it yours.</p><button type="button" className="vehicle-text-button" onClick={onDesign}>Explore the configurator <ArrowRight size={18}/></button></div><div className="vehicle-learn-side"><VehicleArtwork vehicle={vehicle} color="#5d6c7d" view="side" className="w-full h-full"/></div></section>
    <section className="vehicle-learn-end"><span>YOUR NEXT CHAPTER STARTS HERE</span><h2>Make it yours.</h2><button type="button" className="vehicle-solid-button" onClick={onDesign}>Design {vehicle.make} {vehicle.model} <ArrowRight size={18}/></button></section>
  </main>;
}

export function VehicleDesignPage({ vehicle, onBack, onLearn, onPurchase, isAuthenticated, busy }) {
  const [angle, setAngle] = useState(0);
  const [paint, setPaint] = useState(0);
  const [trim, setTrim] = useState(0);
  const [interior, setInterior] = useState(0);
  const [details, setDetails] = useState(false);
  const [zip, setZip] = useState('');
  const total = vehicle.price + palette[paint].price + (trim ? 4500 : 0) + (interior ? 1500 : 0);

  useEffect(() => { setAngle(0); setPaint(0); setTrim(0); setInterior(0); }, [vehicle.id]);
  const advance = (delta) => setAngle((value) => (value + delta + views.length) % views.length);

  return <main className="vehicle-design">
    <div className="vehicle-design-stage">
      <div className="vehicle-design-top"><button type="button" className="vehicle-back" onClick={onBack}><ArrowLeft size={17}/> Vehicles</button><span>DESIGN YOUR {vehicle.make.toUpperCase()} {vehicle.model.toUpperCase()}</span><button type="button" onClick={onLearn}>Learn about this car <ArrowRight size={15}/></button></div>
      <div className="vehicle-design-image" key={`${vehicle.id}-${angle}`}><VehicleArtwork vehicle={vehicle} color={palette[paint].value} view={views[angle].key} className="w-full h-full"/></div>
      <div className="vehicle-design-view-label"><span>{String(angle + 1).padStart(2, '0')} / {String(views.length).padStart(2, '0')}</span><strong>{views[angle].label}</strong></div>
      <div className="vehicle-design-carousel"><button type="button" onClick={() => advance(-1)} aria-label="Previous view"><ChevronLeft size={21}/></button><div className="vehicle-design-dots" role="group" aria-label="Vehicle views">{views.map((view, i) => <button key={view.key} type="button" onClick={() => setAngle(i)} className={angle === i ? 'is-active' : ''} aria-label={`Show ${view.label}`} aria-current={angle === i ? 'true' : undefined}/>)}</div><button type="button" onClick={() => advance(1)} aria-label="Next view"><ChevronRight size={21}/></button></div>
    </div>
    <aside className="vehicle-design-options">
      <div className="vehicle-design-intro"><span className="vehicle-kicker">MAKE IT YOURS</span><h1>{vehicle.make} <em>{vehicle.model}</em></h1><p>{vehicle.year} {vehicle.category} · {vehicle.quantity > 0 ? `${vehicle.quantity} available` : 'Currently unavailable'}</p></div>
      <div className="vehicle-design-section"><div className="vehicle-design-section-title"><h2>Choose your edition</h2><span>01</span></div><div className="vehicle-choice-list">{['Signature', 'Performance'].map((name, i) => <button type="button" key={name} className={trim === i ? 'is-selected' : ''} onClick={() => setTrim(i)}><span><b>{name}</b><small>{i ? 'Sharper response and expressive detail' : 'An elegant starting point'}</small></span><strong>{i ? `+${formatPrice(4500)}` : 'Included'}</strong></button>)}</div></div>
      <div className="vehicle-design-section"><div className="vehicle-design-section-title"><h2>Exterior color</h2><span>02</span></div><p className="vehicle-option-name">{palette[paint].name} <span>{palette[paint].price ? `+${formatPrice(palette[paint].price)}` : 'Included'}</span></p><div className="vehicle-swatch-list" role="group" aria-label="Exterior color">{palette.map((color, i) => <button type="button" key={color.name} aria-label={color.name} aria-pressed={paint === i} title={color.name} className={paint === i ? 'is-selected' : ''} onClick={() => setPaint(i)}><span style={{ backgroundColor: color.value }}/></button>)}</div></div>
      <div className="vehicle-design-section"><div className="vehicle-design-section-title"><h2>Interior</h2><span>03</span></div><div className="vehicle-choice-list">{['Slate', 'Ivory'].map((name, i) => <button type="button" key={name} className={interior === i ? 'is-selected' : ''} onClick={() => { setInterior(i); setAngle(3); }}><span><b>{name}</b><small>{i ? 'Light, open and inviting' : 'Understated and tactile'}</small></span><strong>{i ? `+${formatPrice(1500)}` : 'Included'}</strong></button>)}</div></div>
      <div className="vehicle-design-section vehicle-design-summary"><div className="vehicle-design-section-title"><h2>Your {vehicle.model}</h2><span>04</span></div><p>Configured price <strong>{formatPrice(total)}</strong></p><button type="button" className="vehicle-price-toggle" onClick={() => setDetails(!details)} aria-expanded={details}>Show pricing details <ChevronRight size={16} className={details ? 'rotate-90' : ''}/></button>{details && <div className="vehicle-price-breakdown"><p>Base price <span>{formatPrice(vehicle.price)}</span></p><p>{palette[paint].name} <span>{formatPrice(palette[paint].price)}</span></p><p>{trim ? 'Performance edition' : 'Signature edition'} <span>{formatPrice(trim ? 4500 : 0)}</span></p><p>{interior ? 'Ivory interior' : 'Slate interior'} <span>{formatPrice(interior ? 1500 : 0)}</span></p></div>}</div>
      <div className="vehicle-design-checkout"><label htmlFor="delivery-zip">Delivery ZIP <span>Optional</span></label><input id="delivery-zip" value={zip} onChange={(event) => setZip(event.target.value.replace(/\D/g, '').slice(0, 5))} inputMode="numeric" autoComplete="postal-code" placeholder="Enter ZIP"/><p><ShieldCheck size={17}/> A member of our team will confirm delivery and payment details.</p><button type="button" className="vehicle-solid-button" disabled={busy || vehicle.quantity === 0} onClick={() => onPurchase(vehicle)}>{vehicle.quantity === 0 ? 'Currently unavailable' : isAuthenticated ? 'Confirm purchase' : 'Sign in to continue'} <ArrowRight size={18}/></button><small>Selection and pricing are shown for this showroom experience. Final terms are confirmed directly with Atelier Motors.</small></div>
    </aside>
  </main>;
}
