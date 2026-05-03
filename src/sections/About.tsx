import { useEffect, useRef } from 'react';

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = section.querySelectorAll('[data-animate]');
            elements.forEach((el) => {
              const htmlEl = el as HTMLElement;
              const delay = parseFloat(htmlEl.dataset.delay || '0');
              htmlEl.style.transition = `opacity 0.4s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s, transform 0.4s cubic-bezier(0.33, 1, 0.68, 1) ${delay}s`;
              htmlEl.style.opacity = '1';
              htmlEl.style.transform = 'translateY(0)';
            });
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(section);

    // Set initial state
    const elements = section.querySelectorAll('[data-animate]');
    elements.forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.style.opacity = '0';
      htmlEl.style.transform = 'translateY(30px)';
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    { value: '31', label: 'Wishlist Items' },
    { value: '\u221E', label: 'Gratitude' },
  ];

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-20 sm:py-28 lg:py-32 px-4 sm:px-6 bg-navy"
    >
      <div className="max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">
          {/* Left Column */}
          <div>
            <p
              data-animate
              data-delay="0"
              className="font-label text-peach tracking-widest mb-4"
            >
              ABOUT THE BIRTHDAY GIRL
            </p>

            <h2
              data-animate
              data-delay="0.15"
              className="font-display text-[36px] sm:text-[48px] lg:text-[52px] text-white leading-tight tracking-[-0.02em]"
            >
              A Little About Me
            </h2>

            <p
              data-animate
              data-delay="0.3"
              className="text-white/70 text-[15px] sm:text-[17px] leading-relaxed mt-6 max-w-[500px]"
            >
              Hi, I&apos;m Oreoluwa! I&apos;m so grateful for another year of life, love, and growth. I&apos;ve put together this wishlist with things that would truly make me happy - from fashion finds to home essentials. Whether you choose a gift or simply send your warm wishes, your thoughtfulness means everything to me. Thank you for being part of my journey!
            </p>
          </div>

          {/* Right Column */}
          <div className="relative">
            {/* Decorative initial */}
            <div
              data-animate
              data-delay="0.3"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[180px] sm:text-[200px] text-peach/10 pointer-events-none select-none leading-none"
            >
              O
            </div>

            {/* Stats */}
            <div className="relative z-10 space-y-6 sm:space-y-8">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  data-animate
                  data-delay={`${0.4 + i * 0.1}`}
                >
                  <div className="font-display text-[36px] sm:text-[40px] text-peach leading-none">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-sm mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

