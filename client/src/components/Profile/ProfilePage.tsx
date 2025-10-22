import { useEffect, useState } from 'react';
import { Save, User, AlertCircle, Target, Heart, Mail, Calendar } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface UserProfile {
  skin_type: string | null;
  skin_concerns: string[];
  allergies: string[];
  health_conditions: string[];
  goals: string[];
}

type SkinType = 'oily' | 'dry' | 'combination' | 'sensitive' | 'normal';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [profile, setProfile] = useState<Partial<UserProfile>>({
    skin_type: null,
    skin_concerns: [],
    allergies: [],
    health_conditions: [],
    goals: [],
  });

  const skinTypes: { value: SkinType; label: string; description: string }[] = [
    { value: 'oily', label: 'Da dầu', description: 'Da tiết nhiều dầu, lỗ chân lông to' },
    { value: 'dry', label: 'Da khô', description: 'Da thiếu nước, dễ bong tróc' },
    { value: 'combination', label: 'Da hỗn hợp', description: 'Vùng T dầu, vùng khác khô' },
    { value: 'sensitive', label: 'Da nhạy cảm', description: 'Da dễ kích ứng, đỏ' },
    { value: 'normal', label: 'Da thường', description: 'Da cân bằng, ít vấn đề' },
  ];

  const skinConcerns = [
    'Mụn trứng cá', 'Lỗ chân lông to', 'Da khô', 'Da nhờn', 'Nám tàn nhang',
    'Da không đều màu', 'Da nhạy cảm', 'Nếp nhăn', 'Da xỉn màu', 'Da thô ráp'
  ];

  const commonAllergies = [
    'Fragrance', 'Parabens', 'Sulfates', 'Alcohol', 'Essential Oils',
    'Retinol', 'AHA/BHA', 'Vitamin C', 'Niacinamide', 'Hyaluronic Acid'
  ];

  const healthConditions = [
    'Rosacea', 'Eczema', 'Psoriasis', 'Dermatitis', 'Acne Vulgaris',
    'Melasma', 'Hyperpigmentation', 'Hypopigmentation', 'Seborrheic Dermatitis'
  ];

  const goals = [
    'Giảm mụn', 'Làm sáng da', 'Cải thiện kết cấu da', 'Giảm nếp nhăn',
    'Cân bằng dầu', 'Tăng độ ẩm', 'Giảm kích ứng', 'Bảo vệ khỏi tia UV'
  ];

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;

      try {
        // Load profile from localStorage for now
        const savedProfile = localStorage.getItem('userProfile');
        if (savedProfile) {
          setProfile(JSON.parse(savedProfile));
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        setMessage('Không thể tải hồ sơ. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      // Save to localStorage for now
      localStorage.setItem('userProfile', JSON.stringify(profile));
      setMessage('Hồ sơ đã được lưu thành công!');
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage('Không thể lưu hồ sơ. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  const toggleArrayItem = (array: string[], item: string, setter: (items: string[]) => void) => {
    if (array.includes(item)) {
      setter(array.filter(i => i !== item));
    } else {
      setter([...array, item]);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang tải hồ sơ...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Cần đăng nhập</h2>
          <p className="text-gray-600">Vui lòng đăng nhập để xem hồ sơ của bạn.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Hồ sơ cá nhân</h1>
            <div className="flex items-center gap-4 mt-2 text-gray-600">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Tham gia: {new Date().toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('thành công') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <div className="space-y-8">
          {/* Skin Type */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Target className="w-5 h-5" />
              Loại da
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skinTypes.map((type) => (
                <label
                  key={type.value}
                  className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    profile.skin_type === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="skin_type"
                    value={type.value}
                    checked={profile.skin_type === type.value}
                    onChange={(e) => setProfile({ ...profile, skin_type: e.target.value as SkinType })}
                    className="sr-only"
                  />
                  <div className="font-medium text-gray-900">{type.label}</div>
                  <div className="text-sm text-gray-600 mt-1">{type.description}</div>
                </label>
              ))}
            </div>
          </section>

          {/* Skin Concerns */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Vấn đề da
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {skinConcerns.map((concern) => (
                <label
                  key={concern}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    profile.skin_concerns?.includes(concern)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.skin_concerns?.includes(concern) || false}
                    onChange={() => toggleArrayItem(
                      profile.skin_concerns || [],
                      concern,
                      (items) => setProfile({ ...profile, skin_concerns: items })
                    )}
                    className="sr-only"
                  />
                  {concern}
                </label>
              ))}
            </div>
          </section>

          {/* Allergies */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-5 h-5" />
              Dị ứng thành phần
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {commonAllergies.map((allergy) => (
                <label
                  key={allergy}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    profile.allergies?.includes(allergy)
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.allergies?.includes(allergy) || false}
                    onChange={() => toggleArrayItem(
                      profile.allergies || [],
                      allergy,
                      (items) => setProfile({ ...profile, allergies: items })
                    )}
                    className="sr-only"
                  />
                  {allergy}
                </label>
              ))}
            </div>
          </section>

          {/* Health Conditions */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Tình trạng sức khỏe da</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {healthConditions.map((condition) => (
                <label
                  key={condition}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    profile.health_conditions?.includes(condition)
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.health_conditions?.includes(condition) || false}
                    onChange={() => toggleArrayItem(
                      profile.health_conditions || [],
                      condition,
                      (items) => setProfile({ ...profile, health_conditions: items })
                    )}
                    className="sr-only"
                  />
                  {condition}
                </label>
              ))}
            </div>
          </section>

          {/* Goals */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mục tiêu chăm sóc da</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {goals.map((goal) => (
                <label
                  key={goal}
                  className={`p-3 border rounded-lg cursor-pointer transition-all text-center ${
                    profile.goals?.includes(goal)
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={profile.goals?.includes(goal) || false}
                    onChange={() => toggleArrayItem(
                      profile.goals || [],
                      goal,
                      (items) => setProfile({ ...profile, goals: items })
                    )}
                    className="sr-only"
                  />
                  {goal}
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Đang lưu...' : 'Lưu hồ sơ'}
          </button>
        </div>
      </div>
    </div>
  );
}