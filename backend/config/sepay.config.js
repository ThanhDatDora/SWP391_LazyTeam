/**
 * SePay Configuration
 * Cấu hình tích hợp SePay - Hệ thống thanh toán tự động qua QR Code
 * 
 * Đăng ký tài khoản tại: https://my.sepay.vn
 * Lấy API Key từ: Dashboard -> Cài đặt -> API Key
 */

export const sepayConfig = {
  // API Configuration
  apiUrl: process.env.SEPAY_API_URL || 'https://my.sepay.vn/userapi',
  apiKey: process.env.SEPAY_API_KEY || '', // Lấy từ SePay dashboard
  
  // Bank Account Info (Tài khoản ngân hàng nhận tiền)
  bankAccount: {
    accountNumber: process.env.BANK_ACCOUNT_NUMBER || '0123456789',
    accountName: process.env.BANK_ACCOUNT_NAME || 'MINI COURSERA',
    bankCode: process.env.BANK_CODE || 'MB', // MB Bank, VCB, TCB, etc.
    bankName: process.env.BANK_NAME || 'MB Bank',
  },

  // QR Code Configuration
  qrConfig: {
    template: 'compact', // compact, print, or qr_only
    amount: true, // Hiển thị số tiền trên QR
    description: true, // Hiển thị nội dung chuyển khoản
  },

  // Webhook Configuration
  webhook: {
    url: process.env.SEPAY_WEBHOOK_URL || 'http://localhost:3001/api/payment/sepay/webhook',
    secret: process.env.SEPAY_WEBHOOK_SECRET || 'your_webhook_secret_key',
  },

  // Payment Settings
  payment: {
    currency: 'VND',
    timeout: 900, // 15 phút timeout cho mỗi giao dịch
    minAmount: 10000, // Số tiền tối thiểu 10,000 VND
    maxAmount: 50000000, // Số tiền tối đa 50,000,000 VND
  },

  // Transaction Reference Format
  transactionPrefix: 'MCOURSE', // Prefix cho mã giao dịch: MCOURSE-123456

  // Auto-check interval (milliseconds)
  checkInterval: 5000, // Kiểm tra mỗi 5 giây
  maxCheckAttempts: 180, // Tối đa 180 lần (15 phút)
};

/**
 * Generate unique transaction reference
 * Format: MCOURSE-YYYYMMDDHHMMSS-RANDOM
 */
export function generateTransactionRef(paymentId) {
  const now = new Date();
  const timestamp = now.toISOString()
    .replace(/[-:T]/g, '')
    .slice(0, 14); // YYYYMMDDHHmmss
  
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${sepayConfig.transactionPrefix}${paymentId}${random}`;
}

/**
 * Format amount for display (VND currency)
 */
export function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
}

/**
 * Generate payment content/description
 * Format: MCOURSE [PaymentID] - [Customer Name]
 */
export function generatePaymentContent(paymentId, customerName = '') {
  const content = `${sepayConfig.transactionPrefix} ${paymentId}`;
  return customerName ? `${content} ${customerName}` : content;
}

/**
 * Validate webhook signature
 */
export function validateWebhookSignature(payload, signature) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', sepayConfig.webhook.secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}

export default sepayConfig;
