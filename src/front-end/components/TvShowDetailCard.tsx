import { type TvShowDetails } from '../Types'
import './TvShowDetailCard.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780'

type TvShowDetailCardProps = Readonly<{
  show: TvShowDetails
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

export default function TvShowDetailCard({ show }: TvShowDetailCardProps) {
  const heroImage = show.backdrop_path ?? show.poster_path
  const releaseYear = show.first_air_date?.slice(0, 4) ?? 'N/A'

  return (
    <article className="tv-detail-card">
      {heroImage ? (
        <img
          className="tv-detail-hero"
          src={`${IMAGE_BASE_URL}${heroImage}`}
          alt={`Artwork for ${show.name}`}
        />
      ) : (
        <div className="tv-detail-hero tv-detail-hero-placeholder" aria-hidden="true" />
      )}

      <div className="tv-detail-copy">
        <p className="tv-detail-kicker">TV detail</p>
        <h1>{show.name}</h1>
        {show.tagline ? <h2 className="tv-detail-tagline">{show.tagline}</h2> : null}

        <div className="tv-detail-meta">
          <span>{releaseYear}</span>
          <span>{formatEpisodeRuntime(show.episode_run_time)}</span>
          <span>Rating {show.vote_average.toFixed(1)}</span>
        </div>

        {show.genres && show.genres.length > 0 ? (
          <ul className="tv-detail-genres">
            {show.genres.map((genre) => (
              <li key={genre.id}>{genre.name}</li>
            ))}
          </ul>
        ) : null}

        <section className="tv-detail-section">
          <h2>Overview</h2>
          <p>{show.overview || 'No synopsis is available for this show yet.'}</p>
        </section>

        {show.original_name && show.original_name !== show.name ? (
          <section className="tv-detail-section">
            <h2>Original name</h2>
            <p>{show.original_name}</p>
          </section>
        ) : null}
      </div>
    </article>
  )
}
