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
import { formatPrice } from '../lib/catalog.js';
import { PaymentCalculator } from './PaymentCalculator.jsx';

/**
 * Curated luxury specifications generator based on vehicle category
 */
function getVehicleSpecs(vehicle) {
  const cat = (vehicle.category || '').toLowerCase();
  if (cat.includes('electric')) {
    return [
      { label: 'Powertrain', value: 'Dual-Motor Electric', icon: Zap },
      { label: '0–60 MPH', value: '3.1 seconds', icon: Gauge },
      { label: 'Range', value: '340 mi EPA Est.', icon: Cpu },
      { label: 'Drivetrain', value: 'Instant All-Wheel Drive', icon: CarFront }
    ];
  }
  if (cat.includes('suv')) {
    return [
      { label: 'Powertrain', value: '3.5L Twin-Turbo V6', icon: Cpu },
      { label: '0–60 MPH', value: '4.2 seconds', icon: Gauge },
      { label: 'Drivetrain', value: 'Intelligent AWD System', icon: CarFront },
      { label: 'Suspension', value: 'Adaptive Air Suspension', icon: Sparkles }
    ];
  }
  // Coupe or performance sports
  return [
    { label: 'Powertrain', value: '4.0L Handcrafted Twin-Turbo', icon: Cpu },
    { label: '0–60 MPH', value: '3.4 seconds', icon: Gauge },
    { label: 'Transmission', value: '8-Speed Dual-Clutch', icon: Sparkles },
    { label: 'Drivetrain', value: 'Sport Tuned RWD', icon: CarFront }
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
          {vehicle.imageUrl && !imageFailed ? (
            <img
              className="h-full w-full object-cover object-center saturate-[.85] transition duration-500 hover:scale-105"
              src={vehicle.imageUrl}
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

        {/* Showroom Guarantees */}
        <div className="rounded bg-[#f9fafc] p-3.5 border border-[#e8ecf2] text-xs text-[#526075]">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-[#3c825b] shrink-0" />
              <span>150-Point Master Certified</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#3c825b] shrink-0" />
              <span>4-Year / 50K Mi Atelier Care</span>
            </div>
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-[#3c825b] shrink-0" />
              <span>Complimentary Concierge Delivery</span>
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
