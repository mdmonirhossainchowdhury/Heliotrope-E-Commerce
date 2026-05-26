import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, Sparkles, MessageCircle, Bot, Send, BrainCircuit, Heart, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product } from './ProductCard';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface TryOnModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const TryOnModal: React.FC<TryOnModalProps> = ({ product, isOpen, onClose }) => {
  const [userImage, setUserImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'model' | 'user'; text: string }[]>([
    { role: 'model', text: `Hi! Trying on the ${product?.title}? I can give you instant styling feedback. Upload a photo or ask me anything!` }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (product) {
      const categorySpecificRecs: Record<string, string[]> = {
        'Saree': ['Matching Silk Scarf', 'Pearl Necklace', 'Brocade Clutch'],
        'Jewelry': ['Velvet Storage Box', 'Polishing Cloth', 'Necklace Extender'],
        'Home': ['Brass Polish', 'Display Stand', 'Hand-carved Mallet'],
        'Menswear': ['Matching Cufflinks', 'Pocket Square', 'Leather Sandals'],
        'Beauty': ['Bamboo Soap Dish', 'Exfoliating Mitt', 'Tote Bag']
      };
      setRecommendations(categorySpecificRecs[product.category] || ['Gift Box', 'Artisan Card', 'Storage Pouch']);
    }
  }, [product]);

  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [overlayOpacity, setOverlayOpacity] = useState(0.85);
  const [overlayY, setOverlayY] = useState(0);
  const [overlayX, setOverlayX] = useState(0);
  const [overlayScale, setOverlayScale] = useState(1);
  const [faceCutoutSize, setFaceCutoutSize] = useState(15);
  const [brightness, setBrightness] = useState(110);

  const startScanning = () => {
    setIsScanning(true);
    setScanProgress(0);
    setOverlayY(0); 
    setOverlayX(0);
    setOverlayScale(1);
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 800);
          return 100;
        }
        return prev + 1;
      });
    }, 20);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserImage(event.target?.result as string);
        startScanning();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChatSend = async () => {
    if (!input.trim()) return;
    const msg = input.trim();
    setInput('');
    setChatMessages(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { role: 'user', parts: [{ text: `I am trying on a ${product?.title}. ${msg}. Provide quick fashion feedback and suggest if items like ${recommendations.join(', ')} would go well.` }] }
        ],
        config: {
          systemInstruction: "You are the Heliotrope Try-On Stylist. Give concise, encouraging, and expert fashion feedback for Bangladeshi artisans' products. Help the user look their best."
        }
      });
      setChatMessages(prev => [...prev, { role: 'model', text: response.text || "Looks great to me!" }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'model', text: "I'm having a bit of a creative block, but you look stunning!" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-6xl h-[85vh] bg-gray-900 border border-white/10 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl"
          >
            {/* Close Button */}
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-white/10 rounded-full text-white transition-all"
            >
              <X size={20} />
            </button>

            {/* Left Column: Try On Area */}
            <div className="flex-1 relative bg-black flex flex-center flex-col justify-center overflow-hidden border-r border-white/5">
              {!userImage ? (
                <div className="p-8 md:p-12 text-center max-w-md mx-auto">
                  <div className="w-20 h-20 bg-teal-500/10 border-2 border-dashed border-teal-500/30 rounded-full flex items-center justify-center mx-auto mb-8 text-teal-400">
                    <Camera size={32} />
                  </div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Perfect Your Try-On</h3>
                  
                  <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8 space-y-4 text-left">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xs">1</div>
                      <div>
                        <p className="text-white text-xs font-black uppercase tracking-widest mb-1">Dimensions</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">Use a Portrait photo. Ideal size: <span className="text-teal-400">1080 x 1350 px</span> (4:5 Ratio).</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-black text-xs">2</div>
                      <div>
                        <p className="text-white text-xs font-black uppercase tracking-widest mb-1">Pose & Light</p>
                        <p className="text-gray-400 text-[10px] leading-relaxed">Stand in front of a plain wall with good natural light for the best overlay effect.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-4">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-8 py-5 bg-teal-500 text-black font-black uppercase text-xs tracking-[0.3em] rounded-2xl hover:bg-teal-400 transition-all shadow-xl shadow-teal-500/20 flex items-center justify-center gap-3"
                    >
                      <Upload size={18} />
                      Upload Photo
                    </button>
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} accept="image/*" />
                  </div>
                </div>
              ) : (
                <div className="relative w-full h-full group bg-gray-900">
                  <img 
                    src={userImage} 
                    alt="User" 
                    className="w-full h-full object-contain" 
                  />
                  
                  {isScanning && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                      <div className="w-64 h-64 border-2 border-teal-500/50 rounded-full flex items-center justify-center relative">
                        <motion.div 
                          className="absolute inset-0 border-t-4 border-teal-400 rounded-full shadow-[0_0_20px_rgba(45,212,191,0.5)]"
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                        />
                        <div className="text-center">
                          <p className="text-teal-400 font-black text-3xl mb-1">{scanProgress}%</p>
                          <p className="text-white text-[10px] uppercase tracking-[0.3em] font-bold">Biometric Fitting</p>
                        </div>
                      </div>
                      
                      {/* Scanning HUD Elements */}
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="absolute inset-0 pointer-events-none"
                      >
                        <div className="absolute top-1/4 left-10 w-32 h-32 border-t border-l border-teal-500/40" />
                        <div className="absolute top-1/4 right-10 w-32 h-32 border-t border-r border-teal-500/40" />
                        <div className="absolute bottom-1/4 left-10 w-32 h-32 border-b border-l border-teal-500/40" />
                        <div className="absolute bottom-1/4 right-10 w-32 h-32 border-b border-r border-teal-500/40" />
                        
                        <motion.div 
                          className="absolute left-0 w-full h-px bg-teal-400/50 shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                          animate={{ top: ['20%', '80%', '20%'] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        />
                      </motion.div>
                    </div>
                  )}

                  {/* Enhanced AR Overlay */}
                  <AnimatePresence>
                    {!isScanning && (
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                         <motion.div 
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           transition={{ duration: 1, ease: "easeOut" }}
                           className="relative w-full h-full"
                         >
                           {/* The Product Overlay with "Face Mask" */}
                           <motion.div
                             initial={{ opacity: 0 }}
                             animate={{ opacity: overlayOpacity }}
                             style={{ 
                               y: overlayY, 
                               x: overlayX,
                               scale: overlayScale,
                               filter: `brightness(${brightness}%) contrast(110%) drop-shadow(0 0 30px rgba(0,0,0,0.5))`
                             }}
                             transition={{ delay: 0.5, duration: 1.5 }}
                             className="w-full h-full relative"
                           >
                             <img 
                               src={product.imageUrl} 
                               alt={product.title} 
                               className="w-full h-full object-contain"
                               style={{ 
                                 maskImage: `radial-gradient(circle at 50% 25%, transparent ${faceCutoutSize}%, black ${faceCutoutSize + 10}%)`,
                                 WebkitMaskImage: `radial-gradient(circle at 50% 25%, transparent ${faceCutoutSize}%, black ${faceCutoutSize + 10}%)`
                               }}
                             />
                           </motion.div>

                           {/* Fitting Sparkles */}
                           <motion.div 
                             className="absolute inset-0"
                             initial={{ opacity: 0 }}
                             animate={{ opacity: [0, 1, 0] }}
                             transition={{ duration: 2, times: [0, 0.5, 1], delay: 1 }}
                           >
                              {[...Array(6)].map((_, i) => (
                                <motion.div
                                  key={i}
                                  className="absolute w-1 h-1 bg-teal-400 rounded-full"
                                  initial={{ 
                                    x: Math.random() * 80 + 10 + '%', 
                                    y: Math.random() * 60 + 20 + '%',
                                    scale: 0
                                  }}
                                  animate={{ 
                                    scale: [0, 1, 0],
                                    boxShadow: '0 0 10px #2dd4bf'
                                  }}
                                  transition={{ 
                                    duration: 1.5, 
                                    repeat: Infinity, 
                                    delay: Math.random() * 2 
                                  }}
                                />
                              ))}
                           </motion.div>
                         </motion.div>
                      </div>
                    )}
                  </AnimatePresence>

                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-sm px-4">
                    <div className="bg-black/80 backdrop-blur-2xl border border-white/20 rounded-[24px] p-5 space-y-4 shadow-2xl">
                      <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                        {/* Scale */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Scale</span>
                            <span>{Math.round(overlayScale * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0.5" max="2" step="0.01" 
                            value={overlayScale} 
                            onChange={(e) => setOverlayScale(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>

                        {/* Blending */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Opacity</span>
                            <span>{Math.round(overlayOpacity * 100)}%</span>
                          </div>
                          <input 
                            type="range" min="0" max="1" step="0.01" 
                            value={overlayOpacity} 
                            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>

                        {/* Vertical */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Vertical Position</span>
                            <span>{overlayY}px</span>
                          </div>
                          <input 
                            type="range" min="-300" max="300" step="1" 
                            value={overlayY} 
                            onChange={(e) => setOverlayY(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>

                        {/* Horizontal */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Horizontal Move</span>
                            <span>{overlayX}px</span>
                          </div>
                          <input 
                            type="range" min="-150" max="150" step="1" 
                            value={overlayX} 
                            onChange={(e) => setOverlayX(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>

                        {/* Face Cutout */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Face Mask Size</span>
                            <span>{faceCutoutSize}%</span>
                          </div>
                          <input 
                            type="range" min="5" max="40" step="1" 
                            value={faceCutoutSize} 
                            onChange={(e) => setFaceCutoutSize(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>

                        {/* Brightness */}
                        <div className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-[7px] font-black uppercase text-teal-400 tracking-[0.2em]">
                            <span>Match Lighting</span>
                            <span>{brightness}%</span>
                          </div>
                          <input 
                            type="range" min="50" max="150" step="1" 
                            value={brightness} 
                            onChange={(e) => setBrightness(parseInt(e.target.value))}
                            className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400 transition-all"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-center pt-2 gap-3">
                        <button 
                          onClick={() => setUserImage(null)}
                          className="px-8 py-3 bg-white/10 border border-white/10 text-white rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2 group"
                        >
                          <Camera size={12} className="group-hover:rotate-12 transition-transform" />
                          Retake Photo
                        </button>
                        <button 
                          onClick={onClose}
                          className="px-8 py-3 bg-teal-500 text-black rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-teal-400 transition-all flex items-center gap-2"
                        >
                          Done Designing
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: AI & Recommendations */}
            <div className="w-full md:w-96 flex flex-col bg-gray-900">
              <div className="p-8 border-b border-white/5 space-y-6">
                <div>
                  <span className="text-teal-400 text-[10px] font-black uppercase tracking-[0.2em] mb-1 block">Live Try-On</span>
                  <h3 className="text-xl font-bold text-white tracking-tight uppercase">{product.title}</h3>
                </div>

                {/* Recommendation Engine */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-white/50 text-[10px] uppercase font-black tracking-widest">
                    <BrainCircuit size={14} className="text-teal-400" />
                    Recommended Add-ons
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {recommendations.map((item, i) => (
                      <button key={i} className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold text-gray-400 hover:text-white hover:border-teal-500/30 transition-all text-left">
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chatbot Feedback */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="p-4 bg-teal-500/5 border-b border-white/5 flex items-center gap-2">
                  <div className="w-8 h-8 bg-teal-500 rounded-lg flex items-center justify-center text-black">
                    <Bot size={18} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest text-teal-400">Styling Feedback</span>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={cn("max-w-[85%] p-3 rounded-2xl text-xs", msg.role === 'model' ? "bg-white/5 text-gray-300 mr-auto" : "bg-teal-500 text-black ml-auto font-medium")}>
                      {msg.text}
                    </div>
                  ))}
                  {isTyping && <div className="text-[10px] text-teal-400 font-bold animate-pulse">Stylist is typing...</div>}
                </div>

                <div className="p-4 border-t border-white/5 bg-black/20">
                  <div className="relative flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-2 focus-within:border-teal-500/50 transition-all">
                    <input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleChatSend()}
                      placeholder="Ask the stylist..."
                      className="flex-1 bg-transparent border-none outline-none text-white text-xs py-1"
                    />
                    <button onClick={handleChatSend} className="text-teal-400 hover:scale-110 transition-all">
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
