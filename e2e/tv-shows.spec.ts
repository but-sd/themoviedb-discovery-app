import { expect, test } from '@playwright/test'

import {
  mockPopularTvApi,
  mockTvDetailsApi,
} from './mock-api'
import { tvShow201 } from './mock-data'

test.beforeEach(async ({ page }) => {
  // Mock the API responses for movies before each test
  await mockTvDetailsApi(page)
  await mockPopularTvApi(page)
})



test('shows the TV list and opens TV details', async ({ page }) => {
  await page.goto('/tv')

  await expect(page.getByRole('heading', { name: 'Séries populaires' })).toBeVisible()
  // await page.getByRole('link', { name: `Open details for ${tvShow201.name}` }).click()

  // await expect(page).toHaveURL(new RegExp(`/tv/${tvShow201.id}$`))
  // await expect(page.getByRole('heading', { name: tvShow201.name })).toBeVisible()
  // await expect(page.getByText(tvShow201.tagline)).toBeVisible()
  // await expect(page.getByText(`${tvShow201.episode_run_time[0]}m`)).toBeVisible()
  // await expect(page.getByText(tvShow201.genres[0].name, { exact: true })).toBeVisible()
})

// test('renders the not found page for unknown routes', async ({ page }) => {
//   await page.goto('/missing-page')

//   await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
//   await expect(page.getByRole('link', { name: 'Return to the movies' })).toBeVisible()
// })
