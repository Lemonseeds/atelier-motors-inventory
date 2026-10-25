import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  ShieldCheck,
  Sparkles,
  User,
  CarFront,
} from 'lucide-react';
import { Modal } from './Modal.jsx';
import { api } from '../api.js';
import { downloadIcsFile } from '../lib/calendar.js';
import { getVehiclePhoto } from './VehiclePages.jsx';

const SHOWROOM_LOCATIONS = [
  { id: 'nyc', name: 'Manhattan Flagship (57th St, New York)', city: 'New York' },
  { id: 'london', name: 'Mayfair Lounge (Berkeley Sq, London)', city: 'London' },
  { id: 'bh', name: 'Beverly Hills (Wilshire Blvd, Los Angeles)', city: 'Los Angeles' },
  { id: 'tokyo', name: 'Ginza Gallery (Chuo City, Tokyo)', city: 'Tokyo' },
];

const TIME_WINDOWS = [
  { key: 'Morning', label: 'Morning', hours: '9:00 AM – 12:00 PM' },
  { key: 'Afternoon', label: 'Afternoon', hours: '1:00 PM – 4:00 PM' },
  { key: 'Evening', label: 'Evening', hours: '5:00 PM – 7:30 PM' },
];

function getTomorrowDateString() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toISOString().slice(0, 10);
}

function getMaxDateString() {
  const max = new Date();
  max.setDate(max.getDate() + 90);
  return max.toISOString().slice(0, 10);
}

