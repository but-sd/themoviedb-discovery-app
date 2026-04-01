import { expect, test } from '@playwright/test'

// Test case: Show the details of a movie using the details page URL
test('show the details of a movie using the details page URL', async ({ page }) => {
  // get the movie "Avatar" from the mock data
  const { movieDetailsAvatar } = await import('./mock-data')

  // Mock the api call before navigating
  await page.route(`**/api/movies/${movieDetailsAvatar.id}?**`, async (route) => {
    // Respond a 200 status with the movie details in the body of the response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(movieDetailsAvatar),
    })
  });

  // Navigate directly to the movie details page using the movie's ID
  await page.goto(`/movies/${movieDetailsAvatar.id}`)

  // Assert that the URL is correct
  await expect(page).toHaveURL(new RegExp(`/movies/${movieDetailsAvatar.id}$`))

  // Assert that title is an h1 heading and is visible
  await expect(page.getByRole('heading', { name: movieDetailsAvatar.title })).toBeVisible()

  // Assert that the original title
  await expect(page.getByText(movieDetailsAvatar.original_title)).toBeVisible()

  // Assert that optional fields are visible if they exist in the mock data
  if (movieDetailsAvatar.overview) {
    await expect(page.getByText(movieDetailsAvatar.overview)).toBeVisible()
  }
})
