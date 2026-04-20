import { expect, test } from '@playwright/test'

// Test case: Show the details of a movie using the details page URL
test('show the details of a movie using the details page URL', async ({ page }) => {
  // get the movie "Avatar" from the mock data
  const { movie101 } = await import('./mock-data')

  // Mock the api call before navigating
  await page.route(`**/api/movies/${movie101.id}?**`, async (route) => {
    // Respond a 200 status with the movie details in the body of the response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(movie101),
    })
  });

  // Navigate directly to the movie details page using the movie's ID
  await page.goto(`/movies/${movie101.id}`)

  // Assert that the URL is correct
  await expect(page).toHaveURL(new RegExp(`/movies/${movie101.id}$`))

  // Assert that title is an h1 heading and is visible
  await expect(page.getByRole('heading', { name: movie101.title })).toBeVisible()

  // Assert that the tagline is an h2 heading and is visible
  if (movie101.tagline) {
    await expect(page.getByRole('heading', { level: 2, name: movie101.tagline })).toBeVisible()
  }

  // Assert that the original title is visible if they exist in the mock data
  if (movie101.original_title) {
    await expect(page.getByText(movie101.original_title)).toBeVisible()
  }

  // Assert that optional fields are visible if they exist in the mock data
  if (movie101.overview) {
    await expect(page.getByText(movie101.overview)).toBeVisible()
  }
})
