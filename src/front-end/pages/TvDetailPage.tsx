import { useEffect, useState } from 'react'
import TvShowDetailCard from '../components/TvShowDetailCard'
import { type TvShowDetails } from '../Types'
import { fetchTvDetails } from '../services/moviesApi'
import './MovieDetailPage.css'

type TvDetailPageProps = Readonly<{
  tvId: string
}>

export default function TvDetailPage({ tvId }: TvDetailPageProps) {
  const [show, setShow] = useState<TvShowDetails | null>(null)
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

  return (
    <main className="movie-detail-page">
      <div className="movie-detail-shell">
        <a className="back-link" href="/tv">
          ← Back to popular TV shows
        </a>

        {isLoading ? <p className="detail-status">Loading TV show details...</p> : null}

        {error ? <p className="detail-status detail-error">{error}</p> : null}

        {show ? <TvShowDetailCard show={show} /> : null}
      </div>
    </main>
  )
}
