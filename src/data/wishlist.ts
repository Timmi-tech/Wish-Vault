export type Category = 'Fashion' | 'Beauty' | 'Shoes' | 'Accessories' | 'Tech' | 'Home' | 'Experiences' | 'Gifts';

export interface WishlistItem {
  id: number;
  name: string;
  category: Category;
  image: string;
  priority?: boolean;
}

export const categories: Category[] = ['Fashion', 'Beauty', 'Shoes', 'Accessories', 'Tech', 'Home', 'Experiences', 'Gifts'];

export const wishlistItems: WishlistItem[] = [
  { id: 1, name: 'Bone Straight Wig', category: 'Beauty', image: '/images/wishlist-bone-straight-wig.jpg' },
  { id: 2, name: 'Lace Front Wig', category: 'Beauty', image: '/images/wishlist-lace-front-wig.jpg' },
  { id: 3, name: 'Elegant Evening Gown', category: 'Fashion', image: '/images/wishlist-evening-gown.jpg' },
  { id: 4, name: 'Two-Piece Set', category: 'Fashion', image: '/images/wishlist-two-piece.jpg' },
  { id: 5, name: 'Stiletto Heels', category: 'Shoes', image: '/images/wishlist-stilettos.jpg' },
  { id: 6, name: 'Block Heel Sandals', category: 'Shoes', image: '/images/wishlist-block-heels.jpg' },
  { id: 7, name: 'Designer Tote Bag', category: 'Accessories', image: '/images/wishlist-tote-bag.jpg', priority: true },
  { id: 8, name: 'Mini Crossbody Bag', category: 'Accessories', image: '/images/wishlist-crossbody.jpg' },
  { id: 9, name: 'Cash Gift', category: 'Gifts', image: '/images/wishlist-cash.jpg' },
  { id: 10, name: 'MacBook Pro', category: 'Tech', image: '/images/wishlist-macbook.jpg' },
  { id: 11, name: 'Professional Photoshoot', category: 'Experiences', image: '/images/wishlist-photoshoot.jpg' },
  { id: 12, name: 'Surprise Gift Delivery', category: 'Experiences', image: '/images/wishlist-surprise.jpg' },
  { id: 13, name: 'Weekend Getaway', category: 'Experiences', image: '/images/wishlist-getaway.jpg' },
  { id: 14, name: 'Standing Fan', category: 'Home', image: '/images/wishlist-fan.jpg' },
  { id: 15, name: 'Split AC Unit', category: 'Home', image: '/images/wishlist-ac.jpg' },
  { id: 16, name: 'Solar Inverter', category: 'Home', image: '/images/wishlist-solar.jpg' },
  { id: 17, name: 'Comfy Sofa', category: 'Home', image: '/images/wishlist-sofa.jpg' },
  { id: 18, name: 'Non-Stick Pot Set', category: 'Home', image: '/images/wishlist-pots.jpg' },
  { id: 19, name: 'Deep Freezer', category: 'Home', image: '/images/wishlist-freezer.jpg' },
  { id: 20, name: 'White Sneakers', category: 'Shoes', image: '/images/wishlist-sneakers.jpg' },
  { id: 21, name: 'Gold Necklace', category: 'Accessories', image: '/images/wishlist-gold-necklace.jpg' },
  { id: 22, name: 'Silver Bracelet', category: 'Accessories', image: '/images/wishlist-silver-bracelet.jpg' },
  { id: 23, name: 'Floral Perfume', category: 'Beauty', image: '/images/wishlist-floral-perfume.jpg' },
  { id: 24, name: 'Vanilla Perfume', category: 'Beauty', image: '/images/wishlist-vanilla-perfume.jpg' },
  { id: 25, name: 'High-Waist Jeans', category: 'Fashion', image: '/images/wishlist-jeans.jpg' },
  { id: 26, name: 'Floral Midi Skirt', category: 'Fashion', image: '/images/wishlist-floral-skirt.jpg' },
  { id: 27, name: 'Basic Crop Tops', category: 'Fashion', image: '/images/wishlist-crop-tops.jpg' },
  { id: 28, name: 'Skincare Set', category: 'Beauty', image: '/images/wishlist-skincare.jpg' },
  { id: 29, name: 'New Phone (1TB)', category: 'Tech', image: '/images/wishlist-iphone.jpg' },
  { id: 30, name: 'Sony Camera', category: 'Tech', image: '/images/wishlist-camera.jpg' },
  { id: 31, name: 'Rose Gold Watch', category: 'Accessories', image: '/images/wishlist-watch.jpg' },
];

export const categoryColors: Record<Category, { bg: string; text: string }> = {
  'Fashion': { bg: 'bg-blush', text: 'text-navy' },
  'Beauty': { bg: 'bg-lavender/40', text: 'text-navy' },
  'Shoes': { bg: 'bg-mint/50', text: 'text-navy' },
  'Accessories': { bg: 'bg-peach/40', text: 'text-navy' },
  'Tech': { bg: 'bg-navy/5', text: 'text-navy' },
  'Home': { bg: 'bg-cream', text: 'text-navy' },
  'Experiences': { bg: 'bg-coral/20', text: 'text-navy' },
  'Gifts': { bg: 'bg-peach/30', text: 'text-navy' },
};
