import type { Meta, StoryObj } from '@storybook/react-vite'
import { type MovieDetails } from '../../../back-end/api-schemas'
import MovieDetailCard from './MovieDetailCard'

const baseMovie: MovieDetails = {
  id: 27205,
  title: 'Inception',
  release_date: '2010-07-16',
  vote_average: 8.2,
  poster_path: '/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg',
  backdrop_path: '/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  runtime: 148,
  overview: 'A skilled thief enters dreams to steal secrets and is offered one last chance at redemption.',
  genres: [
    { id: 878, name: 'Science Fiction' },
    { id: 28, name: 'Action' },
  ],
  tagline: 'Your mind is the scene of the crime.',
  original_title: 'Inception',
}

const meta = {
  title: 'Components/MovieDetailCard',
  component: MovieDetailCard,
  args: {
    movie: baseMovie,
  },
} satisfies Meta<typeof MovieDetailCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const MissingOptionalData: Story = {
  args: {
    movie: {
      ...baseMovie,
      backdrop_path: undefined,
      poster_path: undefined,
      release_date: undefined,
      runtime: undefined,
      genres: [],
      tagline: undefined,
      overview: '',
    },
  },
}
