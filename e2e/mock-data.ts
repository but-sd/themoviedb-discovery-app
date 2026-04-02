// This file contains mock data for movies and TV shows used in the end-to-end tests.
export type Movie = {
  id: number
  title: string
  release_date?: string
  vote_average: number
  poster_path?: string
}

export type MovieDetails = Movie & {
  original_title: string
  backdrop_path?: string
  runtime?: number
  tagline?: string
  overview?: string
  genres: { id: number; name: string }[]
}

// Mock data for the movie details page, including all relevant information about the movie such as title, original title, release date, vote average, poster path, backdrop path, runtime, tagline, overview, and genres.
export const movie101: MovieDetails = {
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

export const movieDetailsLaFemmeDeMenage: MovieDetails = {
  id: 102,
  title: 'La Femme de Ménage',
  original_title: 'The Housemaid',
  release_date: '2024-03-15',
  vote_average: 6.8,
  poster_path: '/la-femme-de-menage.jpg',
  backdrop_path: '/la-femme-de-menage-backdrop.jpg',
  runtime: 110,
  tagline: 'Découvrez ce qui se cache derrière les portes closes.',
  overview: 'En quête d’un nouveau départ, Millie accepte un poste de femme de ménage à demeure chez Nina et Andrew Winchester, un couple aussi riche qu’énigmatique. Ce qui s’annonce comme l’emploi idéal se transforme rapidement en un jeu dangereux, mêlant séduction, secrets et manipulations. Derrière les portes closes du manoir Winchester se cache un monde de faux-semblants et de révélations inattendues... Un tourbillon de suspense et de scandales qui vous tiendra en haleine jusqu’à la dernière seconde.',
  genres: [
    { id: 80, name: 'Mystère' },
    { id: 18, name: 'Thriller' },
  ],
}

export const movieDetailsScream7: MovieDetails = {
  id: 103,
  title: 'Scream 7',
  original_title: 'Scream 7',
  release_date: '2024-01-25',
  vote_average: 5.2,
  poster_path: '/scream-7.jpg',
  backdrop_path: '/scream-7-backdrop.jpg',
  runtime: 95,
  tagline: 'Tout doit brûler.',
  overview: 'Lorsqu’un nouveau Ghostface surgit dans la paisible ville où Sidney Prescott a reconstruit sa vie, ses pires cauchemars refont surface. Alors que sa fille devient la prochaine cible, Sidney n’a d’autre choix que de reprendre le combat. Déterminée à protéger les siens, elle doit alors affronter les démons de son passé pour tenter de mettre fin une bonne fois pour toutes au bain de sang.',
  genres: [
    { id: 27, name: 'Horreur' },
    { id: 53, name: 'Mystère' },
    { id: 80, name: 'Crime' },
  ],
}

export const moviesPageOne: Movie[] = [
  {
    id: movie101.id,
    title: movie101.title,
    release_date: movie101.release_date,
    vote_average: movie101.vote_average,
    poster_path: movie101.poster_path,
  },
  {
    id: movieDetailsLaFemmeDeMenage.id,
    title: movieDetailsLaFemmeDeMenage.title,
    release_date: movieDetailsLaFemmeDeMenage.release_date,
    vote_average: movieDetailsLaFemmeDeMenage.vote_average,
    poster_path: movieDetailsLaFemmeDeMenage.poster_path,
  },
]

export const moviesPageTwo: Movie[] = [
  {
    id: movieDetailsScream7.id,
    title: movieDetailsScream7.title,
    release_date: movieDetailsScream7.release_date,
    vote_average: movieDetailsScream7.vote_average,
    poster_path: movieDetailsScream7.poster_path,
  },
]