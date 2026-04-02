import { expect, test } from '@playwright/test'

// Test case: Show the details of a tv show using the details page URL
test('show the details of a tv show using the details page URL', async ({ page }) => {
  // get the tv show "Dexter" from the mock data
  const { tvShow201 } = await import('./mock-data')

  // Mock the api call before navigating
  await page.route(`**/api/tv/${tvShow201.id}?**`, async (route) => {
    // Respond a 200 status with the tv show details in the body of the response
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(tvShow201),
    })
  });

  // Navigate directly to the tv show details page using the tv show's ID
  await page.goto(`/tv/${tvShow201.id}`)

  // Assert that the URL is correct
  await expect(page).toHaveURL(new RegExp(`/tv/${tvShow201.id}$`))

  // Assert that title is an h1 heading and is visible
  await expect(page.getByRole('heading', { name: tvShow201.name })).toBeVisible()

  // Assert that the tagline is an h2 heading and is visible
  if (tvShow201.tagline) {
    await expect(page.getByRole('heading', { level: 2, name: tvShow201.tagline })).toBeVisible()
  }

  // Assert that optional fields are visible if they exist in the mock data
  if (tvShow201.overview) {
    await expect(page.getByText(tvShow201.overview)).toBeVisible()
  }
})
