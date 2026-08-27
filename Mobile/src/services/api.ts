import { scannerService } from './scannerService';
import { authService } from './authService';
import { aiService } from './aiService';

export const api = {
  scanner: scannerService,
  auth: authService,
  ai: aiService,
};

export default api;
