import { Heart, Package, X, Plus } from 'lucide-react';
import { useState } from 'react';

export function MyProductsPage() {
  const [activeTab, setActiveTab] = useState<'using' | 'wishlist'>('using');

  const usingProducts = [
    {
      id: '1',
      name: 'La Roche-Posay Effaclar Duo+',
      brand: 'La Roche-Posay',
      category: 'Kem trị mụn',
      image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=400',
      startedAt: '2024-09-15',
      notes: 'Dùng buổi tối sau serum',
      rating: 85,
    },
    {
      id: '2',
      name: 'Cetaphil Gentle Skin Cleanser',
      brand: 'Cetaphil',
      category: 'Sữa rửa mặt',
      image: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400',
      startedAt: '2024-08-01',
      notes: 'Dùng sáng và tối',
      rating: 90,
    },
  ];

  const wishlistProducts = [
    {
      id: '3',
      name: 'The Ordinary Niacinamide 10% + Zinc 1%',
      brand: 'The Ordinary',
      category: 'Serum',
      image: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: 285000,
      rating: 88,
    },
    {
      id: '4',
      name: 'CeraVe Moisturizing Cream',
      brand: 'CeraVe',
      category: 'Kem dưỡng ẩm',
      image: 'https://images.pexels.com/photos/3762875/pexels-photo-3762875.jpeg?auto=compress&cs=tinysrgb&w=400',
      price: 520000,
      rating: 92,
    },
  ];

  const products = activeTab === 'using' ? usingProducts : wishlistProducts;

  const getDaysUsed = (startDate: string) => {
    const start = new Date(startDate);
    const today = new Date();
    const diff = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Sản phẩm của tôi</h1>
          <p className="text-gray-600">Quản lý sản phẩm đang dùng và muốn mua</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm sản phẩm
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('using')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'using'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-5 h-5" />
            Đang dùng ({usingProducts.length})
          </button>
          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex-1 py-4 px-6 font-semibold transition-colors flex items-center justify-center gap-2 ${
              activeTab === 'wishlist'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Heart className="w-5 h-5" />
            Muốn mua ({wishlistProducts.length})
          </button>
        </div>

        <div className="p-6">
          {products.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                {activeTab === 'using' ? (
                  <Package className="w-8 h-8 text-gray-400" />
                ) : (
                  <Heart className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <p className="text-gray-600 mb-4">
                {activeTab === 'using'
                  ? 'Chưa có sản phẩm đang sử dụng'
                  : 'Chưa có sản phẩm trong danh sách mong muốn'}
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors">
                Thêm sản phẩm đầu tiên
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all group"
                >
                  <div className="relative">
                    <div className="aspect-video overflow-hidden bg-gray-100">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <button className="absolute top-2 right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-50 transition-colors">
                      <X className="w-4 h-4 text-gray-600 hover:text-red-600" />
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="text-xs text-blue-600 font-medium mb-1">
                      {product.brand}
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <div className="text-sm text-gray-600 mb-3">{product.category}</div>

                    {activeTab === 'using' && 'startedAt' in product && (
                      <div className="bg-blue-50 rounded-lg p-3 mb-3">
                        <div className="text-sm text-gray-700 mb-1">
                          Đã dùng: <span className="font-semibold">{getDaysUsed(product.startedAt)} ngày</span>
                        </div>
                        {product.notes && (
                          <div className="text-xs text-gray-600">{product.notes}</div>
                        )}
                      </div>
                    )}

                    {activeTab === 'wishlist' && 'price' in product && (
                      <div className="text-lg font-bold text-gray-900 mb-3">
                        {product.price.toLocaleString('vi-VN')} ₫
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            product.rating >= 85 ? 'bg-green-500' : 'bg-yellow-500'
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900">
                          {product.rating}/100
                        </span>
                      </div>

                      {activeTab === 'using' ? (
                        <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Đánh giá
                        </button>
                      ) : (
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                          Mua ngay
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {activeTab === 'using' && usingProducts.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Thói quen chăm sóc da của bạn
          </h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Buổi sáng</div>
              <div className="space-y-2">
                {usingProducts.slice(0, 2).map((product, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-900">{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-lg p-4">
              <div className="text-sm text-gray-600 mb-2">Buổi tối</div>
              <div className="space-y-2">
                {usingProducts.map((product, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-semibold text-sm">
                      {index + 1}
                    </div>
                    <span className="text-sm text-gray-900">{product.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
