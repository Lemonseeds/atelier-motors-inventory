import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { InteriorPanoramaModal } from './InteriorPanoramaModal.jsx';

const mockVehicle = {
  id: 1,
  make: 'Aurelia',
  model: 'GT S',
  category: 'Coupe',
  year: 2025,
  price: 89400,
};

describe('InteriorPanoramaModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders 360 Cockpit Panorama viewer with vehicle name and controls', () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog', { name: /360 Cockpit Panorama Viewer/i })).toBeInTheDocument();
    expect(screen.getByText(/Aurelia GT S · 360° Cockpit Panorama/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zoom In/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Zoom Out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Toggle Auto-pan 360°/i })).toBeInTheDocument();
  });

  it('renders all key luxury hotspots on the interior panorama', () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('button', { name: /Inspect Curved Floating OLED Display/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect Perforated Hand-Stitched Wheel/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect Burmester High-End 3D Surround/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect Quilted Executive Nappa Seating/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Inspect Sculpted Monolithic Center Console/i })).toBeInTheDocument();
  });

  it('opens craftsmanship inspector card when clicking a hotspot beacon', async () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    const displayHotspot = screen.getByRole('button', { name: /Inspect Curved Floating OLED Display/i });
    await userEvent.click(displayHotspot);

    const region = screen.getByRole('region', { name: /Hotspot Detail/i });
    expect(region).toBeInTheDocument();
    expect(screen.getByText(/8K High-Dynamic Curved Digital Cockpit/i)).toBeInTheDocument();
    expect(screen.getByText(/Seamless 42-inch high-contrast curved OLED display/i)).toBeInTheDocument();
    expect(screen.getByText(/Curved OLED Sapphire/i)).toBeInTheDocument();

    // Dismiss hotspot card
    await userEvent.click(screen.getByRole('button', { name: /Dismiss hotspot detail/i }));
    expect(screen.queryByRole('region', { name: /Hotspot Detail/i })).not.toBeInTheDocument();
  });

  it('switches interior themes between Obsidian & Walnut and Arctic Ivory', async () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    const ivoryBtn = screen.getByRole('button', { name: /Arctic Ivory & Platinum/i });
    await userEvent.click(ivoryBtn);

    const img = screen.getByRole('img', { name: /Atelier Luxury Interior Cockpit/i });
    expect(img.getAttribute('src')).toBe('/cockpit-ivory.jpg');

    const obsidianBtn = screen.getByRole('button', { name: /Obsidian & Walnut/i });
    await userEvent.click(obsidianBtn);
    expect(img.getAttribute('src')).toBe('/cockpit-panorama.jpg');
  });

  it('toggles ambient audio synthesizer', async () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    const audioToggle = screen.getByRole('button', { name: /Toggle Cabin Ambient Sound/i });
    expect(audioToggle).toBeInTheDocument();
    await userEvent.click(audioToggle);
    // Button title switches to mute
    expect(audioToggle.getAttribute('title')).toContain('Mute Cabin Engine Hum');
  });

  it('supports zoom, reset view and quick ribbon selection', async () => {
    render(
      <InteriorPanoramaModal
        vehicle={mockVehicle}
        onClose={vi.fn()}
      />
    );

    const zoomInBtn = screen.getByRole('button', { name: /Zoom In/i });
    await userEvent.click(zoomInBtn);

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    await userEvent.click(resetBtn);

    // Quick bottom ribbon jumps to hotspot
    const quickBtn = screen.getByRole('button', { name: /^Burmester High-End/i });
    await userEvent.click(quickBtn);

    expect(screen.getByRole('region', { name: /Hotspot Detail/i })).toBeInTheDocument();
    expect(screen.getByText(/1,750-Watt Spatial Acoustic System/i)).toBeInTheDocument();
  });
});
