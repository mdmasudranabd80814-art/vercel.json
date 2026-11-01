import React from 'react';
import { ShieldCheck, PhoneCall, Mail, MapPin, Heart } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { DynamicHomepageContent } from '../App';

interface FooterProps {
  onSelectCategory: (catId: string) => void;
  onOpenHowItWorks: () => void;
  content: DynamicHomepageContent;
}

export const Footer: React.FC<FooterProps> = ({ onSelectCategory, onOpenHowItWorks, content }) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const isAdmin = user?.email === 'mdmasudranabd80814@gmail.com' || user?.email === 'admin@allservicebd.com';

  const [homepageConfig, setHomepageConfig] = React.useState({
    footerAbout: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় ইলেকট্রিক্যাল, প্লাম্বিং, ডিপ ক্লিনিং, এসি মেরামত এবং হোম টিউটর সার্ভিস খুব সহজেই বুক করুন।',
    hotline: '০৯৬১২-০০০০০০',
    hotlineHours: 'সকাল ৮টা - রাত ১১টা',
    email: 'support@allservicebd.com',
    officeAddress: 'লেভেল-৫, মিরপুর ডিওএইচএস, ঢাকা-১২১৬',
    footerCoverage: 'ঢাকা, চট্টগ্রাম, সিলেট সহ বাংলাদেশের ৬৪টি জেলা জুড়ে।',
  });

  const [paymentConfig, setPaymentConfig] = React.useState({
    bkash: { enabled: true },
    nagad: { enabled: true },
    rocket: { enabled: true },
    cod: { enabled: true },
  });

  React.useEffect(() => {
    const loadConfigs = () => {
      try {
        const savedHome = localStorage.getItem('homepage_full_config');
        if (savedHome) {
          const parsed = JSON.parse(savedHome);
          setHomepageConfig((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // default fallback
      }

      try {
        const savedPay = localStorage.getItem('payment_config');
        if (savedPay) {
          const parsed = JSON.parse(savedPay);
          setPaymentConfig((prev) => ({ ...prev, ...parsed }));
        }
      } catch {
        // default fallback
      }
    };

    loadConfigs();
    window.addEventListener('storage', loadConfigs);
    return () => window.removeEventListener('storage', loadConfigs);
  }, []);

  return (
    <footer className="bg-emerald-950 text-white pt-12 pb-20 sm:pb-8 border-t border-emerald-900 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-10 border-b border-emerald-900/80">
          
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  All Service BD
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  {t('অল সার্ভিস বিডি • আপনার সব সেবা, এক জায়গায়', 'All Service BD • All your services in one place')}
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-emerald-200/80 leading-relaxed max-w-sm">
              {content.footerText || t(homepageConfig.footerAbout, 'Bangladesh\'s most trusted online service marketplace. Book electrical, plumbing, deep cleaning, AC repair, and home tutor services with ease.')}
            </p>

            <div className="space-y-2 pt-1 text-xs text-emerald-300">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('হটলাইন', 'Hotline')}: {homepageConfig.hotline} ({homepageConfig.hotlineHours})</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('ইমেইল', 'Email')}: {homepageConfig.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{t('প্রধান কার্যালয়', 'Head Office')}: {homepageConfig.officeAddress}</span>
              </div>
            </div>
          </div>

          {/* Quick Services */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 tracking-wide uppercase">
              {t('জনপ্রিয় সেবা সমূহ', 'Popular Services')}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button 
                  onClick={() => onSelectCategory('electrician')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('ইলেকট্রিশিয়ান সার্ভিস', 'Electrician Service')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('plumber')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('প্লাম্বিং ও পাইপ মেরামত', 'Plumbing & Pipe Repair')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('cleaning')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('হোম ও অফিস ডিপ ক্লিনিং', 'Home & Office Deep Cleaning')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('tutor')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('অভিজ্ঞ হোম ও অনলাইন টিউটর', 'Home & Online Tutors')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('ac_repair')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('এসি ইনস্টল ও মেরামত', 'AC Installation & Repair')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onSelectCategory('painting')} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('হোম পেইন্টিং ও ডেকোর', 'Home Painting & Decor')}
                </button>
              </li>
            </ul>
          </div>

          {/* Useful links */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 tracking-wide uppercase">
              {t('প্রয়োজনীয় লিংক', 'Quick Links')}
            </h4>
            <ul className="space-y-2 text-xs text-emerald-200/80">
              <li>
                <button 
                  onClick={() => {
                    document.getElementById('testimonials-section')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('গ্রাহকের রিভিউ ও টেস্টমোনিয়াল', 'Reviews & Testimonials')}
                </button>
              </li>
              <li>
                <button onClick={onOpenHowItWorks} className="hover:text-white transition-colors cursor-pointer text-left">
                  {t('কিভাবে বুকিং করবেন?', 'How to Book?')}
                </button>
              </li>
              <li>
                <button 
                  onClick={() => {
                    document.getElementById('coverage-section')?.scrollIntoView({ behavior: 'smooth' });
                  }} 
                  className="hover:text-white transition-colors cursor-pointer text-left"
                >
                  {t('সার্ভিস কভারেজ ম্যাপ', 'Service Coverage Map')}
                </button>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('সার্ভিস প্রোভাইডার হোন (রেজিস্ট্রেশন)', 'Become a Provider')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('সার্ভিস প্রাইসিং তালিকা', 'Service Pricing')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('ওয়ারেন্টি ও রিফান্ড পলিসি', 'Warranty & Refund Policy')}
                </span>
              </li>
              <li>
                <span className="hover:text-white transition-colors cursor-pointer">
                  {t('গোপনীয়তা নীতিমালা', 'Privacy Policy')}
                </span>
              </li>
              {isAdmin && (
                <li>
                  <a href="/admin" className="hover:text-white transition-colors cursor-pointer text-emerald-300">
                    {t('সুপার এডমিন ড্যাশবোর্ড', 'Super Admin Dashboard')}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Payment gateways & coverage */}
          <div>
            <h4 className="font-bold text-sm text-white mb-3 tracking-wide uppercase">
              {t('নিরাপদ পেমেন্ট', 'Secure Payments')}
            </h4>
            <p className="text-xs text-emerald-200/80 mb-3">
              {t('ক্যাশ অন ডেলিভারি, বিকাশ ও কার্ডে পেমেন্টের ১০০% সুরক্ষা', '100% secure payments via Cash on Delivery, bKash & cards')}
            </p>

            {content.showPayments && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {paymentConfig.bkash?.enabled !== false && (
                  <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[11px] text-pink-300 border border-pink-400/30">
                    {t('বিকাশ (bKash)', 'bKash')}
                  </span>
                )}
                {paymentConfig.nagad?.enabled !== false && (
                  <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[11px] text-orange-300 border border-orange-400/30">
                    {t('নগদ (Nagad)', 'Nagad')}
                  </span>
                )}
                {paymentConfig.rocket?.enabled !== false && (
                  <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[11px] text-purple-300 border border-purple-400/30">
                    {t('রকেট (Rocket)', 'Rocket')}
                  </span>
                )}
                {paymentConfig.cod?.enabled !== false && (
                  <span className="px-2 py-1 bg-white/10 rounded font-semibold text-[11px] text-emerald-300 border border-emerald-400/30">
                    {t('ক্যাশ অন ডেলিভারি', 'Cash on Delivery')}
                  </span>
                )}
              </div>
            )}

            <div className="bg-emerald-900/40 p-2.5 rounded-xl border border-emerald-800 text-[11px] text-emerald-200">
              <span className="font-bold text-white block">{t('সার্ভিস কভারেজ:', 'Service Coverage:')}</span>
              {language === 'en' ? 'Across 64 districts in Bangladesh including Dhaka, Chittagong, Sylhet.' : homepageConfig.footerCoverage}
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-300/70 gap-3">
          <p>© {new Date().getFullYear()} All Service BD. {t('সর্বস্বত্ব সংরক্ষিত।', 'All rights reserved.')}</p>
          <p className="flex items-center gap-1">
            {t('বাংলাদেশের সেবা মার্কেটপ্লেস', 'Bangladesh Service Marketplace')} <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 inline" /> {t('দ্বারা নির্মিত', 'crafted with care')}
          </p>
        </div>
      </div>
    </footer>
  );
};

