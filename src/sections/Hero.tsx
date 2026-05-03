import { useEffect, useRef } from 'react';

interface HeroProps {
  onExplore: () => void;
  onSendWishes: () => void;
}

export default function Hero({ onExplore, onSendWishes }: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const elements = section.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      const delay = parseFloat(htmlEl.dataset.delay || '0');
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(20px)';
      htmlEl.style.transition = `opacity 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s, transform 0.6s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          htmlEl.style.opacity = '1';
          htmlEl.style.transform = 'translateY(0)';
        });
      });
    });
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 overflow-hidden"
      style={{
        background: 'radial-gradient(ellipse at 90% 10%, rgba(253, 186, 187, 0.2) 0%, transparent 50%)',
      }}
    >
      {/* Floating Decorative Circles */}
      <div
        className="absolute top-[15%] right-[10%] w-20 h-20 rounded-full bg-lavender/30 animate-float pointer-events-none"
      />
      <div
        className="absolute top-[60%] left-[8%] w-[60px] h-[60px] rounded-full bg-mint/25 animate-float-slow pointer-events-none"
      />
      <div
        className="absolute bottom-[20%] right-[25%] w-[100px] h-[100px] rounded-full bg-blush/40 animate-float-slower pointer-events-none"
      />
      <div
        className="absolute top-[30%] left-[15%] w-10 h-10 rounded-full bg-peach/20 animate-float pointer-events-none"
        style={{ animationDelay: '2s' }}
      />
      <div
        className="absolute bottom-[35%] right-[8%] w-14 h-14 rounded-full bg-coral/15 animate-float-slow pointer-events-none"
        style={{ animationDelay: '1.5s' }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-[600px]">
        {/* Label */}
        <p data-animate data-delay="0.2" className="font-label text-lavender tracking-widest mb-6">
          BIRTHDAY WISHLIST 2026
        </p>

        {/* H1 */}
        <h1 data-animate data-delay="0.4" className="font-display text-[48px] sm:text-[64px] lg:text-[80px] text-navy leading-[1] tracking-[-0.02em]">
          Make My{' '}
          <span className="text-gradient-peach">Day</span>
        </h1>

        {/* Subtitle */}
        <p data-animate data-delay="0.6" className="text-navy/70 text-[15px] sm:text-[17px] leading-relaxed mt-6 max-w-[480px] mx-auto">
          Celebrate me by making my wishes come true. Here&apos;s my curated wishlist — pick something special or just send good vibes!
        </p>

        {/* CTA Button */}
        <div data-animate data-delay="0.8" className="mt-8">
          <button
            onClick={onExplore}
            className="inline-flex items-center justify-center h-12 px-8 rounded-full border border-navy/20 bg-white text-navy font-button text-sm hover:bg-peach hover:border-transparent hover:text-white hover:shadow-button transition-all duration-300 hover:scale-[1.03]"
          >
            Explore My Wishlist
          </button>
        </div>

        {/* Secondary CTA */}
        <div data-animate data-delay="0.9" className="mt-4">
          <button
            onClick={onSendWishes}
            className="text-navy/50 text-sm font-body hover:text-peach transition-colors duration-200 underline underline-offset-4"
          >
            or Send Wishes
          </button>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div
        data-animate
        data-delay="1.1"
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-navy/20 flex items-start justify-center p-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-navy/40 animate-bounce" />
        </div>
      </div>
    </section>
  );
}
