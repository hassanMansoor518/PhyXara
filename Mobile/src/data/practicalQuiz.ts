import { class9Labs } from './class9Labs.ts';

type Item = [question: string, correct: string, wrong1: string, wrong2: string, wrong3: string, explanation: string];
const bank: Item[][] = [
  [
    ['What is the least count of the caliper used in this practical?', '0.01 cm', '0.1 cm', '0.001 cm', '1 cm', 'One 1 mm main-scale division divided by ten gives 0.1 mm, or 0.01 cm.'],
    ['How is the radius obtained?', 'Halve the corrected mean diameter', 'Double the corrected mean diameter', 'Square the corrected mean diameter', 'Divide the diameter by π', 'The radius is half the diameter.'],
    ['Why measure at three positions?', 'To reduce the effect of reading variation', 'To increase the least count', 'To remove the cylinder’s weight', 'To make the jaws parallel', 'Repeated readings reduce the influence of an unusual single reading.'],
  ],
  [
    ['Which two dimensions determine the cylinder volume?', 'Length and diameter', 'Mass and length', 'Length and weight', 'Diameter and density', 'Volume is cross-sectional area multiplied by length.'],
    ['Which jaws measure the outside diameter?', 'Outside jaws', 'Inside jaws', 'Depth rod', 'Lock screw', 'Outside jaws contact opposite exterior surfaces.'],
    ['What happens to volume if diameter doubles at fixed length?', 'It becomes four times larger', 'It doubles', 'It stays unchanged', 'It halves', 'Cross-sectional area is proportional to diameter squared.'],
  ],
  [
    ['Which part helps apply consistent pressure?', 'Ratchet', 'Sleeve scale', 'Frame', 'Anvil alone', 'The ratchet limits tightening force.'],
    ['What is the pitch of a screw gauge?', 'Spindle advance per full turn', 'The spindle diameter', 'The gap when closed', 'The number of thimble markings', 'Pitch measures axial travel during one complete turn.'],
    ['How is signed zero error corrected?', 'Subtract it from the observed reading', 'Always add its magnitude', 'Multiply by it', 'Replace the least count with it', 'A signed offset is removed by subtraction.'],
  ],
  [
    ['What is on the horizontal axis for the acceleration graph?', 'Time squared', 'Distance squared', 'Ball mass', 'Speed', 'For release from rest, displacement is proportional to elapsed time squared.'],
    ['What equals twice the slope of displacement against time squared?', 'Acceleration', 'Initial speed', 'Ball mass', 'Time', 'The coefficient in s = ½at² is a/2.'],
    ['How should the ball be released?', 'From rest without pushing', 'With a short push', 'After it is already rolling', 'By tossing it into the track', 'The formula assumes zero initial velocity.'],
  ],
  [
    ['Which distance is used to calculate g?', 'Vertical distance fallen', 'Length of the stopwatch', 'Horizontal displacement', 'Diameter of the ball', 'Gravitational acceleration is measured in the vertical direction.'],
    ['What must be recorded along with height?', 'Elapsed fall time', 'Room width', 'Ball colour', 'Board thickness', 'The calculation uses g = 2h/t².'],
    ['What starting condition is assumed?', 'Release from rest', 'Constant downward speed', 'Upward throw', 'Constant horizontal speed', 'The 2h/t² relation assumes zero initial vertical velocity.'],
  ],
  [
    ['When is limiting static friction measured?', 'Just before the block slides', 'After steady sliding begins', 'When the pulley stops turning', 'After removing all normal load', 'Limiting friction is the maximum static friction.'],
    ['What does the slope of friction against normal reaction represent?', 'Coefficient of friction', 'Mass of the pan', 'Acceleration of the block', 'The block’s width', 'The relation F = μN has slope μ.'],
    ['What is the unit of the coefficient of friction?', 'No unit', 'Newton', 'Kilogram', 'Metre per second', 'It is a ratio of two forces in newtons.'],
  ],
  [
    ['What is the threshold in this experiment?', 'The roller just starts moving', 'The roller reaches top speed', 'The pan touches the floor', 'The roller stops again', 'Record the suspended load at the onset of rolling.'],
    ['What should be included in suspended mass?', 'The pan and all added masses', 'Only the last added mass', 'The roller alone', 'The board and pulley', 'Both pan and added masses contribute to the pull.'],
    ['In which direction should the string pull the roller?', 'Horizontally', 'Straight up', 'Straight down', 'Along the axle', 'A horizontal pull preserves the intended loading geometry.'],
  ],
  [
    ['Where is the lever arm measured from?', 'The pivot', 'The zero mark regardless of pivot position', 'The nearest ruler end', 'The centre of the hanging weight', 'Moment uses the perpendicular distance from the pivot to the force line.'],
    ['What balances clockwise moment?', 'An equal anticlockwise moment', 'An equal clockwise moment', 'A longer ruler alone', 'A larger pivot mass', 'Opposite moments cancel in rotational equilibrium.'],
    ['What is the SI unit of moment?', 'N·m', 'N/m', 'kg/m', 'm/s²', 'Moment is force in newtons times perpendicular distance in metres.'],
  ],
  [
    ['Which force balances the resultant of two known forces?', 'An equal force in the opposite direction', 'An equal force in the same direction', 'Half the resultant', 'A force perpendicular to the resultant', 'The three forces add to zero at equilibrium.'],
    ['When can the two magnitudes be added directly?', 'When the forces point in the same direction', 'When the forces are perpendicular', 'When the forces oppose each other', 'At every included angle', 'Vectors in the same direction have a resultant equal to their sum.'],
    ['How do you obtain the resultant graphically?', 'Draw the vectors to scale and complete their sum', 'Add the angles only', 'Measure one thread only', 'Ignore the arrow directions', 'A head-to-tail or parallelogram construction preserves direction and scale.'],
  ],
  [
    ['Why does g cancel in the unknown-mass equation?', 'Both masses are in the same gravitational field', 'The masses have no weight', 'Both arms are always equal', 'The ruler moves at constant speed', 'The factor g appears on both sides of the balance equation.'],
    ['What happens to the required unknown mass if its arm doubles?', 'It halves', 'It doubles', 'It quadruples', 'It stays unchanged', 'Mass and arm length are inversely related for the same moment.'],
    ['Why balance the bare rule first?', 'To avoid an extra moment from the rule’s own weight', 'To increase the unknown mass', 'To increase gravity', 'To change the unit of force', 'Balancing first places the rule’s weight line through the pivot.'],
  ],
  [
    ['From where to where is pendulum length measured?', 'Suspension point to bob centre', 'Stand base to bob bottom', 'Suspension point to bob top', 'Bob top to bob bottom', 'The effective length ends at the bob’s centre of mass.'],
    ['How is the period found from 20 complete oscillations?', 'Divide total time by 20', 'Multiply total time by 20', 'Use half the total time', 'Add 20 seconds', 'The period is the time for one complete oscillation.'],
    ['Why release the bob at a small angle?', 'To make the small-angle period formula applicable', 'To change the bob mass', 'To make its length zero', 'To make air resistance larger', 'The simple period expression approximates small-angle motion.'],
  ],
  [
    ['How is spring extension found?', 'Loaded length minus unloaded length', 'Loaded length plus unloaded length', 'Force divided by loaded length', 'Unloaded length minus loaded length', 'Extension is the increase from the original length.'],
    ['What does the slope of load against extension represent?', 'Spring constant', 'Spring mass', 'Gravity', 'Original length', 'For an elastic spring, F = kx.'],
    ['What loading limit should be respected?', 'The spring’s elastic range', 'The ruler’s longest marking only', 'The weight of the stand', 'The colour of the pointer', 'Beyond the elastic range the spring may not return to its original length.'],
  ],
  [
    ['What does the loss of apparent weight in water measure?', 'Buoyant force', 'Mass of the beaker', 'Weight in air', 'Water density directly', 'The upward buoyant force reduces the apparent weight.'],
    ['How should the object be positioned in the water?', 'Fully submerged without touching the beaker', 'Resting on the bottom', 'Half immersed', 'Floating free at the surface', 'Full immersion measures displaced volume while avoiding support from the beaker.'],
    ['Which liquid property enters the density calculation?', 'Density of water', 'Surface area of water', 'Depth of the bench', 'Water colour', 'The solid-to-water density ratio is Wair divided by the loss of weight.'],
  ],
  [
    ['How do you obtain the mass of the liquid?', 'Subtract empty syringe mass from filled mass', 'Use filled syringe mass directly', 'Add both measured masses', 'Divide the empty mass by volume', 'Subtracting the tare isolates the liquid mass.'],
    ['Why remove air bubbles?', 'They make the reading overstate liquid volume', 'They increase the syringe’s markings', 'They make the syringe heavier than metal', 'They change the balance units', 'Trapped air occupies part of the measured volume.'],
    ['Which volume unit equals one cubic centimetre?', 'One millilitre', 'One litre', 'One cubic metre', 'One milligram', 'A millilitre and a cubic centimetre denote the same volume.'],
  ],
  [
    ['Why use a polystyrene cup?', 'To reduce heat exchange with the surroundings', 'To raise the boiling point of water', 'To increase the sample mass', 'To measure the force on the solid', 'Polystyrene provides thermal insulation.'],
    ['What must be true of the equilibrium temperature?', 'It lies between the initial temperatures', 'It exceeds both initial temperatures', 'It is below both initial temperatures', 'It always equals the hot sample temperature', 'The hot solid cools as the cooler water warms.'],
    ['What is equated in the ideal mixture calculation?', 'Heat lost by the solid and heat gained by water', 'The masses of solid and water', 'The initial temperatures', 'The starting volumes', 'Energy transferred out of the hot solid warms the water if other heat transfers are negligible.'],
  ],
  [
    ['Which quantity goes on the horizontal axis?', 'Time', 'Temperature', 'Specific heat capacity', 'Mass of the beaker', 'A heating curve shows how temperature changes over time.'],
    ['What does a melting plateau indicate?', 'Energy changes phase with little temperature rise', 'The sample stops absorbing energy', 'The thermometer no longer works', 'Water density is zero', 'During melting, input energy supplies latent heat.'],
    ['What does the slope of a rising segment measure?', 'Rate of temperature rise', 'Volume of steam', 'Total mass of ice', 'Latent heat directly', 'Slope is the change in temperature divided by elapsed time.'],
  ],
];

