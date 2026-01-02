
import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Movie } from './types';
import { MOVIES } from './constants';
import VideoPlayer from './components/VideoPlayer';
import { 
  Play, 
  Film, 
  Tv, 
  Clock, 
  LayoutGrid, 
  X, 
  UploadCloud,
  Loader2,
  FileVideo,
  TrendingUp,
  Sparkles,
  User,
  ChevronRight,
  Plus,
  // Fix: Added missing ShoppingBag icon
  ShoppingBag
} from 'lucide-react';

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState('browse');
  const [customMovies, setCustomMovies] = useState<Movie[]>([]);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to generate thumbnail from local video file
  const generateThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      const canvas = document.createElement('canvas');
      const url = URL.createObjectURL(file);
      video.src = url;
      video.currentTime = 1;
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
      video.onerror = () => resolve('https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800');
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
      description: `Locally uploaded file. SceneShop AI ready for object recognition.`,
      thumbnail: thumbnail,
      videoUrl: videoUrl,
      genre: ['Local', 'Custom'],
      year: new Date().getFullYear(),
      type: 'movie'
    };

    setCustomMovies(prev => [newMovie, ...prev]);
    setIsProcessingFile(false);
    setCurrentPage('studio'); // Auto-navigate to studio after upload
    setSelectedMovie(newMovie);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processVideoFile(file);
  };

  // Content Filtering Logic
  const moviesOnly = useMemo(() => MOVIES.filter(m => m.type === 'movie'), []);
  const tvShowsOnly = useMemo(() => MOVIES.filter(m => m.type === 'tv'), []);
  const newContent = useMemo(() => MOVIES.filter(m => m.year >= 2024), []);

  // --- SUB-PAGES ---

  const BrowsePage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative h-[85vh] w-full flex items-end">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-30" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-24 w-full">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-display font-bold mb-6 leading-[0.9] tracking-tighter">BEYOND<br/><span className="text-indigo-400">VISION</span></h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">The world's first shoppable streaming experience. Pause any scene to instantly discover products on screen.</p>
            <button onClick={() => setSelectedMovie(MOVIES[0])} className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl"><Play fill="black" size={20} /> Watch & Shop</button>
          </div>
        </div>
      </section>
      
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        <MovieRow title="Trending Trailers" movies={MOVIES} onSelect={setSelectedMovie} />
        <MovieRow title="New Releases" movies={newContent} onSelect={setSelectedMovie} />
      </div>
    </div>
  );

  const MoviesPage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative h-[60vh] w-full flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-20" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <h2 className="text-6xl font-display font-bold mb-4 tracking-tighter">THE CINEMA <span className="text-indigo-500">COLLECTION</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">Exclusive 4K trailers with real-time fashion and prop recognition.</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <MovieGrid movies={moviesOnly} onSelect={setSelectedMovie} />
      </div>
    </div>
  );

  const TVPage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative h-[60vh] w-full flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src="https://images.unsplash.com/photo-1593359677771-482869a6a397?auto=format&fit=crop&q=80&w=1920" className="w-full h-full object-cover opacity-20" alt="" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#050505]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-center">
          <h2 className="text-6xl font-display font-bold mb-4 tracking-tighter">BINGEABLE <span className="text-indigo-500">SERIES</span></h2>
          <p className="text-gray-400 max-w-xl mx-auto text-lg">From living room sets to wardrobe staples, shop your favorite characters.</p>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <MovieGrid movies={tvShowsOnly} onSelect={setSelectedMovie} />
      </div>
    </div>
  );

  const NewPage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center gap-4 mb-12">
          <TrendingUp className="text-indigo-500" size={40} />
          <h2 className="text-5xl font-display font-bold tracking-tighter">TRENDING <span className="text-gray-600">NOW</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {MOVIES.slice(0, 4).map((m, idx) => (
            <div 
              key={m.id} 
              onClick={() => setSelectedMovie(m)}
              className="group flex gap-8 items-center cursor-pointer p-6 rounded-3xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/50 transition-all"
            >
              <div className="text-7xl font-display font-black text-white/5 group-hover:text-indigo-500/20 transition-colors">{idx + 1}</div>
              <div className="aspect-video w-48 rounded-2xl overflow-hidden">
                <img src={m.thumbnail} className="w-full h-full object-cover" alt="" />
              </div>
              <div>
                <h4 className="font-bold text-xl group-hover:text-indigo-400 transition-colors">{m.title}</h4>
                <p className="text-sm text-gray-500 line-clamp-2">{m.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-24">
          <h3 className="text-2xl font-bold mb-8">Just Added</h3>
          <MovieGrid movies={newContent} onSelect={setSelectedMovie} />
        </div>
      </div>
    </div>
  );

  const StudioPage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto px-6 pt-32 pb-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-5xl font-display font-bold tracking-tighter">MY <span className="text-indigo-500">STUDIO</span></h2>
            <p className="text-gray-500 mt-2">Manage your private shoppable video library.</p>
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 px-8 py-4 rounded-2xl font-bold transition-all transform hover:scale-105 shadow-xl shadow-indigo-600/20"
          >
            <Plus size={20} /> Upload New
          </button>
        </div>

        {customMovies.length === 0 ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/10 rounded-[40px] p-32 text-center group cursor-pointer hover:border-indigo-500/50 hover:bg-white/[0.02] transition-all"
          >
            <div className="inline-flex p-8 rounded-full bg-white/5 mb-8 group-hover:scale-110 transition-transform">
              <UploadCloud size={64} className="text-gray-500 group-hover:text-indigo-400" />
            </div>
            <h3 className="text-3xl font-bold mb-2">No videos yet</h3>
            <p className="text-gray-500 max-w-sm mx-auto">Upload a local MP4 or WebM file to start scanning with SceneShop AI.</p>
          </div>
        ) : (
          <div className="space-y-12">
            <div className="bg-indigo-500/10 border border-indigo-500/20 p-8 rounded-[40px] flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Sparkles className="text-indigo-400" size={32} />
                <div>
                  <h4 className="font-bold text-xl">SceneShop AI Active</h4>
                  <p className="text-sm text-indigo-300/70">Object recognition is optimized for your {customMovies.length} personal files.</p>
                </div>
              </div>
              <div className="text-xs font-black tracking-widest text-indigo-400 bg-indigo-500/10 px-4 py-2 rounded-full">SECURE LOCAL PROCESSING</div>
            </div>
            <MovieGrid movies={customMovies} onSelect={setSelectedMovie} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-indigo-500/30">
      {isProcessingFile && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center">
          <Loader2 size={60} className="text-indigo-500 animate-spin mb-6" />
          <p className="text-2xl font-bold tracking-[0.3em] animate-pulse">OPTIMIZING VIDEO FOR AI...</p>
        </div>
      )}

      <nav className="fixed top-0 z-40 w-full bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <h1 onClick={() => setCurrentPage('browse')} className="text-2xl font-display font-bold tracking-tighter cursor-pointer hover:opacity-80 transition-opacity">SCENESHOP</h1>
            <div className="hidden md:flex items-center gap-8">
              {[
                { id: 'browse', label: 'Browse', icon: LayoutGrid },
                { id: 'movies', label: 'Movies', icon: Film },
                { id: 'tv', label: 'TV Shows', icon: Tv },
                { id: 'new', label: 'New & Popular', icon: Clock },
              ].map((tab) => (
                <button key={tab.id} onClick={() => setCurrentPage(tab.id)} className={`relative flex items-center gap-2 text-sm font-semibold transition-all py-2 ${currentPage === tab.id ? 'text-white' : 'text-gray-500 hover:text-gray-300'}`}>
                  <tab.icon size={16} className={currentPage === tab.id ? 'text-indigo-400' : ''} />
                  {tab.label}
                  {currentPage === tab.id && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setCurrentPage('studio')}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-bold transition-all transform hover:scale-105 ${currentPage === 'studio' ? 'bg-white text-black' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20'}`}
            >
              <UploadCloud size={14} /> {currentPage === 'studio' ? 'In Studio' : 'Upload Video'}
            </button>
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-xs font-bold border border-white/10 ring-2 ring-transparent hover:ring-indigo-500/50 transition-all cursor-pointer"><User size={20} /></div>
          </div>
        </div>
      </nav>

      <input type="file" ref={fileInputRef} onChange={handleFileInputChange} accept="video/*" className="hidden" />

      {/* RENDER CURRENT PAGE */}
      <div className="min-h-screen">
        {currentPage === 'browse' && <BrowsePage />}
        {currentPage === 'movies' && <MoviesPage />}
        {currentPage === 'tv' && <TVPage />}
        {currentPage === 'new' && <NewPage />}
        {currentPage === 'studio' && <StudioPage />}
      </div>

      {selectedMovie && <VideoPlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center">
        <h4 className="text-xl font-display font-bold mb-4">SCENESHOP AI</h4>
        <p className="text-gray-500 text-sm max-w-md mx-auto">Experience the future of interactive entertainment. Powered by Gemini Multimodal Vision.</p>
        <div className="flex items-center justify-center gap-8 mt-10 opacity-30">
          <Film size={20} /><Tv size={20} /><ShoppingBag size={20} />
        </div>
      </footer>
    </div>
  );
};

// Reusable Components for the Pages
// Fix: Used React.FC for MovieRow to resolve 'key' prop assignment issues.
const MovieRow: React.FC<{ title: string, movies: Movie[], onSelect: (m: Movie) => void }> = ({ title, movies, onSelect }) => (
  <div>
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold">{title}</h3>
      <button className="text-indigo-400 text-sm font-bold flex items-center gap-1 hover:gap-2 transition-all">View All <ChevronRight size={16} /></button>
    </div>
    <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide no-scrollbar">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} onSelect={onSelect} className="min-w-[320px]" />
      ))}
    </div>
  </div>
);

// Fix: Used React.FC for MovieGrid to resolve 'key' prop assignment issues.
const MovieGrid: React.FC<{ movies: Movie[], onSelect: (m: Movie) => void }> = ({ movies, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
    {movies.map(movie => (
      <MovieCard key={movie.id} movie={movie} onSelect={onSelect} />
    ))}
  </div>
);

// Fix: Used React.FC for MovieCard to resolve 'key' prop assignment issues.
const MovieCard: React.FC<{ movie: Movie, onSelect: (m: Movie) => void, className?: string }> = ({ movie, onSelect, className = "" }) => (
  <div 
    className={`group relative bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 hover:border-indigo-500/50 hover:bg-[#111] transition-all duration-500 cursor-pointer shadow-2xl ${className}`}
    onClick={() => onSelect(movie)}
  >
    <div className="aspect-[16/10] relative overflow-hidden">
      <img src={movie.thumbnail} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={movie.title} />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-md p-4 rounded-full border border-white/30 transform group-hover:scale-110 transition-transform"><Play fill="white" size={24} /></div>
      </div>
      {movie.genre.includes('Local') && (
        <div className="absolute top-4 left-4 bg-indigo-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 shadow-xl"><UploadCloud size={12} /> LOCAL</div>
      )}
    </div>
    <div className="p-6">
      <h4 className="font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors line-clamp-1">{movie.title}</h4>
      <p className="text-xs text-gray-500 line-clamp-1">{movie.genre.join(', ')} • {movie.year}</p>
    </div>
  </div>
);

export default App;
