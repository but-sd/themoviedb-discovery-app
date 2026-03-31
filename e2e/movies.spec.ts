import { expect, test, type Page, type Route } from '@playwright/test'

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

const movieDetails = {
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

const tvDetails = {
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

async function mockApi(page: Page) {
  await page.route('**/api/movies/popular?**', async (route) => {
    const url = new URL(route.request().url())
    const pageParam = url.searchParams.get('page')

    if (pageParam === '2') {
      await fulfillJson(route, { results: moviesPageTwo })
      return
    }

    await fulfillJson(route, { results: moviesPageOne })
  })

  await page.route('**/api/movies/101?**', async (route) => {
    await fulfillJson(route, movieDetails)
  })

  await page.route('**/api/tv/popular?**', async (route) => {
    await fulfillJson(route, { results: tvPageOne })
  })

  await page.route('**/api/tv/201?**', async (route) => {
    await fulfillJson(route, tvDetails)
  })
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('shows the movies landing page and loads more results', async ({ page }) => {
  // Start from the landing page and verify the initial movies are displayed
  await page.goto('/')

  // Verify the heading is visible
  await expect(page.getByRole('heading', { name: 'Popular Movies' })).toBeVisible()
  
  // Verify that all movies from the first page are visible
  await expect(page.getByRole('link', { name: 'Open details for Paris Under Neon' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open details for Midnight on the Seine' })).toBeVisible()

  // Click the "Load More" button to load the next page of movies
  await page.getByRole('button', { name: 'Load More' }).click()

  // Verify that the new movie from the second page is visible
  await expect(page.getByRole('link', { name: 'Open details for Marseille Skies' })).toBeVisible()

  // Click to the first movie's details page to verify navigation works correctly
  await page.getByRole('link', { name: 'Open details for Paris Under Neon' }).click()

  // Verify the URL and movie details are displayed correctly
  await expect(page).toHaveURL(/\/movies\/101$/)
  await expect(page.getByRole('heading', { name: 'Paris Under Neon' })).toBeVisible()
})

test('opens movie details from the movies list', async ({ page }) => {
  await page.goto('/movies')

  await page.getByRole('link', { name: 'Open details for Paris Under Neon' }).click()

  await expect(page).toHaveURL(/\/movies\/101$/)
  await expect(page.getByRole('heading', { name: 'Paris Under Neon' })).toBeVisible()
  await expect(page.getByText('Every street hides a secret.')).toBeVisible()
  await expect(page.getByText('2h 07m')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible()
  await expect(page.getByText('A night-shift courier stumbles into a city-wide conspiracy.')).toBeVisible()
})

test('shows the TV list and opens TV details', async ({ page }) => {
  await page.goto('/tv')

  await expect(page.getByRole('heading', { name: 'Popular TV Shows' })).toBeVisible()
  await page.getByRole('link', { name: 'Open details for Riviera Files' }).click()

  await expect(page).toHaveURL(/\/tv\/201$/)
  await expect(page.getByRole('heading', { name: 'Riviera Files' })).toBeVisible()
  await expect(page.getByText('Luxury has a body count.')).toBeVisible()
  await expect(page.getByText('52m')).toBeVisible()
  await expect(page.getByText('Crime', { exact: true })).toBeVisible()
})

test('renders the not found page for unknown routes', async ({ page }) => {
  await page.goto('/missing-page')

  await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Return to the movies' })).toBeVisible()
})
