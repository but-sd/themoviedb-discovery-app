import { Outlet, useMatch } from 'react-router-dom'
import Nav from './Nav'

export default function AppLayout() {
  const isMovieDetail = useMatch('/movies/:movieId')
  const isTvDetail = useMatch('/tv/:tvId')
  const isDetailPage = Boolean(isMovieDetail || isTvDetail)

  if (isDetailPage) {
    return (
      <main className="movie-detail-page">
        <div className="movie-detail-shell">
          <Nav />
          <Outlet />
        </div>
      </main>
    )
  }

  return (
    <main className="movie-page">
      <Nav />
      <Outlet />
    </main>
  )
}
