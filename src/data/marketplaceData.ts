export interface ServiceCategory {
  id: string;
  name: string;
  englishName: string;
  icon: string;
  providerCount: string;
  subtext: string;
  color: string;
}

export interface ServiceItem {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  badge?: string;
  rating: number;
  reviewCount: number;
  description: string;
  startingPrice: number;
  priceUnit: string;
  duration: string;
  features: string[];
  image: string;
}

export interface ProductItem {
  id: string;
  title: string;
  englishTitle: string;
  category: string;
  price: number;
  originalPrice: number;
  discountBadge?: string;
  rating: number;
  reviewCount: number;
  image: string;
  inStock: boolean;
  warranty: string;
  description: string;
  specs: string[];
}

// Helper to get data from localStorage or fallback
const getInitialData = <T>(key: string, fallback: T): T => {
  if (typeof window === 'undefined') return fallback;
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const DEFAULT_CATEGORIES: ServiceCategory[] = [
  {
    id: 'electrician',
    name: 'ইলেকট্রিশিয়ান',
    englishName: 'Electrician',
    icon: 'Zap',
    providerCount: '১,২০০+ এক্সপার্ট',
    subtext: 'শর্ট সার্কিট, ওয়্যারিং ও সুইচ ফিক্স',
    color: 'emerald',
  },
  {
    id: 'plumber',
    name: 'প্লাম্বার',
    englishName: 'Plumber',
    icon: 'Wrench',
    providerCount: '৮৫০+ এক্সপার্ট',
    subtext: 'পাইপ লিক, ট্যাপ ও বাথরুম ফিটিংস',
    color: 'emerald',
  },
  {
    id: 'cleaning',
    name: 'ক্লিনিং',
    englishName: 'Cleaning',
    icon: 'Sparkles',
    providerCount: '১,৫০০+ ক্লিনার',
    subtext: 'বাসা, অফিস ও সোফা ডিপ ক্লিনিং',
    color: 'emerald',
  },
  {
    id: 'tutor',
    name: 'টিউটর',
    englishName: 'Tutor',
    icon: 'GraduationCap',
    providerCount: '৩,২০০+ শিক্ষক',
    subtext: 'স্কুল, কলেজ ও বিশেষ বিষয় টিউটরিং',
    color: 'emerald',
  },
  {
    id: 'ac_repair',
    name: 'এসি ও মেরামত',
    englishName: 'AC & Repair',
    icon: 'Wind',
    providerCount: '৯৫০+ টেকনিশিয়ান',
    subtext: 'এসি ইনস্টল, সার্ভিসিং ও গ্যাস চার্জ',
    color: 'emerald',
  },
  {
    id: 'beauty',
    name: 'বিউটি ও স্পা',
    englishName: 'Beauty & Spa',
    icon: 'HeartHandshake',
    providerCount: '৪০০+ এক্সপার্ট',
    subtext: 'মহিলাদের হোম পার্লার ও ফেসিয়াল',
    color: 'emerald',
  },
  {
    id: 'home_service',
    name: 'হোম সার্ভিস',
    englishName: 'Home Service',
    icon: 'Home',
    providerCount: '৭৫০+ কর্মী',
    subtext: 'বাসা শিফটিং, রং ও হ্যান্ডিম্যান',
    color: 'emerald',
  },
  {
    id: 'painting',
    name: 'পেইন্টিং',
    englishName: 'Painting',
    icon: 'Paintbrush',
    providerCount: '৫২০+ পেইন্টার',
    subtext: 'ওয়াল পেইন্ট, পুটিং ও ড্যাম সলিউশন',
    color: 'emerald',
  },
];

const DEFAULT_POPULAR_SERVICES: ServiceItem[] = [
  {
    id: 'srv-cleaning-1',
    title: 'হোম ক্লিনিং সার্ভিস',
    category: 'ক্লিনিং',
    categoryId: 'cleaning',
    badge: 'জনপ্রিয়',
    rating: 4.8,
    reviewCount: 1240,
    description: 'ঘরবাড়ি পরিষ্কার, গভীর ক্লিনিং ও জীবাণুমুক্তকরণ',
    startingPrice: 500,
    priceUnit: 'থেকে শুরু',
    duration: '২-৪ ঘণ্টা',
    features: [
      'উন্নত মানের জীবাণুনাশক কেমিক্যাল',
      'ফ্লোর, কিচেন ও বাথরুম ডিপ ক্লিনিং',
      'প্রশিক্ষিত ও ব্যাকগ্রাউন্ড ভেরিফাইড ক্লিনার',
    ],
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'srv-ac-1',
    title: 'এসি সার্ভিসিং ও মেরামত',
    category: 'এসি ও মেরামত',
    categoryId: 'ac_repair',
    badge: 'শীর্ষ রেটেড',
    rating: 4.9,
    reviewCount: 980,
    description: 'এসি ইনস্টল, ওয়াটার জেট সার্ভিস ও গ্যাস রিফিল',
    startingPrice: 1499,
    priceUnit: 'বুক করুন',
    duration: '১-২ ঘণ্টা',
    features: [
      'উচ্চচাপ ওয়াটার জেট দিয়ে ইনডোর ও আউটডোর ক্লিন',
      'গ্যাস প্রেসার ও কুলিং এফিসিয়েন্সি চেক',
      '৩০ দিনের কাজের সার্ভিস গ্যারান্টি',
    ],
    image: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'srv-plumb-1',
    title: 'প্লাম্বিং সার্ভিস',
    category: 'প্লাম্বার',
    categoryId: 'plumber',
    badge: 'জরুরি সেবা',
    rating: 4.7,
    reviewCount: 850,
    description: 'পাইপ লিক, ট্যাপ মেরামত ও বাথরুম ফিটিংস',
    startingPrice: 400,
    priceUnit: 'থেকে শুরু',
    duration: '৩০-৬০ মিনিট',
    features: [
      'দ্রুত জরুরি সার্ভিস (৩০ মিনিটের মধ্যে কলব্যাক)',
      'ট্যাপ, কমোড ও বেসিন পাইপ লিক রিপেয়ার',
      'নিখুঁত ও দীর্ঘস্থায়ী প্লাম্বিং সমাধান',
    ],
    image: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'srv-elec-1',
    title: 'ইলেকট্রিশিয়ান সার্ভিস',
    category: 'ইলেকট্রিশিয়ান',
    categoryId: 'electrician',
    badge: 'দ্রুত সেবা',
    rating: 4.8,
    reviewCount: 1100,
    description: 'শর্ট সার্কিট মেরামত, ফ্যান ফিটিং ও নতুন ওয়্যারিং',
    startingPrice: 350,
    priceUnit: 'থেকে শুরু',
    duration: '৪৫-৯০ মিনিট',
    features: [
      'দক্ষ ও সনদপ্রাপ্ত ইলেকট্রিক্যাল টেকনিশিয়ান',
      'সার্কিট ব্রেকার, ডিবি বক্স ও সুইচ বোর্ড কাজ',
      'শতভাগ সুরক্ষা টেস্ট ও মিটারিং চেক',
    ],
    image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'srv-tutor-1',
    title: 'অভিজ্ঞ হোম ও অনলাইন টিউটর',
    category: 'টিউটর',
    categoryId: 'tutor',
    badge: 'যাচাইকৃত শিক্ষক',
    rating: 4.9,
    reviewCount: 640,
    description: 'গণিত, বিজ্ঞান, ইংরেজি ও বাংলা বিশেষ টিউটর',
    startingPrice: 3500,
    priceUnit: '/ মাস থেকে',
    duration: 'সপ্তাহে ৩/৪ দিন',
    features: [
      'বুয়েট, ঢাবি, মেডিকেল ও শীর্ষ বিশ্ববিদ্যালয়ের শিক্ষক',
      '২ দিনের ফ্রি ট্রায়াল / ডেমো ক্লাস সুবিধা',
      'নিয়মিত অগ্রগতি ট্র্যাকিং ও প্র্যাকটিস টেস্ট',
    ],
    image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'srv-paint-1',
    title: 'পেশাদার হোম পেইন্টিং',
    category: 'পেইন্টিং',
    categoryId: 'painting',
    badge: 'প্রিমিয়াম ফিনিশ',
    rating: 4.7,
    reviewCount: 430,
    description: 'ওয়াল পেইন্ট, পুটিং ও অ্যান্টি-ড্যাম্প সমাধান',
    startingPrice: 2400,
    priceUnit: 'রুম প্রতি শুরু',
    duration: '১-৩ দিন',
    features: [
      'ব্র্যান্ডেড প্রিমিয়াম কালার কোট ও পুটিং',
      'ফার্নিচার ও মেঝের পূর্ণ সুরক্ষা প্লাস্টিক কভার',
      'কাজ শেষে সম্পূর্ণ ক্লিন-আপ সার্ভিস অন্তর্ভুক্ত',
    ],
    image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=700&q=80',
  },
];

const DEFAULT_POPULAR_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-drill-1',
    title: 'কর্ডলেস পাওয়ার ড্রিল 12V',
    englishTitle: 'Cordless Power Drill 12V',
    category: 'টুলস ও হার্ডওয়্যার',
    price: 2499,
    originalPrice: 3100,
    discountBadge: '২০% ছাড়',
    rating: 4.6,
    reviewCount: 320,
    image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: '১ বছর অফিসিয়াল ওয়ারেন্টি',
    description: 'রিচার্জেবল লিথিয়াম ব্যাটারি, ডুয়েল স্পিড এবং ১৮+১ টর্ক অ্যাডজাস্টমেন্ট সহ বাসা ও ওয়ার্কশপের আদর্শ ড্রিল মেশিন।',
    specs: ['ভোল্টেজ: 12V Li-ion', 'স্পিড: 0-400 / 0-1400 RPM', 'ম্যাক্স ড্রিল ক্যাপাসিটি: কাঠ ২০মিমি, লোহা ১০মিমি', 'সাথে পাচ্ছেন: ২টি ব্যাটারি ও চার্জার কিট'],
  },
  {
    id: 'prod-fan-1',
    title: 'সিলিং ফ্যান ৫৬ ইঞ্চি (হেভি ডিউটি)',
    englishTitle: 'Ceiling Fan 56 Inch',
    category: 'ইলেকট্রিক্যাল',
    price: 1899,
    originalPrice: 2200,
    discountBadge: '১৪% ছাড়',
    rating: 4.5,
    reviewCount: 450,
    image: 'https://images.unsplash.com/photo-1595475207225-428b62bda831?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: '২ বছর গ্যারান্টি',
    description: '১০০% পিউর কপার মোটর, বিদ্যুৎ সাশ্রয়ী অ্যারোডাইনামিক ব্লেড যা দেয় ঘরজুড়ে শীতল ও শক্তিশালী বাতাসের প্রবাহ।',
    specs: ['সাইজ: ৫৬ ইঞ্চি (১৪০০ মিমি)', 'পাওয়ার কনজাম্পশন: ৭০ ওয়াট', 'মোটর ওয়াইন্ডিং: ১০০% সুপার এনামেলড কপার', 'নয়েজলেস স্মুথ অপারেশন'],
  },
  {
    id: 'prod-filter-1',
    title: 'পানি ফিল্টার ৭ স্টেজ RO পিউরিফায়ার',
    englishTitle: 'Water Filter 7 Stage RO',
    category: 'ওয়াটার পিউরিফায়ার',
    price: 5500,
    originalPrice: 6800,
    discountBadge: '১৯% ছাড়',
    rating: 4.8,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1542013936693-884638332954?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: '২ বছর ফ্রি পার্টস ও সার্ভিসিং',
    description: 'আমেরিকান RO মেমব্রেন প্রযুক্তি যা দূর করে ৯৯.৯% আর্সেনিক, ব্যাকটেরিয়া ও দুর্গন্ধ। সুপেয় নিরাপদ পানির সেরা সমাধান।',
    specs: ['ফিল্ট্রেশন ক্যাপাসিটি: ৭৫ গ্যালন / দিন', 'স্টোরেজ ট্যাঙ্ক: ৩.২ গ্যালন প্রেশার ট্যাঙ্ক', 'মিনারেল প্লাস ইউভি প্রোটেকশন', 'অটোমেটিক অন-অফ সেন্সর'],
  },
  {
    id: 'prod-bulb-1',
    title: 'LED বাল্ব 9W প্রিমিয়াম প্যাক (৪টি)',
    englishTitle: 'LED Bulb 9W Pack of 4',
    category: 'ইলেকট্রিক্যাল',
    price: 350,
    originalPrice: 450,
    discountBadge: '২২% ছাড়',
    rating: 4.4,
    reviewCount: 780,
    image: 'https://images.unsplash.com/photo-1550985616-10810253b84d?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: '১ বছর ডিরেক্ট রিপ্লেসমেন্ট',
    description: 'চোখের জন্য আরামদায়ক ফ্লিকার-ফ্রি ডে-লাইট আলো। সাধারণ বাল্বের চেয়ে ৮৫% কম বিদ্যুৎ খরচ।',
    specs: ['ওয়াট: 9 Watt (প্রতিটি)', 'বেস টাইপ: B22 / E27', 'লুমেন: 850lm', 'লাইফস্প্যান: ২৫,০০০+ ঘণ্টা'],
  },
  {
    id: 'prod-pipe-1',
    title: 'পাইপ ও স্যানিটারি ফিটিংস কম্বো সেট',
    englishTitle: 'Pipe & Sanitary Fittings Set',
    category: 'প্লাম্বিং',
    price: 480,
    originalPrice: 550,
    discountBadge: '১২% ছাড়',
    rating: 4.6,
    reviewCount: 140,
    image: 'https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: 'উচ্চ স্থায়িত্ব ও লিক-প্রুফ',
    description: 'বাথরুম ও রান্নাঘরের পাইপ ফিটিংসের সম্পূর্ণ প্যাকেজ। মরিচা ও প্রেশার প্রতিরোধী দীর্ঘস্থায়ী কোয়ালিটি।',
    specs: ['উপাদান: প্রিমিয়াম পিভিসি ও ব্রাস থ্রেড', 'প্যাকেজে আছে: এলবো, টি, সকেট ও টেফলন টেপ (১৫ পিস)', 'সাইজ: স্ট্যান্ডার্ড ১/২" ও ৩/৪"'],
  },
  {
    id: 'prod-tool-1',
    title: 'প্রফেশনাল হার্ডওয়্যার টুলবক্স (৩৬ ইন ১)',
    englishTitle: 'Professional Hardware Toolbox',
    category: 'টুলস ও হার্ডওয়্যার',
    price: 950,
    originalPrice: 1200,
    discountBadge: '২১% ছাড়',
    rating: 4.7,
    reviewCount: 195,
    image: 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=700&q=80',
    inStock: true,
    warranty: 'ক্রোম ভ্যানাডিয়াম অ্যান্টি-রাস্ট',
    description: 'যেকোনো হোম রিপেয়ার, কার বা বাইক কাজের জন্য প্রয়োজনীয় রেঞ্চ, প্লায়ার্স, স্ক্রু-ড্রাইভার ও মেজারিং টেপ।',
    specs: ['উপাদান: CR-V অ্যালয় স্টিল', 'আইটেম সংখ্যা: ৩৬ পিস কম্বিনেশন', 'কমপ্যাক্ট ট্রাভেল হ্যান্ডেল বক্স'],
  },
];

