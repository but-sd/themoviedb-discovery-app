import type { TvShow, TvShowDetails } from "../Types";
import type { MediaListParams, MediaRequestParams } from "./moviesApi";


export async function fetchPopularTvShows(params?: MediaListParams): Promise<TvShow[]> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? 'fr-FR',
    region: params?.region ?? 'FR',
    page: String(params?.page ?? 1),
  });

  const response = await fetch(`/api/tv/popular?${searchParams.toString()}`);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed with status ${response.status}`);
  }

  const data = (await response.json()) as PopularTvShowsResponse;
  return data.results ?? [];
}

export async function fetchTvDetails(
  tvId: number | string,
  params?: MediaRequestParams
): Promise<TvShowDetails> {
  const searchParams = new URLSearchParams({
    language: params?.language ?? "fr-FR",
  })
  const response = await fetch(
    `/api/tv/${encodeURIComponent(String(tvId))}?${searchParams.toString()}`
  )

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || `Request failed with status ${response.status}`)
  }

  return (await response.json()) as TvShowDetails
}
export type PopularTvShowsResponse = {
  results?: TvShow[]
}

