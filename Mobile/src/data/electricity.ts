import { ChapterItemData } from '../types';

export const ELECTRICITY_CHAPTERS: ChapterItemData[] = [
  {
    id: 'ch1',
    number: 1,
    title: 'Electric Charge',
    diagramsCount: 8,
    completed: true,
    locked: false,
  },
  {
    id: 'ch2',
    number: 2,
    title: 'Electric Field',
    diagramsCount: 10,
    completed: true,
    locked: false,
  },
  {
    id: 'ch3',
    number: 3,
    title: 'Electric Potential',
    diagramsCount: 7,
    completed: false,
    locked: true,
  },
  {
    id: 'ch4',
    number: 4,
    title: 'Capacitor',
    diagramsCount: 6,
    completed: false,
    locked: true,
  },
  {
    id: 'ch5',
    number: 5,
    title: 'Electric Current',
    diagramsCount: 9,
    completed: false,
    locked: true,
  },
];

export const ELECTRICITY_DIAGRAMS = [
  {
    id: 'motor',
    title: 'Electric Motor (DC)',
    views: '3D AR Ready',
    complexity: 'Intermediate',
    modelId: 'electric_motor',
    previewUrl: '',
  },
  {
    id: 'generator',
    title: 'AC Generator',
    views: '3D AR Ready',
    complexity: 'Advanced',
    modelId: 'electric_motor',
    previewUrl: '',
  },
  {
    id: 'transformer',
    title: 'Step-up Transformer',
    views: '3D Model',
    complexity: 'Beginner',
    modelId: 'electric_motor',
    previewUrl: '',
  },
];
