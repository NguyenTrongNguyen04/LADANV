import { Home, Scan, Heart, BookOpen, User, BarChart3, X, ShoppingCart, Crown } from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeView, onViewChange, isOpen, onClose }: SidebarProps) {
  const menuItems = [
    { id: 'home', label: 'Trang chủ', icon: Home },
    { id: 'scan', label: 'Quét sản phẩm', icon: Scan },
    { id: 'market', label: 'Thị trường', icon: ShoppingCart },
    { id: 'my-products', label: 'Sản phẩm của tôi', icon: Heart },
    { id: 'journal', label: 'Nhật ký da', icon: BookOpen },
    { id: 'analysis', label: 'Phân tích', icon: BarChart3 },
    { id: 'pricing', label: 'Nâng cấp', icon: Crown },
    { id: 'profile', label: 'Hồ sơ', icon: User },
  ];

  const handleItemClick = (id: string) => {
    onViewChange(id);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 lg:hidden`}
      >
        <div className="flex items-center justify-between p-4 lg:hidden border-b border-gray-200">
          <span className="font-semibold text-gray-900">Menu</span>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-xl hover-ring">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover-ring ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-1">Mẹo chăm sóc da</h3>
            <p className="text-sm text-gray-600">
              Uống đủ nước và ngủ đủ giấc là chìa khóa cho làn da khỏe đẹp
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
