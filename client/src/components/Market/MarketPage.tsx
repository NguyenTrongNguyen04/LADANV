import { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Star, 
  Heart, 
  ShoppingCart, 
  Eye,
  Package,
  Tag,
  MapPin,
  Calendar,
  ChevronDown,
  X,
  Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface Brand {
  _id: string;
  name: string;
  logo: string;
  origin: string;
}

interface Product {
  _id: string;
  name: string;
  brand: Brand;
  price: number;
  currency: string;
  description: string;
  specifications: {
    barcode: string;
    brandOrigin: string;
    manufacturePlace: string;
    skinType: string;
    features: string;
    volume: string;
    weight: string;
    ingredients: string[];
  };
  usageInstructions: string;
  images: string[];
  category: string;
  skinTypes: string[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  stock: number;
  rating: {
    average: number;
    count: number;
  };
  createdAt: string;
}

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  if (!product || !isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                {product.brand.logo && (
                  <img src={product.brand.logo} alt={product.brand.name} className="w-8 h-8 rounded-full" />
                )}
                <span className="text-sm text-blue-600 font-medium">{product.brand.name}</span>
                {product.isFeatured && (
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h2>
              <div className="text-3xl font-bold text-gray-900 mb-4">
                {product.price.toLocaleString('vi-VN')} {product.currency}
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Images */}
            <div>
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                {product.images.length > 0 ? (
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-16 h-16 text-gray-400" />
                  </div>
                )}
              </div>
              
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1, 5).map((image, index) => (
                    <div key={index} className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={image}
                        alt={`${product.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mô tả sản phẩm</h3>
                <p className="text-gray-700 leading-relaxed">{product.description}</p>
              </div>

              {/* Specifications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Thông số sản phẩm</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  {product.specifications.barcode && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mã vạch:</span>
                      <span className="font-medium">{product.specifications.barcode}</span>
                    </div>
                  )}
                  {product.specifications.brandOrigin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Xuất xứ thương hiệu:</span>
                      <span className="font-medium">{product.specifications.brandOrigin}</span>
                    </div>
                  )}
                  {product.specifications.manufacturePlace && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nơi sản xuất:</span>
                      <span className="font-medium">{product.specifications.manufacturePlace}</span>
                    </div>
                  )}
                  {product.specifications.skinType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Loại da:</span>
                      <span className="font-medium">{product.specifications.skinType}</span>
                    </div>
                  )}
                  {product.specifications.features && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Đặc tính:</span>
                      <span className="font-medium">{product.specifications.features}</span>
                    </div>
                  )}
                  {product.specifications.volume && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Dung tích:</span>
                      <span className="font-medium">{product.specifications.volume}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Ingredients */}
              {product.specifications.ingredients.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Thành phần chính</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.specifications.ingredients.map((ingredient, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Usage Instructions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Hướng dẫn sử dụng</h3>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-gray-700 leading-relaxed">{product.usageInstructions}</p>
                </div>
              </div>

              {/* Tags */}
              {product.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ hàng
                </button>
                <button className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <Heart className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MarketPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSkinType, setSelectedSkinType] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Modal
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const categories = [
    { value: 'cleanser', label: 'Sữa rửa mặt' },
    { value: 'moisturizer', label: 'Kem dưỡng ẩm' },
    { value: 'serum', label: 'Serum' },
    { value: 'toner', label: 'Toner' },
    { value: 'sunscreen', label: 'Kem chống nắng' },
    { value: 'mask', label: 'Mặt nạ' },
    { value: 'treatment', label: 'Điều trị' },
    { value: 'other', label: 'Khác' }
  ];

  const skinTypes = [
    { value: 'oily', label: 'Da dầu' },
    { value: 'dry', label: 'Da khô' },
    { value: 'combination', label: 'Da hỗn hợp' },
    { value: 'sensitive', label: 'Da nhạy cảm' },
    { value: 'normal', label: 'Da thường' }
  ];

  const sortOptions = [
    { value: 'createdAt', label: 'Mới nhất' },
    { value: 'price', label: 'Giá' },
    { value: 'name', label: 'Tên A-Z' },
    { value: 'rating.average', label: 'Đánh giá' }
  ];

  // Load data
  useEffect(() => {
    loadBrands();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [currentPage, searchQuery, selectedBrand, selectedCategory, selectedSkinType, priceRange, sortBy, sortOrder]);

  const loadBrands = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/brands/dropdown`);
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '12',
        search: searchQuery,
        brand: selectedBrand,
        category: selectedCategory,
        skinType: selectedSkinType,
        minPrice: priceRange.min,
        maxPrice: priceRange.max,
        sortBy,
        sortOrder
      });

      const response = await fetch(`${API_BASE_URL}/products?${params}`);
      const data = await response.json();
      
      if (data.success) {
        setProducts(data.data);
        setTotalPages(data.pagination.pages);
        setTotalProducts(data.pagination.total);
      } else {
        setError('Không thể tải danh sách sản phẩm');
      }
    } catch (error) {
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadProducts();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedBrand('');
    setSelectedCategory('');
    setSelectedSkinType('');
    setPriceRange({ min: '', max: '' });
    setCurrentPage(1);
  };

  const openProductDetail = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(c => c.value === category)?.label || category;
  };

  const getSkinTypeLabel = (skinType: string) => {
    return skinTypes.find(s => s.value === skinType)?.label || skinType;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thị trường mỹ phẩm</h1>
          <p className="text-gray-600">Khám phá và tìm kiếm sản phẩm phù hợp với làn da của bạn</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Tìm kiếm
              </button>
            </div>
          </form>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Brand Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Thương hiệu</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả thương hiệu</option>
                {brands.map(brand => (
                  <option key={brand._id} value={brand._id}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả danh mục</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </div>

            {/* Skin Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Loại da</label>
              <select
                value={selectedSkinType}
                onChange={(e) => setSelectedSkinType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Tất cả loại da</option>
                {skinTypes.map(skinType => (
                  <option key={skinType.value} value={skinType.value}>{skinType.label}</option>
                ))}
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Giá</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  placeholder="Từ"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  placeholder="Đến"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sắp xếp</label>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [newSortBy, newSortOrder] = e.target.value.split('-');
                  setSortBy(newSortBy);
                  setSortOrder(newSortOrder);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt-desc">Mới nhất</option>
                <option value="price-asc">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
                <option value="name-asc">Tên A-Z</option>
                <option value="rating.average-desc">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Clear Filters */}
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={clearFilters}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Xóa bộ lọc
            </button>
            <div className="text-sm text-gray-600">
              Tìm thấy {totalProducts} sản phẩm
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Đang tải sản phẩm...</span>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={loadProducts}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Thử lại
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sản phẩm</h3>
            <p className="text-gray-600 mb-4">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
            <button
              onClick={clearFilters}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow group cursor-pointer"
                  onClick={() => openProductDetail(product)}
                >
                  <div className="relative">
                    <div className="aspect-square overflow-hidden bg-gray-100">
                      {product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 flex gap-2">
                      {product.isFeatured && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" />
                          Nổi bật
                        </span>
                      )}
                    </div>
                    
                    <div className="absolute top-2 right-2">
                      <span className="px-2 py-1 bg-white/90 text-gray-700 text-xs rounded-full">
                        {getCategoryLabel(product.category)}
                      </span>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      {product.brand.logo && (
                        <img src={product.brand.logo} alt={product.brand.name} className="w-5 h-5 rounded-full" />
                      )}
                      <span className="text-sm text-blue-600 font-medium">{product.brand.name}</span>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {product.name}
                    </h3>
                    
                    <div className="text-lg font-bold text-gray-900 mb-3">
                      {product.price.toLocaleString('vi-VN')} {product.currency}
                    </div>
                    
                    {/* Rating */}
                    {product.rating.count > 0 && (
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= product.rating.average
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({product.rating.count})
                        </span>
                      </div>
                    )}
                    
                    {/* Skin Types */}
                    {product.skinTypes.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {product.skinTypes.slice(0, 2).map((skinType, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                          >
                            {getSkinTypeLabel(skinType)}
                          </span>
                        ))}
                        {product.skinTypes.length > 2 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            +{product.skinTypes.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Stock Status */}
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${
                        product.stock > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {product.stock > 0 ? `Còn ${product.stock} sản phẩm` : 'Hết hàng'}
                      </span>
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Xem chi tiết
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Trước
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                </button>
              </div>
            )}
          </>
        )}

        {/* Product Detail Modal */}
        <ProductDetailModal
          product={selectedProduct}
          isOpen={showProductModal}
          onClose={() => setShowProductModal(false)}
        />
      </div>
    </div>
  );
}
