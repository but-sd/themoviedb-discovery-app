import { cleanup, render, screen } from '@testing-library/react'
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
    expect(screen.getByRole('link', { name: 'Movies' }).getAttribute('href')).toBe('/movies')
    expect(screen.getByRole('link', { name: 'Stats Films' }).getAttribute('href')).toBe(
      '/movies/stats',
    )
    expect(screen.getByRole('link', { name: 'TV Shows' }).getAttribute('href')).toBe('/tv')
    expect(screen.getByRole('link', { name: 'API Docs' }).getAttribute('href')).toBe('/api/docs')
  })

  it('applies active class for movies link when on /movies route', () => {
    render(
      <MemoryRouter initialEntries={['/movies']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesLink = screen.getByRole('link', { name: 'Movies' })
    const tvShowsLink = screen.getByRole('link', { name: 'TV Shows' })

    expect(moviesLink.className).toContain('app-nav-link-active')
    expect(tvShowsLink.className).not.toContain('app-nav-link-active')
  })

  it('applies active class for TV Shows link when on /tv route', () => {
    render(
      <MemoryRouter initialEntries={['/tv']}>
        <NavBar />
      </MemoryRouter>,
    )

    const moviesLink = screen.getByRole('link', { name: 'Movies' })
    const tvShowsLink = screen.getByRole('link', { name: 'TV Shows' })

    expect(tvShowsLink.className).toContain('app-nav-link-active')
    expect(moviesLink.className).not.toContain('app-nav-link-active')
  })

  it('applies active class for stats link when on /movies/stats route', () => {
    render(
      <MemoryRouter initialEntries={['/movies/stats']}>
        <NavBar />
      </MemoryRouter>,
    )

    const statsLink = screen.getByRole('link', { name: 'Stats Films' })

    expect(statsLink.className).toContain('app-nav-link-active')
  })
})
