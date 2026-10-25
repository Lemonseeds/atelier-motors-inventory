import React, { useEffect, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  KeyRound,
  MapPin,
  PackageCheck,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  CarFront,
} from 'lucide-react';
import { Modal } from './Modal.jsx';
import { api } from '../api.js';
import { formatPrice } from '../lib/catalog.js';
import { downloadIcsFile } from '../lib/calendar.js';
import { getVehiclePhoto } from './VehiclePages.jsx';

const ORDER_STAGES = [
  { key: 'confirmed', label: 'Confirmed', fullLabel: 'Order Confirmed', icon: PackageCheck, desc: 'Bespoke allocation secured.' },
  { key: 'handcrafting', label: 'Assembly', fullLabel: 'Handcrafted Assembly', icon: Wrench, desc: 'Paint finish and interior tailoring.' },
  { key: 'inspection', label: 'Inspection', fullLabel: '150-Point Inspection', icon: ShieldCheck, desc: 'Master mechanical certification.' },
  { key: 'transit', label: 'In Transit', fullLabel: 'En Route in Enclosed Transport', icon: Truck, desc: 'Climate-controlled white-glove transit.' },
  { key: 'delivered', label: 'Delivered', fullLabel: 'Delivered to Owner', icon: KeyRound, desc: 'Private handover completed.' },
];

