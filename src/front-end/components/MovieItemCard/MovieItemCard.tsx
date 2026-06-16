import { Link } from 'react-router-dom'
import { type MovieItem } from '../../../back-end/api-schemas'
import '../shared/MediaCard.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'

type MovieItemCardProps = Readonly<{
  movie: MovieItem
}>

export default function MovieItemCard({ movie }: MovieItemCardProps) {
  const releaseYear = movie.release_date.slice(0, 4)
  const posterSrc = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null

  return (
    <Link
      className="item-card-link"
      to={`/movies/${movie.id}`}
      aria-label={`Ouvrir les détails de ${movie.title}`}
    >
      <article className="item-card">
        {posterSrc ? (
          <img src={posterSrc} alt={`Affiche de ${movie.title}`} className="movie-poster" />
        ) : (
          <div className="movie-poster movie-poster-placeholder" aria-hidden="true" />
        )}

        <div className="movie-copy">
          <h2>{movie.title}</h2>
          <p className="movie-meta">{releaseYear} · Note {movie.vote_average.toFixed(1)}</p>
        </div>
      </article>
    </Link>
  )
}
