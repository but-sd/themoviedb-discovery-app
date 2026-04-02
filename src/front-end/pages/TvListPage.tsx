import { useEffect, useState } from 'react'
import MovieCard from '../components/ItemCard/ItemCard'
import { type Movie, type TvShow } from "../Types"
import './MovieListPage.css'
import { fetchPopularTvShows } from '../services/tv-shows-service'

function toMovieCardModel(show: TvShow): Movie {
  return {
    id: show.id,
    title: show.name,
    release_date: show.first_air_date,
    vote_average: show.vote_average,
    poster_path: show.poster_path,
  }
}

export default function TvListPage() {
  const [shows, setShows] = useState<TvShow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)

  useEffect(() => {
    const loadInitialPage = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const results = await fetchPopularTvShows({ language: 'fr-FR', region: 'FR', page: 1 })
        setShows(results)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load popular TV shows.'
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
      const results = await fetchPopularTvShows({
        language: 'fr-FR',
        region: 'FR',
        page: nextPage,
      })
      setShows((currentShows) => [...currentShows, ...results])
      setPage(nextPage)
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'Could not load more TV shows.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Séries populaires</h1>
        <p className="subtitle">Séries tendances en France, d'après les données de <b>The Movie DB</b>.</p>
      </header>

      {error && <p className="error-banner">{error}</p>}

      {isLoading && shows.length === 0 ? (
        <p className="loading-state">Chargement des séries...</p>
      ) : (
        <section className="movie-grid" aria-live="polite">
          {shows.map((show) => (
            <MovieCard
              key={`${show.id}-${show.first_air_date ?? 'unknown'}`}
              movie={toMovieCardModel(show)}
              href={`/tv/${show.id}`}
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
