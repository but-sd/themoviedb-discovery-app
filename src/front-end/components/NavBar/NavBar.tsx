import { NavLink } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="app-nav-shell">
        <p className="app-nav-brand">TMDB Discovery</p>

        <div className="app-nav-links">
          <NavLink
            end
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
            }
            to="/movies"
          >
            Movies
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
            }
            to="/movies/stats"
          >
            Stats Films
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
            }
            to="/movies/top-rated"
          >
            Top Rated
          </NavLink>

          <NavLink
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
            }
            to="/tv"
          >
            TV Shows
          </NavLink>

          <a className="app-nav-link" href="/api/docs">
            API Docs
          </a>
        </div>
      </div>
    </nav>
  )
}
