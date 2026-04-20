import type { Item, MovieDetails } from "../Types";
import type { MediaListParams, MediaRequestParams } from "./moviesApi";

export type MoviesResponse = {
  results?: Item[]
}

export async function fetchPopularMovies(params?: MediaListParams): Promise<Item[]> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
    region: params?.region ?? 'FR',
    page: String(params?.page ?? 1),
  });

  const response = await fetch(`/api/movies/popular?${searchParams.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as MoviesResponse;
  return data.results ?? [];
}

export async function fetchMovieDetails(
  movieId: number | string,
  params?: MediaRequestParams
): Promise<MovieDetails> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
  })
  const response = await fetch(
    `/api/movies/${encodeURIComponent(String(movieId))}?${searchParams.toString()}`
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as MovieDetails
}

