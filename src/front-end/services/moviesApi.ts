export type Movie = {
  id: number
  title: string
  release_date?: string
  vote_average: number
  poster_path?: string
}

export type TvShow = {
  id: number
  name: string
  first_air_date?: string
  vote_average: number
  poster_path?: string
}

export type MovieGenre = {
  id: number
  name: string
}

export type MovieDetails = Movie & {
  backdrop_path?: string
  overview?: string
  runtime?: number
  genres?: MovieGenre[]
  tagline?: string
  original_title?: string
}

type PopularMoviesResponse = {
  results?: Movie[]
}

type PopularTvShowsResponse = {
  results?: TvShow[]
}

type MediaListParams = {
  language?: string
  region?: string
  page?: number
}

type MovieRequestParams = {
  language?: string
}

export async function fetchPopularMovies(params?: MediaListParams): Promise<Movie[]> {
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

  const data = (await response.json()) as PopularMoviesResponse
  return data.results ?? []
}

export async function fetchPopularTvShows(params?: MediaListParams): Promise<TvShow[]> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
    region: params?.region ?? 'FR',
    page: String(params?.page ?? 1),
  })

  const response = await fetch(`/api/tv/popular?${searchParams.toString()}`)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  const data = (await response.json()) as PopularTvShowsResponse
  return data.results ?? []
}

export async function fetchMovieDetails(
  movieId: number | string,
  params?: MovieRequestParams,
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
