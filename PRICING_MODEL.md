# Mô Hình Pricing - LADANV

## 📋 Tổng Quan

Hệ thống subscription với 3 gói: **Free**, **Pro**, và **Premier** để monetize các tính năng AI của LADANV.

---

## 💰 Các Gói Định Giá

### 🆓 Gói Free (Miễn Phí)
**Mục đích**: Thu hút người dùng mới, cho phép trải nghiệm cơ bản

**Giới hạn**:
- ✅ 5 lần quét AI/tháng
- ✅ 1 báo cáo phân tích/tháng
- ✅ 10 ghi chú nhật ký/tháng
- ❌ Không có so sánh sản phẩm
- ❌ Không có phân tích nâng cao
- ❌ Không có gợi ý AI
- ❌ Không xuất dữ liệu

**Giá**: Miễn phí

---

### ⚡ Gói Pro
**Mục đích**: Dành cho người dùng chuyên nghiệp, sử dụng thường xuyên

**Giới hạn**:
- ✅ 50 lần quét AI/tháng
- ✅ 10 báo cáo phân tích/tháng
- ✅ 100 ghi chú nhật ký/tháng
- ✅ 20 so sánh sản phẩm/tháng
- ✅ Phân tích nâng cao
- ✅ Gợi ý AI thông minh
- ✅ Xuất dữ liệu
- ✅ Routine tùy chỉnh
- ✅ Cảnh báo thành phần
- ❌ Không có hỗ trợ ưu tiên

**Giá**: 
- 99,000 ₫/tháng
- 990,000 ₫/năm (tiết kiệm 2 tháng)

---

### 👑 Gói Premier
**Mục đích**: Gói cao cấp với đầy đủ tính năng, không giới hạn

**Giới hạn**:
- ✅ **Không giới hạn** quét AI
- ✅ **Không giới hạn** báo cáo phân tích
- ✅ **Không giới hạn** ghi chú nhật ký
- ✅ **Không giới hạn** so sánh sản phẩm
- ✅ Tất cả tính năng của Pro
- ✅ **Hỗ trợ ưu tiên 24/7**

**Giá**: 
- 199,000 ₫/tháng
- 1,990,000 ₫/năm (tiết kiệm 2 tháng)

---

## 🏗️ Kiến Trúc Hệ Thống

### Backend Models

#### 1. Subscription Model (`server/models/subscriptionModel.js`)
- Quản lý subscription của từng user
- Track usage (aiScans, analysisReports, journalEntries, productComparisons)
- Tự động reset monthly usage
- Methods: `canPerformAction()`, `incrementUsage()`, `resetMonthlyUsage()`

#### 2. PricingPlan Model (`server/models/pricingPlanModel.js`)
- Định nghĩa các gói pricing
- Lưu features và giá của từng gói
- Có thể cập nhật dễ dàng

### API Endpoints

#### Public
- `GET /api/subscription/plans` - Lấy danh sách tất cả gói pricing

#### Protected (cần authentication)
- `GET /api/subscription` - Lấy thông tin subscription của user
- `POST /api/subscription/check-limit` - Kiểm tra xem user có thể thực hiện action không
- `POST /api/subscription/upgrade` - Nâng cấp gói
- `POST /api/subscription/increment-usage` - Tăng usage sau khi thực hiện action

### Middleware

#### `subscriptionCheck(actionType)`
- Kiểm tra subscription status
- Kiểm tra action limits
- Tự động tạo free subscription nếu chưa có
- Trả về lỗi nếu vượt quá limit

**Usage**:
```javascript
import subscriptionCheck from '../middleware/subscriptionCheck.js';

router.post('/scan', userAuth, subscriptionCheck('ai_scan'), scanController);
```

---

## 🎯 Cách Sử Dụng

### 1. Seed Pricing Plans
```bash
cd server
npm run seed-pricing
```

### 2. Tích hợp vào tính năng AI

#### Ví dụ: Product Scanner
```javascript
// server/routes/productRoutes.js
import subscriptionCheck from '../middleware/subscriptionCheck.js';

router.post('/scan', 
  userAuth, 
  subscriptionCheck('ai_scan'), 
  async (req, res) => {
    // Process scan
    // Increment usage
    await incrementUsage(req.userId, 'ai_scan');
    res.json({ success: true });
  }
);
```

#### Frontend: Check limit trước khi gọi API
```typescript
// client/src/components/Products/ProductScanner.tsx
const checkLimit = async () => {
  const response = await fetch(`${API_BASE_URL}/subscription/check-limit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ actionType: 'ai_scan' })
  });
  
  const data = await response.json();
  if (!data.data.allowed) {
    // Show upgrade modal
    alert(`Bạn đã đạt giới hạn. Vui lòng nâng cấp gói!`);
    return false;
  }
  return true;
};
```

---

## 📊 Tracking Usage

### Các Action Types
- `ai_scan` - Quét sản phẩm bằng AI
- `analysis_report` - Tạo báo cáo phân tích
- `journal_entry` - Thêm ghi chú nhật ký
- `product_comparison` - So sánh sản phẩm

### Auto Reset
- Usage tự động reset vào đầu mỗi tháng
- Dựa trên `lastResetDate` trong subscription

---

## 💳 Payment Integration (TODO)

Hiện tại upgrade chỉ cập nhật subscription trong database. Cần tích hợp:

1. **Payment Gateway**:
   - Momo
   - ZaloPay
   - VNPay
   - Stripe (cho thẻ quốc tế)

2. **Webhook**:
   - Xử lý payment success/failure
   - Tự động activate subscription

3. **Invoice**:
   - Tạo hóa đơn sau khi thanh toán thành công

---

## 🎨 Frontend Components

### PricingPage (`client/src/components/Pricing/PricingPage.tsx`)
- Hiển thị 3 gói pricing
- Toggle monthly/yearly
- Show current usage (nếu đã login)
- Upgrade button

### Cần thêm:
- Upgrade modal với payment form
- Usage indicator trong các tính năng AI
- Limit warning khi gần hết

---

## 🔒 Security

- Tất cả subscription endpoints đều require authentication
- Usage tracking được validate ở backend
- Không thể bypass limits từ frontend

---

## 📈 Business Logic

### Conversion Strategy
1. **Free Plan**: Cho phép trải nghiệm đủ để thấy giá trị
2. **Pro Plan**: Giá hợp lý cho người dùng thường xuyên
3. **Premier Plan**: Không giới hạn cho power users

### Pricing Psychology
- Pro: 99k/tháng (dưới 100k, dễ quyết định)
- Premier: 199k/tháng (gấp đôi Pro, nhưng unlimited)
- Yearly: Tiết kiệm 17% (2 tháng free)

---

## 🚀 Next Steps

1. ✅ Tạo models và API
2. ✅ Tạo Pricing Page
3. ⏳ Tích hợp payment gateway
4. ⏳ Thêm usage indicators vào UI
5. ⏳ Tạo upgrade flow hoàn chỉnh
6. ⏳ Email notifications cho subscription events
7. ⏳ Analytics dashboard cho admin

---

## 📝 Notes

- Tất cả users mới sẽ tự động có free subscription
- Subscription tự động tạo khi user đăng ký
- Usage limits được enforce ở cả frontend và backend
- Có thể dễ dàng thêm gói mới hoặc điều chỉnh pricing

