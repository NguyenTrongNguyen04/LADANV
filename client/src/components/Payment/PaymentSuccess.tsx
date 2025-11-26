import { useEffect, useState } from 'react';
import { CheckCircle, Crown, Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface Subscription {
  plan: string;
  status: string;
  usage: {
    aiScans: number;
    aiScansLimit: number;
    analysisReports: number;
    analysisReportsLimit: number;
    journalEntries: number;
    journalEntriesLimit: number;
    productComparisons: number;
    productComparisonsLimit: number;
  };
}

interface PaymentSuccessProps {
  onNavigate?: (view: string) => void;
}

export function PaymentSuccess({ onNavigate }: PaymentSuccessProps) {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [planName, setPlanName] = useState('');

  useEffect(() => {
    // Lấy planId từ URL params (nếu có)
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('planId') || '';

    // Map planId to plan name
    const planNames: Record<string, string> = {
      free: 'Gói Miễn Phí',
      pro: 'Gói Pro',
      premier: 'Gói Premier'
    };
    setPlanName(planNames[planId] || 'gói của bạn');

    // Load subscription để verify
    if (user) {
      loadSubscription();
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success && data.data.subscription) {
        setSubscription(data.data.subscription);
        
        // Update plan name from actual subscription
        const planNames: Record<string, string> = {
          free: 'Gói Miễn Phí',
          pro: 'Gói Pro',
          premier: 'Gói Premier'
        };
        setPlanName(planNames[data.data.subscription.plan] || 'gói của bạn');
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free':
        return <Sparkles className="w-12 h-12 text-gray-600" />;
      case 'pro':
        return <Zap className="w-12 h-12 text-blue-600" />;
      case 'premier':
        return <Crown className="w-12 h-12 text-purple-600" />;
      default:
        return <CheckCircle className="w-12 h-12 text-green-600" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free':
        return 'text-gray-600';
      case 'pro':
        return 'text-blue-600';
      case 'premier':
        return 'text-purple-600';
      default:
        return 'text-green-600';
    }
  };

  const currentPlan = subscription?.plan || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-fade-in-up">
        {/* Success Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-green-200 rounded-full animate-ping opacity-75"></div>
            <div className="relative bg-green-100 rounded-full p-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
          </div>
        </div>

        {/* Success Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Thanh toán thành công! 🎉
        </h1>
        
        <div className="mb-8">
          <p className="text-xl text-gray-700 mb-2">
            Chúc mừng bạn đã nâng cấp thành công
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            {getPlanIcon(currentPlan)}
            <span className={`text-2xl font-bold ${getPlanColor(currentPlan)}`}>
              {planName}
            </span>
          </div>
        </div>

        {/* Subscription Details */}
        {subscription && subscription.status === 'active' && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-8 border border-blue-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quyền lợi của bạn:
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>
                    {subscription.usage.aiScansLimit === 999999 
                      ? 'Không giới hạn' 
                      : subscription.usage.aiScansLimit}
                  </strong> lần quét AI/tháng
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700">
                  <strong>
                    {subscription.usage.analysisReportsLimit === 999999 
                      ? 'Không giới hạn' 
                      : subscription.usage.analysisReportsLimit}
                  </strong> báo cáo phân tích/tháng
                </span>
              </div>
              {subscription.usage.productComparisonsLimit > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">
                    <strong>
                      {subscription.usage.productComparisonsLimit === 999999 
                        ? 'Không giới hạn' 
                        : subscription.usage.productComparisonsLimit}
                    </strong> so sánh sản phẩm/tháng
                  </span>
                </div>
              )}
              {(currentPlan === 'pro' || currentPlan === 'premier') && (
                <>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Phân tích nâng cao</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <span className="text-gray-700">Gợi ý AI thông minh</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-8">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Đang xác minh gói của bạn...</p>
          </div>
        )}

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
            <ArrowRight className="w-5 h-5" />
            Xem chi tiết gói
          </button>
          <button
            onClick={() => {
              if (onNavigate) {
                onNavigate('scan');
              } else {
                window.location.href = '/scan';
              }
            }}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            Bắt đầu quét AI ngay
          </button>
        </div>

        {/* Note */}
        <p className="mt-8 text-sm text-gray-500">
          Gói của bạn đã được kích hoạt và sẵn sàng sử dụng!
        </p>
      </div>
    </div>
  );
}

