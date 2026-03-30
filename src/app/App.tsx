import { useEffect, useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import './App.css'
import { fetchPopularMovies, type Movie } from './services/moviesApi'

function App() {
  const [count, setCount] = useState(0)
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [isLoadingMovies, setIsLoadingMovies] = useState(false)
  const [moviesError, setMoviesError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    const loadMovies = async () => {
      setIsLoadingMovies(true)
      setMoviesError(null)

      try {
        const movies = await fetchPopularMovies({
          language: 'fr-FR',
          region: 'FR',
          page: 1,
        })

        if (!controller.signal.aborted) {
          setPopularMovies(movies.slice(0, 8))
        }
      } catch (error) {
        if (controller.signal.aborted) {
          return
        }

        const message =
          error instanceof Error ? error.message : 'Failed to fetch popular movies'
        setMoviesError(message)
      } finally {
        if (!controller.signal.aborted) {
          setIsLoadingMovies(false)
        }
      }
    }

    loadMovies()

    return () => {
      controller.abort()
    }
  }, [])

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1>Movie Discovery</h1>
          <p>Popular movies are loaded via your backend service API.</p>

          {isLoadingMovies && <p>Loading popular movies...</p>}
          {moviesError && <p>Could not load movies: {moviesError}</p>}

          {!isLoadingMovies && !moviesError && popularMovies.length > 0 && (
            <>
              <h2>Popular Movies (France)</h2>
              <ul>
                {popularMovies.map((movie) => (
                  <li key={movie.id}>
                    {movie.title} ({movie.release_date?.slice(0, 4) ?? 'N/A'}) -{' '}
                    {movie.vote_average.toFixed(1)}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
        <button
          className="counter"
          onClick={() => setCount((currentCount) => currentCount + 1)}
        >
          Count is {count}
        </button>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="docs">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#documentation-icon"></use>
          </svg>
          <h2>Documentation</h2>
          <p>Your questions, answered</p>
          <ul>
            <li>
              <a href="https://vite.dev/" target="_blank">
                <img className="logo" src={viteLogo} alt="" />
                Explore Vite
              </a>
            </li>
            <li>
              <a href="https://react.dev/" target="_blank">
                <img className="button-icon" src={reactLogo} alt="" />
                Learn more
              </a>
            </li>
          </ul>
        </div>
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg
                  className="button-icon"
                  role="presentation"
                  aria-hidden="true"
                >
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

export default App
