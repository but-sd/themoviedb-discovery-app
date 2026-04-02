import type { Page, Route } from '@playwright/test'
import { movie101, moviesPageOne, moviesPageTwo, tvShow201 } from './mock-data'
import { Movie } from '../src/front-end/Types'

type TvShow = {
  id: number
  name: string
  first_air_date?: string
  vote_average: number
  poster_path?: string
}

const tvPageOne: TvShow[] = [
  tvShow201,
]

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

export async function mockMovieDetailsApi(page: Page, details = movie101) {
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

export async function mockTvDetailsApi(page: Page, details = tvShow201) {
  await page.route('**/api/tv/201?**', async (route) => {
    await fulfillJson(route, details)
  })
}

