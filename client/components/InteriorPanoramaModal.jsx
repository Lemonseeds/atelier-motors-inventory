import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Compass,
  Eye,
  Maximize2,
  Minimize2,
  RotateCw,
  Sparkles,
  Volume2,
  VolumeX,
  X,
  ZoomIn,
  ZoomOut,
  ChevronRight,
  Shield,
  Layers,
  Sliders,
} from 'lucide-react';
import { Modal } from './Modal.jsx';

const COCKPIT_HOTSPOTS = [
  {
    id: 'display',
    title: 'Curved Floating OLED Display',
    subtitle: '8K High-Dynamic Curved Digital Cockpit',
    x: 48, // percentage across panorama
    y: 46, // percentage down
    category: 'Infotainment & Cockpit',
    description:
      'Seamless 42-inch high-contrast curved OLED display engineered with anti-reflective sapphire glass. Houses full Atelier telemetry, active track maps, and dual-zone passenger media.',
    specs: [
      { label: 'Display Type', value: 'Curved OLED Sapphire' },
      { label: 'Resolution', value: '8K Ultra HDR (120Hz)' },
      { label: 'Connectivity', value: 'Wireless CarPlay & 5G' },
    ],
  },
  {
    id: 'wheel',
    title: 'Perforated Hand-Stitched Wheel',
    subtitle: 'Tactile Ergonomic Master Steering Wheel',
    x: 29,
    y: 65,
    category: 'Craftsmanship',
    description:
      'Hand-stitched in bespoke perforated Nappa leather with integrated brushed aluminum paddle shifters, haptic touch toggles, and dual drive-mode dial selectors.',
    specs: [
      { label: 'Upholstery', value: 'Perforated Nappa Leather' },
      { label: 'Hardware', value: 'Brushed Billet Aluminum' },
      { label: 'Feedback', value: 'Haptic Force Assist' },
    ],
  },
  {
    id: 'audio',
    title: 'Burmester High-End 3D Surround',
    subtitle: '1,750-Watt Spatial Acoustic System',
    x: 58,
    y: 41,
    category: 'Acoustics',
    description:
      '24 precision acoustic transducers paired with active cabin noise cancellation, tailored specifically to the acoustic geometry of the Atelier vehicle chassis.',
    specs: [
      { label: 'Total Output', value: '1,750 Watts RMS' },
      { label: 'Speakers', value: '24 Transducers + Subwoofer' },
      { label: 'Surround', value: 'Dolby Atmos Spatial 3D' },
    ],
  },
  {
    id: 'seats',
    title: 'Quilted Executive Nappa Seating',
    subtitle: '16-Way Ergonomic Climate Comfort Seats',
    x: 84,
    y: 66,
    category: 'Comfort & Seating',
    description:
      'Diamond-quilted semi-aniline leather with active dynamic lateral bolsters that adjust in curves, 6 pneumatic massage cycles, and multi-stage seat heating/ventilation.',
    specs: [
      { label: 'Adjustment', value: '16-Way Power w/ Memory' },
      { label: 'Functions', value: 'Ventilated, Heated, 6 Massages' },
      { label: 'Leather', value: 'Full-Grain Semi-Aniline' },
    ],
  },
  {
    id: 'console',
    title: 'Sculpted Monolithic Center Console',
    subtitle: 'Open-Pore Natural Walnut & Shift Dial',
    x: 55,
    y: 77,
    category: 'Controls',
    description:
      'Single-slab natural open-pore wood console featuring a precision knurled aluminum rotary drive-mode controller, dual inductive phone chargers, and ambient lighting.',
    specs: [
      { label: 'Finishing', value: 'Natural Open-Pore Walnut' },
      { label: 'Control Dial', value: 'Knurled Rotary Aluminum' },
      { label: 'Charging', value: 'Dual 50W Fast Inductive' },
    ],
  },
];

const THEMES = [
  { id: 'obsidian', name: 'Obsidian & Walnut', image: '/cockpit-panorama.jpg', color: '#1f2937' },
  { id: 'ivory', name: 'Arctic Ivory & Platinum', image: '/cockpit-ivory.jpg', color: '#f3f4f6' },
];

