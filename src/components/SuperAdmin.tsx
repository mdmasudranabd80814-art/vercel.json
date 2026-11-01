import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShieldCheck, 
  LayoutGrid, 
  Paintbrush, 
  Truck, 
  Wrench, 
  Zap, 
  Snowflake, 
  GraduationCap, 
  Sparkles, 
  Users, 
  UserX,
  UserCheck,
  Building2, 
  CreditCard, 
  Calendar, 
  BarChart3, 
  Server, 
  Palette, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  Search, 
  Plus, 
  Pencil, 
  Eye, 
  Shield, 
  Trash2, 
  RefreshCw, 
  Sun, 
  Moon, 
  CheckCircle, 
  MoreHorizontal, 
  ChevronDown, 
  TrendingUp, 
  UserPlus, 
  ArrowRight, 
  Filter, 
  Power,
  Layers,
  Phone,
  Percent,
  Mail,
  MapPin,
  Lock,
  Unlock,
  Layout,
  User,
  Globe,
  PhoneCall,
  Save,
  AlertTriangle,
  Clock,
  Briefcase,
  Tag,
  ShoppingBag,
  ListFilter,
  Megaphone,
  Database,
  Terminal,
  Activity,
  History,
  HardDrive,
  Download
} from 'lucide-react';
import { 
  CATEGORIES as DEFAULT_CATEGORIES, 
  POPULAR_SERVICES as DEFAULT_SERVICES, 
  POPULAR_PRODUCTS as DEFAULT_PRODUCTS,
  ServiceCategory,
  ServiceItem,
  ProductItem
} from '../data/marketplaceData';
import { doc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';
import { DynamicHomepageContent } from '../App';
import { AdminNotificationManager } from './AdminNotificationManager';

export interface HomepageFullConfig {
  heroBadge: string;
  promoCode: string;
  heroHeadline: string;
  heroSubtitle: string;
  footerAbout: string;
  hotline: string;
  hotlineHours: string;
  whatsapp: string;
  email: string;
  officeAddress: string;
  mapLink: string;
  footerCoverage: string;
}

export interface PaymentMethodItem {
  enabled: boolean;
  number: string;
  type: string;
}

export interface PaymentConfig {
  bkash: PaymentMethodItem;
  nagad: PaymentMethodItem;
  rocket: PaymentMethodItem;
  cod: { enabled: boolean };
}

export interface EmployeeRow {
  id: string;
  name: string;
  email: string;
  initials: string;
  badgeBg: string;
  department: string;
  role: string;
  status: 'Active' | 'On Leave' | 'Inactive';
  joined: string;
}

export interface ServiceItemAdmin {
  id: string;
  name: string;
  banglaName: string;
  category: string;
  price: string;
  enabled: boolean;
  rating: number;
  ordersCount: number;
  leadTime: string;
}

export interface AppUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  area: string;
  joined: string;
  ordersCount: number;
}

// Exactly 19 Employees across the 9 service departments
const INITIAL_EMPLOYEES: EmployeeRow[] = [
  // IT (3)
  { id: 'EMP-1024', name: 'Ahsan Rahman', email: 'ahsan.r@allservicebd.com', initials: 'AR', badgeBg: 'bg-emerald-700 text-white', department: 'IT', role: 'Full Stack & Cloud Engineer', status: 'Active', joined: '12 Jan 2023' },
  { id: 'EMP-1025', name: 'Sadia Farin', email: 'sadia.f@allservicebd.com', initials: 'SF', badgeBg: 'bg-emerald-800 text-white', department: 'IT', role: 'Systems Security Lead', status: 'Active', joined: '05 Mar 2023' },
  { id: 'EMP-1046', name: 'Mehedi Hasan', email: 'mehedi.h@allservicebd.com', initials: 'MH', badgeBg: 'bg-indigo-700 text-white', department: 'IT', role: 'Network & Hardware Admin', status: 'Active', joined: '15 Sep 2023' },
  // Cleaning (2)
  { id: 'EMP-1031', name: 'Rina Begum', email: 'rina.b@allservicebd.com', initials: 'RB', badgeBg: 'bg-teal-700 text-white', department: 'Cleaning', role: 'Senior Deep Cleaner', status: 'Active', joined: '14 Feb 2023' },
  { id: 'EMP-1032', name: 'Mizanur Rahman', email: 'mizan.r@allservicebd.com', initials: 'MR', badgeBg: 'bg-cyan-700 text-white', department: 'Cleaning', role: 'Commercial Cleaning Specialist', status: 'Active', joined: '02 Jun 2023' },
  // Delivery (2)
  { id: 'EMP-1033', name: 'Sohel Rana', email: 'sohel.r@allservicebd.com', initials: 'SR', badgeBg: 'bg-amber-700 text-white', department: 'Delivery', role: 'Express Delivery Rider', status: 'Active', joined: '10 Aug 2023' },
  { id: 'EMP-1034', name: 'Kamal Hossain', email: 'kamal.h@allservicebd.com', initials: 'KH', badgeBg: 'bg-orange-700 text-white', department: 'Delivery', role: 'Fleet Logistics Lead', status: 'Active', joined: '19 Oct 2023' },
  // Plumbing (2)
  { id: 'EMP-1035', name: 'Manik Mia', email: 'manik.m@allservicebd.com', initials: 'MM', badgeBg: 'bg-blue-700 text-white', department: 'Plumbing', role: 'Master Plumber', status: 'Active', joined: '04 Apr 2023' },
  { id: 'EMP-1036', name: 'Jahangir Alam', email: 'jahangir.a@allservicebd.com', initials: 'JA', badgeBg: 'bg-sky-700 text-white', department: 'Plumbing', role: 'Sanitary Specialist', status: 'On Leave', joined: '18 Nov 2023' },
  // Electrical (2)
  { id: 'EMP-1028', name: 'Tanvir Hossain', email: 'tanvir.h@allservicebd.com', initials: 'TH', badgeBg: 'bg-emerald-600 text-white', department: 'Electrical', role: 'Lead Electrician', status: 'Active', joined: '01 Feb 2024' },
  { id: 'EMP-1037', name: 'Faruk Ahmed', email: 'faruk.a@allservicebd.com', initials: 'FA', badgeBg: 'bg-yellow-700 text-white', department: 'Electrical', role: 'Industrial Wiring Tech', status: 'Active', joined: '12 Dec 2023' },
  // AC Repair (2)
  { id: 'EMP-1038', name: 'Ahsan Habib', email: 'ahsan.h@allservicebd.com', initials: 'AH', badgeBg: 'bg-blue-800 text-white', department: 'AC Repair', role: 'HVAC Certified Tech', status: 'Active', joined: '07 Mar 2023' },
  { id: 'EMP-1039', name: 'Shahin Alam', email: 'shahin.a@allservicebd.com', initials: 'SA', badgeBg: 'bg-cyan-800 text-white', department: 'AC Repair', role: 'Inverter AC Specialist', status: 'Active', joined: '25 May 2023' },
  // Home Shifting (2)
  { id: 'EMP-1040', name: 'Abul Kalam', email: 'abul.k@allservicebd.com', initials: 'AK', badgeBg: 'bg-stone-700 text-white', department: 'Home Shifting', role: 'Relocation Supervisor', status: 'Active', joined: '11 Jan 2024' },
  { id: 'EMP-1041', name: 'Rubel Sikder', email: 'rubel.s@allservicebd.com', initials: 'RS', badgeBg: 'bg-zinc-700 text-white', department: 'Home Shifting', role: 'Heavy Lifting Lead', status: 'Active', joined: '09 Feb 2024' },
  // Tutor (2)
  { id: 'EMP-1042', name: 'Fahmida Sultana', email: 'fahmida.s@allservicebd.com', initials: 'FS', badgeBg: 'bg-violet-700 text-white', department: 'Tutor', role: 'Senior Science Tutor', status: 'Active', joined: '22 Apr 2023' },
  { id: 'EMP-1043', name: 'Asif Mahmud', email: 'asif.m@allservicebd.com', initials: 'AM', badgeBg: 'bg-purple-700 text-white', department: 'Tutor', role: 'English Language Specialist', status: 'Active', joined: '05 Jul 2023' },
  // Beauty (2)
  { id: 'EMP-1044', name: 'Sumaiya Akter', email: 'sumaiya.a@allservicebd.com', initials: 'SA', badgeBg: 'bg-pink-700 text-white', department: 'Beauty', role: 'Lead Makeup Artist', status: 'Active', joined: '30 Aug 2023' },
  { id: 'EMP-1045', name: 'Nadia Islam', email: 'nadia.i@allservicebd.com', initials: 'NI', badgeBg: 'bg-rose-700 text-white', department: 'Beauty', role: 'Hair & Spa Specialist', status: 'Active', joined: '14 Oct 2023' }
];

// Initial 12 Services (11 ON, 1 OFF by default)
const INITIAL_SERVICES: ServiceItemAdmin[] = [
  { id: 'srv-1', name: 'Master Electrical Repair', banglaName: 'মাস্টার ইলেকট্রিক্যাল মেরামত', category: 'Electrical', price: '৳৪৫০', enabled: true, rating: 4.9, ordersCount: 420, leadTime: '৩০ মিনিট' },
  { id: 'srv-2', name: 'AC Master Servicing & Jet Wash', banglaName: 'এসি জেট ওয়াশ ও গ্যাস রিফিল', category: 'AC Repair', price: '৳১৪৯৯', enabled: true, rating: 4.9, ordersCount: 890, leadTime: '১ ঘন্টা' },
  { id: 'srv-3', name: 'Emergency Plumbing & Leak Fix', banglaName: 'জরুরি পাইপ ও বেসিন মেরামত', category: 'Plumbing', price: '৳৫০০', enabled: true, rating: 4.8, ordersCount: 340, leadTime: '৪৫ মিনিট' },
  { id: 'srv-4', name: 'Home Deep Cleaning Service', banglaName: 'বাসা-বাড়ি ও অফিস ডিপ ক্লিনিং', category: 'Cleaning', price: '৳১৯৯৯', enabled: true, rating: 4.9, ordersCount: 650, leadTime: '২ ঘন্টা' },
  { id: 'srv-5', name: 'Express Parcel Delivery (Dhaka)', banglaName: 'ঢাকা শহরের দ্রুত পার্সেল ডেলিভারি', category: 'Delivery', price: '৳১০০', enabled: true, rating: 4.8, ordersCount: 1250, leadTime: '২ ঘন্টা' },
  { id: 'srv-6', name: 'Complete Home Shifting with Truck', banglaName: 'নিরাপদ বাসা বদল ও ট্রাকে শিফটিং', category: 'Home Shifting', price: '৳৪৫০০', enabled: true, rating: 4.9, ordersCount: 290, leadTime: 'পূর্বনির্ধারিত' },
  { id: 'srv-7', name: 'Home Tutor (Class 1-12 & SSC)', banglaName: 'অভিজ্ঞ হোম ও অনলাইন টিউটর', category: 'Tutor', price: '৳৩৫০০/মাস', enabled: true, rating: 5.0, ordersCount: 380, leadTime: '১ দিন' },
  { id: 'srv-8', name: 'Bridal Makeup & Home Spa', banglaName: 'ব্রাইডাল মেকআপ ও স্কিন কেয়ার স্পা', category: 'Beauty', price: '৳২৫০০', enabled: true, rating: 4.9, ordersCount: 520, leadTime: '১ ঘন্টা' },
  { id: 'srv-9', name: 'Computer & Wi-Fi Network Setup', banglaName: 'কম্পিউটার ও ওয়াইফাই নেটওয়ার্কিং', category: 'IT', price: '৳৮০০', enabled: true, rating: 4.8, ordersCount: 310, leadTime: '৪৫ মিনিট' },
  { id: 'srv-10', name: 'Ceiling Fan & Switch Repair', banglaName: 'সিলিং ফ্যান ও সুইচ বোর্ড সার্ভিস', category: 'Electrical', price: '৳৩৫০', enabled: true, rating: 4.7, ordersCount: 510, leadTime: '৩০ মিনিট' },
  { id: 'srv-11', name: 'Kitchen & Bathroom Sanitization', banglaName: 'কিচেন ও বাথরুম জীবাণুনাশক ওয়াশ', category: 'Cleaning', price: '৳১২০০', enabled: false, rating: 4.8, ordersCount: 220, leadTime: '১ ঘন্টা' },
  { id: 'srv-12', name: 'Gas Line & Stove Repair', banglaName: 'গ্যাস লাইন ও চুলা লিকেজ ফিক্সিং', category: 'Plumbing', price: '৳৬০০', enabled: true, rating: 4.8, ordersCount: 180, leadTime: '৪৫ মিনিট' },
];

// Sample App Users for User Control
const INITIAL_USERS: AppUser[] = [];

const DEFAULT_HOMEPAGE_CONFIG: HomepageFullConfig = {
  heroBadge: 'প্রথম সেবায় ২০% ছাড়',
  promoCode: 'ALL20',
  heroHeadline: 'আপনার সব সেবা, এক জায়গায়',
  heroSubtitle: 'হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয় • ১০০০+ বিশ্বস্ত সার্ভিস প্রোভাইডার • ২৪/৭ সাপোর্ট • নিরাপদ ও নির্ভরযোগ্য',
  footerAbout: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় ইলেকট্রিক্যাল, প্লাম্বিং, ডিপ ক্লিনিং, এসি মেরামত এবং হোম টিউটর সার্ভিস খুব সহজেই বুক করুন।',
  hotline: '০৯৬১২-০০০০০০',
  hotlineHours: 'সকাল ৮টা - রাত ১১টা',
  whatsapp: '+8801712345678',
  email: 'support@allservicebd.com',
  officeAddress: 'লেভেল-৫, মিরপুর ডিওএইচএস, ঢাকা-১২১৬',
  mapLink: 'https://maps.google.com/?q=Mirpur+DOHS+Dhaka',
  footerCoverage: 'ঢাকা, চট্টগ্রাম, সিলেট সহ বাংলাদেশের ৬৪টি জেলা জুড়ে।',
};

const DEFAULT_PAYMENT_CONFIG: PaymentConfig = {
  bkash: { enabled: true, number: '01812-345678', type: 'Merchant' },
  nagad: { enabled: true, number: '01711-223344', type: 'Merchant' },
  rocket: { enabled: true, number: '01912-887766', type: 'Personal' },
  cod: { enabled: true },
};

