/**
 * Atelier Motors AI Lifestyle Matchmaker Engine
 * Calculates weighted compatibility scores between lifestyle profiles and vehicles in inventory.
 */

export const QUIZ_QUESTIONS = [
  {
    id: 'purpose',
    step: 1,
    title: 'How do you envision your defining drive?',
    subtitle: 'Select the landscape and rhythm that calls to you most.',
    options: [
      {
        id: 'coastal',
        label: 'Grand Touring & Coastal Highway',
        desc: 'Unwinding long sweeps of seaside pavement with composed power and fluid style.',
        icon: 'Compass',
        affinities: { Coupe: 10, Convertible: 9, Sedan: 6, SUV: 4, Electric: 5 },
      },
      {
        id: 'executive',
        label: 'Urban Commute & Executive Sanctuary',
        desc: 'A calm, quiet mobile sanctuary insulated from city noise and congestion.',
        icon: 'Building2',
        affinities: { Sedan: 10, Electric: 9, SUV: 6, Coupe: 4, Convertible: 3 },
      },
      {
        id: 'adventure',
        label: 'Alpine Escapes & Cross-Country Journeys',
        desc: 'High ground clearance, all-weather confidence, and generous space for destinations uncharted.',
        icon: 'Mountain',
        affinities: { SUV: 10, Sedan: 5, Electric: 4, Coupe: 2, Convertible: 1 },
      },
      {
        id: 'performance',
        label: 'Spirited Performance & Pure Adrenaline',
        desc: 'Razor-sharp throttle response, dynamic suspension, and visceral driver connection.',
        icon: 'Gauge',
        affinities: { Coupe: 10, Convertible: 8, Electric: 7, Sedan: 5, SUV: 3 },
      },
    ],
  },
  {
    id: 'powertrain',
    step: 2,
    title: 'What fuels your journey?',
    subtitle: 'Choose your desired propulsion character.',
    options: [
      {
        id: 'electric',
        label: 'Instant-Torque Electric Propulsion',
        desc: 'Whisper-quiet acceleration, regenerative braking, and zero emissions.',
        icon: 'Zap',
        preferredCategory: 'Electric',
        matchKeywords: ['electric', 'lucent', 'arc', 'eon'],
      },
      {
        id: 'combustion',
        label: 'Mechanical Twin-Turbo Soul',
        desc: 'Exhaust note resonance, tactile gearshifts, and classical automotive heartbeat.',
        icon: 'Flame',
        preferredCategory: 'Coupe',
        matchKeywords: ['gt s', 'r8', 'v8', 'coupe', 'convertible'],
      },
      {
        id: 'hybrid_awd',
        label: 'Dynamic All-Weather All-Wheel Drive',
        desc: 'Intelligent torque vectoring across four wheels for unshakeable road composure.',
        icon: 'Shield',
        preferredCategory: 'SUV',
        matchKeywords: ['summit', 'meridian', 'vesper', 'suv', 'sedan'],
      },
    ],
  },
  {
    id: 'atmosphere',
    step: 3,
    title: 'What atmosphere sets the tone inside your cabin?',
    subtitle: 'The interior is where design becomes sensory experience.',
    options: [
      {
        id: 'zen',
        label: 'Architectural OLED Minimalism',
        desc: 'Floating curved displays, clean geometric lines, and ambient serenity.',
        matchModels: ['Eon Lucent', 'Eon Arc'],
      },
      {
        id: 'heritage',
        label: 'Heritage Saddle Leather & Open-Pore Walnut',
        desc: 'Bespoke hand-stitching, fragrant full-grain Nappa, and warm acoustic wood.',
        matchModels: ['Aurelia GT S', 'Vesper S2'],
      },
      {
        id: 'spacious',
        label: 'Panoramic Vista & Executive Lounge Space',
        desc: 'Expansive ceiling glass, reclining rear seating, and multi-zone climate zoning.',
        matchModels: ['Northline Summit X', 'Meridian LX'],
      },
      {
        id: 'cockpit',
        label: 'Low-Slung Driver Cockpit & Tactile Metal',
        desc: 'Deep bolster support, forged carbon elements, and intimate ergonomic placement.',
        matchModels: ['Solenne R8', 'Aurelia GT S'],
      },
    ],
  },
  {
    id: 'priority',
    step: 4,
    title: 'What is your paramount design priority?',
    subtitle: 'Every Atelier creation embodies a distinct philosophical balance.',
    options: [
      {
        id: 'silhouette',
        label: 'Sculptural Grand Touring Silhouette',
        desc: 'Unbroken lines that make an unforgettable arrival at any venue.',
        matchModels: ['Aurelia GT S', 'Solenne R8'],
      },
      {
        id: 'versatility',
        label: 'Commanding Stance & High Versatility',
        desc: 'Effortless adaptability for family, outdoor gear, and cross-country treks.',
        matchModels: ['Northline Summit X', 'Meridian LX'],
      },
      {
        id: 'efficiency_pace',
        label: 'Electrified Pace & Aerodynamic Mastery',
        desc: 'Low drag coefficient with explosive acceleration off the line.',
        matchModels: ['Eon Lucent', 'Eon Arc'],
      },
      {
        id: 'understated',
        label: 'Timeless Dignity & Composed Elegance',
        desc: 'Restrained luxury that doesn’t shout to command absolute respect.',
        matchModels: ['Vesper S2', 'Meridian LX'],
      },
    ],
  },
];

