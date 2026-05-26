import React, { useState } from 'react';
import { X, Mail, Lock, Phone, Fingerprint, ArrowRight, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [step, setStep] = useState(1); // 1: Email, 2: OTP (if signup) or Password (if login)
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'buyer' | 'seller'>('buyer');
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setLoading(false);
      setPassword('');
      setOtp('');
      // We don't reset email/role/isSignUp to keep user context if they just misclicked, 
      // but we reset the transient state like step/password/loading.
    }
  }, [isOpen]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      const docRef = doc(db, 'users', result.user.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const idNumber = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
        await setDoc(docRef, {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          role: role, // Use selected role
          idNumber: idNumber,
          isVerified: true,
          createdAt: new Date().toISOString()
        });
        toast.success(`Welcome to the collective as a ${role}!`);
      } else {
        toast.success(`Welcome back, ${result.user.displayName}!`);
      }
      onClose();
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        toast.error('The login window was closed before completion. Please try again.');
      } else {
        console.error(error);
        toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (!email.includes('@')) return toast.error('Valid email required');
    setLoading(true);
    try {
      if (isSignUp) {
        const response = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await response.json();
        
        if (data.success) {
          setStep(2);
          if (data.dev_otp) {
            toast.success(`Demo Mode: OTP is ${data.dev_otp}`, { duration: 10000 });
          } else {
            toast.success('Verification code sent to your email!');
          }
        } else {
          throw new Error(data.message);
        }
      } else {
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        // Verify OTP via backend
        const verifyRes = await fetch('/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, otp })
        });
        const verifyData = await verifyRes.json();
        if (!verifyData.success) throw new Error(verifyData.message);

        const userCred = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCred.user, { displayName: name });
        const idNumber = `ART-${Math.floor(100000 + Math.random() * 900000)}`;
        await setDoc(doc(db, 'users', userCred.user.uid), {
          uid: userCred.user.uid,
          email,
          displayName: name,
          role: role,
          idNumber: idNumber,
          isVerified: true,
          createdAt: new Date().toISOString()
        });
        toast.success(`Welcome to Heliotrope, ${name}!`);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Assalamualaykum! Welcome back.');
      }
      onClose();
    } catch (error: any) {
      console.error("Auth Error Code:", error.code);
      if (error.code === 'auth/operation-not-allowed') {
        toast.error('Email login is disabled. Please use Google Login or enable Email/Password in Firebase Console.', { duration: 6000 });
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password should be at least 6 characters.');
      } else if (error.code === 'auth/email-already-in-use') {
        toast.error('This email is already registered. Try signing in instead.');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
        toast.error('Invalid email or password. Please check your credentials.');
      } else if (error.code === 'auth/too-many-requests') {
        toast.error('Too many failed attempts. Please try again later or reset your password.');
      } else {
        const cleanMessage = error.message?.replace('Firebase: ', '').split(' (')[0];
        toast.error(cleanMessage || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-gray-950 border border-white/10 rounded-[30px] md:rounded-[40px] overflow-hidden flex flex-col max-h-[95vh] shadow-[0_0_100px_rgba(0,0,0,0.8)]"
          >
            <div className="overflow-y-auto p-6 md:p-10 no-scrollbar">
              <div className="mb-6 flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex gap-2 mb-4 p-1 bg-white/5 rounded-2xl border border-white/5">
                    <button 
                      onClick={() => { setIsSignUp(false); setStep(1); }}
                      className={`flex-1 text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all ${!isSignUp ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => { setIsSignUp(true); setStep(1); }}
                      className={`flex-1 text-[11px] font-black uppercase tracking-widest py-3 rounded-xl transition-all ${isSignUp ? 'bg-teal-500 text-black shadow-lg shadow-teal-500/20' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                    >
                      Create Account
                    </button>
                  </div>
                  <h2 className="text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">
                    {isSignUp ? (role === 'seller' ? 'Artisan Enrollment' : 'Buyer Registration') : 'Welcome Back'}
                  </h2>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.2em]">
                    {isSignUp ? `Join the collective as a ${role}` : 'Sign in to access heritage'}
                  </p>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-500">
                  <X size={20} />
                </button>
              </div>

              {isSignUp && (
                <div className="mb-8">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-400/60 block mb-4 ml-2">Purpose of Entrance:</label>
                  <div className="grid grid-cols-2 gap-3 p-1.5 bg-black/40 rounded-2xl border border-white/5">
                    <button 
                      type="button"
                      onClick={() => setRole('buyer')}
                      className={`flex flex-col items-center gap-1 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${role === 'buyer' ? 'bg-white/10 text-teal-400 border border-teal-500/40' : 'text-gray-600 hover:text-white border border-transparent'}`}
                    >
                      <User size={16} className={role === 'buyer' ? 'text-teal-400' : 'text-gray-700'} />
                      Buyer
                    </button>
                    <button 
                      type="button"
                      onClick={() => setRole('seller')}
                      className={`flex flex-col items-center gap-1 py-4 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all ${role === 'seller' ? 'bg-white/10 text-teal-400 border border-teal-500/40' : 'text-gray-600 hover:text-white border border-transparent'}`}
                    >
                      <Phone size={16} className={role === 'seller' ? 'text-teal-400' : 'text-gray-700'} />
                      Seller
                    </button>
                  </div>
                </div>
              )}

              <button 
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black font-black uppercase text-[10px] tracking-widest py-4 rounded-xl mb-6 flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50 shadow-lg"
              >
                <img src="https://www.google.com/favicon.ico" className="w-3 h-3" alt="Google" />
                {isSignUp ? `Sign Up with Google` : 'Continue with Google'}
              </button>

              <div className="relative flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/5" />
                <span className="text-[9px] uppercase font-black text-gray-700 tracking-widest">Or Use Credentials</span>
                <div className="flex-1 h-px bg-white/5" />
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  if (step === 1) handleNext();
                  else handleSubmit(e);
                }} 
                className="space-y-4"
              >
                {step === 1 ? (
                  <>
                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-teal-400 ml-2">Email Address</label>
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-teal-500/50 transition-all">
                        <Mail className="absolute left-4 text-gray-500" size={16} />
                        <input 
                          type="email" 
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="artisans@example.com"
                          className="w-full bg-transparent border-none outline-none text-white pl-12 pr-4 py-4 text-sm"
                        />
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleNext}
                      disabled={loading}
                      className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-[10px] tracking-[0.3em] py-5 rounded-xl transition-all shadow-xl shadow-teal-500/10 flex items-center justify-center gap-2 group mt-2 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : 'Continue'}
                      {!loading && <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                  </>
                ) : (
                  <>
                    {isSignUp && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.2em] font-black text-teal-400 ml-2">Verification OTP</label>
                          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-teal-500/50 transition-all">
                            <Lock className="absolute left-4 text-gray-500" size={16} />
                            <input 
                              type="text" 
                              required
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="123456"
                              className="w-full bg-transparent border-none outline-none text-white pl-12 pr-4 py-4 text-sm"
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[9px] uppercase tracking-[0.2em] font-black text-teal-400 ml-2">Full Name</label>
                          <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-teal-500/50 transition-all">
                            <Fingerprint className="absolute left-4 text-gray-500" size={16} />
                            <input 
                              type="text" 
                              required
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              placeholder="Your Name"
                              className="w-full bg-transparent border-none outline-none text-white pl-12 pr-4 py-4 text-sm"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="space-y-1.5">
                      <label className="text-[9px] uppercase tracking-[0.2em] font-black text-teal-400 ml-2">Password</label>
                      <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl focus-within:border-teal-500/50 transition-all">
                        <Lock className="absolute left-4 text-gray-500" size={16} />
                        <input 
                          type="password" 
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full bg-transparent border-none outline-none text-white pl-12 pr-4 py-4 text-sm"
                        />
                      </div>
                    </div>

                    <button 
                      disabled={loading}
                      type="submit"
                      className="w-full bg-teal-500 hover:bg-teal-400 text-black font-black uppercase text-[10px] tracking-[0.3em] py-5 mt-2 rounded-xl transition-all shadow-xl shadow-teal-500/10 disabled:opacity-50"
                    >
                      {loading ? 'Processing...' : (isSignUp ? 'Verify & Create' : 'Sign In')}
                    </button>
                    
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-full text-gray-600 hover:text-white transition-all text-[9px] uppercase font-black tracking-widest mt-1"
                    >
                      Go Back
                    </button>
                  </>
                )}
              </form>

              <div className="mt-6 text-center">
                <button 
                  onClick={() => { setIsSignUp(!isSignUp); setStep(1); }}
                  className="text-gray-500 hover:text-teal-400 transition-all text-[10px] font-bold uppercase tracking-widest"
                >
                  {isSignUp ? 'Already member?' : 'New artisan?'} <span className="text-teal-500">{isSignUp ? 'Sign In' : 'Join Now'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
