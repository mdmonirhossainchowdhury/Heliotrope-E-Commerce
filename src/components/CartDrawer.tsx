import React from 'react';
import { X, Heart, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from './ProductCard';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{ product: Product; quantity: number }>;
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ 
  isOpen, 
  onClose, 
  items, 
  onUpdateQuantity, 
  onRemove,
  onCheckout
}) => {
  const total = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 flex flex-col h-full shadow-2xl"
      >
        <div className="p-8 flex items-center justify-between border-b border-white/5">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Your Bag</h2>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mt-1">
              {items.length} {items.length === 1 ? 'Item' : 'Items'}
            </p>
          </div>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
              <ShoppingBag size={64} className="mb-4" />
              <p className="font-bold text-lg">Your bag is empty</p>
              <p className="text-sm">Start adding artisan masterpieces.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4 group">
                <div className="w-24 h-24 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shrink-0">
                  <img src={item.product.imageUrl} className="w-full h-full object-cover" alt={item.product.title} />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="text-white font-black uppercase text-sm truncate">{item.product.title}</h3>
                    <p className="text-teal-400 text-xs font-bold mt-1">৳ {item.product.price.toLocaleString()}</p>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 bg-white/5 rounded-full px-3 py-1 border border-white/10">
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, -1)}
                        className="text-gray-500 hover:text-white transition-all"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="text-white font-black text-xs min-w-[12px] text-center">{item.quantity}</span>
                      <button 
                        onClick={() => onUpdateQuantity(item.product.id, 1)}
                        className="text-gray-500 hover:text-white transition-all"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button 
                      onClick={() => onRemove(item.product.id)}
                      className="text-gray-600 hover:text-red-500 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-8 border-t border-white/5 space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase font-black tracking-widest text-[10px]">Subtotal</span>
                <span className="text-white font-bold">৳ {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 uppercase font-black tracking-widest text-[10px]">Shipping</span>
                <span className="text-teal-500 font-bold uppercase text-[10px] tracking-widest">Calculated at checkout</span>
              </div>
              <div className="h-px bg-white/10 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-white font-black uppercase tracking-tighter text-xl">Total</span>
                <span className="text-2xl font-black text-teal-400">৳ {total.toLocaleString()}</span>
              </div>
            </div>

            <button 
              onClick={onCheckout}
              className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-xs tracking-[0.3em] py-5 rounded-2xl transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3 font-sans group"
            >
              Secure Checkout
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
