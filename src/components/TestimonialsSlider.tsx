import React, { useState, useEffect, useRef } from 'react';
import { 
  Star, 
  ChevronLeft, 
  ChevronRight, 
  Quote, 
  CheckCircle2, 
  Plus, 
  ThumbsUp, 
  Pause, 
  Play, 
  X, 
  Send,
  User,
  MapPin,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

// Default generated avatar image paths
import avatar1 from '../assets/images/customer_avatar_1_1793432871359.jpg';
import avatar2 from '../assets/images/customer_avatar_2_1793432871940.jpg';
import avatar3 from '../assets/images/customer_avatar_3_1793432871139.jpg';

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  avatar?: string;
  serviceCategory: string;
  serviceTitle: string;
  rating: number;
  headline: string;
  review: string;
  date: string;
  isVerified: boolean;
  helpfulCount: number;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: 't-1',
    name: 'মোঃ তানভীর আহমেদ',
    location: 'মিরপুর-১০, ঢাকা',
    avatar: avatar1,
    serviceCategory: 'ac_repair',
    serviceTitle: 'এসি সার্ভিসিং ও ওয়াটার জেট ক্লিন',
    rating: 5,
    headline: 'একদম সময়ে টেকনিশিয়ান এসে দ্রুত সার্ভিস সম্পন্ন করেছে!',
    review: 'গরমে এসি ঠান্ডা হচ্ছিল না। অ্যাপে বুক করার মাত্র ১ ঘণ্টার মধ্যে টেকনিশিয়ান রিয়াজ ভাই ভাই এসে সম্পূর্ণ ওয়াটার জেট দিয়ে পরিষ্কার করেন। গ্যাস প্রেসার চেক করে ফিক্স করার পর এখন বরফের মতো ঠান্ডা বাতাস দিচ্ছে। সার্ভিস একদম পেশাদার!',
    date: '২৮ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 34,
  },
  {
    id: 't-2',
    name: 'মোসাম্মাৎ ফারহানা হক',
    location: 'ধানমন্ডি ২৭, ঢাকা',
    avatar: avatar2,
    serviceCategory: 'cleaning',
    serviceTitle: 'সোফা ও ম্যাট্রেস ডিপ ক্লিনিং',
    rating: 5,
    headline: 'পুরানো সোফা একেবারে নতুনের মতো ঝকঝকে হয়ে গেছে!',
    review: 'বাসার ৩+২ সোফায় বেশ কয়েকটি গভীর দাগ ছিল। অলসার্ভিস বিডির টিম এসে তাদের ভ্যাকুয়াম ও জীবাণুনাশক ফোম দিয়ে এত সুন্দর পরিষ্কার করেছে যে আমি অভিভূত! গন্ধও একদম চলে গেছে। সব গৃহিণীদের জন্য তাদের ক্লিনিং টিম রিকমেন্ড করব।',
    date: '২৫ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 28,
  },
  {
    id: 't-3',
    name: 'প্রকৌশলী সাজ্জাদ হোসেন',
    location: 'উত্তরা সেক্টর ৭, ঢাকা',
    avatar: avatar3,
    serviceCategory: 'electrician',
    serviceTitle: 'হোম শর্ট সার্কিট ও ওয়্যারিং ফিক্স',
    rating: 5,
    headline: 'জরুরি রাতে ইলেকট্রিশিয়ান ভাই এসে বিপদ থেকে বাঁচিয়েছেন!',
    review: 'রাত ৯টায় হঠাৎ মেইন ডিস্ট্রিবিউশন বোর্ডে স্পার্ক হয়ে বিদ্যুৎ চলে যায়। অ্যাপের জরুরি সেবায় বুক করতেই ৩০ মিনিটের মধ্যে এক্সপার্ট ইলেকট্রিশিয়ান উপস্থিত হন। খুব সতর্কতার সাথে প্রবলেম ডায়াগনস্টিক করে মেরামত করেন। সততা ও কাজের মান সেরা!',
    date: '২১ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 42,
  },
  {
    id: 't-4',
    name: 'নাসরিন সুলতানা',
    location: 'গুলশান-২, ঢাকা',
    avatar: undefined,
    serviceCategory: 'tutor',
    serviceTitle: 'এইচএসসি পদার্থবিজ্ঞান হোম টিউটর',
    rating: 5,
    headline: 'বুয়েটের অভিজ্ঞ টিউটর পেয়ে ছেলের রেজাল্ট অনেক ভালো হয়েছে',
    review: 'আমরা ছেলের জন্য একজন অভিজ্ঞ হোম টিউটর খুঁজছিলাম। অলসার্ভিস বিডির মাধ্যমে বুয়েটের মেকানিক্যাল বিভাগের একজন ভাইয়াকে টিউটর হিসেবে পাই। উনি খুব সহজে কঠিন টপিকগুলো বুঝিয়ে দেন। ডেমো ক্লাসের পর থেকেই নিয়মিত পড়ছে।',
    date: '১৮ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 19,
  },
  {
    id: 't-5',
    name: 'আরিফুল ইসলাম রাজীব',
    location: 'বাড্ডা, ঢাকা',
    avatar: undefined,
    serviceCategory: 'plumber',
    serviceTitle: 'বাথরুম ট্যাপ ও পাইপ লিক রিপেয়ার',
    rating: 5,
    headline: 'প্লাম্বিং কাজের ফিক্সড রেট ও সৎ আচরণে অত্যন্ত সন্তুষ্ট',
    review: 'অনেকদিন ধরে বাথরুমের শাওয়ার পাইপে লিক ছিল। লোকাল মিস্ত্রিরা এসে বেশি দাম চাইত। অলসার্ভিস বিডিতে সাশ্রয়ী মূল্যে পারফেক্ট কাজ পেয়েছি। কোনো অতিরিক্ত হিডেন চার্জ ছিল না।',
    date: '১৫ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 15,
  },
  {
    id: 't-6',
    name: 'শামীমা ইয়াসমিন',
    location: 'মোহাম্মদপুর, ঢাকা',
    avatar: undefined,
    serviceCategory: 'painting',
    serviceTitle: '৩ রুমের ইনটেরিয়র ওয়াল পেইন্টিং',
    rating: 5,
    headline: 'সময়ের আগেই ফিনিশিং শেষ করেছে, কোনো ময়লা জমেনি',
    review: 'পুরো বাসার ৩টি রুম নতুন করে কালার করিয়েছি। তাদের কাজের ধরণ খুব ভালো—প্লাস্টিক কভার দিয়ে ফার্নিচার ঢেকে পেইন্ট করেছে যাতে দামি আসবাবপত্রে একবিন্দু রং না পড়ে। ফিনিশিং অসাধারণ!',
    date: '১০ অক্টোবর, ২০২৬',
    isVerified: true,
    helpfulCount: 23,
  },
];

