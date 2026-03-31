import type { Page, Route } from '@playwright/test'
import { Movie, movieDetailsAvatar, moviesPageOne, moviesPageTwo } from './mock-data'

type TvShow = {
  id: number
  name: string
  first_air_date?: string
  vote_average: number
  poster_path?: string
}

const tvPageOne: TvShow[] = [
  {
    id: 201,
    name: 'Riviera Files',
    first_air_date: '2024-01-08',
    vote_average: 8.3,
    poster_path: '/riviera-files.jpg',
  },
  {
    id: 202,
    name: 'Signal Paris',
    first_air_date: '2023-10-20',
    vote_average: 7.7,
    poster_path: '/signal-paris.jpg',
  },
]

export const tvDetails = {
  id: 201,
  name: 'Riviera Files',
  original_name: 'Les Dossiers Riviera',
  first_air_date: '2024-01-08',
  vote_average: 8.3,
  poster_path: '/riviera-files.jpg',
  backdrop_path: '/riviera-files-backdrop.jpg',
  episode_run_time: [52],
  tagline: 'Luxury has a body count.',
  overview: 'A team of investigators unravels crimes across the French coast.',
  genres: [
    { id: 80, name: 'Crime' },
    { id: 9648, name: 'Mystery' },
  ],
}

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export async function mockMovieDetailsApi(page: Page, details = movieDetailsAvatar) {
  await page.route('**/api/movies/101?**', async (route) => {
    await fulfillJson(route, details)
  })
}

export async function mockPopularMoviesApi(
  page: Page,
  options: { firstPage?: Movie[]; secondPage?: Movie[] } = {},
) {
  const { firstPage = moviesPageOne, secondPage = moviesPageTwo } = options

  await page.route('**/api/movies/popular?**', async (route) => {
    const url = new URL(route.request().url())
    const pageParam = url.searchParams.get('page')

    if (pageParam === '2') {
      await fulfillJson(route, { results: secondPage })
      return
    }

    await fulfillJson(route, { results: firstPage })
  })
}

export async function mockPopularTvApi(page: Page, shows = tvPageOne) {
  await page.route('**/api/tv/popular?**', async (route) => {
    await fulfillJson(route, { results: shows })
  })
}

export async function mockTvDetailsApi(page: Page, details = tvDetails) {
  await page.route('**/api/tv/201?**', async (route) => {
    await fulfillJson(route, details)
  })
}

