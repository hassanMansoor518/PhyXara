import { aiService } from './aiService';
import { authService } from './authService';
import { progressService } from './progressService';
import { scannerService } from './scannerService';

export const api = {
  scanner: scannerService,
  auth: authService,
  ai: aiService,
  progress: progressService,
};

export default api;
