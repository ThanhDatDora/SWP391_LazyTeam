# 💰 Payment & Revenue Data Standard

## ✅ Chuẩn hóa: TẤT CẢ GIÁ TRONG DATABASE LÀ USD

### 📊 Database Schema

#### 1. **Courses Table**
```sql
price DECIMAL(10,2)  -- USD (ví dụ: 99.99, 79.99, 149.99)
```

#### 2. **Payments Table**
```sql
amount_cents BIGINT   -- USD in cents (price × 100)
                      -- Ví dụ: $99.99 → 9999 cents
currency VARCHAR(3)   -- 'USD' (luôn luôn)
```

#### 3. **Enrollments Table**
```sql
-- Không lưu giá, JOIN với courses để lấy price
```

---

## 🔄 Conversion Flow

### Khi Thanh Toán (Payment Process)

```javascript
// 1. Lấy giá khóa học (USD)
const coursePrice = 99.99; // USD

// 2. Chuyển sang VND để hiển thị cho user
const exchangeRate = 1000; // Tỷ giá cố định hoặc real-time
const vndAmount = coursePrice * exchangeRate; // 99,990 VND

// 3. Gửi VND amount tới SePay/payment gateway
const paymentRequest = {
  amount: 99990, // VND
  currency: 'VND'
};

// 4. Khi payment thành công, LƯU VỀ USD
const amountCents = coursePrice * 100; // 9999 cents
await db.query(`
  INSERT INTO payments (amount_cents, currency, status)
  VALUES (${amountCents}, 'USD', 'paid')
`);
```

### Khi Tính Revenue

```sql
-- Total revenue (USD)
SELECT SUM(amount_cents / 100.0) as total_revenue_usd
FROM payments
WHERE status = 'paid';

-- Instructor share (80%)
SELECT SUM(amount_cents / 100.0 * 0.8) as instructor_share_usd
FROM payments
WHERE status = 'paid';
```

### Khi Hiển Thị

```javascript
// Backend returns USD
const revenueUSD = 99.99;

// Frontend converts to VND for display
const revenueVND = revenueUSD * 1000; // 99,990
display(`${revenueVND.toLocaleString('vi-VN')}đ`); // "99,990đ"

// Or display USD
display(`$${revenueUSD.toFixed(2)}`); // "$99.99"
```

---

## 📝 Examples

### Example 1: Photography Course
```
Course Price: $79.99
Payment Process: $79.99 → 79,990 VND (display to user)
Payment Gateway: 79,990 VND (sent to SePay)
Database Storage: 7999 cents, currency='USD'
Revenue Calculation: 7999 / 100 = $79.99
```

### Example 2: Java Course
```
Course Price: $99.99
Payment Process: $99.99 → 99,990 VND
Payment Gateway: 99,990 VND
Database Storage: 9999 cents, currency='USD'
Revenue Calculation: 9999 / 100 = $99.99
```

### Example 3: Multiple Payments
```
Payment 1: $79.99 → 7999 cents
Payment 2: $99.99 → 9999 cents
Payment 3: $59.99 → 5999 cents

Total Revenue: (7999 + 9999 + 5999) / 100 = $239.97
Instructor Share: $239.97 × 0.8 = $191.98
```

---

## ⚠️ Important Rules

### ✅ DO
- Store ALL prices in USD (courses.price, payments.amount_cents)
- Use `amount_cents / 100` to get USD amount
- Convert to VND ONLY for display or payment gateway
- Keep currency = 'USD' in payments table

### ❌ DON'T
- Don't store VND in database
- Don't mix USD and VND in same table
- Don't divide by 1000 when calculating revenue
- Don't change currency field to 'VND'

---

## 🔧 Migration Completed

✅ All courses: price in USD (decimal)
✅ All payments: amount_cents in USD cents, currency='USD'
✅ Revenue queries: amount_cents / 100 (no /1000)
✅ Java Servlet course: fixed from $990,000 to $99.99

---

## 🎯 Summary

**One Source of Truth: USD**

- Database: USD
- Calculation: USD  
- Display: Convert to VND (×1000)
- Payment Gateway: Send VND
- Storage: Back to USD

This ensures:
- ✅ Data consistency
- ✅ Easy calculations
- ✅ Flexible exchange rates
- ✅ No conversion errors
