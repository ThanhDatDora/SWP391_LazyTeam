import { PayOS } from '@payos/node';
import crypto from 'crypto';

/**
 * PayOS Payment Service
 * Handles payment link creation, webhook verification, and payment status checks
 */
class PayOSService {
  constructor() {
    const clientId = process.env.PAYOS_CLIENT_ID;
    const apiKey = process.env.PAYOS_API_KEY;
    const checksumKey = process.env.PAYOS_CHECKSUM_KEY;

    if (!clientId || !apiKey || !checksumKey) {
      console.error('❌ PayOS credentials missing in .env file');
      throw new Error('PayOS configuration incomplete');
    }

    // Initialize PayOS SDK
    this.payOS = new PayOS(clientId, apiKey, checksumKey);
    this.checksumKey = checksumKey;

    console.log('✅ PayOS Service initialized successfully');
  }

  /**
   * Create payment link for course purchase
   * @param {Object} paymentData - Payment information
   * @param {string} paymentData.orderCode - Unique order code (max 12 digits)
   * @param {number} paymentData.amount - Amount in VND (integer)
   * @param {string} paymentData.description - Payment description
   * @param {string} paymentData.buyerName - Customer name
   * @param {string} paymentData.buyerEmail - Customer email
   * @param {string} paymentData.buyerPhone - Customer phone
   * @param {string} paymentData.returnUrl - Success redirect URL
   * @param {string} paymentData.cancelUrl - Cancel redirect URL
   * @returns {Promise<Object>} Payment link data with QR code
   */
  async createPaymentLink(paymentData) {
    try {
      const {
        orderCode,
        amount,
        description,
        buyerName,
        buyerEmail,
        buyerPhone,
        returnUrl,
        cancelUrl,
      } = paymentData;

      // Validate required fields
      if (!orderCode || !amount || !description) {
        throw new Error('Missing required payment fields');
      }

      // PayOS payment body
      const paymentBody = {
        orderCode: parseInt(orderCode),
        amount: parseInt(amount), // Amount in VND (integer)
        description: description,
        buyerName: buyerName || 'Khách hàng',
        buyerEmail: buyerEmail || '',
        buyerPhone: buyerPhone || '',
        returnUrl: returnUrl || process.env.PAYOS_RETURN_URL,
        cancelUrl: cancelUrl || process.env.PAYOS_CANCEL_URL,
      };

      console.log('🔄 Creating PayOS payment link:', paymentBody);

      // Create payment link - Use correct PayOS SDK method
      const paymentLinkResponse = await this.payOS.paymentRequests.create(paymentBody);

      console.log('✅ PayOS payment link created:', paymentLinkResponse);

      return {
        success: true,
        data: {
          orderCode: paymentLinkResponse.orderCode,
          amount: paymentLinkResponse.amount,
          description: paymentLinkResponse.description,
          checkoutUrl: paymentLinkResponse.checkoutUrl,
          qrCode: paymentLinkResponse.qrCode, // QR code data URL
          paymentLinkId: paymentLinkResponse.paymentLinkId,
          status: paymentLinkResponse.status,
        },
      };
    } catch (error) {
      console.error('❌ PayOS create payment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to create payment link',
      };
    }
  }

  /**
   * Get payment information by order code
   * @param {number} orderCode - Order code
   * @returns {Promise<Object>} Payment information
   */
  async getPaymentInfo(orderCode) {
    try {
      console.log('🔄 Getting PayOS payment info for order:', orderCode);

      const paymentInfo = await this.payOS.paymentRequests.get(parseInt(orderCode));

      console.log('✅ PayOS payment info:', paymentInfo);

      return {
        success: true,
        data: paymentInfo,
      };
    } catch (error) {
      console.error('❌ PayOS get payment info error:', error);
      return {
        success: false,
        error: error.message || 'Failed to get payment info',
      };
    }
  }

  /**
   * Cancel payment link
   * @param {number} orderCode - Order code
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelPaymentLink(orderCode) {
    try {
      console.log('🔄 Cancelling PayOS payment link:', orderCode);

      const cancelResult = await this.payOS.paymentRequests.cancel(parseInt(orderCode));

      console.log('✅ PayOS payment link cancelled:', cancelResult);

      return {
        success: true,
        data: cancelResult,
      };
    } catch (error) {
      console.error('❌ PayOS cancel payment error:', error);
      return {
        success: false,
        error: error.message || 'Failed to cancel payment link',
      };
    }
  }

  /**
   * Verify webhook signature
   * @param {Object} webhookBody - Webhook request body
   * @param {string} receivedSignature - Signature from webhook header
   * @returns {boolean} True if signature is valid
   */
  verifyWebhookSignature(webhookBody, receivedSignature) {
    try {
      // PayOS webhook signature verification
      // Sort keys alphabetically and create signature string
      const sortedKeys = Object.keys(webhookBody).sort();
      const signatureString = sortedKeys
        .map(key => `${key}=${webhookBody[key]}`)
        .join('&');

      // Create HMAC SHA256 hash
      const expectedSignature = crypto
        .createHmac('sha256', this.checksumKey)
        .update(signatureString)
        .digest('hex');

      const isValid = expectedSignature === receivedSignature;

      if (isValid) {
        console.log('✅ PayOS webhook signature verified');
      } else {
        console.warn('⚠️ PayOS webhook signature mismatch');
        console.log('Expected:', expectedSignature);
        console.log('Received:', receivedSignature);
      }

      return isValid;
    } catch (error) {
      console.error('❌ PayOS webhook signature verification error:', error);
      return false;
    }
  }

  /**
   * Verify PayOS webhook data using SDK
   * @param {Object} webhookData - Webhook data from PayOS
   * @returns {Promise<Object>} Verified payment data (throws error if invalid)
   */
  async verifyWebhookData(webhookData) {
    // PayOS SDK method: webhooks.verify() - returns Promise
    // Throws error if verification fails
    const verificationResult = await this.payOS.webhooks.verify(webhookData);
    
    console.log('✅ PayOS webhook data verified:', verificationResult);
    
    return verificationResult;
  }

  /**
   * Generate unique order code (max 12 digits for PayOS)
   * Format: timestamp (10 digits) + random (2 digits)
   * @returns {string} Unique order code
   */
  generateOrderCode() {
    const timestamp = Math.floor(Date.now() / 1000); // 10 digits
    const random = Math.floor(Math.random() * 100); // 2 digits
    const orderCode = `${timestamp}${random.toString().padStart(2, '0')}`;
    
    // Ensure it's within 12 digits
    return orderCode.slice(-12);
  }

  /**
   * Convert USD to VND for PayOS (PayOS only accepts VND)
   * @param {number} usdAmount - Amount in USD
   * @param {number} exchangeRate - USD to VND exchange rate (default: 24000)
   * @returns {number} Amount in VND (integer)
   */
  convertUSDtoVND(usdAmount, exchangeRate = 24000) {
    return Math.round(usdAmount * exchangeRate);
  }
}

// Export singleton instance
const payosService = new PayOSService();
export default payosService;
