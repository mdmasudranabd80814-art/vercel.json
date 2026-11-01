import React, { useState } from 'react';
import { X, Star, ShoppingCart, ShieldCheck, Check, Truck, RotateCcw } from 'lucide-react';
import { ProductItem } from '../data/marketplaceData';
import { Reviews } from './Reviews';
import { useLanguage } from '../context/LanguageContext';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onAddToCart: (product: ProductItem, quantity?: number) => void;
  isAdded: boolean;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isAdded,
}) => {
  const { t, language } = useLanguage();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;
  const displayTitle = language === 'en' && product.englishTitle ? product.englishTitle : product.title;
  const displaySubTitle = language === 'en' ? product.title : product.englishTitle;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-emerald-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/70">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
            {product.category}
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          {/* Product image */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-center relative aspect-square border border-gray-100">
            <img
              src={product.image}
              alt={displayTitle}
              className="max-h-64 object-contain"
            />
            {product.discountBadge && (
              <span className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-bold px-2 py-0.5 rounded-md shadow-xs">
                {product.discountBadge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                {displayTitle}
              </h2>
              {displaySubTitle && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {displaySubTitle}
                </p>
              )}
              
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center text-amber-500 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded-md">
                  <Star className="w-3.5 h-3.5 fill-amber-500 mr-1" />
                  ★ {product.rating}
                </div>
                <span className="text-xs text-gray-500">
                  {t(`(${product.reviewCount} কাস্টমার রিভিউ)`, `(${product.reviewCount} customer reviews)`)}
                </span>
              </div>
            </div>

            {/* Price Box */}
            <div className="bg-emerald-50/80 p-3 rounded-xl border border-emerald-100 flex items-baseline gap-3">
              <span className="text-2xl font-black text-emerald-800">
                ৳ {language === 'en' ? product.price.toLocaleString('en-US') : product.price.toLocaleString('bn-BD')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-gray-400 line-through">
                  ৳ {language === 'en' ? product.originalPrice.toLocaleString('en-US') : product.originalPrice.toLocaleString('bn-BD')}
                </span>
              )}
              <span className="text-xs font-semibold text-emerald-700 ml-auto">
                {t('ক্যাশ অন ডেলিভারি প্রযোজ্য', 'Cash on Delivery Available')}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
              {product.description}
            </p>

            {/* Specifications */}
            <div className="border-t border-gray-100 pt-3">
              <h4 className="text-xs font-bold text-gray-800 mb-2 uppercase tracking-wide">
                {t('স্পেসিফিকেশন ও ফিচার:', 'Specifications & Features:')}
              </h4>
              <ul className="space-y-1.5 text-xs text-gray-600">
                {product.specs.map((spec, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-2 py-2 border-y border-gray-100 text-[10px] text-gray-600">
              <div className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('দ্রুত ডেলিভারি', 'Fast Delivery')}</span>
              </div>
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{product.warranty}</span>
              </div>
              <div className="flex items-center gap-1">
                <RotateCcw className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{t('৭ দিন রিটার্ন', '7 Days Return')}</span>
              </div>
            </div>

            {/* Rating & Feedback Section */}
            <div className="pt-2">
              <Reviews itemId={product.id} itemType="product" />
            </div>

            {/* Quantity and Actions */}
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                >
                  -
                </button>
                <span className="px-3 py-2 text-xs font-bold text-gray-800">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-3 py-2 text-gray-600 hover:bg-gray-100 font-bold text-xs"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => {
                  onAddToCart(product, quantity);
                  onClose();
                }}
                className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isAdded 
                    ? t('ব্যাগে যোগ করা হয়েছে', 'Added to Bag') 
                    : `${t('ব্যাগে যোগ করুন', 'Add to Bag')} (৳ ${(product.price * quantity).toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

