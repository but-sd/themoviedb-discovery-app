import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { type TvItem } from '../../../back-end/api-schemas'
import TvItemCard from './TvItemCard'

describe('TvItemCard', () => {
  afterEach(() => {
    cleanup()
  })

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
    expect(screen.getByText('2020 · Note 8.1')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ouvrir les détails de The Show' }).getAttribute('href')).toBe('/tv/42')
  })

  it('renders a placeholder when no poster is available', () => {
    const show: TvItem = {
      adult: false,
      backdrop_path: null,
      genre_ids: [18],
      id: 43,
      origin_country: ['US'],
      original_language: 'en',
      original_name: 'No Poster Show',
      overview: 'Drama series without poster',
      popularity: 50,
      poster_path: null,
      first_air_date: '2021-01-01',
      name: 'No Poster Show',
      vote_average: 7.5,
      vote_count: 300,
    }

    render(
      <MemoryRouter>
        <TvItemCard show={show} />
      </MemoryRouter>,
    )

    expect(screen.getByRole('heading', { name: 'No Poster Show' })).toBeTruthy()
    expect(screen.getByText('2021 · Note 7.5')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Ouvrir les détails de No Poster Show' }).getAttribute('href')).toBe('/tv/43')

    const placeholder = document.querySelector('.movie-poster-placeholder')
    expect(placeholder).toBeTruthy()
  })
})