export function practicalQuiz(number: number) {
  const lab = class9Labs[number - 1];
  if (!lab) return [];
  const [label, value, unit] = lab.calculate(lab.readings.map(([, , example]) => example)).filter(([, result]) => result !== 0).at(-1)!;
  const display = (n: number) => Number(n.toPrecision(4)) + (unit ? ' ' + unit : '');
  const example = lab.readings.map(([name, units, n]) => name + ' = ' + n + (units ? ' ' + units : '')).join(', ');
  const numerical: Item = ['Using these readings, find ' + label.toLowerCase() + '. ' + example,
    display(value), display(value * 2), display(value / 2), display(-value),
    'Substitute the given readings into ' + lab.formula + '. The result is ' + display(value) + '.'];
  const otherApparatus = [...new Set(class9Labs.map(item => item.apparatus))]
    .filter(apparatus => apparatus !== lab.apparatus);
  const apparatusQuestion: Item = ['Which equipment list matches this practical?', lab.apparatus,
    ...otherApparatus.slice(0, 3) as [string, string, string],
    'The apparatus listed in the manual is: ' + lab.apparatus];
  return [...bank[number - 1], numerical, apparatusQuestion].map(([question, answer, ...rest], index) => {
    const options = rest.slice(0, 3);
    const correct = (number + index * 3) % 4;
    options.splice(correct, 0, answer);
    return { question, options, correct, explanation: rest[3] };
  });
}
