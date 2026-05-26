/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Marketplace } from './components/Marketplace';
import { LiveSessions } from './components/LiveSessions';
import { AIAssistant } from './components/AIAssistant';
import { TryOnModal } from './components/TryOnModal';
import { WishlistDrawer } from './components/WishlistDrawer';
import { AuthModal } from './components/AuthModal';
import { ProductDetails } from './components/ProductDetails';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { SellerDashboard } from './components/SellerDashboard';
import { AccountModal } from './components/AccountModal';
import { Product } from './components/ProductCard';
import { Toaster, toast } from 'react-hot-toast';
import { db, auth } from './lib/firebase';
import { useAuth } from './contexts/AuthContext';
import { addDoc, collection } from 'firebase/firestore';
import { AnimatePresence } from 'motion/react';

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, loading: authLoading } = useAuth();
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);
  const [tryOnProduct, setTryOnProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartItems, setCartItems] = useState<Array<{ product: Product, quantity: number }>>([]);

  // Auto-exit dashboard on logout
  React.useEffect(() => {
    if (!user) {
      setIsDashboard(false);
    }
  }, [user]);

  const handleTryOn = (product: Product) => {
    setTryOnProduct(product);
  };

  const handleAddToCart = (product: Product, openCheckout = false) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    if (openCheckout) {
      setSelectedProduct(null);
      setIsCheckoutOpen(true);
    } else {
      toast.success('Added to Artisan Bag!', { icon: '🛍️' });
    }
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => prev.map(item => 
      item.product.id === productId 
        ? { ...item, quantity: Math.max(1, item.quantity + delta) } 
        : item
    ));
  };

  const handleRemoveFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleAddToWishlist = async (product: Product) => {
    if (!auth.currentUser) {
      toast.error('Please login to save items');
      setIsAuthOpen(true);
      return;
    }

    try {
      // Use setDoc with a unique ID to prevent duplicates if needed, 
      // or just addDoc. Let's stick with addDoc but ensure it matches rules correctly.
      await addDoc(collection(db, 'wishlists'), {
        userId: auth.currentUser.uid,
        productId: product.id,
        title: product.title,
        imageUrl: product.imageUrl,
        price: product.price,
        savedAt: new Date().toISOString()
      });
      toast.success('Saved to wishlist!', {
        icon: '❤️',
      });
    } catch (error: any) {
      console.error("Wishlist Error:", error);
      toast.error('Failed to save item. Check connection.');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-teal-500/30 selection:text-teal-200 font-sans">
      <Toaster position="bottom-center" />
        
        <Navbar 
          onOpenAssistant={() => setIsAssistantOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          onToggleDashboard={() => setIsDashboard(!isDashboard)}
          isDashboard={isDashboard}
          cartCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)}
        />

        <main className="pt-16">
          {isDashboard ? (
            <SellerDashboard />
          ) : (
            <>
              <Hero onSearch={setSearchQuery} />
              <Marketplace 
                searchQuery={searchQuery}
                onTryOn={handleTryOn}
                onAddToWishlist={handleAddToWishlist}
                onProductClick={setSelectedProduct}
              />
              <LiveSessions />
            </>
          )}
        </main>

        <footer className="py-20 border-t border-white/5 bg-gray-950">
          <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-teal-500 rounded flex items-center justify-center font-bold text-black text-xs italic">H</div>
                <span className="text-lg font-bold tracking-tighter uppercase">Heliotrope</span>
              </div>
              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-black">Empowering Bangladesh's Artisan Spirit</p>
            </div>
            
            <div className="flex gap-12 text-[10px] uppercase font-black tracking-widest text-gray-500">
              <a href="#" className="hover:text-teal-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Terms</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Contact</a>
              <a href="#" className="hover:text-teal-400 transition-colors">Sitemap</a>
            </div>

            <div className="text-gray-600 text-[10px] uppercase font-black tracking-widest">
              © 2026 Heliotrope Bazaar
            </div>
          </div>
        </footer>

        <AnimatePresence>
          {selectedProduct && (
            <ProductDetails
              product={selectedProduct}
              isOpen={!!selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={(p) => handleAddToCart(p, true)}
              onAddToWishlist={handleAddToWishlist}
              onTryOn={(p) => {
                setSelectedProduct(null);
                setTryOnProduct(p);
              }}
            />
          )}

          {isCartOpen && (
            <CartDrawer
              isOpen={isCartOpen}
              onClose={() => setIsCartOpen(false)}
              items={cartItems}
              onUpdateQuantity={handleUpdateQuantity}
              onRemove={handleRemoveFromCart}
              onCheckout={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
            />
          )}

          {isCheckoutOpen && (
            <CheckoutModal
              isOpen={isCheckoutOpen}
              onClose={() => setIsCheckoutOpen(false)}
              total={cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)}
            />
          )}
          
          {tryOnProduct && (
            <TryOnModal 
              product={tryOnProduct} 
              isOpen={!!tryOnProduct} 
              onClose={() => setTryOnProduct(null)} 
            />
          )}
        </AnimatePresence>

        <WishlistDrawer 
          isOpen={isWishlistOpen} 
          onClose={() => setIsWishlistOpen(false)} 
        />

        <AIAssistant 
          isOpen={isAssistantOpen} 
          onClose={() => setIsAssistantOpen(false)} 
        />

        <AuthModal 
          isOpen={isAuthOpen} 
          onClose={() => setIsAuthOpen(false)} 
        />

        <AccountModal 
        isOpen={isAccountOpen} 
        onClose={() => setIsAccountOpen(false)} 
      />
    </div>
  );
}
