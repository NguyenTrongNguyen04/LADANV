import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/mongodb.js';
import Brand from '../models/brandModel.js';
import Product from '../models/productModel.js';

const FORM_KEY = '20a4527d726988f6a439f36be911eab3';
const HASAKI_BRANDS_API = `https://hasaki.vn/mobile/v2/main/brands?form_key=${FORM_KEY}`;
const HASAKI_PRODUCTS_API = 'https://hasaki.vn/mobile/v3/main/products';
const PAGE_SIZE = 40;
const REQUEST_DELAY_MS = 500;

const FALLBACK_USAGE = 'Thông tin đang được cập nhật.';

const CATEGORY_MAP = [
  { match: ['sunscreen', 'chống nắng'], value: 'sunscreen' },
  { match: ['serum'], value: 'serum' },
  { match: ['cleanser', 'sữa rửa mặt'], value: 'cleanser' },
  { match: ['toner', 'nước hoa hồng'], value: 'toner' },
  { match: ['moisturizer', 'dưỡng ẩm', 'kem dưỡng'], value: 'moisturizer' },
  { match: ['mặt nạ', 'mask'], value: 'mask' },
  { match: ['treatment', 'điều trị', 'đặc trị'], value: 'treatment' },
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function extractBrandPath(url) {
  if (!url) return null;
  const match = url.match(/\/thuong-hieu\/([^/]+)\.html/);
  return match ? match[1] : null;
}

async function fetchHasakiBrands() {
  const response = await fetch(HASAKI_BRANDS_API, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands list: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status?.error_code !== 0 || !payload.data?.brands) {
    throw new Error('Invalid brand response from Hasaki API');
  }

  const brandMap = new Map();

  for (const group of payload.data.brands) {
    if (!Array.isArray(group.list)) continue;
    for (const brand of group.list) {
      const brandPath = extractBrandPath(brand.url);
      if (!brandPath) continue;

      brandMap.set(brand.name.trim(), {
        path: brandPath,
        logo: brand.image || '',
        url: brand.url,
      });
    }
  }

  return brandMap;
}

async function fetchProductsByBrandPath(brandPath, page = 1) {
  const url = `${HASAKI_PRODUCTS_API}?brand_path=${brandPath}&page=${page}&size=${PAGE_SIZE}&has_meta_data=1&is_desktop=1&form_key=${FORM_KEY}`;

  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products for ${brandPath}: ${response.status}`);
  }

  const payload = await response.json();
  if (payload.status?.error_code !== 0 || !payload.data) {
    throw new Error(`Invalid products response for ${brandPath}`);
  }

  return payload.data;
}

function mapCategory(categoryPath = '') {
  const normalized = categoryPath.toLowerCase();
  for (const rule of CATEGORY_MAP) {
    if (rule.match.some((keyword) => normalized.includes(keyword))) {
      return rule.value;
    }
  }
  return 'other';
}

function buildImageList(product) {
  const candidates = [product.image, product.sub_stamp];

  const images = candidates
    .filter((img) => typeof img === 'string' && img.includes('catalog/product'))
    .map((img) => img.trim());

  return [...new Set(images)];
}

function buildTags(categoryPath = '') {
  return categoryPath
    .split('/')
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 5);
}

function buildSpecifications(product) {
  return {
    barcode: product.sku || '',
    brandOrigin: '',
    manufacturePlace: '',
    skinType: '',
    features: '',
    volume: '',
    weight: '',
    ingredients: [],
  };
}

function mapProductDocument(product, brandId) {
  const price = Number(product.market_price || product.price || 0) || 0;
  const images = buildImageList(product);

  return {
    name: product.name?.trim() || 'Sản phẩm chưa đặt tên',
    brand: brandId,
    price,
    currency: 'VND',
    description:
      product.short_desc?.trim() ||
      product.english_name?.trim() ||
      product.category_name_level?.trim() ||
      '',
    specifications: buildSpecifications(product),
    usageInstructions: FALLBACK_USAGE,
    images,
    category: mapCategory(product.category_name_level || ''),
    skinTypes: [],
    tags: buildTags(product.category_name_level || ''),
    isActive: true,
    isFeatured: false,
    stock: Number(product.quantity) || 0,
    rating: {
      average:
        Number(product.rating?.average) ||
        Number(product.rating?.avg_rate) ||
        0,
      count: Number(product.rating?.total) || 0,
    },
  };
}

async function ensureBrandExists(brandName, brandMeta) {
  let brand = await Brand.findOne({ name: brandName });
  if (brand) return brand;

  brand = await Brand.create({
    name: brandName,
    description: '',
    logo: brandMeta?.logo || '',
  });

  return brand;
}

async function importProducts() {
  await connectDB();
  console.log('Connected to MongoDB');

  const brandMap = await fetchHasakiBrands();
  console.log(`Fetched ${brandMap.size} brands from Hasaki`);

  let totalProducts = 0;
  let createdProducts = 0;
  let skippedProducts = 0;
  let errorProducts = 0;

  let brandIndex = 0;
  for (const [brandName, brandMeta] of brandMap.entries()) {
    brandIndex += 1;
    console.log(`\n[${brandIndex}/${brandMap.size}] Importing products for brand: ${brandName}`);

    const brandPath = brandMeta.path;
    if (!brandPath) {
      console.log('  ⚠️  Missing brand path, skipping');
      continue;
    }

    let brandDoc;
    try {
      brandDoc = await ensureBrandExists(brandName, brandMeta);
    } catch (error) {
      console.error(`  ❌ Failed to ensure brand in database: ${error.message}`);
      continue;
    }

    let page = 1;
    let processedForBrand = 0;
    let totalForBrand = null;

    while (true) {
      let data;
      try {
        data = await fetchProductsByBrandPath(brandPath, page);
      } catch (error) {
        console.error(`  ❌ Error fetching products page ${page}: ${error.message}`);
        errorProducts += 1;
        break;
      }

      const products = data.products || [];
      if (totalForBrand === null) {
        totalForBrand = Number(data.meta_data?.log?.total) || products.length;
        console.log(`  📦 Total products reported: ${totalForBrand}`);
      }

      if (products.length === 0) {
        console.log('  ℹ️  No products returned, stopping.');
        break;
      }

      for (const product of products) {
        totalProducts += 1;
        processedForBrand += 1;

        const existingProduct = await Product.findOne({ name: product.name?.trim() });
        if (existingProduct) {
          skippedProducts += 1;
          continue;
        }

        const productDoc = mapProductDocument(product, brandDoc._id);

        try {
          await Product.create(productDoc);
          createdProducts += 1;
        } catch (error) {
          errorProducts += 1;
          console.error(`  ❌ Failed to create product "${product.name}": ${error.message}`);
        }
      }

      if (processedForBrand >= totalForBrand) {
        break;
      }

      page += 1;
      await sleep(REQUEST_DELAY_MS);
    }

    await sleep(REQUEST_DELAY_MS);
  }

  console.log('\n' + '='.repeat(60));
  console.log('PRODUCT IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total products seen      : ${totalProducts}`);
  console.log(`Successfully imported    : ${createdProducts}`);
  console.log(`Skipped (already exists) : ${skippedProducts}`);
  console.log(`Errors                   : ${errorProducts}`);
  console.log('='.repeat(60));

  await mongoose.connection.close();
  console.log('\nDatabase connection closed');
}

importProducts()
  .then(() => process.exit(0))
  .catch(async (error) => {
    console.error('Unexpected error during import:', error);
    await mongoose.connection.close();
    process.exit(1);
  });
