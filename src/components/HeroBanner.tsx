import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  ArrowRight, 
  HelpCircle, 
  Tag, 
  Copy, 
  Check, 
  Wrench, 
  Sparkles, 
  Zap, 
  GraduationCap,
  ShieldCheck,
  Star,
  Clock,
  Gift
} from 'lucide-react';

import { DynamicHomepageContent } from '../App';
import * as LucideIcons from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HeroBannerProps {
  onBookNow: () => void;
  onHowItWorks: () => void;
  onFilterCategory: (categoryId: string) => void;
  onOpenReferralModal?: () => void;
  content: DynamicHomepageContent;
}

const IconRenderer = ({ name, className }: { name: string, className?: string }) => {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.HelpCircle;
  return <IconComponent className={className} />;
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onBookNow,
  onHowItWorks,
  onFilterCategory,
  onOpenReferralModal,
  content
}) => {
  const { language, t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);
  const [homepageConfig, setHomepageConfig] = useState({
    heroBadge: 'প্রথম সেবায় ২০% ছাড়',
    promoCode: 'ALL20',
  });

  useEffect(() => {
    const loadConfig = () => {
      try {
        const saved = localStorage.getItem('homepage_full_config');
        if (saved) {
          const parsed = JSON.parse(saved);
          setHomepageConfig((prev) => ({
            ...prev,
            heroBadge: parsed.heroBadge || prev.heroBadge,
            promoCode: parsed.promoCode || prev.promoCode,
          }));
        }
      } catch {
        // default fallback
      }
    };
    loadConfig();
    window.addEventListener('storage', loadConfig);
    return () => window.removeEventListener('storage', loadConfig);
  }, []);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(homepageConfig.promoCode || 'ALL20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
      {/* Mobile Special Promo Ribbon */}
      <div className="mb-4 bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-950 text-white rounded-2xl p-3 sm:p-3.5 shadow-xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 border border-emerald-500/30 relative overflow-hidden group backdrop-blur-xl">
        {/* Subtle animated shine */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        <div className="absolute -left-8 -top-8 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center shrink-0 shadow-inner">
            <Tag className="w-5 h-5 text-emerald-300 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white">
                {t(homepageConfig.heroBadge, '20% Discount on First Service')}
              </span>
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 text-emerald-950 text-[11px] font-mono px-2.5 py-0.5 rounded-lg font-black shadow-xs border border-emerald-300/40">
                {homepageConfig.promoCode}
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/80 font-medium mt-0.5">
              {t('নতুন ব্যবহারকারীদের জন্য সব ধরনের সেবা ও পণ্যে বিশেষ ছাড়', 'Special discounts on all services and products for new users')}
            </p>
          </div>
        </div>
        <button
          onClick={handleCopyCode}
          className="shrink-0 ml-auto sm:ml-2 px-4 py-2 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-black rounded-xl transition-all flex items-center gap-1.5 shadow-md hover:shadow-emerald-400/20 active:scale-95 cursor-pointer relative z-10 border border-emerald-200"
        >
          {copiedCode ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{t('কপি হয়েছে', 'Copied')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-emerald-800" />
              <span>{t('কোড কপি করুন', 'Copy Code')}</span>
            </>
          )}
        </button>
      </div>

      {/* Referral System Promo Bar */}
      <div className="mb-4 relative overflow-hidden bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white rounded-2xl p-3.5 sm:p-4 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-emerald-400/30 group backdrop-blur-xl">
        {/* Animated sheen background highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />
        
        {/* Ambient background glow */}
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute left-1/3 -top-10 w-32 h-32 bg-emerald-400/15 rounded-full blur-xl pointer-events-none" />

        <div className="flex items-center gap-3.5 relative z-10">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-emerald-950 flex items-center justify-center font-black shrink-0 shadow-lg shadow-amber-500/25 ring-2 ring-amber-300/40 transform group-hover:scale-105 transition-transform duration-300">
            <Gift className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white drop-shadow-xs">
                {t('বন্ধুকে রেফার করুন ও ', 'Refer a friend & get ')}
                <span className="text-amber-300 font-black underline decoration-amber-400/60 decoration-2">
                  {t('৳১০০ ডিসকাউন্ট', '৳100 discount')}
                </span>
                {t(' পান!', '!')}
              </span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-300 text-emerald-950 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs border border-amber-200/60 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-900" />
                {t('রেফারেল বোনাস', 'Referral Bonus')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200/90 font-medium mt-0.5">
              {t('আপনার লিংকে বন্ধু সাইন-আপ করলেই আপনার ও বন্ধুর যেকোনো বুকিংয়ে ৳১০০ ডিসকাউন্ট কুপন আনলক হবে', 'When a friend signs up using your link, unlock a ৳100 discount coupon for both of you!')}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenReferralModal}
          className="relative z-10 w-full sm:w-auto shrink-0 px-4 py-2.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 hover:from-amber-300 hover:to-yellow-300 text-emerald-950 text-xs font-black rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-amber-500/20 hover:shadow-amber-500/35 hover:scale-[1.03] active:scale-95 border border-amber-200/50"
        >
          <span>{t('রেফারেল লিংক তৈরি করুন', 'Get Referral Link')}</span>
          <ArrowRight className="w-4 h-4 text-emerald-950 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Hero Card (Matches Desktop Mockup) */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#064e3b] text-white shadow-2xl border border-emerald-700/30 min-h-[500px] flex items-center">
        {/* Modern "Smart" Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/20 rounded-full blur-[100px] -mr-48 -mt-48 animate-pulse duration-[4000ms]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-green-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
        
        {/* Subtle Grid Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start p-6 sm:p-8 lg:p-12 relative z-10 w-full">
          {/* Left Text Content */}
          <div className="space-y-5 lg:pr-6">
            {/* Trust badge pill */}
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/15 text-emerald-300 text-[11px] sm:text-xs font-black backdrop-blur-md shadow-sm">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-75" />
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse delay-150" />
              </div>
              <span className="uppercase tracking-widest text-[10px] sm:text-[11px]">Premium Service Marketplace</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.18]">
                {t(content.heroTitle, 'All Your Home Services, In One Place')}
              </h1>
              
              {/* Subtitle with bullet points */}
              <p className="text-emerald-100/90 text-sm sm:text-base lg:text-lg leading-relaxed max-w-xl font-medium">
                {t(content.heroSubtitle, 'Thousands of trusted home services at your fingertips • 1000+ Verified Service Providers • 24/7 Support • Safe & Reliable')}
              </p>
            </div>

            {/* Quick service feature tags - Styled as "Smart" badges */}
            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                { label: t('দক্ষ টেকনিশিয়ান', 'Skilled Technicians'), color: 'bg-white/10 border-white/15' },
                { label: t('নির্দিষ্ট প্রাইসিং', 'Fixed Pricing'), color: 'bg-white/10 border-white/15' },
                { label: t('সার্ভিস গ্যারান্টি', 'Service Guarantee'), color: 'bg-white/10 border-white/15' }
              ].map((tag, idx) => (
                <span key={idx} className={`inline-flex items-center gap-1.5 ${tag.color} px-3 py-1.5 rounded-xl border text-[11px] font-bold text-white backdrop-blur-md shadow-xs transition-transform hover:scale-105`}>
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> {tag.label}
                </span>
              ))}
            </div>

            {/* Call to Actions - Side by side & compact */}
            <div className="flex flex-row items-center gap-3 pt-4 w-full max-w-lg">
              <button
                onClick={onBookNow}
                className="flex-1 group px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white text-emerald-950 text-xs sm:text-sm font-black shadow-lg shadow-black/20 transition-all hover:scale-[1.02] hover:bg-emerald-50 hover:shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer border border-white"
              >
                <span>{t('এখনই বুক করুন', 'Book Now')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform shrink-0" />
              </button>

              <button
                onClick={onHowItWorks}
                className="flex-1 px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-bold border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer backdrop-blur-md shadow-sm"
              >
                <HelpCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                <span className="truncate">{t('কিভাবে কাজ করে?', 'How it works?')}</span>
              </button>
            </div>
          </div>

          {/* Professional Vertical Divider for Desktop */}
          <div className="hidden lg:block absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[70%] w-px bg-gradient-to-b from-transparent via-white/15 to-transparent" />

          {/* Right Visual Composition - Ultra Smart Glass Card Aligned Upward */}
          <div className="relative flex items-start justify-center lg:pl-6 self-start mt-2 lg:mt-0">
            {/* Ambient Glow behind the card */}
            <div className="absolute inset-0 bg-emerald-400/15 blur-[80px] rounded-full scale-75" />
            
            <div className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden ring-1 ring-white/15 transition-all hover:ring-white/30">
              {/* Decorative top bar */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400/20 via-emerald-400/60 to-emerald-400/20" />

              <div className="bg-emerald-950/90 -mt-8 sm:-mt-9 mx-auto w-[92%] px-4 sm:px-5 py-2.5 flex items-center justify-between border border-white/20 rounded-xl mb-5 shadow-xl backdrop-blur-xl transform transition-all hover:scale-[1.01]">
                <span className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-500/20 rounded-lg border border-emerald-400/20">
                    <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                  </div>
                  {t('সুপার প্যাকেজ', 'Super Package')} • {content.superPackagePrice}
                </span>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-400/20 rounded-full border border-emerald-400/30 shadow-xs">
                  <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[10px] text-emerald-100 font-black uppercase tracking-tight">Live</span>
                </div>
              </div>

              {/* Grid of tool badges & icons with premium styling */}
              <div className="grid grid-cols-2 gap-3">
                {content.services.map((item, idx) => {
                  const translatedName = item.name === 'ইলেকট্রিশিয়ান সার্ভিস' ? 'Electrician Service' :
                    item.name === 'প্লাম্বিং ও পাইপ মেরামত' ? 'Plumbing & Pipe Repair' :
                    item.name === 'হোম ডিপ ক্লিনিং' ? 'Home Deep Cleaning' :
                    item.name === 'অভিজ্ঞ হোম টিউটর' ? 'Experienced Home Tutor' : item.name;

                  return (
                    <button
                      key={idx}
                      onClick={() => onFilterCategory(item.name.toLowerCase())}
                      className="bg-white/95 hover:bg-white text-emerald-950 p-3 sm:p-3.5 rounded-xl transition-all text-left group shadow-md cursor-pointer border border-transparent hover:border-emerald-400/50 hover:-translate-y-0.5"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-xs">
                        <IconRenderer name={item.icon} className="w-4 h-4" />
                      </div>
                      <h4 className="text-xs sm:text-sm font-extrabold leading-tight mb-0.5">
                        {t(item.name, translatedName)}
                      </h4>
                      <p className="text-[10px] text-gray-500 font-semibold leading-tight">
                        {t(`বুক করুন ${item.price} থেকে`, `Book from ${item.price}`)}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Bottom Quick Metric - Smart pill design */}
              <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-emerald-100">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[11px] sm:text-xs font-bold tracking-tight">
                    {t('গড় রেসপন্স:', 'Avg Response:')} <span className="text-white">{t('১৫-৩০ মিনিট', '15-30 mins')}</span>
                  </span>
                </div>
                <div className="px-2.5 py-0.5 bg-emerald-500/20 rounded-full border border-emerald-400/20">
                  <span className="text-[11px] font-black text-emerald-300">
                    {t('★ ৪.৮ রেটিং', '★ 4.8 Rating')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

