import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type TvItem } from '../../../back-end/api-schemas'
import TvListPage from './TvListPage'
import { fetchPopularTvShows } from '../../services/tv-shows-service'

vi.mock('../../services/tv-shows-service', () => ({
  fetchPopularTvShows: vi.fn(),
}))

function createTvItem(overrides: Partial<TvItem> = {}): TvItem {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [18],
    id: 1,
    origin_country: ['US'],
    original_language: 'en',
    original_name: 'The Show',
    overview: 'Drama series',
    popularity: 88,
    poster_path: '/show.jpg',
    first_air_date: '2020-01-01',
    name: 'The Show',
    vote_average: 8.1,
    vote_count: 500,
    ...overrides,
  }
}

describe('TvListPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and renders popular TV shows', async () => {
    vi.mocked(fetchPopularTvShows).mockResolvedValue([createTvItem()])

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des séries...')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'The Show' })).toBeTruthy()
    expect(fetchPopularTvShows).toHaveBeenCalledWith({ language: 'fr-FR', region: 'FR', page: 1 })
  })

  it('loads more TV shows when clicking the button', async () => {
    vi.mocked(fetchPopularTvShows)
      .mockResolvedValueOnce([createTvItem({ id: 1, name: 'The Show', first_air_date: '2020-01-01' })])
      .mockResolvedValueOnce([createTvItem({ id: 2, name: 'Another Show', first_air_date: '2021-06-10' })])

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'The Show' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByRole('heading', { name: 'Another Show' })).toBeTruthy()
    expect(fetchPopularTvShows).toHaveBeenNthCalledWith(1, {
      language: 'fr-FR',
      region: 'FR',
      page: 1,
    })
    expect(fetchPopularTvShows).toHaveBeenNthCalledWith(2, {
      language: 'fr-FR',
      region: 'FR',
      page: 2,
    })
  })

  it('renders an error message when initial loading fails', async () => {
    vi.mocked(fetchPopularTvShows).mockRejectedValue(new Error('Initial TV load failed'))

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Initial TV load failed')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'The Show' })).toBeNull()
  })

  it('renders fallback error message for non-error initial failures', async () => {
    vi.mocked(fetchPopularTvShows).mockRejectedValue('unexpected failure')

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Impossible de charger les séries populaires.')).toBeTruthy()
  })

  it('renders an error message when loading more fails', async () => {
    vi.mocked(fetchPopularTvShows)
      .mockResolvedValueOnce([createTvItem({ id: 1, name: 'The Show' })])
      .mockRejectedValueOnce(new Error('Load more TV failed'))

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'The Show' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByText('Load more TV failed')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'The Show' })).toBeTruthy()
  })

  it('renders fallback error message when loading more fails with a non-error value', async () => {
    vi.mocked(fetchPopularTvShows)
      .mockResolvedValueOnce([createTvItem({ id: 1, name: 'The Show' })])
      .mockRejectedValueOnce('unexpected load more failure')

    render(
      <MemoryRouter>
        <TvListPage />
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'The Show' })).toBeTruthy()

    fireEvent.click(screen.getByRole('button', { name: 'Charger plus' }))

    expect(await screen.findByText('Impossible de charger plus de séries.')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'The Show' })).toBeTruthy()
  })
})
