import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type MovieItem } from '../../../back-end/api-schemas'
import MovieListPage from './MovieListPage'
import { fetchPopularMovies } from '../../services/movies-service'

vi.mock('../../services/movies-service', () => ({
  fetchPopularMovies: vi.fn(),
}))

function createMovieItem(overrides: Partial<MovieItem> = {}): MovieItem {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [12],
    id: 1,
    original_language: 'en',
    original_title: 'Avatar',
    overview: 'Sci-fi adventure',
    popularity: 100,
    poster_path: '/avatar.jpg',
    release_date: '2009-12-18',
    title: 'Avatar',
    video: false,
    vote_average: 7.8,
    vote_count: 1000,
    ...overrides,
  }
}

describe('MovieListPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and renders popular movies', async () => {
    vi.mocked(fetchPopularMovies).mockResolvedValue([createMovieItem()])

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des films...')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Avatar' })).toBeTruthy()
    expect(fetchPopularMovies).toHaveBeenCalledWith({ language: 'fr-FR', region: 'FR', page: 1 })
  })

  it('loads more movies when clicking the button', async () => {
    vi.mocked(fetchPopularMovies)
      .mockResolvedValueOnce([createMovieItem({ id: 1, title: 'Avatar', release_date: '2009-12-18' })])
      .mockResolvedValueOnce([createMovieItem({ id: 2, title: 'Titanic', release_date: '1997-12-19' })])

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Avatar' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByRole('heading', { name: 'Titanic' })).toBeTruthy()
    expect(fetchPopularMovies).toHaveBeenNthCalledWith(1, {
      language: 'fr-FR',
      region: 'FR',
      page: 1,
    })
    expect(fetchPopularMovies).toHaveBeenNthCalledWith(2, {
      language: 'fr-FR',
      region: 'FR',
      page: 2,
    })
  })

  it('renders an error message when initial loading fails', async () => {
    vi.mocked(fetchPopularMovies).mockRejectedValue(new Error('Initial load failed'))

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Initial load failed')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Avatar' })).toBeNull()
  })

  it('renders fallback error message for non-error initial failures', async () => {
    vi.mocked(fetchPopularMovies).mockRejectedValue('unexpected failure')

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Could not load popular movies.')).toBeTruthy()
  })

  it('renders an error message when loading more fails', async () => {
    vi.mocked(fetchPopularMovies)
      .mockResolvedValueOnce([createMovieItem({ id: 1, title: 'Avatar' })])
      .mockRejectedValueOnce(new Error('Load more failed'))

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Avatar' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByText('Load more failed')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Avatar' })).toBeTruthy()
  })

  it('renders fallback error message when loading more fails with a non-error value', async () => {
    vi.mocked(fetchPopularMovies)
      .mockResolvedValueOnce([createMovieItem({ id: 1, title: 'Avatar' })])
      .mockRejectedValueOnce('unexpected load more failure')

    render(
      <MemoryRouter>
        <MovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Avatar' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByText('Could not load more movies.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Avatar' })).toBeTruthy()
  })
})
