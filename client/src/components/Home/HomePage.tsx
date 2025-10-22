import { useState } from 'react';
import { Scan, Shield, BadgeCheck, Sparkles, Star, Truck, Leaf } from 'lucide-react';

interface HomePageProps {
  onViewChange: (view: string) => void;
}

type Product = {
  id: string;
  name: string;
  brand: string;
  image: string;
  safeScore: number; // 0-100
  topIngredients: string[];
  skinTypes: string[];
  verifiedSource: 'Sephora' | 'Amazon' | 'Watsons' | 'Official';
};

const FEATURED_BRANDS = ['La Roche-Posay','CeraVe','The Ordinary','Paula’s Choice','Bioderma','Vichy'];

const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Effaclar Duo(+)',
    brand: 'La Roche-Posay',
    image: 'https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=1200&auto=format&fit=crop',
    safeScore: 92,
    topIngredients: ['Niacinamide','Piroctone Olamine','Zinc PCA'],
    skinTypes: ['oily','combination'],
    verifiedSource: 'Official',
  },
  {
    id: 'p2',
    name: 'Moisturizing Cream',
    brand: 'CeraVe',
    image: 'https://images.unsplash.com/photo-1614359837831-5e86c6b2b3da?q=80&w=1200&auto=format&fit=crop',
    safeScore: 95,
    topIngredients: ['Ceramides','Hyaluronic Acid'],
    skinTypes: ['dry','normal','sensitive'],
    verifiedSource: 'Sephora',
  },
  {
    id: 'p3',
    name: 'Niacinamide 10% + Zinc 1%',
    brand: 'The Ordinary',
    image: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?q=80&w=1200&auto=format&fit=crop',
    safeScore: 90,
    topIngredients: ['Niacinamide','Zinc'],
    skinTypes: ['oily','combination'],
    verifiedSource: 'Amazon',
  },
  {
    id: 'p4',
    name: 'BHA Liquid Exfoliant 2%',
    brand: 'Paula’s Choice',
    image: 'https://images.unsplash.com/photo-1585386959984-a4155223168f?q=80&w=1200&auto=format&fit=crop',
    safeScore: 86,
    topIngredients: ['Salicylic Acid','Green Tea'],
    skinTypes: ['combination','oily'],
    verifiedSource: 'Watsons',
  },
];

export function HomePage({ onViewChange }: HomePageProps) {
  const [query, setQuery] = useState('');
  const [skinFilter, setSkinFilter] = useState<string>('all');

  const filtered = MOCK_PRODUCTS.filter((p) => {
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
    const matchesSkin = skinFilter === 'all' || p.skinTypes.includes(skinFilter);
    return matchesQuery && matchesSkin;
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* HERO */}
        <section className="pt-12 pb-10">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-200">
                <BadgeCheck className="w-4 h-4" /> Sàn chọn lọc – lấy dữ liệu từ nguồn uy tín
              </div>
              <h1 className="mt-4 text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900">
                Khám phá – So sánh – Yên tâm chọn mỹ phẩm phù hợp
              </h1>
              <p className="mt-3 text-slate-600">
                Khác với sàn thương mại thông thường, LADANV chỉ hiển thị sản phẩm từ các
                nhà bán chính hãng/đối tác uy tín và kèm theo <b>điểm an toàn thành phần</b>
                dựa trên phân tích AI.
              </p>
              <div className="mt-5 flex gap-3">
                <button onClick={() => onViewChange('scan')} className="bg-slate-900 hover:bg-black text-white px-5 py-3 rounded-xl font-medium inline-flex items-center gap-2">
                  <Scan className="w-4 h-4"/> Quét sản phẩm
                </button>
                <button onClick={() => onViewChange('analysis')} className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-900 px-5 py-3 rounded-xl font-medium inline-flex items-center gap-2">
                  <Shield className="w-4 h-4"/> Xem phân tích mẫu
                </button>
              </div>
              {/* Trust bullets */}
              <div className="mt-6 flex flex-wrap gap-4 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2"><Star className="w-4 h-4 text-amber-500"/> Nguồn chính hãng</div>
                <div className="inline-flex items-center gap-2"><Leaf className="w-4 h-4 text-emerald-600"/> Điểm an toàn thành phần</div>
                <div className="inline-flex items-center gap-2"><Truck className="w-4 h-4 text-slate-500"/> Link mua tại đối tác uy tín</div>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[16/10] rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                <img alt="hero" src="/assets/hero.png" className="w-full h-full object-cover"/>
              </div>
            </div>
          </div>
        </section>

        {/* BRANDS STRIP */}
        <section className="py-6 border-y border-slate-100">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {FEATURED_BRANDS.map((b) => (
              <span key={b} className="px-3 py-1.5 text-sm text-slate-600 bg-slate-100 rounded-full border border-slate-200">{b}</span>
            ))}
          </div>
        </section>

        {/* SEARCH + FILTER */}
        <section className="py-8">
          <div className="flex flex-col md:flex-row gap-3 items-stretch">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              placeholder="Tìm kiếm sản phẩm/nhãn hàng…"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
            <div className="flex items-center gap-2">
              {['all','oily','dry','combination','sensitive','normal'].map((k)=> (
                <button key={k} onClick={()=>setSkinFilter(k)}
                  className={`px-3 py-2 rounded-lg text-sm border transition-colors ${skinFilter===k? 'bg-slate-900 text-white border-slate-900':'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}>{k==='all'?'Tất cả':k}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PRODUCT GRID */}
        <section className="pb-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p, i)=> (
              <article key={p.id} className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm hover:shadow-md transition-all">
                <div className="relative">
                  <img src={p.image} alt={p.name} className="w-full h-56 object-cover"/>
                  <div className="absolute top-3 left-3 px-2 py-1 text-xs rounded-full bg-white/90 border border-slate-200 text-slate-700">{p.verifiedSource}</div>
                  <div className="absolute top-3 right-3 px-2 py-1 text-xs rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 inline-flex items-center gap-1"><BadgeCheck className="w-3.5 h-3.5"/> Verified</div>
                </div>
                <div className="p-4">
                  <div className="text-xs text-slate-500 mb-1">{p.brand}</div>
                  <h3 className="font-semibold text-slate-900 mb-2 line-clamp-2">{p.name}</h3>
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm text-slate-600">Điểm an toàn</div>
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700 text-sm">
                      {p.safeScore}/100
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {p.topIngredients.map((ing)=> (
                      <span key={ing} className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">{ing}</span>
                    ))}
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button onClick={()=>onViewChange('scan')} className="flex-1 px-3 py-2 rounded-lg bg-slate-900 text-white text-sm hover:bg-black">Quét & so sánh</button>
                    <a href="#" className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-sm text-slate-700 hover:bg-slate-50">Mua tại đối tác</a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* DIFFERENTIATOR BANNER */}
        <section className="mb-16">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 text-center shadow-sm">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-xs font-medium border border-blue-200"><Sparkles className="w-4 h-4"/> Khác biệt của LADANV</div>
            <h3 className="mt-3 text-xl md:text-2xl font-bold text-slate-900">Không chỉ “bán” – Chúng tôi giúp bạn mua đúng</h3>
            <p className="mt-2 text-slate-600 max-w-3xl mx-auto">Mỗi sản phẩm đều có điểm an toàn thành phần và nguồn lấy từ nhà bán uy tín. Bạn có thể quét nhanh để xác thực công thức thực tế bằng AI trước khi quyết định.</p>
          </div>
        </section>
      </div>
    </div>
  );
}
