import React, { useState, useEffect } from 'react';
import { 
  Zap, Wrench, Sparkles, GraduationCap, Wind, 
  HeartHandshake, Home, Paintbrush, ChevronRight, ChevronDown 
} from 'lucide-react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { useLanguage } from '../context/LanguageContext';

interface Category {
  id: string;
  name: string;
  banglaName: string;
  icon: string;
  image: string;
  enabled: boolean;
}

interface ServiceCategoriesGridProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const ServiceCategoriesGrid: React.FC<ServiceCategoriesGridProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();
  const [showAll, setShowAll] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'categories'), where('enabled', '==', true), orderBy('order', 'asc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setCategories(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Category)));
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });
    return () => unsub();
  }, []);

  const getIcon = (icon: string) => {
    // Check if it's an emoji or a Lucide icon name
    const lucideIcons: any = { Zap, Wrench, Sparkles, GraduationCap, Wind, HeartHandshake, Home, Paintbrush };
    if (lucideIcons[icon]) {
      const IconComp = lucideIcons[icon];
      return <IconComp className="w-7 h-7 sm:w-8 sm:h-8" />;
    }
    return <span className="text-3xl">{icon || '📦'}</span>;
  };

  const displayedCategories = showAll ? categories : categories.slice(0, 8);

  if (categories.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-6" id="categories-section">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-6 bg-emerald-600 rounded-full" />
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            {t('সেবা ক্যাটাগরি', 'Service Categories')}
          </h2>
          <span className="text-xs font-medium text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full hidden sm:inline">
            {t(`${categories.length}টি ক্যাটাগরি`, `${categories.length} Categories`)}
          </span>
        </div>

        {categories.length > 4 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-emerald-700 hover:text-emerald-800 text-sm font-semibold flex items-center gap-1 group cursor-pointer transition-colors"
          >
            <span>{showAll ? t('কম দেখুন', 'Show Less') : t('সব দেখুন', 'View All')}</span>
            {showAll ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 xl:grid-cols-6 gap-3 sm:gap-4">
        {displayedCategories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const mainTitle = language === 'en' ? cat.name : (cat.banglaName || cat.name);
          const subtitle = language === 'en' ? (cat.banglaName || cat.name) : cat.name;

          return (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`group relative p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col items-center text-center justify-between min-h-[140px] sm:min-h-[160px] ${
                isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/30' : 'bg-white hover:bg-emerald-50/40 border-emerald-100 shadow-xs'
              }`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-105 ${isSelected ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white'}`}>
                {cat.image ? <img src={cat.image} className="w-10 h-10 object-contain" alt="" /> : getIcon(cat.icon)}
              </div>
              <div className="mt-2.5 w-full">
                <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-emerald-700">{mainTitle}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase mt-1">{subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

