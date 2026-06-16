import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { type TvShowDetails } from '../../../back-end/api-schemas'
import TvShowDetailCard from './TvShowDetailCard'

function createShow(overrides: Partial<TvShowDetails> = {}): TvShowDetails {
  return {
    name: 'The Last of Us',
    vote_average: 8.7,
    first_air_date: '2023-01-15',
    episode_run_time: [60],
    overview: 'A post-apocalyptic drama series.',
    genres: [{ id: 18, name: 'Drama' }],
    backdrop_path: '/backdrop.jpg',
    poster_path: '/poster.jpg',
    tagline: 'When you are lost in the darkness, look for the light.',
    original_name: 'The Last of Us',
    ...overrides,
  } as TvShowDetails
}

describe('TvShowDetailCard', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders tv show details with title, year, runtime, and rating', () => {
    const show = createShow()

    render(<TvShowDetailCard show={show} />)

    expect(screen.getByRole('heading', { name: 'The Last of Us' })).toBeTruthy()
    expect(screen.getByText('2023')).toBeTruthy()
    expect(screen.getByText('1h 00m')).toBeTruthy()
    expect(screen.getByText('Note 8.7')).toBeTruthy()
    expect(screen.getByText('Drama')).toBeTruthy()
    expect(screen.getByText('A post-apocalyptic drama series.')).toBeTruthy()
  })

  it('renders placeholder and fallback overview when image and synopsis are missing', () => {
    const show = createShow({
      backdrop_path: undefined,
      poster_path: undefined,
      overview: '',
      first_air_date: undefined,
      episode_run_time: [],
      vote_average: 7,
      genres: [],
    })

    const { container } = render(<TvShowDetailCard show={show} />)

    const placeholder = container.querySelector('.tv-detail-hero-placeholder')
    expect(placeholder).toBeTruthy()

    expect(screen.getByText('N/A')).toBeTruthy()
    expect(screen.getByText('Durée indisponible')).toBeTruthy()
    expect(screen.getByText('Note 7.0')).toBeTruthy()
    expect(screen.getByText("Aucun synopsis n'est disponible pour cette série pour le moment.")).toBeTruthy()
  })

  it('renders original name section when different from title', () => {
    const show = createShow({
      original_name: 'The Last of Us: Original',
    })

    render(<TvShowDetailCard show={show} />)

    expect(screen.getByText('Nom original')).toBeTruthy()
    expect(screen.getByText('The Last of Us: Original')).toBeTruthy()
  })

  it('does not render original name section when same as title', () => {
    const show = createShow({
      original_name: 'The Last of Us',
    })

    render(<TvShowDetailCard show={show} />)

    expect(screen.queryByText('Nom original')).toBeNull()
  })

  it('renders tagline when available', () => {
    const show = createShow({
      tagline: 'An epic journey.',
    })

    render(<TvShowDetailCard show={show} />)

    expect(screen.getByText('An epic journey.')).toBeTruthy()
  })

  it('does not render tagline when not available', () => {
    const show = createShow({
      tagline: '',
    })

    render(<TvShowDetailCard show={show} />)

    expect(screen.queryByText('An epic journey.')).toBeNull()
  })
})
