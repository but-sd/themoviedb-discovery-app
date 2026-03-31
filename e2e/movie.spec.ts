import { expect, test, type Page, type Route } from '@playwright/test'

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

async function fulfillJson(route: Route, body: unknown) {
  await route.fulfill({
    status: 200,
    contentType: 'application/json',
    body: JSON.stringify(body),
  })
}

async function mockApi(page: Page) {
  await page.route('**/api/movies/101?**', async (route) => {
    await fulfillJson(route, movieDetails)
  })
}

test.beforeEach(async ({ page }) => {
  await mockApi(page)
})

test('show the details of a movie using the details page URL', async ({ page }) => {
  await page.goto('/movies/101')

  await expect(page).toHaveURL(/\/movies\/101$/)
  await expect(page.getByRole('heading', { name: 'Paris Under Neon' })).toBeVisible()
  await expect(page.getByText('Paris sous neon')).toBeVisible()
  await expect(page.getByText('A night-shift courier stumbles into a city-wide conspiracy.')).toBeVisible()
  await expect(page.getByText('Every street hides a secret.')).toBeVisible()
})
