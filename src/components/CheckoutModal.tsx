import React, { useState, useRef } from 'react';
import { X, CreditCard, Wallet, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'react-hot-toast';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  total: number;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose, total }) => {
  const [method, setMethod] = useState<'visa' | 'bkash'>('visa');
  const [step, setStep] = useState<'selection' | 'details' | 'success'>('selection');
  const [loading, setLoading] = useState(false);
  const successSound = useRef(new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'));

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setLoading(false);
    setStep('success');
    successSound.current.play().catch(e => console.log('Audio blocked:', e));
    toast.success('Payment successful!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-[32px] overflow-hidden relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition-all z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-12">
          {step === 'success' ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-8 text-teal-400">
                <CheckCircle2 size={40} />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Shukriya!</h2>
              <p className="text-gray-400 mb-8 italic">Your order has been placed successfully. Our artisan will start preparing your masterpiece.</p>
              <button 
                onClick={onClose}
                className="w-full bg-teal-500 text-black font-black uppercase text-xs tracking-[0.3em] py-5 rounded-2xl hover:bg-teal-400 transition-all font-sans"
              >
                Back to Marketplace
              </button>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.3em] mb-2 block">Secure Checkout</span>
                <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Complete Payment</h2>
                <div className="mt-4 flex items-center gap-2 text-gray-400 text-xs">
                  <ShieldCheck size={14} className="text-teal-500" />
                  <span>Encrypted by SSL Protocol</span>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-8 flex justify-between items-center">
                <span className="text-gray-400 text-sm">Amount to Pay</span>
                <span className="text-2xl font-black text-white">৳ {total.toLocaleString()}</span>
              </div>

              <form onSubmit={handlePayment} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <button 
                    type="button"
                    onClick={() => setMethod('visa')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                      method === 'visa' 
                        ? 'bg-teal-500/10 border-teal-500 text-white' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    <CreditCard size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Visa / Master</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('bkash')}
                    className={`flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all ${
                      method === 'bkash' 
                        ? 'bg-[#E2136E]/10 border-[#E2136E] text-white' 
                        : 'bg-white/5 border-white/10 text-gray-500 hover:border-white/20'
                    }`}
                  >
                    <Wallet size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">bKash</span>
                  </button>
                </div>

                {method === 'visa' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-teal-400">Card Number</label>
                      <input 
                        type="text" 
                        placeholder="0000 0000 0000 0000"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500/50"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-teal-400">Expiry (MM/YY)</label>
                        <input 
                          type="text" 
                          placeholder="12/26"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500/50"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-widest font-black text-teal-400">CVC</label>
                        <input 
                          type="text" 
                          placeholder="123"
                          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-teal-500/50"
                          required
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest font-black text-[#E2136E]">bKash Number</label>
                      <input 
                        type="tel" 
                        placeholder="017XXXXXXXX"
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-[#E2136E]/50"
                        required
                      />
                    </div>
                    <p className="text-[10px] text-gray-500 italic">You will receive an OTP and PIN request from bKash to complete the transaction.</p>
                  </div>
                )}

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black font-black uppercase text-xs tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 font-sans"
                >
                  {loading ? 'Processing transaction...' : `Pay ৳ ${total.toLocaleString()}`}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
