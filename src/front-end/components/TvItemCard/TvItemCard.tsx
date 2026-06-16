import { Link } from 'react-router-dom'
import { type TvItem } from '../../../back-end/api-schemas'
import '../shared/MediaCard.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'

type TvItemCardProps = Readonly<{
  show: TvItem
}>

export default function TvItemCard({ show }: TvItemCardProps) {
  const firstAirYear = show.first_air_date.slice(0, 4)
  const posterSrc = show.poster_path ? `${IMAGE_BASE_URL}${show.poster_path}` : null

  return (
    <Link className="item-card-link" to={`/tv/${show.id}`} aria-label={`Ouvrir les détails de ${show.name}`}>
      <article className="item-card">
        {posterSrc ? (
          <img src={posterSrc} alt={`Affiche de ${show.name}`} className="movie-poster" />
        ) : (
          <div className="movie-poster movie-poster-placeholder" aria-hidden="true" />
        )}

        <div className="movie-copy">
          <h2>{show.name}</h2>
          <p className="movie-meta">{firstAirYear} · Note {show.vote_average.toFixed(1)}</p>
        </div>
      </article>
    </Link>
  )
}
