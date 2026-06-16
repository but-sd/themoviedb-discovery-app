import { useRef, useState, type SyntheticEvent } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import './NavBar.css'

export default function NavBar() {
  const { pathname } = useLocation()
  const moviesMenuRef = useRef<HTMLDetailsElement>(null)
  const isMoviesRoute = pathname.startsWith('/movies')
  const [hasClosedMoviesMenu, setHasClosedMoviesMenu] = useState(false)
  const isMoviesMenuOpen = isMoviesRoute && !hasClosedMoviesMenu

  const handleMoviesMenuToggle = (event: SyntheticEvent<HTMLDetailsElement>) => {
    const nextOpen = event.currentTarget.open
    setHasClosedMoviesMenu(!nextOpen)
  }

  const closeMoviesMenu = () => {
    // Keep DOM state and React state aligned when navigating from submenu links.
    moviesMenuRef.current?.removeAttribute('open')
    setHasClosedMoviesMenu(true)
  }

  const resetMoviesMenuState = () => {
    setHasClosedMoviesMenu(false)
  }

  return (
    <nav className="app-nav" aria-label="Main navigation">
      <div className="app-nav-shell">
        <p className="app-nav-brand">TMDB Discovery</p>

        <div className="app-nav-links">
          <details
            ref={moviesMenuRef}
            className="app-nav-menu"
            open={isMoviesMenuOpen}
            onToggle={handleMoviesMenuToggle}
          >
            <summary
              className={`app-nav-link app-nav-menu-trigger${
                isMoviesMenuOpen ? ' app-nav-link-active' : ''
              }`}
            >
              Movies
            </summary>

            <div className="app-nav-submenu" aria-label="Movies submenu">
              <NavLink
                end
                className={({ isActive }) =>
                  `app-nav-link app-nav-submenu-link${isActive ? ' app-nav-link-active' : ''}`
                }
                onClick={closeMoviesMenu}
                to="/movies"
              >
                Popular
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `app-nav-link app-nav-submenu-link${isActive ? ' app-nav-link-active' : ''}`
                }
                onClick={closeMoviesMenu}
                to="/movies/stats"
              >
                Stats Films
              </NavLink>

              <NavLink
                className={({ isActive }) =>
                  `app-nav-link app-nav-submenu-link${isActive ? ' app-nav-link-active' : ''}`
                }
                onClick={closeMoviesMenu}
                to="/movies/top-rated"
              >
                Top Rated
              </NavLink>
            </div>
          </details>

          <NavLink
            className={({ isActive }) =>
              `app-nav-link${isActive ? ' app-nav-link-active' : ''}`
            }
            onClick={resetMoviesMenuState}
            to="/tv"
          >
            TV Shows
          </NavLink>

          <a className="app-nav-link" href="/api/docs" onClick={resetMoviesMenuState}>
            API Docs
          </a>
        </div>
      </div>
    </nav>
  )
}
