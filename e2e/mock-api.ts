import type { Page, Route } from '@playwright/test'

type Movie = {
  id: number
  title: string
  release_date?: string
  vote_average: number
  poster_path?: string
}

type TvShow = {
  id: number
  name: string
  first_air_date?: string
  vote_average: number
  poster_path?: string
}

const moviesPageOne: Movie[] = [
  {
    id: 101,
    title: 'Paris Under Neon',
    release_date: '2024-04-12',
    vote_average: 7.4,
    poster_path: '/paris-under-neon.jpg',
  },
  {
    id: 102,
    title: 'Midnight on the Seine',
    release_date: '2023-09-01',
    vote_average: 6.9,
    poster_path: '/midnight-on-the-seine.jpg',
  },
]

const moviesPageTwo: Movie[] = [
  {
    id: 103,
    title: 'Marseille Skies',
    release_date: '2022-02-17',
    vote_average: 8.1,
    poster_path: '/marseille-skies.jpg',
  },
]

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

export const movieDetails = {
  id: 101,
  title: 'Paris Under Neon',
  original_title: 'Paris sous neon',
  release_date: '2024-04-12',
  vote_average: 7.4,
  poster_path: '/paris-under-neon.jpg',
  backdrop_path: '/paris-under-neon-backdrop.jpg',
  runtime: 127,
  tagline: 'Every street hides a secret.',
  overview: 'A night-shift courier stumbles into a city-wide conspiracy.',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
}

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

export async function mockMovieDetailsApi(page: Page, details = movieDetails) {
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

