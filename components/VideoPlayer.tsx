
import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Movie, DetectedProduct, AnalysisState } from '../types';
import { analyzeFrame } from '../services/gemini';
import { 
  Play, 
  Pause, 
  ShoppingBag, 
  Loader2, 
  X, 
  RefreshCw, 
  Volume2, 
  Maximize, 
  ChevronLeft, 
  Search,
  Rewind,
  FastForward,
  ShoppingCart,
  AlertCircle,
  Youtube
} from 'lucide-react';

interface VideoPlayerProps {
  movie: Movie;
  onClose: () => void;
}

// Global YouTube API tracker
declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoLoading, setIsVideoLoading] = useState(true);
  const [isYTReady, setIsYTReady] = useState(false);
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    isAnalyzing: false,
    products: [],
    error: null,
  });

  const isYouTube = useCallback(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    return !!movie.videoUrl.match(regExp);
  }, [movie.videoUrl]);

  const getYTId = useCallback(() => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = movie.videoUrl.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }, [movie.videoUrl]);

  const analyzeYouTubeThumbnail = async () => {
    const ytId = getYTId();
    if (!ytId || !canvasRef.current) return;

    setAnalysis({ isAnalyzing: true, products: [], error: null });

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error("Could not get canvas context");

      const thumbUrl = `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`;
      const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(thumbUrl)}`;
      
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = proxyUrl;
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = () => reject(new Error("Failed to load YouTube thumbnail for analysis"));
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      const detectedProducts = await analyzeFrame(base64Image);
      
      setAnalysis({
        isAnalyzing: false,
        products: detectedProducts,
        error: null,
      });
    } catch (err: any) {
      console.error("YouTube analysis error:", err);
      setAnalysis({
        isAnalyzing: false,
        products: [],
        error: "AI cannot access frames from this YouTube video directly. We analyzed the video preview instead.",
      });
    }
  };

  const handlePauseAndAnalyze = useCallback(async () => {
    if (isYouTube()) {
      return analyzeYouTubeThumbnail();
    }

    if (!videoRef.current || !canvasRef.current || videoError) return;

    setAnalysis({ isAnalyzing: true, products: [], error: null });

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      const context = canvas.getContext('2d', { willReadFrequently: true });

      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        setTimeout(async () => {
          try {
            context.drawImage(video, 0, 0, canvas.width, canvas.height);
            const base64Image = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
            const detectedProducts = await analyzeFrame(base64Image);
            
            setAnalysis({
              isAnalyzing: false,
              products: detectedProducts,
              error: null,
            });
          } catch (canvasErr: any) {
            setAnalysis({
              isAnalyzing: false,
              products: [],
              error: "Security policies (CORS) blocked frame analysis for this direct link.",
            });
          }
        }, 150);
      }
    } catch (err) {
      setAnalysis({
        isAnalyzing: false,
        products: [],
        error: "Failed to analyze products in this scene.",
      });
    }
  }, [videoError, isYouTube, getYTId]);

  useEffect(() => {
    if (!isYouTube()) return;

    const createPlayer = () => {
      if (!ytContainerRef.current) return;
      ytPlayerRef.current = new window.YT.Player(ytContainerRef.current, {
        videoId: getYTId(),
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          showinfo: 0,
          modestbranding: 1,
        },
        events: {
          onReady: () => {
            setIsYTReady(true);
            setIsVideoLoading(false);
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
              setIsPaused(false);
            } else if (event.data === 2) {
              setIsPlaying(false);
              setIsPaused(true);
              handlePauseAndAnalyze();
            }
          },
          onError: () => setVideoError("YouTube player failed to load."),
        }
      });
    };

    if (!window.YT) {
      // Check if the script is already added to head
      if (!document.getElementById('youtube-api')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api';
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      
      const prevHandler = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevHandler) prevHandler();
        createPlayer();
      };
    } else if (window.YT && window.YT.Player) {
      createPlayer();
    }

    return () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
      }
    };
  }, [isYouTube, getYTId, handlePauseAndAnalyze]);

  const togglePlay = (e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (isYouTube() && isYTReady) {
      const state = ytPlayerRef.current.getPlayerState();
      if (state === 1) ytPlayerRef.current.pauseVideo();
      else ytPlayerRef.current.playVideo();
    } else if (videoRef.current && !videoError) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const seek = (seconds: number, e?: React.MouseEvent | KeyboardEvent) => {
    e?.stopPropagation();
    if (isYouTube() && isYTReady) {
      const current = ytPlayerRef.current.getCurrentTime();
      ytPlayerRef.current.seekTo(current + seconds, true);
    } else if (videoRef.current && !videoError) {
      videoRef.current.currentTime += seconds;
    }
  };

  const getStoreStyles = (storeName: string) => {
    const name = storeName.toLowerCase();
    if (name.includes('amazon')) return 'bg-orange-600 hover:bg-orange-500';
    if (name.includes('flipkart')) return 'bg-blue-600 hover:bg-blue-500';
    return 'bg-indigo-600 hover:bg-indigo-500';
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col md:flex-row overflow-hidden">
      <div className="relative flex-1 bg-black group flex items-center justify-center overflow-hidden">
        {isVideoLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-20 bg-black">
            <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
          </div>
        )}

        {videoError ? (
          <div className="flex flex-col items-center justify-center p-12 text-center max-w-md mx-auto space-y-6">
            <AlertCircle className="text-red-500" size={60} />
            <h3 className="text-2xl font-bold">{videoError}</h3>
            <button onClick={onClose} className="px-8 py-3 bg-white text-black rounded-xl font-bold">Go Back</button>
          </div>
        ) : (
          <div className="w-full h-full relative" onClick={() => togglePlay()}>
            {isYouTube() ? (
              <div ref={ytContainerRef} className="w-full h-full" />
            ) : (
              <video
                ref={videoRef}
                src={movie.videoUrl}
                className="w-full h-full object-contain"
                crossOrigin="anonymous"
                onPlay={() => { setIsPlaying(true); setIsPaused(false); }}
                onPause={() => { setIsPlaying(false); setIsPaused(true); handlePauseAndAnalyze(); }}
                onError={() => setVideoError("Video file failed to load.")}
                onLoadedData={() => setIsVideoLoading(false)}
                autoPlay
              />
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}

        <div className="absolute top-0 left-0 right-0 p-8 flex items-center justify-between pointer-events-none">
          <button onClick={onClose} className="pointer-events-auto flex items-center gap-2 px-4 py-2 bg-black/40 hover:bg-white/10 rounded-full backdrop-blur-xl transition-all border border-white/5 text-sm font-bold">
            <ChevronLeft size={20} /> Back to Browse
          </button>
          {isYouTube() && (
            <div className="bg-red-600 px-4 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-2 pointer-events-none">
              <Youtube size={14} /> YOUTUBE MODE
            </div>
          )}
        </div>

        {!videoError && (
          <div className={`absolute bottom-0 left-0 right-0 p-8 transition-all ${isPlaying ? 'opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0' : 'opacity-100 translate-y-0'}`}>
            <div className="max-w-4xl mx-auto flex items-end justify-between gap-8">
              <div className="flex-1">
                <h2 className="text-4xl font-display font-bold mb-2">{movie.title}</h2>
                <p className="text-gray-400 text-sm max-w-xl">{movie.description}</p>
              </div>
              <div className="flex items-center gap-4 bg-black/40 p-2 rounded-full backdrop-blur-xl border border-white/5 shadow-2xl">
                <button onClick={(e) => seek(-10, e)} className="p-3 text-white/60 hover:text-white"><Rewind size={24} /></button>
                <button onClick={() => togglePlay()} className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                  {isPlaying ? <Pause size={28} /> : <Play size={28} fill="black" className="ml-1" />}
                </button>
                <button onClick={(e) => seek(10, e)} className="p-3 text-white/60 hover:text-white"><FastForward size={24} /></button>
              </div>
            </div>
          </div>
        )}

        {analysis.isAnalyzing && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-indigo-500 shadow-[0_0_20px_rgba(99,102,241,1)] animate-scan-line" />
          </div>
        )}
      </div>

      <div className={`w-full md:w-[450px] bg-[#080808] border-l border-white/5 flex flex-col transition-all shadow-2xl z-10 ${isPaused ? 'translate-x-0' : 'translate-x-full md:translate-x-0 md:opacity-50'}`}>
        <div className="p-8 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShoppingBag className="text-indigo-400" />
            <h3 className="text-lg font-bold">SceneShop AI</h3>
          </div>
          {analysis.isAnalyzing && <Loader2 className="animate-spin text-indigo-400" />}
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {isPaused && !analysis.isAnalyzing && analysis.products.length > 0 && (
            <div className="space-y-6">
              {analysis.products.map((product) => (
                <div key={product.id} className="bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-indigo-500/5 transition-all">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] px-2 py-1 rounded bg-indigo-500/20 text-indigo-300 font-bold uppercase">{product.category}</span>
                    <span className="font-bold">{product.priceEstimate}</span>
                  </div>
                  <h5 className="font-bold text-xl mb-2">{product.name}</h5>
                  <p className="text-sm text-gray-400 mb-6 line-clamp-2">{product.description}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {product.shopLinks.map((link, idx) => (
                      <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-xs ${getStoreStyles(link.storeName)}`}>
                        <ShoppingCart size={14} /> {link.storeName}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {analysis.error && (
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-200 text-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 font-bold"><AlertCircle size={16} /> Analysis Notice</div>
              <p>{analysis.error}</p>
              <button onClick={() => handlePauseAndAnalyze()} className="text-indigo-400 font-bold hover:underline">Retry Analysis</button>
            </div>
          )}

          {!isPaused && (
             <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
               <Play size={40} />
               <p className="text-sm font-bold uppercase tracking-widest">Pause Video to Discover Products</p>
             </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          100% { top: 100%; }
        }
        .animate-scan-line { animation: scan-line 2s linear infinite; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
