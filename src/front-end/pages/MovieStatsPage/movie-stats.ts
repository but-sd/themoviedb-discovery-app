import { type Genre, type MovieItem } from '../../../back-end/api-schemas'

export type GenreStat = {
  averageRating: number
  genreId: number
  movieCount: number
  name: string
  share: number
}

export type MovieStatsSummary = {
  averageRating: number
  genreBreakdown: GenreStat[]
  latestReleaseYear: number | null
  topGenre: GenreStat | null
  totalGenres: number
  totalMovies: number
}

function toFixedNumber(value: number, digits = 1): number {
  return Number(value.toFixed(digits))
}

function getReleaseYear(releaseDate: string | undefined): number | null {
  if (!releaseDate || !/^\d{4}/.test(releaseDate)) {
    return null
  }

  return Number(releaseDate.slice(0, 4))
}

export function buildMovieStats(
  movies: readonly MovieItem[],
  genres: readonly Genre[] = [],
): MovieStatsSummary {
  if (movies.length === 0) {
    return {
      averageRating: 0,
      genreBreakdown: [],
      latestReleaseYear: null,
      topGenre: null,
      totalGenres: 0,
      totalMovies: 0,
    }
  }

  const genreNamesById = new Map(genres.map((genre) => [genre.id, genre.name]))
  const genreStats = new Map<number, { movieCount: number; ratingTotal: number }>()
  let latestReleaseYear: number | null = null
  let ratingTotal = 0

  for (const movie of movies) {
    ratingTotal += movie.vote_average

    const releaseYear = getReleaseYear(movie.release_date)
    if (releaseYear !== null && (latestReleaseYear === null || releaseYear > latestReleaseYear)) {
      latestReleaseYear = releaseYear
    }

    for (const genreId of new Set(movie.genre_ids)) {
      const currentGenreStat = genreStats.get(genreId) ?? { movieCount: 0, ratingTotal: 0 }
      currentGenreStat.movieCount += 1
      currentGenreStat.ratingTotal += movie.vote_average
      genreStats.set(genreId, currentGenreStat)
    }
  }

  const genreBreakdown = [...genreStats.entries()]
    .map(([genreId, stat]) => ({
      averageRating: toFixedNumber(stat.ratingTotal / stat.movieCount),
      genreId,
      movieCount: stat.movieCount,
      name: genreNamesById.get(genreId) ?? `Genre ${genreId}`,
      share: toFixedNumber((stat.movieCount / movies.length) * 100),
    }))
    .sort((left, right) => {
      if (right.movieCount !== left.movieCount) {
        return right.movieCount - left.movieCount
      }

      return left.name.localeCompare(right.name)
    })

  return {
    averageRating: toFixedNumber(ratingTotal / movies.length),
    genreBreakdown,
    latestReleaseYear,
    topGenre: genreBreakdown[0] ?? null,
    totalGenres: genreBreakdown.length,
    totalMovies: movies.length,
  }
}
