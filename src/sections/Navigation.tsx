import { useState, useEffect } from 'react';

interface NavigationProps {
  onSendWishes: () => void;
}

export default function Navigation({ onSendWishes }: NavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navLinks = [
    { label: 'Wishlist', id: 'wishlist' },
    { label: 'About', id: 'about' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] h-16 flex items-center transition-all duration-300 ${
        scrolled
          ? 'bg-cream/90 backdrop-blur-xl shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="w-full max-w-[1280px] mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="flex items-center gap-3"
        >
          <div className="w-9 h-9 rounded-full bg-peach flex items-center justify-center">
            <span className="font-label text-[11px] text-white">OR</span>
          </div>
          <span className="font-display text-xl text-navy hidden sm:block">Oreoluwa</span>
        </button>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="font-nav text-navy relative group py-1"
            >
              {link.label}
              <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mint opacity-0 group-hover:opacity-100 transition-all duration-250 translate-y-1 group-hover:translate-y-0" />
            </button>
          ))}
          <button
            onClick={onSendWishes}
            className="font-nav text-navy relative group py-1"
          >
            Send Wishes
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-mint opacity-0 group-hover:opacity-100 transition-all duration-250 translate-y-1 group-hover:translate-y-0" />
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className={`w-5 h-0.5 bg-navy transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`w-5 h-0.5 bg-navy transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-5 h-0.5 bg-navy transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
      </div>

      {/* Mobile Menu */}
      <div
        className={`absolute top-16 left-0 right-0 bg-cream/95 backdrop-blur-xl border-t border-navy/5 transition-all duration-300 md:hidden overflow-hidden ${
          mobileMenuOpen ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 py-4 space-y-3">
          {navLinks.map((link) => (
            <button
              key={link.id}
              onClick={() => scrollToSection(link.id)}
              className="block w-full text-left font-nav text-navy py-2"
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { onSendWishes(); setMobileMenuOpen(false); }}
            className="block w-full text-left font-nav text-navy py-2"
          >
            Send Wishes
          </button>
        </div>
      </div>
    </nav>
  );
}
