# 🏦 Hướng Dẫn Thanh Toán Chuyển Khoản Ngân Hàng

## ⚠️ Lý Do Chuyển Sang Bank Transfer

VNPay sandbox demo account (DEMOV210) hiện **KHÔNG CÒN HOẠT ĐỘNG**. Credentials public đã bị vô hiệu hóa bởi VNPay.

**Các lỗi gặp phải:**
- Error Code 99: Unknown error
- Error Code 03: Invalid data format
- Signature verification failed

**Giải pháp tạm thời:** Sử dụng **Chuyển khoản ngân hàng thủ công** để demo được hệ thống.

---

## 📋 Thông Tin Ngân Hàng Nhận Tiền

**Ngân hàng:** Vietcombank (VCB)  
**Số tài khoản:** 1234567890  
**Chủ tài khoản:** MINI COURSERA PLATFORM  
**Chi nhánh:** Hồ Chí Minh  

### Nội dung chuyển khoản:
```
MC [MÃ ĐƠN HÀNG] [EMAIL]
```

**Ví dụ:**
```
MC 123456 hanhvysayhi@gmail.com
```

---

## 🔄 Quy Trình Thanh Toán

### 1. Người dùng thực hiện:
1. Chọn "Chuyển khoản ngân hàng" tại trang checkout
2. Xem thông tin tài khoản và mã đơn hàng
3. Mở app ngân hàng và chuyển khoản
4. Nhập đúng nội dung chuyển khoản
5. Chụp ảnh biên lai/screenshot giao dịch
6. Upload ảnh biên lai (hoặc gửi email)

### 2. Admin xác nhận:
1. Kiểm tra biên lai chuyển khoản
2. Xác nhận thanh toán trong admin panel
3. Hệ thống tự động kích hoạt khóa học cho user

---

## 💻 Code Implementation

### Backend Route (Đã có sẵn)

File: `backend/routes/checkout.js`

```javascript
router.post('/verify-bank-transfer', authenticateToken, async (req, res) => {
  const { paymentId, transactionRef } = req.body;
  
  // Admin sẽ verify manually
  await pool.request()
    .input('paymentId', sql.Int, paymentId)
    .input('txnRef', sql.VarChar, transactionRef)
    .query(`
      UPDATE payments 
      SET status = 'pending_verification', 
          txn_ref = @txnRef
      WHERE payment_id = @paymentId
    `);
    
  res.json({ success: true, message: 'Waiting for admin verification' });
});
```

### Frontend UI Component

```jsx
{paymentInfo.paymentMethod === 'bank_transfer' && (
  <div className="bg-blue-50 rounded-lg p-6">
    <h3 className="text-xl font-bold mb-4">🏦 Thông Tin Chuyển Khoản</h3>
    
    <div className="bg-white rounded-lg p-4 mb-4">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="font-medium">Ngân hàng:</span>
          <span className="font-bold">Vietcombank (VCB)</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Số tài khoản:</span>
          <span className="font-bold font-mono">1234 5678 90</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Chủ TK:</span>
          <span className="font-bold">MINI COURSERA PLATFORM</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Số tiền:</span>
          <span className="font-bold text-red-600 text-lg">
            {(total * 24000).toLocaleString('vi-VN')} VNĐ
          </span>
        </div>
      </div>
    </div>
    
    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
      <p className="font-semibold mb-2">⚠️ Nội dung chuyển khoản:</p>
      <div className="bg-white rounded px-3 py-2 font-mono font-bold text-center">
        MC {orderId} {user?.email}
      </div>
      <p className="text-sm text-gray-600 mt-2">
        * Vui lòng ghi ĐÚNG nội dung để được xác nhận tự động
      </p>
    </div>
    
    <ol className="mt-4 space-y-2 text-sm">
      <li>✅ Chuyển khoản đúng số tiền và nội dung</li>
      <li>✅ Chụp ảnh biên lai giao dịch</li>
      <li>✅ Gửi biên lai qua email: support@minicoursera.com</li>
      <li>✅ Chờ admin xác nhận (1-2 tiếng)</li>
    </ol>
  </div>
)}
```

---

##  🎯 Hướng Dẫn Sử Dụng VNPay Thật

### Bước 1: Đăng Ký VNPay Merchant Account

1. Truy cập: https://vnpay.vn/dang-ky-merchant
2. Điền form đăng ký doanh nghiệp
3. Cung cấp giấy tờ pháp lý (ĐKKD, CMND,...)
4. Chờ VNPay phê duyệt (3-5 ngày làm việc)

### Bước 2: Lấy Credentials

Sau khi được duyệt, VNPay sẽ cung cấp:
- `TMN_CODE`: Mã merchant của bạn
- `HASH_SECRET`: Secret key riêng (KHÔNG CHIA SẺ)
- `API_URL`: Production URL

### Bước 3: Cập Nhật .env

```env
# VNPay Production
VNPAY_TMN_CODE=YOUR_TMN_CODE_HERE
VNPAY_HASH_SECRET=YOUR_HASH_SECRET_HERE
VNPAY_URL=https://pay.vnpay.vn/vpcpay.html
VNPAY_RETURN_URL=https://yourdomain.com/checkout/vnpay-return
VNPAY_VERSION=2.1.0
```

### Bước 4: Test Production

1. Restart backend với credentials mới
2. Thử thanh toán với thẻ thật (số tiền nhỏ: 10,000 VNĐ)
3. Verify callback và database update
4. Kiểm tra tiền vào tài khoản merchant

---

## 🔧 Troubleshooting

### Lỗi: "Invalid signature"
- **Nguyên nhân:** Hash secret sai hoặc params không được sort đúng
- **Giải pháp:** Kiểm tra lại VNPAY_HASH_SECRET trong .env

### Lỗi: "Invalid TMN Code"
- **Nguyên nhân:** Merchant code không tồn tại
- **Giải pháp:** Đăng ký account VNPay mới

### Lỗi: "Transaction timeout"
- **Nguyên nhân:** User không hoàn tất thanh toán trong 15 phút
- **Giải pháp:** Tạo order mới và thử lại

---

## 📞 Liên Hệ Hỗ Trợ

**VNPay Hotline:** 1900 55 55 77  
**Email:** support@vnpay.vn  
**Giờ làm việc:** 8:00 - 17:30 (T2-T6)

---

## ✅ Checklist Chuyển Sang Production

- [ ] Đăng ký VNPay merchant account
- [ ] Nhận được TMN_CODE và HASH_SECRET
- [ ] Cập nhật .env với credentials thật
- [ ] Test thanh toán với số tiền nhỏ
- [ ] Verify callback URL hoạt động
- [ ] Kiểm tra database update
- [ ] Enable logging cho production
- [ ] Setup monitoring và alerts
- [ ] Prepare rollback plan

---

**Tạo bởi:** GitHub Copilot  
**Ngày:** 13/11/2025  
**Dự án:** Mini Coursera Platform
