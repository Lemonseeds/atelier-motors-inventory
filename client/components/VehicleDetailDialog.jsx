import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Calendar,
  CarFront,
  CheckCircle2,
  Compass,
  Cpu,
  Gauge,
  KeyRound,
  Pencil,
  PlusCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap
} from 'lucide-react';
import { Modal } from './Modal.jsx';
import { formatPrice, MODEL_PHOTOS, MODEL_SPECS } from '../lib/catalog.js';
import { PaymentCalculator } from './PaymentCalculator.jsx';

/**
 * Grounded specifications resolver using verified model technical data.
 */
function getVehicleSpecs(vehicle) {
  const fullName = `${vehicle.make} ${vehicle.model}`;
  const custom = MODEL_SPECS[fullName] || MODEL_SPECS[vehicle.model];
  if (custom) {
    const list = [
      { label: 'Powertrain', value: custom.powertrain, icon: Cpu },
      { label: '0–60 MPH', value: custom.acceleration, icon: Gauge },
    ];
    if (custom.range) list.push({ label: 'Range', value: custom.range, icon: Zap });
    if (custom.drivetrain) list.push({ label: 'Drivetrain', value: custom.drivetrain, icon: CarFront });
    if (custom.transmission && list.length < 4) list.push({ label: 'Transmission', value: custom.transmission, icon: Sparkles });
    if (custom.suspension && list.length < 4) list.push({ label: 'Suspension', value: custom.suspension, icon: Sparkles });
    if (custom.roof && list.length < 4) list.push({ label: 'Architecture', value: custom.roof, icon: Sparkles });
    return list.slice(0, 4);
  }

  const cat = (vehicle.category || '').toLowerCase();
  if (cat.includes('electric')) {
    return [
      { label: 'Powertrain', value: 'Permanent-Magnet Electric', icon: Zap },
      { label: 'Acceleration', value: 'Instant EV Torque', icon: Gauge },
      { label: 'Category', value: vehicle.category, icon: CarFront },
      { label: 'Drivetrain', value: 'Electric All-Wheel Drive', icon: CarFront },
    ];
  }
  return [
    { label: 'Category', value: vehicle.category, icon: CarFront },
    { label: 'Model Year', value: String(vehicle.year), icon: Calendar },
    { label: 'Available Stock', value: `${vehicle.quantity} Available`, icon: Sparkles },
    { label: 'Drivetrain', value: cat.includes('suv') ? 'All-Wheel Drive' : 'Rear-Wheel Drive', icon: CarFront },
  ];
}

/**
 * Interactive vehicle detail dialog displaying high-res photography,
 * technical specifications, warranty badges, and direct purchase / admin actions.
 */
