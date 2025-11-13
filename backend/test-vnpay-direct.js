import crypto from 'crypto';
import querystring from 'querystring';

const vnpayConfig = {
  vnp_TmnCode: 'DEMOV210',
  vnp_HashSecret: 'RAOEXHYVSDDIIENYWSLDIIZTANXUXZFJ',
  vnp_Url: 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl: 'http://localhost:5173/checkout/vnpay-return',
  vnp_Version: '2.1.0'
};

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  keys.forEach(key => {
    sorted[key] = obj[key];
  });
  return sorted;
}

// Create test payment URL
const date = new Date();
const createDate = date.toISOString().replace(/[-:TZ.]/g, '').slice(0, 14);
const orderId = `TEST${Date.now()}`;

let vnp_Params = {
  vnp_Version: vnpayConfig.vnp_Version,
  vnp_Command: 'pay',
  vnp_TmnCode: vnpayConfig.vnp_TmnCode,
  vnp_Locale: 'vn',
  vnp_CurrCode: 'VND',
  vnp_TxnRef: orderId,
  vnp_OrderInfo: 'Test Payment VNPay',
  vnp_OrderType: 'other',
  vnp_Amount: 1000000, // 10,000 VND
  vnp_ReturnUrl: vnpayConfig.vnp_ReturnUrl,
  vnp_IpAddr: '127.0.0.1',
  vnp_CreateDate: createDate
};

// Sort params
vnp_Params = sortObject(vnp_Params);

// Create signature
const signData = querystring.stringify(vnp_Params);
const hmac = crypto.createHmac('sha512', vnpayConfig.vnp_HashSecret);
const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');
vnp_Params['vnp_SecureHash'] = signed;

// Build URL
const paymentUrl = vnpayConfig.vnp_Url + '?' + querystring.stringify(vnp_Params);

console.log('🔍 VNPay Test Payment URL Generation');
console.log('=====================================');
console.log('📝 Order ID:', orderId);
console.log('📝 Create Date:', createDate);
console.log('📝 Amount: 10,000 VND');
console.log('');
console.log('📋 All Params (sorted):');
Object.keys(vnp_Params).forEach(key => {
  if (key !== 'vnp_SecureHash') {
    console.log(`  ${key}: ${vnp_Params[key]}`);
  }
});
console.log('');
console.log('🔐 Signature Data (ENCODED):');
console.log(signData);
console.log('');
console.log('🔒 HMAC-SHA512 Signature:');
console.log(signed);
console.log('');
console.log('🌐 Full Payment URL:');
console.log(paymentUrl);
console.log('');
console.log('📏 URL Length:', paymentUrl.length);
console.log('');
console.log('✅ Copy URL trên và paste vào browser để test!');
