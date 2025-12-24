
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Movie } from './types';
import { MOVIES } from './constants';
import VideoPlayer from './components/VideoPlayer';
import { 
  Play, 
  ShoppingBag, 
  Film, 
  Tv, 
  Clock, 
  LayoutGrid, 
  Plus, 
  X, 
  Link as LinkIcon,
  Youtube,
  UploadCloud,
  Loader2
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedVibe, setSelectedVibe] = useState<string | null>(null);
  const [customMovies, setCustomMovies] = useState<Movie[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importTitle, setImportTitle] = useState('');
  
  // Drag and Drop States
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const VIBES = [
    { label: 'Cyberpunk', img: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&q=80&w=400' },
    { label: 'Minimalist', img: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?auto=format&fit=crop&q=80&w=400' },
    { label: 'Industrial', img: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400' },
    { label: 'Vintage', img: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&q=80&w=400' },
    { label: 'Modernist', img: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=400' },
    { label: 'Rustic', img: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&q=80&w=400' },
  ];

  const allMovies = useMemo(() => [...customMovies, ...MOVIES], [customMovies]);

  const filteredMovies = useMemo(() => {
    let result = [...allMovies];
    if (activeTab === 'movies') result = result.filter(m => m.type === 'movie');
    if (activeTab === 'tv') result = result.filter(m => m.type === 'tv');
    if (activeTab === 'new') result = result.filter(m => m.year >= 2024);
    if (selectedVibe) {
      result = result.filter(m => 
        m.genre.some(g => g.toLowerCase() === selectedVibe.toLowerCase()) || 
        m.genre.includes('Custom')
      );
    }
    return result;
  }, [activeTab, selectedVibe, allMovies]);

  const toggleVibe = (label: string) => {
    setSelectedVibe(prev => prev === label ? null : label);
  };

  const getYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Helper to generate thumbnail from local video file
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const url = URL.createObjectURL(file);
      
      video.src = url;
      video.currentTime = 1; // Capture at 1 second
      video.muted = true;
      
      video.onloadeddata = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        URL.revokeObjectURL(url);
        resolve(dataUrl);
      };
      
      video.onerror = () => {
        resolve('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800');
      };
    });
  };

  const processVideoFile = async (file: File) => {
    if (!file.type.startsWith('video/')) return;
    
    setIsProcessingFile(true);
    const thumbnail = await generateThumbnail(file);
    const videoUrl = URL.createObjectURL(file);

    const newMovie: Movie = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: `Locally dropped file: ${file.name}. Ready for AI scene scanning.`,
      thumbnail: thumbnail,
      videoUrl: videoUrl,
      genre: ['Local', 'Custom'],
      year: new Date().getFullYear(),
      type: 'movie'
    };

    setCustomMovies(prev => [newMovie, ...prev]);
    setSelectedMovie(newMovie);
    setIsProcessingFile(false);
    setIsDragging(false);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importUrl) return;

    const ytId = getYouTubeID(importUrl);
    const isYouTube = !!ytId;

    const newMovie: Movie = {
      id: `custom-${Date.now()}`,
      title: importTitle || (isYouTube ? 'YouTube Scene' : 'Custom Video'),
      description: isYouTube 
        ? 'Analyzing products from this YouTube video using high-res thumbnail scanning.'
        : 'User imported content for real-time AI product recognition.',
      thumbnail: isYouTube 
        ? `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`
        : 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
      videoUrl: importUrl,
      genre: ['Custom', isYouTube ? 'YouTube' : 'Direct'],
      year: new Date().getFullYear(),
      type: 'movie'
    };

    setCustomMovies(prev => [newMovie, ...prev]);
    setImportUrl('');
    setImportTitle('');
    setShowImportModal(false);
    setSelectedMovie(newMovie);
  };

  // Drag and Drop Handlers
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only set dragging false if we leave the main window
    if (e.relatedTarget === null) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      processVideoFile(file);
    }
  }, []);

  return (
    <div 
      className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30 relative"
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      {/* Drag & Drop Overlay */}
      <div className={`fixed inset-0 z-[100] bg-indigo-600/20 backdrop-blur-sm flex flex-col items-center justify-center border-[6px] border-dashed border-indigo-500/50 m-6 rounded-[40px] transition-all duration-300 pointer-events-none ${isDragging ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        <div className="bg-black/80 p-12 rounded-full mb-8 shadow-2xl animate-bounce">
          <UploadCloud size={80} className="text-indigo-400" />
        </div>
        <h2 className="text-5xl font-display font-bold mb-4">Drop to Scan</h2>
        <p className="text-xl text-indigo-200">Release to add this video to your shoppable library</p>
      </div>

      {/* Global Processing Loader */}
      {isProcessingFile && (
        <div className="fixed inset-0 z-[110] bg-black/90 flex flex-col items-center justify-center">
          <Loader2 size={60} className="text-indigo-500 animate-spin mb-6" />
          <p className="text-2xl font-bold tracking-widest animate-pulse">GENERATING PREVIEW...</p>
        </div>
      )}

      <nav className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <h1 
              className="text-2xl font-display font-bold tracking-tighter cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => { setActiveTab('browse'); setSelectedVibe(null); }}
            >
              SCENESHOP
            </h1>
            <div className="hidden md:flex items-center gap-8">
              {[
                { id: 'browse', label: 'Browse', icon: LayoutGrid },
                { id: 'movies', label: 'Movies', icon: Film },
                { id: 'tv', label: 'TV Shows', icon: Tv },
                { id: 'new', label: 'New & Popular', icon: Clock },
              ].map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); }}
                  className={`relative flex items-center gap-2 text-sm font-semibold transition-all py-2 px-1 ${
                    activeTab === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <tab.icon size={16} className={activeTab === tab.id ? 'text-indigo-400' : ''} />
                  {tab.label}
                  {activeTab === tab.id && (
                    <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                  )}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setShowImportModal(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-4 py-2 rounded-full text-xs font-bold transition-all transform hover:scale-105 active:scale-95 shadow-lg shadow-indigo-600/20"
            >
              <Plus size={14} /> Import Video
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold border border-white/10 ring-2 ring-transparent hover:ring-indigo-500/50 transition-all cursor-pointer">
              JD
            </div>
          </div>
        </div>
      </nav>

      <section className="relative h-[85vh] w-full flex items-end">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920" 
            alt="Hero Background" 
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 w-full">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-display font-bold mb-6 leading-[0.9] tracking-tighter">
              BEYOND<br/><span className="text-indigo-400">VISION</span>
            </h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">
              The world's first shoppable streaming experience. Pause any scene to instantly discover products on screen.
            </p>
            <div className="flex items-center gap-5">
              <button 
                onClick={() => setSelectedMovie(MOVIES[0])}
                className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl"
              >
                <Play fill="black" size={20} /> Watch & Shop
              </button>
              <div className="flex items-center gap-4 text-xs font-bold text-gray-500 uppercase tracking-widest ml-4">
                <UploadCloud size={16} /> Drag & drop your own files
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h3 className="text-3xl font-bold mb-2">Library</h3>
            <p className="text-gray-500">Discover trailers or shop from your own video collection</p>
          </div>
        </div>

        {filteredMovies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredMovies.map((movie) => (
              <div 
                key={movie.id}
                className="group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-indigo-500/50 hover:bg-[#111] transition-all duration-500 cursor-pointer shadow-2xl"
                onClick={() => setSelectedMovie(movie)}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img 
                    src={movie.thumbnail} 
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform group-hover:scale-110 transition-transform">
                      <Play fill="white" size={32} />
                    </div>
                  </div>
                  {movie.genre.includes('YouTube') && (
                    <div className="absolute bottom-3 left-3 bg-red-600 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1">
                      <Youtube size={10} /> YOUTUBE
                    </div>
                  )}
                  {movie.genre.includes('Local') && (
                    <div className="absolute bottom-3 left-3 bg-indigo-600 text-white px-2 py-0.5 rounded text-[8px] font-bold flex items-center gap-1 uppercase tracking-tighter">
                      <UploadCloud size={10} /> Local File
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h4 className="font-bold text-xl mb-2 group-hover:text-indigo-400 transition-colors line-clamp-1">{movie.title}</h4>
                  <p className="text-sm text-gray-500 line-clamp-2">{movie.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center">
            <p className="text-gray-500">No content found.</p>
          </div>
        )}

        <div className="mt-32">
          <h3 className="text-3xl font-bold mb-10">Shop by Aesthetic</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {VIBES.map((vibe) => (
              <button 
                key={vibe.label}
                onClick={() => toggleVibe(vibe.label)}
                className={`group relative h-40 rounded-2xl overflow-hidden border transition-all ${
                  selectedVibe === vibe.label ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-white/5'
                }`}
              >
                <img src={vibe.img} className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:scale-110 group-hover:opacity-60 transition-all duration-700" alt={vibe.label} />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                   <span className="text-sm font-bold uppercase tracking-widest">{vibe.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-lg w-full relative">
            <button onClick={() => setShowImportModal(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X /></button>
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-3"><LinkIcon className="text-indigo-400" /> Import Video</h3>
            <p className="text-sm text-gray-400 mb-6">Supports YouTube links (e.g., youtube.com/watch?v=...) and direct .mp4 files.</p>
            
            <form onSubmit={handleImport} className="space-y-6">
              <input 
                type="text" 
                value={importTitle}
                onChange={(e) => setImportTitle(e.target.value)}
                placeholder="Video Title"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <input 
                type="url" 
                required
                value={importUrl}
                onChange={(e) => setImportUrl(e.target.value)}
                placeholder="YouTube or MP4 URL"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
              />
              <button type="submit" className="w-full bg-indigo-600 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all">Add to Library</button>
            </form>
            
            <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
              <p className="text-xs text-gray-500 mb-4 uppercase tracking-widest">Or just drag a file here</p>
              <div className="w-full py-8 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500">
                <UploadCloud size={32} className="mb-2" />
                <span className="text-xs">Supports MP4, WebM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMovie && <VideoPlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}
    </div>
  );
};

export default App;
