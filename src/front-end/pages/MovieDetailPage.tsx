import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { fetchMovieDetails, type MovieDetails } from '../services/moviesApi'
import './MovieDetailPage.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780'

function formatRuntime(runtime?: number): string {
  if (!runtime) {
    return 'Runtime unavailable'
  }

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

export default function MovieDetailPage() {
  const { movieId } = useParams<{ movieId: string }>()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!movieId) {
      setMovie(null)
      setError('Movie ID is missing.')
      setIsLoading(false)
      return
    }

    const loadMovie = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchMovieDetails(movieId, { language: 'fr-FR' })
        setMovie(result)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load movie details.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadMovie()
  }, [movieId])

  const heroImage = movie?.backdrop_path ?? movie?.poster_path
  const releaseYear = movie?.release_date?.slice(0, 4) ?? 'N/A'

  return (
    <>
      <Link className="back-link" to="/movies">
        ← Back to popular movies
      </Link>

      {isLoading ? (
        <p className="detail-status">Loading movie details...</p>
      ) : null}

      {error ? <p className="detail-status detail-error">{error}</p> : null}

      {movie ? (
        <article className="movie-detail-card">
          {heroImage ? (
            <img
              className="movie-detail-hero"
              src={`${IMAGE_BASE_URL}${heroImage}`}
              alt={`Artwork for ${movie.title}`}
            />
          ) : (
            <div className="movie-detail-hero movie-detail-hero-placeholder" aria-hidden="true" />
          )}

          <div className="movie-detail-copy">
            <p className="movie-detail-kicker">Movie detail</p>
            <h1>{movie.title}</h1>
            {movie.tagline ? <p className="movie-detail-tagline">{movie.tagline}</p> : null}

            <div className="movie-detail-meta">
              <span>{releaseYear}</span>
              <span>{formatRuntime(movie.runtime)}</span>
              <span>Rating {movie.vote_average.toFixed(1)}</span>
            </div>

            {movie.genres && movie.genres.length > 0 ? (
              <ul className="movie-detail-genres">
                {movie.genres.map((genre) => (
                  <li key={genre.id}>{genre.name}</li>
                ))}
              </ul>
            ) : null}

            <section className="movie-detail-section">
              <h2>Overview</h2>
              <p>{movie.overview || 'No synopsis is available for this title yet.'}</p>
            </section>

            {movie.original_title && movie.original_title !== movie.title ? (
              <section className="movie-detail-section">
                <h2>Original title</h2>
                <p>{movie.original_title}</p>
              </section>
            ) : null}
          </div>
        </article>
      ) : null}
    </>
  )
}