export function MyGarageModal({ user, token, onClose, onExplore, onScheduleTestDrive, onSignIn }) {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'testDrives'
  const [orders, setOrders] = useState([]);
  const [testDrives, setTestDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSticker, setActiveSticker] = useState(null);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    async function loadGarageData() {
      try {
        setLoading(true);
        const [ordersRes, drivesRes] = await Promise.all([
          api('/orders', { token }).catch(() => ({ orders: [] })),
          api('/test-drives', { token }).catch(() => ({ requests: [] })),
        ]);
        if (!cancelled) {
          setOrders(ordersRes?.orders || []);
          setTestDrives(drivesRes?.requests || []);
        }
      } catch (err) {
        if (!cancelled) setError('Failed to load garage information.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadGarageData();
    return () => { cancelled = true; };
  }, [token]);

  const getStageIndex = (status) => {
    const idx = ORDER_STAGES.findIndex((s) => s.key === status);
    return idx === -1 ? 0 : idx;
  };

  return (
    <Modal
      title="My Atelier Garage"
      subtitle={`${user?.name || 'Private Client'} · Member Dashboard & Order Tracking`}
      onClose={onClose}
      width="wide"
    >
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-[#e2e7ef] text-xs font-bold" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'orders'}
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 border-b-2 transition ${
              activeTab === 'orders'
                ? 'border-royal text-royal font-extrabold'
                : 'border-transparent text-[#657388] hover:text-ink'
            }`}
          >
            My Vehicles & Orders ({orders.length})
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'testDrives'}
            onClick={() => setActiveTab('testDrives')}
            className={`pb-3 px-4 border-b-2 transition ${
              activeTab === 'testDrives'
                ? 'border-royal text-royal font-extrabold'
                : 'border-transparent text-[#657388] hover:text-ink'
            }`}
          >
            Scheduled Test Drives ({testDrives.length})
          </button>
        </div>

        {!token ? (
          <div className="py-12 text-center bg-[#f8f9fb] border border-[#e8ecf2] p-8 rounded-xs">
            <KeyRound size={44} className="mx-auto text-[#9aa8bc] mb-3" strokeWidth={1.2} />
            <h3 className="font-display text-lg font-bold text-ink">Member Garage Access</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
              Sign in to your Atelier Motors account to view your order timeline, track live assembly progress, access digital Monroney window stickers, and view scheduled test drives.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                onSignIn?.();
              }}
              className="btn btn-primary mt-5 text-xs font-bold"
            >
              Sign In to Your Garage
            </button>
          </div>
        ) : loading ? (
          <div className="py-12 text-center text-xs text-muted">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-royal border-t-transparent rounded-full mb-3" />
            <p>Accessing your private Atelier records...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose/10 text-rose-ink text-xs font-semibold rounded-xs">
            {error}
          </div>
        ) : activeTab === 'orders' ? (
          /* Orders Tab */
          orders.length === 0 ? (
            <div className="py-12 text-center bg-[#f8f9fb] border border-[#e8ecf2] p-8 rounded-xs">
              <CarFront size={44} className="mx-auto text-[#9aa8bc] mb-3" strokeWidth={1.2} />
              <h3 className="font-display text-lg font-bold text-ink">Your Garage is Ready</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                You haven’t reserved or acquired any Atelier Motors vehicles yet. Browse our curated collection to start your next chapter.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExplore?.();
                }}
                className="btn btn-primary mt-5 text-xs font-bold"
              >
                Explore the Showroom
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const currentStageIdx = getStageIndex(order.status);
                const vehiclePhoto = getVehiclePhoto(order.vehicle);

                return (
                  <div key={order.id} className="border border-[#dfe4ec] bg-white rounded-xs shadow-xs overflow-hidden">
                    {/* Order Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#f8f9fc] border-b border-[#e5ebf3]">
                      <div>
                        <span className="text-[10px] font-extrabold tracking-widest text-[#728296] uppercase">
                          VIN: {order.vin}
                        </span>
                        <h4 className="font-display text-base font-bold text-ink mt-0.5">
                          {order.vehicle.make} {order.vehicle.model}
                        </h4>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-muted">Est. Delivery: <strong>{order.estimatedDelivery || order.estimated_delivery}</strong></span>
                        <span className="font-mono font-bold text-ink bg-white px-2.5 py-1 border border-[#dfe4ec] rounded-2xs">
                          {formatPrice(order.totalPrice ?? order.total_price ?? order.vehicle?.price)}
                        </span>
                      </div>
                    </div>

                    {/* Order Visual & Timeline */}
                    <div className="p-4 sm:p-5">
                      <div className="flex flex-col sm:flex-row gap-5 items-center">
                        <div className="w-full sm:w-44 aspect-[16/10] bg-[#f2f5f9] border border-[#e2e7ef] overflow-hidden flex items-center justify-center rounded-xs shrink-0">
                          {vehiclePhoto ? (
                            <img src={vehiclePhoto} alt={order.vehicle.model} className="w-full h-full object-contain p-2" />
                          ) : (
                            <CarFront size={40} className="text-[#8ba0bc]" />
                          )}
                        </div>

                        {/* Progression Stage Stepper */}
                        <div className="flex-1 w-full">
                          <span className="text-[10px] font-extrabold tracking-wider text-[#79889d] uppercase block mb-3">
                            Current Order Progression
                          </span>
                          <div className="grid grid-cols-5 gap-1 text-center relative">
                            {ORDER_STAGES.map((stage, idx) => {
                              const isPassed = idx < currentStageIdx;
                              const isCurrent = idx === currentStageIdx;
                              const Icon = stage.icon;

                              return (
                                <div key={stage.key} className="flex flex-col items-center">
                                  <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition mb-1.5 ${
                                      isPassed
                                        ? 'bg-[#3c825b] text-white'
                                        : isCurrent
                                        ? 'bg-royal text-white ring-4 ring-royal/20 animate-pulse'
                                        : 'bg-[#e9edf3] text-[#8190a2]'
                                    }`}
                                  >
                                    {isPassed ? <CheckCircle2 size={16} /> : <Icon size={15} />}
                                  </div>
                                  <span
                                    className={`text-[9px] font-extrabold tracking-tight ${
                                      isCurrent ? 'text-royal' : isPassed ? 'text-ink' : 'text-muted'
                                    }`}
                                  >
                                    {stage.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          <div className="mt-3 p-2.5 bg-[#f8f9fc] border border-[#e8edf4] rounded-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#556377]">
                            <span className="flex items-center gap-1.5">
                              <Sparkles size={13} className="text-royal shrink-0" />
                              <span>Stage: <strong>{ORDER_STAGES[currentStageIdx].fullLabel}</strong> — {ORDER_STAGES[currentStageIdx].desc}</span>
                            </span>
                            <button
                              type="button"
                              onClick={() => setActiveSticker(activeSticker === order.id ? null : order.id)}
                              className="text-royal font-bold hover:underline inline-flex items-center gap-1 shrink-0"
                            >
                              <FileText size={13} /> {activeSticker === order.id ? 'Hide Sticker' : 'View Monroney Window Sticker'}
                            </button>
                          </div>

                          {(order.deliveryAddress || order.delivery_address) && (
                            <div className="mt-2 text-xs text-[#627184] flex items-center gap-1.5">
                              <MapPin size={13} className="text-[#8997aa] shrink-0" />
                              <span>Destination: <strong>{order.deliveryAddress || order.delivery_address}</strong></span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Monroney Digital Window Sticker Accordion */}
                      {activeSticker === order.id && (
                        <div className="mt-4 p-5 border-2 border-dashed border-[#ccd6e3] bg-[#fbfcfd] rounded-xs text-xs space-y-4 animate-fade">
                          <div className="flex justify-between items-start border-b border-[#e1e7f0] pb-3">
                            <div>
                              <span className="text-[10px] font-extrabold tracking-widest text-[#728296] block">OFFICIAL MONRONEY WINDOW LABEL</span>
                              <h5 className="font-display text-lg font-bold">{order.vehicle.year} {order.vehicle.make} {order.vehicle.model}</h5>
                            </div>
                            <span className="font-mono text-xs bg-ink text-white px-2.5 py-1 font-bold rounded-2xs">
                              {order.vin}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            <div className="p-2.5 bg-white border border-[#e5ebf2]">
                              <span className="text-[10px] text-muted block uppercase font-bold">Category</span>
                              <strong>{order.vehicle.category}</strong>
                            </div>
                            <div className="p-2.5 bg-white border border-[#e5ebf2]">
                              <span className="text-[10px] text-muted block uppercase font-bold">Factory Warranty</span>
                              <strong>4-Yr / 50K Mi</strong>
                            </div>
                            <div className="p-2.5 bg-white border border-[#e5ebf2]">
                              <span className="text-[10px] text-muted block uppercase font-bold">Master Inspection</span>
                              <strong>150-Point Master</strong>
                            </div>
                            <div className="p-2.5 bg-white border border-[#e5ebf2]">
                              <span className="text-[10px] text-muted block uppercase font-bold">Total Acquired</span>
                              <strong>{formatPrice(order.totalPrice ?? order.total_price ?? order.vehicle?.price)}</strong>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white p-3 border border-[#e5ebf2]">
                            <div>
                              <strong className="text-[10px] font-extrabold tracking-wider text-ink block uppercase mb-1">STANDARD LUXURY EQUIPMENT</strong>
                              <ul className="list-disc list-inside text-[11px] text-[#556377] space-y-0.5">
                                <li>Adaptive Air Suspension & Dynamic Drive</li>
                                <li>Heated, Ventilated & Massaging Seats</li>
                                <li>High-Resolution Atelier OLED Cockpit</li>
                              </ul>
                            </div>
                            <div>
                              <strong className="text-[10px] font-extrabold tracking-wider text-ink block uppercase mb-1">GOVERNMENT 5-STAR SAFETY RATINGS</strong>
                              <p className="text-[11px] text-[#556377] leading-relaxed">
                                Overall Vehicle Score: ★★★★★ (5/5 Stars). Frontal, Side Impact, and Rollover Protection certified.
                              </p>
                            </div>
                          </div>

                          {(order.deliveryAddress || order.delivery_address) && (
                            <p className="text-[11px] text-[#556377]">
                              Registered Delivery Address: <strong>{order.deliveryAddress || order.delivery_address}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Test Drives Tab */
          testDrives.length === 0 ? (
            <div className="py-12 text-center bg-[#f8f9fb] border border-[#e8ecf2] p-8 rounded-xs">
              <Calendar size={44} className="mx-auto text-[#9aa8bc] mb-3" strokeWidth={1.2} />
              <h3 className="font-display text-lg font-bold text-ink">No Scheduled Test Drives</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto leading-relaxed">
                Take the wheel of any Atelier vehicle with a private showroom visit or home concierge delivery.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onScheduleTestDrive?.();
                }}
                className="btn btn-primary mt-5 text-xs font-bold"
              >
                Schedule a Test Drive
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {testDrives.map((drive) => (
                <div key={drive.id} className="p-4 border border-[#dfe4ec] bg-white rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-extrabold tracking-wider text-royal uppercase">
                        {(drive.experienceType || drive.experience_type || '').toLowerCase() === 'concierge' ? 'Concierge Handover' : 'Showroom Test Drive'}
                      </span>
                      <span className="text-[10px] font-bold text-muted font-mono">#AT-TD-{String(drive.id).padStart(4, '0')}</span>
                    </div>
                    <h4 className="font-display text-base font-bold text-ink mt-0.5">
                      {drive.vehicleName || (drive.vehicle ? `${drive.vehicle.make} ${drive.vehicle.model}` : '')}
                    </h4>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#556377] mt-1">
                      <span className="flex items-center gap-1"><Calendar size={13} /> {drive.preferredDate || drive.preferred_date || drive.date}</span>
                      <span className="flex items-center gap-1"><Clock size={13} /> {drive.timeWindow || drive.time_window} Window</span>
                      <span className="flex items-center gap-1"><MapPin size={13} /> {drive.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${
                      drive.status === 'confirmed'
                        ? 'bg-mint text-mint-ink'
                        : drive.status === 'cancelled'
                        ? 'bg-rose text-rose-ink'
                        : 'bg-[#eef2f7] text-[#556377]'
                    }`}>
                      {drive.status}
                    </span>
                    <button
                      type="button"
                      onClick={() => downloadIcsFile({
                        title: `Atelier Test Drive: ${drive.vehicleName}`,
                        description: `Private ${drive.experienceType || 'Showroom'} test drive for ${drive.vehicleName}.\nLocation: ${drive.location}`,
                        location: drive.location,
                        date: drive.preferredDate,
                        timeWindow: drive.timeWindow,
                      }, `test-drive-${drive.id}.ics`)}
                      className="p-2 border border-[#ccd5e4] text-[#556377] hover:text-ink hover:bg-[#f2f5f9] transition"
                      title="Download Calendar Invite (.ics)"
                      aria-label="Download Calendar Invite"
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </Modal>
  );
}
