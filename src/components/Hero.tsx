import React from 'react';
import { HeroBanner } from './HeroBanner';
import { useMarketplace } from '../context/MarketplaceContext';

const Hero: React.FC = () => {
  const { homeContent, setIsHowItWorksOpen, setSelectedCategoryId, setIsReferralOpen } = useMarketplace();

  const handleBookNowQuick = () => {
    const el = document.getElementById('services-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <HeroBanner
      onBookNow={handleBookNowQuick}
      onHowItWorks={() => setIsHowItWorksOpen(true)}
      onFilterCategory={(catId) => {
        setSelectedCategoryId(catId);
        const el = document.getElementById('services-section');
        el?.scrollIntoView({ behavior: 'smooth' });
      }}
      onOpenReferralModal={() => setIsReferralOpen(true)}
      content={homeContent}
    />
  );
};

export default Hero;
