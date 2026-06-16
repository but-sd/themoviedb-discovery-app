import { useEffect, useState } from 'react'
import { type MovieItem } from '../../../back-end/api-schemas'
import MovieItemCard from '../../components/MovieItemCard/MovieItemCard'
import { fetchPopularMovies } from '../../services/movies-service'
import './MovieListPage.css'

/**
 * Lists popular movies fetched from the backend API.
 */
export default function MovieListPage() {
  const [movies, setMovies] = useState<MovieItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadInitialPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await fetchPopularMovies({ language: 'fr-FR', region: 'FR', page: 1 })
        setMovies(results)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Impossible de charger les films populaires.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadInitialPage()
  }, [])

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
        loadError instanceof Error ? loadError.message : 'Impossible de charger plus de films.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Films populaires</h1>
        <p className="subtitle">
          Films tendances en France, d'après les données de <b>The Movie DB</b>.
        </p>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      {isLoading && movies.length === 0 ? (
        <p className="loading-state">Chargement des films...</p>
      ) : (
        <section className="movie-grid" aria-live="polite">
          {movies.map((movie) => (
            <MovieItemCard key={movie.id} movie={movie} />
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
