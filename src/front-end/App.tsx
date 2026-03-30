import MovieDetailPage from './pages/MovieDetailPage'
import MovieListPage from './pages/MovieListPage'

function normalizePathname(pathname: string): string {
  const trimmedPath = pathname.replace(/\/+$/, '')
  return trimmedPath === '' ? '/' : trimmedPath
}

export default function App() {
  const pathname = normalizePathname(window.location.pathname)
  const movieDetailMatch = pathname.match(/^\/movies\/(\d+)$/)

  if (movieDetailMatch) {
    return <MovieDetailPage movieId={movieDetailMatch[1]} />
  }

  if (pathname === '/' || pathname === '/movies') {
    return <MovieListPage />
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Page Not Found</h1>
        <p className="subtitle">The requested movie page does not exist.</p>
      </header>

      <div className="actions">
        <a href="/">Return to the list</a>
      </div>
    </main>
  )
}
