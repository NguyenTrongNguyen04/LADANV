import { useState, useEffect } from 'react';
import { Search, User, Bell, Menu, Home, Scan, Heart, BookOpen, BarChart3, Settings, LogOut, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
 tự import logoImg from '/assets/logoOfficial.png';
import { CommandPalette } from './CommandPalette';

interface HeaderProps {
  onAuthClick: () => void;
  onMenuClick: () => void;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Header({ onAuthClick, onMenuClick, activeView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notificationCount] = useState(3); // Mock notification count

  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'scan', label: 'Quét sản phẩm', icon: Scan },
    { id: 'market', label: 'Thị trường', icon: ShoppingCart },
    { id: 'my-products', label: 'Sản phẩm của tôi', icon: Heart },
    { id: 'journal', label: 'Nhật ký da', icon: BookOpen },
    { id: 'analysis', label: 'Phân tích', icon: BarChart3 },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 24);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Keyboard shortcut for command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showUserMenu && !(e.target as Element).closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  return (
    <>
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/60 border-b border-gray-200' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top row - Logo, Search, User actions */}
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors hover-ring"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="LADANV" className="w-10 h-10" />
              </div>
            </div>

            {/* Search bar - compact on desktop */}
            <div className="flex-1 max-w-md mx-6 hidden lg:block">
              <button
                onClick={() => setShowCommandPalette(true)}
                className="w-full flex items-center gap-3 px-4 py-2 bg-white/60 hover:bg-white border border-gray-200 rounded-xl transition-all group shadow-sm hover-ring"
              >
                <Search className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
                <span className="text-sm text-gray-500 group-hover:text-gray-700">
                  Tìm kiếm... (Ctrl+K)
                </span>
                <div className="ml-auto px-2 py-1 bg-gray-100 border border-gray-200 text-xs text-gray-600 rounded-md">
                  ⌘K
                </div>
              </button>
            </div>

            {/* User actions */}
            <div className="flex items-center gap-2">
              {/* CTA Button */}
              <button
                onClick={() => onViewChange('scan')}
                className="hidden sm:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all shadow-sm hover-ring"
              >
                <Scan className="w-4 h-4" />
                <span>Quét ngay</span>
              </button>

              {user && (
                <button className="p-2 rounded-xl hover:bg-gray-100 transition-colors relative hover-ring">
                  <Bell className="w-5 h-5 text-gray-700" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  )}
                </button>
              )}

              {user ? (
                <div className="relative user-menu-container">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 transition-colors hover-ring"
                  >
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="hidden sm:block text-sm font-medium text-gray-700">
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </button>
                  
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-fade-in">
                      <button
                        onClick={() => {
                          onViewChange('profile');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ
                      </button>
                      <button
                        onClick={() => {
                          onViewChange('admin');
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        Admin Dashboard
                      </button>
                      <hr className="my-2" />
                      <button
                        onClick={() => {
                          signOut();
                          setShowUserMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-colors shadow-sm hover-ring"
                >
                  Đăng nhập
                </button>
              )}
            </div>
          </div>

          {/* Navigation row - Desktop only */}
          <nav className="hidden lg:flex items-center gap-1 py-3 border-t border-gray-100">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all group hover-ring ${
                    isActive 
                      ? 'text-blue-700 bg-blue-50' 
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                  {isActive && (
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-blue-600 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile search */}
          <div className="lg:hidden pb-3">
            <button
              onClick={() => setShowCommandPalette(true)}
              className="w-full flex items-center gap-3 px-4 py-3 bg-white border border-gray-200 rounded-xl transition-all hover-ring"
            >
              <Search className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500">Tìm kiếm...</span>
            </button>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onNavigate={onViewChange}
      />
    </>
  );
}
