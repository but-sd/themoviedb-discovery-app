import { type Item } from "../../Types"
import './ItemCard.css'

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w342'

type ItemCardProps = Readonly<{
  item: Item
  href?: string
}>

export default function ItemCard({ item, href }: ItemCardProps) {
  const releaseYear = item.release_date?.slice(0, 4) ?? 'N/A'
  const posterSrc = item.poster_path ? `${IMAGE_BASE_URL}${item.poster_path}` : null

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

  if (!href) {
    return content
  }

  return (
    <a className="item-card-link" href={href} aria-label={`Open details for ${item.title}`}>
      {content}
    </a>
  )
}
