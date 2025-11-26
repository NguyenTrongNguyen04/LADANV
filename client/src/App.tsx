import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { AuthModal } from './components/Auth/AuthModal';
import { HomePage } from './components/Home/HomePage';
import { ProductScanner } from './components/Products/ProductScanner';
import { ProfilePage } from './components/Profile/ProfilePage';
import { JournalPage } from './components/Journal/JournalPage';
import { MyProductsPage } from './components/MyProducts/MyProductsPage';
import { AnalysisPage } from './components/Analysis/AnalysisPage';
import { GeminiTestPage } from './components/Test/GeminiTestPage';
import { AdminWrapper } from './components/Admin/AdminWrapper';
import { MarketPage } from './components/Market/MarketPage';
import { PricingPage } from './components/Pricing/PricingPage';
import { PaymentPage } from './components/Payment/PaymentPage';

function AppContent() {
  const [activeView, setActiveView] = useState('home');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, loading } = useAuth();

  useEffect(() => {
    if (user && showAuthModal) {
      setShowAuthModal(false);
    }
  }, [user, showAuthModal]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname.slice(1) || 'home';
      const validViews = ['home', 'scan', 'profile', 'journal', 'my-products', 'analysis', 'gemini-test', 'admin', 'market', 'pricing'];
      
      // Check for payment route
      if (path.startsWith('payment/')) {
        setActiveView(path);
      } else if (validViews.includes(path)) {
        setActiveView(path);
      }
    };

    window.addEventListener('popstate', handlePopState);
    
    // Set initial view from URL
    const path = window.location.pathname.slice(1) || 'home';
    const validViews = ['home', 'scan', 'profile', 'journal', 'my-products', 'analysis', 'gemini-test', 'admin', 'market', 'pricing'];
    
    // Check for payment route
    if (path.startsWith('payment/')) {
      setActiveView(path);
    } else if (validViews.includes(path)) {
      setActiveView(path);
    }

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleViewChange = (view: string) => {
    // Close sidebar on mobile when navigating
    if (sidebarOpen) {
      setSidebarOpen(false);
    }
    
    // Check if user needs to be authenticated for this view
    const protectedViews = ['profile', 'journal', 'my-products', 'analysis', 'admin'];
    if (!user && protectedViews.includes(view)) {
      setShowAuthModal(true);
      return;
    }
    
    setActiveView(view);
    
    // Update browser URL without page reload
    // Nếu view chứa query params, giữ nguyên
    const urlPath = view === 'home' ? '' : view;
    window.history.pushState({}, '', `/${urlPath}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải LADANV...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        onAuthClick={() => setShowAuthModal(true)}
        onMenuClick={() => setSidebarOpen(true)}
        activeView={activeView}
        onViewChange={handleViewChange}
      />

      <div className="flex">
        <Sidebar
          activeView={activeView}
          onViewChange={handleViewChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 lg:ml-0">
          {activeView === 'home' && <HomePage onViewChange={handleViewChange} />}
          {activeView === 'scan' && <ProductScanner />}
          {activeView === 'profile' && <ProfilePage />}
          {activeView === 'journal' && <JournalPage />}
          {activeView === 'my-products' && <MyProductsPage />}
          {activeView === 'analysis' && <AnalysisPage />}
          {activeView === 'gemini-test' && <GeminiTestPage />}
          {activeView === 'admin' && <AdminWrapper />}
          {activeView === 'market' && <MarketPage />}
          {activeView === 'pricing' && <PricingPage onNavigate={handleViewChange} />}
          {activeView.startsWith('payment/') && (() => {
            // Parse từ URL thực tế
            const path = window.location.pathname.slice(1); // Bỏ dấu /
            const match = path.match(/payment\/([^?]+)/);
            const orderInvoiceNumber = match ? match[1] : '';
            const urlParams = new URLSearchParams(window.location.search);
            const planId = urlParams.get('planId') || '';
            
            if (!orderInvoiceNumber) {
              return (
                <div className="min-h-screen flex items-center justify-center">
                  <p className="text-red-600">Không tìm thấy mã đơn hàng</p>
                </div>
              );
            }
            
            return <PaymentPage orderInvoiceNumber={orderInvoiceNumber} planId={planId} onNavigate={handleViewChange} />;
          })()}
        </main>
      </div>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
