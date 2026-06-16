import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('./components/NavBar/NavBar', () => ({
  default: () => <nav>Mock NavBar</nav>,
}))

vi.mock('./pages/MovieListPage/MovieListPage', () => ({
  default: () => <div>Mock Movie List Page</div>,
}))

vi.mock('./pages/MovieStatsPage/MovieStatsPage', () => ({
  default: () => <div>Mock Movie Stats Page</div>,
}))

vi.mock('./pages/TopRatedMovieListPage/TopRatedMovieListPage', () => ({
  default: () => <div>Mock Top Rated Movie List Page</div>,
}))

vi.mock('./pages/TvListPage/TvListPage', () => ({
  default: () => <div>Mock TV List Page</div>,
}))

vi.mock('./pages/MovieDetailPage/MovieDetailPage', () => ({
  default: ({ movieId }: { movieId: string }) => <div>Mock Movie Detail Page: {movieId}</div>,
}))

vi.mock('./pages/TvDetailPage/TvDetailPage', () => ({
  default: ({ tvId }: { tvId: string }) => <div>Mock TV Detail Page: {tvId}</div>,
}))

import App from './App'

describe('App', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('redirects from root path to movies list', async () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock Movie List Page')).toBeTruthy()
  })

  it('renders movies list route', async () => {
    render(
      <MemoryRouter initialEntries={['/movies']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock Movie List Page')).toBeTruthy()
  })

  it('renders movie detail route with movie id', async () => {
    render(
      <MemoryRouter initialEntries={['/movies/42']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock Movie Detail Page: 42')).toBeTruthy()
  })

  it('renders movie stats route', async () => {
    render(
      <MemoryRouter initialEntries={['/movies/stats']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock Movie Stats Page')).toBeTruthy()
  })

  it('renders top rated movies list route', async () => {
    render(
      <MemoryRouter initialEntries={['/movies/top-rated']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock Top Rated Movie List Page')).toBeTruthy()
  })

  it('renders tv list route', async () => {
    render(
      <MemoryRouter initialEntries={['/tv']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock TV List Page')).toBeTruthy()
  })

  it('renders tv detail route with tv id', async () => {
    render(
      <MemoryRouter initialEntries={['/tv/7']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Mock TV Detail Page: 7')).toBeTruthy()
  })

  it('renders not found page for unknown route', async () => {
    render(
      <MemoryRouter initialEntries={['/not-found']}>
        <App />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Page introuvable' })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Retour vers les films' }).getAttribute('href')).toBe(
      '/movies',
    )
  })
})
