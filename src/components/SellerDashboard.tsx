import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Radio, ShoppingBag, MessageSquare, Plus, Camera, X, Check, MapPin, Globe, Tags, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc, onSnapshot, orderBy } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';

export const SellerDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'live' | 'products' | 'shop'>('overview');
  const [shop, setShop] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Shop creation state
  const [showShopForm, setShowShopForm] = useState(false);
  const [shopData, setShopData] = useState({
    name: '',
    country: 'Bangladesh',
    district: '',
    category: 'Handicrafts'
  });

  useEffect(() => {
    if (!profile?.uid) return;

    // Fetch Shop
    const fetchShop = async () => {
      const q = query(collection(db, 'shops'), where('sellerId', '==', profile.uid));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setShop({ id: snap.docs[0].id, ...snap.docs[0].data() });
      } else {
        setShowShopForm(true);
      }
    };

    // Fetch Products
    const fetchProducts = async () => {
      const q = query(collection(db, 'products'), where('sellerId', '==', profile.uid));
      const snap = await getDocs(q);
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    // Fetch Live Sessions
    const fetchLiveSessions = async () => {
      const q = query(collection(db, 'live_sessions'), where('sellerId', '==', profile.uid));
      const snap = await getDocs(q);
      setLiveSessions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    Promise.all([fetchShop(), fetchProducts(), fetchLiveSessions()]).finally(() => setLoading(false));
  }, [profile]);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    try {
      const docRef = await addDoc(collection(db, 'shops'), {
        ...shopData,
        sellerId: profile.uid,
        createdAt: new Date().toISOString()
      });
      setShop({ id: docRef.id, ...shopData });
      setShowShopForm(false);
      toast.success('Shop created successfully!');
    } catch (error) {
      toast.error('Failed to create shop');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-72 bg-gray-950 border-r border-white/5 p-8 flex flex-col gap-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-teal-500 rounded-2xl flex items-center justify-center font-black text-black">S</div>
          <div>
            <h1 className="font-black uppercase text-xs tracking-widest text-white">Seller Studio</h1>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{shop?.name || 'New Shop'}</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem 
            active={activeTab === 'overview'} 
            onClick={() => setActiveTab('overview')} 
            icon={<LayoutDashboard size={20} />} 
            label="Overview" 
          />
          <NavItem 
            active={activeTab === 'live'} 
            onClick={() => setActiveTab('live')} 
            icon={<Radio size={20} />} 
            label="Live Studio" 
          />
          <NavItem 
            active={activeTab === 'products'} 
            onClick={() => setActiveTab('products')} 
            icon={<ShoppingBag size={20} />} 
            label="Manage Items" 
          />
          <NavItem 
            active={activeTab === 'shop'} 
            onClick={() => setActiveTab('shop')} 
            icon={<Globe size={20} />} 
            label="Shop Profile" 
          />
        </nav>

        <div className="mt-auto space-y-4">
          <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
             <p className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 mb-2">Heritage Score</p>
             <div className="text-3xl font-black mb-1">98%</div>
             <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
               <div className="w-[98%] h-full bg-teal-500" />
             </div>
          </div>
          
          <button 
            onClick={() => auth.signOut()}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-gray-500 hover:text-red-400 hover:bg-red-500/5 transition-all font-bold uppercase text-[10px] tracking-widest border border-transparent hover:border-red-500/10"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:p-16 overflow-y-auto max-h-screen no-scrollbar">
        <AnimatePresence mode="wait">
          {showShopForm ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
              <h2 className="text-5xl font-black uppercase tracking-tighter mb-4">Launch Your Shop</h2>
              <p className="text-gray-500 text-lg mb-12">Every artisan story begins with a foundation. Define your heritage.</p>
              
              <form onSubmit={handleCreateShop} className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input label="Shop Identity" placeholder="e.g. Dhaka Heritage Weaves" value={shopData.name} onChange={e => setShopData({...shopData, name: e.target.value})} />
                  <Input label="Primary Category" placeholder="Handicrafts, Textiles..." value={shopData.category} onChange={e => setShopData({...shopData, category: e.target.value})} />
                  <Input label="Country" value={shopData.country} readOnly />
                  <Input label="District" placeholder="e.g. Narayanganj" value={shopData.district} onChange={e => setShopData({...shopData, district: e.target.value})} />
                </div>
                <button type="submit" className="w-full bg-teal-500 py-6 rounded-3xl text-black font-black uppercase tracking-[0.3em] hover:bg-teal-400 transition-all shadow-[0_0_50px_rgba(45,212,191,0.2)]">
                  Register Artisan Studio
                </button>
              </form>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
              {activeTab === 'overview' && <OverviewTab products={products} sessions={liveSessions} />}
              {activeTab === 'live' && <LiveStudioTab sessions={liveSessions} />}
              {activeTab === 'products' && <ProductsTab products={products} onUpdate={setProducts} />}
              {activeTab === 'shop' && <ShopProfileTab shop={shop} onUpdate={setShop} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold uppercase text-[10px] tracking-widest ${active ? 'bg-teal-500 text-black shadow-[0_0_30px_rgba(45,212,191,0.2)]' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
  >
    {icon}
    {label}
  </button>
);

const Input: React.FC<{ label: string, placeholder?: string, value: string, onChange?: (e: any) => void, readOnly?: boolean }> = ({ label, placeholder, value, onChange, readOnly }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70">{label}</label>
    <input 
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full bg-gray-900 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-teal-500/30 transition-all ${readOnly ? 'opacity-50' : ''}`}
    />
  </div>
);

const OverviewTab: React.FC<{ products: any[], sessions: any[] }> = ({ products, sessions }) => (
  <div className="space-y-12">
    <div>
      <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Heritage Pulse</h2>
      <p className="text-gray-500 text-xl font-medium">Your studio's impact dashboard</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <StatCard label="Live Reach" value="12.4K" sub="Total Viewers" color="text-teal-400" />
      <StatCard label="Inventory" value={products.length.toString()} sub="Unique Items" color="text-white" />
      <StatCard label="Appreciation" value="892" sub="Collection Saves" color="text-rose-400" />
    </div>

    <div className="bg-gray-950 border border-white/5 rounded-[40px] p-10">
      <h3 className="text-sm font-black uppercase tracking-widest mb-8">Recent Activity</h3>
      <div className="space-y-6">
        {[1,2,3].map(i => (
          <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-teal-400">
                <ShoppingBag size={20} />
              </div>
              <div>
                <p className="font-bold text-sm">New purchase for "Nakshi Kantha"</p>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">2 hours ago</p>
              </div>
            </div>
            <div className="font-black text-teal-400">৳2400</div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const StatCard: React.FC<{ label: string, value: string, sub: string, color: string }> = ({ label, value, sub, color }) => (
    <div className="bg-gray-950 border border-white/5 rounded-[40px] p-10 transition-all hover:bg-white/5">
       <p className="text-[11px] font-black uppercase tracking-[0.3em] text-gray-500 mb-6">{label}</p>
       <div className={`text-6xl font-black tracking-tighter mb-2 ${color}`}>{value}</div>
       <p className="text-[11px] font-bold uppercase tracking-widest text-gray-600">{sub}</p>
    </div>
);

const ProductsTab: React.FC<{ products: any[], onUpdate: (p: any[]) => void }> = ({ products, onUpdate }) => {
  const { profile } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  
  const [productData, setProductData] = useState({
    title: '',
    price: '',
    category: '',
    description: '',
    imageUrl: ''
  });

  const resetForm = () => {
    setProductData({
      title: '',
      price: '',
      category: '',
      description: '',
      imageUrl: ''
    });
    setEditingProduct(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setProductData({
      title: product.title,
      price: product.price.toString(),
      category: product.category,
      description: product.description,
      imageUrl: product.imageUrl
    });
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 500000) {
      toast.error('Image too large. Please select a smaller photo (under 500KB) for heritage preservation.');
      return;
    }

    setFileLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setProductData(prev => ({ ...prev, imageUrl: reader.result as string }));
      setFileLoading(false);
      toast.success('Image processed!');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile?.uid) return;
    if (!productData.imageUrl) {
      toast.error('Please upload an item image');
      return;
    }

    setLoading(true);
    try {
      const docData = {
        title: productData.title,
        price: parseFloat(productData.price),
        category: productData.category,
        description: productData.description,
        imageUrl: productData.imageUrl,
        sellerId: profile.uid,
        updatedAt: new Date().toISOString()
      };

      if (editingProduct) {
        await updateDoc(doc(db, 'products', editingProduct.id), docData);
        onUpdate(products.map(p => p.id === editingProduct.id ? { ...p, ...docData } : p));
        toast.success('Heritage item updated!');
      } else {
        const fullData = {
          ...docData,
          createdAt: new Date().toISOString(),
          rating: 4.8 + Math.random() * 0.2
        };
        const docRef = await addDoc(collection(db, 'products'), fullData);
        onUpdate([{ id: docRef.id, ...fullData }, ...products]);
        toast.success('Product listed in marketplace!');
      }
      setIsModalOpen(false);
    } catch (e) {
      console.error(e);
      toast.error('Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Artisan Catalog</h2>
          <p className="text-gray-500 text-xl font-medium">Manage your digital storefront</p>
        </div>
        <button 
          onClick={openAddModal}
          className="px-10 py-5 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.3em] rounded-3xl flex items-center gap-3 hover:bg-teal-400 transition-all shadow-[0_0_30px_rgba(45,212,191,0.2)]"
        >
          <Plus size={20} />
          New Item
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {products.map(p => (
          <div key={p.id} className="bg-gray-950 border border-white/5 rounded-[40px] overflow-hidden group">
            <div className="aspect-square bg-gray-900 relative">
              <img src={p.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all group-hover:scale-105" />
              <div className="absolute top-6 left-6 px-4 py-1.5 bg-black/60 backdrop-blur-md rounded-full border border-white/10 text-[10px] font-black uppercase tracking-widest">
                {p.category}
              </div>
            </div>
            <div className="p-8">
               <h4 className="text-xl font-black uppercase tracking-tighter mb-2">{p.title}</h4>
               <p className="text-teal-400 font-black mb-6">৳{p.price}</p>
               <button 
                onClick={() => openEditModal(p)}
                className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
               >
                 Edit Item
               </button>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[500] flex items-center justify-center p-8">
            <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setIsModalOpen(false)}
               className="absolute inset-0 bg-black/90 backdrop-blur-xl" 
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-2xl bg-gray-950 border border-white/10 rounded-[60px] p-12 max-h-[90vh] overflow-y-auto no-scrollbar shadow-[0_0_100px_rgba(0,0,0,0.8)]"
            >
              <div className="flex justify-between items-center mb-12">
                 <h3 className="text-4xl font-black uppercase tracking-tighter">
                   {editingProduct ? 'Refine Heritage Item' : 'New Collection Item'}
                 </h3>
                 <button onClick={() => setIsModalOpen(false)} className="p-4 hover:bg-white/5 rounded-full"><X /></button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-full min-h-[300px] rounded-[30px] bg-[#0c0c0c] border-2 border-dashed border-white/10 overflow-hidden flex flex-col items-center justify-center relative group transition-all duration-500">
                    {productData.imageUrl ? (
                      <div className="w-full flex items-center justify-center p-4">
                        <div 
                          className="absolute inset-0 opacity-10 blur-3xl scale-110" 
                          style={{ backgroundImage: `url(${productData.imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }} 
                        />
                        <img 
                          src={productData.imageUrl} 
                          alt="Preview" 
                          className="relative z-10 max-w-full max-h-[400px] object-contain rounded-2xl shadow-2xl" 
                        />
                        <div className="absolute inset-0 z-20 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[30px]">
                           <Camera className="text-white" size={32} />
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-4 text-gray-500">
                        <Camera size={48} />
                        <p className="text-[10px] font-black uppercase tracking-widest">Click to upload item photography</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange}
                      className="absolute inset-0 z-50 opacity-0 cursor-pointer" 
                    />
                    {fileLoading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                </div>

                <Input label="Product Name" value={productData.title} onChange={e => setProductData({...productData, title: e.target.value})} />
                <div className="grid grid-cols-2 gap-8">
                  <Input label="Price (৳)" value={productData.price} onChange={e => setProductData({...productData, price: e.target.value})} />
                  <Input label="Category" value={productData.category} onChange={e => setProductData({...productData, category: e.target.value})} placeholder="e.g. Textiles, Pottery" />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70">Heritage Description</label>
                  <textarea 
                    rows={4}
                    value={productData.description}
                    onChange={e => setProductData({...productData, description: e.target.value})}
                    className="w-full bg-gray-900 border border-white/5 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-teal-500/30 transition-all resize-none"
                    placeholder="Tell the story of this piece..."
                  />
                </div>
                <button 
                  type="submit" 
                  disabled={loading || fileLoading}
                  className="w-full bg-teal-500 py-6 rounded-3xl text-black font-black uppercase tracking-[0.3em] shadow-2xl disabled:opacity-50"
                >
                  {loading ? 'Archiving Changes...' : (editingProduct ? 'Synchronize Updates' : 'List to Marketplace')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const LiveStudioTab: React.FC<{ sessions: any[] }> = ({ sessions }) => {
  const { profile, user } = useAuth();
  const [isLive, setIsLive] = useState(false);
  const [streamData, setStreamData] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [likes, setLikes] = useState(0);

  const startStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      const docData = {
        sellerId: profile?.uid,
        title: "Artisan Live: Traditional Creation",
        status: 'live',
        viewers: Math.floor(Math.random() * 100) + 20,
        likes: 0,
        createdAt: new Date().toISOString()
      };
      
      const docRef = await addDoc(collection(db, 'live_sessions'), docData);
      setStreamData({ id: docRef.id, ...docData });
      setIsLive(true);
      toast.success('You are now broadcast live!', { icon: '🔴' });

      // Listen for comments
      const q = query(collection(db, 'live_comments'), where('sessionId', '==', docRef.id), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snap) => {
        setComments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });

      return () => unsubscribe();
    } catch (err) {
      toast.error('Unable to access camera. Check permissions.');
    }
  };

  const endStream = async () => {
    if (streamData) {
      await updateDoc(doc(db, 'live_sessions', streamData.id), { status: 'ended' });
    }
    const stream = videoRef.current?.srcObject as MediaStream;
    stream?.getTracks().forEach(track => track.stop());
    setIsLive(false);
    toast.success('Live broadcast ended.');
  };

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Artisan Studio Live</h2>
        <p className="text-gray-500 text-xl font-medium">Broadcast your craft directly to the world</p>
      </div>

      {!isLive ? (
        <div className="bg-gray-950 border border-white/5 rounded-[60px] p-24 text-center space-y-10">
          <div className="w-32 h-32 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto border border-teal-500/20">
            <Camera size={56} className="text-teal-400" />
          </div>
          <div>
            <h3 className="text-3xl font-black uppercase tracking-tighter mb-4">Transmission Ready</h3>
            <p className="text-gray-500 max-w-md mx-auto">Going live boosts artisan engagement by up to 140%. Secure camera access to begin.</p>
          </div>
          <button 
            onClick={startStream}
            className="px-16 py-6 bg-red-600 text-white font-black uppercase text-xs tracking-[0.4em] rounded-3xl hover:bg-red-500 transition-all shadow-[0_0_80px_rgba(220,38,38,0.3)] animate-pulse"
          >
            Start Live Broadcast
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
          {/* Main Broadcast View */}
          <div className="xl:col-span-2 space-y-8">
            <div className="aspect-video bg-black rounded-[40px] overflow-hidden border border-white/10 relative">
               <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover scale-x-[-1]" />
               <div className="absolute top-8 left-8 flex items-center gap-2 bg-red-600 px-5 py-2 rounded-full text-white font-black uppercase text-[10px] tracking-widest shadow-2xl">
                 <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                 Encrypted Live
               </div>
               <div className="absolute top-8 right-8 bg-black/60 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 flex items-center gap-4">
                  <div className="flex items-center gap-2 text-teal-400 font-bold text-[10px] uppercase tracking-widest">
                    <Radio size={14} /> 124 Viewers
                  </div>
                  <div className="w-px h-3 bg-white/20" />
                  <div className="text-white font-bold text-[10px] uppercase tracking-widest">4.8k Likes</div>
               </div>
            </div>
            <button 
              onClick={endStream}
              className="w-full py-6 bg-white/5 border border-white/10 rounded-3xl text-red-500 font-black uppercase tracking-[0.3em] hover:bg-red-600/10 transition-all"
            >
              Terminate Broadcast
            </button>
          </div>

          {/* Chat & Engagement */}
          <div className="bg-gray-950 border border-white/5 rounded-[40px] flex flex-col h-[600px]">
            <div className="p-8 border-b border-white/5">
               <h4 className="text-xs font-black uppercase tracking-widest text-teal-400">Live Interactions</h4>
            </div>
            <div className="flex-1 p-8 overflow-y-auto space-y-4 no-scrollbar">
              {comments.length === 0 ? (
                <p className="text-gray-600 text-xs italic text-center mt-20">Awaiting artisan connections...</p>
              ) : (
                comments.map(c => (
                  <div key={c.id} className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-teal-400">{c.userName || 'Artisan Fan'}</p>
                    <p className="text-xs text-white/70 bg-white/5 p-4 rounded-3xl inline-block leading-relaxed">{c.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="p-8 border-t border-white/5">
               <div className="flex items-center gap-2 opacity-30 pointer-events-none">
                 <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-[10px] font-black uppercase">Sellers View only</div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ShopProfileTab: React.FC<{ shop: any, onUpdate: (s: any) => void }> = ({ shop, onUpdate }) => {
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState({...shop});

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'shops', shop.id), data);
      onUpdate(data);
      setEditing(false);
      toast.success('Shop profile updated!');
    } catch (e) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-6xl font-black uppercase tracking-tighter mb-4">Studio Identity</h2>
          <p className="text-gray-500 text-xl font-medium">Define your artisan presence</p>
        </div>
        {!editing && (
          <button 
            onClick={() => setEditing(true)}
            className="px-10 py-5 bg-white/5 border border-white/10 rounded-3xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="bg-gray-950 border border-white/5 rounded-[60px] p-12">
        <form onSubmit={handleUpdate} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70 ml-6">Studio Name</label>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-3xl p-6">
                   <LayoutDashboard className="text-gray-600 mr-4" size={24} />
                   <input 
                     readOnly={!editing}
                     value={data.name} 
                     onChange={e => setData({...data, name: e.target.value})}
                     className="bg-transparent border-none outline-none text-xl font-black uppercase tracking-tighter text-white w-full"
                    />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70 ml-6">Artisan category</label>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-3xl p-6">
                   <Tags className="text-gray-600 mr-4" size={24} />
                   <input 
                     readOnly={!editing}
                     value={data.category} 
                     onChange={e => setData({...data, category: e.target.value})}
                     className="bg-transparent border-none outline-none text-xl font-black uppercase tracking-tighter text-white w-full"
                    />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70 ml-6">Artisan Locale (District)</label>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-3xl p-6">
                   <MapPin className="text-gray-600 mr-4" size={24} />
                   <input 
                     readOnly={!editing}
                     value={data.district} 
                     onChange={e => setData({...data, district: e.target.value})}
                     className="bg-transparent border-none outline-none text-xl font-black uppercase tracking-tighter text-white w-full"
                    />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400/70 ml-6">Nation of Origin</label>
                <div className="relative flex items-center bg-white/5 border border-white/10 rounded-3xl p-6 opacity-50">
                   <Globe className="text-gray-600 mr-4" size={24} />
                   <input 
                     readOnly
                     value={data.country} 
                     className="bg-transparent border-none outline-none text-xl font-black uppercase tracking-tighter text-white w-full"
                    />
                </div>
             </div>
          </div>
          
          {editing && (
            <div className="flex gap-4">
              <button 
                type="submit" 
                className="flex-1 bg-teal-500 py-6 rounded-3xl text-black font-black uppercase tracking-[0.3em] shadow-2xl"
              >
                Save Identity
              </button>
              <button 
                type="button" 
                onClick={() => { setEditing(false); setData({...shop}); }}
                className="flex-1 bg-red-500/10 text-red-500 py-6 rounded-3xl font-black uppercase tracking-[0.3em]"
              >
                Cancel
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
