import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { type TvItem } from '../../../back-end/api-schemas'
import TvItemCard from './TvItemCard'

describe('TvItemCard', () => {
  it('renders tv-specific name and first air year', () => {
    const show: TvItem = {
      adult: false,
      backdrop_path: null,
      genre_ids: [18],
      id: 42,
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
    }

    render(
      <MemoryRouter>
        <TvItemCard show={show} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'The Show' })).toBeTruthy()
    expect(screen.getByText('2020 · Rating 8.1')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Open details for The Show' }).getAttribute('href')).toBe('/tv/42')
  })
})
