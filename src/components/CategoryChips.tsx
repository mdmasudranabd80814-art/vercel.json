import React from 'react';
import { CATEGORIES } from '../data/marketplaceData';
import { useLanguage } from '../context/LanguageContext';

interface CategoryChipsProps {
  selectedCategoryId: string | null;
  onSelectCategory: (id: string | null) => void;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({
  selectedCategoryId,
  onSelectCategory,
}) => {
  const { language, t } = useLanguage();

  return (
    <div className="bg-emerald-50/60 border-b border-emerald-100/80 py-2.5 px-4 overflow-x-auto no-scrollbar">
      <div className="max-w-7xl mx-auto flex items-center gap-2 sm:gap-2.5 min-w-max justify-start md:justify-center">
        {/* All / সব অপশন */}
        <button
          onClick={() => onSelectCategory(null)}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none border ${
            selectedCategoryId === null
              ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
              : 'bg-white text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/70 hover:border-emerald-300'
          }`}
        >
          {t('সব ক্যাটাগরি', 'All Categories')}
        </button>

        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          const nameToDisplay = language === 'en' && cat.englishName ? cat.englishName : cat.name;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(isSelected ? null : cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer select-none border ${
                isSelected
                  ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-white text-emerald-900 border-emerald-200/90 hover:bg-emerald-100/70 hover:border-emerald-300'
              }`}
            >
              {nameToDisplay}
            </button>
          );
        })}
      </div>
    </div>
  );
};

