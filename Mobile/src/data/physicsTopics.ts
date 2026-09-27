export interface PhysicsChapter {
  id: string;
  number: number;
  title: string;
  classLevel: 'Class 9' | 'Class 10' | 'Class 11' | 'Class 12';
  description: string;
  estimatedTime: string;
  progress: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  hasAR: boolean;
  modelType?: 'motor' | 'motion' | 'forces' | 'optics';
  concepts: {
    title: string;
    description: string;
  }[];
  definitions: {
    term: string;
    definition: string;
  }[];
  formulas: {
    symbol: string;
    name: string;
    formula: string;
  }[];
  arFeatures: {
    title: string;
    description: string;
    icon: string;
  }[];
  practiceCount: number;
}

export const SINDH_PHYSICS_CHAPTERS: PhysicsChapter[] = [
  {
    id: 'physical_quantities',
    number: 1,
    title: 'Physical Quantities & Measurement',
    classLevel: 'Class 9',
    description: 'Introduction to physics, SI units, standard prefixes, Vernier Calipers and Screw Gauge.',
    estimatedTime: '45 min',
    progress: 100,
    difficulty: 'Easy',
    hasAR: true,
    concepts: [
      { title: 'Base vs Derived Quantities', description: 'Base quantities are independent (length, mass, time), while derived quantities are defined in terms of base quantities.' },
      { title: 'Measuring Instruments', description: 'Vernier calipers measure up to 0.01 cm, and micrometer screw gauge measures up to 0.001 cm.' },
    ],
    definitions: [
      { term: 'Physical Quantity', definition: 'Any measurable quantity by which physical laws are expressed.' },
      { term: 'Least Count', definition: 'The smallest value that can be measured accurately by an instrument.' },
    ],
    formulas: [
      { symbol: 'LC', name: 'Least Count of Vernier', formula: 'LC = Value of 1 MSD / Total Vernier Divisions' },
    ],
    arFeatures: [
      { title: 'Vernier Caliper 3D', description: 'Interactive measurement simulation', icon: 'Scale' },
    ],
    practiceCount: 10,
  },
  {
    id: 'kinematics',
    number: 2,
    title: 'Kinematics',
    classLevel: 'Class 9',
    description: 'Study of motion without considering the forces causing it: displacement, velocity, acceleration.',
    estimatedTime: '60 min',
    progress: 85,
    difficulty: 'Medium',
    hasAR: true,
    modelType: 'motion',
    concepts: [
      { title: 'Distance vs Displacement', description: 'Distance is total path length (scalar), while displacement is the shortest straight line between two points (vector).' },
      { title: 'Equations of Uniform Motion', description: 'Three kinematic equations relating initial velocity, final velocity, acceleration, time, and distance.' },
    ],
    definitions: [
      { term: 'Velocity', definition: 'Rate of change of displacement with respect to time (v = d / t).' },
      { term: 'Acceleration', definition: 'Rate of change of velocity per unit time (a = Δv / t).' },
    ],
    formulas: [
      { symbol: 'v_f', name: '1st Equation of Motion', formula: 'v_f = v_i + a * t' },
      { symbol: 'S', name: '2nd Equation of Motion', formula: 'S = v_i * t + 0.5 * a * t²' },
      { symbol: '2aS', name: '3rd Equation of Motion', formula: '2 * a * S = v_f² - v_i²' },
    ],
    arFeatures: [
      { title: '3D Projectile Motion', description: 'Visualize trajectory and velocity vectors', icon: 'Activity' },
      { title: 'Acceleration Visualizer', description: 'Real-time velocity vs acceleration graphs', icon: 'Zap' },
    ],
    practiceCount: 15,
  },
  {
    id: 'dynamics',
    number: 3,
    title: 'Dynamics',
    classLevel: 'Class 9',
    description: "Newton's laws of motion, momentum, friction, centripetal force, and inertia.",
    estimatedTime: '55 min',
    progress: 60,
    difficulty: 'Medium',
    hasAR: true,
    modelType: 'forces',
    concepts: [
      { title: "Newton's Laws of Motion", description: '1st law: Inertia. 2nd law: F = m*a. 3rd law: Action and reaction are equal and opposite.' },
      { title: 'Law of Conservation of Momentum', description: 'Total linear momentum of an isolated system remains constant.' },
    ],
    definitions: [
      { term: 'Momentum', definition: 'Product of mass and velocity of a body (p = m * v).' },
      { term: 'Inertia', definition: 'Property of a body due to which it resists any change in its state of rest or uniform motion.' },
    ],
    formulas: [
      { symbol: 'F', name: "Newton's 2nd Law", formula: 'F = m * a' },
      { symbol: 'p', name: 'Momentum', formula: 'p = m * v' },
      { symbol: 'F_c', name: 'Centripetal Force', formula: 'F_c = (m * v²) / r' },
    ],
    arFeatures: [
      { title: 'Force Vectors 3D', description: 'Interactive incline plane and friction vectors', icon: 'ArrowUpRight' },
    ],
    practiceCount: 12,
  },
  {
    id: 'turning_effect',
    number: 4,
    title: 'Turning Effect of Forces',
    classLevel: 'Class 9',
    description: 'Torque, center of gravity, equilibrium, and principle of moments.',
    estimatedTime: '40 min',
    progress: 40,
    difficulty: 'Medium',
    hasAR: true,
    concepts: [
      { title: 'Torque (Moment of Force)', description: 'The turning effect produced in a body about an axis of rotation.' },
      { title: 'Conditions of Equilibrium', description: '1st: Net force = 0. 2nd: Net torque = 0.' },
    ],
    definitions: [
      { term: 'Torque (τ)', definition: 'Product of force and perpendicular distance from axis of rotation (τ = F * d).' },
    ],
    formulas: [
      { symbol: 'τ', name: 'Torque', formula: 'τ = F * d * sin(θ)' },
    ],
    arFeatures: [
      { title: '3D Lever & Torque Simulation', description: 'Explore moments on a seesaw in 3D', icon: 'Sliders' },
    ],
    practiceCount: 8,
  },
  {
    id: 'gravitation',
    number: 5,
    title: 'Gravitation',
    classLevel: 'Class 9',
    description: "Law of universal gravitation, mass of Earth, variation of 'g', and artificial satellites.",
    estimatedTime: '50 min',
    progress: 30,
    difficulty: 'Easy',
    hasAR: true,
    concepts: [
      { title: 'Universal Law of Gravitation', description: 'Every particle attracts every other particle with a force proportional to product of masses and inversely proportional to distance squared.' },
    ],
    definitions: [
      { term: 'Gravitational Constant (G)', definition: 'Universal value G = 6.673 × 10⁻¹¹ N m²/kg².' },
    ],
    formulas: [
      { symbol: 'F_g', name: 'Law of Gravitation', formula: 'F = (G * m₁ * m₂) / r²' },
      { symbol: 'g', name: 'Acceleration due to gravity', formula: 'g = (G * M_e) / R_e²' },
    ],
    arFeatures: [
      { title: 'Orbital Satellites in 3D', description: 'Visualize gravitational orbits and geostationary paths', icon: 'Globe' },
    ],
    practiceCount: 10,
  },
  {
    id: 'work_energy',
    number: 6,
    title: 'Work and Energy',
    classLevel: 'Class 9',
    description: 'Work done, kinetic & potential energy, law of conservation of energy, power, and efficiency.',
    estimatedTime: '50 min',
    progress: 40,
    difficulty: 'Medium',
    hasAR: true,
    concepts: [
      { title: 'Work', description: 'Work is done when a force produces displacement in its own direction (W = F * d * cos θ).' },
      { title: 'Energy Transformation', description: 'Energy cannot be created or destroyed, only transformed between forms.' },
    ],
    definitions: [
      { term: 'Kinetic Energy (KE)', definition: 'Energy possessed by a body due to its motion.' },
      { term: 'Potential Energy (PE)', definition: 'Energy possessed by a body due to its position or configuration.' },
    ],
    formulas: [
      { symbol: 'W', name: 'Work Done', formula: 'W = F * d * cos(θ)' },
      { symbol: 'KE', name: 'Kinetic Energy', formula: 'KE = 0.5 * m * v²' },
      { symbol: 'PE', name: 'Gravitational PE', formula: 'PE = m * g * h' },
      { symbol: 'P', name: 'Power', formula: 'P = W / t' },
    ],
    arFeatures: [
      { title: 'Roller Coaster Energy 3D', description: 'Live kinetic vs potential energy conversion', icon: 'TrendingUp' },
    ],
    practiceCount: 12,
  },
  {
    id: 'properties_of_matter',
    number: 7,
    title: 'Properties of Matter',
    classLevel: 'Class 9',
    description: 'Kinetic molecular theory, density, pressure, Archimedes principle, Pascal law, and elasticity.',
    estimatedTime: '45 min',
    progress: 10,
    difficulty: 'Easy',
    hasAR: true,
    concepts: [
      { title: 'Archimedes Principle', description: 'An object submerged in fluid experiences an upthrust equal to weight of displaced fluid.' },
    ],
    definitions: [
      { term: 'Density', definition: 'Mass per unit volume (ρ = m / V).' },
      { term: 'Pressure', definition: 'Force acting normally per unit surface area (P = F / A).' },
    ],
    formulas: [
      { symbol: 'P', name: 'Fluid Pressure', formula: 'P = ρ * g * h' },
    ],
    arFeatures: [
      { title: 'Hydraulic Lift 3D', description: "Interactive Pascal's law demonstration", icon: 'Layers' },
    ],
    practiceCount: 8,
  },
  {
    id: 'electricity',
    number: 8,
    title: 'Electricity & Electromagnetism',
    classLevel: 'Class 10',
    description: "Electric current, Ohm's law, circuits, magnetic effects of current, and DC Electric Motor.",
    estimatedTime: '70 min',
    progress: 64,
    difficulty: 'Hard',
    hasAR: true,
    modelType: 'motor',
    concepts: [
      { title: 'Electric Motor Principle', description: 'A current-carrying conductor in a magnetic field experiences a rotational force (Fleming Left Hand Rule).' },
      { title: "Ohm's Law", description: 'Current flowing through a conductor is directly proportional to the potential difference across it at constant temperature.' },
    ],
    definitions: [
      { term: 'Current (I)', definition: 'Rate of flow of electric charge (I = Q / t).' },
      { term: 'Resistance (R)', definition: 'Opposition offered by a conductor to the flow of electric current.' },
    ],
    formulas: [
      { symbol: 'V', name: "Ohm's Law", formula: 'V = I * R' },
      { symbol: 'F', name: 'Lorentz Force on Wire', formula: 'F = I * L * B * sin(θ)' },
      { symbol: 'τ', name: 'Motor Torque', formula: 'τ = N * I * A * B * sin(θ)' },
    ],
    arFeatures: [
      { title: 'DC Electric Motor 3D', description: 'Fully interactive rotor, stator, commutator, and magnetic flux visualizer', icon: 'Box' },
      { title: 'Lorentz Force Animation', description: 'Real-time magnetic field line simulation', icon: 'Play' },
    ],
    practiceCount: 20,
  },
  {
    id: 'magnetism',
    number: 9,
    title: 'Magnetism',
    classLevel: 'Class 10',
    description: 'Magnetic fields, magnetic materials, solenoids, electromagnetic induction, and transformers.',
    estimatedTime: '55 min',
    progress: 25,
    difficulty: 'Medium',
    hasAR: true,
    concepts: [
      { title: 'Electromagnetic Induction', description: 'Changing magnetic flux through a coil induces an EMF (Faraday’s Law).' },
    ],
    definitions: [
      { term: 'Magnetic Flux (Φ)', definition: 'Total number of magnetic field lines passing normally through a surface.' },
    ],
    formulas: [
      { symbol: 'EMF', name: "Faraday's Law", formula: 'ε = -N * (ΔΦ / Δt)' },
    ],
    arFeatures: [
      { title: 'Solenoid Magnetic Field 3D', description: 'Interactive magnetic field vector field', icon: 'Compass' },
    ],
    practiceCount: 14,
  },
  {
    id: 'optics',
    number: 10,
    title: 'Light & Geometric Optics',
    classLevel: 'Class 10',
    description: 'Reflection, refraction, spherical mirrors, lenses, optical instruments, and total internal reflection.',
    estimatedTime: '60 min',
    progress: 20,
    difficulty: 'Medium',
    hasAR: true,
    modelType: 'optics',
    concepts: [
      { title: 'Refraction & Snell’s Law', description: 'Bending of light when passing from one medium to another with different optical density.' },
    ],
    definitions: [
      { term: 'Refractive Index (n)', definition: 'Ratio of speed of light in vacuum to speed in medium (n = c / v).' },
    ],
    formulas: [
      { symbol: '1/f', name: 'Mirror / Lens Formula', formula: '1/f = 1/p + 1/q' },
      { symbol: 'n', name: "Snell's Law", formula: 'n₁ * sin(θ₁) = n₂ * sin(θ₂)' },
    ],
    arFeatures: [
      { title: '3D Ray Tracing Lens', description: 'Real-time focal point and virtual image simulation', icon: 'Sun' },
    ],
    practiceCount: 16,
  },
  {
    id: 'sound',
    number: 11,
    title: 'Sound & Waves',
    classLevel: 'Class 10',
    description: 'Sound propagation, speed of sound, echo, loudness, pitch, quality, and ultrasound applications.',
    estimatedTime: '45 min',
    progress: 0,
    difficulty: 'Easy',
    hasAR: true,
    concepts: [
      { title: 'Wave Motion', description: 'Transfer of energy without transfer of matter through longitudinal and transverse waves.' },
    ],
    definitions: [
      { term: 'Frequency (f)', definition: 'Number of vibrations produced per second (Hz).' },
    ],
    formulas: [
      { symbol: 'v', name: 'Wave Equation', formula: 'v = f * λ' },
    ],
    arFeatures: [
      { title: '3D Sound Wave Visualizer', description: 'Compressions and rarefactions interactive tube', icon: 'Volume2' },
    ],
    practiceCount: 10,
  },
  {
    id: 'heat',
    number: 12,
    title: 'Thermal Properties & Heat',
    classLevel: 'Class 11',
    description: 'Temperature, heat capacity, specific heat, latent heat of fusion and vaporization, and thermal expansion.',
    estimatedTime: '55 min',
    progress: 0,
    difficulty: 'Medium',
    hasAR: true,
    concepts: [
      { title: 'Thermal Expansion', description: 'Solids, liquids, and gases expand when heated due to increased kinetic energy.' },
    ],
    definitions: [
      { term: 'Specific Heat Capacity (c)', definition: 'Amount of heat required to raise temperature of 1 kg mass by 1 K.' },
    ],
    formulas: [
      { symbol: 'Q', name: 'Heat Energy', formula: 'Q = m * c * ΔT' },
    ],
    arFeatures: [
      { title: 'Molecular Motion 3D', description: 'Thermal agitation of atoms simulation', icon: 'Flame' },
    ],
    practiceCount: 12,
  },
];
