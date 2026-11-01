import React, { useState } from 'react';
import { MapPin, ShieldCheck, Users, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DIVISIONS = [
  { id: 'dhaka', name: 'ঢাকা', enName: 'Dhaka', providers: '৪৫০+', coverage: '১০০%', x: '50%', y: '55%' },
  { id: 'chattogram', name: 'চট্টগ্রাম', enName: 'Chattogram', providers: '৩০০+', coverage: '৯২%', x: '75%', y: '75%' },
  { id: 'sylhet', name: 'সিলেট', enName: 'Sylhet', providers: '১২০+', coverage: '৮৫%', x: '80%', y: '40%' },
  { id: 'rajshahi', name: 'রাজশাহী', enName: 'Rajshahi', providers: '১৮০+', coverage: '৮৮%', x: '30%', y: '45%' },
  { id: 'khulna', name: 'খুলনা', enName: 'Khulna', providers: '১৬০+', coverage: '৮৬%', x: '35%', y: '75%' },
  { id: 'barishal', name: 'বরিশাল', enName: 'Barishal', providers: '৯০+', coverage: '৮০%', x: '50%', y: '80%' },
  { id: 'rangpur', name: 'রংপুর', enName: 'Rangpur', providers: '১১০+', coverage: '৮২%', x: '25%', y: '25%' },
  { id: 'mymensingh', name: 'ময়মনসিংহ', enName: 'Mymensingh', providers: '৯৫+', coverage: '৮৪%', x: '55%', y: '35%' },
];

export const ServiceCoverageMap: React.FC = () => {
  const { t, language } = useLanguage();
  const [hoveredDivision, setHoveredDivision] = useState<typeof DIVISIONS[0] | null>(null);

  return (
    <section id="coverage-section" className="py-12 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5" />
              <span>{t('সারাদেশে সেবা', 'Nationwide Service')}</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
              {t('বাংলাদেশের ৬৪ জেলাতেই', 'Across all 64 districts')} <br />
              <span className="text-emerald-600">{t('আমাদের সেবা এখন আপনার দোরগোড়ায়', 'Our services now at your doorstep')}</span>
            </h2>
            
            <p className="text-gray-600 text-sm sm:text-base leading-relaxed max-w-xl">
              {t('ঢাকা থেকে শুরু করে প্রত্যন্ত অঞ্চল পর্যন্ত আমরা আমাদের দক্ষ সার্ভিস প্রোভাইডারদের মাধ্যমে মানসম্মত সেবা নিশ্চিত করছি। নিচের ম্যাপে আমাদের কভারেজ এরিয়া দেখুন।', 'From Dhaka to remote areas, we ensure quality service through our skilled service providers. Check our coverage areas on the map below.')}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                <div className="flex items-center gap-2 text-emerald-700 mb-1">
                  <Users className="w-5 h-5" />
                  <span className="text-lg font-bold">৫,০০০+</span>
                </div>
                <p className="text-xs text-emerald-800 font-medium">{t('নিবন্ধিত প্রোভাইডার', 'Registered Providers')}</p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-lg font-bold">১০০%</span>
                </div>
                <p className="text-xs text-blue-800 font-medium">{t('নিরাপদ কভারেজ', 'Secure Coverage')}</p>
              </div>
            </div>

            {/* Division List for Mobile or Quick View */}
            <div className="flex flex-wrap gap-2 pt-2">
              {DIVISIONS.map((div) => (
                <button
                  key={div.id}
                  onMouseEnter={() => setHoveredDivision(div)}
                  onMouseLeave={() => setHoveredDivision(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    hoveredDivision?.id === div.id
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-md transform -translate-y-0.5'
                      : 'bg-white text-gray-700 border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                  }`}
                >
                  {language === 'en' ? div.enName : div.name}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Map Visual */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-100/50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative aspect-square max-w-[500px] mx-auto bg-emerald-50/30 rounded-3xl border border-emerald-100 p-8 flex items-center justify-center overflow-hidden">
              {/* Simplified Bangladesh Outline (Stylized) */}
              <svg viewBox="0 0 200 250" className="w-full h-full drop-shadow-2xl">
                <path
                  d="M100 10 L130 30 L150 20 L170 50 L160 80 L180 120 L190 180 L160 220 L140 240 L100 230 L70 245 L40 220 L10 180 L30 140 L20 100 L40 60 L60 40 L80 15 Z"
                  fill="#10b981"
                  fillOpacity="0.1"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  className="transition-all duration-500"
                />
                
                {/* Hotspots */}
                {DIVISIONS.map((div) => (
                  <g
                    key={div.id}
                    onMouseEnter={() => setHoveredDivision(div)}
                    onMouseLeave={() => setHoveredDivision(null)}
                    className="cursor-pointer group/pin"
                  >
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="6"
                      fill={hoveredDivision?.id === div.id ? "#059669" : "#10b981"}
                      className="animate-pulse transition-colors"
                    />
                    <circle
                      cx={div.x}
                      cy={div.y}
                      r="12"
                      fill="#10b981"
                      fillOpacity="0.2"
                      className="scale-0 group-hover/pin:scale-100 transition-transform duration-300 origin-center"
                    />
                    <MapPin
                      x={parseFloat(div.x) * 2 - 10}
                      y={parseFloat(div.y) * 2.5 - 20}
                      width="20"
                      height="20"
                      className={`text-emerald-700 transition-all duration-300 ${
                        hoveredDivision?.id === div.id ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                      }`}
                    />
                  </g>
                ))}
              </svg>

              {/* Info Tooltip Card */}
              <div
                className={`absolute bottom-6 left-6 right-6 p-4 bg-white/95 backdrop-blur-md rounded-2xl border border-emerald-100 shadow-xl transition-all duration-500 transform ${
                  hoveredDivision ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
                }`}
              >
                {hoveredDivision && (
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-extrabold text-emerald-900 text-base">
                        {language === 'en' ? hoveredDivision.enName : hoveredDivision.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 font-medium">
                        {t('সার্ভিস কভারেজ এরিয়া', 'Service Coverage Area')}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-600 font-bold text-sm">
                        {hoveredDivision.providers} {t('প্রোভাইডার', 'Providers')}
                      </div>
                      <div className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full inline-block font-bold">
                        {hoveredDivision.coverage} {t('সক্রিয়', 'Active')}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Placeholder hint when nothing is hovered */}
              {!hoveredDivision && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none animate-bounce">
                  <div className="bg-emerald-600 text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-lg">
                    {t('ম্যাপে টাচ করুন', 'Interact with Map')}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
