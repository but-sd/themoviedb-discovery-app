import { Link, NavLink } from 'react-router-dom'
import './Nav.css'

export default function Nav() {
  return (
    <nav className="app-nav" aria-label="Primary">
      <Link className="app-nav-brand" to="/movies">
        <span className="app-nav-brand-mark" aria-hidden="true">
          TMDB
        </span>
        <span className="app-nav-brand-copy">
          <strong>The Movie DB Discovery</strong>
          <span>Browse trending picks in France</span>
        </span>
      </Link>

      <div className="app-nav-links">
        <NavLink
          className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
          to="/movies"
        >
          Movies
        </NavLink>
        <NavLink
          className={({ isActive }) => `app-nav-link${isActive ? ' is-active' : ''}`}
          to="/tv"
        >
          TV Shows
        </NavLink>
      </div>
    </nav>
  )
}
