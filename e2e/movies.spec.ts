import { expect, test } from '@playwright/test'

import {
  mockMovieDetailsApi,
  mockPopularMoviesApi,
  mockPopularTvApi,
  mockTvDetailsApi,
} from './mock-api'

test.beforeEach(async ({ page }) => {
  await mockPopularMoviesApi(page)
  await mockMovieDetailsApi(page)
  await mockPopularTvApi(page)
  await mockTvDetailsApi(page)
})

test('shows the movies landing page and loads more results', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Popular Movies' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open details for Paris Under Neon' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open details for Midnight on the Seine' })).toBeVisible()

  await page.getByRole('button', { name: 'Load More' }).click()

  await expect(page.getByRole('link', { name: 'Open details for Marseille Skies' })).toBeVisible()

  await page.getByRole('link', { name: 'Open details for Paris Under Neon' }).click()

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
