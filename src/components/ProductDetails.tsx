import React from 'react';
import { X, Heart, ShoppingBag, Star, Share2, MapPin, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';
import { Product } from './ProductCard';

interface ProductDetailsProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onTryOn: (product: Product) => void;
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ 
  product, 
  isOpen, 
  onClose, 
  onAddToCart,
  onAddToWishlist,
  onTryOn
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/90 backdrop-blur-2xl"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-6xl h-[90vh] bg-[#0a0a0a] border border-white/10 rounded-[40px] overflow-hidden flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-8 right-8 text-white/50 hover:text-white transition-all z-20 hover:scale-110"
        >
          <X size={32} />
        </button>

        {/* Left: Image Showcase */}
        <div className="flex-1 bg-white/5 flex items-center justify-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.1),transparent_70%)]" />
          <img 
            src={product.imageUrl} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            alt={product.title} 
          />
          <div className="absolute bottom-10 left-10 flex gap-4">
             <button 
              onClick={() => onTryOn(product)}
              className="bg-white/10 backdrop-blur-3xl border border-white/20 text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest flex items-center gap-3 hover:bg-teal-500 hover:text-black transition-all group/btn"
             >
               <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse group-hover/btn:bg-black" />
               Virtual Try-On
             </button>
          </div>
        </div>

        {/* Right: Details */}
        <div className="w-full md:w-[450px] p-8 md:p-16 flex flex-col h-full bg-black">
          <div className="flex-1 overflow-y-auto no-scrollbar">
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-teal-500/10 text-teal-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-teal-500/20">
                    {product.category}
                  </span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={10} fill="currentColor" />
                    <span className="text-[10px] font-black">{product.rating}</span>
                  </div>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter leading-none mb-4">
                  {product.title}
                </h1>
                <div className="flex items-center gap-3 text-gray-500 text-xs font-bold italic">
                  <MapPin size={12} />
                  <span>Handcrafted by {product.sellerName}</span>
                </div>
              </div>

              <div className="space-y-4">
                <p className="text-gray-400 leading-relaxed text-sm">
                  This authentic {product.title.toLowerCase()} is a testament to heritage craftsmanship. Meticulously handcrafted by local artisans, it blends traditional techniques with contemporary elegance. Each stitch, stroke, and detail tells a story of cultural preservation.
                </p>
                <div className="grid grid-cols-2 gap-4">
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <Truck size={18} className="text-teal-400 mb-2" />
                      <p className="text-white text-[10px] font-black uppercase tracking-widest">Free Express</p>
                   </div>
                   <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <RefreshCcw size={18} className="text-teal-400 mb-2" />
                      <p className="text-white text-[10px] font-black uppercase tracking-widest">Artesian Cert</p>
                   </div>
                </div>
              </div>

              <div className="h-px bg-white/10" />

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-[10px] uppercase font-black tracking-widest mb-1">Direct Price</p>
                  <p className="text-4xl font-black text-white">৳ {product.price.toLocaleString()}</p>
                </div>
                <button onClick={() => onAddToWishlist(product)} className="w-14 h-14 rounded-2xl border border-white/10 flex items-center justify-center text-gray-500 hover:text-red-500 hover:border-red-500/30 transition-all active:scale-95">
                  <Heart size={24} />
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-auto flex flex-col gap-4">
            <button 
              onClick={() => onAddToCart(product)}
              className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-xs tracking-[0.3em] py-6 rounded-[24px] transition-all shadow-2xl shadow-teal-500/20 flex items-center justify-center gap-3 active:scale-95"
            >
              <ShoppingBag size={20} />
              ADD TO CART FOR PAYMENT
            </button>
            <div className="flex items-center justify-center gap-2 text-gray-600">
               <ShieldCheck size={14} />
               <span className="text-[10px] uppercase font-black tracking-widest">Artisan Authenticity Guaranteed</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
