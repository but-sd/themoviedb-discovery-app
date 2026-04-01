import { expect, test } from '@playwright/test'

// Test case: Show the details of a movie using the details page URL
test('show the details of a movie using the details page URL when not mocked', async ({ page }) => {
  
  // Navigate directly to the movie details page using the movie's ID
  await page.goto(`/movies/83533`)

  // Assert that the URL is correct
  await expect(page).toHaveURL(new RegExp(`/movies/83533$`))

  // Assert that title is an h1 heading and is visible
  await expect(page.getByRole('heading', { level: 1, name: 'Avatar : De feu et de cendres' })).toBeVisible()

  // Assert that the tagline is an h2 heading and is visible
  await expect(page.getByRole('heading', { level: 2, name: 'Le monde de Pandora changera à jamais.' })).toBeVisible()
})
