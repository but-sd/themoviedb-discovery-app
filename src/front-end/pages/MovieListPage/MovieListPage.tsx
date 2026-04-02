import { useEffect, useState } from 'react'
import MovieCard from '../../components/ItemCard/ItemCard'
import { fetchPopularMovies } from "../../services/movies-service"
import { type Movie } from "../../Types"
import './MovieListPage.css'

/**
 * Lists popular movies fetched from the backend API. 
 */
export default function MovieListPage() {
  // State for movies, loading status, error message, and current page for pagination
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  // Load the initial page of popular movies when the component mounts
  useEffect(() => {
    // Define an async function to load the initial page of movies
    const loadInitialPage = async () => {
      // Change loading state and clear any previous errors
      setIsLoading(true)
      setError(null)

      try {
        // Fetch the first page of popular movies from the backend API
        const results = await fetchPopularMovies({ language: 'fr-FR', region: 'FR', page: 1 })

        // Update the movies state with the fetched results
        setMovies(results)
      } catch (loadError) {
        // Handle any errors that occur during the fetch
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load popular movies.'
        setError(message)
      } finally {
        // Reset the loading state
        setIsLoading(false)
      }
    }

    // Call the function to load the initial page of movies
    loadInitialPage()
  }, [])

  // Handler for loading more movies when the user clicks the "Load More" button
  const handleLoadMore = async () => {
    // Calculate the next page number to load
    const nextPage = page + 1

    // Change loading state and clear any previous errors
    setIsLoading(true)
    setError(null)

    try {
      // Fetch the next page of popular movies from the backend API
      const results = await fetchPopularMovies({
        language: 'fr-FR',
        region: 'FR',
        page: nextPage,
      })
      // Append the new results to the existing movies state
      setMovies((currentMovies) => [...currentMovies, ...results])

      // Update the current page state to the next page
      setPage(nextPage)
    } catch (loadError) {
      // Handle any errors that occur during the fetch
      const message =
        loadError instanceof Error ? loadError.message : 'Could not load more movies.'
      setError(message)
    } finally {
      // Reset the loading state
      setIsLoading(false)
    }
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Films populaires</h1>
        <p className="subtitle">Films tendances en France, d'après les données de <b>The Movie DB</b>.</p>
      </header>

      {error && <p className="error-banner">{error}</p>}

      {isLoading && movies.length === 0 ? (
        <p className="loading-state">Chargement des films...</p>
      ) : (
        <section className="movie-grid" aria-live="polite">
          {movies.map((movie) => (
            <MovieCard
              key={`${movie.id}-${movie.release_date ?? 'unknown'}`}
              movie={movie}
              href={`/movies/${movie.id}`}
            />
          ))}
        </section>
      )}

      <div className="actions">
        <button type="button" onClick={handleLoadMore} disabled={isLoading}>
          {isLoading ? 'Chargement...' : 'Charger plus'}
        </button>
      </div>
    </main>
  )
}
