import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import MovieDetailCard from './MovieDetailCard'
import { type MovieDetails } from '../../Types'

function createMovie(overrides: Partial<MovieDetails> = {}): MovieDetails {
  return {
    title: 'Inception',
    vote_average: 8.234,
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

describe('MovieDetailCard', () => {
  it('renders hero image and prefers backdrop over poster', () => {
    const movie = createMovie({
      backdrop_path: '/preferred-backdrop.jpg',
      poster_path: '/fallback-poster.jpg',
    })

    const { container } = render(<MovieDetailCard movie={movie} />)

    const hero = screen.getByRole('img', { name: 'Artwork for Inception' })
    expect(hero).toBeTruthy()
    expect(hero.getAttribute('src')).toContain('/preferred-backdrop.jpg')

    const placeholder = container.querySelector('.movie-detail-hero-placeholder')
    expect(placeholder).toBeNull()
  })

  it('renders placeholders and fallback copy when optional data is missing', () => {
    const movie = createMovie({
      backdrop_path: undefined,
      poster_path: undefined,
      release_date: undefined,
      runtime: undefined,
      overview: '',
      vote_average: 7,
      genres: [],
      tagline: '',
    })

    const { container } = render(<MovieDetailCard movie={movie} />)

    const placeholder = container.querySelector('.movie-detail-hero-placeholder')
    expect(placeholder).toBeTruthy()

    expect(screen.getByText('N/A')).toBeTruthy()
    expect(screen.getByText('Runtime unavailable')).toBeTruthy()
    expect(screen.getByText('Note 7.0')).toBeTruthy()
    expect(
      screen.getByText("Aucun synopsis n'est disponible pour ce titre pour le moment.")
    ).toBeTruthy()
  })

  it('formats runtime and shows tagline + genres when provided', () => {
    const movie = createMovie({
      runtime: 125,
      release_date: '2024-11-03',
      tagline: 'A bold new journey.',
      genres: [
        { id: 10, name: 'Adventure' },
        { id: 20, name: 'Drama' },
      ],
    })

    render(<MovieDetailCard movie={movie} />)

    expect(screen.getByText('2024')).toBeTruthy()
    expect(screen.getByText('2h 05m')).toBeTruthy()
    expect(screen.getByRole('heading', { name: 'A bold new journey.' })).toBeTruthy()
    expect(screen.getByText('Adventure')).toBeTruthy()
    expect(screen.getByText('Drama')).toBeTruthy()
  })

  it('shows original title section only when different from title', () => {
    const withDifferentOriginal = createMovie({
      title: 'Le Fabuleux Destin d’Amélie Poulain',
      original_title: 'Amélie',
    })

    const { rerender } = render(<MovieDetailCard movie={withDifferentOriginal} />)
    expect(screen.getByRole('heading', { name: 'Titre original' })).toBeTruthy()
    expect(screen.getByText('Amélie')).toBeTruthy()

    const withSameOriginal = createMovie({
      title: 'Inception',
      original_title: 'Inception',
    })

    rerender(<MovieDetailCard movie={withSameOriginal} />)
    expect(screen.queryByRole('heading', { name: 'Titre original' })).toBeNull()
  })
})