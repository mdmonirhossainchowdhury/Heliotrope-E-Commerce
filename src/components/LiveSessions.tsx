import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Users, Eye, X, Volume2, VolumeX, Clock, MessageSquare, Send, Heart, Share2 } from 'lucide-react';

const LIVE_STREAMS = [
  {
    id: 'l1',
    title: 'Jamdani Weaving Session',
    artisan: 'Begum Weaves',
    viewers: '1.2k',
    location: 'Sonargaon',
    thumbnail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=600',
    status: 'live',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-weaving-on-a-wooden-loom-in-the-workshop-41019-large.mp4'
  },
  {
    id: 'l2',
    title: 'Terracotta Sculpting Live',
    artisan: 'Joynal Abedin',
    viewers: '850',
    location: 'Paharpur',
    thumbnail: 'https://images.unsplash.com/photo-1535633302723-9993d57fb217?auto=format&fit=crop&q=80&w=600',
    status: 'live',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-close-up-of-hands-shaping-a-clay-vase-44243-large.mp4'
  },
  {
    id: 'l3',
    title: 'Masterclass: Silk Dyeing',
    artisan: 'Rumana Silk',
    viewers: '0',
    location: 'Rajshahi',
    thumbnail: 'https://images.unsplash.com/photo-1574634534894-89d7576c8259?auto=format&fit=crop&q=80&w=600',
    status: 'scheduled',
    startTime: 'In 2 Hours',
    waitingAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3'
  },
  {
    id: 'l4',
    title: 'Heritage Metal Etching',
    artisan: 'Kanti Studio',
    viewers: '0',
    location: 'Dhaka',
    thumbnail: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&q=80&w=600',
    status: 'scheduled',
    startTime: 'Tomorrow',
    waitingAudio: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-16.mp3'
  }
];

