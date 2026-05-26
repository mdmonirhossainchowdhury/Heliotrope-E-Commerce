import React from 'react';
import { Heart, ShoppingCart, Sparkles } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { motion } from 'motion/react';

export interface Product {
  id: string;
  title: string;
  price: number;
  category: string;
  imageUrl: string;
  sellerName: string;
  rating: number;
  isFeatured?: boolean;
}

interface ProductCardProps {
  product: Product;
  onTryOn: () => void;
  onAddToWishlist: () => void;
  onClick: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onTryOn, onAddToWishlist, onClick }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="group relative bg-white/5 border border-white/5 rounded-2xl overflow-hidden hover:border-teal-500/30 transition-all duration-500 cursor-pointer"
    >
      <div className="aspect-[4/5] relative overflow-hidden">
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-3">
          <button 
            onClick={onTryOn}
            className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-[10px] tracking-widest py-3 rounded-lg flex items-center justify-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform shadow-xl shadow-teal-500/20"
          >
            <Sparkles size={14} />
            Virtual Try-On
          </button>
        </div>
        
        <button 
          onClick={onAddToWishlist}
          className="absolute top-4 right-4 p-2 bg-black/40 backdrop-blur-md rounded-full border border-white/10 text-white hover:text-red-500 transition-all hover:scale-110 active:scale-95"
        >
          <Heart size={16} />
        </button>
      </div>

      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="text-[10px] uppercase tracking-widest text-teal-400 font-bold mb-1 block">
              {product.category}
            </span>
            <h3 className="text-white font-bold tracking-tight">{product.title}</h3>
          </div>
          <span className="text-white font-black text-sm">{formatPrice(product.price)}</span>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1.5 prose prose-invert">
            <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">H</div>
            <span className="text-[11px] text-gray-500 hover:text-white cursor-pointer transition-colors italic">{product.sellerName}</span>
          </div>
          <div className="flex items-center gap-1 text-teal-400">
            <span className="text-[11px] font-bold">★</span>
            <span className="text-[11px] font-bold text-gray-300">{product.rating}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
