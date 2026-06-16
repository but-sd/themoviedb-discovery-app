import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type TvShowDetails } from '../../../back-end/api-schemas'
import TvDetailPage from './TvDetailPage'
import { fetchTvDetails } from '../../services/tv-shows-service'

vi.mock('../../services/tv-shows-service', () => ({
  fetchTvDetails: vi.fn(),
}))

function createTvShowDetails(overrides: Partial<TvShowDetails> = {}): TvShowDetails {
  return {
    name: 'The Last of Us',
    vote_average: 8.7,
    first_air_date: '2023-01-15',
    episode_run_time: [60],
    overview: 'A post-apocalyptic drama series.',
    genres: [{ id: 18, name: 'Drama' }],
    backdrop_path: '/backdrop.jpg',
    poster_path: '/poster.jpg',
    tagline: 'When you are lost in the darkness, look for the light.',
    original_name: 'The Last of Us',
    ...overrides,
  } as TvShowDetails
}

describe('TvDetailPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and renders TV show details', async () => {
    vi.mocked(fetchTvDetails).mockResolvedValue(createTvShowDetails())

    render(
      <MemoryRouter>
        <TvDetailPage tvId="42" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des détails de la série...')).toBeTruthy()

    expect(await screen.findByRole('heading', { name: 'The Last of Us' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '← Retour vers les séries populaires' }).getAttribute('href')).toBe('/tv')
    expect(fetchTvDetails).toHaveBeenCalledWith('42', { language: 'fr-FR' })
  })

  it('renders an error message when loading fails with a network error', async () => {
    vi.mocked(fetchTvDetails).mockRejectedValue(new Error('Network error'))

    render(
      <MemoryRouter>
        <TvDetailPage tvId="99" />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Network error')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'The Last of Us' })).toBeNull()
  })

  it('renders fallback error message when loading fails with a non-error value', async () => {
    vi.mocked(fetchTvDetails).mockRejectedValue('unexpected failure')

    render(
      <MemoryRouter>
        <TvDetailPage tvId="100" />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Impossible de charger les détails de la série.')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'The Last of Us' })).toBeNull()
  })
})
