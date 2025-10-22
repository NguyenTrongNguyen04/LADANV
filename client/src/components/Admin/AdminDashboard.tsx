import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter, 
  Package, 
  Tag, 
  Eye,
  EyeOff,
  Star,
  StarOff,
  Save,
  X,
  Upload,
  AlertCircle,
  LogOut,
  User,
  Shield
} from 'lucide-react';
import { useAdmin } from '../../contexts/AdminContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface Brand {
  _id: string;
  name: string;
  description: string;
  logo: string;
  origin: string;
  website: string;
  isActive: boolean;
  createdAt: string;
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

export function AdminDashboard() {
  const { admin, logout } = useAdmin();
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('brands');
  const [brands, setBrands] = useState<Brand[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Brand form states
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    description: '',
    logo: '',
    origin: '',
    website: ''
  });
  
  // Product form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    currency: 'VND',
    description: '',
    specifications: {
      barcode: '',
      brandOrigin: '',
      manufacturePlace: '',
      skinType: '',
      features: '',
      volume: '',
      weight: '',
      ingredients: [] as string[]
    },
    usageInstructions: '',
    images: [] as string[],
    category: 'other',
    skinTypes: [] as string[],
    tags: [] as string[],
    stock: 0
  });
  
  const [newIngredient, setNewIngredient] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newImage, setNewImage] = useState('');

  // Helpers
  const sanitizeUrl = (url: string): string => {
    const t = (url || '').trim();
    if (!t) return '';
    return t.startsWith('@') ? t.slice(1) : t;
  };

  const buildImagesPayload = (): string[] => {
    const imgs = [...productForm.images];
    if (newImage && newImage.trim()) imgs.push(newImage.trim());
    return imgs.map(sanitizeUrl).filter(Boolean);
  };

  const toProxyUrl = (url: string): string => {
    // Use images.weserv.nl proxy to bypass hotlink/CORS for some providers
    try {
      const u = new URL(sanitizeUrl(url));
      const hostless = `${u.host}${u.pathname}${u.search}`;
      return `https://images.weserv.nl/?url=${encodeURIComponent(hostless)}&w=400&h=400&fit=cover`;
    } catch {
      return sanitizeUrl(url);
    }
  };

  // Load data
  useEffect(() => {
    loadBrands();
    loadProducts();
  }, []);

  const loadBrands = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/brands`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setBrands(data.data);
      } else {
        console.error('Load brands failed:', data);
        setBrands([]);
      }
    } catch (error) {
      setError('Không thể tải danh sách thương hiệu');
    } finally {
      setLoading(false);
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`, { credentials: 'include' });
      const data = await response.json();
      if (data.success) {
        setProducts(data.data);
      } else {
        console.error('Load products failed:', data);
        setProducts([]);
      }
    } catch (error) {
      setError('Không thể tải danh sách sản phẩm');
    } finally {
      setLoading(false);
    }
  };

  // Brand operations
  const handleCreateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/brands`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(brandForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Tạo thương hiệu thành công!');
        setShowBrandForm(false);
        resetBrandForm();
        loadBrands();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể tạo thương hiệu');
    }
  };

  const handleUpdateBrand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${editingBrand._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(brandForm)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Cập nhật thương hiệu thành công!');
        setShowBrandForm(false);
        setEditingBrand(null);
        resetBrandForm();
        loadBrands();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể cập nhật thương hiệu');
    }
  };

  const handleDeleteBrand = async (brandId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/brands/${brandId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Xóa thương hiệu thành công!');
        loadBrands();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể xóa thương hiệu');
    }
  };

  const resetBrandForm = () => {
    setBrandForm({
      name: '',
      description: '',
      logo: '',
      origin: '',
      website: ''
    });
  };

  const openBrandForm = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setBrandForm({
        name: brand.name,
        description: brand.description,
        logo: brand.logo,
        origin: brand.origin,
        website: brand.website
      });
    } else {
      setEditingBrand(null);
      resetBrandForm();
    }
    setShowBrandForm(true);
  };

  // Product operations
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...productForm,
          images: buildImagesPayload(),
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock.toString())
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Tạo sản phẩm thành công!');
        setShowProductForm(false);
        resetProductForm();
        loadProducts();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể tạo sản phẩm');
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...productForm,
          images: buildImagesPayload(),
          price: parseFloat(productForm.price),
          stock: parseInt(productForm.stock.toString())
        })
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Cập nhật sản phẩm thành công!');
        setShowProductForm(false);
        setEditingProduct(null);
        resetProductForm();
        loadProducts();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể cập nhật sản phẩm');
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess('Xóa sản phẩm thành công!');
        loadProducts();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Không thể xóa sản phẩm');
    }
  };

  const resetProductForm = () => {
    setProductForm({
      name: '',
      brand: '',
      price: '',
      currency: 'VND',
      description: '',
      specifications: {
        barcode: '',
        brandOrigin: '',
        manufacturePlace: '',
        skinType: '',
        features: '',
        volume: '',
        weight: '',
        ingredients: []
      },
      usageInstructions: '',
      images: [],
      category: 'other',
      skinTypes: [],
      tags: [],
      stock: 0
    });
  };

  const openProductForm = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        brand: product.brand._id,
        price: product.price.toString(),
        currency: product.currency,
        description: product.description,
        specifications: product.specifications,
        usageInstructions: product.usageInstructions,
        images: product.images,
        category: product.category,
        skinTypes: product.skinTypes,
        tags: product.tags,
        stock: product.stock
      });
    } else {
      setEditingProduct(null);
      resetProductForm();
    }
    setShowProductForm(true);
  };

  const addIngredient = () => {
    if (newIngredient.trim()) {
      setProductForm(prev => ({
        ...prev,
        specifications: {
          ...prev.specifications,
          ingredients: [...prev.specifications.ingredients, newIngredient.trim()]
        }
      }));
      setNewIngredient('');
    }
  };

  const removeIngredient = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        ingredients: prev.specifications.ingredients.filter((_, i) => i !== index)
      }
    }));
  };

  const addTag = () => {
    if (newTag.trim()) {
      setProductForm(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  const addImage = () => {
    if (newImage.trim()) {
      setProductForm(prev => ({
        ...prev,
        images: [...prev.images, sanitizeUrl(newImage)]
      }));
      setNewImage('');
    }
  };

  const removeImage = (index: number) => {
    setProductForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  // Clear messages
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">Quản lý thương hiệu và sản phẩm</p>
            </div>
            
            {/* Admin Info & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-2 rounded-lg">
                <Shield className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">{admin?.fullName}</span>
                <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                  {admin?.role}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-sm">Đăng xuất</span>
              </button>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-700">{success}</span>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('brands')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'brands'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Tag className="w-4 h-4 inline mr-2" />
                Thương hiệu ({brands.length})
              </button>
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Package className="w-4 h-4 inline mr-2" />
                Sản phẩm ({products.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'brands' && (
          <div>
            {/* Brands Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách thương hiệu</h2>
              <button
                onClick={() => openBrandForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm thương hiệu
              </button>
            </div>

            {/* Brands Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thương hiệu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Xuất xứ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày tạo
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {brands.map((brand) => (
                    <tr key={brand._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {brand.logo && (
                            <img className="h-10 w-10 rounded-full mr-3" src={brand.logo} alt={brand.name} />
                          )}
                          <div>
                            <div className="text-sm font-medium text-gray-900">{brand.name}</div>
                            <div className="text-sm text-gray-500">{brand.description}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {brand.origin}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          brand.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {brand.isActive ? 'Hoạt động' : 'Tạm dừng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(brand.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openBrandForm(brand)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand._id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            {/* Products Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Danh sách sản phẩm</h2>
              <button
                onClick={() => openProductForm()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Thêm sản phẩm
              </button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <div key={product._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="aspect-w-16 aspect-h-9">
                    {product.images.length > 0 ? (
                      <img
                        src={toProxyUrl(product.images[0])}
                        alt={product.name}
                        className="w-full h-48 object-cover"
                        onError={(e) => {
                          const target = e.currentTarget as HTMLImageElement;
                          // Fallback to direct URL if proxy fails
                          target.src = sanitizeUrl(product.images[0]);
                        }}
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-medium">{product.brand.name}</span>
                      <div className="flex gap-1">
                        {product.isFeatured && (
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        )}
                        {product.isActive ? (
                          <Eye className="w-4 h-4 text-green-500" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                    
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    
                    <div className="text-lg font-bold text-gray-900 mb-2">
                      {product.price.toLocaleString('vi-VN')} {product.currency}
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-3">
                      <div>Kho: {product.stock} sản phẩm</div>
                      <div>Danh mục: {product.category}</div>
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openProductForm(product)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-red-600 hover:text-red-900 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Brand Form Modal */}
        {showBrandForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">
                  {editingBrand ? 'Chỉnh sửa thương hiệu' : 'Thêm thương hiệu mới'}
                </h3>
                <button
                  onClick={() => setShowBrandForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={editingBrand ? handleUpdateBrand : handleCreateBrand} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên thương hiệu *
                  </label>
                  <input
                    type="text"
                    value={brandForm.name}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả
                  </label>
                  <textarea
                    value={brandForm.description}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo URL
                  </label>
                  <input
                    type="url"
                    value={brandForm.logo}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, logo: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Xuất xứ
                  </label>
                  <input
                    type="text"
                    value={brandForm.origin}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, origin: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website
                  </label>
                  <input
                    type="url"
                    value={brandForm.website}
                    onChange={(e) => setBrandForm(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBrandForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingBrand ? 'Cập nhật' : 'Tạo mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Product Form Modal */}
        {showProductForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">
                    {editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
                  </h3>
                  <button
                    onClick={() => setShowProductForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={editingProduct ? handleUpdateProduct : handleCreateProduct} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tên sản phẩm *
                      </label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Thương hiệu *
                      </label>
                      <select
                        value={productForm.brand}
                        onChange={(e) => setProductForm(prev => ({ ...prev, brand: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                      >
                        <option value="">Chọn thương hiệu</option>
                        {brands.map(brand => (
                          <option key={brand._id} value={brand._id}>{brand.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giá *
                      </label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm(prev => ({ ...prev, price: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        required
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Đơn vị tiền tệ
                      </label>
                      <select
                        value={productForm.currency}
                        onChange={(e) => setProductForm(prev => ({ ...prev, currency: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="VND">VND</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Danh mục
                      </label>
                      <select
                        value={productForm.category}
                        onChange={(e) => setProductForm(prev => ({ ...prev, category: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="cleanser">Sữa rửa mặt</option>
                        <option value="moisturizer">Kem dưỡng ẩm</option>
                        <option value="serum">Serum</option>
                        <option value="toner">Toner</option>
                        <option value="sunscreen">Kem chống nắng</option>
                        <option value="mask">Mặt nạ</option>
                        <option value="treatment">Điều trị</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Số lượng tồn kho
                      </label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mô tả sản phẩm *
                    </label>
                    <textarea
                      value={productForm.description}
                      onChange={(e) => setProductForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Specifications */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-3">Thông số sản phẩm</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mã vạch
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.barcode}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, barcode: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Xuất xứ thương hiệu
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.brandOrigin}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, brandOrigin: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nơi sản xuất
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.manufacturePlace}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, manufacturePlace: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Loại da phù hợp
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.skinType}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, skinType: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Đặc tính
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.features}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, features: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Dung tích
                        </label>
                        <input
                          type="text"
                          value={productForm.specifications.volume}
                          onChange={(e) => setProductForm(prev => ({
                            ...prev,
                            specifications: { ...prev.specifications, volume: e.target.value }
                          }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Ingredients */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Thành phần chính
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newIngredient}
                          onChange={(e) => setNewIngredient(e.target.value)}
                          placeholder="Thêm thành phần..."
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addIngredient}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Thêm
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {productForm.specifications.ingredients.map((ingredient, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {ingredient}
                            <button
                              type="button"
                              onClick={() => removeIngredient(index)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Usage Instructions */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hướng dẫn sử dụng *
                    </label>
                    <textarea
                      value={productForm.usageInstructions}
                      onChange={(e) => setProductForm(prev => ({ ...prev, usageInstructions: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={4}
                      required
                    />
                  </div>

                  {/* Images */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hình ảnh sản phẩm
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="url"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        placeholder="URL hình ảnh..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {productForm.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Product ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="Thêm tag..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addTag}
                        className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Thêm
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {productForm.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                        >
                          {tag}
                          <button
                            type="button"
                            onClick={() => removeTag(index)}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <button
                      type="button"
                      onClick={() => setShowProductForm(false)}
                      className="px-6 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
