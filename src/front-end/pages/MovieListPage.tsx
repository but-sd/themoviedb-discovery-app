import { useEffect, useState } from 'react'
import MovieCard from '../components/MovieCard'
import { fetchPopularMovies, type Movie } from '../services/moviesApi'
import './MovieListPage.css'

/**
 * MovieListPage is the main page component responsible for fetching and displaying a list of popular movies. It manages the state of the movie list, loading status, and any errors that may occur during data fetching. The component also provides a "Load More" button to fetch additional pages of movies from the backend API.
 * @returns JSX.Element
 */
export default function MovieListPage() {
  // State variables to manage movies, loading status, error messages, and pagination
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // useEffect to load the initial page of popular movies when the component mounts
  useEffect(() => {
    const loadInitialPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await fetchPopularMovies({ language: 'fr-FR', region: 'FR', page: 1 })
        setMovies(results)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load popular movies.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialPage()
  }, [])

  // Handler function to load more movies when the "Load More" button is clicked
  const handleLoadMore = async () => {
    const nextPage = page + 1
    setIsLoading(true)
    setError(null)

    try {
      const results = await fetchPopularMovies({
        language: 'fr-FR',
        region: 'FR',
        page: nextPage,
      })
      setMovies((currentMovies) => [...currentMovies, ...results])
      setPage(nextPage)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Could not load more movies.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Popular Movies</h1>
        <p className="subtitle">A curated feed of trending titles in France, fetched via your backend API.</p>
      </header>

      {error && <p className="error-banner">{error}</p>}

      {isLoading && movies.length === 0 ? (
        <p className="loading-state">Loading movies...</p>
      ) : (
        <section className="movie-grid" aria-live="polite">
          {movies.map((movie) => (
            <MovieCard key={`${movie.id}-${movie.release_date ?? 'unknown'}`} movie={movie} />
          ))}
        </section>
      )}

      <div className="actions">
        <button type="button" onClick={handleLoadMore} disabled={isLoading}>
          {isLoading ? 'Loading...' : 'Load More'}
        </button>
      </div>
    </main>
  )
}
