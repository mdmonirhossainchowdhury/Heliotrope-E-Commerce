import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Camera, LogOut, Save, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { signOut } from 'firebase/auth';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({ isOpen, onClose }) => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    phone: '',
    address: '',
    photoURL: ''
  });

  const [fileLoading, setFileLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName || '',
        email: profile.email || '',
        phone: profile.phone || '',
        address: profile.address || '',
        photoURL: profile.photoURL || ''
      });
    }
  }, [profile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 800000) { // Limit to ~800KB for Firestore
      toast.error('Image too large. Please select a smaller photo.');
      return;
    }

    setFileLoading(true);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({ ...prev, photoURL: reader.result as string }));
      setFileLoading(false);
      toast.success('Photo ready to save!');
    };
    reader.readAsDataURL(file);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      // NOTE: Updating email requires a recent login. 
      // We will only update Firestore email if it changes, 
      // but warn that Auth email might require re-login.
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: formData.displayName,
        phone: formData.phone,
        address: formData.address,
        photoURL: formData.photoURL
      });
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Signed out successfully');
      onClose();
      // Ensure we go to home and clear any dashboard states
      window.location.href = '/'; 
    } catch (err: any) {
      toast.error('Logout failed');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[400] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/95 backdrop-blur-3xl"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#080808] border border-white/10 rounded-[40px] md:rounded-[60px] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header with Logout */}
            <div className="p-8 md:p-12 pb-0 flex justify-between items-center bg-gradient-to-b from-white/5 to-transparent">
               <div className="flex gap-4">
                 <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-red-500 hover:text-white hover:bg-red-600 font-black uppercase text-[10px] tracking-widest transition-all px-6 py-3 bg-red-500/10 rounded-full border border-red-500/20"
                 >
                   <LogOut size={16} />
                   Log Out
                 </button>
               </div>
               <button 
                onClick={onClose}
                className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all border border-white/10"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-12 pt-6 no-scrollbar">
              <div className="flex flex-col items-center text-center mb-10">
                <div className="relative mb-6">
                  <div className="w-32 h-32 rounded-full bg-teal-500/10 border-2 border-teal-500/30 overflow-hidden flex items-center justify-center relative">
                    {formData.photoURL ? (
                      <img src={formData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User size={48} className="text-teal-400 opacity-50" />
                    )}
                    {fileLoading && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  <label className="absolute bottom-0 right-0 p-3 bg-teal-500 text-black rounded-full shadow-xl hover:scale-110 transition-all cursor-pointer">
                    <Camera size={16} />
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
                
                <div className="space-y-4">
                   <div className="flex items-center justify-center gap-2">
                      <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{profile?.displayName || 'Artisan Persona'}</h2>
                      {profile?.role === 'seller' && <ShieldCheck className="text-teal-400" size={20} />}
                   </div>
                   <div className="flex items-center justify-center gap-3">
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-teal-400 py-1 px-4 bg-teal-500/10 rounded-full border border-teal-500/20">
                        {profile?.role === 'seller' ? 'Heritage Master' : 'Valued Buyer'}
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        ID: {profile?.idNumber || 'Generating...'}
                      </span>
                   </div>
                </div>
              </div>

              <form onSubmit={handleUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label>Display Name</Label>
                    <Input icon={<User size={18}/>} value={formData.displayName} onChange={(e) => setFormData({...formData, displayName: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Artisan Email</Label>
                    <Input icon={<Mail size={18}/>} value={formData.email} readOnly />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone Connection</Label>
                    <Input icon={<Phone size={18}/>} value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="+880 1XXX-XXXXXX" />
                  </div>
                  <div className="space-y-2">
                    <Label>Physical Locale</Label>
                    <Input icon={<MapPin size={18}/>} value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} placeholder="Area, District" />
                  </div>
                </div>

                <div className="pt-6">
                  <button 
                    type="submit"
                    disabled={loading || fileLoading}
                    className="w-full bg-teal-500 py-5 rounded-3xl text-black font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-teal-400 transition-all shadow-[0_0_50px_rgba(45,212,191,0.2)] disabled:opacity-50"
                  >
                    <Save size={20} />
                    {loading ? 'Encrypting Changes...' : 'Synchronize Profile'}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-8 border-t border-white/5 bg-black/40 text-center">
               <div className="text-[9px] text-gray-700 font-bold uppercase tracking-[0.3em]">
                 Heritage Protocol v2.5.4 • {new Date().toLocaleDateString()}
               </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[10px] uppercase tracking-[0.2em] font-black text-teal-400/70 ml-2">{children}</label>
);

const Input: React.FC<{ icon: React.ReactNode, value: string, onChange?: (e: any) => void, readOnly?: boolean, placeholder?: string }> = ({ icon, value, onChange, readOnly, placeholder }) => (
  <div className="relative flex items-center group">
    <div className="absolute left-6 text-gray-600 group-focus-within:text-teal-400 transition-colors">
      {icon}
    </div>
    <input 
      type="text"
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full bg-white/5 border border-white/10 rounded-3xl pl-16 pr-6 py-5 text-sm font-medium text-white outline-none transition-all focus:border-teal-500/30 focus:bg-white/10 ${readOnly ? 'opacity-50 cursor-not-allowed' : ''}`}
    />
  </div>
);
