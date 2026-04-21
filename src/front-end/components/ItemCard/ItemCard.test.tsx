import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import ItemCard from './ItemCard'
import { type Item } from '../../Types'

describe('ItemCard', () => {
  it('renders title, release year, and formatted rating', () => {
    const item: Item = {
      id: 1,
      title: 'Avatar',
      release_date: '2009-12-18',
      vote_average: 7.82,
      poster_path: '/avatar.jpg',
    }

    render(<ItemCard item={item} href="/movies/1" />)

    expect(screen.getByRole('heading', { name: 'Avatar' })).toBeTruthy()
    expect(screen.getByText('2009 · Rating 7.8')).toBeTruthy()

    const link = screen.getByRole('link', { name: 'Open details for Avatar' })
    expect(link.getAttribute('href')).toBe('/movies/1')

    const poster = screen.getByRole('img', { name: 'Poster for Avatar' })
    expect(poster.getAttribute('src')).toContain('/avatar.jpg')
  })

  it('falls back to N/A year and placeholder when poster is missing', () => {
    const item: Item = {
      id: 2,
      title: 'Unknown Movie',
      vote_average: 6,
    }

    const { container } = render(<ItemCard item={item} href="/movies/2" />)

    expect(screen.getByText('N/A · Rating 6.0')).toBeTruthy()
    const placeholder = container.querySelector('.movie-poster-placeholder')
    expect(placeholder).toBeTruthy()
  })
})
