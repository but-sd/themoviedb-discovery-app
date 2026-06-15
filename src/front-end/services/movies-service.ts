import type {
  MovieDetails,
  MovieItem,
  MoviePopularResponse,
} from '../../back-end/api-schemas'

type MediaListParams = {
  language?: string
  region?: string
  page?: number
}

type MultiPageMediaListParams = MediaListParams & {
  pages?: number
}

type MediaRequestParams = {
  language?: string
}

export async function fetchPopularMovies(params?: MediaListParams): Promise<MovieItem[]> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
    region: params?.region ?? 'FR',
    page: String(params?.page ?? 1),
  })

  const response = await fetch(`/api/movies/popular?${searchParams.toString()}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  const data = (await response.json()) as MoviePopularResponse
  return data.results ?? []
}

export async function fetchPopularMoviesPages(
  params?: MultiPageMediaListParams,
): Promise<MovieItem[]> {
  const pages = Math.max(1, Math.floor(params?.pages ?? 1))
  const requests = Array.from({ length: pages }, (_, index) =>
    fetchPopularMovies({
      language: params?.language,
      region: params?.region,
      page: index + 1,
    }),
  )
  const results = await Promise.all(requests)
  const seenMovieIds = new Set<number>()

  return results.flat().filter((movie) => {
    if (seenMovieIds.has(movie.id)) {
      return false
    }

    seenMovieIds.add(movie.id)
    return true
  })
}

export async function fetchMovieDetails(
  movieId: number | string,
  params?: MediaRequestParams,
): Promise<MovieDetails> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
  })
  const response = await fetch(
    `/api/movies/${encodeURIComponent(String(movieId))}?${searchParams.toString()}`,
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as MovieDetails
}
