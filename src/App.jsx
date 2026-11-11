
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, Pause, Search, Heart, Film, User, Settings, Shield, Award, 
  Download, Plus, Check, Star, Volume2, VolumeX, Maximize, RotateCcw, 
  RotateCw, Key, ChevronRight, Lock, Tv, Sparkles, CheckCircle, ArrowLeft, RefreshCw
} from 'lucide-react';

const DEFAULT_TMDB_KEY = ""; // Users can input their TMDB API Key in Settings / Profile

const FALLBACK_MOVIES = [
  {
    id: 'f1',
    title: 'Tears of Steel',
    overview: 'In a dystopian future, a group of soldiers and scientists gather at the Oude Kerk in Amsterdam to stage a desperate attempt to save the world from destructive robots.',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=500&auto=format&fit=crop&q=60',
    backdrop: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1200&auto=format&fit=crop&q=60',
    rating: '8.4',
    year: '2024',
    genre: 'Sci-Fi',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4'
  },
  {
    id: 'f2',
    title: 'Big Buck Bunny',
    overview: 'A large and lovable rabbit deals with bullying forest creatures in a humorous and colorful woodland adventure.',
    poster: 'https://images.unsplash.com/photo-1535016120720-40c646be5580?w=500&auto=format&fit=crop&q=60',
    backdrop: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200&auto=format&fit=crop&q=60',
    rating: '7.9',
    year: '2024',
    genre: 'Animation',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
  },
  {
    id: 'f3',
    title: 'Sintel',
    overview: 'A lonely young woman searches for a dragon cub she nursed back to health, embarking on a dangerous journey across mythical realms.',
    poster: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=60',
    backdrop: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=60',
    rating: '8.7',
    year: '2025',
    genre: 'Fantasy',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4'
  },
  {
    id: 'f4',
    title: 'Elephants Dream',
    overview: 'Two men explore a strange mechanical universe constructed inside a giant machine, encountering bizarre puzzles.',
    poster: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=500&auto=format&fit=crop&q=60',
    backdrop: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=60',
    rating: '7.5',
    year: '2023',
    genre: 'Sci-Fi',
    streamUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('mozihub_tmdb_key') || DEFAULT_TMDB_KEY);
  const [movies, setMovies] = useState(FALLBACK_MOVIES);
  const [heroMovie, setHeroMovie] = useState(FALLBACK_MOVIES[0]);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  
  // Persistence
  const [watchlist, setWatchlist] = useState(() => JSON.parse(localStorage.getItem('mozihub_watchlist') || '[]'));
  const [downloads, setDownloads] = useState(() => JSON.parse(localStorage.getItem('mozihub_downloads') || '[]'));
  const [subscription, setSubscription] = useState(() => localStorage.getItem('mozihub_plan') || 'Free');
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    localStorage.setItem('mozihub_tmdb_key', apiKey);
    if (apiKey) {
      fetchLiveTMDBData(apiKey);
    }
  }, [apiKey]);

  const fetchLiveTMDBData = async (key) => {
    try {
      const res = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${key}`);
      const data = await res.json();
      if (data.results && data.results.length > 0) {
        const formatted = data.results.map((m, idx) => ({
          id: m.id.toString(),
          title: m.title || m.original_title,
          overview: m.overview,
          poster: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : FALLBACK_MOVIES[0].poster,
          backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : FALLBACK_MOVIES[0].backdrop,
          rating: m.vote_average ? m.vote_average.toFixed(1) : '8.0',
          year: m.release_date ? m.release_date.split('-')[0] : '2025',
          genre: 'Trending',
          streamUrl: FALLBACK_MOVIES[idx % FALLBACK_MOVIES.length].streamUrl
        }));
        setMovies(formatted);
        setHeroMovie(formatted[0]);
      }
    } catch (err) {
      console.error("TMDB Fetch Error:", err);
    }
  };

  const toggleWatchlist = (movie) => {
    const updated = watchlist.some(m => m.id === movie.id)
      ? watchlist.filter(m => m.id !== movie.id)
      : [...watchlist, movie];
    setWatchlist(updated);
    localStorage.setItem('mozihub_watchlist', JSON.stringify(updated));
  };

  const toggleDownload = (movie) => {
    const updated = downloads.some(m => m.id === movie.id)
      ? downloads.filter(m => m.id !== movie.id)
      : [...downloads, movie];
    setDownloads(updated);
    localStorage.setItem('mozihub_downloads', JSON.stringify(updated));
  };

  const filteredMovies = movies.filter(m => {
    const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGenre = selectedGenre === 'All' || m.genre === selectedGenre;
    return matchesSearch && matchesGenre;
  });

  return (
    <div className="min-h-screen bg-[#0D0D0D] text-white flex flex-col justify-between max-w-md mx-auto relative shadow-2xl overflow-hidden font-sans border-x border-gray-800">
      
      {/* Header */}
      <header className="p-4 flex items-center justify-between bg-black/60 backdrop-blur-md sticky top-0 z-40 border-b border-gray-800">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
          <div className="bg-red-600 p-1.5 rounded-lg">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl tracking-wider text-red-600">MOZIHUB</span>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              const key = prompt("Enter TMDB API Key:", apiKey);
              if (key !== null) setApiKey(key);
            }} 
            className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-300"
            title="Configure TMDB API Key"
          >
            <Key className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 overflow-y-auto pb-24">
        {activeTab === 'home' && (
          <div className="space-y-6">
            {/* Hero Section */}
            {heroMovie && (
              <div className="relative h-96 w-full group">
                <img src={heroMovie.backdrop} alt={heroMovie.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0D0D0D] via-[#0D0D0D]/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 space-y-2">
                  <span className="px-2.5 py-1 bg-red-600 text-xs font-semibold rounded-full uppercase tracking-wider">
                    Featured
                  </span>
                  <h1 className="text-3xl font-bold">{heroMovie.title}</h1>
                  <p className="text-xs text-gray-300 line-clamp-2">{heroMovie.overview}</p>
                  <div className="flex items-center gap-3 pt-2">
                    <button 
                      onClick={() => setPlayingVideo(heroMovie)}
                      className="flex-1 bg-red-600 hover:bg-red-700 font-semibold py-2.5 rounded-lg flex items-center justify-center gap-2 transition"
                    >
                      <Play className="w-4 h-4 fill-current" /> Watch Now
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

            {/* Movie Catalog Rails */}
            <div className="px-4 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-red-500" /> Trending Now
              </h2>
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {movies.map(movie => (
                  <div 
                    key={movie.id} 
                    onClick={() => setSelectedMovie(movie)}
                    className="flex-none w-36 space-y-2 cursor-pointer group"
                  >
                    <div className="relative h-52 rounded-xl overflow-hidden border border-gray-800">
                      <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
                      <div className="absolute top-2 right-2 bg-black/70 px-1.5 py-0.5 rounded text-xs font-bold text-yellow-400 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-current" /> {movie.rating}
                      </div>
                    </div>
                    <p className="text-sm font-semibold truncate">{movie.title}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'search' && (
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input 
                type="text"
                placeholder="Search movies, genres..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-red-600"
              />
            </div>
            
            {/* Grid */}
            <div className="grid grid-cols-3 gap-3">
              {filteredMovies.map(movie => (
                <div 
                  key={movie.id} 
                  onClick={() => setSelectedMovie(movie)}
                  className="space-y-1 cursor-pointer"
                >
                  <div className="h-40 rounded-lg overflow-hidden border border-gray-800">
                    <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-medium truncate">{movie.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'library' && (
          <div className="p-4 space-y-4">
            <h2 className="text-lg font-bold">My Watchlist ({watchlist.length})</h2>
            {watchlist.length === 0 ? (
              <p className="text-sm text-gray-500">No movies saved to watchlist yet.</p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {watchlist.map(movie => (
                  <div key={movie.id} onClick={() => setSelectedMovie(movie)} className="cursor-pointer space-y-1">
                    <img src={movie.poster} alt={movie.title} className="h-40 w-full object-cover rounded-lg" />
                    <p className="text-xs font-medium truncate">{movie.title}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="p-4 space-y-6">
            <div className="flex items-center gap-4 bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="w-14 h-14 bg-red-600 rounded-full flex items-center justify-center text-xl font-bold">
                M
              </div>
              <div>
                <h3 className="font-bold text-base">MoziHub User</h3>
                <p className="text-xs text-gray-400">Subscription: <span className="text-red-500 font-semibold">{subscription}</span></p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-400 uppercase">Subscription Tier</h4>
              <div className="grid grid-cols-3 gap-2">
                {['Free', 'Standard', 'Premium'].map((plan) => (
                  <button
                    key={plan}
                    onClick={() => {
                      setSubscription(plan);
                      localStorage.setItem('mozihub_plan', plan);
                    }}
                    className={`p-3 rounded-xl border text-xs font-bold transition ${
                      subscription === plan ? 'bg-red-600 border-red-600' : 'bg-gray-900 border-gray-800 text-gray-400'
                    }`}
                  >
                    {plan}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      {playingVideo && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col justify-center">
          <button 
            onClick={() => setPlayingVideo(null)} 
            className="absolute top-4 left-4 z-50 p-2 bg-black/50 rounded-full text-white"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <video 
            src={playingVideo.streamUrl} 
            controls 
            autoPlay 
            className="w-full max-h-screen object-contain"
          />
        </div>
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/90 backdrop-blur-md border-t border-gray-800 flex justify-around py-3 z-40">
        {[
          { id: 'home', label: 'Home', icon: Film },
          { id: 'search', label: 'Search', icon: Search },
          { id: 'library', label: 'Library', icon: Heart },
          { id: 'profile', label: 'Profile', icon: User }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 text-xs font-medium transition ${
                activeTab === tab.id ? 'text-red-600' : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
          }
