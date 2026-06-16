import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import MovieDetailCard from '../../components/MovieDetailCard/MovieDetailCard'
import { type MovieDetails } from '../../../back-end/api-schemas'
import { fetchMovieDetails } from '../../services/movies-service'
import './MovieDetailPage.css'

type MovieDetailPageProps = Readonly<{
  movieId: string
}>

export default function MovieDetailPage({ movieId }: MovieDetailPageProps) {
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMovie = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const result = await fetchMovieDetails(movieId, { language: 'fr-FR' })
        setMovie(result)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Impossible de charger les détails du film.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadMovie()
  }, [movieId])

  return (
    <main className="movie-detail-page">
      <div className="movie-detail-shell">
        <Link className="back-link" to="/movies">
          ← Retour vers les films populaires
        </Link>

        {isLoading ? (
          <p className="detail-status">Chargement des détails du film...</p>
        ) : null}

        {error ? <p className="detail-status detail-error">{error}</p> : null}

        {movie ? <MovieDetailCard movie={movie} /> : null}
      </div>
    </main>
  )
}
