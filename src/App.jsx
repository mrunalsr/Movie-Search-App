import React, { useState, useEffect, useCallback } from "react";

const API_KEY = "37a04fb8"; // 🔹 Replace with your API Key

const App = () => {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [popularMovies, setPopularMovies] = useState([]);
  const [favorites, setFavorites] = useState([]);

  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [favoriteMessage, setFavoriteMessage] = useState(null);

  useEffect(() => {
    localStorage.setItem("favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    fetchPopularMovies();
    loadFavorites();
  }, []);

  const fetchPopularMovies = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const bollywoodMovieNames = [
        "Sholay", "Dilwale Dulhania Le Jayenge", "3 Idiots",
        "Zindagi Na Milegi Dobara", "Kabir Singh", "Gully Boy",
        "Dangal", "Bajrangi Bhaijaan", "Tumbbad", "Lagaan"
      ];
  
      const uniqueMovies = await Promise.all(
        bollywoodMovieNames.map(async (name) => {
          const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&t=${name}`);
          const data = await response.json();
          if (data.Response === "True") {
            data.rating = (Math.floor(Math.random() * 5) + 1) + ".0";
            return data;
          }
          return null;
        })
      );
  
      setPopularMovies(uniqueMovies.filter((movie) => movie !== null));
    } catch (err) {
      setError("Failed to load movies. Please try again.");
    }
    setLoading(false);
  }, []);
  
  

  const fetchSuggestions = async (query) => {
    if (query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
  
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${query}`);
      const data = await response.json();
  
      console.log("API Response:", data); // Debugging output
  
      if (data.Response === "True" && data.Search) {
        // Filter unique titles
        const uniqueResults = data.Search.reduce((acc, movie) => {
          if (!acc.some((m) => m.Title === movie.Title)) {
            acc.push(movie);
          }
          return acc;
        }, []);
  
        setSuggestions(uniqueResults);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  };
  

  const loadFavorites = () => {
    const savedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
    setFavorites(savedFavorites);
  };

  const toggleFavorite = (movie) => {
    const isFavorite = favorites.some((fav) => fav.imdbID === movie.imdbID);
    const updatedFavorites = isFavorite
      ? favorites.filter((fav) => fav.imdbID !== movie.imdbID)
      : [...favorites, movie];
  
    setFavorites(updatedFavorites);
    localStorage.setItem("favorites", JSON.stringify(updatedFavorites));
  
    // Show message dynamically
    setFavoriteMessage({
      id: movie.imdbID,
      text: isFavorite ? "Removed from Favorites" : "Added to Favorites"
    });
  
    // Remove message after 2 seconds
    setTimeout(() => setFavoriteMessage(null), 2000);
  };
  

  const searchMovies = async () => {
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`https://www.omdbapi.com/?apikey=${API_KEY}&s=${searchTerm}`);
      const data = await response.json();
      if (data.Response === "True") {
        setMovies(data.Search);
      } else {
        setMovies([]);
        setError("No movies found.");
      }
    } catch (err) {
      setError("Failed to search movies. Please try again.");
    }
    setLoading(false);
  };

  return (
    
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <nav className="flex justify-between items-center p-4 bg-gray-800 shadow-lg">
        <h1 className="text-2xl font-bold text-yellow-400">🎬 Movie App</h1>
        <div className="flex gap-6 text-2xl">
          <span className="cursor-pointer" title="Home">🏠</span>
          <span className="cursor-pointer" title="About">📜</span>
          <span className="cursor-pointer" title="Favorites">❤️</span>
          <span className="cursor-pointer" title="Trending">🔥</span>
        </div>
      </nav>

      <div className="flex justify-center mt-6">
        <input
          type="text"
          placeholder="Search for a movie..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            fetchSuggestions(e.target.value);
          }}
          onKeyDown={(event) =>{
            if(event.key == "Enter"){
              searchMovies();
            }
          }}
          
          className="p-2 rounded-l-md bg-gray-800 border border-gray-600 text-white focus:outline-none"
        />
        <button
          onClick={searchMovies}
          className="bg-yellow-400 px-4 py-2 rounded-r-md text-gray-900 font-bold hover:bg-yellow-500"
        >
          🔍 Search
        </button>

        {suggestions.length > 0 && (
          <ul className="absolute top-200 left-50 w-50 bg-gray-800 border border-gray-600 rounded-md mt-1 z-50 shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((movie) => (
              <li
                key={movie.imdbID}
                className="p-2 hover:bg-gray-700 cursor-pointer"
                onClick={() => {
                  setSearchTerm(movie.Title);
                  setSuggestions([]); // Hide suggestions after selection
                  searchMovies();
                }}
              >
                {movie.Title} ({movie.Year})
              </li>
            ))}
          </ul>
        )}
      </div>


      {loading && <p className="text-center text-yellow-400 mt-4">Loading movies...</p>}
      {error && <p className="text-center text-red-400 mt-4">{error}</p>}

      {movies.length > 0 && (
        <>
          <h2 className="text-2xl font-bold mt-8 text-yellow-400">🔎 Search Results</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
            {movies.map((movie) => (
              <div key={movie.imdbID} className="bg-gray-800 p-4 rounded-lg shadow-lg relative">
                <img src={movie.Poster} alt={movie.Title} className="rounded-md w-full h-80 object-cover" />
                <h3 className="text-xl font-semibold mt-2">{movie.Title} ({movie.Year})</h3>
                <span
                  className={`absolute top-4 right-4 text-2xl cursor-pointer ${favorites.some((fav) => fav.imdbID === movie.imdbID) ? "text-red-500" : "text-gray-400"}`}
                  onClick={() => toggleFavorite(movie)}
                >
                  ❤️
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <h2 className="text-2xl font-bold mt-8 text-yellow-400">🔥 Popular Bollywood Movies</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mt-6">
        {popularMovies.map((movie) => (
          <div key={movie.imdbID} className="bg-gray-800 p-4 rounded-lg shadow-lg relative">
            <img src={movie.Poster} alt={movie.Title} className="rounded-md w-full h-80 object-cover" />
            <h3 className="text-xl font-semibold mt-2">{movie.Title} ({movie.Year})</h3>
            <p className="text-yellow-400 mt-1">⭐ {movie.rating}</p>
            <span
              className={`absolute top-4 right-4 text-2xl cursor-pointer ${favorites.some((fav) => fav.imdbID === movie.imdbID) ? "text-red-500" : "text-gray-400"}`}
              onClick={() => toggleFavorite(movie)}
            >
              {favorites.some((fav) => fav.imdbID === movie.imdbID) ? "❤️" : "🤍"}
            </span>

            {favoriteMessage?.id === movie.imdbID && (
              <p className="text-white-400 text-sm absolute bottom-12 right-4">{favoriteMessage.text}</p>
            )}

          </div>
        ))}

      </div>

      {/* Popular Movies Section */}
      
   </div>
      
    
  );
};

export default App;