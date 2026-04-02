// libs/client.js
import { createClient } from 'microcms-js-sdk';

export const client = createClient({
  serviceDomain: 'r6z2f14pfd.microcms.io',
  apiKey: process.env.API_KEY || '',
});