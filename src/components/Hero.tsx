import React from 'react';
import { Search, Play } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  onSearch: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch }) => {
  const [input, setInput] = React.useState('');

  const handleSearch = () => {
    onSearch(input);
    const marketplaceEl = document.getElementById('marketplace');
    if (marketplaceEl) {
      marketplaceEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative pt-32 pb-20 overflow-hidden" id="discover">
      {/* Background patterns */}
      <div className="absolute top-0 left-0 w-full h-full -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-teal-500/30 blur-[150px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/20 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-4 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1 rounded-full border border-teal-500/30 bg-teal-500/5 text-teal-400 text-[10px] uppercase tracking-[0.3em] font-black mb-8"
        >
          <span className="w-1 h-1 bg-teal-400 rounded-full" />
          Bangladesh's Cultural Marketplace
          <span className="w-1 h-1 bg-teal-400 rounded-full" />
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter uppercase leading-[0.9]"
        >
          Discover Artisan <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-500">Excellence</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 max-w-2xl mx-auto mb-12 text-lg italic font-medium"
        >
          Heliotrope brings together Bangladesh's finest home-based artisans — from handwoven Jamdani to terracotta jewelry — into one curated marketplace.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="relative max-w-2xl mx-auto mb-16"
        >
          <div className="absolute inset-0 bg-teal-500/10 blur-xl rounded-full" />
          <div className="relative flex items-center bg-gray-900/50 backdrop-blur-xl border border-white/10 rounded-full p-2 pl-6 focus-within:ring-2 focus-within:ring-teal-500/50 transition-all">
            <Search className="text-teal-400" size={20} />
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search products..."
              className="flex-1 bg-transparent border-none outline-none text-white px-4 py-3 placeholder:text-gray-500"
            />
            <button 
              onClick={handleSearch}
              className="bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-xs tracking-widest px-8 py-3 rounded-full transition-all"
            >
              Search
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-4 text-[10px] uppercase font-black tracking-widest text-gray-500"
        >
          <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-teal-500/30 hover:text-white cursor-pointer transition-all">Jamdani Saree</span>
          <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-teal-500/30 hover:text-white cursor-pointer transition-all">Terracotta Jewelry</span>
          <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-teal-500/30 hover:text-white cursor-pointer transition-all">Nakshi Kantha</span>
          <span className="px-4 py-2 bg-white/5 rounded-full border border-white/5 hover:border-teal-500/30 hover:text-white cursor-pointer transition-all">Muslin Kurta</span>
        </motion.div>

        <div className="flex justify-center gap-6 mt-16">
          <button className="px-8 py-4 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all shadow-xl shadow-teal-500/20 hover:scale-105">
            Explore Marketplace
          </button>
          <button className="px-8 py-4 bg-white/5 border border-white/10 text-white font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all hover:bg-white/10 flex items-center gap-2">
            Watch Live Sessions
          </button>
          <button className="px-8 py-4 bg-gray-900 border border-gray-800 text-gray-400 font-black uppercase text-xs tracking-[0.2em] rounded-lg transition-all hover:text-white">
            Register as a Seller
          </button>
        </div>
      </div>
    </div>
  );
};
