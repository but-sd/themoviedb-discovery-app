import { Link, Navigate, Route, Routes, useParams } from 'react-router-dom'
import NavBar from './components/NavBar/NavBar'
import MovieDetailPage from './pages/MovieDetailPage/MovieDetailPage'
import MovieListPage from './pages/MovieListPage/MovieListPage'
import TvDetailPage from './pages/TvDetailPage'
import TvListPage from './pages/TvListPage'

function MovieDetailRoute() {
  const { movieId } = useParams<{ movieId: string }>()

  if (!movieId) {
    return <Navigate to="/movies" replace />
  }

  return <MovieDetailPage movieId={movieId} />
}

function TvDetailRoute() {
  const { tvId } = useParams<{ tvId: string }>()

  if (!tvId) {
    return <Navigate to="/tv" replace />
  }

  return <TvDetailPage tvId={tvId} />
}

function NotFoundPage() {
  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Page Not Found</h1>
        <p className="subtitle">The requested movie or TV page does not exist.</p>
      </header>

      <div className="actions">
        <Link to="/movies">Return to the movies</Link>
      </div>
    </main>
  )
}

export default function App() {
  return (
    <>
      <NavBar />

      <Routes>
        <Route path="/" element={<Navigate to="/movies" replace />} />
        <Route path="/movies" element={<MovieListPage />} />
        <Route path="/movies/:movieId" element={<MovieDetailRoute />} />
        <Route path="/tv" element={<TvListPage />} />
        <Route path="/tv/:tvId" element={<TvDetailRoute />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  )
}
