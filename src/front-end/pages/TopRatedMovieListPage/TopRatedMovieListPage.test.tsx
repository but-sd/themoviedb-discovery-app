import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type MovieItem } from '../../../back-end/api-schemas'
import TopRatedMovieListPage from './TopRatedMovieListPage'
import { fetchTopRatedMovies } from '../../services/movies-service'

vi.mock('../../services/movies-service', () => ({
  fetchTopRatedMovies: vi.fn(),
}))

function createMovieItem(overrides: Partial<MovieItem> = {}): MovieItem {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [12],
    id: 1,
    original_language: 'en',
    original_title: 'The Godfather',
    overview: 'Crime drama',
    popularity: 100,
    poster_path: '/godfather.jpg',
    release_date: '1972-03-24',
    title: 'The Godfather',
    video: false,
    vote_average: 9.2,
    vote_count: 1000,
    ...overrides,
  }
}

describe('TopRatedMovieListPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and renders top rated movies', async () => {
    vi.mocked(fetchTopRatedMovies).mockResolvedValue([createMovieItem()])

    render(
      <MemoryRouter>
        <TopRatedMovieListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des films...')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'The Godfather' })).toBeTruthy()
    expect(fetchTopRatedMovies).toHaveBeenCalledWith({ language: 'fr-FR', region: 'FR', page: 1 })
  })

  it('loads more movies when clicking the button', async () => {
    vi.mocked(fetchTopRatedMovies)
      .mockResolvedValueOnce([createMovieItem({ id: 1, title: 'The Godfather' })])
      .mockResolvedValueOnce([createMovieItem({ id: 2, title: 'Pulp Fiction' })])

    render(
      <MemoryRouter>
        <TopRatedMovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'The Godfather' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByRole('heading', { name: 'Pulp Fiction' })).toBeTruthy()
    expect(fetchTopRatedMovies).toHaveBeenNthCalledWith(1, {
      language: 'fr-FR',
      region: 'FR',
      page: 1,
    })
    expect(fetchTopRatedMovies).toHaveBeenNthCalledWith(2, {
      language: 'fr-FR',
      region: 'FR',
      page: 2,
    })
  })

  it('renders an error message when initial loading fails', async () => {
    vi.mocked(fetchTopRatedMovies).mockRejectedValue(new Error('Initial load failed'))

    render(
      <MemoryRouter>
        <TopRatedMovieListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Initial load failed')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'The Godfather' })).toBeNull()
  })
})
