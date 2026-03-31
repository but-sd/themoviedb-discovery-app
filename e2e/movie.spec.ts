import { expect, test } from '@playwright/test'

import { mockMovieDetailsApi } from './mock-api'
import { movieDetailsAvatar } from './mock-data'

// This test verifies that the details page correctly displays the information of a movie when accessed directly via its URL. It mocks the API response for the movie details and checks that the relevant information is visible on the page.
test.beforeEach(async ({ page }) => {
  await mockMovieDetailsApi(page)
})

// Test case: Show the details of a movie using the details page URL
test('show the details of a movie using the details page URL', async ({ page }) => {
  // Navigate directly to the movie details page using the movie's ID
  await page.goto(`/movies/${movieDetailsAvatar.id}`)

  // Assert that the URL is correct
  await expect(page).toHaveURL(new RegExp(`/movies/${movieDetailsAvatar.id}$`))

  // Assert that title is an h1 heading and is visible
  await expect(page.getByRole('heading', { name: movieDetailsAvatar.title })).toBeVisible()

  // Assert that the original title, overview, and tagline are visible on the page
  await expect(page.getByText(movieDetailsAvatar.original_title)).toBeVisible()
  await expect(page.getByText(movieDetailsAvatar.overview)).toBeVisible()
  await expect(page.getByText(movieDetailsAvatar.tagline)).toBeVisible()
})
