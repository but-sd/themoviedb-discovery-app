import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type MovieDetails } from '../../../back-end/api-schemas'
import MovieDetailPage from './MovieDetailPage'
import { fetchMovieDetails } from '../../services/movies-service'

vi.mock('../../services/movies-service', () => ({
  fetchMovieDetails: vi.fn(),
}))

function createMovieDetails(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    title: 'Inception',
    vote_average: 8.2,
    release_date: '2010-07-16',
    runtime: 148,
    overview: 'A thief who steals corporate secrets through dream-sharing technology.',
    genres: [{ id: 1, name: 'Science Fiction' }],
    backdrop_path: '/backdrop.jpg',
    poster_path: '/poster.jpg',
    tagline: 'Your mind is the scene of the crime.',
    original_title: 'Inception',
    ...overrides,
  } as MovieDetails
}

describe('MovieDetailPage', () => {
  afterEach(() => {
    cleanup()
    vi.clearAllMocks()
  })

  it('loads and renders movie details', async () => {
    vi.mocked(fetchMovieDetails).mockResolvedValue(createMovieDetails())

    render(
      <MemoryRouter>
        <MovieDetailPage movieId="42" />
      </MemoryRouter>,
    )

    expect(screen.getByText('Chargement des détails du film...')).toBeTruthy()

    expect(await screen.findByRole('heading', { name: 'Inception' })).toBeTruthy()
    expect(screen.getByRole('link', { name: '← Retour vers les films populaires' }).getAttribute('href')).toBe('/movies')
    expect(fetchMovieDetails).toHaveBeenCalledWith('42', { language: 'fr-FR' })
  })

  it('renders an error message when loading fails with a network error', async () => {
    vi.mocked(fetchMovieDetails).mockRejectedValue(new Error('Network error'))

    render(
      <MemoryRouter>
        <MovieDetailPage movieId="99" />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Network error')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Inception' })).toBeNull()
  })

  it('renders fallback error message when loading fails with a non-error value', async () => {
    vi.mocked(fetchMovieDetails).mockRejectedValue('unexpected failure')

    render(
      <MemoryRouter>
        <MovieDetailPage movieId="100" />
      </MemoryRouter>,
    )

    expect(await screen.findByText('Could not load movie details.')).toBeTruthy()
    expect(screen.queryByRole('heading', { name: 'Inception' })).toBeNull()
  })
})
