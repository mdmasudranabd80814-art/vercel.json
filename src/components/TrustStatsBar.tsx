import React from 'react';
import { CheckCircle2, ShieldCheck, Clock, Award, Headphones } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const TrustStatsBar: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-emerald-50/70 border-y border-emerald-100 py-6 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Core Stats Bar from Mockup */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-10 text-emerald-900 font-bold text-sm sm:text-base border-b border-emerald-200/60 pb-5 mb-5 text-center">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('১০০০+ বিশ্বস্ত সেবা', '1000+ Trusted Services')}</span>
          </div>
          <span className="hidden sm:inline text-emerald-300">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('৫০,০০০+ সন্তুষ্ট গ্রাহক', '50,000+ Happy Customers')}</span>
          </div>
          <span className="hidden sm:inline text-emerald-300">•</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{t('৬৪ জেলায় সেবা উপলব্ধ', 'Service in 64 Districts')}</span>
          </div>
        </div>

        {/* 4 Feature Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-emerald-100/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">{t('ভেরিফাইড এক্সপার্ট', 'Verified Experts')}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{t('NID ও ব্যাকগ্রাউন্ড যাচাইকৃত টেকনিশিয়ান', 'NID & Background verified technicians')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-emerald-100/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">{t('দ্রুততম উপস্থিতি', 'Fastest Arrival')}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{t('বুকিংয়ের ৩০ মিনিটের মধ্যে যোগাযোগ', 'Contact within 30 minutes of booking')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-emerald-100/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">{t('সার্ভিস ওয়ারেন্টি', 'Service Warranty')}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{t('কাজের পর ৭ থেকে ৩০ দিনের ফ্রি ওয়ারেন্টি', '7 to 30 days free service warranty')}</p>
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-white/70 border border-emerald-100/80">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-gray-900">{t('২৪/৭ কাস্টমার কেয়ার', '24/7 Customer Care')}</h4>
              <p className="text-[11px] text-gray-500 mt-0.5">{t('যেকোনো সহায়তায় সরাসরি কল বা চ্যাট', 'Direct call or chat support anytime')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

