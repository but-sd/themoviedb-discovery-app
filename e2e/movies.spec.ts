import { expect, test } from '@playwright/test'

import {
  mockMovieDetailsApi,
  mockPopularMoviesApi,
} from './mock-api'
import { movieDetailsAvatar, movieDetailsLaFemmeDeMenage, movieDetailsScream7 } from './mock-data'

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
  await expect(page.getByRole('link', { name: `Open details for ${movieDetailsAvatar.title}` })).toBeVisible()
  await expect(page.getByRole('link', { name: `Open details for ${movieDetailsLaFemmeDeMenage.title}` })).toBeVisible()

  // Click the "Load More" button to load the second page of movies
  await page.getByRole('button', { name: 'Charger plus' }).click()

  // Assert that the second page of movies is visible on the page with the correct titles
  await expect(page.getByRole('link', { name: `Open details for ${movieDetailsScream7.title}` })).toBeVisible()

  // Click on the first movie to navigate to its details page
  await page.getByRole('link', { name: `Open details for ${movieDetailsAvatar.title}` }).click()

  // Assert that the URL is correct other test steps are covered in the movie details test
  await expect(page).toHaveURL(new RegExp(`/movies/${movieDetailsAvatar.id}$`))
})


// test('shows the TV list and opens TV details', async ({ page }) => {
//   await page.goto('/tv')

//   await expect(page.getByRole('heading', { name: 'Popular TV Shows' })).toBeVisible()
//   await page.getByRole('link', { name: `Open details for ${tvDetails.name}` }).click()

//   await expect(page).toHaveURL(new RegExp(`/tv/${tvDetails.id}$`))
//   await expect(page.getByRole('heading', { name: tvDetails.name })).toBeVisible()
//   await expect(page.getByText(tvDetails.tagline)).toBeVisible()
//   await expect(page.getByText(`${tvDetails.episode_run_time[0]}m`)).toBeVisible()
//   await expect(page.getByText(tvDetails.genres[0].name, { exact: true })).toBeVisible()
// })

// test('renders the not found page for unknown routes', async ({ page }) => {
//   await page.goto('/missing-page')

//   await expect(page.getByRole('heading', { name: 'Page Not Found' })).toBeVisible()
//   await expect(page.getByRole('link', { name: 'Return to the movies' })).toBeVisible()
// })
