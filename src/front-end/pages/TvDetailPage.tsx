import { useEffect, useState } from 'react'
import Nav from '../components/Nav'
import { fetchTvDetails, type TvDetails } from '../services/moviesApi'
import './MovieDetailPage.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780'

type TvDetailPageProps = Readonly<{
  tvId: string
}>

function formatEpisodeRuntime(runtimes?: number[]): string {
  const runtime = runtimes?.[0]

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

export default function TvDetailPage({ tvId }: TvDetailPageProps) {
  const [show, setShow] = useState<TvDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadShow = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchTvDetails(tvId, { language: 'fr-FR' })
        setShow(result)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Could not load TV show details.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadShow()
  }, [tvId])

  const heroImage = show?.backdrop_path ?? show?.poster_path
  const releaseYear = show?.first_air_date?.slice(0, 4) ?? 'N/A'

  return (
    <main className="movie-detail-page">
      <div className="movie-detail-shell">
        <Nav currentSection="tv" />

        <a className="back-link" href="/tv">
          ← Back to popular TV shows
        </a>

        {isLoading ? <p className="detail-status">Loading TV show details...</p> : null}

        {error ? <p className="detail-status detail-error">{error}</p> : null}

        {show ? (
          <article className="movie-detail-card">
            {heroImage ? (
              <img
                className="movie-detail-hero"
                src={`${IMAGE_BASE_URL}${heroImage}`}
                alt={`Artwork for ${show.name}`}
              />
            ) : (
              <div className="movie-detail-hero movie-detail-hero-placeholder" aria-hidden="true" />
            )}

            <div className="movie-detail-copy">
              <p className="movie-detail-kicker">TV detail</p>
              <h1>{show.name}</h1>
              {show.tagline ? <p className="movie-detail-tagline">{show.tagline}</p> : null}

              <div className="movie-detail-meta">
                <span>{releaseYear}</span>
                <span>{formatEpisodeRuntime(show.episode_run_time)}</span>
                <span>Rating {show.vote_average.toFixed(1)}</span>
              </div>

              {show.genres && show.genres.length > 0 ? (
                <ul className="movie-detail-genres">
                  {show.genres.map((genre) => (
                    <li key={genre.id}>{genre.name}</li>
                  ))}
                </ul>
              ) : null}

              <section className="movie-detail-section">
                <h2>Overview</h2>
                <p>{show.overview || 'No synopsis is available for this show yet.'}</p>
              </section>

              {show.original_name && show.original_name !== show.name ? (
                <section className="movie-detail-section">
                  <h2>Original name</h2>
                  <p>{show.original_name}</p>
                </section>
              ) : null}
            </div>
          </article>
        ) : null}
      </div>
    </main>
  )
}
