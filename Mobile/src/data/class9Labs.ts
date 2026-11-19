type Reading = [label: string, unit: string, example: number];
type Lab = {
  title: string;
  pages: string;
  model: string;
  apparatus: string;
  method: string;
  formula: string;
  readings: Reading[];
  calculate: (values: number[]) => [string, number, string][];
};

function positive(value: number) {
  if (value <= 0) throw new Error('Check the readings. This quantity must be greater than zero.');
  return value;
}

function count(value: number, min = 1, max = Infinity) {
  if (!Number.isInteger(value) || value < min || value > max) throw new Error('Enter a valid whole-number count.');
  return value;
}

export const class9Labs: Lab[] = [
  {
    title: 'Cross-sectional area with a Vernier caliper', pages: '1–2', model: 'caliper',
    apparatus: 'Vernier caliper and solid cylinder.',
    method: 'Close the jaws and record signed zero error. Measure the diameter at three positions, then average the corrected readings and halve the mean to get the radius.',
    formula: 'Dᵢ = MSRᵢ + nᵢ × LC − zero error; A = π(mean D/2)²',
    readings: [['Least count', 'cm', 0.01], ['Signed zero error', 'cm', 0],
      ['Trial 1 main scale', 'cm', 0.4], ['Trial 1 coincidence', '', 7],
      ['Trial 2 main scale', 'cm', 0.4], ['Trial 2 coincidence', '', 7],
      ['Trial 3 main scale', 'cm', 0.4], ['Trial 3 coincidence', '', 7]],
    calculate: ([lc, zero, a, an, b, bn, c, cn]) => {
      positive(lc);
      const corrected = (main: number, n: number) => positive(main + count(n, 0, 9) * lc - zero);
      const d = (corrected(a, an) + corrected(b, bn) + corrected(c, cn)) / 3;
      return [['Mean corrected diameter', d, 'cm'], ['Radius', d / 2, 'cm'], ['Area', Math.PI * (d / 2) ** 2, 'cm²']];
    },
  },
  {
    title: 'Volume of a solid cylinder with a Vernier caliper', pages: '3–6', model: 'caliper',
    apparatus: 'Vernier caliper, solid cylinder and magnifying lens.',
    method: 'Use the outside jaws to measure the length and diameter. Take multiple readings, correct each for zero error, and enter the two means.',
    formula: 'V = π(D/2)²L',
    readings: [['Mean corrected diameter', 'cm', 2], ['Mean corrected length', 'cm', 5]],
    calculate: ([d, l]) => [['Volume', Math.PI * (positive(d) / 2) ** 2 * positive(l), 'cm³']],
  },
  {
    title: 'Thickness of a strip or wire with a micrometer', pages: '7–8', model: 'micrometer',
    apparatus: 'Micrometer screw gauge and metal strip or wire.',
    method: 'Find pitch and least count, check the closed gauge for zero error, and gently close the spindle on the sample using the ratchet. Repeat at different points.',
    formula: 'LC = pitch / scale divisions; thickness = MSR + n × LC − zero error',
    readings: [['Sleeve reading', 'mm', 0.5], ['Thimble reading', '', 25], ['Pitch', 'mm', 0.5], ['Divisions per revolution', '', 50], ['Signed zero error', 'mm', 0]],
    calculate: ([main, n, pitch, divisions, zero]) => {
      const lc = positive(pitch) / count(divisions);
      return [['Least count', lc, 'mm'], ['Thickness', positive(main + count(n, 0, divisions - 1) * lc - zero), 'mm']];
    },
  },
  {
    title: 'Motion of a ball rolling down an inclined track', pages: '9–10', model: 'ramp',
    apparatus: 'Angle iron, ball, stand and stopwatch.',
    method: 'Release the ball from rest. Repeat the timing at several marked distances and plot displacement against squared mean time. Twice the slope is the acceleration.',
    formula: 's = ½at²; a = 2s/t²',
    readings: [['Distance', 'm', 0.6], ['Mean time', 's', 1.2]],
    calculate: ([s, t]) => [['Squared time', positive(t) ** 2, 's²'], ['Acceleration', 2 * positive(s) / t ** 2, 'm/s²']],
  },
  {
    title: 'Gravitational acceleration by free fall', pages: '11–12', model: 'drop',
    apparatus: 'Free-fall board, release mechanism, metallic ball, paper and meter rule.',
    method: 'Measure vertical fall from the release point and record the corresponding time. For timing from an oscillating marker, convert the number of intervals to elapsed time first.',
    formula: 'g = 2h/t²',
    readings: [['Fall distance', 'm', 0.49], ['Elapsed time', 's', 0.316]],
    calculate: ([h, t]) => [['Gravitational acceleration', 2 * positive(h) / positive(t) ** 2, 'm/s²']],
  },
  {
    title: 'Limiting friction and the coefficient of friction', pages: '13–14', model: 'block',
    apparatus: 'Wood block, horizontal board, pulley, thread, pan and weights.',
    method: 'Increase the suspended load until the block is about to move. Repeat for several normal loads. Plot limiting friction against normal reaction.',
    formula: 'μ = limiting friction / normal reaction',
    readings: [['Limiting pull', 'N', 1.2], ['Normal reaction', 'N', 4]],
    calculate: ([f, n]) => [['Coefficient of friction', positive(f) / positive(n), '']],
  },
  {
    title: 'Limiting force for rolling a roller', pages: '15–16', model: 'roller',
    apparatus: 'Roller, horizontal board, pulley, thread, pan and weights.',
    method: 'Keep the pull horizontal and add weights gradually until the roller just starts moving. Include the empty pan in the suspended mass.',
    formula: 'F = suspended mass × g',
    readings: [['Total suspended mass', 'kg', 0.05], ['Gravitational acceleration', 'm/s²', 9.81]],
    calculate: ([m, g]) => [['Limiting pull', positive(m) * positive(g), 'N']],
  },
  {
    title: 'Principle of moments with a balanced meter rule', pages: '17–18', model: 'lever',
    apparatus: 'Meter rule, pivot and hanging weights.',
    method: 'Balance the bare rule first. Suspend weights on opposite sides and measure perpendicular distances from the pivot after rebalancing.',
    formula: 'Clockwise moment = anticlockwise moment at equilibrium; τ = Fd',
    readings: [['Left weight', 'N', 2], ['Left arm', 'm', 0.3], ['Right weight', 'N', 3], ['Right arm', 'm', 0.2]],
    calculate: ([l, ld, r, rd]) => {
      const left = positive(l) * positive(ld), right = positive(r) * positive(rd);
      const net = Math.abs(right - left) <= Number.EPSILON * Math.max(left, right) ? 0 : right - left;
      return [['Anticlockwise moment', left, 'N·m'], ['Clockwise moment', right, 'N·m'], ['Net clockwise moment', net, 'N·m']];
    },
  },
  {
    title: 'Unknown weight by vector addition of forces', pages: '19–21', model: 'force-table',
    apparatus: 'Horizontal force table, threads, weights, spring balance, paper and meter rule.',
    method: 'Bring the three forces into equilibrium. Trace the two known force directions and construct their resultant to scale. The unknown weight acts opposite the resultant.',
    formula: 'R = √(F₁² + F₂² + 2F₁F₂ cos θ)',
    readings: [['First force', 'N', 2], ['Second force', 'N', 3], ['Angle between forces', '°', 90]],
    calculate: ([a, b, angle]) => {
      if (angle < 0 || angle > 180) throw new Error('Use an included angle between 0° and 180°.');
      positive(a); positive(b);
      const radians = angle * Math.PI / 180;
      return [['Unknown weight', Math.hypot(a + b * Math.cos(radians), b * Math.sin(radians)), 'N']];
    },
  },
  {
    title: 'Unknown mass using the principle of moments', pages: '22–24', model: 'lever',
    apparatus: 'Meter rule, pivot, known masses and unknown object.',
    method: 'Balance the ruler, then place the unknown and known mass on opposite sides. Measure each arm from the pivot. With both masses in the same gravitational field, g cancels.',
    formula: 'mₓ = mₖdₖ/dₓ',
    readings: [['Known mass', 'g', 50], ['Known arm', 'cm', 15], ['Unknown arm', 'cm', 30]],
    calculate: ([m, d, x]) => [['Unknown mass', positive(m) * positive(d) / positive(x), 'g']],
  },
  {
    title: 'Simple pendulum and gravitational acceleration', pages: '25–26', model: 'pendulum',
    apparatus: 'Stand, thread, metallic bob, meter rule, Vernier caliper and stopwatch.',
    method: 'Measure from the suspension point to the bob centre. Release at a small angle and time several complete oscillations. Repeat at different lengths.',
    formula: 'T = t/n; g = 4π²L/T²',
    readings: [['Pendulum length', 'm', 0.8], ['Total time', 's', 36], ['Oscillations', '', 20]],
    calculate: ([l, t, n]) => {
      const period = positive(t) / count(n);
      return [['Period', period, 's'], ['Gravitational acceleration', 4 * Math.PI ** 2 * positive(l) / period ** 2, 'm/s²']];
    },
  },
  {
    title: 'Load and extension of a helical spring', pages: '27–28', model: 'spring',
    apparatus: 'Helical spring, stand, ruler, pointer and slotted masses.',
    method: 'Read the unloaded spring length, then add loads in steps within its elastic range. Plot load against extension. The slope is the spring constant.',
    formula: 'x = loaded length − initial length; k = F/x',
    readings: [['Initial length', 'm', 0.15], ['Loaded length', 'm', 0.2], ['Load', 'N', 2]],
    calculate: ([a, b, f]) => [['Extension', positive(b - positive(a)), 'm'], ['Spring constant', positive(f) / (b - a), 'N/m']],
  },
  {
    title: 'Density of a solid by Archimedes’ principle', pages: '29–30', model: 'buoyancy',
    apparatus: 'Balance, beaker of water, thread, dense solid and weights.',
    method: 'Weigh the solid in air, then suspend it fully in water without touching the beaker. The difference in weight is the buoyant force.',
    formula: 'ρsolid = ρwater × Wair/(Wair − Wwater)',
    readings: [['Weight in air', 'N', 5], ['Apparent weight in water', 'N', 4], ['Water density', 'g/cm³', 1]],
    calculate: ([a, b, density]) => [['Buoyant force', positive(a - positive(b)), 'N'], ['Solid density', positive(density) * a / (a - b), 'g/cm³']],
  },
  {
    title: 'Density of a liquid with a 5 mL syringe', pages: '31', model: 'syringe',
    apparatus: 'Needle-free graduated syringe, balance and liquid sample.',
    method: 'Weigh the empty syringe. Draw a measured volume without air bubbles, then weigh again. Subtract the empty mass.',
    formula: 'ρ = (filled mass − empty mass)/V',
    readings: [['Empty mass', 'g', 3], ['Filled mass', 'g', 8], ['Volume', 'mL', 5]],
    calculate: ([a, b, volume]) => {
      if (volume > 5) throw new Error('This syringe holds at most 5 mL.');
      const m = positive(b - positive(a));
      return [['Liquid mass', m, 'g'], ['Liquid density', m / positive(volume), 'g/mL']];
    },
  },
  {
    title: 'Specific heat capacity by the method of mixtures', pages: '32–33', model: 'calorimeter',
    apparatus: 'Polystyrene cup, water, hot solid sample, thermometer and balance.',
    method: 'Record the water and hot sample temperatures. Transfer the sample into the insulated cup and record the equilibrium temperature. Assume negligible heat transfer to the cup and surroundings.',
    formula: 'csolid = mw × cw × (Tf − Tw) / [ms × (Ts − Tf)]',
    readings: [['Water mass', 'kg', 0.1], ['Solid mass', 'kg', 0.1], ['Water initial temperature', '°C', 20], ['Solid initial temperature', '°C', 100], ['Final temperature', '°C', 30]],
    calculate: ([mw, ms, tw, ts, tf]) => {
      if (!(tw < tf && tf < ts)) throw new Error('Final temperature must lie between the starting temperatures.');
      return [['Specific heat capacity', positive(mw) * 4186 * (tf - tw) / (positive(ms) * (ts - tf)), 'J/(kg·K)']];
    },
  },
  {
    title: 'Heating curve from ice to steam', pages: '34–36', model: 'heating',
    apparatus: 'Ice, beaker, thermometer, stopwatch and laboratory heat source.',
    method: 'Record temperature at regular times during slow heating. Plot time horizontally and temperature vertically. Identify the melting and boiling plateaus.',
    formula: 'Slope = (T₂ − T₁)/(t₂ − t₁)',
    readings: [['Start time', 'min', 2], ['End time', 'min', 4], ['Start temperature', '°C', 0], ['End temperature', '°C', 20]],
    calculate: ([a, b, c, d]) => [['Temperature change', d - c, '°C'], ['Heating rate', (d - c) / positive(b - a), '°C/min']],
  },
];

export const class9LabsByChapter: Record<string, number[]> = {
  physical_quantities: [1, 2, 3],
  kinematics: [4],
  dynamics: [6, 7, 9],
  turning_effect: [8, 10],
  gravitation: [5, 11],
  properties_of_matter: [12, 13, 14],
  heat: [15, 16],
};

export const practicalUnityModels: Record<number, string | undefined> = {
  1: 'exp_vernier_caliper',
  2: 'exp_vernier_caliper',
  3: 'exp3_micrometer',
};
