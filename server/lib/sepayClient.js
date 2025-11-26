import { SePayPgClient } from 'sepay-pg-node';

const env = (process.env.SEPAY_ENV || 'sandbox').toLowerCase();

// Chấp nhận cả 'production' và 'product' đều map về 'production'
const sepayEnv = (env === 'production' || env === 'product') ? 'production' : 'sandbox';

export const sepayClient = new SePayPgClient({
  env: sepayEnv,
  merchant_id: process.env.SEPAY_MERCHANT_ID,
  secret_key: process.env.SEPAY_SECRET_KEY || process.env.SEPAY_TEST_SECRET
});

export default sepayClient;
