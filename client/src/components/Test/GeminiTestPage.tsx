import { useState, useRef, useEffect } from 'react';
import { Upload, Camera, Copy, AlertCircle, CheckCircle, XCircle, Loader2, Image as ImageIcon } from 'lucide-react';
import { geminiService, GeminiResponse, Ingredient } from '../../services/geminiService';

export function GeminiTestPage() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<GeminiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rawPreview, setRawPreview] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // trigger enter animations after mount
    const id = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(id);
  }, []);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      setError(null);
      setResult(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setAnalyzing(true);
    setError(null);
    setResult(null);

    try {
      const response = await geminiService.analyzeImage(imageFile);
      setResult(response);
      setRawPreview(null);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra khi phân tích ảnh');
      // Try to extract raw preview from error message
      const previewMatch = /Raw preview: ([\s\S]*)$/m.exec(err.message || '');
      if (previewMatch && previewMatch[1]) {
        setRawPreview(previewMatch[1]);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const getSafetyColor = (nhan: string) => {
    switch (nhan) {
      case 'An toàn':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'Trung lập':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Nguy cơ':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'Không phù hợp':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSafetyIcon = (nhan: string) => {
    switch (nhan) {
      case 'An toàn':
        return <CheckCircle className="w-4 h-4" />;
      case 'Trung lập':
        return <AlertCircle className="w-4 h-4" />;
      case 'Nguy cơ':
        return <XCircle className="w-4 h-4" />;
      case 'Không phù hợp':
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 to-white py-10 overflow-hidden">
      {/* soft background blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-blue-100 blur-3xl opacity-50" />
        <div className="absolute top-1/3 -right-24 h-72 w-72 rounded-full bg-emerald-100 blur-3xl opacity-50" />
      </div>
      <div className="max-w-7xl mx-auto px-4">
        {/* Page heading */}
        <div className="mb-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center border border-blue-100">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Phân tích thành phần bằng Gemini</h1>
              <p className="text-slate-600">Tải lên ảnh nhãn sản phẩm để AI trích xuất thành phần và đánh giá độ an toàn</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Upload Section - Compact */}
          <div
            className={`transition-all duration-700 ${
              mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
            }`}
          >
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-xl font-semibold text-slate-900">Upload ảnh</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 border border-blue-200">Beta</span>
            </div>
            
            {/* Compact Upload Area */}
            <div className="space-y-4">
              {/* Image Preview */}
              {imagePreview ? (
                <div className="relative group">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-48 object-contain rounded-xl border border-slate-200 bg-white shadow-sm"
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setResult(null);
                        setError(null);
                      }}
                      className="p-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
                    >
                      <XCircle className="w-4 h-4 text-slate-600" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2 truncate">
                    {imageFile?.name} • {(imageFile?.size || 0 / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
              ) : (
                <div 
                  className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-3" />
                  <p className="text-sm text-slate-600 mb-2">Kéo thả ảnh vào đây hoặc</p>
                  <p className="text-xs text-slate-500">Chọn từ máy tính / Camera</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  <Upload className="w-4 h-4" />
                  Upload ảnh
                </button>

                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-colors text-sm"
                >
                  <Camera className="w-4 h-4" />
                  Scan sản phẩm
                </button>
              </div>

              {/* Analyze Button */}
              {imageFile && (
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Đang phân tích...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4" />
                      Phân tích thành phần
                    </>
                  )}
                </button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>

          {/* Results Section - no outer box, airy layout */}
          <div className="relative">
            <div className="flex items-end justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Kết quả phân tích</h2>
                {result && (
                  <p className="text-sm text-slate-500 mt-1">Tìm thấy {result.thanh_phan.length} thành phần</p>
                )}
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-700">
                  <XCircle className="w-5 h-5" />
                  <span className="font-medium">Lỗi:</span>
                </div>
                <p className="text-red-600 mt-1">{error}</p>
                {rawPreview && (
                  <pre className="mt-3 max-h-64 overflow-auto bg-white border border-red-200 rounded-lg p-3 text-xs text-red-700 whitespace-pre-wrap break-all">
                    {rawPreview}
                  </pre>
                )}
              </div>
            )}

            {/* Results Display */}
            {result ? (
              <div className="space-y-4">
                {result.loi ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-5 h-5" />
                      <span className="font-medium">Cảnh báo:</span>
                    </div>
                    <p className="text-yellow-600 mt-1">{result.loi}</p>
                  </div>
                ) : (
                  <>
                    {/* Legend */}
                    <div className="flex flex-wrap items-center gap-2 mb-4 text-xs">
                      <span className="px-2 py-1 rounded-full border border-green-200 bg-green-50 text-green-700">An toàn</span>
                      <span className="px-2 py-1 rounded-full border border-yellow-200 bg-yellow-50 text-yellow-700">Trung lập</span>
                      <span className="px-2 py-1 rounded-full border border-orange-200 bg-orange-50 text-orange-700">Nguy cơ</span>
                      <span className="px-2 py-1 rounded-full border border-red-200 bg-red-50 text-red-700">Không phù hợp</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[560px] overflow-y-auto pr-1">
                      {result.thanh_phan.map((ingredient, index) => (
                        <div
                          key={index}
                          style={{ transitionDelay: `${index * 60}ms` }}
                          className={`group p-4 rounded-2xl border ${getSafetyColor(ingredient.nhan)} shadow-sm hover:shadow-md transition-all duration-500 ${
                            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {getSafetyIcon(ingredient.nhan)}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <h4 className="font-medium text-slate-900 group-hover:tracking-tight transition-all">{ingredient.ten}</h4>
                                <span className={`px-2 py-0.5 text-xs font-medium rounded-full border ${getSafetyColor(ingredient.nhan)}`}>
                                  {ingredient.nhan}
                                </span>
                              </div>
                              <p className="text-sm text-slate-700 leading-relaxed">{ingredient.ghi_chu}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-500">Chưa có kết quả phân tích</p>
                <p className="text-sm text-slate-400 mt-1">
                  Upload ảnh và nhấn "Phân tích thành phần" để bắt đầu
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 rounded-2xl border border-slate-200 bg-slate-50 p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-3">Mẹo để AI đọc chính xác</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-700">
            <div>
              <h4 className="font-medium mb-2">📸 Chụp ảnh tốt:</h4>
              <ul className="space-y-1">
                <li>• Ảnh rõ nét, đủ ánh sáng</li>
                <li>• Chụp trực diện nhãn sản phẩm</li>
                <li>• Tránh bóng đổ che khuất chữ</li>
                <li>• Tập trung vào phần danh sách thành phần</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔍 Kết quả phân tích:</h4>
              <ul className="space-y-1">
                <li>• <span className="text-green-700">An toàn</span>: Thành phần an toàn cho da</li>
                <li>• <span className="text-yellow-700">Trung lập</span>: Cần thận trọng</li>
                <li>• <span className="text-orange-700">Nguy cơ</span>: Có thể gây kích ứng</li>
                <li>• <span className="text-red-700">Không phù hợp</span>: Nên tránh</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
