/**
 * Currency conversion utilities
 */

// Tỷ giá USD -> VND (cập nhật theo thị trường)
// 1 USD = ~25,000 VND (có thể điều chỉnh theo tỷ giá thực tế)
export const USD_TO_VND_RATE = 25000;

/**
 * Convert USD to VND
 * @param {number} usd - Amount in USD
 * @param {number} rate - Exchange rate (default: 25000)
 * @returns {number} Amount in VND
 */
export const convertUSDtoVND = (usd, rate = USD_TO_VND_RATE) => {
  return Math.round((parseFloat(usd) || 0) * rate);
};

/**
 * Format VND currency
 * @param {number} amount - Amount in VND
 * @returns {string} Formatted currency string
 */
export const formatVND = (amount) => {
  return `${Math.round(amount).toLocaleString('vi-VN')} VND`;
};

/**
 * Format USD currency
 * @param {number} amount - Amount in USD
 * @returns {string} Formatted currency string
 */
export const formatUSD = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Convert and format USD to VND
 * @param {number} usd - Amount in USD
 * @param {number} rate - Exchange rate (default: 25000)
 * @returns {string} Formatted VND string
 */
export const convertAndFormatVND = (usd, rate = USD_TO_VND_RATE) => {
  const vnd = convertUSDtoVND(usd, rate);
  return formatVND(vnd);
};

/**
 * Get current exchange rate (có thể mở rộng để call API lấy tỷ giá thực tế)
 * @returns {number} Current exchange rate
 */
export const getCurrentExchangeRate = () => {
  // TODO: Có thể call API để lấy tỷ giá real-time
  // Ví dụ: https://api.exchangerate-api.com/v4/latest/USD
  return USD_TO_VND_RATE;
};
