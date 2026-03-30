import MovieDetailPage from './pages/MovieDetailPage'
import MovieListPage from './pages/MovieListPage'
import TvListPage from './pages/TvListPage'

function normalizePathname(pathname: string): string {
  const trimmedPath = pathname.replace(/\/+$/, '')
  return trimmedPath === '' ? '/' : trimmedPath
}

export default function App() {
  const pathname = normalizePathname(globalThis.location.pathname)
  const movieDetailMatch = /^\/movies\/(\d+)$/.exec(pathname)

  if (movieDetailMatch) {
    return <MovieDetailPage movieId={movieDetailMatch[1]} />
  }

  if (pathname == '/' || pathname == '/movies') {
    return <MovieListPage />
  }

  if (pathname == '/tv') {
    return <TvListPage />
  }

  return (
    <main className="movie-page">
      <header className="movie-page-header">
        <p className="eyebrow">The Movie DB Discovery</p>
        <h1>Page Not Found</h1>
        <p className="subtitle">The requested movie or TV page does not exist.</p>
      </header>

      <div className="actions">
        <a href="/">Return to the movies</a>
      </div>
    </main>
  )
}
