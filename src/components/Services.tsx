import React from 'react';
import { ServiceCategoriesGrid } from './ServiceCategoriesGrid';
import { PopularServices } from './PopularServices';
import { PopularProducts } from './PopularProducts';
import { TestimonialsSlider } from './TestimonialsSlider';
import { ServiceCoverageMap } from './ServiceCoverageMap';
import { TrustStatsBar } from './TrustStatsBar';
import { OrderHistoryView } from './OrderHistoryView';
import { Footer } from './Footer';
import { MobileBottomNav } from './MobileBottomNav';
import { BookingModal } from './BookingModal';
import { ProductDetailModal } from './ProductDetailModal';
import { CartDrawer } from './CartDrawer';
import { LocationModal } from './LocationModal';
import { HowItWorksModal } from './HowItWorksModal';
import { ReferralModal } from './ReferralModal';
import { LoginModal } from './LoginModal';
import { SellerHubModal } from './SellerHubModal';
import { WhatsAppButton } from './WhatsAppButton';
import { ToastContainer } from './ToastContainer';
import { useMarketplace } from '../context/MarketplaceContext';
import { POPULAR_SERVICES } from '../data/marketplaceData';

const Services: React.FC = () => {
  const {
    activeNav, setActiveNav,
    selectedCategoryId, setSelectedCategoryId,
    searchQuery,
    handleAddToCart,
    cartItems,
    handleUpdateQuantity,
    handleRemoveFromCart,
    handleClearCart,
    totalCartCount,
    isCartOpen, setIsCartOpen,
    isLocationModalOpen, setIsLocationModalOpen,
    selectedLocation, setSelectedLocation,
    isHowItWorksOpen, setIsHowItWorksOpen,
    isReferralOpen, setIsReferralOpen,
    isLoginOpen, setIsLoginOpen,
    isSellerHubOpen, setIsSellerHubOpen,
    activeBookingService, setActiveBookingService,
    activeDetailProduct, setActiveDetailProduct,
    initialBookingCoupon, setInitialBookingCoupon,
    toasts, handleDismissToast,
    homeContent
  } = useMarketplace();

  const handleBookNowQuick = () => {
    const el = document.getElementById('services-section');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <ToastContainer
        toasts={toasts}
        onDismiss={handleDismissToast}
        onViewOrder={() => setActiveNav('orders')}
      />

      <main className="flex-1">
        {activeNav === 'orders' ? (
          <OrderHistoryView
            onReturnHome={() => setActiveNav('home')}
            onOpenCart={() => setIsCartOpen(true)}
            onAddToCart={handleAddToCart}
            onOpenBookingModal={(serviceId) => {
              if (serviceId) {
                const service = POPULAR_SERVICES.find(s => s.id === serviceId);
                if (service) setActiveBookingService(service);
              } else {
                setActiveBookingService(POPULAR_SERVICES[0]);
              }
            }}
          />
        ) : (
          <>
            <ServiceCategoriesGrid
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={(id) => {
                setSelectedCategoryId(id);
                const el = document.getElementById('services-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
            />

            <PopularServices
              onBookService={(service) => setActiveBookingService(service)}
              selectedCategory={selectedCategoryId}
              searchQuery={searchQuery}
            />

            <PopularProducts
              onAddToCart={(product) => handleAddToCart(product)}
              onOpenProductDetail={(product) => setActiveDetailProduct(product)}
              addedProductIds={cartItems.map((i) => i.product.id)}
              searchQuery={searchQuery}
            />

            <div id="testimonials-section">
              <TestimonialsSlider />
            </div>

            <ServiceCoverageMap />
            <TrustStatsBar />
          </>
        )}
      </main>

      <Footer
        onSelectCategory={(catId) => {
          setSelectedCategoryId(catId);
          window.scrollTo({ top: 400, behavior: 'smooth' });
        }}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        content={homeContent}
      />

      <MobileBottomNav
        activeTab={activeNav}
        setActiveTab={setActiveNav}
        onOpenCart={() => setIsCartOpen(true)}
        cartCount={totalCartCount}
        onOpenLogin={() => setIsLoginOpen(true)}
        onOpenSellerHub={() => setIsSellerHubOpen(true)}
      />

      {/* Modals */}
      <BookingModal
        service={activeBookingService}
        onClose={() => {
          setActiveBookingService(null);
          setInitialBookingCoupon(undefined);
        }}
        selectedLocation={selectedLocation}
        initialCouponCode={initialBookingCoupon}
      />

      <ProductDetailModal
        product={activeDetailProduct}
        onClose={() => setActiveDetailProduct(null)}
        onAddToCart={(prod, qty) => handleAddToCart(prod, qty)}
        isAdded={activeDetailProduct ? cartItems.some((i) => i.product.id === activeDetailProduct.id) : false}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
      />

      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={selectedLocation}
        onSelectLocation={(newLoc) => setSelectedLocation(newLoc)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onBookNow={handleBookNowQuick}
      />

      <ReferralModal
        isOpen={isReferralOpen}
        onClose={() => setIsReferralOpen(false)}
        onOpenBookingWithCoupon={(code) => {
          setInitialBookingCoupon(code);
          setActiveBookingService(POPULAR_SERVICES[0]);
        }}
        onOpenCartWithCoupon={() => setIsCartOpen(true)}
      />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onOpenReferralModal={() => setIsReferralOpen(true)}
        onOpenSellerHub={() => setIsSellerHubOpen(true)}
        onOpenOrders={() => {
          setActiveNav('orders');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <SellerHubModal
        isOpen={isSellerHubOpen}
        onClose={() => setIsSellerHubOpen(false)}
      />

      <WhatsAppButton />
    </>
  );
};

export default Services;