export function TestDriveModal({ vehicle, user, token, onClose, onSignIn }) {
  const [experienceType, setExperienceType] = useState('Showroom'); // 'Showroom' | 'Concierge'
  const [location, setLocation] = useState(SHOWROOM_LOCATIONS[0].name);
  const [conciergeAddress, setConciergeAddress] = useState('');
  const [preferredDate, setPreferredDate] = useState(getTomorrowDateString());
  const [timeWindow, setTimeWindow] = useState('Morning');
  const [licenseConfirmed, setLicenseConfirmed] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  const vehiclePhoto = getVehiclePhoto(vehicle);
  const minDate = getTomorrowDateString();
  const maxDate = getMaxDateString();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      onSignIn?.();
      return;
    }
    if (!licenseConfirmed) {
      setError('A valid driver’s license confirmation is required.');
      return;
    }

    const finalLocation = experienceType === 'Showroom' ? location : (conciergeAddress.trim() || 'Private Residence Concierge');
    setError(null);
    setBusy(true);

    try {
      const res = await api('/test-drives', {
        method: 'POST',
        token,
        body: {
          vehicleId: vehicle.id,
          preferredDate,
          timeWindow,
          experienceType,
          location: finalLocation,
        },
      });
      setConfirmedBooking(res.request);
    } catch (err) {
      setError(err.message || 'Unable to book test drive. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const handleDownloadCalendar = () => {
    if (!confirmedBooking) return;
    downloadIcsFile({
      title: `Atelier Motors Test Drive: ${vehicle.make} ${vehicle.model}`,
      description: `Your private ${confirmedBooking.experienceType} test drive for the ${vehicle.year} ${vehicle.make} ${vehicle.model}.\nLocation: ${confirmedBooking.location}\nBooking Ref: #AT-TD-${confirmedBooking.id}`,
      location: confirmedBooking.location,
      date: confirmedBooking.preferredDate,
      timeWindow: confirmedBooking.timeWindow,
    }, `atelier-test-drive-${vehicle.model.toLowerCase().replace(/\s+/g, '-')}.ics`);
  };

  return (
    <Modal
      title={confirmedBooking ? 'Test Drive Confirmed' : 'Schedule a Test Drive'}
      subtitle={confirmedBooking ? 'Your appointment has been reserved' : `Experience the ${vehicle.make} ${vehicle.model} on the open road`}
      onClose={onClose}
      width="wide"
    >
      {confirmedBooking ? (
        <div className="space-y-6 text-ink">
          <div className="flex flex-col items-center justify-center p-6 bg-[#f4f7fa] border border-[#e2e8f0] text-center rounded-sm">
            <div className="w-14 h-14 rounded-full bg-mint/30 text-mint-ink flex items-center justify-center mb-3">
              <CheckCircle2 size={32} />
            </div>
            <span className="text-[11px] font-extrabold tracking-widest text-[#718298]">CONFIRMATION CODE</span>
            <span className="font-mono text-xl font-bold text-ink mt-0.5">#AT-TD-2026-{String(confirmedBooking.id).padStart(4, '0')}</span>
            <p className="mt-2 text-sm text-[#4b586d] max-w-sm">
              An Atelier Concierge will prepare the <strong>{vehicle.make} {vehicle.model}</strong> and reach out to confirm your itinerary.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-4 border border-[#e5e9f0] bg-white">
              <span className="text-[#8795a8] uppercase font-bold tracking-wider block mb-1">Vehicle</span>
              <strong className="text-sm block">{vehicle.make} {vehicle.model}</strong>
              <span className="text-[#647285]">{vehicle.year} {vehicle.category}</span>
            </div>
            <div className="p-4 border border-[#e5e9f0] bg-white">
              <span className="text-[#8795a8] uppercase font-bold tracking-wider block mb-1">Appointment</span>
              <strong className="text-sm block">{confirmedBooking.preferredDate}</strong>
              <span className="text-[#647285]">{confirmedBooking.timeWindow} Window</span>
            </div>
            <div className="col-span-2 p-4 border border-[#e5e9f0] bg-white">
              <span className="text-[#8795a8] uppercase font-bold tracking-wider block mb-1">Location & Experience</span>
              <strong className="text-sm block">{confirmedBooking.experienceType}: {confirmedBooking.location}</strong>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadCalendar}
              className="btn btn-secondary flex-1 inline-flex items-center justify-center gap-2"
            >
              <Download size={16} /> Add to Calendar (.ics)
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-primary flex-1"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Vehicle mini-card */}
          <div className="flex items-center gap-4 p-3 bg-[#f6f8fb] border border-[#e5ebf3] rounded-sm">
            <div className="w-20 h-14 bg-white border border-[#e5ebf3] overflow-hidden flex items-center justify-center flex-shrink-0">
              {vehiclePhoto ? (
                <img src={vehiclePhoto} alt={vehicle.model} className="w-full h-full object-contain p-1" />
              ) : (
                <CarFront size={28} className="text-[#8ba0bc]" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-extrabold tracking-wider text-royal uppercase">{vehicle.category}</span>
              <h3 className="font-display text-base font-bold text-ink truncate">{vehicle.make} {vehicle.model}</h3>
              <p className="text-xs text-muted truncate">{vehicle.year} Model · Private Test Drive</p>
            </div>
          </div>

          {/* Step 1: Experience Type */}
          <div>
            <label className="field-label flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-royal" /> 1. CHOOSE EXPERIENCE TYPE
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setExperienceType('Showroom')}
                className={`p-3 text-left border transition ${
                  experienceType === 'Showroom'
                    ? 'border-royal bg-royal/5 shadow-xs'
                    : 'border-[#dfe4ec] bg-[#f8f9fc] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
                  <MapPin size={15} className={experienceType === 'Showroom' ? 'text-royal' : 'text-steel'} />
                  Atelier Showroom
                </div>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  Visit our private lounge with dedicated client advisor.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setExperienceType('Concierge')}
                className={`p-3 text-left border transition ${
                  experienceType === 'Concierge'
                    ? 'border-royal bg-royal/5 shadow-xs'
                    : 'border-[#dfe4ec] bg-[#f8f9fc] hover:bg-white'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold text-xs text-ink">
                  <Sparkles size={15} className={experienceType === 'Concierge' ? 'text-royal' : 'text-steel'} />
                  Home Concierge
                </div>
                <p className="mt-1 text-[11px] text-muted leading-relaxed">
                  The vehicle is brought directly to your home or office.
                </p>
              </button>
            </div>
          </div>

          {/* Location Selector */}
          {experienceType === 'Showroom' ? (
            <div>
              <label htmlFor="showroom-loc" className="field-label mb-1.5">Showroom Location</label>
              <select
                id="showroom-loc"
                className="field-input"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                {SHOWROOM_LOCATIONS.map((loc) => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="concierge-addr" className="field-label mb-1.5">Delivery Address / ZIP</label>
              <input
                id="concierge-addr"
                type="text"
                className="field-input"
                placeholder="e.g. 742 Evergreen Terrace, Springfield or ZIP 90210"
                value={conciergeAddress}
                onChange={(e) => setConciergeAddress(e.target.value)}
                required
              />
            </div>
          )}

          {/* Step 2: Date & Time Window */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="drive-date" className="field-label flex items-center gap-1 mb-1.5">
                <Calendar size={13} /> Preferred Date
              </label>
              <input
                id="drive-date"
                type="date"
                className="field-input"
                min={minDate}
                max={maxDate}
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="field-label flex items-center gap-1 mb-1.5">
                <Clock size={13} /> Time Window
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {TIME_WINDOWS.map((w) => (
                  <button
                    key={w.key}
                    type="button"
                    onClick={() => setTimeWindow(w.key)}
                    className={`py-2 px-1 text-center border text-[11px] font-semibold transition ${
                      timeWindow === w.key
                        ? 'border-ink bg-ink text-white'
                        : 'border-[#dfe4ec] bg-[#f8f9fc] text-ink hover:bg-white'
                    }`}
                  >
                    {w.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Step 3: Driver Requirements */}
          <div className="p-3 bg-[#f8f9fb] border border-[#e8ecf2] space-y-2 text-xs">
            <div className="flex items-center gap-2 text-ink font-semibold">
              <User size={15} className="text-steel" />
              <span>Driver: {user?.name || 'Guest Driver'} ({user?.email || 'Sign in to confirm'})</span>
            </div>
            <label className="flex items-start gap-2.5 cursor-pointer text-muted select-none">
              <input
                type="checkbox"
                checked={licenseConfirmed}
                onChange={(e) => setLicenseConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-royal focus:ring-royal"
              />
              <span>I hold a valid driver’s license, am 21+ years old, and agree to Atelier Motors test drive terms.</span>
            </label>
          </div>

          {error && (
            <div className="p-3 bg-rose/10 border border-rose/30 text-rose-ink text-xs font-medium">
              {error}
            </div>
          )}

          {!token && (
            <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-3">
              <span>Sign in or create an account to finalize your booking reservation.</span>
              <button
                type="button"
                onClick={onSignIn}
                className="font-bold underline text-amber-900 whitespace-nowrap"
              >
                Sign In
              </button>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <ShieldCheck size={16} />
              {busy ? 'Reserving...' : token ? 'Reserve Test Drive' : 'Sign In to Reserve'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
