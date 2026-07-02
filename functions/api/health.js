import { success } from '../lib/response.js';

export async function onRequest() {
  return success({
    message: 'Photography Pixel API is running',
    timestamp: new Date().toISOString()
  });
}
