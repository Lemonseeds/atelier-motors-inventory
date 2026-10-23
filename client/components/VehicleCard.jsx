import React, { useState } from 'react';
import { ArrowRight, ArrowUpRight, CarFront, Gauge } from 'lucide-react';
import { formatPrice } from '../lib/catalog.js';

/**
 * Showroom vehicle card with image, category/stock badges,
 * dynamic pricing, and role-based action controls.
 */
export function VehicleCard({ vehicle, isAdmin, onPurchase, onEdit, onRestock, onDelete, busy }) {
  const [imageFailed, setImageFailed] = useState(false);
  const isSoldOut = vehicle.quantity === 0;

  return (
    <article className="group overflow-hidden border border-white/95 bg-white/90 shadow-card transition duration-200 hover:-translate-y-1 hover:shadow-card-hover">
      <div className="relative aspect-[1.47] overflow-hidden bg-[#dae3f1]">
        {vehicle.imageUrl && !imageFailed ? (
          <img
            className="h-full w-full object-cover object-center saturate-[.65] hue-rotate-[4deg] transition duration-500 group-hover:scale-105"
            src={vehicle.imageUrl}
            alt={`${vehicle.make} ${vehicle.model}`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#dce5f3] to-[#f5f7fb] text-[#8da1c0]">
            <CarFront size={72} strokeWidth={1} />
          </div>
        )}
        <span className="absolute left-3.5 top-3.5 bg-white/90 px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider text-ink backdrop-blur-xs">
          {vehicle.category}
        </span>
        <span
          className={`absolute right-3.5 top-3.5 px-2.5 py-1.5 text-[10px] font-extrabold tracking-wider ${
            isSoldOut ? 'bg-rose text-rose-ink' : 'bg-mint text-mint-ink'
          }`}
        >
          {isSoldOut ? 'Sold out' : `${vehicle.quantity} available`}
        </span>
      </div>

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between text-[9px] font-extrabold tracking-widest text-[#9aa5b5]">
          <span>{vehicle.year} MODEL</span>
          <span className="hidden sm:inline-flex items-center gap-1">
            <Gauge size={13} /> PREMIUM SELECTION
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <h3 className="font-display text-xl sm:text-2xl font-bold tracking-tight text-ink">
            {vehicle.make} <span className="font-normal">{vehicle.model}</span>
          </h3>
          <span className="text-steel opacity-70 group-hover:opacity-100 transition">
            <ArrowUpRight size={20} />
          </span>
        </div>

        <p className="mt-2 min-h-[36px] text-xs leading-relaxed text-muted line-clamp-2">
          {vehicle.description || 'A distinctive addition to our curated showroom collection.'}
        </p>

        <div className="my-4 h-px bg-line" />

        <div className="flex items-end justify-between gap-2.5">
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-extrabold tracking-widest text-faint">STARTING AT</span>
            <strong className="font-display text-2xl font-bold tracking-tight text-ink">
              {formatPrice(vehicle.price)}
            </strong>
          </div>

          <button
            className={`inline-flex min-h-[40px] items-center justify-center gap-2 px-3.5 text-[11px] font-extrabold text-white transition ${
              isSoldOut ? 'bg-[#b7bfce]' : 'bg-royal hover:bg-royal-deep'
            }`}
            disabled={isSoldOut || busy}
            onClick={() => onPurchase(vehicle)}
          >
            {isSoldOut ? 'Unavailable' : 'Purchase'} <ArrowRight size={16} />
          </button>
        </div>

        {isAdmin && (
          <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-[11px] font-bold">
            <button
              type="button"
              className="text-[#526ab6] hover:underline"
              onClick={() => onEdit(vehicle)}
            >
              Edit details
            </button>
            <button
              type="button"
              className="text-[#526ab6] hover:underline"
              onClick={() => onRestock(vehicle)}
            >
              Restock
            </button>
            <button
              type="button"
              className="ml-auto text-danger hover:underline"
              onClick={() => onDelete(vehicle)}
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
