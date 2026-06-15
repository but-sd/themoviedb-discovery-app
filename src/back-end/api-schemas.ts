import { z } from 'zod'

export const serviceEndpoints = [
  '/api/health',
  '/api/movies/popular',
  '/api/movies/genres',
  '/api/movies/:id',
  '/api/tv/popular',
  '/api/tv/:id',
] as const

export const ServiceInfoResponseSchema = z.object({
  service: z.string(),
  status: z.string(),
  version: z.string(),
  docs: z.string(),
  openapi: z.string(),
  endpoints: z.array(z.string()),
})

export const HealthResponseSchema = z.object({
  status: z.string(),
})

export const ErrorResponseSchema = z.object({
  error: z.string(),
  details: z.string().optional(),
})

export const GenreSchema = z.object({
  id: z.number(),
  name: z.string(),
})

export const ItemSchema = z.object({
  id: z.number(),
  title: z.string(),
  release_date: z.string().optional(),
  vote_average: z.number(),
  poster_path: z.string().optional(),
})

export const MovieItemSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  original_language: z.string(),
  original_title: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  release_date: z.string(),
  title: z.string(),
  video: z.boolean(),
  vote_average: z.number(),
  vote_count: z.number(),
})

export const TvItemSchema = z.object({
  adult: z.boolean(),
  backdrop_path: z.string().nullable(),
  genre_ids: z.array(z.number()),
  id: z.number(),
  origin_country: z.array(z.string()),
  original_language: z.string(),
  original_name: z.string(),
  overview: z.string(),
  popularity: z.number(),
  poster_path: z.string().nullable(),
  first_air_date: z.string(),
  name: z.string(),
  vote_average: z.number(),
  vote_count: z.number(),
})

export const MoviePopularResponseSchema = z.object({
  page: z.number(),
  results: z.array(MovieItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export const MovieGenresResponseSchema = z.object({
  genres: z.array(GenreSchema),
})

export const TvPopularResponseSchema = z.object({
  page: z.number(),
  results: z.array(TvItemSchema),
  total_pages: z.number(),
  total_results: z.number(),
})

export const MovieDetailsSchema = ItemSchema.extend({
  backdrop_path: z.string().optional(),
  overview: z.string().optional(),
  runtime: z.number().optional(),
  genres: z.array(GenreSchema).optional(),
  tagline: z.string().optional(),
  original_title: z.string().optional(),
})

export const TvShowDetailsSchema = ItemSchema.extend({
  name: z.string(),
  backdrop_path: z.string().optional(),
  overview: z.string().optional(),
  episode_run_time: z.array(z.number()).optional(),
  genres: z.array(GenreSchema).optional(),
  tagline: z.string().optional(),
  original_name: z.string().optional(),
  first_air_date: z.string().optional(),
})

export type Item = z.infer<typeof ItemSchema>
export type Genre = z.infer<typeof GenreSchema>
export type MovieItem = z.infer<typeof MovieItemSchema>
export type TvItem = z.infer<typeof TvItemSchema>
export type ServiceInfoResponse = z.infer<typeof ServiceInfoResponseSchema>
export type HealthResponse = z.infer<typeof HealthResponseSchema>
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
export type MoviePopularResponse = z.infer<typeof MoviePopularResponseSchema>
export type MovieGenresResponse = z.infer<typeof MovieGenresResponseSchema>
export type TvPopularResponse = z.infer<typeof TvPopularResponseSchema>
export type MovieDetails = z.infer<typeof MovieDetailsSchema>
export type TvShowDetails = z.infer<typeof TvShowDetailsSchema>
