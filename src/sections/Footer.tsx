import { ArrowUp } from 'lucide-react';

interface FooterProps {
  onSendWishes: () => void;
}

export default function Footer({ onSendWishes }: FooterProps) {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="relative bg-navy border-t border-white/10 py-16 sm:py-20 px-4 sm:px-6 overflow-hidden">
      <div className="max-w-[1280px] mx-auto">
        {/* Decorative Text */}
        <div className="absolute top-8 left-1/2 -translate-x-1/2 font-label text-[80px] sm:text-[120px] text-peach/[0.08] whitespace-nowrap pointer-events-none select-none tracking-widest">
          CELEBRATE
        </div>

        {/* Middle Row */}
        <div className="relative z-10 flex items-center justify-center gap-8 sm:gap-16 mt-12">
          <button
            onClick={() => scrollToSection('wishlist')}
            className="font-nav text-white hover:text-peach transition-colors duration-200"
          >
            Wishlist
          </button>

          {/* Logo */}
          <div className="w-12 h-12 rounded-full bg-peach flex items-center justify-center flex-shrink-0">
            <span className="font-label text-[12px] text-white">OR</span>
          </div>

          <button
            onClick={onSendWishes}
            className="font-nav text-white hover:text-peach transition-colors duration-200"
          >
            Send Wishes
          </button>
        </div>

        {/* Bottom */}
        <div className="relative z-10 mt-12 text-center">
          <p className="text-white/40 text-sm">
            Made with love for Oreoluwa&apos;s birthday
          </p>
        </div>
      </div>

      {/* Back to Top */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-50 w-10 h-10 rounded-full bg-navy/10 border border-navy/20 flex items-center justify-center text-navy hover:bg-peach hover:text-white hover:border-transparent transition-all duration-300 hover:-translate-y-1"
        aria-label="Back to top"
      >
        <ArrowUp className="w-4 h-4" />
      </button>
    </footer>
  );
}
