import React, { useState } from 'react';
import { Search, Heart, MessageSquare, User, ShoppingBag, Menu, X as CloseIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { AnimatePresence, motion } from 'motion/react';
import { auth } from '../lib/firebase';
import { toast } from 'react-hot-toast';

interface NavbarProps {
  onOpenAssistant: () => void;
  onOpenWishlist: () => void;
  onOpenAuth: () => void;
  onOpenAccount: () => void;
  onOpenCart: () => void;
  cartCount: number;
  onToggleDashboard: () => void;
  isDashboard: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAssistant, onOpenWishlist, onOpenAuth, onOpenAccount, onOpenCart, cartCount, onToggleDashboard, isDashboard }) => {
  const { user, profile } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Discover', onClick: () => { 
      if (isDashboard) onToggleDashboard();
      window.scrollTo({ top: 0, behavior: 'smooth' }); 
      setIsMobileMenuOpen(false); 
    } },
    { label: 'Shop', onClick: () => { 
      if (isDashboard) onToggleDashboard();
      document.getElementById('marketplace')?.scrollIntoView({ behavior: 'smooth' }); 
      setIsMobileMenuOpen(false); 
    } },
    { label: 'Live', onClick: () => { 
      if (isDashboard) onToggleDashboard();
      document.getElementById('live')?.scrollIntoView({ behavior: 'smooth' }); 
      setIsMobileMenuOpen(false); 
    }, isLive: true },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-[60] bg-black/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center font-bold text-black italic">H</div>
            <div className="flex flex-col leading-tight">
              <span className="text-xl font-bold tracking-tighter text-white uppercase">Heliotrope</span>
              <span className="text-[10px] uppercase tracking-[0.2em] text-teal-400 font-semibold leading-none">Artisan Marketplace</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-sm uppercase tracking-wider font-medium text-gray-400">
            {navLinks.map(link => (
              <button 
                key={link.label}
                onClick={link.onClick} 
                className={cn(
                  "hover:text-white transition-colors cursor-pointer capitalize flex items-center gap-1",
                  link.isLive && "text-teal-400"
                )}
              >
                {link.isLive && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
                {link.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={onOpenAssistant}
            className="p-2 text-gray-400 hover:text-teal-400 transition-colors relative group"
            title="AI Assistant"
          >
            <MessageSquare size={20} />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-teal-500 rounded-full animate-ping opacity-75" />
          </button>

          <button 
            onClick={onOpenWishlist}
            className="hidden sm:block p-2 text-gray-400 hover:text-teal-400 transition-colors"
            title="Wishlist"
          >
            <Heart size={20} />
          </button>

          <button 
            onClick={onOpenCart}
            className="p-2 text-gray-400 hover:text-teal-400 transition-colors relative"
            title="Cart"
          >
            <ShoppingBag size={20} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-teal-500 text-black text-[10px] font-black rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          <div className="hidden sm:block h-4 w-px bg-white/10 mx-2" />

          {user ? (
            <div className="hidden sm:flex items-center gap-3">
              {profile?.role === 'seller' && (
                <button 
                  onClick={onToggleDashboard}
                  className={cn(
                    "px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest transition-all",
                    isDashboard 
                      ? "bg-teal-500 text-black border-teal-500 shadow-[0_0_20px_rgba(45,212,191,0.3)]" 
                      : "bg-white/5 text-teal-400 border-teal-500/30 hover:bg-teal-500/10"
                  )}
                >
                  {isDashboard ? 'Artisan Bag' : 'Seller Dashboard'}
                </button>
              )}
              <button 
                onClick={onOpenAccount}
                className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 transition-all"
              >
                <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 text-xs font-bold uppercase">
                  {profile?.displayName?.[0] || 'U'}
                </div>
                <span className="text-sm font-medium text-white">{profile?.displayName || 'Account'}</span>
              </button>
              <button 
                onClick={async () => {
                   await auth.signOut();
                   toast.success('Signed out');
                }}
                className="p-2 text-gray-500 hover:text-red-400 transition-all"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <button 
              onClick={onOpenAuth}
              className="hidden sm:flex px-6 py-2 bg-teal-500 hover:bg-teal-400 text-black font-bold uppercase text-xs tracking-widest rounded-full transition-all shadow-lg shadow-teal-500/20 items-center gap-2"
            >
              <User size={14} />
              Login
            </button>
          )}

          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 md:hidden text-gray-400 hover:text-white transition-colors"
          >
            {isMobileMenuOpen ? <CloseIcon size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-black border-b border-white/10 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              {navLinks.map(link => (
                <button 
                  key={link.label}
                  onClick={link.onClick}
                  className="w-full text-left p-2 text-gray-400 font-bold uppercase tracking-widest text-sm hover:text-teal-400 transition-colors block"
                >
                  {link.label}
                </button>
              ))}
              <div className="h-px bg-white/5" />
              {user ? (
                <>
                  <button onClick={() => { onOpenAccount(); setIsMobileMenuOpen(false); }} className="w-full text-left p-3 text-teal-400 font-black uppercase tracking-widest text-xs bg-white/5 rounded-xl border border-white/5">
                    Profile Settings
                  </button>
                  <button 
                    onClick={async () => { 
                      await auth.signOut(); 
                      setIsMobileMenuOpen(false); 
                      toast.success('Signed out');
                    }} 
                    className="w-full text-left p-3 text-red-500 font-black uppercase tracking-widest text-xs flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </>
              ) : (
                <button onClick={() => { onOpenAuth(); setIsMobileMenuOpen(false); }} className="w-full text-left p-4 bg-teal-500 text-black font-black uppercase tracking-widest text-xs rounded-xl shadow-lg shadow-teal-500/20">
                  Account Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
