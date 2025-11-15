/**
 * SePay Service
 * Xử lý tích hợp với SePay API
 */

import axios from 'axios';
import { sepayConfig, generateTransactionRef, generatePaymentContent } from '../config/sepay.config.js';

class SepayService {
  constructor() {
    this.apiUrl = sepayConfig.apiUrl;
    this.apiKey = sepayConfig.apiKey;
  }

  /**
   * Generate QR Code for payment
   * @param {number} paymentId - Payment ID from database
   * @param {number} amount - Amount in VND
   * @param {string} customerName - Customer name
   * @returns {Promise<Object>} QR code data
   */
  async generateQRCode(paymentId, amount, customerName = '') {
    try {
      const transactionRef = generateTransactionRef(paymentId);
      const content = generatePaymentContent(paymentId, customerName);

      console.log('🔄 Generating QR code with:', {
        paymentId,
        amount,
        customerName,
        transactionRef,
        content,
        bankAccount: sepayConfig.bankAccount,
      });

      // Generate VietQR URL (simple, no API call needed)
      const bankCode = sepayConfig.bankAccount.bankCode;
      const accountNo = sepayConfig.bankAccount.accountNumber;
      const accountName = sepayConfig.bankAccount.accountName;
      const amountParam = amount;
      const description = encodeURIComponent(content);
      
      // VietQR URL format (works without API)
      const qrCodeUrl = `https://img.vietqr.io/image/${bankCode}-${accountNo}-compact2.png?amount=${amountParam}&addInfo=${description}&accountName=${encodeURIComponent(accountName)}`;
      
      console.log('✅ Generated VietQR URL:', qrCodeUrl);

      return {
        success: true,
        qrCode: qrCodeUrl, // Direct image URL
        qrContent: content, // Payment content
        transactionRef,
        content,
        bankInfo: {
          bankCode: sepayConfig.bankAccount.bankCode,
          bankName: sepayConfig.bankAccount.bankName,
          accountNumber: sepayConfig.bankAccount.accountNumber,
          accountName: sepayConfig.bankAccount.accountName,
        },
        amount,
        expiresAt: new Date(Date.now() + sepayConfig.payment.timeout * 1000),
      };
    } catch (error) {
      console.error('💥 Generate QR code error:', error.message);
      console.error('💥 Error details:', error.response?.data || error);
      return {
        success: false,
        error: error.response?.data?.desc || error.message,
      };
    }
  }

  /**
   * Check transaction status via SePay API
   * @param {string} transactionRef - Transaction reference
   * @param {number} amount - Expected amount
   * @returns {Promise<Object>} Transaction status
   */
  async checkTransaction(transactionRef, amount) {
    try {
      // If SePay API key is configured, use SePay API
      if (this.apiKey) {
        const response = await axios.get(`${this.apiUrl}/transactions`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
          },
          params: {
            limit: 50,
          },
        });

        if (response.data && response.data.transactions) {
          // Find matching transaction
          const transaction = response.data.transactions.find(tx => 
            tx.transaction_content && 
            tx.transaction_content.includes(transactionRef) &&
            parseFloat(tx.amount_in) === amount
          );

          if (transaction) {
            return {
              success: true,
              found: true,
              transaction: {
                id: transaction.id,
                amount: transaction.amount_in,
                content: transaction.transaction_content,
                bankAccount: transaction.account_number,
                transferDate: transaction.transaction_date,
                gatewayTransactionId: transaction.gateway_transaction_id,
              },
            };
          }
        }
      }

      // No transaction found
      return {
        success: true,
        found: false,
      };
    } catch (error) {
      console.error('Check transaction error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get bank account info for manual transfer
   * @returns {Object} Bank account information
   */
  getBankInfo() {
    return {
      bankCode: sepayConfig.bankAccount.bankCode,
      bankName: sepayConfig.bankAccount.bankName,
      accountNumber: sepayConfig.bankAccount.accountNumber,
      accountName: sepayConfig.bankAccount.accountName,
    };
  }

  /**
   * Verify webhook signature
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Signature from header
   * @returns {boolean} Is valid
   */
  verifyWebhookSignature(payload, signature) {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', sepayConfig.webhook.secret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    return signature === expectedSignature;
  }

  /**
   * Get recent transactions (for admin)
   * @returns {Promise<Array>} Recent transactions
   */
  async getRecentTransactions(limit = 20) {
    try {
      if (!this.apiKey) {
        return {
          success: false,
          error: 'SePay API key not configured',
        };
      }

      const response = await axios.get(`${this.apiUrl}/transactions`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
        params: {
          limit,
        },
      });

      if (response.data && response.data.transactions) {
        return {
          success: true,
          transactions: response.data.transactions.map(tx => ({
            id: tx.id,
            amount: tx.amount_in,
            content: tx.transaction_content,
            date: tx.transaction_date,
            bankAccount: tx.account_number,
            status: tx.status,
          })),
        };
      }

      return {
        success: false,
        error: 'No transactions found',
      };
    } catch (error) {
      console.error('Get recent transactions error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new SepayService();