export function VehicleDetailDialog({
  vehicle,
  isAdmin,
  isAuthenticated,
  onClose,
  onPurchase,
  onEdit,
  onRestock,
  onTestDrive,
  onExploreCockpit,
  busy
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const isSoldOut = vehicle.quantity === 0;
  const specs = getVehicleSpecs(vehicle);
  const photo = vehicle.imageUrl || MODEL_PHOTOS[`${vehicle.make} ${vehicle.model}`];

  return (
    <Modal
      title={`${vehicle.make} ${vehicle.model}`}
      subtitle={`${vehicle.year} Model • ${vehicle.category} • Curated Atelier Collection`}
      onClose={onClose}
      width="wide"
    >
      <div className="space-y-6">
        {/* Main Vehicle Showcase Image */}
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded bg-[#dae3f1] shadow-inner">
          {photo && !imageFailed ? (
            <img
              className="h-full w-full object-cover object-center saturate-[.85] transition duration-500 hover:scale-105"
              src={photo}
              alt={`${vehicle.make} ${vehicle.model}`}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#dce5f3] to-[#f5f7fb] text-[#8da1c0]">
              <CarFront size={84} strokeWidth={1} />
            </div>
          )}

          {/* Overlaid Badges */}
          <span className="absolute left-3.5 top-3.5 bg-white/90 px-3 py-1.5 text-[11px] font-extrabold tracking-wider text-ink backdrop-blur-xs">
            {vehicle.category}
          </span>
          <span
            className={`absolute right-3.5 top-3.5 px-3 py-1.5 text-[11px] font-extrabold tracking-wider ${
              isSoldOut ? 'bg-rose text-rose-ink' : 'bg-mint text-mint-ink'
            }`}
          >
            {isSoldOut ? 'Sold out' : `${vehicle.quantity} available in showroom`}
          </span>
        </div>

        {/* Narrative Description */}
        <div>
          <h4 className="text-[11px] font-extrabold tracking-widest text-[#7d889b]">OVERVIEW & PROVENANCE</h4>
          <p className="mt-2 text-sm leading-relaxed text-[#3a475d]">
            {vehicle.description ||
              'Sculpted with uncompromising craftsmanship and exceptional attention to detail. Every Atelier Motors vehicle passes our rigorous multi-point inspection before taking its place in our private showroom.'}
          </p>
        </div>

        {/* Technical Specifications Grid */}
        <div>
          <h4 className="text-[11px] font-extrabold tracking-widest text-[#7d889b]">CURATED SPECIFICATIONS</h4>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {specs.map((s, idx) => {
              const Icon = s.icon;
              return (
                <div key={idx} className="bg-[#f5f7fa] p-3 border border-[#e8ecf2] rounded-xs">
                  <div className="flex items-center gap-1.5 text-[#6c7a92]">
                    <Icon size={14} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{s.label}</span>
                  </div>
                  <div className="mt-1 font-display text-xs sm:text-[13px] font-bold text-ink">
                    {s.value}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Showroom Principles & Certified Inspection */}
        <div className="rounded bg-[#f9fafc] p-3.5 border border-[#e8ecf2] text-xs text-[#526075]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#3c825b] shrink-0" />
              <span>Multi-Point Technical Inspection</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#3c825b] shrink-0" />
              <span>Manufacturer Warranty Coverage</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#3c825b] shrink-0" />
              <span>Private Handover by Concierge</span>
            </div>
          </div>
        </div>

        {/* Payment Calculator Section */}
        <div className="border-t border-[#e8ecf2] pt-4">
          <button
            type="button"
            onClick={() => setShowCalculator(!showCalculator)}
            className="inline-flex items-center gap-2 text-xs font-bold text-royal hover:text-royal-deep transition"
          >
            <Calculator size={15} />
            {showCalculator ? 'Hide Payment Estimator' : 'Estimate Monthly Payments (Finance / Lease)'}
          </button>
          {showCalculator && (
            <div className="mt-3">
              <PaymentCalculator vehiclePrice={vehicle.price} />
            </div>
          )}
        </div>

        {/* Bottom Action & Price Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-[#e8ecf2] pt-5">
          <div>
            <span className="text-[10px] font-extrabold tracking-widest text-faint">ACQUISITION PRICE</span>
            <div className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-ink">
              {formatPrice(vehicle.price)}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-[#ccd5e4] bg-white px-3 py-2 text-xs font-bold text-ink hover:bg-[#f2f5f9] transition"
                  onClick={() => {
                    onClose();
                    onEdit?.(vehicle);
                  }}
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 border border-[#ccd5e4] bg-white px-3 py-2 text-xs font-bold text-ink hover:bg-[#f2f5f9] transition"
                  onClick={() => {
                    onClose();
                    onRestock?.(vehicle);
                  }}
                >
                  <PlusCircle size={14} /> Restock
                </button>
              </>
            )}

            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-[#ccd5e4] bg-white px-4 text-xs font-bold text-ink hover:bg-[#f2f5f9] transition"
              onClick={() => {
                onClose();
                onExploreCockpit?.(vehicle);
              }}
            >
              <Compass size={15} className="text-royal" /> 360° Cockpit
            </button>

            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 border border-[#ccd5e4] bg-white px-5 text-xs font-bold text-ink hover:bg-[#f2f5f9] transition"
              onClick={() => {
                onClose();
                onTestDrive?.(vehicle);
              }}
            >
              <Calendar size={15} className="text-royal" /> Schedule Test Drive
            </button>

            <button
              type="button"
              className={`inline-flex min-h-[44px] items-center justify-center gap-2.5 px-6 text-xs font-extrabold text-white transition ${
                isSoldOut ? 'bg-[#b7bfce] cursor-not-allowed' : 'bg-royal hover:bg-royal-deep shadow-sm'
              }`}
              disabled={isSoldOut || busy}
              onClick={() => {
                onClose();
                onPurchase(vehicle);
              }}
            >
              {isSoldOut ? (
                'Currently Sold Out'
              ) : isAuthenticated ? (
                <>
                  Purchase Vehicle <ArrowRight size={16} />
                </>
              ) : (
                <>
                  Sign in to Purchase <ArrowRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
