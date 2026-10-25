import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MatchmakerQuizModal } from './MatchmakerQuizModal.jsx';

const mockVehicles = [
  { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', price: 89400 },
  { id: 2, make: 'Northline', model: 'Summit X', category: 'SUV', price: 112000 },
  { id: 3, make: 'Eon', model: 'Lucent', category: 'Electric', price: 94500 },
  { id: 4, make: 'Vesper', model: 'S2', category: 'Sedan', price: 78000 },
];

describe('MatchmakerQuizModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Step 1 with question and options', () => {
    render(
      <MatchmakerQuizModal
        vehicles={mockVehicles}
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('heading', { name: /Atelier Lifestyle Matchmaker/i })).toBeInTheDocument();
    expect(screen.getByText(/STEP 1 OF 4/i)).toBeInTheDocument();
    expect(screen.getByText(/How do you envision your defining drive\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Grand Touring & Coastal Highway/i)).toBeInTheDocument();
    expect(screen.getByText(/Alpine Escapes & Cross-Country Journeys/i)).toBeInTheDocument();
  });

  it('navigates forward through steps when options are chosen', async () => {
    render(
      <MatchmakerQuizModal
        vehicles={mockVehicles}
        onClose={vi.fn()}
      />
    );

    // Step 1
    await userEvent.click(screen.getByText(/Grand Touring & Coastal Highway/i));

    // Step 2
    expect(screen.getByText(/STEP 2 OF 4/i)).toBeInTheDocument();
    expect(screen.getByText(/What fuels your journey\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Instant-Torque Electric Propulsion/i)).toBeInTheDocument();

    // Go back
    await userEvent.click(screen.getByRole('button', { name: /Previous Question/i }));
    expect(screen.getByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });

  it('completes quiz, computes match ranking, and displays top recommendation and actions', async () => {
    const handleDesign = vi.fn();
    const handleTestDrive = vi.fn();
    const handleAskConcierge = vi.fn();

    render(
      <MatchmakerQuizModal
        vehicles={mockVehicles}
        analysisDelay={10}
        onClose={vi.fn()}
        onDesign={handleDesign}
        onScheduleTestDrive={handleTestDrive}
        onAskConcierge={handleAskConcierge}
      />
    );

    // Question 1: Adventure
    await userEvent.click(screen.getByText(/Alpine Escapes & Cross-Country Journeys/i));

    // Question 2: Hybrid AWD
    await userEvent.click(screen.getByText(/Dynamic All-Weather All-Wheel Drive/i));

    // Question 3: Spacious
    await userEvent.click(screen.getByText(/Panoramic Vista & Executive Lounge Space/i));

    // Question 4: Versatility
    await userEvent.click(screen.getByText(/Commanding Stance & High Versatility/i));

    // Wait for results
    await waitFor(() => {
      expect(screen.getByText(/Your Bespoke Atelier Match/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/% MATCH/)).toBeInTheDocument();
    expect(screen.getByText(/Northline Summit X/i)).toBeInTheDocument();
    expect(screen.getByText(/Why this vehicle matches your lifestyle:/i)).toBeInTheDocument();

    // Action clicks
    await userEvent.click(screen.getByRole('button', { name: /Design in 3D/i }));
    expect(handleDesign).toHaveBeenCalled();
  });

  it('allows retaking the quiz from results', async () => {
    render(
      <MatchmakerQuizModal
        vehicles={mockVehicles}
        analysisDelay={10}
        onClose={vi.fn()}
      />
    );

    // Click 4 answers
    await userEvent.click(screen.getByText(/Grand Touring & Coastal Highway/i));
    await userEvent.click(screen.getByText(/Mechanical Twin-Turbo Soul/i));
    await userEvent.click(screen.getByText(/Heritage Saddle Leather & Open-Pore Walnut/i));
    await userEvent.click(screen.getByText(/Sculptural Grand Touring Silhouette/i));

    await waitFor(() => {
      expect(screen.getByText(/Your Bespoke Atelier Match/i)).toBeInTheDocument();
    });

    // Retake Quiz button
    await userEvent.click(screen.getByRole('button', { name: /Retake Quiz/i }));

    expect(screen.getByText(/STEP 1 OF 4/i)).toBeInTheDocument();
  });
});