/**
 * Calculates a match percentage score (0-100) between user answers and a specific vehicle.
 */
export function calculateVehicleMatch(vehicle, answers) {
  let score = 50; // baseline score
  const category = vehicle.category || '';
  const fullName = `${vehicle.make} ${vehicle.model}`;

  // 1. Purpose scoring
  const purposeOpt = QUIZ_QUESTIONS[0].options.find((o) => o.id === answers.purpose);
  if (purposeOpt?.affinities?.[category]) {
    score += purposeOpt.affinities[category] * 2.2;
  }

  // 2. Powertrain scoring
  const powertrainOpt = QUIZ_QUESTIONS[1].options.find((o) => o.id === answers.powertrain);
  if (powertrainOpt) {
    if (category.toLowerCase() === powertrainOpt.preferredCategory?.toLowerCase()) {
      score += 15;
    }
    const matchesKeyword = powertrainOpt.matchKeywords?.some((kw) =>
      fullName.toLowerCase().includes(kw) || category.toLowerCase().includes(kw)
    );
    if (matchesKeyword) score += 10;
  }

  // 3. Atmosphere scoring
  const atmosphereOpt = QUIZ_QUESTIONS[2].options.find((o) => o.id === answers.atmosphere);
  if (atmosphereOpt?.matchModels?.includes(fullName)) {
    score += 18;
  }

  // 4. Priority scoring
  const priorityOpt = QUIZ_QUESTIONS[3].options.find((o) => o.id === answers.priority);
  if (priorityOpt?.matchModels?.includes(fullName)) {
    score += 15;
  }

  // Cap score between 72% and 99% so every car feels thoughtfully curated
  return Math.min(99, Math.max(72, Math.round(score)));
}

/**
 * Generates tailored reasons why this vehicle matched the user's lifestyle choices.
 */
export function getMatchReasons(vehicle, answers) {
  const reasons = [];
  const cat = (vehicle.category || '').toLowerCase();

  if (answers.powertrain === 'electric' && cat.includes('electric')) {
    reasons.push('Features zero-emission dual-motor instant electric powertrain tailored to your green energy preference.');
  } else if (answers.powertrain === 'combustion' && (cat.includes('coupe') || cat.includes('convertible'))) {
    reasons.push('Houses a high-revving mechanical twin-turbo powertrain with rich exhaust timbre.');
  }

  if (answers.purpose === 'coastal') {
    reasons.push('Low center of gravity and sweeping GT proportions make long coastal highway sweeps effortless.');
  } else if (answers.purpose === 'adventure') {
    reasons.push('Elevated all-weather ground clearance and intelligent AWD ensure complete security in mountains.');
  } else if (answers.purpose === 'executive') {
    reasons.push('Acoustically insulated laminated glass and active noise cancellation provide a tranquil sanctuary.');
  }

  if (answers.atmosphere === 'zen') {
    reasons.push('Curved OLED digital displays and tactile minimalism align with your desire for architectural clarity.');
  } else if (answers.atmosphere === 'heritage') {
    reasons.push('Hand-finished Nappa leather and natural open-pore wood surfaces satisfy your appreciation for bespoke craft.');
  }

  if (reasons.length === 0) {
    reasons.push('Harmonious balance of chassis dynamics, safety certifications, and handcrafted comfort.');
    reasons.push('Exquisite proportions designed to turn every daily drive into a memorable occasion.');
  }

  return reasons;
}

/**
 * Ranks all available vehicles based on the quiz answers.
 * Returns sorted array of vehicles with match score and reasons.
 */
export function rankVehiclesByMatch(vehicles, answers) {
  if (!vehicles || vehicles.length === 0) return [];

  const ranked = vehicles.map((vehicle) => {
    const score = calculateVehicleMatch(vehicle, answers);
    const reasons = getMatchReasons(vehicle, answers);
    return { vehicle, score, reasons };
  });

  return ranked.sort((a, b) => b.score - a.score);
}
