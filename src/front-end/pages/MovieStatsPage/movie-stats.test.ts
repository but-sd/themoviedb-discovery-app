import { describe, expect, it } from 'vitest'
import { type MovieItem } from '../../../back-end/api-schemas'
import { buildMovieStats } from './movie-stats'

function createMovieItem(overrides: Partial<MovieItem> = {}): MovieItem {
  return {
    adult: false,
    backdrop_path: null,
    genre_ids: [28],
    id: 1,
    original_language: 'en',
    original_title: 'Avatar',
    overview: 'Sci-fi adventure',
    popularity: 100,
    poster_path: '/avatar.jpg',
    release_date: '2009-12-18',
    title: 'Avatar',
    video: false,
    vote_average: 7.8,
    vote_count: 1000,
    ...overrides,
  }
}

describe('buildMovieStats', () => {
  it('returns an empty summary when no movies are provided', () => {
    expect(buildMovieStats([])).toEqual({
      averageRating: 0,
      genreBreakdown: [],
      latestReleaseYear: null,
      topGenre: null,
      totalGenres: 0,
      totalMovies: 0,
    })
  })

  it('aggregates genre distribution, rating averages, and latest release year', () => {
    const summary = buildMovieStats([
      createMovieItem({ id: 1, genre_ids: [28, 12], release_date: '2024-01-01', vote_average: 8.2 }),
      createMovieItem({ id: 2, genre_ids: [28, 878], release_date: '2023-05-10', vote_average: 7.4 }),
      createMovieItem({ id: 3, genre_ids: [18], release_date: '2021-02-15', vote_average: 6.9 }),
    ])

    expect(summary.totalMovies).toBe(3)
    expect(summary.totalGenres).toBe(4)
    expect(summary.averageRating).toBe(7.5)
    expect(summary.latestReleaseYear).toBe(2024)
    expect(summary.topGenre).toEqual({
      averageRating: 7.8,
      genreId: 28,
      movieCount: 2,
      name: 'Action',
      share: 66.7,
    })
    expect(summary.genreBreakdown).toEqual([
      {
        averageRating: 7.8,
        genreId: 28,
        movieCount: 2,
        name: 'Action',
        share: 66.7,
      },
      {
        averageRating: 8.2,
        genreId: 12,
        movieCount: 1,
        name: 'Aventure',
        share: 33.3,
      },
      {
        averageRating: 6.9,
        genreId: 18,
        movieCount: 1,
        name: 'Drame',
        share: 33.3,
      },
      {
        averageRating: 7.4,
        genreId: 878,
        movieCount: 1,
        name: 'Science-fiction',
        share: 33.3,
      },
    ])
  })
})
