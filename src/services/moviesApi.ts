export type Movie = {
  id: number
  title: string
  release_date?: string
  vote_average: number
}

type PopularMoviesResponse = {
  results?: Movie[]
}

export async function fetchPopularMovies(params?: {
  language?: string
  region?: string
  page?: number
}): Promise<Movie[]> {
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