export const LiveSessions: React.FC = () => {
  const [selectedStream, setSelectedStream] = useState<typeof LIVE_STREAMS[0] | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [comments, setComments] = useState<Array<{ id: number; user: string; text: string; color: string }>>([
    { id: 1, user: 'Arif_H', text: 'Stunning work! ❤️', color: '#14b8a6' },
    { id: 2, user: 'Sayeeda', text: 'How long does this take?', color: '#f59e0b' },
  ]);
  const [newComment, setNewComment] = useState('');
  const [likes, setLikes] = useState(1240);
  const audioRef = useRef<HTMLAudioElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [audioError, setAudioError] = useState(false);

  useEffect(() => {
    if (selectedStream?.status === 'scheduled' && audioRef.current) {
      setAudioError(false);
      // Force reload the audio source
      audioRef.current.load();
      audioRef.current.volume = 0.5;
      
      // Try to play automatically, but don't fail if blocked
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          setIsMuted(false);
        }).catch((err) => {
          console.log('Autoplay prevented or failed:', err);
          setIsMuted(true);
        });
      }
    }
  }, [selectedStream]);

  // Sync state with audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
      if (!isMuted && audioRef.current.paused) {
        audioRef.current.play().catch(e => console.error("Resume failed", e));
      }
    }
  }, [isMuted]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setComments(prev => [...prev, {
      id: Date.now(),
      user: 'You',
      text: newComment,
      color: '#fff'
    }]);
    setNewComment('');
  };

  const handleClose = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setSelectedStream(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-24" id="live">
      <div className="flex items-center justify-between mb-12">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-500 text-[10px] font-black uppercase tracking-[0.3em]">Heliotrope Live</span>
          </div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Artisan Sessions</h2>
        </div>
        <button className="text-gray-500 hover:text-white uppercase text-[10px] font-black tracking-widest transition-all">View All Streams</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {LIVE_STREAMS.map((stream) => (
          <motion.div 
            key={stream.id}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            onClick={() => setSelectedStream(stream)}
            className="group relative aspect-video bg-white/5 rounded-[32px] overflow-hidden border border-white/10 hover:border-teal-500/30 transition-all cursor-pointer"
          >
            <img src={stream.thumbnail} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" alt={stream.title} />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-8 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className={cn(
                  "px-3 py-1 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-lg",
                  stream.status === 'live' ? "bg-red-600 shadow-red-500/20" : "bg-teal-600 shadow-teal-500/20"
                )}>
                  {stream.status === 'live' ? 'Live Now' : 'Scheduled'}
                </span>
                <div className="flex items-center gap-2 px-3 py-1 bg-black/40 backdrop-blur-md rounded-full text-white/80 text-[10px] font-bold border border-white/5">
                  {stream.status === 'live' ? (
                    <><Eye size={12} className="text-red-400" /> {stream.viewers}</>
                  ) : (
                    <><Clock size={12} className="text-teal-400" /> {stream.startTime}</>
                  )}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-1 group-hover:text-teal-400 transition-colors">{stream.title}</h3>
                  <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">{stream.artisan} • {stream.location}</p>
                </div>
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white group-hover:bg-teal-500 group-hover:text-black transition-all transform group-hover:scale-110 shadow-2xl">
                  {stream.status === 'live' ? <Play size={20} fill="currentColor" /> : <Clock size={20} />}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedStream && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8 overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/98 backdrop-blur-3xl" onClick={handleClose} />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative w-full max-w-7xl h-[85vh] bg-[#050505] rounded-[40px] overflow-hidden border border-white/10 shadow-[0_0_150px_rgba(45,212,191,0.15)] flex flex-col md:flex-row"
            >
              {/* Main Content Area */}
              <div className="flex-1 relative bg-black overflow-hidden group">
                {selectedStream.status === 'live' ? (
                  <div className="w-full h-full relative">
                    <video 
                      src={selectedStream.videoUrl} 
                      autoPlay 
                      loop 
                      muted={isMuted}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Live Interaction Actions */}
                    <div className="absolute right-6 bottom-10 flex flex-col gap-4">
                      <motion.button 
                        whileTap={{ scale: 1.5 }}
                        onClick={() => setLikes(prev => prev + 1)}
                        className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-rose-500 hover:border-rose-500 transition-all shadow-xl group"
                      >
                        <Heart className="group-hover:fill-current" size={24} />
                      </motion.button>
                      <button className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-teal-500 hover:border-teal-500 transition-all shadow-xl">
                        <Share2 size={24} />
                      </button>
                    </div>

                    <div className="absolute top-24 left-10 flex flex-col gap-4 group-hover:translate-x-1 transition-transform">
                        <div className="flex items-center gap-3 bg-red-600 px-5 py-2.5 rounded-full text-white shadow-[0_0_30px_rgba(220,38,38,0.4)] border border-white/20">
                          <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black uppercase tracking-[0.3em] leading-none">Transmission: Live</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 bg-black/80 backdrop-blur-2xl px-6 py-4 rounded-3xl border border-white/10 shadow-2xl">
                           <div className="flex items-center gap-3 text-white/90 font-bold text-[11px] uppercase tracking-widest">
                              <Eye size={16} className="text-teal-400" />
                              <span className="tabular-nums">{selectedStream.viewers}</span>
                           </div>
                           <div className="w-px h-4 bg-white/20" />
                           <div className="flex items-center gap-3 text-rose-400 font-bold text-[11px] uppercase tracking-widest">
                              <Heart size={16} fill="currentColor" />
                              <span className="tabular-nums">{likes.toLocaleString()}</span>
                           </div>
                        </div>
                      </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative flex flex-col items-center justify-center overflow-hidden bg-[#0A0A0A]">
                    <img src={selectedStream.thumbnail} className="absolute inset-0 w-full h-full object-cover opacity-10 blur-3xl scale-125" />
                    <audio 
                      ref={audioRef} 
                      src={selectedStream.waitingAudio} 
                      loop 
                      muted={isMuted} 
                      onError={() => setAudioError(true)}
                    />
                    
                    <div className="relative z-10 text-center space-y-12 p-12 max-w-2xl">
                       <motion.div
                         animate={{ 
                           boxShadow: ['0 0 20px #2dd4bf20', '0 0 80px #2dd4bf60', '0 0 20px #2dd4bf30'],
                           scale: [1, 1.05, 1]
                         }}
                         transition={{ duration: 4, repeat: Infinity }}
                         className="w-48 h-48 rounded-full border border-teal-500/20 flex items-center justify-center mx-auto relative bg-[#0D0D0D] p-1 shadow-inner"
                       >
                          <div className="w-full h-full rounded-full border border-teal-500/10 flex items-center justify-center bg-gradient-to-br from-teal-500/5 to-transparent">
                            <Clock size={56} className="text-teal-400 opacity-90" />
                          </div>
                          <svg className="absolute inset-0 w-full h-full -rotate-90">
                             <motion.circle 
                               cx="96" cy="96" r="94"
                               stroke="currentColor" strokeWidth="2" fill="transparent"
                               className="text-teal-500/30"
                               initial={{ strokeDasharray: "590 590", strokeDashoffset: 590 }}
                               animate={{ strokeDashoffset: 0 }}
                               transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                             />
                          </svg>
                       </motion.div>

                       <div>
                         <div className={cn("text-[11px] font-black uppercase tracking-[0.6em] mb-6", audioError ? "text-red-400" : "text-teal-400")}>
                           {audioError ? 'Melody Connection Error' : 'Artisan Transmission Pending'}
                         </div>
                         <h3 className="text-6xl font-black text-white uppercase tracking-tighter mb-6 leading-none">{selectedStream.title}</h3>
                         <p className="text-white/50 text-xl font-medium tracking-tight">Broadcast begins {selectedStream.startTime}</p>
                       </div>

                       <div className="flex flex-col items-center justify-center gap-8 pt-6">
                          <button 
                            disabled={audioError}
                            onClick={async () => {
                              if (audioRef.current) {
                                if (isMuted || audioRef.current.paused) {
                                  try {
                                    audioRef.current.muted = false;
                                    await audioRef.current.play();
                                    setIsMuted(false);
                                  } catch (err) {
                                    console.error('Manual play failed', err);
                                  }
                                } else {
                                  audioRef.current.pause();
                                  setIsMuted(true);
                                }
                              }
                            }}
                            className={cn(
                              "px-12 py-6 border rounded-3xl flex items-center justify-center gap-5 transition-all group relative overflow-hidden shadow-2xl",
                              audioError 
                                ? "bg-red-500/5 border-red-500/20 text-red-400 opacity-50 cursor-not-allowed" 
                                : "bg-teal-500/10 border-teal-500/20 text-teal-400 hover:bg-teal-500/20 shadow-[0_0_50px_rgba(45,212,191,0.1)]"
                            )}
                          >
                            {!audioError && <div className="absolute inset-0 bg-teal-500/5 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />}
                            {audioError ? <VolumeX size={28} /> : (isMuted ? <VolumeX size={28} className="relative z-10" /> : <Volume2 size={28} className="relative z-10 animate-bounce" />)}
                            <span className="text-sm font-black uppercase tracking-[0.3em] relative z-10">
                              {audioError ? 'Melody Unavailable' : (isMuted ? 'Activate Artisan Melody' : 'Melody Playing')}
                            </span>
                          </button>
                          
                          <div className="flex items-center gap-2 text-[10px] text-white/20 font-black uppercase tracking-[0.2em]">
                             <div className={cn("w-1.5 h-1.5 rounded-full", audioError ? "bg-red-500/20" : "bg-white/20")} />
                             {audioError ? 'The stream music could not be loaded.' : 'Click to immerse in the heritage atmosphere'}
                          </div>
                       </div>
                    </div>

                    {/* Visualizer */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-full max-w-md flex items-end justify-center gap-1.5 opacity-30 h-12">
                       {[...Array(40)].map((_, i) => (
                         <motion.div
                           key={i}
                           className="w-1 bg-teal-400 rounded-full"
                           animate={{ height: [4, Math.random() * 40 + 8, 4] }}
                           transition={{ duration: 0.6 + Math.random(), repeat: Infinity }}
                         />
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Interaction Sidebar */}
              <div className="w-full md:w-80 bg-black/40 border-l border-white/10 flex flex-col backdrop-blur-3xl">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 font-bold">
                       <MessageSquare size={18} />
                    </div>
                    <div>
                        <h4 className="text-white font-black uppercase text-xs tracking-widest">Live Feed</h4>
                        <p className="text-gray-500 text-[10px] font-bold">Real-time interactions</p>
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
                   {comments.map((comment) => (
                     <motion.div 
                       initial={{ opacity: 0, x: -10 }}
                       animate={{ opacity: 1, x: 0 }}
                       key={comment.id} 
                       className="space-y-1"
                     >
                        <span className="text-[9px] font-black uppercase tracking-widest" style={{ color: comment.color }}>{comment.user}</span>
                        <p className="text-xs text-white/70 bg-white/5 rounded-2xl p-3 inline-block leading-relaxed">{comment.text}</p>
                     </motion.div>
                   ))}
                   <div ref={chatEndRef} />
                </div>

                <div className="p-6 border-t border-white/10">
                   <form onSubmit={handleSendComment} className="relative">
                      <input 
                        type="text" 
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Say something..."
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs text-white outline-none focus:border-teal-500/50 transition-all pr-12"
                      />
                      <button 
                        type="submit"
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-teal-400 hover:text-white transition-colors"
                      >
                         <Send size={16} />
                      </button>
                   </form>
                </div>
              </div>

              {/* Shared Top Actions */}
              <div className="absolute top-8 left-8 right-8 flex justify-between items-center pointer-events-none">
                 <div className="flex items-center gap-2 pointer-events-auto">
                    <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=100" className="w-10 h-10 rounded-full border-2 border-teal-500 object-cover" />
                    <div>
                       <p className="text-white font-black uppercase text-[10px] tracking-widest">{selectedStream?.artisan}</p>
                       <p className="text-teal-400/60 text-[8px] font-bold uppercase">Heritage Master</p>
                    </div>
                 </div>
                 <button 
                  onClick={handleClose}
                  className="w-12 h-12 bg-black/40 backdrop-blur-md border border-white/10 rounded-full flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all group pointer-events-auto shadow-2xl"
                >
                  <X size={24} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');
