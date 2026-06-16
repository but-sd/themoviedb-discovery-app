import { useEffect, useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { type Genre, type MovieItem } from '../../../back-end/api-schemas'
import { fetchMovieGenres, fetchPopularMoviesPages } from '../../services/movies-service'
import { buildMovieStats } from './movie-stats'
import './MovieStatsPage.css'

const STATS_PAGE_COUNT = 3

export default function MovieStatsPage() {
  const [genres, setGenres] = useState<Genre[]>([])
  const [movies, setMovies] = useState<MovieItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMovieStats = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const [movieResults, genreResults] = await Promise.all([
          fetchPopularMoviesPages({
            language: 'fr-FR',
            region: 'FR',
            pages: STATS_PAGE_COUNT,
          }),
          fetchMovieGenres({ language: 'fr-FR' }),
        ])
        setMovies(movieResults)
        setGenres(genreResults)
      } catch (loadError) {
        const message =
          loadError instanceof Error ? loadError.message : 'Impossible de charger les statistiques des films.'
        setError(message)
      } finally {
        setIsLoading(false)
      }
    }

    void loadMovieStats()
  }, [])

  const stats = useMemo(() => buildMovieStats(movies, genres), [genres, movies])
  const chartData = stats.genreBreakdown.slice(0, 8)

  return (
    <main className="movie-page movie-stats-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Statistiques des films</h1>
        <p className="subtitle">
          Répartition par genre et indicateurs calculés sur {STATS_PAGE_COUNT} pages de films
          populaires en France.
        </p>
      </header>

      {error ? <p className="error-banner">{error}</p> : null}

      {isLoading ? (
        <p className="loading-state">Chargement des statistiques films...</p>
      ) : (
        <>
          <section className="stats-kpis" aria-label="Indicateurs films">
            <article className="stats-card">
              <p className="stats-label">Films analysés</p>
              <p className="stats-value">{stats.totalMovies}</p>
            </article>

            <article className="stats-card">
              <p className="stats-label">Genres couverts</p>
              <p className="stats-value">{stats.totalGenres}</p>
            </article>

            <article className="stats-card">
              <p className="stats-label">Note moyenne</p>
              <p className="stats-value">{stats.averageRating}/10</p>
            </article>

            <article className="stats-card">
              <p className="stats-label">Genre dominant</p>
              <p className="stats-value stats-value-compact">
                {stats.topGenre ? `${stats.topGenre.name} (${stats.topGenre.movieCount})` : 'Aucun'}
              </p>
            </article>

            <article className="stats-card">
              <p className="stats-label">Sortie la plus récente</p>
              <p className="stats-value">{stats.latestReleaseYear ?? 'N/A'}</p>
            </article>
          </section>

          <section className="stats-panel" aria-labelledby="genre-chart-title">
            <div className="stats-panel-header">
              <div>
                <h2 id="genre-chart-title">Répartition par genre</h2>
                <p>
                  Les genres ci-dessous représentent le nombre de films appartenant à chaque
                  catégorie.
                </p>
              </div>
            </div>

            {chartData.length > 0 ? (
              <div className="stats-chart-shell">
                <ResponsiveContainer width="100%" height={360}>
                  <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 12, left: 4, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis allowDecimals={false} type="number" />
                    <YAxis dataKey="name" type="category" width={110} />
                    <Tooltip
                      formatter={(value) => [`${String(value)} films`, 'Volume']}
                      labelFormatter={(label) => `Genre: ${label}`}
                    />
                    <Bar dataKey="movieCount" fill="#0f7b8a" radius={[0, 10, 10, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="stats-empty">Aucune donnée de genre disponible.</p>
            )}
          </section>

          <section className="stats-panel" aria-labelledby="genre-table-title">
            <div className="stats-panel-header">
              <div>
                <h2 id="genre-table-title">Synthèse par genre</h2>
                <p>Le pourcentage indique la part des films analysés qui appartiennent au genre.</p>
              </div>
            </div>

            <div className="stats-table-shell">
              <table className="stats-table">
                <thead>
                  <tr>
                    <th scope="col">Genre</th>
                    <th scope="col">Films</th>
                    <th scope="col">% des films</th>
                    <th scope="col">Note moyenne</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.genreBreakdown.map((genre) => (
                    <tr key={genre.genreId}>
                      <th scope="row">{genre.name}</th>
                      <td>{genre.movieCount}</td>
                      <td>{genre.share}%</td>
                      <td>{genre.averageRating}/10</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </main>
  )
}
