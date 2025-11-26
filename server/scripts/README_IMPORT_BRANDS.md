# Hướng dẫn Import Brands từ Hasaki API

Script này sẽ import danh sách thương hiệu từ Hasaki API vào MongoDB.

## Cách sử dụng

1. Đảm bảo bạn đã cấu hình MongoDB trong file `.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/ladanv
   ```

2. Chạy script:
   ```bash
   cd server
   npm run import-brands
   ```

   Hoặc chạy trực tiếp:
   ```bash
   node scripts/importBrandsFromHasaki.js
   ```

## Quy trình hoạt động

1. **Gọi API 1**: Lấy danh sách tất cả brands từ Hasaki
   - URL: `https://hasaki.vn/mobile/v2/main/brands?form_key=...`
   - Lấy: `name`, `image` (logo), `url`

2. **Với mỗi brand**:
   - Extract `brand_path` từ URL (ví dụ: `16plain` từ `https://hasaki.vn/thuong-hieu/16plain.html`)
   - **Gọi API 2**: Lấy thông tin chi tiết brand
     - URL: `https://hasaki.vn/mobile/v3/main/products?brand_path=[brand_path]&...`
     - Lấy: `brand_description`

3. **Lưu vào MongoDB**:
   - `name`: Tên thương hiệu (từ API 1)
   - `description`: Mô tả thương hiệu (từ API 2)
   - `logo`: URL logo (từ API 1, field `image`)

## Tính năng

- ✅ Tự động bỏ qua brands đã tồn tại (dựa trên `name`)
- ✅ Xử lý lỗi gracefully (nếu không lấy được description, vẫn tạo brand)
- ✅ Delay 500ms giữa các request để tránh rate limiting
- ✅ Hiển thị progress và summary sau khi hoàn thành
- ✅ Logging chi tiết cho từng brand

## Lưu ý

- Script có thể mất vài phút để chạy xong (tùy vào số lượng brands)
- Nếu bị gián đoạn, có thể chạy lại - script sẽ tự động skip brands đã tồn tại
- Đảm bảo có kết nối internet ổn định

## Output mẫu

```
Connected to MongoDB
Fetching brands from Hasaki API...
Found 500 brands to import

[1/500] Processing: 16plain
  📡 Fetching description for brand_path: 16plain
  ✅ Created brand "16plain" with description (245 chars)

[2/500] Processing: 3CE
  📡 Fetching description for brand_path: 3ce
  ✅ Created brand "3CE" with description (180 chars)

...

==================================================
IMPORT SUMMARY
==================================================
Total brands processed: 500
✅ Successfully imported: 485
⏭️  Skipped (already exists): 10
❌ Errors: 5
==================================================
```

---

# Import Products từ Hasaki API

Script `importProductsFromHasaki.js` sẽ tạo danh sách sản phẩm cho từng thương hiệu dựa trên dữ liệu Hasaki.

## Cách sử dụng

```bash
cd server
npm run import-products
```

## Quy trình hoạt động

1. Gọi API brands để lấy danh sách thương hiệu, bao gồm `name` và `brand_path`.
2. Với từng thương hiệu, gọi API products tương ứng theo từng trang (40 sản phẩm/trang) cho tới khi hết dữ liệu.
3. Ánh xạ dữ liệu sản phẩm vào schema MongoDB:
   - `name`: tên sản phẩm (`data.products[i].name`).
   - `brand`: tham chiếu tới brand trong MongoDB (tự tạo nếu chưa có).
   - `price`: lấy từ `market_price` (fallback `price`).
   - `images`: các ảnh chứa `catalog/product`.
   - `description`, `tags`, `category`, `stock`, `rating`: ánh xạ tương ứng hoặc để trống nếu thiếu.

## Tính năng

- ✅ Tự import tất cả brands và products.
- ✅ Skip sản phẩm đã tồn tại (dựa trên `name`).
- ✅ Tự tạo brand nếu brand chưa có trong DB.
- ✅ Delay giữa các request để tránh bị chặn.
- ✅ Hiển thị summary sau khi chạy.

## Lưu ý

- Các trường thiếu dữ liệu sẽ được điền giá trị mặc định.
- `usageInstructions` đang để placeholder `"Thông tin đang được cập nhật."`.
- Script có thể chạy lâu vì phải đi qua tất cả thương hiệu.

