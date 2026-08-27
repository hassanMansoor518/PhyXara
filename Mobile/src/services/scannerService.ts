import { ScanResult } from '../types';

export const scanDiagram = async (imageUri?: string): Promise<ScanResult> => {
  // Simulate asynchronous network/computer vision processing time
  await new Promise((resolve) => setTimeout(resolve, 800));

  return {
    detected: true,
    object: 'electric_motor',
    name: 'Electric Motor',
    confidence: 0.96,
    imageUri: imageUri || '',
  };
};

export const scannerService = {
  scanDiagram,
};

export default scannerService;
