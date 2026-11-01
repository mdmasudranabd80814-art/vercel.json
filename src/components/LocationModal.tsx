import React, { useState } from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { BANGLADESH_DISTRICTS, DHAKA_AREAS } from '../data/marketplaceData';
import { useLanguage } from '../context/LanguageContext';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  onSelectLocation: (locationStr: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const { t } = useLanguage();

  const [selectedDistrict, setSelectedDistrict] = useState('ঢাকা (Dhaka)');
  const [selectedArea, setSelectedArea] = useState('মিরপুর (Mirpur)');

  if (!isOpen) return null;

  const handleSave = () => {
    onSelectLocation(`${selectedArea}, ${selectedDistrict.split(' ')[0]}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-emerald-50/70">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-base">
              {t('আপনার এলাকা বা জেলা নির্বাচন করুন', 'Select Your Area or District')}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          <p className="text-xs text-gray-500">
            {t('আপনার নিকটবর্তী দক্ষ সার্ভিস প্রোভাইডার এবং দ্রুত ডেলিভারি নিশ্চিত করতে এলাকা সিলেক্ট করুন।', 'Select your area to find nearby experts and ensure fast delivery.')}
          </p>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('জেলা নির্বাচন করুন:', 'Select District:')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-xl">
              {BANGLADESH_DISTRICTS.map((dist) => (
                <button
                  key={dist}
                  onClick={() => setSelectedDistrict(dist)}
                  className={`p-2 text-left text-xs rounded-lg transition-all flex items-center justify-between ${
                    selectedDistrict === dist
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'hover:bg-emerald-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{dist}</span>
                  {selectedDistrict === dist && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">
              {t('এলাকা / জোন:', 'Area / Zone:')}
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto p-1 border border-gray-100 rounded-xl">
              {DHAKA_AREAS.map((a) => (
                <button
                  key={a}
                  onClick={() => setSelectedArea(a)}
                  className={`p-2 text-left text-xs rounded-lg transition-all flex items-center justify-between ${
                    selectedArea === a
                      ? 'bg-emerald-600 text-white font-bold'
                      : 'hover:bg-emerald-50 text-gray-700'
                  }`}
                >
                  <span className="truncate">{a}</span>
                  {selectedArea === a && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 text-gray-700 font-semibold text-xs rounded-xl hover:bg-gray-50"
            >
              {t('বাতিল', 'Cancel')}
            </button>
            <button
              onClick={handleSave}
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              {t('লোকেশন সেট করুন', 'Set Location')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

