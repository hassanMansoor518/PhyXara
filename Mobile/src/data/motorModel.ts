import { MotorPartLabel } from '../types';

export const MOTOR_PARTS: Record<string, { title: string; description: string; role: string }> = {
  stator: {
    title: 'Stator (Field Magnets)',
    description: 'The stationary outer casing housing powerful permanent magnets or electromagnets that establish a strong, uniform magnetic field across the armature.',
    role: 'Provides radial magnetic flux.',
  },
  rotor: {
    title: 'Rotor (Armature Coil)',
    description: 'The rotating copper wire coil wound over a soft iron core. When energized with current, it experiences opposing Lorentz forces on its parallel sides, creating torque.',
    role: 'Carries current and generates rotational torque.',
  },
  commutator: {
    title: 'Split-Ring Commutator',
    description: 'A cylindrical copper ring split into isolated segments. It rotates synchronously with the rotor shaft and periodically reverses current direction every 180 degrees.',
    role: 'Reverses coil current to sustain continuous rotation.',
  },
  brushes: {
    title: 'Carbon Brushes',
    description: 'Conductive carbon/graphite blocks pressed against the rotating split-ring segments with spring tension to supply current without tangling wires.',
    role: 'Transfers external electrical power to the rotating commutator.',
  },
};

export const MOTOR_FRONT_LABELS: MotorPartLabel[] = [
  {
    id: 'stator',
    name: 'Stator',
    top: 24,
    left: 20,
    description: 'Permanent magnetic stator frame providing magnetic field',
  },
  {
    id: 'rotor',
    name: 'Rotor',
    top: 36,
    left: 80,
    description: 'Armature windings rotated by magnetic torque',
  },
  {
    id: 'commutator',
    name: 'Commutator',
    top: 68,
    left: 22,
    description: 'Split ring maintaining continuous directional rotation',
  },
];

export const MOTOR_EXPLODED_LABELS: MotorPartLabel[] = [
  {
    id: 'stator',
    name: 'Stator Housing',
    top: 28,
    left: 18,
    description: 'Outer magnetic casing',
  },
  {
    id: 'rotor',
    name: 'Rotor Core',
    top: 24,
    left: 78,
    description: 'Copper winding assembly',
  },
  {
    id: 'commutator',
    name: 'Commutator',
    top: 64,
    left: 76,
    description: 'Split rings mounted on drive shaft',
  },
  {
    id: 'brushes',
    name: 'Brushes',
    top: 66,
    left: 24,
    description: 'Carbon contact brushes',
  },
];
