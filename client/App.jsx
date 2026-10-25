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
import { ShowroomNavigation } from './components/ShowroomNavigation.jsx';
import { CompanyAssistant } from './components/CompanyAssistant.jsx';
import { VehicleComparePanel } from './components/VehicleComparePanel.jsx';
import { VehicleDesignPage, VehicleLearnPage } from './components/VehiclePages.jsx';
import { AboutSection, ExperienceSection, Interlude, MarqueeBand } from './components/EditorialSections.jsx';
import { ALL_CATEGORIES, CATEGORIES, EMPTY_FILTERS, PREVIEW_VEHICLES, filterVehicles, toSearchParams } from './lib/catalog.js';
import { defaultConfiguration } from './lib/configuration.js';
import { Reveal, RevealWords, scrollToTarget, useScene, useScrollMotion } from './lib/motion.jsx';

const vehicleSlug = (vehicle) => `${vehicle.make}-${vehicle.model}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
function parseVehicleRoute(pathname) {
  const match = pathname.match(/^\/vehicles\/([a-z0-9-]+)\/(learn|design)\/?$/);
  return match ? { slug: match[1], page: match[2] } : { slug: null, page: 'home' };
}

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
  const [route, setRoute] = useState(() => parseVehicleRoute(window.location.pathname));
  const [routeVehicle, setRouteVehicle] = useState(null);
  const [compareItems, setCompareItems] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const token = auth?.token;
  const user = auth?.user;
  const isAdmin = user?.role === 'admin';
  const menuVehicles = token ? vehicles : PREVIEW_VEHICLES;
  const pageVehicle = (token && vehicles.find((vehicle) => vehicleSlug(vehicle) === route.slug))
    || routeVehicle
    || [...vehicles, ...PREVIEW_VEHICLES].find((vehicle) => vehicleSlug(vehicle) === route.slug);

  useEffect(() => {
    const onPopState = () => { setRoute(parseVehicleRoute(window.location.pathname)); setRouteVehicle(null); };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useScrollMotion();
  const heroRef = useScene();

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
    scrollToTarget('#collection');
  };

  function navigate(page, vehicle) {
    const path = page === 'home' ? '/' : `/vehicles/${vehicleSlug(vehicle)}/${page}`;
    window.history.pushState({}, '', path);
    setRoute({ page, slug: vehicle ? vehicleSlug(vehicle) : null });
    setRouteVehicle(vehicle || null);
    setSelectedVehicle(null);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function navigateSection(target) {
    if (route.page !== 'home') {
      navigate('home');
      window.setTimeout(() => scrollToTarget(target), 80);
    } else scrollToTarget(target);
  }

  function addToCompare(vehicle, selection = defaultConfiguration) {
    if (!compareItems.some((item) => item.vehicle.id === vehicle.id) && compareItems.length >= 3) { setToast('Compare up to three cars at a time.'); return; }
    setCompareItems((current) => {
      if (current.some((item) => item.vehicle.id === vehicle.id)) return current.map((item) => item.vehicle.id === vehicle.id ? { vehicle, selection } : item);
      return [...current, { vehicle, selection }];
    });
    setToast(`${vehicle.make} ${vehicle.model} added to compare.`);
  }
  function toggleCompare(vehicle) {
    if (compareItems.some((item) => item.vehicle.id === vehicle.id)) setCompareItems((current) => current.filter((item) => item.vehicle.id !== vehicle.id));
    else addToCompare(vehicle);
  }
  const comparisonUi = <>
    {compareItems.length > 0 && <div className="compare-dock"><span>{compareItems.length} {compareItems.length === 1 ? 'car' : 'cars'} selected</span><button type="button" disabled={compareItems.length < 2} onClick={() => setCompareOpen(true)}>Compare cars <ArrowRight size={15}/></button><button type="button" aria-label="Clear comparison" onClick={() => setCompareItems([])}><X size={16}/></button></div>}
    {compareOpen && <VehicleComparePanel items={compareItems} onClose={() => setCompareOpen(false)} onRemove={(id) => setCompareItems((current) => current.filter((item) => item.vehicle.id !== id))} onUpdate={(id, changes) => setCompareItems((current) => current.map((item) => item.vehicle.id === id ? { ...item, selection: { ...item.selection, ...changes } } : item))} onDesign={(vehicle) => navigate('design', vehicle)}/>}
  </>;

  if (route.page !== 'home' && pageVehicle) return <>
    <ShowroomNavigation vehicles={menuVehicles} onNavigate={navigate} onSection={navigateSection} home={false} user={user} isAdmin={isAdmin} onSignIn={() => setAuthMode('login')} onSignOut={logout}/>
    <CompanyAssistant/>
    {route.page === 'learn' ? <VehicleLearnPage vehicle={pageVehicle} onBack={() => navigate('home')} onDesign={() => navigate('design', pageVehicle)}/>
      : <VehicleDesignPage vehicle={pageVehicle} onBack={() => navigate('home')} onLearn={() => navigate('learn', pageVehicle)} onPurchase={purchase} onCompare={addToCompare} isAuthenticated={Boolean(token)} busy={busyId === pageVehicle.id}/>}
    {comparisonUi}
    {toast && <div className="vehicle-page-toast" role="status">{toast}<button type="button" onClick={() => setToast('')} aria-label="Dismiss notification"><X size={17}/></button></div>}
    {authMode && <AuthDialog mode={authMode} setMode={setAuthMode} onClose={() => setAuthMode(null)} onSuccess={saveAuth}/>}
  </>;

  return (
    <>
      {/* Reading progress */}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]" aria-hidden="true">
        <div className="scroll-progress h-full w-full" />
      </div>

      <ShowroomNavigation vehicles={menuVehicles} onNavigate={navigate} onSection={navigateSection} home user={user} isAdmin={isAdmin} onSignIn={() => setAuthMode('login')} onSignOut={logout}/>
      <CompanyAssistant/>
      {comparisonUi}

      <main id="top">
        {/* Hero Section: layered parallax — photo sinks, haze drifts, copy lifts away */}
        <section ref={heroRef} data-scene className="relative h-[min(760px,92vh)] min-h-[600px] overflow-hidden bg-[#8ba5ca] w-full">
          <img
            className="hero-media will-move absolute inset-0 h-full w-full object-cover object-[center_58%] sm:object-[center_58%]"
            src="/hero-v2.webp"
            alt="Silver-blue luxury crossover on a misty open road"
            fetchPriority="high"
          />
          <div className="hero-scrim absolute inset-0" />
          <div className="hero-haze will-move pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-mist/35 via-mist/5 to-transparent" />
          <div className="hero-copy will-move relative z-1 flex h-full flex-col items-center pt-28 sm:pt-32 text-center text-white px-4">
            <Reveal immediate delay={150} variant="fade" className="text-[10px] font-extrabold tracking-[.28em] text-glow">
              THE ART OF DRIVING, REIMAGINED
            </Reveal>
            <RevealWords
              as="h1"
              immediate
              delay={250}
              stagger={70}
              className="mt-4 mb-3 block font-display text-[44px] sm:text-[clamp(44px,5.2vw,77px)] font-semibold leading-[1.03] tracking-[-.04em] text-glow"
            >
              Find the car that<br />moves {<em className="italic font-normal">you.</em>}
            </RevealWords>
            <Reveal as="p" immediate delay={750} className="m-0 text-sm sm:text-[15px] text-white/95 text-glow max-w-md">
              A considered collection for wherever the road takes you.
            </Reveal>
            <button
              type="button"
              onClick={() => scrollToTarget('#experience')}
              className="hero-cue mt-auto mb-24 sm:mb-28 flex flex-col items-center gap-3 text-[9px] font-extrabold tracking-[.32em] text-white/90 text-glow"
              aria-label="Scroll to explore"
            >
              SCROLL
              <span className="relative block h-12 w-px overflow-hidden bg-white/30">
                <span className="hero-cue-line absolute inset-0 bg-white" />
              </span>
            </button>
          </div>
        </section>

        {/* Hero Search Bar overlapping hero */}
        <Reveal immediate delay={900} className="relative z-2 mx-auto -mt-16 sm:-mt-17 max-w-[1180px] bg-white/90 p-5 sm:p-6 shadow-panel backdrop-blur-md shell">
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
        </Reveal>

        <ExperienceSection onExplore={scrollToCollection} />

        <MarqueeBand />

        {/* Collection Section */}
        <section id="collection" className="shell scroll-mt-6 pt-16 pb-28">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
            <div>
              <Reveal as="span" className="eyebrow">
                <span className="h-1.5 w-1.5 rounded-full bg-royal" /> THE COLLECTION
              </Reveal>
              <RevealWords as="h2" className="mt-3 mb-2 block font-display text-3xl sm:text-5xl font-semibold leading-tight tracking-[-.04em] text-ink">
                Find your next {<em className="italic font-normal text-steel">chapter.</em>}
              </RevealWords>
              <Reveal as="p" delay={200} className="m-0 text-sm text-muted">
                From city streets to open horizons, discover a vehicle that feels like yours.
              </Reveal>
            </div>

            <Reveal delay={300} className="flex flex-col items-start sm:items-end">
              <span className="text-[9px] font-extrabold tracking-widest text-[#8a97ae]">CURATED VEHICLES</span>
              <b className="font-display text-4xl sm:text-5xl font-medium text-[#263650]">
                {String(visibleVehicles.length).padStart(2, '0')}
              </b>
            </Reveal>
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
              {visibleVehicles.map((vehicle, index) => (
                <Reveal key={vehicle.id} delay={(index % 3) * 110} className="[&>article]:h-full">
                <VehicleCard
                  vehicle={vehicle}
                  isAdmin={isAdmin}
                  onSelect={(v) => setSelectedVehicle(v)}
                  onLearn={(v) => navigate('learn', v)}
                  onPurchase={(v) => navigate('design', v)}
                  onCompare={toggleCompare}
                  isCompared={compareItems.some((item) => item.vehicle.id === vehicle.id)}
                  onEdit={(v) => setVehicleDialog(v)}
                  onRestock={(v) => {
                    setRestock(v);
                    setRestockQuantity(1);
                  }}
                  onDelete={(v) => setConfirmDelete(v)}
                  busy={busyId === vehicle.id}
                />
                </Reveal>
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

        <Interlude onExplore={scrollToCollection} />

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
          onPurchase={(v) => navigate('design', v)}
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
