import { useState, useEffect } from 'react';
import { Check, Zap, Crown, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

interface PricingPlan {
  _id: string;
  planId: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  features: {
    aiScansPerMonth: number;
    analysisReportsPerMonth: number;
    journalEntriesPerMonth: number;
    productComparisonsPerMonth: number;
    advancedAnalytics: boolean;
    aiRecommendations: boolean;
    exportData: boolean;
    prioritySupport: boolean;
    customRoutines: boolean;
    ingredientAlerts: boolean;
  };
}

interface UserSubscription {
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

interface PricingPageProps {
  onNavigate?: (view: string) => void;
}

export function PricingPage({ onNavigate }: PricingPageProps = {}) {
  const { user } = useAuth();
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPricingPlans();
    if (user) {
      loadSubscription();
    }
  }, [user]);

  const loadPricingPlans = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription/plans`);
      const data = await response.json();
      if (data.success) {
        setPlans(data.data);
      }
    } catch (error) {
      console.error('Error loading pricing plans:', error);
    }
  };

  const loadSubscription = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/subscription`, {
        credentials: 'include'
      });
      const data = await response.json();
      if (data.success) {
        setSubscription(data.data.subscription);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }
  };

  const handleUpgrade = async (planId: string) => {
    console.log('handleUpgrade called with planId:', planId);
    
    if (!user) {
      alert('Vui lòng đăng nhập để nâng cấp gói');
      return;
    }

    if (planId === 'free') {
      alert('Bạn đang sử dụng gói miễn phí');
      return;
    }

    setLoading(true);
    setError('');
    console.log('Starting checkout process...');

    try {
      // Tạo checkout với server
      const resp = await fetch(`${API_BASE_URL}/payment/sepay/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user._id,
          planId,
          billingCycle,
          // Gợi ý: lấy price từ plan (đã tải sẵn)
          amount: (() => {
            const found = plans.find(p => p.planId === planId);
            return billingCycle === 'yearly' ? (found?.price?.yearly || 0) : (found?.price?.monthly || 0);
          })(),
          currency: 'VND',
          description: `LADANV ${planId.toUpperCase()} (${billingCycle})`
        })
      });

      const data = await resp.json();
      console.log('Checkout response:', data);
      
      if (!data.success) {
        setError(data.message || 'Không thể tạo thanh toán');
        setLoading(false);
        return;
      }

      const { orderInvoiceNumber } = data.data;
      console.log('Order Invoice Number:', orderInvoiceNumber);

      if (!orderInvoiceNumber) {
        setError('Không nhận được mã đơn hàng');
        setLoading(false);
        return;
      }

      const paymentPath = `payment/${orderInvoiceNumber}?planId=${planId}`;
      console.log('Navigating to:', paymentPath);

      if (onNavigate) {
        onNavigate(paymentPath);
        window.history.pushState({}, '', `/${paymentPath}`);
      } else {
        window.location.href = `/${paymentPath}`;
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'Không thể kết nối đến server');
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Miễn phí';
    if (price === -1) return 'Không giới hạn';
    return new Intl.NumberFormat('vi-VN').format(price) + ' ₫';
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <Sparkles className="w-6 h-6" />;
      case 'pro':
        return <Zap className="w-6 h-6" />;
      case 'premier':
        return <Crown className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getPlanClasses = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'border-gray-300 hover:border-gray-400 hover:shadow-xl';
      case 'pro':
        return 'border-blue-500 hover:border-blue-600 hover:shadow-2xl hover:shadow-blue-200/60';
      case 'premier':
        return 'border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50 hover:border-purple-600 hover:shadow-2xl hover:shadow-purple-200/70';
      default:
        return 'border-gray-300';
    }
  };

  const getButtonColor = (planId: string) => {
    switch (planId) {
      case 'free':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'pro':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'premier':
        return 'bg-purple-600 hover:bg-purple-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  const isCurrentPlan = (planId: string) => {
    return subscription?.plan === planId && subscription?.status === 'active';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Chọn gói phù hợp với bạn
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Nâng cấp để trải nghiệm đầy đủ tính năng AI của LADANV
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-8">
            <span className={`text-sm font-medium transition-colors duration-300 ${billingCycle === 'monthly' ? 'text-gray-900 scale-110' : 'text-gray-500'}`}>
              Hàng tháng
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative inline-flex h-7 w-14 items-center rounded-full bg-blue-600 transition-all duration-300 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-lg hover:shadow-xl"
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ${
                  billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium transition-colors duration-300 ${billingCycle === 'yearly' ? 'text-gray-900 scale-110' : 'text-gray-500'}`}>
              Hàng năm
              <span className={`ml-2 text-green-600 font-semibold transition-all duration-300 ${billingCycle === 'yearly' ? 'animate-pulse' : ''}`}>
                (Tiết kiệm 17%)
              </span>
            </span>
          </div>
        </div>

        {error && (
          <div className="max-w-3xl mx-auto mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan._id}
              className={`relative rounded-2xl border-2 p-8 bg-white ${getPlanClasses(plan.planId)} ${
                plan.planId === 'premier' ? 'shadow-2xl' : 'shadow-lg'
              } transition-all duration-300 ease-out transform hover:scale-105 hover:-translate-y-3 cursor-pointer group flex flex-col`}
            >
              {plan.planId === 'premier' && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-1 rounded-full text-sm font-semibold shadow-lg animate-pulse">
                    Phổ biến nhất
                  </span>
                </div>
              )}

              {/* Shine effect on hover */}
              <div className={`absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none ${
                plan.planId === 'free' ? 'bg-gradient-to-r from-transparent via-gray-100 to-transparent' :
                plan.planId === 'pro' ? 'bg-gradient-to-r from-transparent via-blue-50 to-transparent' :
                'bg-gradient-to-r from-transparent via-purple-50 to-transparent'
              }`} style={{
                background: plan.planId === 'premier' 
                  ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.1) 100%)'
                  : undefined
              }} />

              <div className="text-center mb-6 relative z-10">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${
                  plan.planId === 'free' ? 'bg-gray-100 text-gray-600 group-hover:bg-gray-200' :
                  plan.planId === 'pro' ? 'bg-blue-100 text-blue-600 group-hover:bg-blue-200' :
                  'bg-purple-100 text-purple-600 group-hover:bg-purple-200'
                }`}>
                  {getPlanIcon(plan.planId)}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 transition-colors duration-300 group-hover:text-blue-600">
                  {plan.name}
                </h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-4 relative">
                  <span className="text-4xl font-bold text-gray-900 transition-all duration-300 group-hover:scale-110 inline-block">
                    {formatPrice(billingCycle === 'monthly' ? plan.price.monthly : plan.price.yearly)}
                  </span>
                  {plan.price.monthly > 0 && (
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'monthly' ? 'tháng' : 'năm'}
                    </span>
                  )}
                  {plan.planId === 'premier' && (
                    <div className="absolute -top-2 -right-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                  )}
                </div>
              </div>

              <ul className="space-y-4 mb-8 relative z-10 flex-1">
                <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-gray-700">
                    <strong>{plan.features.aiScansPerMonth === -1 ? 'Không giới hạn' : plan.features.aiScansPerMonth}</strong> lần quét AI/tháng
                  </span>
                </li>
                <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-gray-700">
                    <strong>{plan.features.analysisReportsPerMonth === -1 ? 'Không giới hạn' : plan.features.analysisReportsPerMonth}</strong> báo cáo phân tích/tháng
                  </span>
                </li>
                <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                  <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="text-gray-700">
                    <strong>{plan.features.journalEntriesPerMonth === -1 ? 'Không giới hạn' : plan.features.journalEntriesPerMonth}</strong> ghi chú nhật ký/tháng
                  </span>
                </li>
                {plan.features.productComparisonsPerMonth > 0 && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">
                      <strong>{plan.features.productComparisonsPerMonth === -1 ? 'Không giới hạn' : plan.features.productComparisonsPerMonth}</strong> so sánh sản phẩm/tháng
                    </span>
                  </li>
                )}
                {plan.features.advancedAnalytics && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Phân tích nâng cao</span>
                  </li>
                )}
                {plan.features.aiRecommendations && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Gợi ý AI thông minh</span>
                  </li>
                )}
                {plan.features.exportData && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Xuất dữ liệu</span>
                  </li>
                )}
                {plan.features.prioritySupport && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Hỗ trợ ưu tiên</span>
                  </li>
                )}
                {plan.features.customRoutines && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Routine tùy chỉnh</span>
                  </li>
                )}
                {plan.features.ingredientAlerts && (
                  <li className="flex items-start transition-all duration-200 hover:translate-x-1">
                    <Check className="w-5 h-5 text-green-500 mr-3 flex-shrink-0 mt-0.5 transition-transform duration-200 group-hover:scale-110" />
                    <span className="text-gray-700">Cảnh báo thành phần</span>
                  </li>
                )}
              </ul>

              <button
                onClick={() => handleUpgrade(plan.planId)}
                disabled={loading || isCurrentPlan(plan.planId)}
                className={`relative w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 flex items-center justify-center gap-2 overflow-hidden group/btn mt-auto ${
                  isCurrentPlan(plan.planId)
                    ? 'bg-gray-400 cursor-not-allowed'
                    : `${getButtonColor(plan.planId)} hover:shadow-lg hover:shadow-blue-500/50 active:scale-95`
                }`}
              >
                {/* Shine effect on button */}
                {!isCurrentPlan(plan.planId) && (
                  <div className="absolute inset-0 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {isCurrentPlan(plan.planId) ? (
                    <>
                      <Check className="w-5 h-5" />
                      Gói hiện tại
                    </>
                  ) : (
                    <>
                      {plan.planId === 'free' ? 'Sử dụng miễn phí' : 'Nâng cấp ngay'}
                      <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                    </>
                  )}
                </span>
              </button>
            </div>
          ))}
        </div>

        {/* Current Usage (if logged in) */}
        {user && subscription && (
          <div className="max-w-4xl mx-auto mt-12 bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Sử dụng hiện tại</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Quét AI</span>
                  <span className="font-semibold text-gray-900">
                    {subscription.usage.aiScans} / {subscription.usage.aiScansLimit === 999999 ? '∞' : subscription.usage.aiScansLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{
                      width: `${Math.min(100, (subscription.usage.aiScans / (subscription.usage.aiScansLimit === 999999 ? 1 : subscription.usage.aiScansLimit)) * 100)}%`
                    }}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-700 font-medium">Báo cáo phân tích</span>
                  <span className="font-semibold text-gray-900">
                    {subscription.usage.analysisReports} / {subscription.usage.analysisReportsLimit === 999999 ? '∞' : subscription.usage.analysisReportsLimit}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500 ease-out shadow-sm"
                    style={{
                      width: `${Math.min(100, (subscription.usage.analysisReports / (subscription.usage.analysisReportsLimit === 999999 ? 1 : subscription.usage.analysisReportsLimit)) * 100)}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

