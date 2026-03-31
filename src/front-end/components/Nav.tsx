import './Nav.css'

type NavProps = Readonly<{
  currentSection?: 'movies' | 'tv'
}>

export default function Nav({ currentSection }: NavProps) {
  return (
    <nav className="app-nav" aria-label="Primary">
      <a className="app-nav-brand" href="/">
        <span className="app-nav-brand-mark" aria-hidden="true">
          TMDB
        </span>
        <span className="app-nav-brand-copy">
          <strong>The Movie DB Discovery</strong>
          <span>Browse trending picks in France</span>
        </span>
      </a>

      <div className="app-nav-links">
        <a
          className={`app-nav-link ${currentSection === 'movies' ? 'is-active' : ''}`}
          href="/movies"
          aria-current={currentSection === 'movies' ? 'page' : undefined}
        >
          Movies
        </a>
        <a
          className={`app-nav-link ${currentSection === 'tv' ? 'is-active' : ''}`}
          href="/tv"
          aria-current={currentSection === 'tv' ? 'page' : undefined}
        >
          TV Shows
        </a>
      </div>
    </nav>
  )
}
