import React from 'react';
import { Header } from './Header';
import { CategoryChips } from './CategoryChips';
import { PWAInstallBanner } from './PWAInstallBanner';
import { Search, X, Gift } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';

interface NavbarProps {
  onAdminClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onAdminClick }) => {
  const {
    searchQuery, setSearchQuery,
    selectedLocation, setIsLocationModalOpen,
    totalCartCount, setIsCartOpen, setIsLoginOpen,
    activeNav, setActiveNav,
    setIsHowItWorksOpen, setIsReferralOpen, setIsSellerHubOpen,
    selectedCategoryId, setSelectedCategoryId,
    referralBannerCode,
    setActiveDetailProduct
  } = useMarketplace();

  return (
    <div className="bg-white">
      <PWAInstallBanner />
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedLocation={selectedLocation}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenLogin={() => setIsLoginOpen(true)}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenReferralModal={() => setIsReferralOpen(true)}
        onOpenSellerHub={() => setIsSellerHubOpen(true)}
        onOpenProduct={(prodId) => {
          import('../data/marketplaceData').then(({ POPULAR_PRODUCTS }) => {
            const found = POPULAR_PRODUCTS.find(p => p.id === prodId);
            if (found) {
              setActiveDetailProduct(found);
            } else {
              const el = document.getElementById('products-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }
          });
        }}
      />

      {referralBannerCode && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-emerald-950 px-4 py-2 text-xs sm:text-sm font-bold flex items-center justify-between shadow-xs border-b border-amber-600/30">
          <div className="flex items-center gap-2 max-w-4xl">
            <Gift className="w-5 h-5 shrink-0 text-emerald-900 animate-bounce" />
            <span>
              🎉 আপনি রেফারেল স্পেশাল লিংকের (কোড: <strong className="font-mono underline">{referralBannerCode}</strong>) মাধ্যমে ভিজিট করেছেন! রেজিস্টার করলেই পাবেন <strong>৳১০০ ছাড়ে</strong> ডিসকাউন্ট কুপন!
            </span>
          </div>
          <button
            onClick={() => setIsLoginOpen(true)}
            className="px-3 py-1 bg-emerald-900 hover:bg-emerald-950 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-xs ml-2"
          >
            এখনই সাইন-আপ করুন
          </button>
        </div>
      )}

      <CategoryChips
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={(id) => {
          setSelectedCategoryId(id);
          if (id) {
            const el = document.getElementById('services-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }
        }}
      />

      {(searchQuery || selectedCategoryId) && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="bg-emerald-100/90 border border-emerald-300 text-emerald-900 px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-700" />
              <span>
                ফিল্টারিং ফলাফল:{' '}
                {searchQuery && <strong>"{searchQuery}"</strong>}{' '}
                {selectedCategoryId && (
                  <span className="bg-emerald-700 text-white px-2 py-0.5 rounded-full text-xs font-semibold ml-1">
                    ক্যাটাগরি ফিল্টার সক্রিয়
                  </span>
                )}
              </span>
            </div>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategoryId(null);
              }}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              সব ফিল্টার মুছুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;
