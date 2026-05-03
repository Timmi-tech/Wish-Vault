import { useState, useEffect, useRef, useCallback } from 'react';
import { Star } from 'lucide-react';
import { wishlistItems, categories, categoryColors, type Category, type WishlistItem } from '@/data/wishlist';
import ClaimModal from '@/components/ClaimModal';
import Toast from '@/components/Toast';

export default function Wishlist() {
  const [activeCategory, setActiveCategory] = useState<Category | 'All'>('All');
  const [filteredItems, setFilteredItems] = useState(wishlistItems);
  const [claimedItems, setClaimedItems] = useState<Set<number>>(new Set());
  const [selectedItem, setSelectedItem] = useState<WishlistItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const sectionRef = useRef<HTMLElement>(null);

  // Filter items
  useEffect(() => {
    if (activeCategory === 'All') {
      setFilteredItems(wishlistItems);
    } else {
      setFilteredItems(wishlistItems.filter(item => item.category === activeCategory));
    }
  }, [activeCategory]);

  // Intersection Observer for card animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.getAttribute('data-id') || '0');
            setVisibleCards(prev => new Set(prev).add(id));
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const cards = sectionRef.current?.querySelectorAll('[data-id]');
    cards?.forEach(card => observer.observe(card));

    return () => observer.disconnect();
  }, [filteredItems]);

  const handleClaim = useCallback((item: WishlistItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  }, []);

  const handleClaimed = useCallback((itemId: number) => {
    setClaimedItems(prev => new Set(prev).add(itemId));
    setToastVisible(true);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastVisible(false);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="wishlist"
        className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6"
      >
        <div className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="font-display text-[36px] sm:text-[48px] lg:text-[52px] text-navy leading-tight tracking-[-0.02em]">
              The Wishlist
            </h2>
            <p className="text-navy/70 text-[15px] sm:text-[17px] mt-3">
              31 things that would make me smile
            </p>
          </div>

          {/* Category Filters */}
          <div className="flex justify-center mb-10">
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 px-1">
              <button
                onClick={() => setActiveCategory('All')}
                className={`flex-shrink-0 h-8 px-4 rounded-lg font-label text-[11px] transition-all duration-200 ${
                  activeCategory === 'All'
                    ? 'bg-navy text-white'
                    : 'bg-navy/5 text-navy hover:bg-navy/10'
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 h-8 px-4 rounded-lg font-label text-[11px] transition-all duration-200 ${
                    activeCategory === cat
                      ? 'bg-navy text-white'
                      : 'bg-navy/5 text-navy hover:bg-navy/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
            {filteredItems.map((item, index) => {
              const isClaimed = claimedItems.has(item.id);
              const isVisible = visibleCards.has(item.id);
              const colors = categoryColors[item.category];

              return (
                <div
                  key={item.id}
                  data-id={item.id}
                  className={`group bg-white rounded-2xl shadow-card overflow-hidden transition-all duration-350 hover:shadow-card-hover hover:-translate-y-1 hover:scale-[1.01] ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-10'
                  }`}
                  style={{
                    transitionDelay: `${index * 0.05}s`,
                    transitionTimingFunction: 'cubic-bezier(0.33, 1, 0.68, 1)',
                  }}
                >
                  {/* Image */}
                  <div className="relative aspect-[3/4] overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading={index < 4 ? 'eager' : 'lazy'}
                      className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105"
                    />

                    {/* Priority Badge */}
                    {item.priority && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 h-6 px-2.5 rounded-lg bg-coral text-white">
                        <Star className="w-3 h-3 fill-white" />
                        <span className="font-label text-[10px]">Priority</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-5">
                    {/* Category Tag */}
                    <span className={`inline-flex items-center h-6 px-2.5 rounded-lg ${colors.bg} ${colors.text} font-label text-[10px]`}>
                      {item.category}
                    </span>

                    {/* Item Name */}
                    <h3 className="text-navy text-[14px] sm:text-[15px] font-semibold mt-2 leading-snug line-clamp-2">
                      {item.name}
                    </h3>

                    {/* Claim Button */}
                    <button
                      onClick={() => !isClaimed && handleClaim(item)}
                      disabled={isClaimed}
                      className={`w-full h-10 mt-3 rounded-full font-button text-[12px] transition-all duration-200 ${
                        isClaimed
                          ? 'bg-mint text-navy cursor-default'
                          : 'bg-navy text-white hover:bg-coral'
                      }`}
                    >
                      {isClaimed ? 'Claimed \u2713' : 'Claim Gift'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Claim Modal */}
      <ClaimModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClaimed={handleClaimed}
      />

      {/* Toast */}
      <Toast
        message="Gift claimed successfully!"
        isVisible={toastVisible}
        onHide={handleCloseToast}
      />
    </>
  );
}
