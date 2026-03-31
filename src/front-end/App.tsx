import { Link, Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import MovieDetailPage from './pages/MovieDetailPage'
import MovieListPage from './pages/MovieListPage'
import TvDetailPage from './pages/TvDetailPage'
import TvListPage from './pages/TvListPage'

function NotFoundPage() {
  return (
    <>
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Page Not Found</h1>
        <p className="subtitle">The requested movie or TV page does not exist.</p>
      </header>

      <div className="actions">
        <Link to="/movies">Return to the movies</Link>
      </div>
    </>
  )
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/movies" replace />} />
        <Route path="movies" element={<MovieListPage />} />
        <Route path="movies/:movieId" element={<MovieDetailPage />} />
        <Route path="tv" element={<TvListPage />} />
        <Route path="tv/:tvId" element={<TvDetailPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
