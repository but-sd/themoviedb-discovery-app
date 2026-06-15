import { type ReactNode } from 'react'
import { cleanup, render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type Genre, type MovieItem } from '../../../back-end/api-schemas'
import MovieStatsPage from './MovieStatsPage'
import { fetchMovieGenres, fetchPopularMoviesPages } from '../../services/movies-service'

vi.mock('../../services/movies-service', () => ({
  fetchMovieGenres: vi.fn(),
  fetchPopularMoviesPages: vi.fn(),
}))

vi.mock('recharts', () => ({
  Bar: () => <div data-testid="chart-bar" />,
  BarChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  ResponsiveContainer: ({ children }: { children: ReactNode }) => <div data-testid="chart-shell">{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}))

function createMovieItem(overrides: Partial<MovieItem> = {}): MovieItem {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [28],
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

const genres: Genre[] = [
  { id: 12, name: 'Adventure' },
  { id: 18, name: 'Drama' },
  { id: 28, name: 'Action' },
]

describe('MovieStatsPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads movie stats and renders KPI cards, chart, and summary table', async () => {
    vi.mocked(fetchPopularMoviesPages).mockResolvedValue([
      createMovieItem({ id: 1, genre_ids: [28, 12], vote_average: 8.1, release_date: '2024-01-10' }),
      createMovieItem({ id: 2, genre_ids: [28], vote_average: 7.3, release_date: '2023-02-05' }),
      createMovieItem({ id: 3, genre_ids: [18], vote_average: 6.8, release_date: '2022-06-15' }),
    ])
    vi.mocked(fetchMovieGenres).mockResolvedValue(genres)

    render(
      <MemoryRouter>
        <MovieStatsPage />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des statistiques films...')).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Statistiques des films' })).toBeTruthy()
    expect(fetchPopularMoviesPages).toHaveBeenCalledWith({
      language: 'fr-FR',
      pages: 3,
      region: 'FR',
    })
    expect(fetchMovieGenres).toHaveBeenCalledWith({ language: 'fr-FR' })
    const kpiSection = screen.getByRole('region', { name: 'Indicateurs films' })

    expect(within(kpiSection).getByText('Films analyses')).toBeTruthy()
    expect(within(kpiSection).getAllByText('3')).toHaveLength(2)
    expect(screen.getByText('Genre dominant')).toBeTruthy()
    expect(screen.getByText('Action (2)')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'Repartition par genre' })).toBeTruthy()
    expect(screen.getByTestId('chart-shell')).toBeTruthy()
    expect(screen.getByRole('columnheader', { name: 'Genre' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Action' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Adventure' })).toBeTruthy()
    expect(screen.getByRole('rowheader', { name: 'Drama' })).toBeTruthy()
  })

  it('renders the service error when loading fails', async () => {
    vi.mocked(fetchPopularMoviesPages).mockRejectedValue(new Error('Stats API failed'))
    vi.mocked(fetchMovieGenres).mockResolvedValue(genres)

    render(
      <MemoryRouter>
        <MovieStatsPage />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Stats API failed')).toBeTruthy()
  })
})
