import React, { useEffect, useState } from 'react';
import { X, Trash2, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { formatPrice } from '../lib/utils';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WishlistDrawer: React.FC<WishlistDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'wishlists'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return unsubscribe;
  }, [user]);

  const removeItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'wishlists', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[400] bg-black/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gray-950 border-l border-white/10 z-[500] flex flex-col"
          >
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Your Wishlist</h2>
                <span className="text-[10px] uppercase font-black tracking-widest text-teal-400">{items.length} Saved Items</span>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-500 transition-all">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                  <ShoppingBag size={48} className="text-gray-800" />
                  <p className="text-gray-500 italic">Your wishlist is empty. Explore the marketplace to find artisan treasures.</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-teal-500/30 transition-all">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-black shrink-0">
                      <img src={item.imageUrl} alt="Product" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-bold truncate text-sm">{item.title || 'Artisan Product'}</h4>
                      <p className="text-teal-400 font-bold text-xs mt-1">{formatPrice(item.price || 5000)}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all self-center"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-8 border-t border-white/5 bg-black/40">
                <button className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-xs tracking-widest py-5 rounded-2xl transition-all shadow-xl shadow-teal-500/20">
                  Add All to Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
