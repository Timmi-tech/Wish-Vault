import { useState, useCallback } from 'react';
import Navigation from '@/sections/Navigation';
import Hero from '@/sections/Hero';
import Wishlist from '@/sections/Wishlist';
import About from '@/sections/About';
import Footer from '@/sections/Footer';
import SendWishesModal from '@/components/SendWishesModal';
import Toast from '@/components/Toast';

function App() {
  const [sendWishesOpen, setSendWishesOpen] = useState(false);
  const [wishesToastVisible, setWishesToastVisible] = useState(false);

  const handleSendWishes = useCallback(() => {
    setSendWishesOpen(true);
  }, []);

  const handleCloseSendWishes = useCallback(() => {
    setSendWishesOpen(false);
  }, []);

  const handleCloseWishesToast = useCallback(() => {
    setWishesToastVisible(false);
  }, []);

  const scrollToWishlist = useCallback(() => {
    const el = document.getElementById('wishlist');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      <Navigation onSendWishes={handleSendWishes} />
      <Hero onExplore={scrollToWishlist} onSendWishes={handleSendWishes} />
      <Wishlist />
      <About />
      <Footer onSendWishes={handleSendWishes} />
      
      <SendWishesModal 
        isOpen={sendWishesOpen} 
        onClose={handleCloseSendWishes} 
      />

      <Toast
        message="Your wishes have been sent!"
        isVisible={wishesToastVisible}
        onHide={handleCloseWishesToast}
      />
    </div>
  );
}

export default App;