export interface BookingRecord {
  id: string;
  type: 'Service' | 'Product';
  itemName: string;
  customerName: string;
  customerPhone: string;
  amount: number;
  status: 'Pending' | 'Accepted' | 'On Way' | 'Working' | 'Completed' | 'Cancelled';
  date: string;
  time?: string;
  area: string;
}

const INITIAL_BOOKINGS: BookingRecord[] = [];

export interface SeoConfig {
  siteTitle: string;
  siteDescription: string;
  keywords: string;
  metaTags: string;
}

const DEFAULT_SEO_CONFIG: SeoConfig = {
  siteTitle: 'All Service BD - সব সেবা এক জায়গায়',
  siteDescription: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় সেবা বুক করুন।',
  keywords: 'service, dhaka, bangladesh, repair, cleaning, tutor',
  metaTags: '<meta name="robots" content="index, follow">',
};

export default function SuperAdmin({ onLogout, onChangePassword }: { onLogout?: () => void; onChangePassword?: (newPass: string) => void } = {}) {
  // 1. Sidebar Categories Accordion State
  const [categoriesOpen, setCategoriesOpen] = useState<boolean>(true);

  // 2. Active Menu State (Dashboard, Categories, or Management menus)
  const [activeMenu, setActiveMenu] = useState<string>(() => {
    return localStorage.getItem('admin_active_menu') || 'Dashboard';
  });

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User Dropdown in top header right side
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  // Home Page Control & Payment Configurations
  const [homepageConfig, setHomepageConfig] = useState<HomepageFullConfig>(() => {
    try {
      const saved = localStorage.getItem('homepage_full_config');
      return saved ? { ...DEFAULT_HOMEPAGE_CONFIG, ...JSON.parse(saved) } : DEFAULT_HOMEPAGE_CONFIG;
    } catch {
      return DEFAULT_HOMEPAGE_CONFIG;
    }
  });

  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(() => {
    try {
      const saved = localStorage.getItem('payment_config');
      return saved ? { ...DEFAULT_PAYMENT_CONFIG, ...JSON.parse(saved) } : DEFAULT_PAYMENT_CONFIG;
    } catch {
      return DEFAULT_PAYMENT_CONFIG;
    }
  });

  // Users List with persistent edit capability
  const [usersList, setUsersList] = useState<AppUser[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_users');
      return saved ? JSON.parse(saved) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  });
  const [editingUser, setEditingUser] = useState<AppUser | null>(null);

  // 3. User Control: Blocked Users list (saved to localStorage "blocked_users_simple")
  const [blockedUsers, setBlockedUsers] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('blocked_users_simple');
      return saved ? JSON.parse(saved) : []; 
    } catch {
      return [];
    }
  });

  // 4. Services with On/Off Toggle (saved to localStorage "allservice_services")
  const [services, setServices] = useState<ServiceItemAdmin[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_services');
      return saved ? JSON.parse(saved) : INITIAL_SERVICES;
    } catch {
      return INITIAL_SERVICES;
    }
  });

  // 5. Employees Data State (saved to localStorage "allservice_employees")
  const [employees, setEmployees] = useState<EmployeeRow[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_employees');
      return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  // 6. Server Config & Theme State (saved to localStorage)
  const [serverIp, setServerIp] = useState<string>(() => {
    return localStorage.getItem('allservice_server_ip') || '192.168.1.10';
  });
  const [port, setPort] = useState<string>(() => {
    return localStorage.getItem('allservice_server_port') || '8080';
  });
  const [status, setStatus] = useState<'Connected' | 'Connecting' | 'Disconnected'>('Connected');
  const [lastChecked, setLastChecked] = useState('Just now');

  const [themeMode, setThemeMode] = useState<'Light' | 'Dark'>(() => {
    return (localStorage.getItem('allservice_theme_mode') as 'Light' | 'Dark') || 'Light';
  });
  const [primaryColor, setPrimaryColor] = useState<string>(() => {
    return localStorage.getItem('allservice_primary_color') || '#10B981';
  });

  // Commission Config (commission_config)
  const [commissionRate, setCommissionRate] = useState<number>(() => {
    try {
      const config = localStorage.getItem('commission_config');
      if (config) {
        const parsed = JSON.parse(config);
        if (typeof parsed.platformRate === 'number') return parsed.platformRate;
        if (typeof parsed.platformPercent === 'number') return parsed.platformPercent;
      }
      return 15;
    } catch {
      return 15;
    }
  });

  // 7. Marketplace & Channel Control States
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  });

  const [popularServices, setPopularServices] = useState<ServiceItem[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_popular_services');
      return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
    } catch {
      return DEFAULT_SERVICES;
    }
  });

  const [popularProducts, setPopularProducts] = useState<ProductItem[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_popular_products');
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    try {
      const saved = localStorage.getItem('allservice_bookings');
      return saved ? JSON.parse(saved) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [seoConfig, setSeoConfig] = useState<SeoConfig>(() => {
    try {
      const saved = localStorage.getItem('allservice_seo_config');
      return saved ? JSON.parse(saved) : DEFAULT_SEO_CONFIG;
    } catch {
      return DEFAULT_SEO_CONFIG;
    }
  });

  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('allservice_maintenance_mode') === 'true';
  });

  // Homepage Control State (Firestore backed)
  const [homepageControlState, setHomepageControlState] = useState<DynamicHomepageContent>({
    heroTitle: 'আপনার সব সেবা, এক জায়গায়',
    heroSubtitle: 'হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয় • ১০০০+ বিশ্বস্ত সার্ভিস প্রোভাইডার • ২৪/৭ সাপোর্ট • নিরাপদ ও নির্ভরযোগ্য',
    superPackagePrice: '৳১৪৯৯',
    services: [
      { name: 'ইলেকট্রিশিয়ান সার্ভিস', price: '৳৪৫০', icon: 'Zap' },
      { name: 'প্লাম্বিং ও পাইপ মেরামত', price: '৳৫০০', icon: 'Wrench' },
      { name: 'হোম ডিপ ক্লিনিং', price: '৳১৯৯৯', icon: 'Paintbrush' },
      { name: 'অভিজ্ঞ হোম টিউটর', price: '৳৩৫০০', icon: 'GraduationCap' },
    ],
    showPayments: true,
    footerText: 'বাংলাদেশের অন্যতম নির্ভরযোগ্য অনলাইন সার্ভিস মার্কেটপ্লেস। বাসা-বাড়ি ও অফিসের প্রয়োজনীয় ইলেকট্রিক্যাল, প্লাম্বিং, ডিপ ক্লিনিং, এসি মেরামত এবং হোম টিউটর সার্ভিস খুব সহজেই বুক করুন।',
  });

  useEffect(() => {
    const path = 'homepage_content/main';
    const unsub = onSnapshot(doc(db, 'homepage_content', 'main'), (snap) => {
      if (snap.exists()) {
        setHomepageControlState(snap.data() as DynamicHomepageContent);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });
    return () => unsub();
  }, []);

  // 8. Modals and State Management
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // User Modals State
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    phone: '',
    email: '',
    area: '',
  });
  const [blockUserConfirm, setBlockUserConfirm] = useState<{ user: AppUser; willBlock: boolean } | null>(null);
  const [deleteUserConfirm, setDeleteUserConfirm] = useState<AppUser | null>(null);

  // Employee Modals State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeRow | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<EmployeeRow | null>(null);
  const [blockEmployeeConfirm, setBlockEmployeeConfirm] = useState<{ employee: EmployeeRow; newStatus: 'Active' | 'Inactive' | 'On Leave' } | null>(null);
  const [deleteEmployeeConfirm, setDeleteEmployeeConfirm] = useState<EmployeeRow | null>(null);
  const [assignTaskEmployee, setAssignTaskEmployee] = useState<EmployeeRow | null>(null);
  const [changeRoleEmployee, setChangeRoleEmployee] = useState<EmployeeRow | null>(null);

  // New Service Modal State
  const [isAddServiceModalOpen, setIsAddServiceModalOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: '',
    banglaName: '',
    category: 'Cleaning',
    price: '',
    leadTime: '১ ঘন্টা',
  });

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    name: '',
    email: '',
    department: 'Cleaning',
    role: '',
    status: 'Active' as 'Active' | 'On Leave' | 'Inactive',
  });

  // LocalStorage Synchronizers
  useEffect(() => {
    localStorage.setItem('admin_active_menu', activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    localStorage.setItem('allservice_users', JSON.stringify(usersList));
  }, [usersList]);

  useEffect(() => {
    localStorage.setItem('blocked_users_simple', JSON.stringify(blockedUsers));
  }, [blockedUsers]);

  useEffect(() => {
    localStorage.setItem('allservice_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('allservice_employees', JSON.stringify(employees));
  }, [employees]);

  useEffect(() => {
    localStorage.setItem('allservice_server_ip', serverIp);
    localStorage.setItem('allservice_server_port', port);
  }, [serverIp, port]);

  useEffect(() => {
    localStorage.setItem('allservice_theme_mode', themeMode);
    localStorage.setItem('allservice_primary_color', primaryColor);
  }, [themeMode, primaryColor]);

  useEffect(() => {
    localStorage.setItem('commission_config', JSON.stringify({ platformRate: commissionRate, providerRate: 100 - commissionRate }));
  }, [commissionRate]);

  useEffect(() => {
    localStorage.setItem('allservice_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('allservice_popular_services', JSON.stringify(popularServices));
  }, [popularServices]);

  useEffect(() => {
    localStorage.setItem('allservice_popular_products', JSON.stringify(popularProducts));
  }, [popularProducts]);

  useEffect(() => {
    localStorage.setItem('allservice_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('allservice_seo_config', JSON.stringify(seoConfig));
  }, [seoConfig]);

  useEffect(() => {
    localStorage.setItem('allservice_maintenance_mode', String(maintenanceMode));
  }, [maintenanceMode]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSaveHomepageConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('homepage_full_config', JSON.stringify(homepageConfig));
    showToast('Saved - Applying changes...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleSaveHomepageControl = async (e: React.FormEvent) => {
    e.preventDefault();
    const path = 'homepage_content/main';
    try {
      const docRef = doc(db, 'homepage_content', 'main');
      await setDoc(docRef, {
        ...homepageControlState,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'unknown'
      });
      showToast('Homepage dynamic content updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const handleSavePaymentConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    localStorage.setItem('payment_config', JSON.stringify(paymentConfig));
    showToast('Saved - Applying changes...');
    setTimeout(() => window.location.reload(), 1000);
  };

  // User A to Z Handlers
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.phone.trim()) {
      showToast('Please provide user name and phone number');
      return;
    }
    const created: AppUser = {
      id: `USR-${Math.floor(810 + Math.random() * 190)}`,
      name: newUser.name.trim(),
      phone: newUser.phone.trim(),
      email: newUser.email.trim() || `${newUser.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      area: newUser.area.trim() || 'Dhaka, Bangladesh',
      joined: 'Just now',
      ordersCount: 0,
    };
    const updated = [created, ...usersList];
    setUsersList(updated);
    setIsAddUserModalOpen(false);
    setNewUser({ name: '', phone: '', email: '', area: '' });
    showToast(`Added customer "${created.name}" successfully`);
  };

  const handleSaveEditedUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated = usersList.map((u) => (u.id === editingUser.id ? editingUser : u));
    setUsersList(updated);
    setEditingUser(null);
    showToast(`User "${editingUser.name}" details updated successfully`);
  };

  const handleConfirmBlockUser = () => {
    if (!blockUserConfirm) return;
    const { user, willBlock } = blockUserConfirm;
    setBlockedUsers((prev) => {
      let updated: string[];
      if (willBlock) {
        updated = prev.includes(user.id) ? prev : [...prev, user.id];
        showToast(`User "${user.name}" has been BLOCKED (নিষিদ্ধ)`);
      } else {
        updated = prev.filter((id) => id !== user.id);
        showToast(`User "${user.name}" has been UNBLOCKED (সক্রিয়)`);
      }
      return updated;
    });
    setBlockUserConfirm(null);
  };

  const handleConfirmDeleteUser = () => {
    if (!deleteUserConfirm) return;
    const userToDelete = deleteUserConfirm;
    const updated = usersList.filter((u) => u.id !== userToDelete.id);
    setUsersList(updated);
    setBlockedUsers((prev) => prev.filter((id) => id !== userToDelete.id));
    setDeleteUserConfirm(null);
    showToast(`User "${userToDelete.name}" permanently deleted`);
  };

  // Employee A to Z Handlers
  const handleAddEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmp.name.trim() || !newEmp.role.trim()) {
      showToast('Please provide both name and role');
      return;
    }
    const initials = newEmp.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();

    const created: EmployeeRow = {
      id: `EMP-${1050 + employees.length}`,
      name: newEmp.name.trim(),
      email: newEmp.email.trim() || `${newEmp.name.toLowerCase().replace(/\s+/g, '.')}@allservicebd.com`,
      initials: initials || 'EM',
      badgeBg: 'bg-emerald-700 text-white',
      department: newEmp.department,
      role: newEmp.role.trim(),
      status: newEmp.status,
      joined: 'Just now',
    };

    const updated = [created, ...employees];
    setEmployees(updated);
    setIsAddModalOpen(false);
    setNewEmp({ name: '', email: '', department: 'Cleaning', role: '', status: 'Active' });
    showToast(`Added ${created.name} to ${created.department} department`);
  };

  const handleSaveEditedEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmployee) return;
    const updated = employees.map((emp) => (emp.id === editingEmployee.id ? editingEmployee : emp));
    setEmployees(updated);
    setEditingEmployee(null);
    showToast(`Updated record for ${editingEmployee.name}`);
  };

  const handleConfirmBlockEmployee = () => {
    if (!blockEmployeeConfirm) return;
    const { employee, newStatus } = blockEmployeeConfirm;
    const updated = employees.map((emp) =>
      emp.id === employee.id ? { ...emp, status: newStatus } : emp
    );
    setEmployees(updated);
    setBlockEmployeeConfirm(null);
    showToast(
      newStatus === 'Active'
        ? `Employee ${employee.name} is now ACTIVE (সক্রিয়)`
        : `Employee ${employee.name} status updated to ${newStatus}`
    );
  };

  const handleConfirmDeleteEmployee = () => {
    if (!deleteEmployeeConfirm) return;
    const empToDelete = deleteEmployeeConfirm;
    const updated = employees.filter((emp) => emp.id !== empToDelete.id);
    setEmployees(updated);
    setDeleteEmployeeConfirm(null);
    showToast(`Employee ${empToDelete.name} permanently removed`);
  };

  const handleSaveChangeRole = (newRole: string, newDept: string) => {
    if (!changeRoleEmployee) return;
    const updated = employees.map((emp) =>
      emp.id === changeRoleEmployee.id ? { ...emp, role: newRole, department: newDept } : emp
    );
    setEmployees(updated);
    setChangeRoleEmployee(null);
    showToast(`Role updated to ${newRole} for ${changeRoleEmployee.name}`);
  };

  const handleSaveAssignTask = (ticketTitle: string) => {
    if (!assignTaskEmployee) return;
    showToast(`Assigned "${ticketTitle}" to ${assignTaskEmployee.name}`);
    setAssignTaskEmployee(null);
  };

  const handleRowAction = (action: string, row: EmployeeRow) => {
    setOpenRowId(null);
    if (action === 'Edit Employee') {
      setEditingEmployee({ ...row });
    } else if (action === 'View Details') {
      setViewingEmployee(row);
    } else if (action === 'Assign Task') {
      setAssignTaskEmployee(row);
    } else if (action === 'Change Role') {
      setChangeRoleEmployee(row);
    } else if (action === 'Block Employee' || action === 'Change Status') {
      setBlockEmployeeConfirm({
        employee: row,
        newStatus: row.status === 'Active' ? 'Inactive' : 'Active',
      });
    } else if (action === 'Delete Employee') {
      setDeleteEmployeeConfirm(row);
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.name.trim() || !newService.banglaName.trim()) {
      showToast('Please provide both English and Bangla names');
      return;
    }
    const created: ServiceItemAdmin = {
      id: `srv-${Date.now()}`,
      name: newService.name.trim(),
      banglaName: newService.banglaName.trim(),
      category: newService.category,
      price: newService.price.startsWith('৳') ? newService.price : `৳${newService.price}`,
      enabled: true,
      rating: 0,
      ordersCount: 0,
      leadTime: newService.leadTime,
    };
    setServices((prev) => [created, ...prev]);
    setIsAddServiceModalOpen(false);
    setNewService({ name: '', banglaName: '', category: 'Cleaning', price: '', leadTime: '১ ঘন্টা' });
    showToast(`Service "${created.name}" added successfully`);
  };

  // Service Toggle Handler
  const handleToggleService = (serviceId: string) => {
    setServices((prev) =>
      prev.map((s) => {
        if (s.id === serviceId) {
          const nextState = !s.enabled;
          showToast(`Service "${s.name}" is now ${nextState ? 'ENABLED (অন)' : 'DISABLED (বন্ধ)'}`);
          return { ...s, enabled: nextState };
        }
        return s;
      })
    );
  };

  const handleToggleAllServices = (targetState: boolean) => {
    setServices((prev) => prev.map((s) => ({ ...s, enabled: targetState })));
    showToast(`All services are now ${targetState ? 'ENABLED' : 'DISABLED'}`);
  };

  const handleReconnect = () => {
    setStatus('Connecting');
    setTimeout(() => {
      setStatus('Connected');
      setLastChecked('Just now');
      showToast('Server reconnected successfully!');
    }, 1200);
  };

  // Department Mapping
  const categoryDepartmentMap: Record<string, string> = {
    'Cleaning': 'Cleaning',
    'Delivery': 'Delivery',
    'Plumbing': 'Plumbing',
    'Electrical': 'Electrical',
    'AC Repair': 'AC Repair',
    'Home Shifting': 'Home Shifting',
    'Tutor': 'Tutor',
    'Beauty Salon': 'Beauty',
    'IT Support': 'IT',
  };

  // Accordion Categories matching prompt exactly
  const categoryItems = [
    { name: 'Dashboard', banglaName: 'ড্যাশবোর্ড', icon: LayoutGrid, count: null },
    { name: 'Cleaning', banglaName: 'ক্লিনিং', icon: Paintbrush, count: 2 },
    { name: 'Delivery', banglaName: 'ডেলিভারি', icon: Truck, count: 2 },
    { name: 'Plumbing', banglaName: 'প্লাম্বিং', icon: Wrench, count: 2 },
    { name: 'Electrical', banglaName: 'ইলেকট্রিক্যাল', icon: Zap, count: 2 },
    { name: 'AC Repair', banglaName: 'এসি মেরামত', icon: Snowflake, count: 2 },
    { name: 'Home Shifting', banglaName: 'বাসা পরিবর্তন', icon: Truck, count: 2 },
    { name: 'Tutor', banglaName: 'টিউটর', icon: GraduationCap, count: 2 },
    { name: 'Beauty Salon', banglaName: 'বিউটি সেলুন', icon: Sparkles, count: 2 },
    { name: 'IT Support', banglaName: 'আইটি সাপোর্ট', icon: ShieldCheck, count: 3 },
  ];

  const activeServicesCount = services.filter((s) => s.enabled).length;

  // New Handlers for Pro-level control
  const handleUpdateSeo = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('allservice_seo_config', JSON.stringify(seoConfig));
    showToast('SEO settings updated - Reloading...');
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleToggleMaintenance = async () => {
    const next = !maintenanceMode;
    setMaintenanceMode(next);
    
    // Sync to Firestore for real-time site control
    try {
      await setDoc(doc(db, 'config', 'site'), {
        maintenanceMode: next,
        updatedAt: serverTimestamp(),
        updatedBy: auth.currentUser?.uid || 'admin'
      }, { merge: true });
      showToast(`Maintenance mode is now ${next ? 'ON (সক্রিয়)' : 'OFF (বন্ধ)'}`);
    } catch (err) {
      console.error('Failed to update maintenance mode in Firestore:', err);
      showToast('Error syncing maintenance mode to database');
    }
  };

  const handleDeleteBooking = (id: string) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast(`Booking ${id} deleted`);
  };

  const handleUpdateBookingStatus = (id: string, status: BookingRecord['status']) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    showToast(`Booking ${id} status updated to ${status}`);
  };

  const handleAddCategory = (cat: ServiceCategory) => {
    setCategories(prev => [...prev, cat]);
    showToast(`Category "${cat.name}" added`);
  };

  const handleDeleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
    showToast('Category deleted');
  };

  const handleAddProduct = (prod: ProductItem) => {
    setPopularProducts(prev => [...prev, prod]);
    showToast(`Product "${prod.title}" added`);
  };

  const handleDeleteProduct = (id: string) => {
    setPopularProducts(prev => prev.filter(p => p.id !== id));
    showToast('Product deleted from marketplace');
  };

  // Management Items matching prompt exactly
  const systemMenuItems = [
    { name: 'Bookings', banglaName: 'বুকিং সমূহ', icon: History, badge: `${bookings.filter(b => b.status === 'Pending').length} New` },
    { name: 'Notifications', banglaName: 'নোটিফিকেশন', icon: Bell, badge: 'Live Broadcast' },
    { name: 'Employees', banglaName: 'কর্মচারী', icon: Users, badge: `${employees.length}` },
    { name: 'Users', banglaName: 'ব্যবহারকারী', icon: Users, badge: `${usersList.length}` },
    { name: 'Homepage Control', banglaName: 'হোম পেজ কন্ট্রোল', icon: Layout, badge: 'Main' },
    { name: 'Services', banglaName: 'সেবা কন্ট্রোল', icon: Power, badge: `${activeServicesCount} ON` },
    { name: 'Categories', banglaName: 'ক্যাটাগরি', icon: ListFilter, badge: `${categories.length}` },
    { name: 'Products', banglaName: 'পণ্য সমূহ', icon: ShoppingBag, badge: `${popularProducts.length}` },
    { name: 'Departments', banglaName: 'ডিপার্টমেন্ট', icon: Building2, badge: '9' },
    { name: 'Payroll', banglaName: 'পেরোল', icon: CreditCard, badge: null },
    { name: 'Attendance', banglaName: 'উপস্থিতি', icon: Calendar, badge: null },
    { name: 'Reports', banglaName: 'রিপোর্ট', icon: BarChart3, badge: null },
    { name: 'SEO & Coupons', banglaName: 'এসইও ও কুপন', icon: Megaphone, badge: null },
    { name: 'Server Config', banglaName: 'সার্ভার কনফিগ', icon: Server, badge: null },
    { name: 'Theme Editor', banglaName: 'থিম এডিটর', icon: Palette, badge: null },
    { name: 'Settings', banglaName: 'সেটিংস', icon: Settings, badge: null },
  ];

  // 9 Departments Data
  const departmentsData = [
    { name: 'Cleaning', code: 'CLN', head: 'Rina Begum', count: 18, activeStaff: 17, icon: Paintbrush, color: 'text-teal-600 bg-teal-50' },
    { name: 'Delivery', code: 'DLV', head: 'Kamal Hossain', count: 32, activeStaff: 30, icon: Truck, color: 'text-amber-600 bg-amber-50' },
    { name: 'Plumbing', code: 'PLM', head: 'Manik Mia', count: 14, activeStaff: 13, icon: Wrench, color: 'text-blue-600 bg-blue-50' },
    { name: 'Electrical', code: 'ELC', head: 'Tanvir Hossain', count: 24, activeStaff: 24, icon: Zap, color: 'text-yellow-600 bg-yellow-50' },
    { name: 'AC Repair', code: 'ACR', head: 'Ahsan Habib', count: 19, activeStaff: 18, icon: Snowflake, color: 'text-cyan-600 bg-cyan-50' },
    { name: 'Home Shifting', code: 'SFT', head: 'Abul Kalam', count: 16, activeStaff: 16, icon: Truck, color: 'text-stone-600 bg-stone-50' },
    { name: 'Tutor', code: 'TTR', head: 'Fahmida Sultana', count: 42, activeStaff: 40, icon: GraduationCap, color: 'text-purple-600 bg-purple-50' },
    { name: 'Beauty', code: 'BTY', head: 'Sumaiya Akter', count: 28, activeStaff: 27, icon: Sparkles, color: 'text-pink-600 bg-pink-50' },
    { name: 'IT', code: 'ITS', head: 'Ahsan Rahman', count: 15, activeStaff: 15, icon: ShieldCheck, color: 'text-emerald-600 bg-emerald-50' },
  ];

  // Filter employees according to activeMenu
  const displayedEmployees = useMemo(() => {
    let list = employees;

    if (activeMenu in categoryDepartmentMap) {
      const targetDept = categoryDepartmentMap[activeMenu];
      list = list.filter((emp) => emp.department.toLowerCase() === targetDept.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (emp) =>
          emp.name.toLowerCase().includes(q) ||
          emp.department.toLowerCase().includes(q) ||
          emp.role.toLowerCase().includes(q) ||
          emp.id.toLowerCase().includes(q)
      );
    }

    return list;
  }, [employees, activeMenu, searchQuery]);

  // Filter users by search
  const displayedUsers = useMemo(() => {
    if (!searchQuery.trim()) return usersList;
    const q = searchQuery.toLowerCase();
    return usersList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.phone.includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.area.toLowerCase().includes(q)
    );
  }, [searchQuery, usersList]);

  // Category specific services
  const categoryServices = useMemo(() => {
    if (activeMenu in categoryDepartmentMap) {
      const targetDept = categoryDepartmentMap[activeMenu];
      return services.filter((s) => s.category.toLowerCase() === targetDept.toLowerCase());
    }
    return services;
  }, [services, activeMenu]);

  const isCategoryFilter = activeMenu in categoryDepartmentMap;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col font-sans text-gray-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* 1. TOP HEADER BAR */}
      <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="lg:hidden p-2 text-gray-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-lg cursor-pointer"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo & Subtitle */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-emerald-900 leading-none">
                All Service BD
              </h1>
              <p className="text-[11px] font-medium text-gray-500 tracking-wide mt-0.5">
                Super Admin Dashboard
              </p>
            </div>
          </div>
        </div>

        {/* Header Center Search */}
        <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search employees, users, services..."
              className="w-full pl-4 pr-10 py-2 text-sm bg-gray-50 border border-emerald-800/30 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-600/30 focus:border-emerald-700 transition-all"
            />
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-emerald-800 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
            )}
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Quick Active Services Indicator */}
          <button
            onClick={() => setActiveMenu('Services')}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{activeServicesCount}/{services.length} সেবা সক্রিয়</span>
          </button>

          <button 
            onClick={() => {
              setActiveMenu('Notifications');
              showToast('Opened Customer Notification Hub');
            }}
            className={`p-2 rounded-xl relative cursor-pointer transition-colors ${
              activeMenu === 'Notifications' 
                ? 'bg-emerald-100 text-emerald-800' 
                : 'text-gray-500 hover:text-emerald-800 hover:bg-emerald-50'
            }`}
            title="Customer Notifications & Broadcasts"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white animate-pulse"></span>
          </button>

          <button 
            onClick={() => {
              setActiveMenu('Settings');
              showToast('Opened Settings');
            }}
            className="p-2 text-gray-500 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl cursor-pointer"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div className="h-6 w-px bg-gray-200"></div>

          {/* User Icon Dropdown (Avatar) */}
          <div className="relative">
            <button
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
              className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100 transition-colors cursor-pointer select-none"
              aria-expanded={isUserDropdownOpen}
              aria-haspopup="true"
            >
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-gray-900 leading-tight">Super Admin</p>
                <p className="text-[10px] text-gray-500 font-medium">{localStorage.getItem('adminEmail') || 'admin@allservicebd.com'}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs shadow-xs border border-white ring-2 ring-emerald-500/20">
                {localStorage.getItem('adminEmail')?.charAt(0).toUpperCase() || 'SA'}
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Click-outside backdrop */}
            {isUserDropdownOpen && (
              <div
                onClick={() => setIsUserDropdownOpen(false)}
                className="fixed inset-0 z-40"
              />
            )}

            {/* Dropdown Menu */}
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-3 py-2.5 border-b border-gray-100 mb-1">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs">
                      {localStorage.getItem('adminEmail')?.charAt(0).toUpperCase() || 'SA'}
                    </div>
                    <div>
                      <p className="font-bold text-xs text-gray-900 leading-tight">Super Admin</p>
                      <p className="text-[10px] text-gray-400 font-mono">{localStorage.getItem('adminEmail') || 'admin@allservicebd.com'}</p>
                    </div>
                  </div>
                  <span className="inline-block mt-2 px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded text-[10px] font-bold border border-emerald-200">
                    Full Platform Control
                  </span>
                </div>

                <div className="space-y-0.5 text-xs font-semibold text-gray-700">
                  <button
                    onClick={() => {
                      setActiveMenu('HomePageControl');
                      setIsUserDropdownOpen(false);
                      showToast('Opened Home Page Control');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeMenu === 'HomePageControl' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <Layout className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="leading-tight">
                      <p className="font-bold">Home Page Control</p>
                      <p className="text-[10px] text-gray-400 font-normal">Banner & Footer Text</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMenu('PaymentMethods');
                      setIsUserDropdownOpen(false);
                      showToast('Opened Payment Methods');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeMenu === 'PaymentMethods' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="leading-tight">
                      <p className="font-bold">Payment Methods</p>
                      <p className="text-[10px] text-gray-400 font-normal">bKash, Nagad, Rocket & COD</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMenu('AddressContact');
                      setIsUserDropdownOpen(false);
                      showToast('Opened Address & Contact');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                      activeMenu === 'AddressContact' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="leading-tight">
                      <p className="font-bold">Address & Contact</p>
                      <p className="text-[10px] text-gray-400 font-normal">Hotline, WhatsApp, Address, Map</p>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setActiveMenu('Profile');
                      setIsUserDropdownOpen(false);
                      showToast('Opened Super Admin Profile');
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                      activeMenu === 'Profile' ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <User className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Profile</span>
                  </button>

                  <div className="h-px bg-gray-100 my-1"></div>

                  <button
                    onClick={() => {
                      setIsUserDropdownOpen(false);
                      showToast('Logged out of Super Admin');
                      if (onLogout) {
                        onLogout();
                      } else {
                        localStorage.removeItem('isAdmin');
                        window.location.href = '/admin/login';
                      }
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-50 text-red-600 text-left transition-colors cursor-pointer font-semibold"
                  >
                    <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER (Sidebar + Page Body) */}
      <div className="flex-1 flex overflow-hidden">
        {/* 2. SIDEBAR - ALWAYS VISIBLE ON DESKTOP (#0f4d2a background), MOBILE HAMBURGER DRAWER */}
        {isMobileSidebarOpen && (
          <div 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
          />
        )}

        <aside className={`
          fixed lg:static top-0 left-0 bottom-0 z-50
          w-64 bg-[#0f4d2a] text-white shrink-0 flex flex-col justify-between
          transition-transform duration-300 ease-in-out
          ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          shadow-xl lg:shadow-none
        `}>
          {/* Top Brand & Close for Mobile */}
          <div>
            <div className="p-5 border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
                <span className="font-bold text-lg text-white tracking-wide">All Service BD</span>
              </div>
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="lg:hidden p-1.5 text-emerald-200 hover:text-white rounded-lg hover:bg-emerald-900/80 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* SIDEBAR NAVIGATION: ACCORDION FOR ALL SERVICES (9) + MANAGEMENT */}
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-180px)] space-y-6 custom-scrollbar">
              
              {/* REQUIREMENT 1: ACCORDION BUTTON "All Services (9)" WITH ARROW */}
              <div>
                <button
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-extrabold uppercase tracking-wider text-emerald-300 hover:text-white rounded-xl hover:bg-emerald-900/60 transition-colors cursor-pointer mb-1 select-none"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>All Services (9)</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* ACCORDION CONTENT: Dashboard, Cleaning 2, Delivery 2, Plumbing 2, Electrical 2, AC Repair 2, Home Shifting 2, Tutor 2, Beauty Salon 2, IT Support 3 */}
                {categoriesOpen && (
                  <nav className="space-y-1 pl-1 pt-1 transition-all duration-200">
                    {categoryItems.map((item) => {
                      const isActive = activeMenu === item.name;
                      return (
                        <button
                          key={item.name}
                          onClick={() => {
                            setActiveMenu(item.name);
                            setIsMobileSidebarOpen(false);
                          }}
                          className={`
                            w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer text-left
                            ${isActive 
                              ? 'bg-[#16a34a] text-white shadow-md' 
                              : 'text-white/90 hover:bg-emerald-800/60 hover:text-white'
                            }
                          `}
                        >
                          <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
                          <span className="truncate">{item.banglaName}</span>
                          {item.count !== null && (
                            <span className={`ml-auto text-[11px] px-2 py-0.2 rounded-full font-bold ${
                              isActive ? 'bg-white text-emerald-900' : 'bg-emerald-900/80 text-emerald-200'
                            }`}>
                              {item.count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </nav>
                )}
              </div>

              {/* REQUIREMENT 2 & 3: MANAGEMENT MENU (INCLUDES NEW "Users" WITH COUNT) */}
              <div>
                <p className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-emerald-300/80 mb-2">
                  MANAGEMENT
                </p>
                <nav className="space-y-1">
                  {systemMenuItems.map((item) => {
                    const isActive = activeMenu === item.name;
                    return (
                      <button
                        key={item.name}
                        onClick={() => {
                          setActiveMenu(item.name);
                          setIsMobileSidebarOpen(false);
                        }}
                        className={`
                          w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-sm font-medium transition-all cursor-pointer text-left
                          ${isActive 
                            ? 'bg-[#16a34a] text-white shadow-md' 
                            : 'text-white/80 hover:bg-emerald-800/60 hover:text-white'
                          }
                        `}
                      >
                        <item.icon className="w-4 h-4 text-emerald-300/90" />
                        <span>{item.banglaName}</span>
                        {item.badge && (
                          <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            isActive ? 'bg-white text-emerald-900' : 'bg-emerald-900/60 text-emerald-200'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          </div>

          {/* BOTTOM ADMIN USER & LOGOUT SECTION */}
          <div className="p-4 border-t border-emerald-900/80 bg-emerald-950/40 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#10B981] text-white flex items-center justify-center font-bold text-xs border border-emerald-400/30 shrink-0">
                {localStorage.getItem('adminEmail')?.charAt(0).toUpperCase() || 'SA'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-white truncate">Super Admin</p>
                <p className="text-[10px] text-emerald-200/70 truncate">{localStorage.getItem('adminEmail') || 'admin@allservicebd.com'}</p>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between text-xs font-medium text-emerald-200/80">
              <button 
                onClick={() => {
                  setActiveMenu('Settings');
                  showToast('Help & Support center');
                }}
                className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-emerald-400" />
                <span>Help & Support</span>
              </button>
              <button 
                onClick={() => {
                  showToast('Admin logged out successfully');
                  if (onLogout) {
                    onLogout();
                  } else {
                    localStorage.removeItem('isAdmin');
                    window.location.href = '/admin/login';
                  }
                }}
                className="flex items-center gap-1.5 text-red-300 hover:text-red-100 font-semibold transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        {/* 3. MAIN DASHBOARD CONTENT AREA */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Header Row: Title + Breadcrumb + Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                {activeMenu === 'Dashboard' && 'ড্যাশবোর্ড ওভারভিউ'}
                {activeMenu === 'Notifications' && 'কাস্টমার নোটিফিকেশন ও ব্রডকাস্ট'}
                {activeMenu === 'Users' && 'ব্যবহারকারী ও অ্যাকাউন্ট ম্যানেজমেন্ট'}
                {activeMenu === 'Employees' && 'কর্মচারী ম্যানেজমেন্ট'}
                {activeMenu === 'Services' && 'সেবা ডিরেক্টরি ও কন্ট্রোল'}
                {activeMenu === 'Departments' && 'ডিপার্টমেন্ট ডিরেক্টরি'}
                {activeMenu === 'Server Config' && 'সার্ভার আইপি কনফিগারেশন'}
                {activeMenu === 'Theme Editor' && 'সিস্টেম থিম এডিটর'}
                {activeMenu === 'Payroll' && 'পেরোল ও ডিসবার্সমেন্ট'}
                {activeMenu === 'Attendance' && 'দৈনিক উপস্থিতি মনিটর'}
                {activeMenu === 'Reports' && 'অ্যানালিটিক্স ও পারফরম্যান্স রিপোর্ট'}
                {activeMenu === 'Settings' && 'সিস্টেম ও পোর্টাল সেটিংস'}
                {activeMenu === 'HomePageControl' && 'হোম পেজ কন্ট্রোল (ব্যানার ও ফুটার)'}
                {activeMenu === 'PaymentMethods' && 'পেমেন্ট মেথড ও গেটওয়ে'}
                {activeMenu === 'AddressContact' && 'ঠিকানা ও যোগাযোগ তথ্য'}
                {activeMenu === 'Profile' && 'সুপার এডমিন প্রোফাইল'}
                {isCategoryFilter && `${activeMenu} সেবা ও কর্মী`}
              </h2>
              <p className="text-xs font-medium text-gray-500 mt-1 flex items-center gap-1.5">
                <span>Dashboard</span>
                <span>&gt;</span>
                {isCategoryFilter ? (
                  <>
                    <span className="text-emerald-700 font-bold">All Services (9)</span>
                    <span>&gt;</span>
                    <span className="text-emerald-800 font-extrabold">{activeMenu}</span>
                  </>
                ) : (
                  <span className="text-emerald-800 font-extrabold">
                    {activeMenu === 'HomePageControl' ? 'Home Page Control' :
                     activeMenu === 'PaymentMethods' ? 'Payment Methods' :
                     activeMenu === 'AddressContact' ? 'Address & Contact' :
                     activeMenu}
                  </span>
                )}
              </p>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2.5">
              {activeMenu === 'Services' && (
                <>
                  <button
                    onClick={() => setIsAddServiceModalOpen(true)}
                    className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Service</span>
                  </button>
                  <button
                    onClick={() => handleToggleAllServices(true)}
                    className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-emerald-200"
                  >
                    Turn All ON
                  </button>
                  <button
                    onClick={() => handleToggleAllServices(false)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-gray-300"
                  >
                    Turn All OFF
                  </button>
                </>
              )}

              {activeMenu === 'Users' && (
                <button 
                  onClick={() => setIsAddUserModalOpen(true)}
                  className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer self-start sm:self-auto"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add New User</span>
                </button>
              )}

              {(activeMenu === 'Dashboard' || activeMenu === 'Employees' || isCategoryFilter) && (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              )}
            </div>
          </div>

          {/* VIEW: NOTIFICATIONS (CUSTOMER NOTIFICATION & PRODUCT BROADCAST HUB) */}
          {activeMenu === 'Notifications' && (
            <AdminNotificationManager />
          )}

          {/* VIEW: USERS (USER CONTROL WITH A TO Z EDIT/BLOCK/DELETE MODALS) */}
          {activeMenu === 'Users' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">User Control Management</h3>
                    <p className="text-xs text-gray-500">
                      Super Admin A-to-Z control: Edit user profiles, block/unblock ordering permissions, and delete records.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 text-xs">
                  <span className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-800 font-bold border border-gray-200">
                    {usersList.length} Total Users
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200">
                    {usersList.length - blockedUsers.length} Active Users
                  </span>
                  <span className="px-3 py-1.5 rounded-xl bg-red-50 text-red-700 font-bold border border-red-200">
                    {blockedUsers.length} Blocked
                  </span>
                  <button
                    onClick={() => setIsAddUserModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ml-auto sm:ml-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>+ Add User</span>
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100/70 border-b border-emerald-200/80 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">User Details</th>
                        <th className="px-5 py-3.5">Phone</th>
                        <th className="px-5 py-3.5">Location Area</th>
                        <th className="px-5 py-3.5">Orders</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions (Edit / Block / Delete)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedUsers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-gray-500 text-xs">
                            No registered users match your search criteria.
                          </td>
                        </tr>
                      ) : (
                        displayedUsers.map((user) => {
                          const isBlocked = blockedUsers.includes(user.id);
                          return (
                            <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <div className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs text-white ${
                                    isBlocked ? 'bg-red-500' : 'bg-emerald-700'
                                  }`}>
                                    {user.name.split(' ').map((n) => n[0]).join('').substring(0, 2)}
                                  </div>
                                  <div>
                                    <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-400 font-mono">{user.email}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-4 font-mono text-xs font-semibold text-gray-800">
                                {user.phone}
                              </td>
                              <td className="px-5 py-4 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-gray-400" />
                                  {user.area}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs font-bold text-gray-800">
                                {user.ordersCount} বুকিং
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    isBlocked
                                      ? 'bg-red-100 text-red-700 border border-red-300'
                                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  }`}
                                >
                                  <span className={`w-2 h-2 rounded-full ${isBlocked ? 'bg-red-600' : 'bg-emerald-600 animate-pulse'}`} />
                                  {isBlocked ? 'Blocked (নিষিদ্ধ)' : 'Active (সক্রিয়)'}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setEditingUser(user)}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200 shadow-2xs"
                                    title="Edit User Details"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Edit</span>
                                  </button>

                                  {/* Block / Unblock Modal Trigger */}
                                  {isBlocked ? (
                                    <button
                                      onClick={() => setBlockUserConfirm({ user, willBlock: false })}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                      title="Unblock User"
                                    >
                                      <Unlock className="w-3.5 h-3.5" />
                                      <span>Unblock</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setBlockUserConfirm({ user, willBlock: true })}
                                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer"
                                      title="Block User"
                                    >
                                      <Lock className="w-3.5 h-3.5" />
                                      <span>Block</span>
                                    </button>
                                  )}

                                  {/* Delete User Modal Trigger */}
                                  <button
                                    onClick={() => setDeleteUserConfirm(user)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all cursor-pointer border border-red-200 shadow-2xs"
                                    title="Delete User"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span className="hidden md:inline">Delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeMenu === 'Homepage Control' && (
            <div className="max-w-4xl space-y-6 pb-20">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-2xs">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Layout className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Dynamic Homepage Management</h3>
                    <p className="text-xs text-gray-500">Edit hero content, package pricing, and featured services in real-time.</p>
                  </div>
                </div>

                <form onSubmit={handleSaveHomepageControl} className="space-y-6">
                  {/* Hero Section */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Hero Banner</h4>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Hero Headline (Bengali)</label>
                        <input 
                          type="text" 
                          value={homepageControlState.heroTitle}
                          onChange={(e) => setHomepageControlState({...homepageControlState, heroTitle: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="আপনার সব সেবা, এক জায়গায়"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Hero Subtitle</label>
                        <textarea 
                          rows={2}
                          value={homepageControlState.heroSubtitle}
                          onChange={(e) => setHomepageControlState({...homepageControlState, heroSubtitle: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয়..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Super Package */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Pricing & Packages</h4>
                    <div className="space-y-1.5 max-w-xs">
                      <label className="text-xs font-bold text-gray-700">Super Package Price Label</label>
                      <input 
                        type="text" 
                        value={homepageControlState.superPackagePrice}
                        onChange={(e) => setHomepageControlState({...homepageControlState, superPackagePrice: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
                        placeholder="৳১৪৯৯"
                      />
                    </div>
                  </div>

                  {/* Featured Services (4 Cards) */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Featured Service Cards (Hero Section)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {homepageControlState.services.map((svc, idx) => (
                        <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
                          <p className="text-[10px] font-black text-emerald-600 uppercase">Card #{idx + 1}</p>
                          <div className="space-y-2">
                            <input 
                              type="text" 
                              value={svc.name}
                              onChange={(e) => {
                                const newSvcs = [...homepageControlState.services];
                                newSvcs[idx].name = e.target.value;
                                setHomepageControlState({...homepageControlState, services: newSvcs});
                              }}
                              className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                              placeholder="Service Name"
                            />
                            <div className="grid grid-cols-2 gap-2">
                              <input 
                                type="text" 
                                value={svc.price}
                                onChange={(e) => {
                                  const newSvcs = [...homepageControlState.services];
                                  newSvcs[idx].price = e.target.value;
                                  setHomepageControlState({...homepageControlState, services: newSvcs});
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                                placeholder="Price Label"
                              />
                              <select 
                                value={svc.icon}
                                onChange={(e) => {
                                  const newSvcs = [...homepageControlState.services];
                                  newSvcs[idx].icon = e.target.value;
                                  setHomepageControlState({...homepageControlState, services: newSvcs});
                                }}
                                className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs"
                              >
                                <option value="Zap">Zap</option>
                                <option value="Wrench">Wrench</option>
                                <option value="Paintbrush">Paintbrush</option>
                                <option value="GraduationCap">Tutor</option>
                                <option value="Sparkles">Sparkles</option>
                                <option value="ShieldCheck">Shield</option>
                                <option value="Smartphone">Phone</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Settings & Footer */}
                  <div className="space-y-4 pt-4 border-t border-gray-100">
                    <h4 className="text-sm font-black text-emerald-800 uppercase tracking-widest">Global Settings & Footer</h4>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <div>
                          <p className="text-sm font-bold text-emerald-900">Show Payment Methods</p>
                          <p className="text-xs text-emerald-600">Toggle bKash, Nagad, etc icons in footer</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setHomepageControlState({...homepageControlState, showPayments: !homepageControlState.showPayments})}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${homepageControlState.showPayments ? 'bg-emerald-600' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${homepageControlState.showPayments ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-gray-700">Footer About Text</label>
                        <textarea 
                          rows={3}
                          value={homepageControlState.footerText}
                          onChange={(e) => setHomepageControlState({...homepageControlState, footerText: e.target.value})}
                          className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="About the marketplace..."
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-100 flex justify-end">
                    <button 
                      type="submit"
                      className="bg-emerald-700 hover:bg-emerald-800 text-white font-black px-8 py-3 rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2 cursor-pointer"
                    >
                      <Save className="w-5 h-5" />
                      <span>Save Homepage Config</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: DASHBOARD OVERVIEW */}
          {activeMenu === 'Dashboard' && (
            <div className="space-y-6">
              {/* 4 TOP STAT CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Total Employees</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5">{employees.length}</h3>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>9 Service Units</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <UserCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Registered Users</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5">{usersList.length}</h3>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
                    <span>{blockedUsers.length} blocked</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Power className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Active Services</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5">{activeServicesCount} / {services.length}</h3>
                    </div>
                  </div>
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center gap-1">
                    <span>{activeServicesCount} Live on Marketplace</span>
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-200/80 shadow-2xs hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Departments</p>
                      <h3 className="text-2xl font-black text-gray-900 mt-0.5">9</h3>
                    </div>
                  </div>
                  <p className="text-xs font-medium text-gray-400 mt-3">All Active</p>
                </div>
              </div>

              {/* SERVICES ON/OFF QUICK CONTROLS SECTION */}
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                      <Power className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">Quick Services Toggle (অন / অফ সুইচ)</h3>
                      <p className="text-xs text-gray-500">Enable or disable booking availability for customer marketplace</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveMenu('Services')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All Services ({services.length})</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                  {services.slice(0, 6).map((service) => (
                    <div
                      key={service.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                        service.enabled
                          ? 'bg-emerald-50/50 border-emerald-200'
                          : 'bg-gray-50 border-gray-200 opacity-75'
                      }`}
                    >
                      <div className="space-y-0.5 pr-2">
                        <p className="font-bold text-xs text-gray-900">{service.name}</p>
                        <p className="text-[11px] text-gray-500">{service.banglaName}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px]">
                          <span className="font-mono font-bold text-emerald-700">{service.price}</span>
                          <span className="text-gray-300">•</span>
                          <span className="text-gray-500">{service.category}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleToggleService(service.id)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          service.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={service.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            service.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Employees Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Recent Employee Records</h3>
                    <p className="text-xs text-gray-500">Showing active personnel across departments</p>
                  </div>
                  <button
                    onClick={() => setActiveMenu('Employees')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>View All (19)</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100/70 border-b border-emerald-200/80 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Employee ID</th>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {employees.slice(0, 5).map((emp) => (
                        <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">
                            {emp.id}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${emp.badgeBg}`}>
                                {emp.initials}
                              </div>
                              <div>
                                <p className="font-bold text-gray-900 text-sm leading-tight">{emp.name}</p>
                                <p className="text-xs text-gray-400">{emp.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
                              {emp.department}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-600 text-xs font-medium">
                            {emp.role}
                          </td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              emp.status === 'Active' ? 'bg-[#10B981] text-white' : 'bg-amber-500 text-white'
                            }`}>
                              {emp.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleRowAction('View Details', emp)}
                              className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-gray-100 rounded-lg cursor-pointer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DEDICATED SERVICES MANAGEMENT */}
          {activeMenu === 'Services' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Services Management & Availability</h3>
                  <p className="text-xs text-gray-500">
                    Toggle services on or off. State is automatically saved to localStorage.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleAllServices(true)}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    Enable All Services
                  </button>
                  <button
                    onClick={() => handleToggleAllServices(false)}
                    className="px-3.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                  >
                    Disable All Services
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100/70 border-b border-emerald-200/80 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Service Name</th>
                        <th className="px-5 py-3.5">Category</th>
                        <th className="px-5 py-3.5">Base Price</th>
                        <th className="px-5 py-3.5">Rating & Orders</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5 text-right">On / Off Toggle</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {services.map((service) => (
                        <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <p className="font-bold text-gray-900 text-sm">{service.name}</p>
                              <p className="text-xs text-gray-500 font-medium">{service.banglaName}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              {service.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-gray-900 text-sm">
                            {service.price}
                          </td>
                          <td className="px-5 py-4 text-xs text-gray-600">
                            <span className="font-bold text-emerald-700">★ {service.rating}</span>
                            <span className="text-gray-400"> ({service.ordersCount} বুকিং)</span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                service.enabled
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-gray-100 text-gray-600 border border-gray-300'
                              }`}
                            >
                              <span
                                className={`w-1.5 h-1.5 rounded-full ${
                                  service.enabled ? 'bg-emerald-600 animate-pulse' : 'bg-gray-400'
                                }`}
                              />
                              {service.enabled ? 'Active (চালু)' : 'Disabled (বন্ধ)'}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              onClick={() => handleToggleService(service.id)}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                service.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                              }`}
                              role="switch"
                              aria-checked={service.enabled}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  service.enabled ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: CATEGORY FILTER OR EMPLOYEES (19) FULL TABLE VIEW */}
          {(isCategoryFilter || activeMenu === 'Employees') && (
            <div className="space-y-6">
              {/* Category Services Quick Toggles when in a specific category */}
              {isCategoryFilter && categoryServices.length > 0 && (
                <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Power className="w-5 h-5 text-emerald-800" />
                      <h3 className="font-bold text-gray-900 text-sm">
                        {activeMenu} Services Availability (অন / অফ সুইচ)
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500">
                      {categoryServices.filter((s) => s.enabled).length}/{categoryServices.length} চালু
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categoryServices.map((service) => (
                      <div
                        key={service.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          service.enabled
                            ? 'bg-emerald-50/60 border-emerald-200'
                            : 'bg-gray-50 border-gray-200 opacity-75'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-xs text-gray-900">{service.name}</p>
                          <p className="text-[11px] text-gray-500">{service.banglaName}</p>
                          <p className="text-xs font-bold text-emerald-700">{service.price}</p>
                        </div>
                        <button
                          onClick={() => handleToggleService(service.id)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            service.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={service.enabled}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              service.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Banner */}
              <div className="bg-white p-4 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    <Filter className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">
                      {isCategoryFilter
                        ? `Filtered by Department: "${categoryDepartmentMap[activeMenu]}"`
                        : 'Showing All Employees (19) Across All 9 Departments'}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {displayedEmployees.length} matching staff records found
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCategoryFilter && (
                    <button
                      onClick={() => setActiveMenu('Employees')}
                      className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    >
                      Clear Category Filter
                    </button>
                  )}
                  <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="text-xs font-bold px-3.5 py-1.5 rounded-lg bg-[#0f4d2a] hover:bg-emerald-900 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add to {isCategoryFilter ? categoryDepartmentMap[activeMenu] : 'Directory'}</span>
                  </button>
                </div>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-2xs">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-emerald-100/70 border-b border-emerald-200/80 text-emerald-950 font-bold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-5 py-3.5">Employee ID</th>
                        <th className="px-5 py-3.5">Name</th>
                        <th className="px-5 py-3.5">Department</th>
                        <th className="px-5 py-3.5">Role</th>
                        <th className="px-5 py-3.5">Status</th>
                        <th className="px-5 py-3.5">Joined</th>
                        <th className="px-5 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {displayedEmployees.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="text-center py-12 text-gray-500 text-sm">
                            <Users className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                            No employees found in this department. Click "Add Employee" to create one.
                          </td>
                        </tr>
                      ) : (
                        displayedEmployees.map((emp) => (
                          <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-5 py-4 font-mono text-xs font-bold text-gray-700">
                              {emp.id}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-xs shadow-2xs ${emp.badgeBg}`}>
                                  {emp.initials}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm leading-tight">{emp.name}</p>
                                  <p className="text-xs text-gray-400">{emp.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                {emp.department}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-gray-700 text-xs font-medium">
                              {emp.role}
                            </td>
                            <td className="px-5 py-4">
                              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                emp.status === 'Active' ? 'bg-[#10B981] text-white' : 'bg-amber-500 text-white'
                              }`}>
                                {emp.status}
                              </span>
                            </td>
                            <td className="px-5 py-4 text-xs text-gray-500 font-medium">
                              {emp.joined}
                            </td>
                            <td className="px-5 py-4 text-right relative">
                              <button
                                onClick={() => setOpenRowId(openRowId === emp.id ? null : emp.id)}
                                className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg cursor-pointer"
                              >
                                <MoreHorizontal className="w-5 h-5" />
                              </button>

                              {/* Action Dropdown Menu */}
                              {openRowId === emp.id && (
                                <div className="absolute right-6 top-10 bg-white rounded-xl shadow-xl border border-gray-100 p-2 w-48 z-50 text-left space-y-1 font-medium text-xs">
                                  <button
                                    onClick={() => handleRowAction('Edit Employee', emp)}
                                    className="w-full px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-gray-700 cursor-pointer"
                                  >
                                    <Pencil className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Edit Employee</span>
                                  </button>
                                  <button
                                    onClick={() => handleRowAction('View Details', emp)}
                                    className="w-full px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-gray-700 cursor-pointer"
                                  >
                                    <Eye className="w-3.5 h-3.5 text-gray-500" />
                                    <span>View Details</span>
                                  </button>
                                  <button
                                    onClick={() => handleRowAction('Assign Task', emp)}
                                    className="w-full px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-gray-700 cursor-pointer"
                                  >
                                    <Briefcase className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Assign Task</span>
                                  </button>
                                  <button
                                    onClick={() => handleRowAction('Change Role', emp)}
                                    className="w-full px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 text-gray-700 cursor-pointer"
                                  >
                                    <Shield className="w-3.5 h-3.5 text-gray-500" />
                                    <span>Change Role</span>
                                  </button>
                                  <button
                                    onClick={() => handleRowAction('Block Employee', emp)}
                                    className="w-full px-3 py-2 hover:bg-amber-50 text-amber-700 rounded-lg flex items-center gap-2 cursor-pointer"
                                  >
                                    {emp.status === 'Active' ? (
                                      <>
                                        <Lock className="w-3.5 h-3.5 text-amber-600" />
                                        <span>Block / Inactivate</span>
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3.5 h-3.5 text-emerald-600" />
                                        <span>Reactivate Staff</span>
                                      </>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleRowAction('Delete Employee', emp)}
                                    className="w-full px-3 py-2 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    <span>Delete Employee</span>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: DEPARTMENTS LIST VIEW */}
          {activeMenu === 'Departments' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-200 flex items-center justify-between shadow-2xs">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Organizational Departments (9)</h3>
                  <p className="text-xs text-gray-500">Overview of active workforce distributed across service units</p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  9 Active Units
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {departmentsData.map((dept) => {
                  const staffInState = employees.filter(
                    (e) => e.department.toLowerCase() === dept.name.toLowerCase()
                  ).length;
                  const deptServices = services.filter((s) => s.category.toLowerCase() === dept.name.toLowerCase());
                  const activeDeptServices = deptServices.filter((s) => s.enabled).length;

                  return (
                    <div
                      key={dept.name}
                      className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${dept.color}`}>
                            <dept.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-gray-900 text-base">{dept.name}</h4>
                            <span className="text-[10px] font-mono uppercase bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-bold">
                              Code: {dept.code}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-xs text-gray-600 border-t border-gray-100 pt-3">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Head of Dept:</span>
                          <span className="font-semibold text-gray-800">{dept.head}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Staff Members:</span>
                          <span className="font-bold text-emerald-700">{staffInState} personnel</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Services Active:</span>
                          <span className="font-bold text-gray-800">{activeDeptServices} / {deptServices.length} চালু</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const catName = Object.keys(categoryDepartmentMap).find(
                            (k) => categoryDepartmentMap[k].toLowerCase() === dept.name.toLowerCase()
                          );
                          if (catName) {
                            setActiveMenu(catName);
                          } else {
                            setActiveMenu('Employees');
                          }
                        }}
                        className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Manage {dept.name} Staff & Services</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* VIEW: SERVER CONFIG ONLY VIEW */}
          {activeMenu === 'Server Config' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900">Server IP Configuration</h3>
                    <p className="text-xs text-gray-500">Configure central database and backend API communication socket</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Backend Server IP Address
                    </label>
                    <input
                      type="text"
                      value={serverIp}
                      onChange={(e) => setServerIp(e.target.value)}
                      placeholder="e.g. 192.168.1.10"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">Host endpoint used for real-time dispatching and sync</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Port Number
                    </label>
                    <input
                      type="text"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                      placeholder="e.g. 8080"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 font-mono font-medium focus:ring-2 focus:ring-emerald-500/20 text-sm"
                    />
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-sm text-gray-800 flex items-center gap-2">
                        <span>Connection Status:</span>
                        <span className="text-emerald-700 font-extrabold flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                          {status}
                        </span>
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">Last verified heartbeat: {lastChecked}</p>
                    </div>

                    <button
                      onClick={handleReconnect}
                      className="bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 font-bold px-4 py-2 rounded-xl flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer text-xs"
                    >
                      <RefreshCw className={`w-4 h-4 ${status === 'Connecting' ? 'animate-spin text-emerald-600' : ''}`} />
                      <span>{status === 'Connecting' ? 'Testing Connection...' : 'Reconnect Server'}</span>
                    </button>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => showToast(`Server settings saved (${serverIp}:${port})`)}
                    className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl text-sm shadow-2xs transition-colors cursor-pointer"
                  >
                    Save Server Configuration
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: THEME EDITOR ONLY VIEW */}
          {activeMenu === 'Theme Editor' && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                  <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                    <Palette className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-gray-900">System Theme Editor</h3>
                    <p className="text-xs text-gray-500">Customize color modes, accent color branding, and visual appearance</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Mode Selector */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Theme Mode</h4>
                      <p className="text-xs text-gray-500">Toggle light or dark visual presentation</p>
                    </div>
                    <div className="flex items-center bg-white p-1 rounded-xl border border-gray-200 shadow-2xs">
                      <button
                        onClick={() => {
                          setThemeMode('Light');
                          showToast('Switched to Light Mode');
                        }}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          themeMode === 'Light' ? 'bg-[#0f4d2a] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        <span>Light</span>
                      </button>
                      <button
                        onClick={() => {
                          setThemeMode('Dark');
                          showToast('Switched to Dark Mode');
                        }}
                        className={`px-4 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                          themeMode === 'Dark' ? 'bg-[#0f4d2a] text-white shadow-2xs' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        <span>Dark</span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Color Picker */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-sm text-gray-900">Primary Brand Accent Color</h4>
                        <p className="text-xs text-gray-500">Select standard HEX code for UI highlights</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="color"
                          value={primaryColor}
                          onChange={(e) => setPrimaryColor(e.target.value)}
                          className="w-9 h-9 rounded-xl cursor-pointer border border-gray-300"
                        />
                        <span className="font-mono text-gray-700 font-bold text-xs bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                          {primaryColor}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <span className="text-xs text-gray-500 font-semibold">Presets:</span>
                      {['#10B981', '#0f4d2a', '#16a34a', '#2563eb', '#7c3aed', '#ea580c'].map((color) => (
                        <button
                          key={color}
                          onClick={() => setPrimaryColor(color)}
                          className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform cursor-pointer"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Buttons */}
                  <div className="pt-2 flex items-center gap-3">
                    <button
                      onClick={() => showToast('Theme configuration saved!')}
                      className="flex-1 bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold py-2.5 rounded-xl text-sm shadow-2xs cursor-pointer transition-colors"
                    >
                      Save Theme
                    </button>
                    <button
                      onClick={() => {
                        setPrimaryColor('#10B981');
                        setThemeMode('Light');
                        showToast('Reset theme to default colors');
                      }}
                      className="flex-1 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-bold py-2.5 rounded-xl text-sm shadow-2xs cursor-pointer transition-colors"
                    >
                      Reset to Default
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: OTHER MANAGEMENT VIEWS (BOOKINGS, CATEGORIES, PRODUCTS, SEO, PAYROLL, ATTENDANCE, REPORTS, SETTINGS) */}
          {(activeMenu === 'Bookings' || activeMenu === 'Categories' || activeMenu === 'Products' || activeMenu === 'SEO & Coupons' || activeMenu === 'Payroll' || activeMenu === 'Attendance' || activeMenu === 'Reports' || activeMenu === 'Settings') && (
            <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
                <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                  {activeMenu === 'Payroll' && <CreditCard className="w-6 h-6" />}
                  {activeMenu === 'Attendance' && <Calendar className="w-6 h-6" />}
                  {activeMenu === 'Reports' && <BarChart3 className="w-6 h-6" />}
                  {activeMenu === 'Settings' && <Settings className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="font-black text-xl text-gray-900">{activeMenu} Management</h3>
                  <p className="text-xs text-gray-500">Live system tracking for all {activeMenu.toLowerCase()} operations</p>
                </div>
              </div>

              {activeMenu === 'Bookings' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-gray-900 text-sm">Recent Orders & Service Requests</h4>
                    <button className="text-xs font-bold text-emerald-700 flex items-center gap-1 hover:underline">
                      <Download className="w-3 h-3" /> Export CSV
                    </button>
                  </div>
                  <div className="overflow-x-auto border border-gray-100 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-gray-50 text-gray-500 uppercase font-bold border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-3">ID</th>
                          <th className="px-4 py-3">Item / Type</th>
                          <th className="px-4 py-3">Customer</th>
                          <th className="px-4 py-3">Amount</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {bookings.map((booking) => (
                          <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-mono font-bold text-gray-600">{booking.id}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {booking.type === 'Service' ? <Zap className="w-3 h-3 text-emerald-600" /> : <ShoppingBag className="w-3 h-3 text-blue-600" />}
                                <div>
                                  <p className="font-bold text-gray-900">{booking.itemName}</p>
                                  <p className="text-[10px] text-gray-400">{booking.type}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{booking.customerName}</p>
                              <p className="text-[10px] text-gray-400">{booking.customerPhone}</p>
                            </td>
                            <td className="px-4 py-3 font-bold text-emerald-700">৳ {booking.amount}</td>
                            <td className="px-4 py-3">
                              <select 
                                value={booking.status}
                                onChange={(e) => handleUpdateBookingStatus(booking.id, e.target.value as any)}
                                className={`text-[10px] font-bold px-2 py-1 rounded-full border-none focus:ring-0 cursor-pointer ${
                                  booking.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                                  booking.status === 'Pending' ? 'bg-amber-100 text-amber-800' :
                                  booking.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                                  'bg-blue-100 text-blue-800'
                                }`}
                              >
                                <option value="Pending">Pending</option>
                                <option value="Accepted">Accepted</option>
                                <option value="On Way">On Way</option>
                                <option value="Working">Working</option>
                                <option value="Completed">Completed</option>
                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{booking.date}</td>
                            <td className="px-4 py-3 text-right">
                              <button onClick={() => handleDeleteBooking(booking.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeMenu === 'Categories' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">Service Category Manager</h4>
                    <button onClick={() => showToast('Open Add Category Modal')} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Plus className="w-4 h-4" /> Add Category
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {categories.map((cat) => (
                      <div key={cat.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm relative group">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                            <Tag className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{cat.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{cat.id}</p>
                          </div>
                        </div>
                        <p className="text-[11px] text-gray-500 mb-3">{cat.subtext}</p>
                        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
                          <span className="text-[10px] font-bold text-emerald-600">{cat.providerCount}</span>
                          <div className="flex items-center gap-1">
                            <button className="p-1 text-gray-400 hover:text-emerald-600"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => handleDeleteCategory(cat.id)} className="p-1 text-gray-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'Products' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-gray-900 text-sm">Marketplace Inventory Control</h4>
                    <button className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                      <Plus className="w-4 h-4" /> Add Product
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {popularProducts.map((prod) => (
                      <div key={prod.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
                        <div className="h-32 bg-gray-50 p-4 relative">
                          <img src={prod.image} alt="" className="h-full w-full object-contain mx-auto" />
                          <span className="absolute top-2 right-2 px-2 py-0.5 bg-white/90 text-[10px] font-bold text-emerald-700 rounded-full border border-emerald-100">
                            {prod.category}
                          </span>
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <h5 className="font-bold text-gray-900 text-sm line-clamp-1">{prod.title}</h5>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-emerald-700 font-bold">৳ {prod.price}</span>
                              {prod.originalPrice > prod.price && <span className="text-gray-400 text-[10px] line-through">৳ {prod.originalPrice}</span>}
                            </div>
                          </div>
                          <div className="mt-4 flex items-center gap-2 pt-3 border-t border-gray-50">
                            <button className="flex-1 py-1.5 bg-gray-50 hover:bg-emerald-50 text-emerald-700 rounded-lg text-[11px] font-bold transition-colors">Edit</button>
                            <button onClick={() => handleDeleteProduct(prod.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeMenu === 'SEO & Coupons' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* SEO Control */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                      <Globe className="w-5 h-5 text-emerald-700" />
                      <h4 className="font-bold text-gray-900 text-sm">Search Engine Optimization (SEO)</h4>
                    </div>
                    <form onSubmit={handleUpdateSeo} className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Meta Title</label>
                        <input 
                          type="text" 
                          value={seoConfig.siteTitle} 
                          onChange={(e) => setSeoConfig({...seoConfig, siteTitle: e.target.value})}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Meta Description</label>
                        <textarea 
                          rows={3} 
                          value={seoConfig.siteDescription} 
                          onChange={(e) => setSeoConfig({...seoConfig, siteDescription: e.target.value})}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs resize-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1">Keywords (Comma Separated)</label>
                        <input 
                          type="text" 
                          value={seoConfig.keywords} 
                          onChange={(e) => setSeoConfig({...seoConfig, keywords: e.target.value})}
                          className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 text-xs" 
                        />
                      </div>
                      <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-colors">
                        Update Metadata
                      </button>
                    </form>
                  </div>

                  {/* System Control */}
                  <div className="space-y-6">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                        <Terminal className="w-5 h-5 text-amber-600" />
                        <h4 className="font-bold text-gray-900 text-sm">System Maintenance & Status</h4>
                      </div>
                      <div className="p-4 rounded-xl border flex items-center justify-between transition-colors bg-amber-50 border-amber-200">
                        <div>
                          <p className="font-bold text-amber-900 text-xs uppercase tracking-tight">Maintenance Mode</p>
                          <p className="text-[10px] text-amber-700 mt-0.5">Locks all public booking features for site maintenance.</p>
                        </div>
                        <button
                          onClick={handleToggleMaintenance}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                            maintenanceMode ? 'bg-amber-600' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">System Uptime</p>
                          <p className="text-sm font-black text-emerald-700">99.98%</p>
                        </div>
                        <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                          <p className="text-[10px] font-bold text-gray-400 uppercase">Load Avg</p>
                          <p className="text-sm font-black text-blue-700">0.24 ms</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#0f4d2a] p-5 rounded-2xl border border-emerald-900 shadow-sm space-y-3">
                      <div className="flex items-center gap-2 text-emerald-400">
                        <Activity className="w-5 h-5" />
                        <h4 className="font-bold text-sm">Real-time Performance</h4>
                      </div>
                      <p className="text-[10px] text-emerald-100 leading-relaxed">
                        Platform integrity is 100%. All dispatch channels are currently reachable via the configured server IP.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Payroll' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-bold uppercase">Monthly Payroll</p>
                      <h4 className="text-2xl font-black text-emerald-900 mt-1">৳ 8,45,000</h4>
                    </div>
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-xs text-blue-700 font-bold uppercase">Disbursed</p>
                      <h4 className="text-2xl font-black text-blue-900 mt-1">৳ 7,80,000</h4>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-700 font-bold uppercase">Pending</p>
                      <h4 className="text-2xl font-black text-amber-900 mt-1">৳ 65,000</h4>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">All direct payroll deposits to bKash, Nagad, and City Bank are fully verified.</p>
                </div>
              )}

              {activeMenu === 'Attendance' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <p className="text-xs text-emerald-700 font-bold uppercase">Present Today</p>
                      <h4 className="text-2xl font-black text-emerald-900 mt-1">18 (94.7%)</h4>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <p className="text-xs text-amber-700 font-bold uppercase">On Leave</p>
                      <h4 className="text-2xl font-black text-amber-900 mt-1">1 (5.3%)</h4>
                    </div>
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                      <p className="text-xs text-red-700 font-bold uppercase">Absent</p>
                      <h4 className="text-2xl font-black text-red-900 mt-1">0 (0%)</h4>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Reports' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-bold uppercase">Service Completion Rate</p>
                      <h4 className="text-2xl font-black text-gray-900 mt-1">98.4%</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-bold uppercase">Average Customer Rating</p>
                      <h4 className="text-2xl font-black text-emerald-700 mt-1">4.9 / 5.0</h4>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <p className="text-xs text-gray-500 font-bold uppercase">Monthly Growth</p>
                      <h4 className="text-2xl font-black text-emerald-700 mt-1">+24.8%</h4>
                    </div>
                  </div>
                </div>
              )}

              {activeMenu === 'Settings' && (
                <div className="space-y-4 text-xs">
                  {/* Commission Configuration */}
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                    <div className="flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-800" />
                      <p className="font-bold text-emerald-950 text-sm">Platform Commission Configuration (commission_config)</p>
                    </div>
                    <p className="text-emerald-800 text-xs">
                      Set marketplace platform commission rate percentage. When users pay for services, payment auto-splits between All Service BD and service providers.
                    </p>
                    <div className="flex items-center gap-3 pt-2">
                      <label className="text-xs font-bold text-gray-700">Platform Rate:</label>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={commissionRate}
                          onChange={(e) => {
                            const val = Math.min(100, Math.max(0, parseFloat(e.target.value) || 0));
                            setCommissionRate(val);
                          }}
                          className="w-20 px-3 py-1.5 border border-emerald-300 rounded-lg bg-white font-mono font-bold text-xs"
                        />
                        <span className="text-xs font-bold text-emerald-900">%</span>
                      </div>
                      <span className="text-xs text-gray-600 font-medium">
                        (Service Provider automatically gets {100 - commissionRate}%)
                      </span>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                    <p className="font-bold text-gray-800 text-sm">Super Admin Identity</p>
                    <p className="text-gray-500">Account: <strong>admin@allservicebd.com</strong> (Primary Master Key)</p>
                    <p className="text-gray-500">Security Clearance: <strong>Level 5 (Full Platform Control)</strong></p>
                  </div>
                  <button
                    onClick={() => showToast(`Preferences & Commission (${commissionRate}%) updated and saved`)}
                    className="px-4 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Save Preferences
                  </button>
                </div>
              )}
            </div>
          )}

          {/* VIEW: HOME PAGE CONTROL (BANNER, FOOTER TEXT) */}
          {activeMenu === 'HomePageControl' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                      <Layout className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">Home Page Control</h3>
                      <p className="text-xs text-gray-500">Configure hero promotional banner badges, promo codes, headline text, and footer copy</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    Live Auto-Sync
                  </span>
                </div>

                <form onSubmit={handleSaveHomepageConfig} className="space-y-6 text-xs">
                  {/* Banner Section */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Sparkles className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-extrabold text-sm text-gray-900">Hero Banner & Promotional Ribbon</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">
                          Promo Ribbon Badge Text
                        </label>
                        <input
                          type="text"
                          value={homepageConfig.heroBadge}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, heroBadge: e.target.value })}
                          placeholder="e.g. প্রথম সেবায় ২০% ছাড়"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Appears on promotional bar at top of banner</p>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">
                          Promo Discount Coupon Code
                        </label>
                        <input
                          type="text"
                          value={homepageConfig.promoCode}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, promoCode: e.target.value })}
                          placeholder="e.g. ALL20"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono font-bold text-xs uppercase focus:ring-2 focus:ring-emerald-500/20 text-emerald-800"
                        />
                        <p className="text-[10px] text-gray-400 mt-1">Code copied when user clicks "এখনই নিন"</p>
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Hero Main Headline
                      </label>
                      <input
                        type="text"
                        value={homepageConfig.heroHeadline}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, heroHeadline: e.target.value })}
                        placeholder="e.g. আপনার সব সেবা, এক জায়গায়"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Hero Subtitle / Description
                      </label>
                      <textarea
                        rows={2}
                        value={homepageConfig.heroSubtitle}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, heroSubtitle: e.target.value })}
                        placeholder="e.g. হাজারো বিশ্বস্ত সেবা এখন আপনার হাতের মুঠোয়..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium resize-none"
                      />
                    </div>
                  </div>

                  {/* Footer Text Section */}
                  <div className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4">
                    <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
                      <Layout className="w-4 h-4 text-emerald-700" />
                      <h4 className="font-extrabold text-sm text-gray-900">Footer Text & Description</h4>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Footer About Marketplace Description
                      </label>
                      <textarea
                        rows={3}
                        value={homepageConfig.footerAbout}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, footerAbout: e.target.value })}
                        placeholder="Description of All Service BD displayed in footer..."
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-medium"
                      />
                      <p className="text-[10px] text-gray-400 mt-1">Appears under brand logo in the website footer</p>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Service Coverage Text
                      </label>
                      <input
                        type="text"
                        value={homepageConfig.footerCoverage}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, footerCoverage: e.target.value })}
                        placeholder="e.g. ঢাকা, চট্টগ্রাম, সিলেট সহ বাংলাদেশের ৬৪টি জেলা জুড়ে।"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500/20 text-xs font-semibold"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <p className="text-gray-400 text-xs">Settings are saved in local storage and applied automatically.</p>
                    <button
                      type="submit"
                      className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Home Page Settings</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: PAYMENT METHODS (BKASH, NAGAD, ROCKET, COD) */}
          {activeMenu === 'PaymentMethods' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">Payment Methods Control</h3>
                      <p className="text-xs text-gray-500">Configure merchant payment gateways, wallet numbers, and customer payment visibility</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    payment_config
                  </span>
                </div>

                <form onSubmit={handleSavePaymentConfig} className="space-y-5 text-xs">
                  {/* bKash */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    paymentConfig.bkash.enabled ? 'bg-pink-50/40 border-pink-200' : 'bg-gray-50 border-gray-200 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#D12053] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          bK
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">bKash (বিকাশ) Payment Gateway</h4>
                          <p className="text-[11px] text-gray-500">Direct wallet / merchant payment method</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${paymentConfig.bkash.enabled ? 'text-pink-700' : 'text-gray-400'}`}>
                          {paymentConfig.bkash.enabled ? 'ENABLED (অন)' : 'DISABLED (বন্ধ)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPaymentConfig({
                            ...paymentConfig,
                            bkash: { ...paymentConfig.bkash, enabled: !paymentConfig.bkash.enabled }
                          })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            paymentConfig.bkash.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={paymentConfig.bkash.enabled}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              paymentConfig.bkash.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">bKash Account Number</label>
                        <input
                          type="text"
                          value={paymentConfig.bkash.number}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            bkash: { ...paymentConfig.bkash, number: e.target.value }
                          })}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Account Type</label>
                        <select
                          value={paymentConfig.bkash.type}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            bkash: { ...paymentConfig.bkash, type: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold"
                        >
                          <option value="Merchant">Merchant Account (0% user charge)</option>
                          <option value="Personal">Personal Account (Send Money)</option>
                          <option value="Agent">Agent Counter Account</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Nagad */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    paymentConfig.nagad.enabled ? 'bg-orange-50/40 border-orange-200' : 'bg-gray-50 border-gray-200 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#F7941D] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          নগদ
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Nagad (নগদ) Payment Gateway</h4>
                          <p className="text-[11px] text-gray-500">Post Office digital financial service</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${paymentConfig.nagad.enabled ? 'text-orange-700' : 'text-gray-400'}`}>
                          {paymentConfig.nagad.enabled ? 'ENABLED (অন)' : 'DISABLED (বন্ধ)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPaymentConfig({
                            ...paymentConfig,
                            nagad: { ...paymentConfig.nagad, enabled: !paymentConfig.nagad.enabled }
                          })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            paymentConfig.nagad.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={paymentConfig.nagad.enabled}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              paymentConfig.nagad.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Nagad Account Number</label>
                        <input
                          type="text"
                          value={paymentConfig.nagad.number}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            nagad: { ...paymentConfig.nagad, number: e.target.value }
                          })}
                          placeholder="01XXXXXXXXX"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Account Type</label>
                        <select
                          value={paymentConfig.nagad.type}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            nagad: { ...paymentConfig.nagad, type: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold"
                        >
                          <option value="Merchant">Merchant Account</option>
                          <option value="Personal">Personal Account</option>
                          <option value="Agent">Agent Account</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Rocket */}
                  <div className={`p-5 rounded-2xl border transition-all ${
                    paymentConfig.rocket.enabled ? 'bg-purple-50/40 border-purple-200' : 'bg-gray-50 border-gray-200 opacity-80'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#8B2C8D] text-white flex items-center justify-center font-extrabold text-sm shadow-xs">
                          DBBL
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">Rocket (রকেট - Dutch Bangla Bank)</h4>
                          <p className="text-[11px] text-gray-500">DBBL Mobile banking gateway</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-bold ${paymentConfig.rocket.enabled ? 'text-purple-700' : 'text-gray-400'}`}>
                          {paymentConfig.rocket.enabled ? 'ENABLED (অন)' : 'DISABLED (বন্ধ)'}
                        </span>
                        <button
                          type="button"
                          onClick={() => setPaymentConfig({
                            ...paymentConfig,
                            rocket: { ...paymentConfig.rocket, enabled: !paymentConfig.rocket.enabled }
                          })}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            paymentConfig.rocket.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                          }`}
                          role="switch"
                          aria-checked={paymentConfig.rocket.enabled}
                        >
                          <span
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              paymentConfig.rocket.enabled ? 'translate-x-5' : 'translate-x-0'
                            }`}
                          />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Rocket Account Number</label>
                        <input
                          type="text"
                          value={paymentConfig.rocket.number}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            rocket: { ...paymentConfig.rocket, number: e.target.value }
                          })}
                          placeholder="01XXXXXXXXXX"
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono font-bold text-xs"
                        />
                      </div>
                      <div>
                        <label className="block font-bold text-gray-700 uppercase mb-1">Account Type</label>
                        <select
                          value={paymentConfig.rocket.type}
                          onChange={(e) => setPaymentConfig({
                            ...paymentConfig,
                            rocket: { ...paymentConfig.rocket, type: e.target.value }
                          })}
                          className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white text-xs font-semibold"
                        >
                          <option value="Personal">Personal Account</option>
                          <option value="Merchant">Merchant Account</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Cash on Delivery */}
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">Cash on Delivery (ক্যাশ অন ডেলিভারি)</h4>
                      <p className="text-[11px] text-gray-500">Allow customers to pay technician in cash after service completion</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold ${paymentConfig.cod.enabled ? 'text-emerald-700' : 'text-gray-400'}`}>
                        {paymentConfig.cod.enabled ? 'ENABLED' : 'DISABLED'}
                      </span>
                      <button
                        type="button"
                        onClick={() => setPaymentConfig({
                          ...paymentConfig,
                          cod: { enabled: !paymentConfig.cod.enabled }
                        })}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                          paymentConfig.cod.enabled ? 'bg-[#10B981]' : 'bg-gray-300'
                        }`}
                        role="switch"
                        aria-checked={paymentConfig.cod.enabled}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                            paymentConfig.cod.enabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <p className="text-gray-400 text-xs">Saved settings auto-update payment options on customer interface.</p>
                    <button
                      type="submit"
                      className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Payment Methods</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: ADDRESS & CONTACT (HOTLINE, WHATSAPP, EMAIL, OFFICE ADDRESS, MAP LINK) */}
          {activeMenu === 'AddressContact' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-100 text-emerald-800 rounded-xl">
                      <MapPin className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-xl text-gray-900">Address & Contact Information</h3>
                      <p className="text-xs text-gray-500">Configure central hotline, WhatsApp support, office address, and Google Maps pin</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                    homepage_full_config
                  </span>
                </div>

                <form onSubmit={handleSaveHomepageConfig} className="space-y-5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Central Hotline Number
                      </label>
                      <div className="relative">
                        <PhoneCall className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          value={homepageConfig.hotline}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, hotline: e.target.value })}
                          placeholder="e.g. ০৯৬১২-০০০০০০"
                          className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">Displayed in website top bar and footer</p>
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Hotline Working Hours
                      </label>
                      <input
                        type="text"
                        value={homepageConfig.hotlineHours}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, hotlineHours: e.target.value })}
                        placeholder="e.g. সকাল ৮টা - রাত ১১টা"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-semibold text-xs focus:ring-2 focus:ring-emerald-500/20"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        WhatsApp Support Number
                      </label>
                      <input
                        type="text"
                        value={homepageConfig.whatsapp}
                        onChange={(e) => setHomepageConfig({ ...homepageConfig, whatsapp: e.target.value })}
                        placeholder="e.g. +8801712345678"
                        className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono font-bold text-xs focus:ring-2 focus:ring-emerald-500/20 text-emerald-800"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 uppercase mb-1">
                        Official Support Email
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                        <input
                          type="email"
                          value={homepageConfig.email}
                          onChange={(e) => setHomepageConfig({ ...homepageConfig, email: e.target.value })}
                          placeholder="e.g. support@allservicebd.com"
                          className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Head Office Address (Textarea)
                    </label>
                    <textarea
                      rows={3}
                      value={homepageConfig.officeAddress}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, officeAddress: e.target.value })}
                      placeholder="e.g. লেভেল-৫, মিরপুর ডিওএইচএস, ঢাকা-১২১৬"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-medium text-xs focus:ring-2 focus:ring-emerald-500/20"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Full physical headquarters address shown on homepage footer</p>
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 uppercase mb-1">
                      Google Maps Location Link
                    </label>
                    <input
                      type="url"
                      value={homepageConfig.mapLink}
                      onChange={(e) => setHomepageConfig({ ...homepageConfig, mapLink: e.target.value })}
                      placeholder="https://maps.google.com/?q=..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl bg-white font-mono text-xs focus:ring-2 focus:ring-emerald-500/20 text-blue-700"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Map pin redirection URL for customer directions</p>
                  </div>

                  <div className="flex items-center justify-between pt-3">
                    <p className="text-gray-400 text-xs">Saved contact info is instantly reflected across the customer app.</p>
                    <button
                      type="submit"
                      className="bg-[#0f4d2a] hover:bg-emerald-900 text-white font-bold px-6 py-2.5 rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer text-sm"
                    >
                      <Save className="w-4 h-4" />
                      <span>Save Address & Contact</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* VIEW: SUPER ADMIN PROFILE */}
          {activeMenu === 'Profile' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-2xs space-y-6">
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-2xl bg-[#0f4d2a] text-white flex items-center justify-center font-black text-2xl shadow-md border-2 border-emerald-400">
                    SA
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-2xl font-black text-gray-900">Super Administrator</h3>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        Root Access
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">admin@allservicebd.com</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase">Role</span>
                    <p className="font-bold text-gray-900 text-sm">Primary Master Keyholder</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase">Department</span>
                    <p className="font-bold text-gray-900 text-sm">Platform Engineering & Ops</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase">Commission Rate</span>
                    <p className="font-bold text-emerald-700 text-sm">{commissionRate}% Platform / {100 - commissionRate}% Provider</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-1">
                    <span className="text-gray-400 font-bold uppercase">Security Level</span>
                    <p className="font-bold text-gray-900 text-sm">Level 5 (Full System Authority)</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={() => setActiveMenu('HomePageControl')}
                    className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Layout className="w-4 h-4" />
                    <span>Home Page Control</span>
                  </button>
                  <button
                    onClick={() => setActiveMenu('PaymentMethods')}
                    className="flex-1 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Payment Methods</span>
                  </button>
                </div>

                {/* Admin Security Section */}
                <div className="pt-6 border-t border-gray-100 space-y-4">
                  <div className="flex items-center gap-2 text-red-700 font-bold text-sm">
                    <Shield className="w-4 h-4" />
                    <span>Admin Security & Access Control</span>
                  </div>
                  
                  <div className="bg-red-50/50 p-5 rounded-2xl border border-red-100 space-y-4">
                    <p className="text-xs text-red-800 font-medium leading-relaxed">
                      Security Alert: Changing the master admin password will take effect immediately. Ensure you remember the new password for future logins.
                    </p>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase ml-1">New Admin Password</label>
                        <div className="relative group">
                          <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input 
                            id="newAdminPass"
                            type="password" 
                            placeholder="Enter new strong password"
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-red-500/20"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => {
                          const el = document.getElementById('newAdminPass') as HTMLInputElement | null;
                          const newPass = el?.value;
                          if (newPass && newPass.length >= 6) {
                            if (onChangePassword) {
                              onChangePassword(newPass);
                              if (el) el.value = '';
                            }
                          } else {
                            showToast('Password must be at least 6 characters');
                          }
                        }}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>Update Admin Password</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================================= */}
      {/* USER MODALS (ADD, EDIT, BLOCK/UNBLOCK, DELETE) */}
      {/* ========================================================================= */}

      {/* MODAL: ADD NEW USER */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setIsAddUserModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Customer</h3>
                <p className="text-xs text-gray-500">Register new customer profile to user control directory</p>
              </div>
            </div>

            <form onSubmit={handleAddUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Arif Hossain"
                  value={newUser.name}
                  onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 01712-998877"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. arif.h@gmail.com"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Location Area</label>
                <input
                  type="text"
                  placeholder="e.g. Dhanmondi, Dhaka"
                  value={newUser.area}
                  onChange={(e) => setNewUser({ ...newUser, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create User</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT USER DETAILS */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Customer Information</h3>
                <p className="text-xs text-gray-500 font-mono">{editingUser.id}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditedUser} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Customer Name</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  value={editingUser.email}
                  onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Location Area</label>
                <input
                  type="text"
                  value={editingUser.area}
                  onChange={(e) => setEditingUser({ ...editingUser, area: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Total Orders</label>
                <input
                  type="number"
                  min="0"
                  value={editingUser.ordersCount}
                  onChange={(e) => setEditingUser({ ...editingUser, ordersCount: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM BLOCK / UNBLOCK USER */}
      {blockUserConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setBlockUserConfirm(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className={`p-3 rounded-2xl ${blockUserConfirm.willBlock ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-700'}`}>
                {blockUserConfirm.willBlock ? <Lock className="w-6 h-6" /> : <Unlock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {blockUserConfirm.willBlock ? 'Block User Account' : 'Unblock User Account'}
                </h3>
                <p className="text-xs text-gray-500">Security & permission management</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">User ID:</span>
                <span className="font-mono font-bold text-gray-800">{blockUserConfirm.user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Customer Name:</span>
                <span className="font-bold text-gray-900">{blockUserConfirm.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone:</span>
                <span className="font-mono text-gray-700">{blockUserConfirm.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-700">{blockUserConfirm.user.email}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {blockUserConfirm.willBlock ? (
                <span className="text-red-700 font-medium">
                  Warning: Blocking this user will restrict them from placing bookings, using wallet balance, or contacting assigned service staff.
                </span>
              ) : (
                <span className="text-emerald-800 font-medium">
                  Unblocking this user will restore full customer privileges and permit them to book all available home and office services.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlockUserConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockUser}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                  blockUserConfirm.willBlock
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {blockUserConfirm.willBlock ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                <span>{blockUserConfirm.willBlock ? 'Confirm Block' : 'Confirm Unblock'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE USER */}
      {deleteUserConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setDeleteUserConfirm(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete User Account</h3>
                <p className="text-xs text-red-600 font-medium">Permanent destructive action</p>
              </div>
            </div>

            <div className="bg-red-50/60 p-4 rounded-xl space-y-2 border border-red-200 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer Name:</span>
                <span className="font-bold text-gray-900">{deleteUserConfirm.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">User ID:</span>
                <span className="font-mono font-bold text-gray-800">{deleteUserConfirm.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Phone:</span>
                <span className="font-mono text-gray-800">{deleteUserConfirm.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Bookings:</span>
                <span className="font-bold text-emerald-800">{deleteUserConfirm.ordersCount}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete this customer record? All profile information, address books, and order relations will be purged from the system.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteUserConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteUser}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EMPLOYEE MODALS (ADD, EDIT, BLOCK/STATUS, DELETE, VIEW, ASSIGN, CHANGE ROLE) */}
      {/* ========================================================================= */}

      {/* MODAL: ADD NEW EMPLOYEE */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Employee</h3>
                <p className="text-xs text-gray-500">Register new staff to department directory</p>
              </div>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Ahmed"
                  value={newEmp.name}
                  onChange={(e) => setNewEmp({ ...newEmp, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. shakil.a@allservicebd.com"
                  value={newEmp.email}
                  onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Department</label>
                <select
                  value={newEmp.department}
                  onChange={(e) => setNewEmp({ ...newEmp, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Home Shifting">Home Shifting</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Beauty">Beauty (Beauty Salon)</option>
                  <option value="IT">IT (IT Support)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Role / Designation *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master Plumber or Senior Tutor"
                  value={newEmp.role}
                  onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={newEmp.status}
                  onChange={(e) => setNewEmp({ ...newEmp, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Save Employee</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: EDIT EMPLOYEE */}
      {editingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setEditingEmployee(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Edit Employee Record</h3>
                <p className="text-xs text-gray-500 font-mono">{editingEmployee.id} • {editingEmployee.name}</p>
              </div>
            </div>

            <form onSubmit={handleSaveEditedEmployee} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.name}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={editingEmployee.email}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Department</label>
                <select
                  value={editingEmployee.department}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, department: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Home Shifting">Home Shifting</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Beauty">Beauty</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Role / Designation</label>
                <input
                  type="text"
                  required
                  value={editingEmployee.role}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, role: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Status</label>
                <select
                  value={editingEmployee.status}
                  onChange={(e) => setEditingEmployee({ ...editingEmployee, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Active">Active</option>
                  <option value="On Leave">On Leave</option>
                  <option value="Inactive">Inactive / Suspended</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setEditingEmployee(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM BLOCK / STATUS EMPLOYEE */}
      {blockEmployeeConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setBlockEmployeeConfirm(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className={`p-3 rounded-2xl ${blockEmployeeConfirm.newStatus === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {blockEmployeeConfirm.newStatus === 'Active' ? <Unlock className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  {blockEmployeeConfirm.newStatus === 'Active' ? 'Reactivate Employee' : 'Block / Inactivate Employee'}
                </h3>
                <p className="text-xs text-gray-500">Personnel status management</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-200 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">Employee Name:</span>
                <span className="font-bold text-gray-900">{blockEmployeeConfirm.employee.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Employee ID:</span>
                <span className="font-mono font-bold text-gray-800">{blockEmployeeConfirm.employee.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Department:</span>
                <span className="font-bold text-emerald-800">{blockEmployeeConfirm.employee.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Current Status:</span>
                <span className="font-bold text-gray-700">{blockEmployeeConfirm.employee.status}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              {blockEmployeeConfirm.newStatus === 'Active' ? (
                <span>Are you sure you want to reactivate this employee? They will immediately become eligible to receive new service ticket assignments.</span>
              ) : (
                <span className="text-amber-800 font-medium">
                  Are you sure you want to mark this employee as Inactive / Blocked? They will be removed from customer dispatch and service call schedules.
                </span>
              )}
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setBlockEmployeeConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBlockEmployee}
                className={`px-5 py-2 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5 ${
                  blockEmployeeConfirm.newStatus === 'Active'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {blockEmployeeConfirm.newStatus === 'Active' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                <span>{blockEmployeeConfirm.newStatus === 'Active' ? 'Reactivate' : 'Confirm Block / Inactivate'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CONFIRM DELETE EMPLOYEE */}
      {deleteEmployeeConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setDeleteEmployeeConfirm(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 bg-red-100 text-red-600 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Delete Employee</h3>
                <p className="text-xs text-red-600 font-medium">Permanent personnel deletion</p>
              </div>
            </div>

            <div className="bg-red-50/60 p-4 rounded-xl space-y-2 border border-red-200 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Employee Name:</span>
                <span className="font-bold text-gray-900">{deleteEmployeeConfirm.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Employee ID:</span>
                <span className="font-mono font-bold text-gray-800">{deleteEmployeeConfirm.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="font-bold text-emerald-800">{deleteEmployeeConfirm.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Role:</span>
                <span className="font-medium text-gray-700">{deleteEmployeeConfirm.role}</span>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed mb-6">
              Are you sure you want to permanently delete this employee? Their profile, department allocation, and service logs will be permanently removed.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleteEmployeeConfirm(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteEmployee}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Permanently</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW EMPLOYEE DETAILS */}
      {viewingEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setViewingEmployee(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-5">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-md ${viewingEmployee.badgeBg}`}>
                {viewingEmployee.initials}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-gray-900">{viewingEmployee.name}</h3>
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                    viewingEmployee.status === 'Active'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : viewingEmployee.status === 'On Leave'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-red-100 text-red-700 border border-red-300'
                  }`}>
                    {viewingEmployee.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 font-mono mt-0.5">{viewingEmployee.id} • {viewingEmployee.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs mb-5">
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Department</span>
                <p className="font-bold text-emerald-800 text-sm mt-0.5">{viewingEmployee.department}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Role / Title</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewingEmployee.role}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Joined Date</span>
                <p className="font-bold text-gray-900 text-sm mt-0.5">{viewingEmployee.joined}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                <span className="text-gray-400 font-bold uppercase text-[10px]">Performance</span>
                <p className="font-bold text-emerald-700 text-sm mt-0.5">★ 4.9 (142 Jobs)</p>
              </div>
            </div>

            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/80 mb-5">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-xs mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Super Admin Verification & Audit</span>
              </div>
              <p className="text-[11px] text-emerald-900 leading-relaxed">
                Background verification verified on National ID (NID). Police clearance verified. Authorized for on-site client dispatch across {viewingEmployee.department} operations.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  const emp = viewingEmployee;
                  setViewingEmployee(null);
                  setEditingEmployee({ ...emp });
                }}
                className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setViewingEmployee(null)}
                className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ASSIGN TASK */}
      {assignTaskEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setAssignTaskEmployee(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Assign Dispatch Task</h3>
                <p className="text-xs text-gray-500">{assignTaskEmployee.name} ({assignTaskEmployee.department})</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Select Active Customer Ticket</label>
                <select id="assignedTaskSelect" className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20">
                  <option value={`${assignTaskEmployee.department} Order #BD-4091 (Dhanmondi, Dhaka)`}>
                    {assignTaskEmployee.department} Order #BD-4091 (Dhanmondi, Dhaka)
                  </option>
                  <option value={`${assignTaskEmployee.department} Order #BD-4092 (Gulshan-2, Dhaka)`}>
                    {assignTaskEmployee.department} Order #BD-4092 (Gulshan-2, Dhaka)
                  </option>
                  <option value={`${assignTaskEmployee.department} Order #BD-4093 (Uttara Sector 7)`}>
                    {assignTaskEmployee.department} Order #BD-4093 (Uttara Sector 7)
                  </option>
                  <option value={`${assignTaskEmployee.department} Emergency Inspection (Mirpur 10)`}>
                    {assignTaskEmployee.department} Emergency Inspection (Mirpur 10)
                  </option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Priority Level</label>
                <select className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20">
                  <option>Urgent / Immediate Dispatch (৩০ মিনিট)</option>
                  <option>Standard Schedule (আজ বিকাল)</option>
                  <option>Scheduled for Tomorrow</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Super Admin Dispatch Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Optional field instructions, customer notes, safety protocols..."
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAssignTaskEmployee(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('assignedTaskSelect') as HTMLSelectElement | null;
                    const val = el ? el.value : `${assignTaskEmployee.department} Service Ticket`;
                    handleSaveAssignTask(val);
                  }}
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Confirm Assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CHANGE ROLE */}
      {changeRoleEmployee && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setChangeRoleEmployee(null)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Change Role & Clearance</h3>
                <p className="text-xs text-gray-500">{changeRoleEmployee.name} ({changeRoleEmployee.id})</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Department</label>
                <select
                  id="changeRoleDeptSelect"
                  defaultValue={changeRoleEmployee.department}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option value="Cleaning">Cleaning</option>
                  <option value="Delivery">Delivery</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Electrical">Electrical</option>
                  <option value="AC Repair">AC Repair</option>
                  <option value="Home Shifting">Home Shifting</option>
                  <option value="Tutor">Tutor</option>
                  <option value="Beauty">Beauty</option>
                  <option value="IT">IT</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Select New Role Designation</label>
                <select id="changeRoleSelect" defaultValue={changeRoleEmployee.role} className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20">
                  <option value="Senior Lead Technician">Senior Lead Technician</option>
                  <option value="Department Supervisor">Department Supervisor</option>
                  <option value="Operations Coordinator">Operations Coordinator</option>
                  <option value="Certified Field Specialist">Certified Field Specialist</option>
                  <option value="Emergency Response Officer">Emergency Response Officer</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setChangeRoleEmployee(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const roleEl = document.getElementById('changeRoleSelect') as HTMLSelectElement | null;
                    const deptEl = document.getElementById('changeRoleDeptSelect') as HTMLSelectElement | null;
                    const newRole = roleEl ? roleEl.value : changeRoleEmployee.role;
                    const newDept = deptEl ? deptEl.value : changeRoleEmployee.department;
                    handleSaveChangeRole(newRole, newDept);
                  }}
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Shield className="w-4 h-4" />
                  <span>Update Role</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SERVICE */}
      {isAddServiceModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 relative animate-fade-in">
            <button
              onClick={() => setIsAddServiceModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="p-2.5 bg-emerald-100 text-emerald-900 rounded-xl">
                <Plus className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add New Service</h3>
                <p className="text-xs text-gray-500">Create a new service offering in the marketplace</p>
              </div>
            </div>

            <form onSubmit={handleAddService} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Service Name (English) *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Master AC Service"
                  value={newService.name}
                  onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Service Name (Bangla) *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: মাস্টার এসি সার্ভিস"
                  value={newService.banglaName}
                  onChange={(e) => setNewService({ ...newService, banglaName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Category</label>
                  <select
                    value={newService.category}
                    onChange={(e) => setNewService({ ...newService, category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Cleaning">Cleaning</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Plumbing">Plumbing</option>
                    <option value="Electrical">Electrical</option>
                    <option value="AC Repair">AC Repair</option>
                    <option value="Home Shifting">Home Shifting</option>
                    <option value="Tutor">Tutor</option>
                    <option value="Beauty">Beauty</option>
                    <option value="IT">IT</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 uppercase mb-1">Price (৳) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500"
                    value={newService.price}
                    onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 uppercase mb-1">Lead Time / Duration</label>
                <input
                  type="text"
                  placeholder="e.g. ৩০ মিনিট বা ১ ঘন্টা"
                  value={newService.leadTime}
                  onChange={(e) => setNewService({ ...newService, leadTime: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddServiceModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0f4d2a] hover:bg-emerald-900 text-white rounded-xl font-bold shadow-2xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Service</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#0f4d2a] text-white px-5 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-3 border border-emerald-700 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-emerald-300 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
