import React, { useState, useEffect } from 'react';
import { MessageSquare, X, Send, PhoneCall, Sparkles, CheckCircle2, HelpCircle, ArrowUpRight } from 'lucide-react';

interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '8801700000000', // Default Bangladeshi customer support WhatsApp number
  defaultMessage = 'হ্যালো, আমি AllServiceBD থেকে কাস্টমার সাপোর্ট সাহায্য চাচ্ছি।',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customMessage, setCustomMessage] = useState(defaultMessage);
  const [showPulse, setShowPulse] = useState(true);
  const [unreadBadge, setUnreadBadge] = useState(true);

  // Auto hide pulse glow effect after 10 seconds to keep UI clean
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPulse(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenWhatsApp = (overrideMsg?: string) => {
    const msgToSend = overrideMsg || customMessage || defaultMessage;
    const encodedText = encodeURIComponent(msgToSend);
    const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setUnreadBadge(false);
  };

  const quickTopics = [
    { label: '🛠️ বুকিং সহায়তা', text: 'হ্যালো! নতুন একটি সার্ভিস বুক করতে সাহায্য প্রয়োজন।' },
    { label: '📦 অর্ডার ট্র্যাকিং', text: 'হ্যালো! আমার আগের অর্ডারের আপডেট জানতে চাচ্ছি।' },
    { label: '⚡ জরুরি প্লাম্বার/ইলেকট্রিশিয়ান', text: 'জরুরি ভিত্তিতে দ্রুত একজন টেকনিশিয়ান প্রয়োজন।' },
    { label: '💰 প্রাইসিং ও ডিসকাউন্ট', text: 'সার্ভিস চার্জ ও বিশেষ ছাড়ের তথ্য জানতে চাচ্ছি।' },
  ];

  return (
    <div className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end pointer-events-none select-none">
      {/* Popover Support Card */}
      {isOpen && (
        <div className="pointer-events-auto mb-3 w-[320px] sm:w-[360px] bg-white rounded-2xl shadow-2xl border border-emerald-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 p-1 rounded-full text-emerald-100 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="বন্ধ করুন"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-white/20 p-0.5 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white font-bold text-lg">
                  <WhatsAppSvg className="w-7 h-7 text-white fill-current" />
                </div>
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-400 border-2 border-emerald-800 rounded-full animate-pulse"></span>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-base text-white leading-tight">কাস্টমার সাপোর্ট টিম</h3>
                  <span className="bg-emerald-800/80 text-emerald-200 text-[10px] px-1.5 py-0.5 rounded-full font-medium">২৪/৭ অনলাইন</span>
                </div>
                <p className="text-emerald-100 text-xs mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-300 shrink-0" />
                  সাধারণত ১ মিনিটে উত্তর দেয়া হয়
                </p>
              </div>
            </div>
          </div>

          {/* Chat Body */}
          <div className="p-4 bg-emerald-50/40 space-y-3">
            {/* Greeting Bubble */}
            <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs border border-emerald-100/80 text-xs text-gray-800 space-y-1.5">
              <p className="font-semibold text-emerald-950 flex items-center gap-1.5">
                <span>👋 আসসালামু আলাইকুম!</span>
              </p>
              <p className="text-gray-600 leading-relaxed">
                AllServiceBD-তে আপনাকে স্বাগতম! আপনার যেকোনো প্রশ্ন, বুকিং সহায়তা বা টেকনিক্যাল সাহায্যের জন্য হোয়াটসঅ্যাপে আমাদের মেসেজ দিন।
              </p>
            </div>

            {/* Quick Topic Chips */}
            <div>
              <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                দ্রুত বিষয় নির্বাচন করুন:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {quickTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setCustomMessage(topic.text);
                      handleOpenWhatsApp(topic.text);
                    }}
                    className="text-[11px] bg-white hover:bg-emerald-100/80 text-emerald-900 border border-emerald-200/80 hover:border-emerald-400 px-2.5 py-1 rounded-lg transition-all text-left font-medium cursor-pointer flex items-center gap-1 shadow-2xs"
                  >
                    <span>{topic.label}</span>
                    <ArrowUpRight className="w-3 h-3 text-emerald-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Message Input */}
            <div className="pt-1">
              <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                আপনার বার্তা লিখুন:
              </label>
              <div className="relative">
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  placeholder="এখানে আপনার প্রশ্ন বা প্রয়োজন লিখুন..."
                  rows={2}
                  className="w-full text-xs p-2.5 pr-8 bg-white border border-gray-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl resize-none text-gray-800 shadow-2xs"
                />
              </div>
            </div>

            {/* Submit Action */}
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#20bd5a] active:bg-[#1da850] text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer group"
            >
              <WhatsAppSvg className="w-5 h-5 fill-current text-white group-hover:scale-110 transition-transform" />
              <span>হোয়াটসঅ্যাপে চ্যাট শুরু করুন</span>
              <Send className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="text-center pt-1">
              <span className="text-[10px] text-gray-400 flex items-center justify-center gap-1">
                <PhoneCall className="w-3 h-3 text-emerald-600" />
                সরাসরি কল করতে পারেন: <a href={`tel:+${phoneNumber}`} className="text-emerald-700 hover:underline font-semibold">+৮৮০ ১৭০০০-০০০০০</a>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Floating Circular Button */}
      <div className="pointer-events-auto relative group">
        {/* Tooltip on Desktop hover */}
        {!isOpen && (
          <div className="hidden sm:block absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap">
            <div className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-lg shadow-xl flex items-center gap-2 font-medium">
              <span className="w-2 h-2 rounded-full bg-[#25D366] animate-ping"></span>
              <span>সরাসরি সাপোর্ট চ্যাট (WhatsApp)</span>
            </div>
          </div>
        )}

        {/* Outer Glow Pulse Effect */}
        {showPulse && !isOpen && (
          <span className="absolute -inset-1 rounded-full bg-[#25D366]/40 animate-ping pointer-events-none"></span>
        )}

        {/* Main Floating Trigger Button */}
        <button
          onClick={() => {
            setIsOpen(!isOpen);
            setUnreadBadge(false);
          }}
          className={`relative w-14 h-14 sm:w-15 sm:h-15 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer ${
            isOpen
              ? 'bg-gray-800 text-white hover:bg-gray-900 rotate-90 ring-4 ring-gray-200'
              : 'bg-[#25D366] text-white hover:bg-[#20bd5a] hover:scale-105 ring-4 ring-emerald-500/20'
          }`}
          aria-label="WhatsApp Support"
          title="হোয়াটসঅ্যাপ কাস্টমার সাপোর্ট"
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <WhatsAppSvg className="w-8 h-8 fill-current text-white" />
          )}

          {/* Unread notification badge */}
          {unreadBadge && !isOpen && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center shadow-xs animate-bounce">
              1
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

// SVG component for official WhatsApp Logo
const WhatsAppSvg: React.FC<{ className?: string }> = ({ className = 'w-6 h-6' }) => (
  <svg
    viewBox="0 0 24 24"
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.99c-.002 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c-.001 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);
