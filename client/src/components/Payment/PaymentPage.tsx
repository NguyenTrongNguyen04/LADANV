import { useEffect, useState } from 'react';
import { CheckCircle, Loader2, XCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface PaymentPageProps {
  orderInvoiceNumber: string;
  planId: string;
  onNavigate?: (view: string) => void;
}

export function PaymentPage({ orderInvoiceNumber, planId, onNavigate }: PaymentPageProps) {
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [manualInfo, setManualInfo] = useState<{ bank: string; account: string; amount: number; description: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [polling, setPolling] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState<string>('');
  const [verifySuccess, setVerifySuccess] = useState<boolean | null>(null);

  const planNames: Record<string, string> = {
    free: 'Gói Miễn Phí',
    pro: 'Gói Pro',
    premier: 'Gói Premier'
  };

  useEffect(() => {
    loadOrderData();
  }, [orderInvoiceNumber]);

  useEffect(() => {
    if (order && order.status === 'pending' && !polling) {
      startPolling();
    }
    return () => {
      if (polling) {
        setPolling(false);
      }
    };
  }, [order]);

  const loadOrderData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment/order/${orderInvoiceNumber}`, {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (data.success && data.data) {
        setOrder(data.data.order);

        if (data.data.vietQrUrl) {
          setQrCodeUrl(data.data.vietQrUrl);
        } else {
          const qrContent = JSON.stringify({
            url: data.data.checkoutURL,
            ...data.data.fields
          });
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrContent)}`;
          setQrCodeUrl(qrApiUrl);
        }

        if (data.data.vietQrInfo) {
          setManualInfo(data.data.vietQrInfo);
        } else {
          setManualInfo(null);
        }
      } else {
        setError(data.message || 'Không thể tải thông tin đơn hàng');
      }
    } catch (err) {
      setError('Không thể kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    setPolling(true);
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/payment/order/${orderInvoiceNumber}`, {
          credentials: 'include'
        });
        const data = await response.json();
        
        if (data.success && data.data.order) {
          const newStatus = data.data.order.status;
          setOrder(data.data.order);
          
          // Nếu đã thanh toán thành công, dừng polling
          if (newStatus === 'paid') {
            clearInterval(interval);
            setPolling(false);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000); // Poll mỗi 3 giây

    // Cleanup sau 5 phút
    setTimeout(() => {
      clearInterval(interval);
      setPolling(false);
    }, 5 * 60 * 1000);
  };

  const handleManualVerify = async () => {
    setVerifying(true);
    setVerifyMessage('');
    try {
      const response = await fetch(`${API_BASE_URL}/payment/order/${orderInvoiceNumber}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setVerifySuccess(false);
        setVerifyMessage(data.message || 'Không thể kiểm tra lại giao dịch.');
        return;
      }

      if (data.data?.order) {
        setOrder(data.data.order);
      }

      if (data.data?.verified) {
        setVerifySuccess(true);
        setVerifyMessage(data.message || 'Đã xác nhận thanh toán thành công.');
      } else {
        setVerifySuccess(false);
        setVerifyMessage(data.message || 'SePay chưa xác nhận giao dịch. Vui lòng thử lại sau ít phút.');
      }
    } catch (err) {
      setVerifySuccess(false);
      setVerifyMessage('Không thể kiểm tra lại giao dịch. Vui lòng thử sau.');
    } finally {
      setVerifying(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải thông tin thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-6 text-center">
          <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Lỗi</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('pricing');
              } else {
                window.location.href = '/pricing';
              }
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300"
          >
            Quay lại trang gói
          </button>
        </div>
      </div>
    );
  }

  if (order?.status === 'paid') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
              <div className="relative bg-green-100 rounded-full p-4">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thanh toán thành công! 🎉
          </h1>
          
          <div className="mb-8">
            <p className="text-xl text-gray-700 mb-2">
              Chúc mừng bạn đã nâng cấp thành công
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {planNames[planId] || 'Gói của bạn'}
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <p className="text-gray-700 mb-2">
              <strong>Mã đơn hàng:</strong> {order.orderInvoiceNumber}
            </p>
            <p className="text-gray-700 mb-2">
              <strong>Số tiền:</strong> {formatPrice(order.amount)}
            </p>
            <p className="text-gray-700">
              <strong>Thời gian:</strong> {new Date(order.createdAt).toLocaleString('vi-VN')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('pricing');
                } else {
                  window.location.href = '/pricing';
                }
              }}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              Quay lại trang gói
            </button>
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('scan');
                } else {
                  window.location.href = '/scan';
                }
              }}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300"
            >
              Bắt đầu sử dụng ngay
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Thanh toán nâng cấp gói
          </h1>
          <p className="text-gray-600">
            {planNames[planId] || 'Gói của bạn'}
          </p>
        </div>

        {/* Order Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-semibold text-gray-900">{order?.orderInvoiceNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Số tiền:</span>
              <span className="font-bold text-blue-600 text-xl">
                {order ? formatPrice(order.amount) : '...'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-semibold ${
                order?.status === 'paid' ? 'text-green-600' : 
                order?.status === 'failed' ? 'text-red-600' : 
                'text-yellow-600'
              }`}>
                {order?.status === 'paid' ? 'Đã thanh toán' : 
                 order?.status === 'failed' ? 'Thất bại' : 
                 'Đang chờ thanh toán'}
              </span>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Quét mã QR để thanh toán
          </h2>
          
          {qrCodeUrl ? (
            <div className="mb-6">
              <img 
                src={qrCodeUrl} 
                alt="QR Code" 
                className="mx-auto border-4 border-gray-200 rounded-lg shadow-md"
              />
            </div>
          ) : (
            <div className="mb-6 flex justify-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
            </div>
          )}

          <p className="text-gray-600 mb-4">
            Mở ứng dụng ngân hàng/ví điện tử hỗ trợ VietQR để quét mã và xác nhận đúng số tiền, nội dung chuyển khoản.
          </p>

          {manualInfo && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Ngân hàng:</span>
                <span className="font-semibold text-gray-900">{manualInfo.bank}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tài khoản:</span>
                <span className="font-semibold text-gray-900">{manualInfo.account}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Số tiền:</span>
                <span className="font-semibold text-blue-600">{formatPrice(manualInfo.amount)}</span>
              </div>
              <div>
                <span className="text-gray-600 block mb-1">Nội dung chuyển khoản:</span>
                <span className="font-semibold text-gray-900 break-words">{manualInfo.description}</span>
              </div>
            </div>
          )}

          {verifyMessage && (
            <div
              className={`mt-4 px-4 py-3 rounded-lg text-sm ${
                verifySuccess
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
              }`}
            >
              {verifyMessage}
            </div>
          )}

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleManualVerify}
              disabled={verifying}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {verifying && <Loader2 className="w-4 h-4 animate-spin" />}
              Tôi đã chuyển khoản, kiểm tra lại
            </button>
            <button
              onClick={loadOrderData}
              disabled={loading}
              className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              Làm mới thông tin
            </button>
          </div>

          {polling && (
            <div className="mt-4 flex items-center justify-center gap-2 text-blue-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span className="text-sm">Đang kiểm tra trạng thái thanh toán...</span>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={() => {
                if (onNavigate) {
                  onNavigate('pricing');
                } else {
                  window.location.href = '/pricing';
                }
              }}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300"
            >
              <ArrowLeft className="w-5 h-5 inline mr-2" />
              Quay lại
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