export function InteriorPanoramaModal({ vehicle, onClose }) {
  const [currentTheme, setCurrentTheme] = useState('obsidian');
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0); // in pixels
  const [panY, setPanY] = useState(0); // in pixels
  const [isAutoPanning, setIsAutoPanning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [ambientAudio, setAmbientAudio] = useState(false);

  const containerRef = useRef(null);
  const dragStartRef = useRef({ x: 0, y: 0, startPanX: 0, startPanY: 0 });
  const autoPanRef = useRef(null);
  const audioCtxRef = useRef(null);
  const oscRef = useRef(null);

  const selectedThemeObj = THEMES.find((t) => t.id === currentTheme) || THEMES[0];

  // Ambient sound synthesizer using Web Audio API (smooth cabin hum)
  const toggleAmbientSound = () => {
    if (!ambientAudio) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          audioCtxRef.current = ctx;

          // Sub-bass warm engine hum
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(48, ctx.currentTime); // 48 Hz warm hum
          gain.gain.setValueAtTime(0.04, ctx.currentTime); // gentle volume

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          oscRef.current = osc;
        }
      } catch (err) {
        console.warn('Web Audio could not be started:', err);
      }
      setAmbientAudio(true);
    } else {
      if (oscRef.current) {
        try {
          oscRef.current.stop();
          oscRef.current.disconnect();
        } catch {}
      }
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
      setAmbientAudio(false);
    }
  };

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try { oscRef.current.stop(); } catch {}
      }
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

