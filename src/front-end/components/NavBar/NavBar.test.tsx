import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import NavBar from './NavBar'

describe('NavBar', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders brand and navigation links', () => {
    render(
      <MemoryRouter>
        <NavBar />
      </MemoryRouter>,
    )

    expect(screen.getByText('TMDB Discovery')).toBeTruthy()
    expect(screen.getByText('Films')).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Populaires' }).getAttribute('href')).toBe('/movies')
    expect(screen.getByRole('link', { name: 'Statistiques' }).getAttribute('href')).toBe(
      '/movies/stats',
    )
    expect(screen.getByRole('link', { name: 'Mieux notés' }).getAttribute('href')).toBe(
      '/movies/top-rated',
    )
    expect(screen.getByRole('link', { name: 'Séries TV' }).getAttribute('href')).toBe('/tv')
    expect(screen.getByRole('link', { name: 'Documentation API' }).getAttribute('href')).toBe('/api/docs')
  })

  it('applies active class for popular movies when on /movies route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/movies']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesMenu = container.querySelector('details')
    const popularLink = screen.getByRole('link', { name: 'Populaires' })
    const tvShowsLink = screen.getByRole('link', { name: 'Séries TV' })

    expect(moviesMenu?.open).toBe(true)
    expect(popularLink.className).toContain('app-nav-link-active')
    expect(tvShowsLink.className).not.toContain('app-nav-link-active')
  })

  it('applies active class for TV Shows link when on /tv route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/tv']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesMenu = container.querySelector('details')
    const tvShowsLink = screen.getByRole('link', { name: 'Séries TV' })

    expect(tvShowsLink.className).toContain('app-nav-link-active')
    expect(moviesMenu?.open).toBe(false)
  })

  it('applies active class for stats movies when on /movies/stats route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/movies/stats']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesMenu = container.querySelector('details')
    const statsLink = screen.getByRole('link', { name: 'Statistiques' })

    expect(statsLink.className).toContain('app-nav-link-active')
    expect(moviesMenu?.open).toBe(true)
  })

  it('applies active class for top rated movies when on /movies/top-rated route', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/movies/top-rated']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesMenu = container.querySelector('details')
    const topRatedLink = screen.getByRole('link', { name: 'Mieux notés' })
    const popularLink = screen.getByRole('link', { name: 'Populaires' })

    expect(topRatedLink.className).toContain('app-nav-link-active')
    expect(popularLink.className).not.toContain('app-nav-link-active')
    expect(moviesMenu?.open).toBe(true)
  })

  it('closes the movies submenu after clicking a submenu item', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/movies/top-rated']}>
        <NavBar />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('link', { name: 'Populaires' }))

    const moviesMenu = container.querySelector('details')

    expect(moviesMenu?.open).toBe(false)
    expect(screen.getByRole('link', { name: 'Populaires' }).className).toContain('app-nav-link-active')
  })
})
