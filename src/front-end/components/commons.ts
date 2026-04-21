// Base URL for fetching hero images from TMDb with a width of 780 pixels. This size is chosen to provide a high-quality image for the movie detail page while balancing loading performance.
export const DETAIL_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w780'

/**
 * Formats a runtime in minutes into a human-readable string format. If the runtime is less than an hour, it returns the number of minutes followed by 'm'. If the runtime is an hour or more, it returns the number of hours followed by 'h' and the remaining minutes in 'mm' format. If the runtime is not provided, it returns 'Runtime unavailable'.
 * @param runtime The runtime in minutes.
 * @returns A formatted string representing the runtime.
 */
export function formatRuntime(runtime?: number): string {
  if (!runtime) {
    return 'Runtime unavailable'
  }

  const hours = Math.floor(runtime / 60)
  const minutes = runtime % 60

  if (hours === 0) {
    return `${minutes}m`
  }

  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

