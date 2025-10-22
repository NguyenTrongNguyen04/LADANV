import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, BarChart3 } from 'lucide-react';

export function AnalysisPage() {
  const skinTrend = {
    improvement: 12,
    period: '30 ngày qua',
    status: 'improving',
  };

  const topIngredients = [
    { name: 'Niacinamide', uses: 5, effectiveness: 92, status: 'excellent' },
    { name: 'Hyaluronic Acid', uses: 4, effectiveness: 88, status: 'good' },
    { name: 'Salicylic Acid', uses: 3, effectiveness: 85, status: 'good' },
    { name: 'Vitamin C', uses: 2, effectiveness: 78, status: 'fair' },
  ];

  const concerns = [
    { name: 'Mụn', status: 'improved', change: -35 },
    { name: 'Lỗ chân lông', status: 'improved', change: -20 },
    { name: 'Da dầu', status: 'stable', change: 0 },
    { name: 'Thâm', status: 'worsened', change: 10 },
  ];

  const recommendations = [
    {
      type: 'success',
      title: 'Niacinamide đang phát huy tác dụng tốt',
      description: 'Da cải thiện 35% về tình trạng mụn sau 4 tuần sử dụng',
      action: 'Tiếp tục duy trì',
    },
    {
      type: 'warning',
      title: 'Vitamin C có thể không phù hợp',
      description: 'Da có dấu hiệu kích ứng nhẹ khi dùng sản phẩm chứa Vitamin C',
      action: 'Xem thay thế',
    },
    {
      type: 'info',
      title: 'Nên thêm kem chống nắng',
      description: 'Bạn đang dùng các thành phần nhạy cảm ánh sáng',
      action: 'Tìm sản phẩm',
    },
  ];

  const weeklyProgress = [
    { week: 'T1', score: 65 },
    { week: 'T2', score: 70 },
    { week: 'T3', score: 75 },
    { week: 'T4', score: 82 },
  ];

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Phân tích da</h1>
        <p className="text-gray-600">Theo dõi tiến trình và nhận gợi ý cải thiện</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div
          className={`rounded-xl p-6 text-white ${
            skinTrend.status === 'improving'
              ? 'bg-gradient-to-br from-green-500 to-emerald-500'
              : 'bg-gradient-to-br from-orange-500 to-red-500'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              {skinTrend.status === 'improving' ? (
                <TrendingUp className="w-6 h-6" />
              ) : (
                <TrendingDown className="w-6 h-6" />
              )}
            </div>
            <span className="text-3xl font-bold">
              {skinTrend.improvement > 0 ? '+' : ''}
              {skinTrend.improvement}%
            </span>
          </div>
          <div className="text-green-50 mb-1">Tình trạng da</div>
          <div className="text-2xl font-bold">
            {skinTrend.status === 'improving' ? 'Đang cải thiện' : 'Cần chú ý'}
          </div>
          <div className="text-sm text-green-100 mt-2">{skinTrend.period}</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold">85</span>
          </div>
          <div className="text-blue-50 mb-1">Điểm trung bình</div>
          <div className="text-2xl font-bold">Sản phẩm phù hợp</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold">12</span>
          </div>
          <div className="text-purple-50 mb-1">Thành phần</div>
          <div className="text-2xl font-bold">Đang theo dõi</div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Biểu đồ tiến trình
          </h2>
          <div className="space-y-4">
            {weeklyProgress.map((week, index) => (
              <div key={index}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">{week.week}</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {week.score}/100
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-full rounded-full transition-all"
                    style={{ width: `${week.score}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Vấn đề da theo dõi
          </h2>
          <div className="space-y-3">
            {concerns.map((concern, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {concern.status === 'improved' ? (
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-green-600" />
                    </div>
                  ) : concern.status === 'worsened' ? (
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                    </div>
                  )}
                  <span className="font-medium text-gray-900">{concern.name}</span>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    concern.status === 'improved'
                      ? 'text-green-600'
                      : concern.status === 'worsened'
                      ? 'text-red-600'
                      : 'text-gray-600'
                  }`}
                >
                  {concern.change > 0 ? '+' : ''}
                  {concern.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thành phần hiệu quả nhất
        </h2>
        <div className="space-y-4">
          {topIngredients.map((ingredient, index) => (
            <div
              key={index}
              className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="font-semibold text-gray-900 mb-1">
                  {ingredient.name}
                </div>
                <div className="text-sm text-gray-600">
                  Sử dụng trong {ingredient.uses} sản phẩm
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  {ingredient.effectiveness}%
                </div>
                <div className="text-xs text-gray-600">Hiệu quả</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Gợi ý cho bạn</h2>
        <div className="space-y-4">
          {recommendations.map((rec, index) => {
            const bgColor =
              rec.type === 'success'
                ? 'bg-green-50 border-green-200'
                : rec.type === 'warning'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200';

            const iconColor =
              rec.type === 'success'
                ? 'text-green-600'
                : rec.type === 'warning'
                ? 'text-orange-600'
                : 'text-blue-600';

            return (
              <div key={index} className={`border rounded-lg p-4 ${bgColor}`}>
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {rec.type === 'success' ? (
                      <CheckCircle className={`w-6 h-6 ${iconColor}`} />
                    ) : (
                      <AlertCircle className={`w-6 h-6 ${iconColor}`} />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{rec.title}</h3>
                    <p className="text-sm text-gray-700 mb-3">{rec.description}</p>
                    <button
                      className={`text-sm font-medium ${iconColor} hover:underline`}
                    >
                      {rec.action} →
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
