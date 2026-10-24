import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CarFront,
  Check,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { api } from './api.js';
import { AuthDialog } from './components/AuthDialog.jsx';
import { Modal } from './components/Modal.jsx';
import { VehicleCard } from './components/VehicleCard.jsx';
import { VehicleDetailDialog } from './components/VehicleDetailDialog.jsx';
import { VehicleDialog } from './components/VehicleDialog.jsx';
import { AboutSection, ExperienceSection } from './components/EditorialSections.jsx';
import { ALL_CATEGORIES, CATEGORIES, EMPTY_FILTERS, PREVIEW_VEHICLES, filterVehicles, toSearchParams } from './lib/catalog.js';

export function App() {
  const [auth, setAuth] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('atelier-auth')) || null;
    } catch {
      return null;
    }
  });

  const [authMode, setAuthMode] = useState(null); // 'login' | 'register' | null
  const [vehicles, setVehicles] = useState(PREVIEW_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [vehicleDialog, setVehicleDialog] = useState(undefined); // null for create, object for edit, undefined for closed
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

  // Auto-clear toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Keep user profile in sync and validate token on load
  useEffect(() => {
    if (!token) {
      setVehicles(PREVIEW_VEHICLES);
      return;
    }
    let live = true;
    api('/auth/me', { token })
      .then(({ user: liveUser }) => {
        if (live) setAuth((current) => current && { ...current, user: liveUser });
      })
      .catch((err) => {
        if (err.status === 401) {
          localStorage.removeItem('atelier-auth');
          if (live) setAuth(null);
        }
      });
    return () => {
      live = false;
    };
  }, [token]);

  // Fetch vehicles when authenticated or filters change
  useEffect(() => {
    if (!token) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const query = toSearchParams(filters);
        const data = await api(`/vehicles/search?${query}`, { token, signal: controller.signal });
        setVehicles(data.vehicles);
      } catch (err) {
        if (err.name !== 'AbortError') setToast(err.message);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [token, filters]);

  // Computed visible vehicles (for visitors, filters applied client-side; for members, server results)
  const visibleVehicles = useMemo(() => {
    if (token) return vehicles;
    return filterVehicles(PREVIEW_VEHICLES, filters);
  }, [token, vehicles, filters]);

  // Keep selected vehicle in sync with live inventory updates
  useEffect(() => {
    if (!selectedVehicle) return;
    const fresh = (token ? vehicles : PREVIEW_VEHICLES).find((v) => v.id === selectedVehicle.id);
    if (fresh) setSelectedVehicle(fresh);
  }, [vehicles, token, selectedVehicle]);

  function saveAuth(data) {
    localStorage.setItem('atelier-auth', JSON.stringify(data));
    setAuth(data);
    setAuthMode(null);
    const firstName = data.user?.name ? data.user.name.split(' ')[0] : '';
    setToast(`Welcome${firstName ? `, ${firstName}` : ''}. Your collection awaits.`);
  }

  function logout() {
    localStorage.removeItem('atelier-auth');
    setAuth(null);
    setFilters(EMPTY_FILTERS);
    setToast('You have signed out.');
  }

  async function reloadVehicles() {
    if (!token) return;
    const data = await api('/vehicles', { token });
    setVehicles(data.vehicles);
  }

  async function purchase(vehicle) {
    if (!token) {
      setAuthMode('login');
      return;
    }
    setBusyId(vehicle.id);
    try {
      await api(`/vehicles/${vehicle.id}/purchase`, { method: 'POST', token });
      await reloadVehicles();
      setToast(`${vehicle.make} ${vehicle.model} purchased successfully. Inventory updated.`);
    } catch (err) {
      setToast(err.message);
      await reloadVehicles();
    } finally {
      setBusyId(null);
    }
  }

  async function saveVehicle(formData) {
    const isEdit = Boolean(vehicleDialog?.id);
    const path = isEdit ? `/vehicles/${vehicleDialog.id}` : '/vehicles';
    await api(path, {
      method: isEdit ? 'PUT' : 'POST',
      token,
      body: JSON.stringify(formData),
    });
    await reloadVehicles();
    setToast(isEdit ? 'Vehicle details updated.' : 'Vehicle added to the collection.');
  }

  async function deleteVehicle() {
    if (!confirmDelete) return;
    try {
      await api(`/vehicles/${confirmDelete.id}`, { method: 'DELETE', token });
      await reloadVehicles();
      setToast('Vehicle removed from the collection.');
      setConfirmDelete(null);
    } catch (err) {
      setToast(err.message);
    }
  }

  async function restockVehicle(event) {
    event.preventDefault();
    if (!restock) return;
    try {
      await api(`/vehicles/${restock.id}/restock`, {
        method: 'POST',
        token,
        body: JSON.stringify({ quantity: Number(restockQuantity) }),
      });
      await reloadVehicles();
      setToast('Inventory successfully restocked.');
      setRestock(null);
    } catch (err) {
      setToast(err.message);
    }
  }

  const scrollToCollection = () => {
    document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      {/* Site Header */}
      <header className="absolute top-0 left-0 z-10 w-full">
        <div className="relative mx-auto flex h-[76px] sm:h-[82px] w-[min(1400px,calc(100%-48px))] items-center justify-between border-b border-white/30 px-3 sm:px-7 text-white">
          <nav
            className={`${
              mobileMenu ? 'flex' : 'hidden'
            } md:flex absolute md:static top-[76px] left-3 right-3 md:top-auto md:left-auto md:right-auto flex-col md:flex-row items-stretch md:items-center gap-2 md:gap-7 bg-mist/95 md:bg-transparent p-4 md:p-0 text-ink md:text-white shadow-panel md:shadow-none backdrop-blur-md md:backdrop-blur-none text-xs font-semibold`}
            aria-label="Main navigation"
          >
            <a href="#collection" onClick={() => setMobileMenu(false)} className="py-2 md:py-0 hover:opacity-100 opacity-85 transition">
              The Collection
            </a>
            <a href="#experience" onClick={() => setMobileMenu(false)} className="py-2 md:py-0 hover:opacity-100 opacity-85 transition">
              Our Experience
            </a>
            <a href="#about" onClick={() => setMobileMenu(false)} className="py-2 md:py-0 hover:opacity-100 opacity-85 transition">
              About Us
            </a>
          </nav>

          <a
            href="#top"
            className="md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 font-display text-base font-extrabold tracking-[.14em]"
            aria-label="Atelier Motors home"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full border border-current">
              <CarFront size={20} strokeWidth={1.5} />
            </span>
            <span>
              ATELIER <b className="font-medium">MOTORS</b>
            </span>
          </a>

          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="grid h-7 w-7 place-items-center rounded-full bg-white font-extrabold text-[#253b70]">
                  {user.name?.[0]?.toUpperCase()}
                </span>
                <span className="hidden sm:flex flex-col leading-tight">
                  <span className="font-bold">{user.name?.split(' ')[0]}</span>
                  <small className="text-[9px] tracking-widest opacity-80">{isAdmin ? 'ADMIN' : 'MEMBER'}</small>
                </span>
                <button
                  type="button"
                  onClick={logout}
                  className="p-1.5 hover:text-white/80 transition"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="inline-flex items-center gap-2 bg-white px-3.5 py-2 text-xs font-bold text-[#25334f] transition hover:bg-white/90"
                onClick={() => setAuthMode('login')}
              >
                Sign in <ArrowUpRight size={16} />
              </button>
            )}

            <button
              type="button"
              className="p-2 md:hidden hover:opacity-80"
              onClick={() => setMobileMenu(!mobileMenu)}
              aria-label="Toggle menu"
            >
              {mobileMenu ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <main id="top">
        {/* Hero Section */}
        <section className="relative h-[min(690px,73vw)] min-h-[570px] overflow-hidden bg-[#8ba5ca] shell">
          <img
            className="absolute inset-0 h-full w-full object-cover object-[center_58%] sm:object-[center_58%]"
            src="/hero-v2.webp"
            alt="Silver-blue luxury crossover on a misty open road"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="relative z-1 flex h-full flex-col items-center pt-28 sm:pt-32 text-center text-white">
            <div className="text-[10px] font-extrabold tracking-[.28em] text-glow">
              THE ART OF DRIVING, REIMAGINED
            </div>
            <h1 className="mt-4 mb-3 font-display text-[44px] sm:text-[clamp(44px,5.2vw,77px)] font-semibold leading-[1.03] tracking-[-.065em] text-glow">
              Find the car that<br />moves <em className="italic font-normal">you.</em>
            </h1>
            <p className="m-0 text-sm sm:text-[15px] text-white/95 text-glow max-w-md">
              A considered collection for wherever the road takes you.
            </p>
            <div className="mt-auto mb-20 sm:mb-24 flex items-center gap-1.5">
              <i className="block h-[3px] w-6 bg-white" />
              <i className="block h-[3px] w-3 bg-white/60" />
              <i className="block h-[3px] w-3 bg-white/60" />
              <i className="block h-[3px] w-3 bg-white/60" />
            </div>
          </div>
        </section>

        {/* Hero Search Bar overlapping hero */}
        <div className="relative z-2 mx-auto -mt-16 sm:-mt-17 max-w-[1180px] bg-white/90 p-5 sm:p-6 shadow-panel backdrop-blur-md shell">
          <div className="mb-4 flex gap-6 border-b border-[#e7eaf0] text-xs font-semibold overflow-x-auto">
            {[ALL_CATEGORIES, 'Coupe', 'SUV', 'Electric'].map((cat) => {
              const active = filters.category === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  className={`relative pb-3 whitespace-nowrap transition ${
                    active ? 'text-ink font-bold' : 'text-[#838a9a] hover:text-ink'
                  }`}
                  onClick={() => setFilters({ ...filters, category: cat })}
                >
                  {cat === ALL_CATEGORIES ? 'Explore all' : cat}
                  {active && <span className="absolute bottom-[-1px] left-0 right-0 h-0.5 bg-royal" />}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0 min-h-[50px]">
            <div className="flex flex-1 items-center gap-3 bg-surface px-4 py-2 text-[#8b94a5]">
              <Search size={20} />
              <input
                aria-label="Search by make or model"
                className="w-full border-0 bg-transparent text-[13px] text-ink outline-none placeholder:text-[#9da4b2]"
                value={filters.q}
                onChange={(e) => setFilters({ ...filters, q: e.target.value })}
                placeholder="Search by make or model..."
              />
            </div>

            <div className="hidden sm:block w-2" />

            <div className="flex sm:w-64 items-center gap-2.5 bg-surface px-3.5 py-2 text-[#818ba0]">
              <CarFront size={18} />
              <select
                aria-label="Vehicle category"
                className="w-full appearance-none border-0 bg-transparent text-[13px] text-ink outline-none cursor-pointer"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value={ALL_CATEGORIES}>All vehicles</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} />
            </div>

            <button
              type="button"
              className="sm:ml-2 inline-flex min-h-[46px] items-center justify-center gap-3 bg-royal px-6 text-xs font-bold text-white transition hover:bg-royal-deep"
              onClick={scrollToCollection}
            >
              Explore cars <ArrowRight size={17} />
            </button>
          </div>
        </div>

        <ExperienceSection onExplore={scrollToCollection} />

        {/* Collection Section */}
        <section id="collection" className="shell scroll-mt-6 pt-20 pb-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <span className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-royal" /> THE COLLECTION
              </span>
              <h2 className="mt-3 mb-2 font-display text-3xl sm:text-5xl font-semibold leading-tight tracking-[-.065em] text-ink">
                Find your next <em className="italic font-normal text-steel">chapter.</em>
              </h2>
              <p className="m-0 text-sm text-muted">
                From city streets to open horizons, discover a vehicle that feels like yours.
              </p>
            </div>

            <div className="flex flex-col items-start sm:items-end">
              <span className="text-[9px] font-extrabold tracking-widest text-[#8a97ae]">CURATED VEHICLES</span>
              <b className="font-display text-4xl sm:text-5xl font-medium text-[#263650]">
                {String(visibleVehicles.length).padStart(2, '0')}
              </b>
            </div>
          </div>

          {/* Toolbar with Price Filters toggle */}
          <div className="flex justify-end mb-3">
            <button
              type="button"
              className={`inline-flex items-center gap-2 border border-[#cfd8e9] px-3.5 py-2 text-xs font-bold text-[#4c607f] transition hover:bg-white ${
                filtersOpen ? 'bg-white' : ''
              }`}
              onClick={() => setFiltersOpen(!filtersOpen)}
              aria-expanded={filtersOpen}
            >
              <SlidersHorizontal size={16} /> Price filters{' '}
              {(filters.minPrice || filters.maxPrice) && <span className="h-1.5 w-1.5 rounded-full bg-royal" />}
            </button>
          </div>

          {filtersOpen && (
            <div className="mb-4 flex flex-wrap items-end gap-3.5 bg-white/85 p-4 animate-fade">
              <label className="flex flex-col gap-1.5 text-[11px] font-bold text-muted">
                Minimum price
                <input
                  type="number"
                  min="0"
                  className="min-h-[38px] border border-[#dce2eb] bg-white px-2.5 text-xs text-ink outline-none"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  placeholder="$0"
                />
              </label>
              <label className="flex flex-col gap-1.5 text-[11px] font-bold text-muted">
                Maximum price
                <input
                  type="number"
                  min="0"
                  className="min-h-[38px] border border-[#dce2eb] bg-white px-2.5 text-xs text-ink outline-none"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  placeholder="Any price"
                />
              </label>
              <button
                type="button"
                className="py-2 px-1 text-xs font-bold text-royal hover:underline"
                onClick={() => setFilters({ ...filters, minPrice: '', maxPrice: '' })}
              >
                Clear filters
              </button>
            </div>
          )}

          {/* Results count & Admin Add button */}
          <div className="my-5 flex items-center justify-between text-xs text-[#8e98aa]">
            <span>
              {loading ? 'Updating collection…' : `Showing ${visibleVehicles.length} ${visibleVehicles.length === 1 ? 'vehicle' : 'vehicles'}`}
            </span>
            {isAdmin && (
              <button
                type="button"
                className="btn btn-dark min-h-[38px] py-1 text-xs"
                onClick={() => setVehicleDialog(null)}
              >
                <Plus size={16} /> Add vehicle
              </button>
            )}
          </div>

          {/* Grid of Vehicles or Empty state */}
          {visibleVehicles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {visibleVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isAdmin={isAdmin}
                  onSelect={(v) => setSelectedVehicle(v)}
                  onPurchase={purchase}
                  onEdit={(v) => setVehicleDialog(v)}
                  onRestock={(v) => {
                    setRestock(v);
                    setRestockQuantity(1);
                  }}
                  onDelete={(v) => setConfirmDelete(v)}
                  busy={busyId === vehicle.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white/75 py-16 px-4 text-center text-muted">
              <CarFront size={48} strokeWidth={1} />
              <h3 className="mt-3.5 mb-1.5 font-display text-2xl text-ink">No vehicles found</h3>
              <p className="text-xs mb-3">Try another search query or adjust price filters to explore the collection.</p>
              <button
                type="button"
                className="inline-flex items-center gap-2 text-xs font-bold text-royal hover:underline"
                onClick={() => setFilters(EMPTY_FILTERS)}
              >
                Clear all filters <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>

        <AboutSection onExplore={scrollToCollection} />
      </main>

      {/* Footer */}
      <footer className="shell flex min-h-[110px] flex-col sm:flex-row items-center justify-between gap-3 py-6 text-[10px] font-bold tracking-widest text-[#65738d]">
        <div className="flex items-center gap-2 font-display text-sm tracking-wider text-[#293a5e]">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-current">
            <CarFront size={17} />
          </span>
          ATELIER MOTORS
        </div>
        <span>THE ART OF DRIVING</span>
        <span>© {new Date().getFullYear()} ATELIER MOTORS</span>
      </footer>

      {/* Toast Notification */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-2.5 bg-[#293958] p-3.5 text-xs text-white shadow-modal animate-rise"
          role="status"
        >
          <Check size={16} className="text-emerald-400 shrink-0" />
          <span className="flex-1">{toast}</span>
          <button
            type="button"
            className="p-1 hover:opacity-75"
            onClick={() => setToast('')}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {selectedVehicle && (
        <VehicleDetailDialog
          vehicle={selectedVehicle}
          isAdmin={isAdmin}
          isAuthenticated={Boolean(token)}
          onClose={() => setSelectedVehicle(null)}
          onPurchase={purchase}
          onEdit={(v) => {
            setSelectedVehicle(null);
            setVehicleDialog(v);
          }}
          onRestock={(v) => {
            setSelectedVehicle(null);
            setRestock(v);
            setRestockQuantity(1);
          }}
          busy={busyId === selectedVehicle.id}
        />
      )}

      {/* Modals */}
      {authMode && (
        <AuthDialog
          mode={authMode}
          setMode={setAuthMode}
          onClose={() => setAuthMode(null)}
          onSuccess={saveAuth}
        />
      )}

      {vehicleDialog !== undefined && (
        <VehicleDialog
          vehicle={vehicleDialog}
          onClose={() => setVehicleDialog(undefined)}
          onSave={saveVehicle}
        />
      )}

      {confirmDelete && (
        <Modal
          title="Remove this vehicle?"
          subtitle={`${confirmDelete.make} ${confirmDelete.model} will be permanently removed from the collection.`}
          onClose={() => setConfirmDelete(null)}
        >
          <div className="mt-5 flex items-center justify-end gap-3">
            <button type="button" className="btn btn-light" onClick={() => setConfirmDelete(null)}>
              Cancel
            </button>
            <button type="button" className="btn btn-danger" onClick={deleteVehicle}>
              Delete vehicle
            </button>
          </div>
        </Modal>
      )}

      {restock && (
        <Modal
          title="Restock vehicle."
          subtitle={`Add available inventory for ${restock.make} ${restock.model}.`}
          onClose={() => setRestock(null)}
        >
          <form onSubmit={restockVehicle} className="flex flex-col gap-4">
            <label className="field-label">
              Units to add
              <input
                type="number"
                min="1"
                step="1"
                required
                className="field-input"
                value={restockQuantity}
                onChange={(e) => setRestockQuantity(e.target.value)}
              />
            </label>
            <button className="btn btn-dark w-full mt-2" type="submit">
              Update inventory <ArrowRight size={17} />
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
