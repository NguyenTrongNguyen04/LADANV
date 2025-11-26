import { XCircle, ArrowLeft } from 'lucide-react';

interface PaymentErrorProps {
  onNavigate?: (view: string) => void;
}

export function PaymentError({ onNavigate }: PaymentErrorProps) {

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fade-in-up">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-red-200 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-red-100 rounded-full p-4">
              <XCircle className="w-16 h-16 text-red-600" />
            </div>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Thanh toán không thành công
        </h1>
        
        <p className="text-xl text-gray-700 mb-8">
          Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('pricing');
              } else {
                window.location.href = '/pricing';
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
            Quay lại trang gói
          </button>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
              } else {
                window.location.href = '/';
              }
            }}
            className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Về trang chủ
          </button>
        </div>

        {/* Note */}
        <p className="mt-8 text-sm text-gray-500">
          Nếu bạn đã thanh toán nhưng vẫn thấy thông báo này, vui lòng liên hệ hỗ trợ với mã giao dịch của bạn.
        </p>
      </div>
    </div>
  );
}

