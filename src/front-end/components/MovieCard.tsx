import { type Movie } from '../services/moviesApi'
import './MovieCard.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'

type MovieCardProps = Readonly<{
  movie: Movie
}>

export default function MovieCard({ movie }: MovieCardProps) {
  const releaseYear = movie.release_date?.slice(0, 4) ?? 'N/A'
  const posterSrc = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null

  return (
    <article className="movie-card">
      {posterSrc ? (
        <img src={posterSrc} alt={`Poster for ${movie.title}`} className="movie-poster" />
      ) : (
        <div className="movie-poster movie-poster-placeholder" aria-hidden="true" />
      )}

      <div className="movie-copy">
        <h2>{movie.title}</h2>
        <p className="movie-meta">{releaseYear} · Rating {movie.vote_average.toFixed(1)}</p>
      </div>
    </article>
  )
}
