# LADANV - Dashboard Quản Lý Sản Phẩm

## 📋 Tổng quan

Dashboard quản lý sản phẩm cho ứng dụng LADANV với MongoDB backend và React frontend. Hệ thống cho phép quản lý thương hiệu và sản phẩm mỹ phẩm một cách hiệu quả.

## 🏗️ Kiến trúc hệ thống

### Backend (MongoDB + Node.js)
- **Models**: Brand và Product với Mongoose
- **Controllers**: CRUD operations cho brands và products
- **Routes**: API endpoints cho admin và public access
- **Authentication**: JWT-based với middleware bảo mật

### Frontend (React + TypeScript)
- **Admin Dashboard**: Quản lý brands và products
- **Market Page**: Trang thị trường cho user
- **Integration**: Tích hợp với hệ thống LADANV hiện tại

## 🗄️ Database Schema

### Brand Model
```javascript
{
  name: String (required, unique),
  description: String,
  logo: String,
  origin: String,
  website: String,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Product Model
```javascript
{
  name: String (required),
  brand: ObjectId (ref: Brand),
  price: Number (required),
  currency: String (default: 'VND'),
  description: String (required),
  specifications: {
    barcode: String,
    brandOrigin: String,
    manufacturePlace: String,
    skinType: String,
    features: String,
    volume: String,
    weight: String,
    ingredients: [String]
  },
  usageInstructions: String (required),
  images: [String],
  category: String (enum),
  skinTypes: [String],
  tags: [String],
  isActive: Boolean (default: true),
  isFeatured: Boolean (default: false),
  stock: Number (default: 0),
  rating: {
    average: Number,
    count: Number
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🚀 API Endpoints

### Brands API (`/api/brands`)
- `GET /` - Lấy danh sách brands (admin)
- `GET /dropdown` - Lấy brands cho dropdown (public)
- `GET /:id` - Lấy brand theo ID (public)
- `POST /` - Tạo brand mới (admin)
- `PUT /:id` - Cập nhật brand (admin)
- `DELETE /:id` - Xóa brand (admin)

### Products API (`/api/products`)
- `GET /` - Lấy danh sách products với filters (public)
- `GET /featured` - Lấy products nổi bật (public)
- `GET /search` - Tìm kiếm products (public)
- `GET /brand/:brandId` - Lấy products theo brand (public)
- `GET /:id` - Lấy product theo ID (public)
- `POST /` - Tạo product mới (admin)
- `PUT /:id` - Cập nhật product (admin)
- `DELETE /:id` - Xóa product (admin)

## 🎯 Tính năng chính

### Admin Dashboard (`/admin`)
- **Quản lý thương hiệu**:
  - Thêm/sửa/xóa thương hiệu
  - Upload logo và thông tin chi tiết
  - Quản lý trạng thái hoạt động

- **Quản lý sản phẩm**:
  - Thêm/sửa/xóa sản phẩm
  - Quản lý thông số chi tiết
  - Upload hình ảnh sản phẩm
  - Quản lý thành phần và tags
  - Thiết lập sản phẩm nổi bật

### Market Page (`/market`)
- **Tìm kiếm và lọc**:
  - Tìm kiếm theo tên sản phẩm
  - Lọc theo thương hiệu, danh mục, loại da
  - Lọc theo khoảng giá
  - Sắp xếp theo nhiều tiêu chí

- **Hiển thị sản phẩm**:
  - Grid layout responsive
  - Thông tin chi tiết sản phẩm
  - Modal xem chi tiết đầy đủ
  - Phân trang

## 🔧 Cài đặt và chạy

### Backend Setup
```bash
cd server
npm install
# Tạo file .env với các biến môi trường:
# MONGODB_URI=mongodb://localhost:27017/ladanv
# JWT_SECRET=your_jwt_secret
# SENDER_EMAIL=your_email
# SMTP_USER=your_smtp_user
# SMTP_PASS=your_smtp_pass
npm run server
```

### Frontend Setup
```bash
cd client
npm install
# Tạo file .env với:
# VITE_GEMINI_API_KEY=your_gemini_api_key
npm run dev
```

### Tạo Super Admin
```bash
cd server
npm run create-super-admin
# Sẽ tạo tài khoản admin mặc định:
# Username: superadmin
# Password: admin123456
# Email: admin@ladanv.com
```

## 📱 Cách sử dụng

### Admin Dashboard
1. **Tạo Super Admin**: Chạy `npm run create-super-admin` để tạo tài khoản admin đầu tiên
2. **Đăng nhập Admin**: Truy cập `/admin` và đăng nhập với tài khoản admin
3. **Quản lý**: Chọn tab "Thương hiệu" hoặc "Sản phẩm" để quản lý
4. **Thêm mới**: Sử dụng các nút "Thêm" để tạo mới
5. **Chỉnh sửa**: Click "Chỉnh sửa" hoặc "Xóa" để quản lý

### Market Page
1. Truy cập `/market` hoặc click "Thị trường" trong menu
2. Sử dụng thanh tìm kiếm và bộ lọc
3. Click vào sản phẩm để xem chi tiết
4. Sử dụng phân trang để duyệt nhiều sản phẩm

## 🔒 Bảo mật

- **Admin Authentication**: Hệ thống xác thực admin riêng biệt với JWT tokens
- **Account Locking**: Tài khoản bị khóa sau 5 lần đăng nhập sai
- **Role-based Access**: Phân quyền Super Admin, Admin, Moderator
- **Password Hashing**: Bcrypt với salt rounds
- **Session Management**: HttpOnly cookies với expiration
- **Input Validation**: Mongoose schema validation
- **CORS**: Cấu hình CORS cho frontend

## 📊 Performance

- **Database Indexing**: Indexes cho search và filter
- **Pagination**: Phân trang để tối ưu performance
- **Image Optimization**: Lazy loading và responsive images
- **Caching**: Browser caching cho static assets

## 🚀 Mở rộng

### Thêm tính năng
- **Reviews**: Hệ thống đánh giá sản phẩm
- **Inventory**: Quản lý kho hàng chi tiết
- **Analytics**: Thống kê và báo cáo
- **Export/Import**: Xuất/nhập dữ liệu

### Tối ưu
- **Search Engine**: Elasticsearch cho tìm kiếm nâng cao
- **CDN**: Content Delivery Network cho hình ảnh
- **Caching**: Redis cho cache database
- **Monitoring**: Logging và monitoring

## 🐛 Troubleshooting

### Lỗi thường gặp
1. **CORS Error**: Kiểm tra cấu hình CORS trong server
2. **Authentication Failed**: Kiểm tra JWT secret và cookies
3. **Database Connection**: Kiểm tra MongoDB URI và connection
4. **Image Upload**: Kiểm tra quyền upload và storage

### Debug
- Sử dụng browser DevTools để debug frontend
- Kiểm tra server logs để debug backend
- Sử dụng MongoDB Compass để kiểm tra database

## 📝 Changelog

### v1.0.0 (2024-01-XX)
- ✅ Thiết kế database schema
- ✅ Tạo Mongoose models
- ✅ Implement CRUD controllers
- ✅ Tạo API routes
- ✅ Admin dashboard
- ✅ Market page
- ✅ Tích hợp với frontend

## 🤝 Contributing

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push to branch
5. Tạo Pull Request

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