const PANELS = [-2, -1, 0, 1, 2];
const PANEL_WIDTH = 1500;
const CYCLE = 2 * PANEL_WIDTH; // 3000px seamless period

  // Auto-pan loop with seamless 360 degree infinity wrap
  useEffect(() => {
    if (isAutoPanning) {
      let lastTime = performance.now();
      const step = (time) => {
        const dt = (time - lastTime) / 1000;
        lastTime = time;
        setPanX((prev) => {
          let next = prev - dt * 45; // pan left smoothly
          if (next <= -CYCLE) next += CYCLE;
          return next;
        });
        autoPanRef.current = requestAnimationFrame(step);
      };
      autoPanRef.current = requestAnimationFrame(step);
    } else {
      if (autoPanRef.current) cancelAnimationFrame(autoPanRef.current);
    }
    return () => {
      if (autoPanRef.current) cancelAnimationFrame(autoPanRef.current);
    };
  }, [isAutoPanning]);

  // Dragging handlers with continuous seamless infinity wrapping
  const handlePointerDown = (e) => {
    setIsDragging(true);
    setIsAutoPanning(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startPanX: panX,
      startPanY: panY,
    };
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    // Continuous horizontal cyclic wrap (zero black borders)
    let targetX = dragStartRef.current.startPanX + dx;
    while (targetX <= -CYCLE) {
      targetX += CYCLE;
      dragStartRef.current.startPanX += CYCLE;
    }
    while (targetX >= CYCLE) {
      targetX -= CYCLE;
      dragStartRef.current.startPanX -= CYCLE;
    }

    // Vertical boundary enforcement so top/bottom never reveal empty space
    const containerH = containerRef.current?.clientHeight || 600;
    const contentH = containerH * 1.18 * zoom;
    const maxPanY = Math.max(10, (contentH - containerH) / 2);
    const newY = Math.max(-maxPanY, Math.min(maxPanY, dragStartRef.current.startPanY + dy));

    setPanX(targetX);
    setPanY(newY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  const handleZoom = (delta) => {
    setZoom((prev) => Math.max(1, Math.min(1.8, +(prev + delta).toFixed(1))));
  };

  const resetView = () => {
    setZoom(1);
    setPanX(0);
    setPanY(0);
    setIsAutoPanning(false);
    setActiveHotspot(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0c121e]/90 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6 animate-fade"
      role="dialog"
      aria-modal="true"
      aria-label="360 Cockpit Panorama Viewer"
      data-lenis-prevent="true"
    >
      <div
        className="relative w-full max-w-6xl h-[88vh] max-h-[820px] bg-[#111723] border border-[#273549] rounded-sm shadow-2xl flex flex-col overflow-hidden"
        data-lenis-prevent="true"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#141c2b] border-b border-[#212c3e] text-white z-20">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-mint animate-pulse" />
            <div>
              <h3 className="font-display text-base font-bold tracking-wide">
                {vehicle ? `${vehicle.make} ${vehicle.model}` : 'Atelier Flagship'} · 360° Cockpit Panorama
              </h3>
              <p className="text-[11px] text-[#8e9eb3]">
                Bespoke luxury interior · Interactive touchpoints & ambient lighting
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <div className="hidden sm:flex items-center bg-[#1b2536] p-1 rounded-2xs border border-[#2e3e57] text-xs">
              {THEMES.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setCurrentTheme(theme.id)}
                  className={`px-3 py-1 font-bold rounded-2xs transition ${
                    currentTheme === theme.id
                      ? 'bg-royal text-white shadow-xs'
                      : 'text-[#8e9eb3] hover:text-white'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>

            {/* Audio Toggle */}
            <button
              type="button"
              onClick={toggleAmbientSound}
              className={`p-2 rounded-2xs border transition ${
                ambientAudio
                  ? 'border-royal bg-royal/20 text-white'
                  : 'border-[#2e3e57] text-[#8e9eb3] hover:text-white'
              }`}
              title={ambientAudio ? 'Mute Cabin Engine Hum' : 'Play Ambient Cabin Hum'}
              aria-label="Toggle Cabin Ambient Sound"
            >
              {ambientAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-[#8e9eb3] hover:text-white hover:bg-[#1f2b3e] transition rounded-2xs"
              aria-label="Close Cockpit Panorama"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Viewport Area */}
        <div
          ref={containerRef}
          className={`relative flex-1 w-full overflow-hidden select-none bg-black cursor-grab ${
            isDragging ? 'cursor-grabbing' : ''
          }`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Panoramic Image Canvas with 60fps CSS transform */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform will-change-transform"
            style={{
              transform: `translate3d(${panX}px, ${panY}px, 0) scale(${zoom})`,
              transitionDuration: isDragging ? '0ms' : '220ms',
              transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div
              className="relative flex items-center h-[118%] -top-[9%]"
              style={{ width: `${PANELS.length * PANEL_WIDTH}px` }}
            >
              {PANELS.map((pIndex) => {
                const isMirrored = Math.abs(pIndex) % 2 === 1;
                const isPrimary = pIndex === 0;
                return (
                  <div
                    key={pIndex}
                    className="relative h-full flex-shrink-0 overflow-hidden"
                    style={{ width: `${PANEL_WIDTH}px` }}
                  >
                    <img
                      src={selectedThemeObj.image}
                      alt={isPrimary ? 'Atelier Luxury Interior Cockpit' : ''}
                      aria-hidden={!isPrimary}
                      className={`w-full h-full object-cover pointer-events-none select-none ${
                        isMirrored ? 'scale-x-[-1]' : ''
                      }`}
                      draggable={false}
                    />

                    {/* Pulsing Hotspots overlaid on interior */}
                    {COCKPIT_HOTSPOTS.map((hotspot) => {
                      const isActive = activeHotspot?.id === hotspot.id;
                      const posX = isMirrored ? 100 - hotspot.x : hotspot.x;
                      return (
                        <button
                          key={`${pIndex}-${hotspot.id}`}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveHotspot(isActive ? null : hotspot);
                          }}
                          style={{ left: `${posX}%`, top: `${hotspot.y}%` }}
                          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 group flex items-center justify-center cursor-pointer transition focus:outline-none"
                          aria-label={isPrimary ? `Inspect ${hotspot.title}` : undefined}
                          aria-hidden={!isPrimary}
                          tabIndex={isPrimary ? 0 : -1}
                        >
                          {/* Pulsing outer aura */}
                          <span
                            className={`absolute w-8 h-8 rounded-full transition-transform ${
                              isActive
                                ? 'bg-royal/50 scale-125 animate-ping'
                                : 'bg-white/30 group-hover:bg-royal/40 group-hover:scale-125'
                            }`}
                          />
                          {/* Core icon dot */}
                          <span
                            className={`relative w-6 h-6 rounded-full flex items-center justify-center border-2 transition ${
                              isActive
                                ? 'bg-royal border-white text-white shadow-lg'
                                : 'bg-white/90 border-[#20293a] text-ink group-hover:bg-royal group-hover:text-white'
                            }`}
                          >
                            <Sparkles size={11} strokeWidth={2.5} />
                          </span>

                          {/* Hover tooltip label */}
                          <span className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-[#0b1019]/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-2xs border border-[#2b3a50] opacity-0 group-hover:opacity-100 transition pointer-events-none shadow-md">
                            {hotspot.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Hotspot Inspector Card Overlay */}
          {activeHotspot && (
            <div
              className="absolute bottom-6 left-6 right-6 sm:right-auto sm:w-96 bg-[#0f1725]/95 border border-[#293952] text-white p-5 rounded-xs shadow-2xl backdrop-blur-md z-30 animate-rise"
              role="region"
              aria-label="Hotspot Detail"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[#223147] pb-3 mb-3">
                <div>
                  <span className="text-[9px] font-extrabold tracking-widest text-royal uppercase block">
                    {activeHotspot.category}
                  </span>
                  <h4 className="font-display text-base font-bold text-white mt-0.5">
                    {activeHotspot.title}
                  </h4>
                  <p className="text-[11px] text-[#8e9eb3]">{activeHotspot.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveHotspot(null)}
                  className="text-[#7f90a6] hover:text-white transition p-1"
                  aria-label="Dismiss hotspot detail"
                >
                  <X size={16} />
                </button>
              </div>

              <p className="text-xs text-[#cad4e2] leading-relaxed mb-4">
                {activeHotspot.description}
              </p>

              <div className="grid grid-cols-1 gap-1.5 bg-[#141e30] p-3 rounded-2xs border border-[#22324a] text-xs">
                {activeHotspot.specs.map((spec) => (
                  <div key={spec.label} className="flex justify-between items-center text-[11px]">
                    <span className="text-[#8496ad]">{spec.label}</span>
                    <strong className="text-white font-medium">{spec.value}</strong>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HUD Floating Navigation Controls */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0e1624]/85 border border-[#23334a] p-1.5 rounded-xs backdrop-blur-sm text-white">
            <button
              type="button"
              onClick={() => handleZoom(0.2)}
              disabled={zoom >= 1.8}
              className="p-1.5 hover:bg-[#1c293d] disabled:opacity-30 rounded-2xs transition"
              title="Zoom In"
              aria-label="Zoom In"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={() => handleZoom(-0.2)}
              disabled={zoom <= 1}
              className="p-1.5 hover:bg-[#1c293d] disabled:opacity-30 rounded-2xs transition"
              title="Zoom Out"
              aria-label="Zoom Out"
            >
              <ZoomOut size={15} />
            </button>
            <div className="w-px h-4 bg-[#26374e]" />
            <button
              type="button"
              onClick={() => setIsAutoPanning(!isAutoPanning)}
              className={`p-1.5 rounded-2xs transition flex items-center gap-1.5 text-xs font-bold px-2 ${
                isAutoPanning ? 'bg-royal text-white' : 'hover:bg-[#1c293d] text-[#8e9eb3]'
              }`}
              title="Auto-pan 360°"
              aria-label="Toggle Auto-pan 360°"
            >
              <RotateCw size={14} className={isAutoPanning ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">360° Tour</span>
            </button>
            <button
              type="button"
              onClick={resetView}
              className="p-1.5 hover:bg-[#1c293d] text-[#8e9eb3] hover:text-white rounded-2xs transition text-xs font-bold px-2"
              title="Reset View"
            >
              Reset
            </button>
          </div>

          {/* Quick Hotspot Jumper Ribbon at Bottom Center */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#0e1624]/90 border border-[#25354c] p-1.5 rounded-full backdrop-blur-md overflow-x-auto max-w-[92vw]">
            <span className="text-[10px] font-extrabold tracking-wider text-[#798da6] uppercase px-2 hidden sm:inline">
              Hotspots:
            </span>
            {COCKPIT_HOTSPOTS.map((hotspot) => {
              const isSelected = activeHotspot?.id === hotspot.id;
              return (
                <button
                  key={hotspot.id}
                  type="button"
                  onClick={() => {
                    setActiveHotspot(hotspot);
                    // Center pan towards the hotspot
                    setPanX((50 - hotspot.x) * 6);
                    setPanY((50 - hotspot.y) * 3);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap ${
                    isSelected
                      ? 'bg-royal text-white shadow-sm'
                      : 'text-[#8e9eb3] hover:text-white hover:bg-[#1c2b3e]'
                  }`}
                >
                  {hotspot.title.split(' ')[0]} {hotspot.title.split(' ')[1]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Guidance Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between px-5 py-2.5 bg-[#121927] border-t border-[#202b3d] text-[11px] text-[#788a9e] z-20">
          <span className="flex items-center gap-2">
            <Compass size={14} className="text-royal" />
            Click and drag to pan across the cockpit · Click any pulsing beacon to inspect craftsmanship details
          </span>
          <span className="text-[#5b6d82] hidden sm:inline">
            Zero WebGL overhead · 60fps hardware-accelerated viewport
          </span>
        </div>
      </div>
    </div>
  );
}
