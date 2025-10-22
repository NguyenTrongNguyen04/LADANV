import { ArrowLeft, AlertTriangle, CheckCircle, Info, Heart, Share2, Star } from 'lucide-react';
import { useState } from 'react';

interface ProductDetailProps {
  productId: string;
  onBack: () => void;
}

export function ProductDetail({ onBack }: ProductDetailProps) {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'reviews'>('ingredients');

  const sampleProduct = {
    id: '1',
    name: 'La Roche-Posay Effaclar Duo+',
    brand: 'La Roche-Posay',
    category: 'Kem trị mụn',
    price: 425000,
    image: 'https://images.pexels.com/photos/3018845/pexels-photo-3018845.jpeg?auto=compress&cs=tinysrgb&w=800',
    description: 'Kem dưỡng làm giảm mụn, thâm và kiểm soát dầu dành cho da dầu mụn',
    rating: 85,
    reviews: 1247,
  };

  const ingredients = [
    {
      name: 'Niacinamide',
      nameVi: 'Niacinamide',
      rating: 'good',
      description: 'Giúp làm sáng da, giảm thâm, kiểm soát dầu và thu nhỏ lỗ chân lông',
      functions: ['Làm sáng da', 'Kiểm soát dầu', 'Chống viêm'],
      concerns: [],
    },
    {
      name: 'Salicylic Acid',
      nameVi: 'Acid Salicylic',
      rating: 'good',
      description: 'Giúp làm sạch sâu lỗ chân lông, ngăn ngừa mụn và giảm viêm',
      functions: ['Tẩy tế bào chết', 'Trị mụn', 'Làm sạch lỗ chân lông'],
      concerns: ['Có thể gây khô da ở nồng độ cao'],
    },
    {
      name: 'Glycerin',
      nameVi: 'Glycerin',
      rating: 'good',
      description: 'Chất dưỡng ẩm tự nhiên, giúp giữ nước cho da',
      functions: ['Dưỡng ẩm', 'Làm mềm da'],
      concerns: [],
    },
    {
      name: 'Dimethicone',
      nameVi: 'Dimethicone',
      rating: 'neutral',
      description: 'Silicone tạo lớp màng bảo vệ, giúp da mịn màng',
      functions: ['Làm mịn da', 'Bảo vệ da'],
      concerns: ['Có thể gây bít lỗ chân lông ở một số người'],
    },
    {
      name: 'Fragrance',
      nameVi: 'Hương liệu',
      rating: 'caution',
      description: 'Tạo mùi thơm cho sản phẩm',
      functions: ['Tạo hương'],
      concerns: ['Có thể gây kích ứng da nhạy cảm', 'Dễ gây dị ứng'],
    },
  ];

  const userReviews = [
    {
      id: '1',
      user: 'Nguyễn Mai',
      rating: 5,
      date: '2024-10-10',
      skinType: 'Da dầu mụn',
      comment: 'Sản phẩm rất tốt, giúp giảm mụn sau 2 tuần sử dụng. Da sáng hơn và ít dầu hơn.',
      helpful: 24,
    },
    {
      id: '2',
      user: 'Trần Hương',
      rating: 4,
      date: '2024-10-08',
      skinType: 'Da hỗn hợp',
      comment: 'Hiệu quả tốt nhưng hơi khô da vùng má. Nên dùng kèm kem dưỡng ẩm.',
      helpful: 18,
    },
  ];

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'text-green-700 bg-green-100 border-green-200';
      case 'neutral':
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'caution':
        return 'text-orange-700 bg-orange-100 border-orange-200';
      case 'avoid':
        return 'text-red-700 bg-red-100 border-red-200';
      default:
        return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getRatingIcon = (rating: string) => {
    switch (rating) {
      case 'good':
        return <CheckCircle className="w-5 h-5" />;
      case 'neutral':
        return <Info className="w-5 h-5" />;
      case 'caution':
      case 'avoid':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getRatingLabel = (rating: string) => {
    switch (rating) {
      case 'good':
        return 'An toàn';
      case 'neutral':
        return 'Trung lập';
      case 'caution':
        return 'Thận trọng';
      case 'avoid':
        return 'Tránh dùng';
      default:
        return 'Chưa đánh giá';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="font-medium">Quay lại</span>
      </button>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={sampleProduct.image}
              alt={sampleProduct.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <div className="text-sm text-blue-600 font-medium mb-2">
              {sampleProduct.brand}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              {sampleProduct.name}
            </h1>
            <p className="text-gray-600 mb-4">{sampleProduct.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-5 h-5 ${
                        star <= 4 ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600">
                  ({sampleProduct.reviews} đánh giá)
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Điểm phù hợp với da của bạn
                </span>
                <span className="text-2xl font-bold text-green-700">
                  {sampleProduct.rating}/100
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-teal-500 h-full rounded-full"
                  style={{ width: `${sampleProduct.rating}%` }}
                ></div>
              </div>
            </div>

            <div className="text-3xl font-bold text-gray-900 mb-6">
              {sampleProduct.price.toLocaleString('vi-VN')} ₫
            </div>

            <div className="flex gap-3">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors">
                Mua ngay
              </button>
              <button className="p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Heart className="w-6 h-6 text-gray-600" />
              </button>
              <button className="p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Share2 className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'ingredients'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Thành phần ({ingredients.length})
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`flex-1 py-4 px-6 font-semibold transition-colors ${
                activeTab === 'reviews'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Đánh giá ({userReviews.length})
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'ingredients' && (
            <div className="space-y-4">
              {ingredients.map((ingredient, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {ingredient.nameVi}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getRatingColor(
                            ingredient.rating
                          )}`}
                        >
                          {getRatingIcon(ingredient.rating)}
                          {getRatingLabel(ingredient.rating)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-2">{ingredient.name}</p>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3">{ingredient.description}</p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {ingredient.functions.map((func, idx) => (
                      <span
                        key={idx}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm"
                      >
                        {func}
                      </span>
                    ))}
                  </div>

                  {ingredient.concerns.length > 0 && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-orange-900 mb-1">
                            Lưu ý:
                          </p>
                          <ul className="text-sm text-orange-800 list-disc list-inside">
                            {ingredient.concerns.map((concern, idx) => (
                              <li key={idx}>{concern}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {userReviews.map((review) => (
                <div
                  key={review.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="font-semibold text-gray-900 mb-1">
                        {review.user}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= review.rating
                                  ? 'fill-yellow-400 text-yellow-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-500">{review.date}</span>
                      </div>
                    </div>
                    <span className="text-sm text-blue-600 font-medium">
                      {review.skinType}
                    </span>
                  </div>

                  <p className="text-gray-700 mb-3">{review.comment}</p>

                  <button className="text-sm text-gray-600 hover:text-gray-900">
                    👍 Hữu ích ({review.helpful})
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
