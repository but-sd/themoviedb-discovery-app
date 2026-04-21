import { type MovieDetails } from "../../Types"
import { DETAIL_IMAGE_BASE_URL, formatRuntime } from "../commons"
import './MovieDetailCard.css'

// Props for the MovieDetailCard component, which includes a MovieDetails object containing all the necessary information to display the movie details.
type MovieDetailCardProps = Readonly<{
  movie: MovieDetails
}>

/**
 * MovieDetailCard component displays detailed information about a movie, including a hero image, title, tagline, release year, runtime, rating, genres, synopsis, and original title if different from the main title. It handles missing data gracefully by showing placeholders and fallback text where necessary.
 * @param param0 Props for the MovieDetailCard component, which includes a MovieDetails object. 
 * @returns JSX.Element representing the movie detail card.
 */
export default function MovieDetailCard({ movie }: MovieDetailCardProps) {
  const heroImage = movie.backdrop_path ?? movie.poster_path
  const releaseYear = movie.release_date?.slice(0, 4) ?? 'N/A'

  return (
    <article className="movie-detail-card">
      {heroImage ? (
        <img
          className="movie-detail-hero"
          src={`${DETAIL_IMAGE_BASE_URL}${heroImage}`}
          alt={`Artwork for ${movie.title}`}
        />
      ) : (
        <div className="movie-detail-hero movie-detail-hero-placeholder" aria-hidden="true" />
      )}

      <div className="movie-detail-copy">
        <p className="movie-detail-kicker">Détails du film</p>
        <h1>{movie.title}</h1>
        {movie.tagline ? <h2 className="movie-detail-tagline">{movie.tagline}</h2> : null}

        <div className="movie-detail-meta">
          <span>{releaseYear}</span>
          <span>{formatRuntime(movie.runtime)}</span>
          <span>Note {movie.vote_average.toFixed(1)}</span>
        </div>

        {movie.genres && movie.genres.length > 0 ? (
          <ul className="movie-detail-genres">
            {movie.genres.map((genre) => (
              <li key={genre.id}>{genre.name}</li>
            ))}
          </ul>
        ) : null}

        <section className="movie-detail-section">
          <h2>Synopsis</h2>
          <p>{movie.overview || "Aucun synopsis n'est disponible pour ce titre pour le moment."}</p>
        </section>

        {movie.original_title && movie.original_title !== movie.title ? (
          <section className="movie-detail-section">
            <h2>Titre original</h2>
            <p>{movie.original_title}</p>
          </section>
        ) : null}
      </div>
    </article>
  )
}
