# Hướng dẫn cấu hình thanh toán SePay

## 1. Biến môi trường cần thiết

Thêm vào file `server/.env`:

```env
# SePay Configuration
SEPAY_ENV=product                    # hoặc 'sandbox' để test
SEPAY_MERCHANT_ID=SP-LIVE-...        # Merchant ID từ SePay dashboard
SEPAY_SECRET_KEY=spsk_live_...      # Secret Key từ SePay dashboard

# VietQR (để hiển thị QR chuyển khoản trong trang nội bộ)
SEPAY_VIETQR_ACCOUNT=48888888866     # Số tài khoản nhận tiền
SEPAY_VIETQR_BANK=970422             # Mã BIN hoặc tên ngân hàng theo docs SePay
SEPAY_VIETQR_DESCRIPTION_TEMPLATE=LADANV {invoice}

# API Transaction Token (dùng để xác minh thủ công nếu IPN bị trễ)
SEPAY_API_TOKEN=kwtxfnl...           # API Access token từ https://my.sepay.vn/userapi
# Tuỳ chọn: override URL hoặc cấu hình dò giao dịch
# SEPAY_API_BASE_URL=https://my.sepay.vn
# SEPAY_VERIFY_TRANSACTION_LIMIT=100          # số giao dịch lấy về khi dò
# SEPAY_VERIFY_AMOUNT_DELTA=1000              # sai số cho phép khi so khớp số tiền (VND)

# Frontend URL (để redirect sau khi thanh toán)
FRONTEND_URL=http://localhost:5173   # Local development
# FRONTEND_URL=https://yourdomain.com  # Production

# Optional: Cho phép bỏ qua verify IPN khi test (KHÔNG dùng ở production)
# SEPAY_ALLOW_UNVERIFIED=true
```

## 2. Cấu hình SePay Dashboard

### 2.1. Sandbox (Test)
1. Truy cập: https://sandbox.sepay.vn
2. Lấy `SP-TEST-...` Merchant ID và Secret Key
3. Cấu hình IPN URL: `https://<ngrok-url>/api/payment/sepay/ipn`

### 2.2. Production
1. Truy cập: https://my.sepay.vn
2. Lấy `SP-LIVE-...` Merchant ID và Secret Key
3. Cấu hình IPN URL: `https://<your-domain>/api/payment/sepay/ipn`

## 3. Test với ngrok (Local)

```bash
# Terminal 1: Start backend
cd server
npm run server

# Terminal 2: Start ngrok
ngrok http 4000

# Copy ngrok URL (ví dụ: https://abc123.ngrok.io)
# Cập nhật IPN URL trong SePay dashboard
```

## 4. Luồng thanh toán

1. User nhấn "Nâng cấp ngay" trên trang Pricing
2. Frontend gọi `POST /api/payment/sepay/checkout`
3. Backend tạo Order, trả về `orderInvoiceNumber`
4. Frontend điều hướng tới `/payment/:invoice` và gọi `GET /api/payment/order/:invoice`
5. Backend trả về link VietQR (`https://qr.sepay.vn/img?...`) + thông tin chuyển khoản
6. User quét QR, chuyển khoản đúng số tiền & nội dung
7. SePay gửi IPN tới `BACKEND_URL/api/payment/sepay/ipn`
8. Backend verify IPN, cập nhật Order sang `paid`, kích hoạt subscription
9. Frontend đang polling → nhận `status=paid` → hiển thị thông báo nâng cấp thành công
10. Nếu IPN tới chậm, user có thể bấm “Tôi đã chuyển khoản, kiểm tra lại” → backend gọi `order/detail` hoặc `transactions/list` (cần `SEPAY_API_TOKEN`) để xác minh và kích hoạt ngay.

## 5. Kiểm tra

- ✅ Order được tạo với status `pending`
- ✅ Sau khi thanh toán, Order status = `paid`
- ✅ Subscription được kích hoạt với đúng plan
- ✅ User thấy trang "Bạn đã nâng cấp gói Pro/Premier thành công"

## 6. Troubleshooting

### Lỗi "Unknown error" trên SePay
- Kiểm tra `SEPAY_ENV` khớp với Merchant ID (sandbox vs production)
- Kiểm tra `SEPAY_MERCHANT_ID` và `SEPAY_SECRET_KEY` đúng

### IPN không nhận được
- Kiểm tra IPN URL trong SePay dashboard
- Kiểm tra ngrok/domain có thể truy cập từ internet
- Kiểm tra log backend có request tới `/api/payment/sepay/ipn`

### Signature verification failed
- Kiểm tra `SEPAY_SECRET_KEY` đúng
- Tạm thời set `SEPAY_ALLOW_UNVERIFIED=true` để test (KHÔNG dùng ở production)

