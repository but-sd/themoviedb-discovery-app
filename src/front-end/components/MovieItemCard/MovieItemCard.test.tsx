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
    expect(screen.getByText('2009 · Rating 7.8')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open details for Avatar' }).getAttribute('href')).toBe('/movies/1')
  })
})
