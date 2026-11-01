import React from 'react';
import { X, Search, Calendar, Wrench, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookNow: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onBookNow,
}) => {
  const { t } = useLanguage();
  if (!isOpen) return null;

  const steps = [
    {
      number: '01',
      title: t('সেবা বা পণ্য নির্বাচন করুন', 'Select Service or Product'),
      desc: t('আপনার প্রয়োজনীয় ইলেকট্রিশিয়ান, প্লাম্বার, ক্লিনিং, টিউটর বা হার্ডওয়্যার টুলস খুঁজুন ও বেছে নিন।', 'Find and choose your required electrician, plumber, cleaning, tutor, or hardware tools.'),
      icon: <Search className="w-6 h-6 text-emerald-700" />,
    },
    {
      number: '02',
      title: t('সময় ও ঠিকানা ঠিক করুন', 'Set Schedule & Location'),
      desc: t('আপনার সুবিধাজনক তারিখ, সময় স্লট এবং বাসার ঠিকানা দিয়ে খুব সহজে বুকিং অর্ডার কনফার্ম করুন।', 'Confirm your booking with your convenient date, time slot, and home address.'),
      icon: <Calendar className="w-6 h-6 text-emerald-700" />,
    },
    {
      number: '03',
      title: t('দক্ষ এক্সপার্ট সেবা দেবেন', 'Expert Service Delivery'),
      desc: t('আমাদের ব্যাকগ্রাউন্ড ভেরিফাইড টেকনিশিয়ান নির্ধারিত সময়ে আধুনিক যন্ত্রপাতি নিয়ে আপনার দোরগোড়ায় পৌঁছাবে।', 'Our background-verified technician arrives at your doorstep with modern equipment on schedule.'),
      icon: <Wrench className="w-6 h-6 text-emerald-700" />,
    },
    {
      number: '04',
      title: t('যাচাই শেষে নিরাপদে পেমেন্ট', 'Inspect & Pay Securely'),
      desc: t('কাজের মান দেখে শতভাগ সন্তুষ্ট হয়ে ক্যাশ, বিকাশ বা কার্ডের মাধ্যমে পেমেন্ট পরিশোধ করুন। সাথে সার্ভিস ওয়ারেন্টি।', 'Pay safely via Cash, bKash, or Card after 100% satisfaction. Includes service warranty.'),
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-emerald-50/70">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">
              {t('অল সার্ভিস বিডি কিভাবে কাজ করে?', 'How All Service BD Works?')}
            </h3>
            <p className="text-xs text-emerald-700 font-medium">
              {t('সহজ ৪ ধাপে ঘরে বসেই সেবা নিন', 'Get services at home in 4 easy steps')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps List */}
        <div className="p-4 sm:p-6 space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-3.5 p-3 rounded-xl bg-gray-50 border border-gray-100">
              <div className="w-12 h-12 rounded-xl bg-emerald-100/80 flex items-center justify-center shrink-0">
                {step.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.2 rounded font-mono">
                    {t(`ধাপ ${step.number}`, `Step ${step.number}`)}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900">
                    {step.title}
                  </h4>
                </div>
                <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}

          <div className="pt-2">
            <button
              onClick={() => {
                onClose();
                onBookNow();
              }}
              className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{t('এখনই সেবা বুক করুন', 'Book Service Now')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

