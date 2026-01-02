import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Movie } from './types';
import { MOVIES } from './constants';
import VideoPlayer from './components/VideoPlayer';
import { 
  Play, 
  Film, 
  Tv, 
  Clock, 
  LayoutGrid, 
  UploadCloud,
  Loader2,
  TrendingUp,
  Sparkles,
  User,
  ChevronRight,
  Plus,
  ShoppingBag
} from 'lucide-react';

// --- TMDB CONFIG ---
const TMDB_API_KEY = "b69762e709e8febfe6f70beb72ef6df2"; 
const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w1280";

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [currentPage, setCurrentPage] = useState('browse');
  const [tmdbMovies, setTmdbMovies] = useState<Movie[]>([]);
  const [customMovies, setCustomMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FETCH ALL CONTENT FROM TMDB ---
  useEffect(() => {
    const fetchAllData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${TMDB_BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}`);
        const data = await response.json();
        
        const formatted: Movie[] = await Promise.all(data.results.slice(0, 20).map(async (m: any) => {
          const type = m.media_type === 'tv' ? 'tv' : 'movie';
          const videoRes = await fetch(`${TMDB_BASE_URL}/${type}/${m.id}/videos?api_key=${TMDB_API_KEY}`);
          const vData = await videoRes.json();
          const trailer = vData.results?.find((v: any) => v.type === "Trailer" && v.site === "YouTube");
          
          return {
            id: m.id.toString(),
            title: m.title || m.name,
            description: m.overview,
            thumbnail: `${IMG_PATH}${m.backdrop_path || m.poster_path}`,
            videoUrl: trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : "",
            genre: ["Trending", type === 'tv' ? "TV Series" : "Movie"],
            year: new Date(m.release_date || m.first_air_date).getFullYear() || 2026,
            type: type
          };
        }));

        setTmdbMovies(formatted.filter(m => m.videoUrl !== ""));
      } catch (err) {
        setTmdbMovies(MOVIES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // --- LOCAL UPLOAD ---
  const processVideoFile = async (file: File) => {
    setIsProcessingFile(true);
    const newMovie: Movie = {
      id: `local-${Date.now()}`,
      title: file.name.replace(/\.[^/.]+$/, ""),
      description: "Secure local AI scan.",
      thumbnail: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800",
      videoUrl: URL.createObjectURL(file),
      genre: ['Local'],
      year: 2026,
      type: 'movie'
    };
    setCustomMovies(prev => [newMovie, ...prev]);
    setIsProcessingFile(false);
    setCurrentPage('studio');
    setSelectedMovie(newMovie);
  };

  // --- PAGE FILTERING ---
  const moviesOnly = useMemo(() => tmdbMovies.filter(m => m.type === 'movie'), [tmdbMovies]);
  const tvShowsOnly = useMemo(() => tmdbMovies.filter(m => m.type === 'tv'), [tmdbMovies]);
  const trendingNow = useMemo(() => tmdbMovies.slice(0, 6), [tmdbMovies]);

  // --- SUB-PAGES ---

  const BrowsePage = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <section className="relative h-[85vh] w-full flex items-center pt-20">
        <div className="absolute inset-0 z-0">
          <img src={tmdbMovies[0]?.thumbnail} className="w-full h-full object-cover opacity-30" alt="" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/20 to-transparent" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
          <div className="max-w-2xl">
            <h2 className="text-7xl md:text-9xl font-display font-bold mb-6 leading-[0.9] tracking-tighter">BEYOND<br/><span className="text-indigo-400">VISION</span></h2>
            <p className="text-xl text-gray-400 mb-10 leading-relaxed max-w-lg">The world's first shoppable streaming experience. Pause any scene to instantly discover products on screen.</p>
            <button onClick={() => setSelectedMovie(tmdbMovies[0])} className="flex items-center gap-3 bg-white text-black px-10 py-5 rounded-2xl font-bold hover:bg-indigo-50 transition-all shadow-xl"><Play fill="black" size={20} /> Watch & Shop</button>
          </div>
        </div>
      </section>
      <div className="max-w-7xl mx-auto px-6 py-24 space-y-24">
        <MovieRow title="Trending Trailers" movies={tmdbMovies} onSelect={setSelectedMovie} />
        <MovieRow title="Recently Added" movies={moviesOnly.slice(4)} onSelect={setSelectedMovie} />
      </div>
    </div>
  );

  const MoviesPage = () => (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-5xl font-display font-bold mb-12 tracking-tighter">THE CINEMA <span className="text-indigo-500">COLLECTION</span></h2>
        <MovieGrid movies={moviesOnly} onSelect={setSelectedMovie} />
    </div>
  );

  const TVPage = () => (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <h2 className="text-5xl font-display font-bold mb-12 tracking-tighter">BINGEABLE <span className="text-indigo-500">SERIES</span></h2>
        <MovieGrid movies={tvShowsOnly} onSelect={setSelectedMovie} />
    </div>
  );

  const NewPage = () => (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center gap-4 mb-12">
            <TrendingUp className="text-indigo-500" size={40} />
            <h2 className="text-5xl font-display font-bold tracking-tighter">NEW & <span className="text-gray-600">POPULAR</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
            {trendingNow.map((m, idx) => (
                <div key={m.id} onClick={() => setSelectedMovie(m)} className="group flex gap-6 items-center cursor-pointer p-4 rounded-3xl bg-white/5 border border-white/5 hover:border-indigo-500/50 transition-all">
                    <span className="text-5xl font-display font-black text-white/10 group-hover:text-indigo-500/20">{idx + 1}</span>
                    <img src={m.thumbnail} className="w-40 aspect-video rounded-xl object-cover" alt="" />
                    <div><h4 className="font-bold text-lg group-hover:text-indigo-400">{m.title}</h4><p className="text-xs text-gray-500">{m.year}</p></div>
                </div>
            ))}
        </div>
        <MovieGrid movies={tmdbMovies.slice(8)} onSelect={setSelectedMovie} />
    </div>
  );

  const StudioPage = () => (
    <div className="pt-32 px-6 max-w-7xl mx-auto pb-24 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-between items-center mb-12">
            <h2 className="text-5xl font-display font-bold tracking-tighter">MY <span className="text-indigo-500">STUDIO</span></h2>
            <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-indigo-600 px-8 py-4 rounded-2xl font-bold transition-all hover:scale-105"><Plus size={20} /> Upload</button>
        </div>
        {customMovies.length === 0 ? (
            <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-white/10 rounded-[40px] p-32 text-center cursor-pointer hover:border-indigo-500/50 transition-all">
                <UploadCloud size={64} className="mx-auto text-gray-500 mb-8" />
                <h3 className="text-2xl font-bold">Upload a video to start scanning</h3>
            </div>
        ) : <MovieGrid movies={customMovies} onSelect={setSelectedMovie} /> }
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050505] text-white">
      {(isLoading || isProcessingFile) && (
        <div className="fixed inset-0 z-[110] bg-black/95 flex flex-col items-center justify-center">
          <Loader2 size={60} className="text-indigo-500 animate-spin mb-6" />
          <p className="text-2xl font-bold tracking-[0.3em] animate-pulse">PREPARING SCENESHOP AI...</p>
        </div>
      )}

      {/* --- NAVBAR RESTORED --- */}
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
                  {currentPage === tab.id && <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-6">
            <button onClick={() => setCurrentPage('studio')} className="bg-indigo-600 px-6 py-2.5 rounded-full text-xs font-bold transition-all hover:scale-105 shadow-xl shadow-indigo-600/20"><UploadCloud size={14} className="inline mr-2" /> Upload</button>
            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center cursor-pointer border border-white/10"><User size={20} /></div>
          </div>
        </div>
      </nav>

      <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processVideoFile(e.target.files[0])} accept="video/*" className="hidden" />

      {/* --- MAIN PAGE RENDERING --- */}
      <main className="min-h-screen">
        {currentPage === 'browse' && <BrowsePage />}
        {currentPage === 'movies' && <MoviesPage />}
        {currentPage === 'tv' && <TVPage />}
        {currentPage === 'new' && <NewPage />}
        {currentPage === 'studio' && <StudioPage />}
      </main>

      {selectedMovie && <VideoPlayer movie={selectedMovie} onClose={() => setSelectedMovie(null)} />}

      <footer className="max-w-7xl mx-auto px-6 py-20 border-t border-white/5 text-center text-gray-500">
        <h4 className="text-xl font-display font-bold text-white mb-4">SCENESHOP AI</h4>
        <p className="text-sm max-w-md mx-auto">Experience the future of interactive entertainment. Powered by Gemini Multimodal Vision and TMDB.</p>
        <div className="flex justify-center gap-8 mt-10 opacity-30"><Film size={20} /><Tv size={20} /><ShoppingBag size={20} /></div>
      </footer>
    </div>
  );
};

// Reusable Sub-components
const MovieRow: React.FC<{ title: string, movies: Movie[], onSelect: (m: Movie) => void }> = ({ title, movies, onSelect }) => (
  <div className="py-4">
    <div className="flex items-center justify-between mb-8">
      <h3 className="text-2xl font-bold">{title}</h3>
      <button className="text-indigo-400 text-sm font-bold flex items-center gap-1">View All <ChevronRight size={16} /></button>
    </div>
    <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
      {movies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} className="min-w-[320px]" />)}
    </div>
  </div>
);

const MovieGrid: React.FC<{ movies: Movie[], onSelect: (m: Movie) => void }> = ({ movies, onSelect }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
    {movies.map(m => <MovieCard key={m.id} movie={m} onSelect={onSelect} />)}
  </div>
);

const MovieCard: React.FC<{ movie: Movie, onSelect: (m: Movie) => void, className?: string }> = ({ movie, onSelect, className = "" }) => (
  <div className={`group bg-[#0a0a0a] rounded-3xl overflow-hidden border border-white/5 cursor-pointer transition-all hover:border-indigo-500/50 ${className}`} onClick={() => onSelect(movie)}>
    <div className="aspect-[16/10] relative">
      <img src={movie.thumbnail} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"><Play fill="white" size={32} /></div>
    </div>
    <div className="p-6">
      <h4 className="font-bold text-lg mb-1 truncate">{movie.title}</h4>
      <p className="text-xs text-gray-500">{movie.year} • {movie.genre[1] || movie.genre[0]}</p>
    </div>
  </div>
);

export default App;
