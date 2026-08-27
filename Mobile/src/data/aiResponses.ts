export interface KnowledgeEntry {
  keywords: string[];
  response: string;
  topic?: string;
  hasModelPreview?: boolean;
}

export const AI_KNOWLEDGE_BASE: KnowledgeEntry[] = [
  {
    keywords: ['how', 'work', 'electric motor', 'principle', 'operation'],
    response: 'An electric motor works on the principle that when a current-carrying conductor is placed in a magnetic field, it experiences a force. This force causes the coil to rotate continuously.\n\nAccording to Fleming\'s Left-Hand Rule, the magnetic forces on opposite arms of the rectangular coil act in opposite directions, producing a turning torque!',
    hasModelPreview: true,
  },
  {
    keywords: ['rotor', 'armature'],
    response: 'The **Rotor** (or armature) is the moving component in an electric motor. It consists of multiple turns of insulated copper wire wound around a laminated soft iron core. When electrical current flows through these coils, magnetic interaction with the stator causes it to spin and deliver mechanical output to the drive shaft.',
    hasModelPreview: false,
  },
  {
    keywords: ['stator', 'magnet', 'magnetic field'],
    response: 'The **Stator** is the stationary outer shell of the motor. It provides a fixed, uniform magnetic field using either high-coercivity permanent magnets (in small DC motors) or electromagnetic field coils (in larger industrial motors).',
    hasModelPreview: false,
  },
  {
    keywords: ['commutator', 'split ring', 'reverse'],
    response: 'The **Split-Ring Commutator** is a crucial rotary electrical switch! Every 180° of rotation (half-turn), the commutator reverses the connection of the coil to the battery, thereby reversing the direction of current in the coil. Without it, the coil would just oscillate back and forth instead of spinning continuously in one direction.',
    hasModelPreview: false,
  },
  {
    keywords: ['brush', 'carbon brush', 'contact'],
    response: '**Carbon Brushes** are spring-loaded stationary graphite blocks that slide gently against the spinning commutator rings. They maintain seamless electrical contact without entangling the external power wiring.',
    hasModelPreview: false,
  },
  {
    keywords: ['fleming', 'rule', 'left hand', 'force', 'lorentz'],
    response: "**Fleming's Left-Hand Rule**:\n• **ThuMb**: Direction of **Motion / Force**\n• **Forefinger**: Direction of **Magnetic Field** (N to S)\n• **Center finger**: Direction of **Current** (Positive to Negative)\n\nLorentz Force Formula: F = I * L * B * sin(θ)",
    hasModelPreview: false,
  },
  {
    keywords: ['efficiency', 'speed', 'torque', 'increase'],
    response: 'You can increase a motor\'s torque and rotational speed by:\n1. Increasing the electric current (I)\n2. Strengthening the magnetic field (B)\n3. Increasing the number of coil turns (N)\n4. Enlarging the area of the armature coil (A)\n\nTorque τ = N * I * A * B * sin(θ).',
    hasModelPreview: false,
  },
];

export const DEFAULT_AI_PROMPTS = [
  'How does an electric motor work?',
  'Explain in detail',
  'Quiz me',
  'What is Fleming’s Left-Hand Rule?',
  'Why do we need a commutator?',
];
