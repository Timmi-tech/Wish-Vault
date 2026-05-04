import { useState, useEffect, useCallback } from 'react';
import { X, Gift, Loader2 } from 'lucide-react';
import { submitClaim } from '@/services/api';
import type { WishlistItem } from '@/data/wishlist';

interface ClaimModalProps {
  item: WishlistItem | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimed: (itemId: number, isClaimed: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export default function ClaimModal({ item, isOpen, onClose, onClaimed }: ClaimModalProps) {
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '', message: '' });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const resetForm = useCallback(() => {
    setFormData({ name: '', email: '', phone: '', message: '' });
    setErrors({});
    setIsLoading(false);
    setIsSuccess(false);
    setError('');
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetForm();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, resetForm]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  const validate = (): boolean => {
    const newErrors: Partial<FormData> = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (formData.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !item) return;

    setIsLoading(true);
    setError('');

    try {
      const data = await submitClaim({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        message: formData.message || undefined,
        allowMultipleClaims: item.allowMultipleClaims,
      });

      if (data.success) {
        setIsSuccess(true);
        onClaimed(item.id, Boolean(data.isClaimed));
        setTimeout(() => {
          onClose();
        }, 3000);
      } else {
        setError(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Failed to submit. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy/60 backdrop-blur-sm"
        style={{ animation: 'fade-in-up 0.3s ease forwards' }}
      />

      {/* Modal Card */}
      <div
        className="relative w-full max-w-[480px] max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-modal p-8 sm:p-10"
        style={{ animation: 'modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards' }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-navy/5 flex items-center justify-center hover:bg-navy/10 transition-colors duration-200"
        >
          <X className="w-4 h-4 text-navy" />
        </button>

        {!isSuccess ? (
          <>
            {/* Gift Icon */}
            <div className="w-12 h-12 rounded-full bg-peach flex items-center justify-center mx-auto">
              <Gift className="w-5 h-5 text-white" />
            </div>

            {/* Header */}
            <h3 className="font-display text-[28px] sm:text-[36px] text-navy text-center mt-5 leading-tight">
              Claim This Gift
            </h3>
            <p className="text-sm text-navy/70 text-center mt-2">
              You&apos;re claiming: <span className="font-semibold">{item.name}</span>
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="font-label text-xs text-navy mb-1.5 block">Your Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className={`w-full h-12 px-4 rounded-xl border ${errors.name ? 'border-coral' : 'border-navy/10'} focus:border-peach focus:outline-none focus:ring-2 focus:ring-peach/20 text-navy text-[15px] placeholder:text-navy/30 transition-all duration-200`}
                />
                {errors.name && <p className="text-coral text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="font-label text-xs text-navy mb-1.5 block">Your Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email if you want"
                  className={`w-full h-12 px-4 rounded-xl border ${errors.email ? 'border-coral' : 'border-navy/10'} focus:border-peach focus:outline-none focus:ring-2 focus:ring-peach/20 text-navy text-[15px] placeholder:text-navy/30 transition-all duration-200`}
                />
                {errors.email && <p className="text-coral text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="font-label text-xs text-navy mb-1.5 block">Phone Number (optional)</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+234..."
                  className="w-full h-12 px-4 rounded-xl border border-navy/10 focus:border-peach focus:outline-none focus:ring-2 focus:ring-peach/20 text-navy text-[15px] placeholder:text-navy/30 transition-all duration-200"
                />
              </div>

              <div>
                <label className="font-label text-xs text-navy mb-1.5 block">Message (optional)</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Add a personal note..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-navy/10 focus:border-peach focus:outline-none focus:ring-2 focus:ring-peach/20 text-navy text-[15px] placeholder:text-navy/30 transition-all duration-200 resize-none"
                />
              </div>

              {error && (
                <p className="text-coral text-sm text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 rounded-full bg-peach text-white font-button text-sm hover:bg-coral hover:shadow-button transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  'Claim Gift'
                )}
              </button>
            </form>
          </>
        ) : (
          /* Success State */
          <div className="text-center py-4">
            {/* Checkmark */}
            <div className="w-16 h-16 rounded-full bg-mint flex items-center justify-center mx-auto animate-[modal-in_0.4s_cubic-bezier(0.34,1.56,0.64,1)_forwards]">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#15253E" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path
                  d="M5 12l5 5L20 7"
                  strokeDasharray="48"
                  strokeDashoffset="48"
                  style={{ animation: 'checkmark 0.6s ease-out 0.3s forwards' }}
                />
              </svg>
            </div>

            <h3 className="font-display text-[28px] text-navy mt-5 leading-tight">
              Thank You!
            </h3>
            <p className="text-sm text-navy/70 mt-2 max-w-[300px] mx-auto">
              Your gift has been claimed. Oreoluwa will be notified!
            </p>

            <button
              onClick={onClose}
              className="mt-6 h-11 px-8 rounded-full bg-navy text-white font-button text-sm hover:bg-navy/90 transition-colors duration-200"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
