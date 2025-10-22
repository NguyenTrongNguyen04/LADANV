import { useState } from 'react';
import { Calendar, Camera, Plus, TrendingUp } from 'lucide-react';

export function JournalPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const journalEntries = [
    {
      date: '2024-10-15',
      condition: 'good',
      notes: 'Da đỡ dầu hơn, không nổi mụn mới',
      reactions: [],
      photoUrl: 'https://images.pexels.com/photos/3762882/pexels-photo-3762882.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2024-10-10',
      condition: 'fair',
      notes: 'Da hơi khô vùng má, xuất hiện 1 mụn nhỏ',
      reactions: ['Hơi khô'],
      photoUrl: 'https://images.pexels.com/photos/3762879/pexels-photo-3762879.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
    {
      date: '2024-10-05',
      condition: 'excellent',
      notes: 'Da rất tốt, mịn màng và sáng',
      reactions: [],
      photoUrl: 'https://images.pexels.com/photos/3785147/pexels-photo-3785147.jpeg?auto=compress&cs=tinysrgb&w=400',
    },
  ];

  const getConditionColor = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'good':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'fair':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'poor':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'excellent':
        return 'Rất tốt';
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Bình thường';
      case 'poor':
        return 'Xấu';
      default:
        return 'Chưa đánh giá';
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhật ký da</h1>
          <p className="text-gray-600">Theo dõi tình trạng da và sản phẩm sử dụng</p>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2">
          <Plus className="w-5 h-5" />
          Thêm ghi chú
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold">↑ 12%</span>
          </div>
          <div className="text-green-50 mb-1">Cải thiện</div>
          <div className="text-2xl font-bold">7 ngày qua</div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold">15</span>
          </div>
          <div className="text-blue-50 mb-1">Liên tục</div>
          <div className="text-2xl font-bold">Ngày ghi chú</div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <span className="text-3xl font-bold">45</span>
          </div>
          <div className="text-purple-50 mb-1">Ảnh</div>
          <div className="text-2xl font-bold">Đã lưu</div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Chọn ngày xem</h2>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ghi chú gần đây</h2>
        <div className="space-y-4">
          {journalEntries.map((entry, index) => (
            <div
              key={index}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="grid md:grid-cols-3 gap-6 p-6">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={entry.photoUrl}
                    alt={`Ảnh da ngày ${entry.date}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="md:col-span-2 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-2">
                        {new Date(entry.date).toLocaleDateString('vi-VN', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                      <span
                        className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm border ${getConditionColor(
                          entry.condition
                        )}`}
                      >
                        {getConditionLabel(entry.condition)}
                      </span>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Ghi chú:</h3>
                    <p className="text-gray-700 mb-4">{entry.notes}</p>

                    {entry.reactions.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-2">
                          Phản ứng da:
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {entry.reactions.map((reaction, idx) => (
                            <span
                              key={idx}
                              className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm"
                            >
                              {reaction}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    <button className="flex-1 bg-blue-50 text-blue-700 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors">
                      Chỉnh sửa
                    </button>
                    <button className="flex-1 bg-gray-50 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                      So sánh
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-blue-50 to-teal-50 rounded-xl p-8 text-center">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          Mẹo ghi nhật ký hiệu quả
        </h3>
        <div className="grid sm:grid-cols-3 gap-4 text-left">
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">📸</div>
            <div className="font-semibold text-gray-900 mb-1">Chụp ảnh đều đặn</div>
            <div className="text-sm text-gray-600">
              Chụp ảnh cùng góc độ và ánh sáng để dễ so sánh
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">📝</div>
            <div className="font-semibold text-gray-900 mb-1">Ghi chú chi tiết</div>
            <div className="text-sm text-gray-600">
              Ghi lại sản phẩm, thời tiết, chế độ ăn uống
            </div>
          </div>
          <div className="bg-white rounded-lg p-4">
            <div className="text-2xl mb-2">⏰</div>
            <div className="font-semibold text-gray-900 mb-1">Kiên trì</div>
            <div className="text-sm text-gray-600">
              Ghi nhật ký ít nhất 2-3 lần/tuần để theo dõi tốt
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
