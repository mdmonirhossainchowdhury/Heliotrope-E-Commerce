import React, { useState } from 'react';
import { ProductCard, Product } from './ProductCard';
import { motion } from 'motion/react';

const DUMMY_PRODUCTS: Product[] = [
  // FASHION
  {
    id: '1',
    title: 'Royal Blue Jamdani Saree',
    price: 12500,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Sonargaon Artisans',
    rating: 4.9,
    isFeatured: true
  },
  {
    id: '4',
    title: 'White Muslin Panjabi',
    price: 5500,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1624313437517-5789658f8ed9?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Dacca Heritage',
    rating: 4.9,
    isFeatured: true
  },
  {
    id: '13',
    title: 'Indigo Block-Print Kurta',
    price: 3800,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Palli Wear',
    rating: 4.7
  },
  {
    id: '14',
    title: 'Floral Silk Scarf',
    price: 2400,
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Gram Bangla Crafts',
    rating: 4.8
  },

  // JEWELRY
  {
    id: '3',
    title: 'Terracotta Pendant Set',
    price: 1500,
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1535633302723-9993d57fb217?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Mrittika Arts',
    rating: 4.7,
    isFeatured: true
  },
  {
    id: '6',
    title: 'Silver Filigree Earrings',
    price: 4800,
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1635767798638-3e25273a8256?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Chandni Jewellers',
    rating: 4.9
  },
  {
    id: '15',
    title: 'Enamel Hand-painted Bangle',
    price: 1200,
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1573408301185-9146fe634ad0?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Traditional Adornments',
    rating: 4.6
  },
  {
    id: '16',
    title: 'Brass Statement Necklace',
    price: 3500,
    category: 'Jewelry',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Dacca Heritage',
    rating: 4.8
  },

  // HANDMADE
  {
    id: '2',
    title: 'Nakshi Kantha Wall Tapestry',
    price: 8200,
    category: 'Handmade',
    imageUrl: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Gram Bangla Crafts',
    rating: 4.8,
    isFeatured: true
  },
  {
    id: '9',
    title: 'Jute Fiber Tote Bag',
    price: 1200,
    category: 'Handmade',
    imageUrl: 'https://images.unsplash.com/photo-1544816153-12ad5d7133a1?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Eco-Crafts BD',
    rating: 4.6
  },
  {
    id: '17',
    title: 'Woven Bamboo Basket Set',
    price: 1800,
    category: 'Handmade',
    imageUrl: 'https://images.unsplash.com/photo-1563291074-2bf8677ac0e5?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Village Weavers',
    rating: 4.7
  },
  {
    id: '18',
    title: 'Clay Pottery Tea Set',
    price: 2200,
    category: 'Handmade',
    imageUrl: 'https://images.unsplash.com/photo-1572913191539-5015a00e1974?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Mrittika Arts',
    rating: 4.9
  },

  // HOME
  {
    id: '8',
    title: 'Hand-painted Rickshaw Vase',
    price: 850,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Urban Artisans',
    rating: 4.5,
    isFeatured: true
  },
  {
    id: '10',
    title: 'Brass Kula Wall Art',
    price: 2500,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1510798831971-661eb04b3739?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Traditional Decor',
    rating: 4.8
  },
  {
    id: '19',
    title: 'Embroidered Cushion Cover',
    price: 950,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1584100000335-572427599604?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Heritage Weaves',
    rating: 4.7
  },
  {
    id: '20',
    title: 'Coconut Shell Decorative Bowl',
    price: 650,
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1526434426615-1abe81efcb0b?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Eco-Crafts BD',
    rating: 4.6
  },

  // BEAUTY
  {
    id: '12',
    title: 'Organic Neem Soap Set',
    price: 650,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1605264985020-02ec046097cb?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Prakriti Beauty',
    rating: 4.9,
    isFeatured: true
  },
  {
    id: '21',
    title: 'Pure Sandalwood Oil',
    price: 1800,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1617897903246-719242758050?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Heritage Essence',
    rating: 4.8
  },
  {
    id: '22',
    title: 'Rose Water Facial Mist',
    price: 450,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Prakriti Beauty',
    rating: 4.7
  },
  {
    id: '23',
    title: 'Natural Henna Powder Pack',
    price: 350,
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1601612620443-8ee331f2ee79?auto=format&fit=crop&q=80&w=600',
    sellerName: 'Village Herbs',
    rating: 4.6
  }
];

interface MarketplaceProps {
  searchQuery?: string;
  onTryOn: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export const Marketplace: React.FC<MarketplaceProps> = ({ searchQuery = '', onTryOn, onAddToWishlist, onProductClick }) => {
  const [activeTab, setActiveTab] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);
  const tabs = ['All', 'Featured', 'Fashion', 'Jewelry', 'Handmade', 'Home', 'Beauty'];

  const filteredProducts = DUMMY_PRODUCTS.filter(p => {
    const matchesTab = 
      activeTab === 'All' || 
      (activeTab === 'Featured' && p.isFeatured) ||
      p.category === activeTab;
      
    const matchesSearch = 
      !searchQuery || 
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
      p.category.toLowerCase().includes(searchQuery.toLowerCase());
      
    return matchesTab && matchesSearch;
  });

  const displayedProducts = filteredProducts.slice(0, visibleCount);

  return (
    <div className="max-w-7xl mx-auto px-4 py-20" id="marketplace">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <span className="text-teal-400 text-xs font-black uppercase tracking-[0.3em] mb-2 block">Curated For You</span>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Artisan Marketplace</h2>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {tabs.map(tab => (
            <button 
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setVisibleCount(8); // Reset count on tab change
              }}
              className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab 
                ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' 
                : 'bg-white/5 text-gray-500 hover:text-white border border-white/5'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {displayedProducts.map((product) => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onTryOn={() => onTryOn(product)}
            onAddToWishlist={() => onAddToWishlist(product)}
            onClick={() => onProductClick(product)}
          />
        ))}
      </div>

      {visibleCount < filteredProducts.length && (
        <div className="mt-20 text-center">
          <button 
            onClick={() => setVisibleCount(prev => prev + 4)}
            className="text-gray-500 hover:text-white transition-all flex items-center gap-2 mx-auto uppercase text-[10px] tracking-[0.4em] font-black group"
          >
            Load More Artisans
            <span className="w-8 h-px bg-gray-500 group-hover:w-16 group-hover:bg-teal-500 transition-all duration-500" />
          </button>
        </div>
      )}
    </div>
  );
};
