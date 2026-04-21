import { type Item } from "../../Types"
import './ItemCard.css'

// Base URL for fetching poster images from TMDb with a width of 342 pixels. This size is a good balance between quality and loading performance for item cards.
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'

// Props for the ItemCard component, which includes an Item object and a required href for linking to a details page.
type ItemCardProps = Readonly<{
  item: Item
  href: string
}>

/**
 * ItemCard component displays a card with the poster, title, release year, and rating of a movie or TV show. The entire card is a clickable link to the details page.
 * @param param0 Props for the ItemCard component.
 * @returns JSX.Element representing the item card.
 */
export default function ItemCard({ item, href }: ItemCardProps) {
  // Extract the release year from the release_date string. If release_date is not available, default to 'N/A'.
  const releaseYear = item.release_date?.slice(0, 4) ?? 'N/A'

  // Construct the full URL for the poster image if a poster path is available. If not, posterSrc will be null, and a placeholder will be shown instead.
  const posterSrc = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null

  // The content of the card includes the poster image (or a placeholder if no poster is available), the title of the item, and a meta line showing the release year and average rating. The poster image has an alt text for accessibility, and if no poster is available, a placeholder div is shown instead.
  const content = (
    <article className="item-card">
      {posterSrc ? (
        <img src={posterSrc} alt={`Poster for ${item.title}`} className="movie-poster" />
      ) : (
        <div className="movie-poster movie-poster-placeholder" aria-hidden="true" />
      )}

      <div className="movie-copy">
        <h2>{item.title}</h2>
        <p className="movie-meta">{releaseYear} · Rating {item.vote_average.toFixed(1)}</p>
      </div>
    </article>
  )

  // The entire card is wrapped in an anchor tag to make it clickable, linking to the details page for the item. An aria-label is provided for accessibility to describe the link's purpose.
  return (
    <a className="item-card-link" href={href} aria-label={`Open details for ${item.title}`}>
      {content}
    </a>
  )
}