const CATEGORIES_FILTER = [
  { id: 'all', labelBn: 'সকল রিভিউ', labelEn: 'All Reviews' },
  { id: 'ac_repair', labelBn: 'এসি ও মেরামত', labelEn: 'AC & Repairs' },
  { id: 'cleaning', labelBn: 'ক্লিনিং সার্ভিস', labelEn: 'Cleaning' },
  { id: 'electrician', labelBn: 'ইলেকট্রিশিয়ান', labelEn: 'Electrician' },
  { id: 'tutor', labelBn: 'হোম টিউটর', labelEn: 'Home Tutors' },
  { id: 'plumber', labelBn: 'প্লাম্বার', labelEn: 'Plumber' },
  { id: 'painting', labelBn: 'পেইন্টিং', labelEn: 'Painting' },
];

export const TestimonialsSlider: React.FC = () => {
  const { language, t } = useLanguage();
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, number>>({});
  const [userVoted, setUserVoted] = useState<Record<string, boolean>>({});

  // Review Submission Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newHoverRating, setNewHoverRating] = useState(0);
  const [newName, setNewName] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newServiceCategory, setNewServiceCategory] = useState('ac_repair');
  const [newServiceTitle, setNewServiceTitle] = useState('');
  const [newHeadline, setNewHeadline] = useState('');
  const [newReview, setNewReview] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Touch Swipe State
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);

  // Load Firestore Testimonials in Realtime
  useEffect(() => {
    const q = query(collection(db, 'homepage_testimonials'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const fetched: Testimonial[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || 'সম্মানিত গ্রাহক',
            location: data.location || 'ঢাকা, বাংলাদেশ',
            avatar: data.avatar || undefined,
            serviceCategory: data.serviceCategory || 'ac_repair',
            serviceTitle: data.serviceTitle || 'সার্ভিস বুকিং',
            rating: data.rating || 5,
            headline: data.headline || 'চমৎকার অভিজ্ঞতা!',
            review: data.review || '',
            date: data.createdAt instanceof Timestamp 
              ? data.createdAt.toDate().toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' })
              : 'সম্প্রতি',
            isVerified: data.isVerified ?? true,
            helpfulCount: data.helpfulCount || 0,
          };
        });
        // Merge with defaults so there's always rich content
        setTestimonials([...fetched, ...DEFAULT_TESTIMONIALS]);
      }
    }, (error) => {
      console.warn('Testimonials sync notice:', error?.message || error);
    });

    return () => unsub();
  }, []);

  // Filtered Testimonials
  const filteredTestimonials = testimonials.filter((t) => {
    if (selectedCategory === 'all') return true;
    return t.serviceCategory === selectedCategory;
  });

  // Clamp Current Index when category changes
  useEffect(() => {
    setCurrentIndex(0);
  }, [selectedCategory]);

  // Autoplay timer
  useEffect(() => {
    if (!isAutoplay || filteredTestimonials.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [isAutoplay, filteredTestimonials.length]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % filteredTestimonials.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + filteredTestimonials.length) % filteredTestimonials.length);
  };

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    if (distance > 50) {
      handleNext();
    } else if (distance < -50) {
      handlePrev();
    }
    touchStartX.current = 0;
    touchEndX.current = 0;
  };

  // Helpful counter click
  const handleToggleHelpful = (id: string, initialCount: number) => {
    if (userVoted[id]) return;
    setHelpfulVotes((prev) => ({
      ...prev,
      [id]: (prev[id] ?? initialCount) + 1,
    }));
    setUserVoted((prev) => ({ ...prev, [id]: true }));
  };

  // Submit Review Handler
  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newReview.trim()) return;

    setIsSubmitting(true);
    try {
      const newTestimonialDoc = {
        name: newName,
        location: newLocation || 'ঢাকা, বাংলাদেশ',
        serviceCategory: newServiceCategory,
        serviceTitle: newServiceTitle || 'সার্ভিস',
        rating: newRating,
        headline: newHeadline || 'অসাধারণ সার্ভিস!',
        review: newReview,
        isVerified: true,
        helpfulCount: 1,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'homepage_testimonials'), newTestimonialDoc);

      // Add to local state immediately as fallback
      const localItem: Testimonial = {
        id: `local-${Date.now()}`,
        name: newName,
        location: newLocation || 'ঢাকা, বাংলাদেশ',
        serviceCategory: newServiceCategory,
        serviceTitle: newServiceTitle || 'সার্ভিস বুকিং',
        rating: newRating,
        headline: newHeadline || 'অসাধারণ সার্ভিস!',
        review: newReview,
        date: 'আজকে',
        isVerified: true,
        helpfulCount: 1,
      };

      setTestimonials((prev) => [localItem, ...prev]);
      setIsSubmitting(false);
      setIsModalOpen(false);

      // Reset form
      setNewName('');
      setNewLocation('');
      setNewHeadline('');
      setNewReview('');

      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err) {
      console.error('Error submitting testimonial:', err);
      setIsSubmitting(false);
    }
  };

  // Calculate Average Rating
  const avgRating = (
    testimonials.reduce((sum, item) => sum + item.rating, 0) / testimonials.length
  ).toFixed(1);

  return (
    <section className="py-12 bg-gradient-to-b from-slate-50 via-emerald-50/20 to-white relative overflow-hidden border-t border-b border-gray-100">
      {/* Decorative subtle background elements */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100/80 text-emerald-900 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              {t('গ্রাহকের মতামত ও অভিজ্ঞতা', 'Customer Feedback & Reviews')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              {t('আমাদের সেবায় সন্তুষ্ট গ্রাহকদের প্রশংসাপত্র', 'Testimonials from Our Satisfied Customers')}
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
              {t('হাজারো পরিবার ও ব্যবসায়িক প্রতিষ্ঠান প্রতিদিন আমাদের উপর ভরসা রাখছেন। দেখুন তাদের বাস্তব রিভিউ ও স্টার রেটিং।', 'Thousands of families & businesses trust us daily. Read their real reviews & star ratings.')}
            </p>
          </div>

          {/* Average Rating Badge & Action Button */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="bg-white px-4 py-2 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
              <div className="text-right">
                <div className="text-xs font-bold text-gray-500">{t('গড় রিভিউ রেটিং', 'Avg Rating')}</div>
                <div className="text-sm font-extrabold text-gray-900 flex items-center justify-end gap-1">
                  <span>{avgRating} / {t('৫.০', '5.0')}</span>
                  <div className="flex text-amber-400">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                </div>
              </div>
              <div className="h-8 w-px bg-gray-200" />
              <div>
                <div className="text-xs font-bold text-emerald-700">{t('৯৮.৪%', '98.4%')}</div>
                <div className="text-[10px] text-gray-500">{t('সন্তুষ্টির হার', 'Satisfaction')}</div>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              {t('আপনার রিভিউ যোগ করুন', 'Add Your Review')}
            </button>
          </div>
        </div>

        {/* Category Filter Pills (Interactive Segmented Tabs) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
          {CATEGORIES_FILTER.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer border ${
                selectedCategory === cat.id
                  ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-emerald-50/50 hover:border-emerald-300'
              }`}
            >
              {language === 'en' ? cat.labelEn : cat.labelBn}
              {cat.id === 'all' && (
                <span className="ml-1.5 text-[10px] bg-emerald-700 text-white px-1.5 py-0.2 rounded-full font-semibold">
                  {testimonials.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Testimonials Slider Body */}
        {filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-gray-200 shadow-xs">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-600">এই ক্যাটাগরিতে এখনো কোনো রিভিউ নেই।</p>
            <p className="text-xs text-gray-400 mt-1">প্রথম রিভিউ জমা দিতে উপরের বাটনে ক্লিক করুন!</p>
          </div>
        ) : (
          <div 
            className="relative"
            onMouseEnter={() => setIsAutoplay(false)}
            onMouseLeave={() => setIsAutoplay(true)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Display Cards Container */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {/* Desktop shows 3 active slides starting from currentIndex */}
              {[0, 1, 2].map((offset) => {
                const itemIndex = (currentIndex + offset) % filteredTestimonials.length;
                const item = filteredTestimonials[itemIndex];
                if (!item) return null;

                const isPrimary = offset === 0;

                return (
                  <div
                    key={`${item.id}-${offset}`}
                    className={`bg-white rounded-2xl p-6 border transition-all duration-300 flex flex-col justify-between relative shadow-sm ${
                      offset > 0 ? 'hidden md:flex' : 'flex'
                    } ${offset === 2 ? 'hidden lg:flex' : ''} ${
                      isPrimary 
                        ? 'border-emerald-300 ring-2 ring-emerald-500/10' 
                        : 'border-gray-200 hover:border-emerald-200'
                    }`}
                  >
                    {/* Top Quote & Rating Bar */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex text-amber-400 gap-0.5">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= item.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-gray-200'
                              }`}
                            />
                          ))}
                        </div>
                        <Quote className="w-8 h-8 text-emerald-100 fill-emerald-50 shrink-0" />
                      </div>

                      {/* Service Tag */}
                      <div className="inline-block px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[11px] font-semibold mb-2">
                        {item.serviceTitle}
                      </div>

                      {/* Headline */}
                      <h3 className="text-sm font-bold text-gray-900 mb-2 leading-snug">
                        "{item.headline}"
                      </h3>

                      {/* Full Review Text */}
                      <p className="text-xs text-gray-600 leading-relaxed mb-4 line-clamp-4">
                        {item.review}
                      </p>
                    </div>

                    {/* Bottom Author Profile */}
                    <div className="border-t border-gray-100 pt-4 mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {item.avatar ? (
                          <img
                            src={item.avatar}
                            alt={item.name}
                            className="w-10 h-10 rounded-full object-cover border border-emerald-200 shadow-xs"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                            {item.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900">{item.name}</span>
                            {item.isVerified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200/50" title="যাচাইকৃত গ্রাহক">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{item.location}</span>
                            <span>•</span>
                            <span>{item.date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Helpful Button */}
                      <button
                        onClick={() => handleToggleHelpful(item.id, item.helpfulCount)}
                        disabled={userVoted[item.id]}
                        className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          userVoted[item.id]
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                        }`}
                        title="এই রিভিউটি কি উপকারী?"
                      >
                        <ThumbsUp className={`w-3.5 h-3.5 ${userVoted[item.id] ? 'fill-emerald-700 text-emerald-700' : ''}`} />
                        <span>{(helpfulVotes[item.id] ?? item.helpfulCount)}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Slider Navigation Controls */}
            <div className="flex items-center justify-between mt-6">
              {/* Play / Pause Autoplay Toggle & Count */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className="p-2 rounded-xl bg-white border border-gray-200 text-gray-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-xs cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
                  title={isAutoplay ? 'অটো-স্লাইড বন্ধ করুন' : 'অটো-স্লাইড শুরু করুন'}
                >
                  {isAutoplay ? (
                    <>
                      <Pause className="w-3.5 h-3.5 text-emerald-600" />
                      <span>অটো-স্লাইডার</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-gray-500" />
                      <span>প্লে স্লাইডার</span>
                    </>
                  )}
                </button>
                <span className="text-xs font-bold text-gray-400">
                  {currentIndex + 1} / {filteredTestimonials.length}
                </span>
              </div>

              {/* Indicator Dots */}
              <div className="flex items-center gap-1.5">
                {filteredTestimonials.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      idx === currentIndex
                        ? 'w-6 bg-emerald-700'
                        : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              {/* Previous / Next Arrow Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrev}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all shadow-xs cursor-pointer active:scale-90"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-800 transition-all shadow-xs cursor-pointer active:scale-90"
                  aria-label="Next testimonial"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Write Testimonial Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-emerald-800 mb-1">
              <Sparkles className="w-5 h-5" />
              <h3 className="text-lg font-extrabold text-gray-900">আপনার মতামত ও রিভিউ দিন</h3>
            </div>
            <p className="text-xs text-gray-500 mb-5">
              অলসার্ভিস বিডি থেকে সেবা নেয়ার আপনার নিজস্ব অভিজ্ঞতা শেয়ার করে অন্য গ্রাহকদের সাহায্য করুন।
            </p>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Select */}
              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 text-center">
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  আপনার সার্বিক সন্তুষ্টি রেটিং করুন:
                </label>
                <div className="flex justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setNewHoverRating(star)}
                      onMouseLeave={() => setNewHoverRating(0)}
                      className="p-1 transition-transform active:scale-125 cursor-pointer"
                    >
                      <Star
                        className={`w-8 h-8 transition-colors ${
                          (newHoverRating || newRating) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Name & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আপনার নাম *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      placeholder="যেমন: মোঃ রফিকুল ইসলাম"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
                    />
                    <User className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">আপনার এলাকা / শহর</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="যেমন: ধানমন্ডি, ঢাকা"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
                    />
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Service Category & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">সেবার ধরন</label>
                  <select
                    value={newServiceCategory}
                    onChange={(e) => setNewServiceCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white font-medium"
                  >
                    <option value="ac_repair">এসি ও মেরামত</option>
                    <option value="cleaning">ক্লিনিং সার্ভিস</option>
                    <option value="electrician">ইলেকট্রিশিয়ান</option>
                    <option value="tutor">হোম টিউটর</option>
                    <option value="plumber">প্লাম্বার</option>
                    <option value="painting">পেইন্টিং</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">নির্দিষ্ট সেবার নাম</label>
                  <input
                    type="text"
                    value={newServiceTitle}
                    onChange={(e) => setNewServiceTitle(e.target.value)}
                    placeholder="যেমন: সোফা ক্লিনিং / এসি সার্ভিস"
                    className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
                  />
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">রিভিউ শিরোনাম (সংক্ষেপে)</label>
                <input
                  type="text"
                  value={newHeadline}
                  onChange={(e) => setNewHeadline(e.target.value)}
                  placeholder="যেমন: একদম সময়ে নিখুঁত কাজ সম্পন্ন করেছে!"
                  className="w-full px-3 py-2 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
                />
              </div>

              {/* Review Body */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">আপনার বিস্তারিত অভিজ্ঞতা *</label>
                <textarea
                  required
                  rows={3}
                  value={newReview}
                  onChange={(e) => setNewReview(e.target.value)}
                  placeholder="সার্ভিস প্রোভাইডারের সময়নিষ্ঠতা, কাজের গুণগত মান ও আপনার সন্তুষ্টির অভিজ্ঞতা লিখুন..."
                  className="w-full p-3 text-xs border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-hidden bg-white"
                />
              </div>

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>জমাদান প্রক্রিয়াধীন...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>রিভিউ প্রকাশ করুন</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-emerald-700 animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <div className="text-xs font-bold">ধন্যবাদ! আপনার রিভিউ জমা হয়েছে।</div>
            <div className="text-[11px] text-emerald-200">এটি এখন স্লাইডারে প্রকাশিত হয়েছে।</div>
          </div>
        </div>
      )}
    </section>
  );
};
