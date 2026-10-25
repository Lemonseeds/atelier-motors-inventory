import { describe, expect, it } from 'vitest';
import {
  QUIZ_QUESTIONS,
  calculateVehicleMatch,
  getMatchReasons,
  rankVehiclesByMatch,
} from './matchmaker.js';

const mockVehicles = [
  { id: 1, make: 'Aurelia', model: 'GT S', category: 'Coupe', price: 89400 },
  { id: 2, make: 'Northline', model: 'Summit X', category: 'SUV', price: 112000 },
  { id: 3, make: 'Eon', model: 'Lucent', category: 'Electric', price: 94500 },
  { id: 4, make: 'Vesper', model: 'S2', category: 'Sedan', price: 78000 },
];

describe('matchmaker engine', () => {
  it('defines 4 visual lifestyle questions', () => {
    expect(QUIZ_QUESTIONS).toHaveLength(4);
    expect(QUIZ_QUESTIONS.map((q) => q.id)).toEqual(['purpose', 'powertrain', 'atmosphere', 'priority']);
  });

  it('accurately scores electric vehicle match when electric preferences chosen', () => {
    const electricAnswers = {
      purpose: 'executive',
      powertrain: 'electric',
      atmosphere: 'zen',
      priority: 'efficiency_pace',
    };

    const electricVehicle = mockVehicles.find((v) => v.category === 'Electric');
    const score = calculateVehicleMatch(electricVehicle, electricAnswers);
    expect(score).toBeGreaterThanOrEqual(90);

    const reasons = getMatchReasons(electricVehicle, electricAnswers);
    expect(reasons.some((r) => r.toLowerCase().includes('electric'))).toBe(true);
    expect(reasons.some((r) => r.toLowerCase().includes('zen') || r.toLowerCase().includes('oled'))).toBe(true);
  });

  it('accurately ranks SUV at top when adventure and high versatility chosen', () => {
    const adventureAnswers = {
      purpose: 'adventure',
      powertrain: 'hybrid_awd',
      atmosphere: 'spacious',
      priority: 'versatility',
    };

    const ranked = rankVehiclesByMatch(mockVehicles, adventureAnswers);
    expect(ranked[0].vehicle.category).toBe('SUV');
    expect(ranked[0].score).toBeGreaterThanOrEqual(90);
    expect(ranked[0].reasons.length).toBeGreaterThan(0);
  });

  it('caps scores within realistic luxury boundaries between 72% and 99%', () => {
    const mixedAnswers = {
      purpose: 'coastal',
      powertrain: 'combustion',
      atmosphere: 'heritage',
      priority: 'silhouette',
    };

    mockVehicles.forEach((v) => {
      const score = calculateVehicleMatch(v, mixedAnswers);
      expect(score).toBeGreaterThanOrEqual(72);
      expect(score).toBeLessThanOrEqual(99);
    });
  });
});
