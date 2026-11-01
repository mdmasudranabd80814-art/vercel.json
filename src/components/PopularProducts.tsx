import React from 'react';
import { Star, ShoppingCart, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { POPULAR_PRODUCTS, ProductItem } from '../data/marketplaceData';
import { useLanguage } from '../context/LanguageContext';

interface PopularProductsProps {
  onAddToCart: (product: ProductItem) => void;
  onOpenProductDetail: (product: ProductItem) => void;
  addedProductIds: string[];
  searchQuery: string;
}

export const PopularProducts: React.FC<PopularProductsProps> = ({
  onAddToCart,
  onOpenProductDetail,
  addedProductIds,
  searchQuery,
}) => {
  const { language, t } = useLanguage();

  // Filter products by search query
  const filteredProducts = POPULAR_PRODUCTS.filter((product) => {
    if (!searchQuery) return true;
    return (
      product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.englishTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="products-section">
      {/* Section Header matching Desktop & Mobile screenshot */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-600 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {t('জনপ্রিয় পণ্য মার্কেটপ্লেস', 'Popular Hardware Marketplace')}
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-4">
            {t('১০০% আসল প্রোডাক্ট, অফিসিয়াল ওয়ারেন্টি ও ক্যাশ অন ডেলিভারি', '100% Original Products, Official Warranty & Cash on Delivery')}
          </p>
        </div>

        <button 
          onClick={() => {
            const el = document.getElementById('products-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1.5 group cursor-pointer"
        >
          <span>{t('সব পণ্য দেখুন', 'View All Products')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">{t('কোনো পণ্য পাওয়া যায়নি।', 'No products found.')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 sm:gap-5">
          {filteredProducts.map((product) => {
            const isAdded = addedProductIds.includes(product.id);
            const productTitleToDisplay = language === 'en' && product.englishTitle ? product.englishTitle : product.title;

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Product Image & Badges */}
                <div 
                  onClick={() => onOpenProductDetail(product)}
                  className="relative aspect-square w-full overflow-hidden bg-gray-50 p-4 cursor-pointer"
                >
                  <img
                    src={product.image}
                    alt={productTitleToDisplay}
                    className="w-full h-full object-contain group-hover:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />

                  {/* Discount tag */}
                  {product.discountBadge && (
                    <span className="absolute top-2.5 left-2.5 bg-emerald-600 text-white text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                      {product.discountBadge}
                    </span>
                  )}

                  {/* Stock tag */}
                  {product.inStock && (
                    <span className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-emerald-800 text-[10px] font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      {t('ইন স্টক', 'In Stock')}
                    </span>
                  )}
                </div>

                {/* Product Content */}
                <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Category */}
                    <span className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider block">
                      {product.category}
                    </span>

                    {/* Title */}
                    <h3
                      onClick={() => onOpenProductDetail(product)}
                      className="font-bold text-xs sm:text-sm text-gray-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mt-1 cursor-pointer"
                    >
                      {productTitleToDisplay}
                    </h3>

                    {/* Rating & reviews */}
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs">
                      <div className="flex items-center text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-500 mr-0.5" />
                        <span>★ {product.rating}</span>
                      </div>
                      <span className="text-[11px] text-gray-400">
                        ({product.reviewCount})
                      </span>
                    </div>

                    {/* Short Warranty text */}
                    <div className="flex items-center gap-1 mt-2 text-[10px] text-gray-500">
                      <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span className="truncate">{product.warranty}</span>
                    </div>
                  </div>

                  {/* Price & Add to Cart button */}
                  <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-emerald-700 font-black text-sm sm:text-base leading-none">
                        ৳ {product.price.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}
                      </div>
                      {product.originalPrice > product.price && (
                        <div className="text-[11px] text-gray-400 line-through mt-0.5">
                          ৳ {product.originalPrice.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}
                        </div>
                      )}
                    </div>

                    {/* Add to Cart button matching the cart icon in mobile screenshot */}
                    <button
                      onClick={() => onAddToCart(product)}
                      className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                        isAdded
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                      }`}
                      title={isAdded ? t('ব্যাগে যোগ হয়েছে', 'Added to Bag') : t('ব্যাগে যোগ করুন', 'Add to Bag')}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('যোগ হয়েছে', 'Added')}</span>
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          <span className="hidden sm:inline">{t('কিনুন', 'Buy')}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

