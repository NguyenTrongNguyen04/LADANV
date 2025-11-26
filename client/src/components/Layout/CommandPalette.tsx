import { useState, useEffect } from 'react';
import { Search, X, Scan, Home, Heart, BookOpen, BarChart3, User, ShoppingCart, Crown } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string) => void;
}

export function CommandPalette({ isOpen, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commands = [
    { id: 'home', label: 'Trang chủ', icon: Home, description: 'Về trang chủ' },
    { id: 'scan', label: 'Quét sản phẩm', icon: Scan, description: 'Quét mã vạch sản phẩm' },
    { id: 'market', label: 'Thị trường', icon: ShoppingCart, description: 'Khám phá sản phẩm mỹ phẩm' },
    { id: 'my-products', label: 'Sản phẩm của tôi', icon: Heart, description: 'Xem sản phẩm đã lưu' },
    { id: 'journal', label: 'Nhật ký da', icon: BookOpen, description: 'Ghi nhật ký chăm sóc da' },
    { id: 'analysis', label: 'Phân tích', icon: BarChart3, description: 'Xem phân tích da' },
    { id: 'pricing', label: 'Nâng cấp', icon: Crown, description: 'Xem các gói pricing và nâng cấp' },
    { id: 'profile', label: 'Hồ sơ', icon: User, description: 'Quản lý hồ sơ cá nhân' },
  ];

  const filteredCommands = commands.filter(command =>
    command.label.toLowerCase().includes(query.toLowerCase()) ||
    command.description.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          onNavigate(filteredCommands[selectedIndex].id);
          onClose();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filteredCommands, onNavigate, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-[10vh] px-4">
        <div className="w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-gray-200">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm trang hoặc chức năng..."
              className="flex-1 text-lg outline-none placeholder-gray-400"
              autoFocus
            />
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-96 overflow-y-auto">
            {filteredCommands.length > 0 ? (
              <div className="p-2">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  return (
                    <button
                      key={command.id}
                      onClick={() => {
                        onNavigate(command.id);
                        onClose();
                      }}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                        index === selectedIndex
                          ? 'bg-blue-50 text-blue-700'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium">{command.label}</div>
                        <div className="text-sm text-gray-500 truncate">
                          {command.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <Search className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p>Không tìm thấy kết quả nào</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center gap-4">
                <span>↑↓ để chọn</span>
                <span>↵ để mở</span>
                <span>Esc để đóng</span>
              </div>
              <span>Ctrl/Cmd + K</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
