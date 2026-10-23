import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { ArrowRight, ArrowUpRight, CarFront, Check, ChevronDown, Gauge, Heart, LogOut, Menu, Plus, Search, Settings2, ShieldCheck, SlidersHorizontal, Sparkles, X } from 'lucide-react';
import { api } from './api.js';
import './style.css';

const preview = [
  { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', year: 2025, price: 89400, quantity: 3, imageUrl: '/coupe.webp', description: 'Sculpted lines and exhilarating performance.' },
  { id: 2, make: 'Northline', model: 'Summit X', category: 'SUV', year: 2025, price: 76200, quantity: 5, imageUrl: '/suv.webp', description: 'Space, presence, and a composed drive.' },
  { id: 3, make: 'Eon', model: 'Lucent', category: 'Electric', year: 2026, price: 68500, quantity: 2, imageUrl: '/sedan.webp', description: 'Effortless electric travel, thoughtfully designed.' },
];

const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
const initialForm = { make: '', model: '', category: 'Coupe', year: new Date().getFullYear(), price: '', quantity: '', imageUrl: '', description: '' };

function Modal({ title, subtitle, onClose, children, width = 'normal' }) {
  useEffect(() => {
    const onKey = (event) => event.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [onClose]);
  return <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <div className={`modal-card ${width === 'wide' ? 'modal-wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
      <button className="icon-button modal-close" onClick={onClose} aria-label="Close dialog"><X size={20} /></button>
      <div className="modal-heading"><span className="eyebrow">ATELIER MOTORS</span><h2>{title}</h2><p>{subtitle}</p></div>
      {children}
    </div>
  </div>;
}

function AuthDialog({ mode, setMode, onClose, onSuccess }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const data = await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(mode === 'register' ? form : { email: form.email, password: form.password }) });
      onSuccess(data);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <Modal title={mode === 'login' ? 'Welcome back.' : 'Join the collection.'} subtitle={mode === 'login' ? 'Sign in to explore live availability and reserve your next drive.' : 'Create your account to explore and purchase from our collection.'} onClose={onClose}>
    <form onSubmit={submit} className="form-stack">
      {mode === 'register' && <label>Full name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" /></label>}
      <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" /></label>
      <label>Password<input required type="password" minLength={mode === 'register' ? 10 : undefined} autoComplete={mode === 'register' ? 'new-password' : 'current-password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder={mode === 'register' ? 'At least 10 characters' : 'Enter your password'} /></label>
      {error && <p className="form-error" role="alert">{error}</p>}
      <button disabled={busy} className="button button-dark full" type="submit">{busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'} <ArrowRight size={18} /></button>
    </form>
    <p className="auth-switch">{mode === 'login' ? 'New to Atelier?' : 'Already have an account?'} <button onClick={() => { setError(''); setMode(mode === 'login' ? 'register' : 'login'); }}>{mode === 'login' ? 'Create an account' : 'Sign in'}</button></p>
  </Modal>;
}

function VehicleDialog({ vehicle, onClose, onSave }) {
  const [form, setForm] = useState(vehicle ? { ...vehicle } : initialForm);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      await onSave({ ...form, year: Number(form.year), price: Number(form.price), quantity: Number(form.quantity) });
      onClose();
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return <Modal title={vehicle ? 'Edit vehicle.' : 'Add a vehicle.'} subtitle="Keep your showroom details precise and inviting." onClose={onClose} width="wide">
    <form onSubmit={submit} className="vehicle-form">
      <label>Make<input required maxLength="80" value={form.make} onChange={(e) => update('make', e.target.value)} placeholder="e.g. Aurelia" /></label>
      <label>Model<input required maxLength="80" value={form.model} onChange={(e) => update('model', e.target.value)} placeholder="e.g. GT S" /></label>
      <label>Category<select value={form.category} onChange={(e) => update('category', e.target.value)}>{['Coupe', 'SUV', 'Electric', 'Sedan', 'Convertible', 'Other'].map((item) => <option key={item}>{item}</option>)}</select></label>
      <label>Model year<input required type="number" min="1900" max={new Date().getFullYear() + 2} value={form.year} onChange={(e) => update('year', e.target.value)} /></label>
      <label>Price (USD)<input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => update('price', e.target.value)} placeholder="0" /></label>
      <label>Quantity in stock<input required type="number" min="0" step="1" value={form.quantity} onChange={(e) => update('quantity', e.target.value)} placeholder="0" /></label>
      <label className="form-span">Image URL<input type="url" value={form.imageUrl} onChange={(e) => update('imageUrl', e.target.value)} placeholder="https://example.com/vehicle.jpg" /></label>
      <label className="form-span">Description<textarea rows="3" maxLength="2000" value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="What makes this vehicle special?" /></label>
      {error && <p className="form-error form-span" role="alert">{error}</p>}
      <div className="form-span flex items-center justify-end gap-3"><button type="button" className="button button-light" onClick={onClose}>Cancel</button><button disabled={busy} type="submit" className="button button-dark">{busy ? 'Saving…' : vehicle ? 'Save changes' : 'Add vehicle'} <ArrowRight size={17} /></button></div>
    </form>
  </Modal>;
}

function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onRestock, onDelete, busy }) {
  const [imageFailed, setImageFailed] = useState(false);
  return <article className="vehicle-card">
    <div className="vehicle-image-wrap">
      {vehicle.imageUrl && !imageFailed ? <img className="vehicle-image" src={vehicle.imageUrl} alt={`${vehicle.make} ${vehicle.model}`} loading="lazy" onError={() => setImageFailed(true)} /> : <div className="vehicle-image vehicle-placeholder"><CarFront size={72} strokeWidth={1} /></div>}
      <span className="category-tag">{vehicle.category}</span>
      <span className={`stock-tag ${vehicle.quantity === 0 ? 'sold-out' : ''}`}>{vehicle.quantity === 0 ? 'Sold out' : `${vehicle.quantity} available`}</span>
    </div>
    <div className="vehicle-content">
      <div className="card-topline"><span>{vehicle.year} MODEL</span><span><Gauge size={14} /> PREMIUM SELECTION</span></div>
      <div className="card-title-row"><h3>{vehicle.make} <span>{vehicle.model}</span></h3><span className="card-arrow"><ArrowUpRight size={20} /></span></div>
      <p className="card-description">{vehicle.description || 'A distinctive addition to our curated collection.'}</p>
      <div className="card-divider" />
      <div className="card-bottom"><div><span className="price-label">STARTING AT</span><strong>{money(vehicle.price)}</strong></div><button className="purchase-button" disabled={vehicle.quantity === 0 || busy} onClick={() => onPurchase(vehicle)}>{vehicle.quantity === 0 ? 'Unavailable' : 'Purchase'} <ArrowRight size={17} /></button></div>
      {isAdmin && <div className="admin-actions"><button onClick={() => onEdit(vehicle)}>Edit details</button><button onClick={() => onRestock(vehicle)}>Restock</button><button className="danger" onClick={() => onDelete(vehicle)}>Delete</button></div>}
    </div>
  </article>;
}

function App() {
  const [auth, setAuth] = useState(() => { try { return JSON.parse(localStorage.getItem('atelier-auth')) || null; } catch { return null; } });
  const [authMode, setAuthMode] = useState(null);
  const [vehicles, setVehicles] = useState(preview);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All vehicles');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(undefined);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [restock, setRestock] = useState(null);
  const [restockQuantity, setRestockQuantity] = useState(1);
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  const token = auth?.token;
  const user = auth?.user;
  const isAdmin = user?.role === 'admin';

  useEffect(() => { if (toast) { const timeout = setTimeout(() => setToast(''), 4200); return () => clearTimeout(timeout); } }, [toast]);
  useEffect(() => {
    if (!token) { setVehicles(preview); return; }
    let live = true;
    api('/auth/me', { token }).then(({ user }) => { if (live) setAuth((current) => current && { ...current, user }); }).catch(() => { localStorage.removeItem('atelier-auth'); if (live) setAuth(null); });
    return () => { live = false; };
  }, [token]);
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (category !== 'All vehicles') params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      setLoading(true);
      try {
        const data = await api(`/vehicles/search?${params.toString()}`, { token, signal: controller.signal });
        setVehicles(data.vehicles);
      } catch (err) { if (err.name !== 'AbortError') setToast(err.message); }
      finally { setLoading(false); }
    }, 220);
    return () => { clearTimeout(timeout); controller.abort(); };
  }, [token, query, category, minPrice, maxPrice]);

  const visible = useMemo(() => vehicles.filter((v) => {
    const matches = `${v.make} ${v.model}`.toLowerCase().includes(query.toLowerCase());
    return matches && (category === 'All vehicles' || v.category === category) && (!minPrice || v.price >= Number(minPrice)) && (!maxPrice || v.price <= Number(maxPrice));
  }), [vehicles, query, category, minPrice, maxPrice]);

  function saveAuth(data) { localStorage.setItem('atelier-auth', JSON.stringify(data)); setAuth(data); setAuthMode(null); setToast(`Welcome${data.user?.name ? `, ${data.user.name.split(' ')[0]}` : ''}. Your collection awaits.`); }
  function logout() { localStorage.removeItem('atelier-auth'); setAuth(null); setToast('You have signed out.'); }
  async function refresh() { if (token) setVehicles((await api('/vehicles', { token })).vehicles); }
  async function purchase(vehicle) {
    if (!token) return setAuthMode('login');
    setBusyId(vehicle.id);
    try { await api(`/vehicles/${vehicle.id}/purchase`, { method: 'POST', token }); await refresh(); setToast(`${vehicle.make} ${vehicle.model} is yours. Stock has been updated.`); }
    catch (err) { setToast(err.message); await refresh(); }
    finally { setBusyId(null); }
  }
  async function saveVehicle(form) {
    await api(vehicleDialog?.id ? `/vehicles/${vehicleDialog.id}` : '/vehicles', { method: vehicleDialog?.id ? 'PUT' : 'POST', token, body: JSON.stringify(form) });
    await refresh(); setToast(vehicleDialog?.id ? 'Vehicle details updated.' : 'Vehicle added to the collection.');
  }
  async function deleteVehicle() {
    try { await api(`/vehicles/${confirmDelete.id}`, { method: 'DELETE', token }); await refresh(); setToast('Vehicle removed from the collection.'); setConfirmDelete(null); }
    catch (err) { setToast(err.message); }
  }
  async function restockVehicle(event) {
    event.preventDefault();
    try { await api(`/vehicles/${restock.id}/restock`, { method: 'POST', token, body: JSON.stringify({ quantity: Number(restockQuantity) }) }); await refresh(); setToast('Inventory restocked.'); setRestock(null); }
    catch (err) { setToast(err.message); }
  }
  const scrollToCollection = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });

  return <>
    <header className="site-header"><div className="header-inner">
      <a className="brand" href="#top" aria-label="Atelier Motors home"><span className="brand-mark"><CarFront size={23} strokeWidth={1.5} /></span><span>ATELIER <b>MOTORS</b><small>THE ART OF DRIVING</small></span></a>
      <nav className={mobileMenu ? 'nav-links nav-open' : 'nav-links'} aria-label="Main navigation"><a href="#collection" onClick={() => setMobileMenu(false)}>The Collection</a><a href="#experience" onClick={() => setMobileMenu(false)}>Our Experience</a><a href="#about" onClick={() => setMobileMenu(false)}>About Us</a></nav>
      <div className="header-actions">{user ? <div className="account-menu"><span className="account-avatar">{user.name?.[0]?.toUpperCase()}</span><span className="account-label">{user.name?.split(' ')[0]}<small>{isAdmin ? 'ADMIN' : 'MEMBER'}</small></span><button onClick={logout} title="Sign out" aria-label="Sign out"><LogOut size={18} /></button></div> : <button className="header-signin" onClick={() => setAuthMode('login')}>Sign in <ArrowUpRight size={17} /></button>}<button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle menu">{mobileMenu ? <X /> : <Menu />}</button></div>
    </div></header>

    <main id="top">
      <section className="hero shell"><img className="hero-image" src="/hero-v2.webp" alt="Silver blue luxury crossover on a misty open road" /><div className="hero-scrim" /><div className="hero-content"><div className="hero-kicker">THE ART OF DRIVING, REIMAGINED</div><h1>Find the car that<br />moves <em>you.</em></h1><p>A considered collection for wherever the road takes you.</p><div className="hero-dots"><i className="active" /><i /><i /><i /></div></div><div className="hero-side-note">CURATED VEHICLES &nbsp; / &nbsp; EXCEPTIONAL JOURNEYS</div></section>
      <div className="hero-search shell"><div className="search-tabs"><button className={category === 'All vehicles' ? 'active' : ''} onClick={() => setCategory('All vehicles')}>Explore all</button><button className={category === 'Coupe' ? 'active' : ''} onClick={() => setCategory('Coupe')}>Coupes</button><button className={category === 'SUV' ? 'active' : ''} onClick={() => setCategory('SUV')}>SUVs</button><button className={category === 'Electric' ? 'active' : ''} onClick={() => setCategory('Electric')}>Electric</button></div><div className="search-panel"><div className="search-field"><Search size={21} /><input aria-label="Search by make or model" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by make or model..." /></div><div className="filter-divider" /><div className="select-wrap"><CarFront size={20} /><select aria-label="Vehicle category" value={category} onChange={(e) => setCategory(e.target.value)}>{['All vehicles', 'Coupe', 'SUV', 'Electric', 'Sedan', 'Convertible', 'Other'].map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={17} /></div><button className="filter-button" onClick={scrollToCollection}>Explore cars <ArrowRight size={18} /></button></div></div>

      <section id="experience" className="trust-strip shell"><div><ShieldCheck size={22} /><span><b>Thoughtfully selected</b><small>Every detail considered</small></span></div><div><Sparkles size={22} /><span><b>A refined experience</b><small>From discovery to driveway</small></span></div><div><Heart size={22} /><span><b>Driven by passion</b><small>Vehicles worth loving</small></span></div></section>

      <section id="collection" className="collection shell"><div className="section-heading"><div><span className="eyebrow"><span className="eyebrow-dot" /> THE COLLECTION</span><h2>Find your next <em>chapter.</em></h2><p>From city streets to open horizons, discover a vehicle that feels like yours.</p></div><div className="collection-count"><span>CURATED VEHICLES</span><b>{String(visible.length).padStart(2, '0')}</b></div></div>
        <div className="collection-toolbar"><button className={`outline-filter ${filtersOpen ? 'filter-active' : ''}`} onClick={() => setFiltersOpen(!filtersOpen)} aria-expanded={filtersOpen}><SlidersHorizontal size={17} /> Price filters {(minPrice || maxPrice) && <span className="filter-indicator" />}</button></div>
        {filtersOpen && <div className="price-filters"><label>Minimum price<input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="$0" /></label><label>Maximum price<input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Any price" /></label><button onClick={() => { setMinPrice(''); setMaxPrice(''); }}>Clear filters</button></div>}
        <div className="results-row"><span>{loading ? 'Updating collection…' : `Showing ${visible.length} ${visible.length === 1 ? 'vehicle' : 'vehicles'}`}</span>{isAdmin && <button className="button button-dark add-button" onClick={() => setVehicleDialog(null)}><Plus size={18} /> Add vehicle</button>}</div>
        {visible.length ? <div className="vehicle-grid">{visible.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} isAdmin={isAdmin} onPurchase={purchase} onEdit={setVehicleDialog} onRestock={(v) => { setRestock(v); setRestockQuantity(1); }} onDelete={setConfirmDelete} busy={busyId === vehicle.id} />)}</div> : <div className="empty-state"><CarFront size={45} strokeWidth={1} /><h3>No vehicles found</h3><p>Try another search or adjust your filters to see more of the collection.</p><button onClick={() => { setQuery(''); setCategory('All vehicles'); setMinPrice(''); setMaxPrice(''); }}>Clear all filters <ArrowRight size={16} /></button></div>}
      </section>

      <section id="about" className="closing shell"><div><span className="eyebrow">BEYOND THE ORDINARY</span><h2>Every great story<br />starts with a <em>drive.</em></h2><p>We believe your vehicle should inspire every mile. Find the one that moves you.</p><button onClick={scrollToCollection} className="button button-cream">Discover your drive <ArrowUpRight size={18} /></button></div><div className="closing-decor"><span>AM</span><div className="circle-one" /><div className="circle-two" /></div></section>
    </main>
    <footer className="site-footer shell"><div className="footer-brand"><span className="brand-mark"><CarFront size={20} /></span> ATELIER MOTORS</div><span>THE ART OF DRIVING</span><span>© {new Date().getFullYear()} ATELIER MOTORS</span></footer>
    {toast && <div className="toast" role="status"><Check size={17} /> {toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
    {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} onSuccess={saveAuth} />}
    {vehicleDialog !== undefined && <VehicleDialog vehicle={vehicleDialog} onClose={() => setVehicleDialog(undefined)} onSave={saveVehicle} />}
    {confirmDelete && <Modal title="Remove this vehicle?" subtitle={`${confirmDelete.make} ${confirmDelete.model} will be permanently removed from the collection.`} onClose={() => setConfirmDelete(null)}><div className="confirm-actions"><button className="button button-light" onClick={() => setConfirmDelete(null)}>Cancel</button><button className="button button-danger" onClick={deleteVehicle}>Delete vehicle</button></div></Modal>}
    {restock && <Modal title="Restock vehicle." subtitle={`Add available units for ${restock.make} ${restock.model}.`} onClose={() => setRestock(null)}><form onSubmit={restockVehicle} className="form-stack"><label>Units to add<input type="number" min="1" step="1" value={restockQuantity} onChange={(e) => setRestockQuantity(e.target.value)} required /></label><button className="button button-dark full" type="submit">Update inventory <ArrowRight size={17} /></button></form></Modal>}
  </>;
}

createRoot(document.getElementById('root')).render(<App />);

