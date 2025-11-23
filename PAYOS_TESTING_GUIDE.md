# PayOS Testing Guide - KHÔNG CẦN NGROK! 🎉

## 🎯 Giải pháp: Development Mode (Không cần webhook thật)

Thay vì dùng ngrok (phức tạp, URL thay đổi liên tục), mình dùng **Development Tool** để simulate payment.

---

## 📋 Cách Test PayOS (5 phút)

### Bước 1: Khởi động Backend + Frontend

```bash
# Terminal 1: Backend
cd backend
npm start
# ✅ Backend running on http://localhost:3001

# Terminal 2: Frontend  
npm run dev
# ✅ Frontend running on http://localhost:5173
```

### Bước 2: Mở Development Tool

Mở file này trong browser:
```
file:///E:/mini-coursera-ui-tailwind/test-payos-dev.html
```

Hoặc truy cập: `http://localhost:3001/test-payos-dev.html`

### Bước 3: Test Payment Flow

**3.1. Tạo Payment (Frontend)**
1. Đăng nhập: `http://localhost:5173`
   - Email: `huy484820@gmail.com`
   - Password: (password của bạn)
   
2. Thêm khóa học vào giỏ hàng
   - Vào Catalog → Click "Add to Cart"
   
3. Checkout
   - Click "Giỏ hàng" → "Tiến hành thanh toán"
   - Chọn **"PayOS QR (Tự động)"**
   - Click **"Tiếp tục thanh toán"**
   
4. QR Screen sẽ hiển thị
   - Copy **Order Code** (12 số, ví dụ: `173238939140`)
   - Màn hình sẽ có QR code PayOS
   - Màn hình sẽ tự động polling status

**3.2. Simulate Success (Dev Tool)**
1. Quay lại Development Tool (`test-payos-dev.html`)
2. Click **"Refresh List"**
3. Bạn sẽ thấy pending payment vừa tạo
4. Click **"Simulate Success"** cho payment đó
5. Tool sẽ:
   - ✅ Update payment status = 'paid'
   - ✅ Create enrollment (status = 'active')
   
**3.3. Auto-Complete (Frontend)**
1. Quay lại tab Checkout
2. Đợi 5-10 giây
3. Frontend polling sẽ phát hiện status = 'paid'
4. Tự động:
   - ✅ Clear cart
   - ✅ Show "Đăng ký thành công"
   - ✅ Redirect "Bắt đầu học"

---

## 🔍 Verify Payment Success

### Database Check:
```sql
-- Check payment
SELECT * FROM payments 
WHERE provider = 'payos' 
ORDER BY created_at DESC;

-- Check enrollment
SELECT * FROM enrollments 
WHERE user_id = 5 
ORDER BY enrolled_at DESC;
```

### Frontend Check:
- Go to: `http://localhost:5173/my-learning`
- Khóa học vừa mua sẽ xuất hiện

---

## 🧪 Development Tool API Endpoints

### GET /api/payment/payos/dev/pending
Get list of pending PayOS payments
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/payment/payos/dev/pending
```

### POST /api/payment/payos/dev/simulate-success/:orderCode
Simulate payment success (mark as paid + create enrollment)
```bash
curl -X POST -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3001/api/payment/payos/dev/simulate-success/173238939140
```

---

## 🚀 Production (Với webhook thật)

Khi deploy production, webhook sẽ hoạt động tự động:

1. **PayOS Dashboard**: Cấu hình webhook URL
   ```
   https://your-domain.com/api/payment/payos/webhook
   ```

2. **Backend**: Đã có sẵn webhook handler
   - Verify signature
   - Update payment status
   - Create enrollment
   - Tất cả tự động!

3. **Frontend**: Polling vẫn hoạt động song song
   - Nếu webhook nhanh → auto-complete ngay
   - Nếu webhook chậm → polling backup

---

## 💡 Why This Approach?

### ❌ Ngrok Problems:
- URL thay đổi mỗi lần restart
- Phải update PayOS dashboard mỗi lần
- Free tier có giới hạn
- Phức tạp cho development

### ✅ Dev Tool Benefits:
- **Không cần ngrok**
- Test nhanh trong vòng 5 giây
- Kiểm soát hoàn toàn flow
- Giống production 99%
- Easy debugging

---

## 🎯 Testing Scenarios

### Scenario 1: Successful Payment
1. Create payment → Get order code
2. Simulate success
3. Verify enrollment created
4. ✅ Pass

### Scenario 2: Multiple Courses
1. Add 3 courses to cart
2. Checkout with PayOS
3. Simulate success
4. Verify 3 enrollments created
5. ✅ Pass

### Scenario 3: Duplicate Payment
1. Simulate success 2 lần
2. Verify chỉ 1 enrollment
3. Status = "already_paid"
4. ✅ Pass

### Scenario 4: Polling Timeout
1. Create payment
2. KHÔNG simulate success
3. Đợi 10 phút
4. Polling stops
5. User có thể refresh page
6. ✅ Pass

---

## 📊 Monitoring

### Backend Logs:
```
✅ PayOS Service initialized successfully
✅ PayOS routes registered at /api/payment/payos
🧪 PayOS DEV routes registered at /api/payment/payos/dev

📝 PayOS payment creation request: { userId: 5, courseId: 20, ... }
✅ Payment record created in database
💳 Payment ID: 123

🔍 PayOS polling status: { orderCode: "173238939140", status: "PAID" }
✅ Payment verified! Auto-completing...
```

### Frontend Console:
```javascript
🔄 Creating PayOS payment link...
📦 PayOS response: { orderCode, qrCode, amount }
✅ Step changed to 3 - QR code should display
🔍 PayOS polling status: { paymentStatus: "PAID", localStatus: "paid" }
✅ Thanh toán PayOS thành công!
```

---

## 🎉 Summary

**Development:**
- Use `test-payos-dev.html` tool
- No ngrok needed
- Fast testing (5 seconds)

**Production:**
- Configure webhook in PayOS dashboard
- Backend handles webhook automatically
- Polling as backup

**Best of both worlds!** 🚀
