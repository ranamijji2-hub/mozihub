import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Search, Heart, Film, User, Settings, Key, Star, ArrowLeft, 
  Volume2, VolumeX, Maximize, RotateCcw, RotateCw, Check, Plus, Sparkles, X, Tv, Shield,
  Maximize2, Crop, RefreshCw
} from 'lucide-react';

const DEFAULT_TMDB_KEY = ""; 

const CATEGORIES = [
  { id: 'all', name: '🔥 Trending', endpoint: '/trending/movie/week' },
  { id: 'hollywood', name: '🎬 Hollywood (Popular)', endpoint: '/movie/popular' },
  { id: 'bollywood', name: '🇮🇳 Bollywood / Hindi', endpoint: '/discover/movie?with_original_language=hi' },
  { id: 'korean', name: '🇰🇷 Korean / K-Drama', endpoint: '/discover/movie?with_original_language=ko' },
  { id: 'action', name: '⚡ Action', endpoint: '/discover/movie?with_genres=28' },
  { id: 'anime', name: '🌸 Anime / Japanese', endpoint: '/discover/movie?with_original_language=ja' },
  { id: 'top_rated', name: '⭐ Top Rated', endpoint: '/movie/top_rated' }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mozihub_tmdb_key') || DEFAULT_TMDB_KEY);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES[0]);
  const [movies, setMovies] = useState([]);
  const [heroMovie, setHeroMovie] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [serverSource, setServerSource] = useState('server1');
  const [aspectMode, setAspectMode] = useState('contain');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const playerRef = useRef(null);

  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem('mozihub_watchlist') || '[]'));

  useEffect(() => {
    localStorage.setItem('mozihub_tmdb_key', apiKey);
    fetchCategoryMovies(activeCategory);
  }, [apiKey, activeCategory]);

  const fetchCategoryMovies = async (category) => {
    setLoading(true);
    try {
      if (!apiKey) {
        setMovies(Array.from({ length: 12 }).map((_, i) => ({
          id: `550`,
          title: `Sample Movie ${i+1} (Add TMDB Key)`,
          overview: "Please enter your TMDB API Key in Settings to unlock real Hollywood, Bollywood, and K-Drama catalogs.",
          poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60",
          backdrop: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=60",
          rating: '8.8',
          year: '2025'
        })));
        setHeroMovie({
          id: `550`,
          title: 'Full Movie Stream Test',
          overview: 'Click Watch Now to stream full movies with Netflix-style controls.',
          backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=60',
          rating: '9.0',
          year: '2025'
        });
        setLoading(false);
        return;
      }

      const delimiter = category.endpoint.includes('?') ? '&' : '?';
      const url = `https://api.themoviedb.org/3${category.endpoint}${delimiter}api_key=${apiKey}&page=1`;
      
      const res = await fetch(url);
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const formatted = data.results.map((m) => ({
          id: m.id.toString(),
          title: m.title || m.original_title,
          overview: m.overview || 'No description available.',
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
          backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
          rating: m.vote_average ? m.vote_average.toFixed(1) : '7.5',
          year: m.release_date ? m.release_date.split('-')[0] : '2025',
          language: m.original_language?.toUpperCase()
        }));
        setMovies(formatted);
        setHeroMovie(formatted[0]);
      }
    } catch (err) {
      console.error("TMDB Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim() || !apiKey) {
      setSearchResults([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${apiKey}&query=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        if (data.results) {
          const formatted = data.results.map(m => ({
            id: m.id.toString(),
            title: m.title || m.original_title,
            overview: m.overview,
            poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500',
            backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200',
            rating: m.vote_average ? m.vote_average.toFixed(1) : '7.0',
            year: m.release_date ? m.release_date.split('-')[0] : '2025'
          }));
          setSearchResults(formatted);
        }
      } catch (e) {
        console.error(e);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, apiKey]);

  const startFullMovieStream = (movie) => {
    setPlayingVideo(movie);
  };

  const getStreamUrl = (movieId, server) => {
    if (server === 'server1') return `https://vidsrc.cc/v2/embed/movie/${movieId}`;
    if (server === 'server2') return `https://vidsrc.me/embed/movie?tmdb=${movieId}`;
    if (server === 'server3') return `https://www.2embed.cc/embed/${movieId}`;
    return `https://vidsrc.cc/v2/embed/movie/${movieId}`;
  };

  const toggleWatchlist = (movie) => {
    const updated = watchlist.some(m => m.id === movie.id)
      ? watchlist.filter(m => m.id !== movie.id)
      : [...watchlist, movie];
    setWatchlist(updated);
    localStorage.setItem('mozihub_watchlist', JSON.stringify(updated));
  };

  const toggleFullscreenRotate = () => {
    if (!playerRef.current) return;
    if (!document.fullscreenElement) {
      playerRef.current.requestFullscreen().then(() => {
        setIsFullscreen(true);
        if (window.screen.orientation && window.screen.orientation.lock) {
          window.screen.orientation.lock('landscape').catch(() => {});
        }
      }).catch(() => {});
    } else {
      document.exitFullscreen().then(() => {
        setIsFullscreen(false);
        if (window.screen.orientation && window.screen.orientation.unlock) {
          window.screen.orientation.unlock();
        }
      }).catch(() => {});
    }
  };

  const cycleAspectMode = () => {
    if (aspectMode === 'contain') setAspectMode('cover');
    else if (aspectMode === 'cover') setAspectMode('fill');
    else setAspectMode('contain');
  };

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans border-x border-gray-800">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-black/80 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-red-600">MOZIHUB</span>
        </div>
        <button 
          onClick={() => {
            const key = prompt("Enter TMDB API Key:", apiKey);
            if (key !== null) setApiKey(key);
          }} 
          className={`p-2 rounded-full border ${apiKey ? 'bg-green-950/60 border-green-600 text-green-400' : 'bg-red-950/60 border-red-600 text-red-400'}`}
          title="Configure TMDB API Key"
        >
          <Key className="w-4 h-4" />
        </button>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-4 pt-3">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                    activeCategory.id === cat.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-gray-900 border border-gray-800 text-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {heroMovie && (
              <div className="relative h-96 w-full group">
                <img src={heroMovie.backdrop} alt={heroMovie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/50 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 bg-red-600 text-[10px] font-bold rounded-full uppercase tracking-wider">
                      {activeCategory.name}
                    </span>
                    {heroMovie.language && (
                      <span className="px-2 py-0.5 bg-gray-800 text-[10px] font-bold rounded text-gray-300">
                        {heroMovie.language}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl font-bold">{heroMovie.title}</h1>
                  <p className="text-xs text-gray-300 line-clamp-2">{heroMovie.overview}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => startFullMovieStream(heroMovie)}
                      className="flex-1 bg-red-600 hover:bg-red-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition text-sm"
                    >
                      <Play className="w-4 h-4 fill-current" /> Play Movie
                    </button>
                    <button 
                      onClick={() => toggleWatchlist(heroMovie)}
                      className="p-2.5 bg-gray-800/80 backdrop-blur rounded-lg border border-gray-700"
                    >
                      {watchlist.some(m => m.id === heroMovie.id) ? <Check className="w-5 h-5 text-red-500" /> : <Plus className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="px-4 space-y-4">
              <h2 className="text-base font-bold flex items-center justify-between">
                <span>{activeCategory.name} Catalog</span>
                <span className="text-xs font-normal text-gray-500">{movies.length} movies</span>
              </h2>

              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">Loading TMDB Catalog...</div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {movies.map(movie => (
                    <div 
                      key={movie.id} 
                      onClick={() => startFullMovieStream(movie)}
                      className="space-y-1 cursor-pointer group"
                    >
                      <div className="relative h-44 rounded-xl overflow-hidden border border-gray-800 bg-gray-900">
                        <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-[10px] font-bold text-yellow-400 flex items-center gap-1">
                          <Star className="w-3 h-3 fill-current" /> {movie.rating}
                        </div>
                      </div>
                      <p className="text-xs font-semibold truncate">{movie.title}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search Bollywood, Hollywood, K-dramas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-xs focus:outline-none focus:border-red-60
          
