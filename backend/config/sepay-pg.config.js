/**
 * SePay Payment Gateway Configuration
 * Using sepay-pg-node SDK
 */

import { SePayPgClient } from 'sepay-pg-node';

export const sepayPgConfig = {
  env: process.env.SEPAY_ENV || 'sandbox',
  merchantId: process.env.SEPAY_MERCHANT_ID || '',
  secretKey: process.env.SEPAY_SECRET_KEY || '',
  successUrl: process.env.SEPAY_SUCCESS_URL || 'http://localhost:5173/payment/sepay/success',
  errorUrl: process.env.SEPAY_ERROR_URL || 'http://localhost:5173/payment/sepay/error',
  cancelUrl: process.env.SEPAY_CANCEL_URL || 'http://localhost:5173/payment/sepay/cancel',
  ipnUrl: process.env.SEPAY_IPN_URL || 'http://localhost:3001/api/payment/sepay/ipn',
};

// Initialize SePay PG Client
export const sepayClient = new SePayPgClient({
  env: sepayPgConfig.env,
  merchant_id: sepayPgConfig.merchantId,
  secret_key: sepayPgConfig.secretKey,
});

export default sepayClient;
