import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TvShowDetailCard from '../../components/TvShowDetailCard/TvShowDetailCard'
import { type TvShowDetails } from '../../../back-end/api-schemas'
import { fetchTvDetails } from '../../services/tv-shows-service'
import './TvDetailPage.css'

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
          loadError instanceof Error ? loadError.message : 'Impossible de charger les détails de la série.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadShow()
  }, [tvId])

  return (
    <main className="tv-show-detail-page">
      <div className="tv-show-detail-shell">
        <Link className="back-link" to="/tv">
          ← Retour vers les séries populaires
        </Link>

        {isLoading ? <p className="detail-status">Chargement des détails de la série...</p> : null}

        {error ? <p className="detail-status detail-error">{error}</p> : null}

        {show ? <TvShowDetailCard show={show} /> : null}
      </div>
    </main>
  )
}
