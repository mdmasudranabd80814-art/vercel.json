import React from 'react';
import { Home, Layers, ShoppingBag, ShoppingCart, User } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCart: () => void;
  cartCount: number;
  onOpenLogin: () => void;
  onOpenSellerHub?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenCart,
  cartCount,
  onOpenLogin,
}) => {
  const { t } = useLanguage();

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 py-1.5 px-2 sm:hidden shadow-lg">
      <div className="flex items-center justify-around">
        {/* হোম */}
        <button
          onClick={() => {
            setActiveTab('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
            activeTab === 'home' ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Home className={`w-5 h-5 ${activeTab === 'home' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t('হোম', 'Home')}</span>
        </button>

        {/* সেবা */}
        <button
          onClick={() => {
            setActiveTab('services');
            const el = document.getElementById('services-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
            activeTab === 'services' ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <Layers className={`w-5 h-5 ${activeTab === 'services' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t('সেবা', 'Services')}</span>
        </button>

        {/* পণ্য / মার্কেটপ্লেস */}
        <button
          onClick={() => {
            setActiveTab('products');
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center p-1 cursor-pointer transition-colors ${
            activeTab === 'products' ? 'text-emerald-700 font-bold' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${activeTab === 'products' ? 'stroke-[2.5]' : ''}`} />
          <span className="text-[10px] mt-0.5">{t('পণ্য', 'Products')}</span>
        </button>

        {/* ব্যাগ / কার্ট */}
        <button
          onClick={onOpenCart}
          className="flex flex-col items-center justify-center p-1 cursor-pointer text-gray-500 hover:text-gray-800 relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-600 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] mt-0.5">{t('ব্যাগ', 'Bag')}</span>
        </button>

        {/* প্রোফাইল (বিক্রেতা হাব ও অর্ডার দুটোই এর ভেতরে পাবেন) */}
        <button
          onClick={onOpenLogin}
          className="flex flex-col items-center justify-center p-1 cursor-pointer text-emerald-800 font-bold hover:text-emerald-950"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shadow-xs">
            <User className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-[10px] mt-0.5 font-bold">{t('প্রোফাইল', 'Profile')}</span>
        </button>
      </div>
    </div>
  );
};
