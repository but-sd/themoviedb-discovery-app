import type { Meta, StoryObj } from '@storybook/react-vite'
import { MemoryRouter } from 'react-router-dom'
import { type MovieItem } from '../../../back-end/api-schemas'
import MovieItemCard from './MovieItemCard'

const STORY_CARD_WIDTH = 228

const baseMovie: MovieItem = {
  adult: false,
  backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  genre_ids: [878, 28],
  id: 27205,
  original_language: 'en',
  original_title: 'Inception',
  overview:
    'A skilled thief enters dreams to steal secrets and is offered one last chance at redemption.',
  popularity: 87.4,
  poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  release_date: '2010-07-16',
  title: 'Inception',
  video: false,
  vote_average: 8.2,
  vote_count: 36789,
}

const meta = {
  title: 'Components/MovieItemCard',
  component: MovieItemCard,
  decorators: [
    (Story) => (
      <MemoryRouter>
        <div style={{ width: `${STORY_CARD_WIDTH}px`, maxWidth: '100%' }}>
          <Story />
        </div>
      </MemoryRouter>
    ),
  ],
  args: {
    movie: baseMovie,
  },
} satisfies Meta<typeof MovieItemCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MissingPoster: Story = {
  args: {
    movie: {
      ...baseMovie,
      poster_path: null,
    },
  },
}
