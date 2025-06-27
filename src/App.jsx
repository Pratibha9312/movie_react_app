import React, { useState, useEffect } from 'react'
import { useDebounce } from 'react-use';
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import { getTrendingMovies, updateSearchCount } from './appwrite';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${API_KEY}`
  }
}

const App = () => {
  const [searchTerm, setsearchTerm] = useState('');
  const [errorMessage, seterrorMessage] = useState('');
  const [movieList, setmovieList] = useState([]);
  const [trendingMovies, settrendingMovies] = useState([]);
  const [isLoading, setisLoading] = useState(false);
  const [debounceSearchTerm, setdebounceSearchTerm] = useState('');

  //Debounce the search i.e gives a little time to input the movie name to avoid api requests on single inputs
  useDebounce(() => setdebounceSearchTerm(searchTerm), 700, [searchTerm])

  const fetchMovies = async (query = '') => {
    setisLoading(true);
    seterrorMessage('');
    try {
      const endpoint = query 
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;
      const response = await fetch(endpoint, API_OPTIONS);
      if(!response.ok){

      }
      const data = await response.json();
      if(data.Response == 'False'){
        seterrorMessage(data.Error||'Failed to fetch movies');
        setmovieList([]);
        return;
      }
      setmovieList(data.results ||[]);
      
      if(query && data.results.length > 0){
        updateSearchCount(query, data.results[0]);
      }
      // console.log(data.results);
    } catch(error) {
      console.error(error);
      seterrorMessage('Error fetching movies. Try again later.');
    } finally{
      setisLoading(false);
    }
  }

  const fetchTrendingMovies = async () => {
    try {
      const movies = await getTrendingMovies();
      settrendingMovies(movies);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    fetchMovies(debounceSearchTerm);
  }, [debounceSearchTerm]);

  useEffect(() => {
    fetchTrendingMovies();
  }, []);

  return (
    <main>
      <div className="pattern" />
      <div>
        <header>
          <img src="./hero-img.png" alt="No-banner"></img>
          <h1 className='relative z-10'>Find <span className='text-gradient '>Movies</span> you'll Enjoy.</h1>
          <Search searchTerm={searchTerm} setsearchTerm={setsearchTerm}/>
        </header>

        {trendingMovies.length > 0 && (
          <section className='trending'>
            <h2 className='flex items-center justify-center mt-[40]'>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => (
                <li key={movie.$id}>
                  <p className='mr-4'>{index + 1}</p>
                  <img src={movie.poster_url} alt={movie.title}/>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className='all-movies '>
          <h2 className='flex items-center justify-center'>All movies</h2>
          
            { isLoading ? (
              <Spinner />
              ) : errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ) : (
                <ul>
                  {movieList.map((movie) => (
                    <MovieCard key={movie.id} movie={movie}/>
                  ))}
                </ul>
              )
            }
          
        </section>

      </div>
    </main>
  )
}

export default App