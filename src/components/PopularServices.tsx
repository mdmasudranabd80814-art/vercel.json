import React from 'react';
import { Star, ArrowRight, Clock, ShieldCheck } from 'lucide-react';
import { POPULAR_SERVICES, ServiceItem } from '../data/marketplaceData';
import { useLanguage } from '../context/LanguageContext';

interface PopularServicesProps {
  onBookService: (service: ServiceItem) => void;
  selectedCategory: string | null;
  searchQuery: string;
}

export const PopularServices: React.FC<PopularServicesProps> = ({
  onBookService,
  selectedCategory,
  searchQuery,
}) => {
  const { language, t } = useLanguage();

  // Filter services if category is selected or search query entered
  const filteredServices = POPULAR_SERVICES.filter((service) => {
    const matchesCategory = selectedCategory
      ? service.categoryId === selectedCategory
      : true;
    const matchesSearch = searchQuery
      ? service.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="services-section">
      {/* Header matching Screenshot */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-6 bg-emerald-600 rounded-full" />
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              {t('জনপ্রিয় সেবা সমূহ', 'Popular Services')}
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5 ml-4">
            {t('দক্ষ ও ব্যাকগ্রাউন্ড ভেরিফাইড টেকনিশিয়ান দ্বারা সম্পন্ন', 'Provided by skilled & background-verified technicians')}
          </p>
        </div>

        <button 
          onClick={() => {
            const el = document.getElementById('services-section');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1.5 group cursor-pointer"
        >
          <span>{t('সব দেখুন', 'View All')}</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {filteredServices.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-dashed border-gray-300">
          <p className="text-gray-500 text-sm">
            {t('কোনো সেবা পাওয়া যায়নি। দয়া করে ভিন্ন শব্দ দিয়ে খুঁজুন।', 'No services found. Please try searching with a different term.')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredServices.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl border border-emerald-100 hover:border-emerald-300 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col group"
            >
              {/* Service Image / Preview Container */}
              <div className="relative h-44 w-full overflow-hidden bg-emerald-50">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                
                {/* Category badge */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="bg-emerald-600/90 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-xs">
                    {service.category}
                  </span>
                  {service.badge && (
                    <span className="bg-amber-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      {service.badge}
                    </span>
                  )}
                </div>

                {/* Rating in image corner */}
                <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-gray-800 shadow-sm">
                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>★ {service.rating}</span>
                  <span className="text-gray-500 font-normal text-[11px]">({service.reviewCount})</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-emerald-700 transition-colors">
                    {service.title}
                  </h3>
                  
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {service.description}
                  </p>

                  {/* Bullet features */}
                  <div className="mt-3 space-y-1">
                    {service.features.slice(0, 2).map((feat, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px] text-gray-600">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="truncate">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Price & Booking Button */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-gray-400 block font-normal">{t('মূল্য', 'Price')}</span>
                    <div className="text-emerald-700 font-extrabold text-base sm:text-lg leading-tight">
                      ৳ {service.startingPrice.toLocaleString(language === 'en' ? 'en-US' : 'bn-BD')}
                      <span className="text-xs font-normal text-gray-500 ml-1">
                        {service.priceUnit}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => onBookService(service)}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs sm:text-sm font-bold rounded-xl transition-all shadow-sm hover:shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>{t('৳ বুক করুন', 'Book Now')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

