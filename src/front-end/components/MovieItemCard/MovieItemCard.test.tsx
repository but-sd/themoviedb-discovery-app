import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { type MovieItem } from '../../../back-end/api-schemas'
import MovieItemCard from './MovieItemCard'

describe('MovieItemCard', () => {
  it('renders movie-specific title and release year', () => {
    const movie: MovieItem = {
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
      vote_average: 7.82,
      vote_count: 1000,
    }

    render(
      <MemoryRouter>
        <MovieItemCard movie={movie} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'Avatar' })).toBeTruthy()
    expect(screen.getByText('2009 · Note 7.8')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ouvrir les détails de Avatar' }).getAttribute('href')).toBe('/movies/1')
  })

  it('renders placeholder when poster is missing', () => {
    const movie: MovieItem = {
      adult: false,
      backdrop_path: null,
      genre_ids: [12],
      id: 2,
      original_language: 'en',
      original_title: 'No Poster Movie',
      overview: 'A movie without a poster',
      popularity: 50,
      poster_path: null,
      release_date: '2020-01-01',
      title: 'No Poster Movie',
      video: false,
      vote_average: 5.0,
      vote_count: 100,
    }

    render(
      <MemoryRouter>
        <MovieItemCard movie={movie} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'No Poster Movie' })).toBeTruthy()
    expect(screen.getByText('2020 · Note 5.0')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ouvrir les détails de No Poster Movie' }).getAttribute('href')).toBe('/movies/2')
    expect(screen.getByRole('img', { hidden: true })).toBeTruthy()
  })
})