export const CATEGORIES: ServiceCategory[] = getInitialData('allservice_categories', DEFAULT_CATEGORIES);
export const POPULAR_SERVICES: ServiceItem[] = getInitialData('allservice_popular_services', DEFAULT_POPULAR_SERVICES);
export const POPULAR_PRODUCTS: ProductItem[] = getInitialData('allservice_popular_products', DEFAULT_POPULAR_PRODUCTS);

export const BANGLADESH_DISTRICTS = [
  'ঢাকা (Dhaka)',
  'চট্টগ্রাম (Chittagong)',
  'সিলেট (Sylhet)',
  'রাজশাহী (Rajshahi)',
  'খুলনা (Khulna)',
  'বরিশাল (Barishal)',
  'রংপুর (Rangpur)',
  'ময়মনসিংহ (Mymensingh)',
  'গাজীপুর (Gazipur)',
  'নারায়ণগঞ্জ (Narayanganj)',
  'কুমিল্লা (Cumilla)',
  'বগুড়া (Bogura)',
];

export const DHAKA_AREAS = [
  'মিরপুর (Mirpur)',
  'উত্তরা (Uttara)',
  'ধানমন্ডি (Dhanmondi)',
  'গুলশান (Gulshan)',
  'বনানী (Banani)',
  'মোহাম্মদপুর (Mohammadpur)',
  'বাড্ডা (Badda)',
  'মতিঝিল (Motijheel)',
  'পুরান ঢাকা (Old Dhaka)',
  'খিলগাঁও (Khilgaon)',
  'যাত্রাবাড়ী (Jatrabari)',
  'বসুন্ধরা (Bashundhara R/A)',
];

export const TIME_SLOTS = [
  'সকাল ৯:০০ - দুপুর ১২:০০',
  'দুপুর ১২:০০ - বিকাল ৩:০০',
  'বিকাল ৩:০০ - সন্ধ্যা ৬:০০',
  'সন্ধ্যা ৬:০০ - রাত ৯:০০',
];
