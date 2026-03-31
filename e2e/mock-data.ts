// This file contains mock data for movies and TV shows used in the end-to-end tests.
export type Movie = {
  id: number
  title: string
  release_date?: string
  vote_average: number
  poster_path?: string
}

// Mock data for the movie details page, including all relevant information about the movie such as title, original title, release date, vote average, poster path, backdrop path, runtime, tagline, overview, and genres.
export const movieDetailsAvatar = {
  id: 101,
  title: 'Avatar : De feu et de cendres',
  original_title: 'Avatar: Fire and Ash',
  release_date: '2024-04-12',
  vote_average: 7.4,
  poster_path: '/avatar.jpg',
  backdrop_path: '/avatar-backdrop.jpg',
  runtime: 127,
  tagline: 'Le monde de Pandora changera à jamais.',
  overview: 'Après la mort de Neteyam, Jake et Neytiri affrontent leur chagrin tout en faisant face au Peuple des Cendres, une tribu Na’vi redoutable menée par le fougueux Varang, alors que le conflit sur Pandora s’intensifie et qu’une nouvelle quête morale s’amorce.',
  genres: [
    { id: 18, name: 'Drama' },
    { id: 53, name: 'Thriller' },
  ],
}

export const moviesPageOne: Movie[] = [
  {
    id: movieDetailsAvatar.id,
    title: movieDetailsAvatar.title,
    release_date: movieDetailsAvatar.release_date,
    vote_average: movieDetailsAvatar.vote_average,
    poster_path: movieDetailsAvatar.poster_path,
  },
  {
    id: 102,
    title: 'Midnight on the Seine',
    release_date: '2023-09-01',
    vote_average: 6.9,
    poster_path: '/midnight-on-the-seine.jpg',
  },
]

export const moviesPageTwo: Movie[] = [
  {
    id: 103,
    title: 'Marseille Skies',
    release_date: '2022-02-17',
    vote_average: 8.1,
    poster_path: '/marseille-skies.jpg',
  },
]