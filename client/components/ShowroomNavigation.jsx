import React, { useState } from 'react';
import { ArrowUpRight, CarFront, ChevronDown, LogOut, Menu, Warehouse, X } from 'lucide-react';
import { VehicleArtwork } from './VehicleArtwork.jsx';

export function ShowroomNavigation({ vehicles, onNavigate, onSection, home, user, isAdmin, onSignIn, onSignOut, onOpenGarage, onOpenQuiz }) {
  const [open, setOpen] = useState(false);
  const [mobile, setMobile] = useState(false);
  const close = () => { setOpen(false); setMobile(false); };
  const go = (page, vehicle) => { close(); onNavigate(page, vehicle); };
  const section = (target) => { close(); onSection(target); };
  const openGarage = () => { close(); onOpenGarage?.(); };
  const openQuiz = () => { close(); onOpenQuiz?.(); };

  return <header className={`showroom-nav ${home ? 'showroom-nav-home' : 'showroom-nav-page'} ${open ? 'showroom-nav-open' : ''}`}>
    <div className="showroom-nav-bar shell">
      <button className="showroom-brand" type="button" onClick={() => go('home')} aria-label="Atelier Motors home">
        <span className="showroom-brand-mark"><CarFront size={20} strokeWidth={1.5}/></span>
        <span>ATELIER <b>MOTORS</b></span>
      </button>
      <nav className={`showroom-nav-links ${mobile ? 'is-mobile-open' : ''}`} aria-label="Main navigation">
        <button type="button" className={open ? 'is-active' : ''} onMouseEnter={() => setOpen(true)} onClick={() => setOpen(true)} aria-expanded={open} aria-controls="vehicle-menu">Vehicles <ChevronDown size={14}/></button>
        <button type="button" onMouseEnter={() => setOpen(false)} onClick={openQuiz}>Matchmaker</button>
        <button type="button" onMouseEnter={() => setOpen(false)} onClick={() => section('#experience')}>Our Experience</button>
        <button type="button" onMouseEnter={() => setOpen(false)} onClick={() => section('#about')}>About Us</button>
        <button type="button" onMouseEnter={() => setOpen(false)} onClick={openGarage}>My Garage</button>
      </nav>
      <div className="showroom-nav-actions">
        <button type="button" className="showroom-garage-nav-btn" onClick={openGarage} aria-label="Open My Garage" title="My Atelier Garage & Orders">
          <Warehouse size={15} />
          <span className="hidden sm:inline">My Garage</span>
        </button>
        {user ? <div className="showroom-account"><span className="showroom-avatar">{user.name?.[0]?.toUpperCase()}</span><span className="showroom-account-name">{user.name?.split(' ')[0]}<small>{isAdmin ? 'ADMIN' : 'MEMBER'}</small></span><button type="button" onClick={onSignOut} aria-label="Sign out"><LogOut size={18}/></button></div>
          : <button type="button" className="showroom-signin" onClick={onSignIn}>Sign in <ArrowUpRight size={16}/></button>}
        <button type="button" className="showroom-mobile-toggle" onClick={() => setMobile(!mobile)} aria-label="Toggle menu">{mobile ? <X/> : <Menu/>}</button>
      </div>
    </div>
    {open && <div className="showroom-mega" id="vehicle-menu" onMouseLeave={() => setOpen(false)}>
      <div className="showroom-mega-inner shell">
        <div className="showroom-mega-heading"><span>THE COLLECTION</span><strong>Find your next drive.</strong></div>
        <div className="showroom-mega-grid">
          {vehicles.map((vehicle, index) => <div className="showroom-mega-item" key={vehicle.id} style={{ '--item-delay': `${index * 45}ms` }}>
            <button type="button" className="showroom-mega-image" onClick={() => go('learn', vehicle)} aria-label={`Learn about ${vehicle.make} ${vehicle.model}`}>
              <VehicleArtwork vehicle={vehicle} color={['#6b7786','#87919a','#6b8092','#a84a3e','#424c60','#b2a18e','#587e84'][index % 7]} className="w-full h-full" />
            </button>
            <b>{vehicle.make} {vehicle.model}</b>
            <span>{vehicle.category}</span>
            <div><button type="button" onClick={() => go('learn', vehicle)}>Learn</button><button type="button" onClick={() => go('design', vehicle)}>Purchase</button></div>
          </div>)}
        </div>
      </div>
    </div>}
  </header>;
}
