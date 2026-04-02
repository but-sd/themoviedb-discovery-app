import { expect, test } from '@playwright/test'

import {
  mockMovieDetailsApi,
  mockPopularMoviesApi,
} from './mock-api'
import { movie101, movie102, movie103 } from './mock-data'

test.beforeEach(async ({ page }) => {
  // Mock the API responses for movies before each test
  await mockPopularMoviesApi(page)
  await mockMovieDetailsApi(page)
})

test('shows the movies landing page and loads more results', async ({ page }) => {
  // Navigate to the home page
  await page.goto('/')

  // Assert that the popular movies heading is visible
  await expect(page.getByRole('heading', { name: 'Films populaires' })).toBeVisible()

  // Assert that the first page of movies is visible on the page with the correct titles
  await expect(page.getByRole('link', { name: `Open details for ${movie101.title}` })).toBeVisible()
  await expect(page.getByRole('link', { name: `Open details for ${movie102.title}` })).toBeVisible()

  // Click the "Load More" button to load the second page of movies
  await page.getByRole('button', { name: 'Charger plus' }).click()

  // Assert that the second page of movies is visible on the page with the correct titles
  await expect(page.getByRole('link', { name: `Open details for ${movie103.title}` })).toBeVisible()

  // Click on the first movie to navigate to its details page
  await page.getByRole('link', { name: `Open details for ${movie101.title}` }).click()

  // Assert that the URL is correct other test steps are covered in the movie details test
  await expect(page).toHaveURL(new RegExp(`/movies/${movie101.id}$`))
})
