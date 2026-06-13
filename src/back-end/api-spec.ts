import type { Express } from 'express'
import { OpenAPIRegistry, OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi'
import { z } from 'zod'
import swaggerUi from 'swagger-ui-express'
import {
  ErrorResponseSchema,
  HealthResponseSchema,
  MovieDetailsSchema,
  MoviePopularResponseSchema,
  ServiceInfoResponseSchema,
  TvPopularResponseSchema,
  TvShowDetailsSchema,
} from './api-schemas'

const registry = new OpenAPIRegistry()

const ServiceInfoResponse = ServiceInfoResponseSchema.meta({ id: 'ServiceInfoResponse' })
const HealthResponse = HealthResponseSchema.meta({ id: 'HealthResponse' })
const ErrorResponse = ErrorResponseSchema.meta({ id: 'ErrorResponse' })
const MoviePopularResponse = MoviePopularResponseSchema.meta({ id: 'MoviePopularResponse' })
const TvPopularResponse = TvPopularResponseSchema.meta({ id: 'TvPopularResponse' })
const MovieDetails = MovieDetailsSchema.meta({ id: 'MovieDetails' })
const TvShowDetails = TvShowDetailsSchema.meta({ id: 'TvShowDetails' })
const OpenApiDocumentResponse = z.object({ openapi: z.string() }).passthrough().meta({ id: 'OpenApiDocumentResponse' })

const popularQuerySchema = z.object({
  language: z.string().optional().default('fr-FR'),
  region: z.string().optional().default('FR'),
  page: z.string().optional().default('1'),
})

const detailsQuerySchema = z.object({
  language: z.string().optional().default('fr-FR'),
})

registry.registerPath({
  method: 'get',
  path: '/',
  tags: ['System'],
  summary: 'Service information',
  operationId: 'getServiceInfo',
  responses: {
    200: {
      description: 'Service metadata and useful links',
      content: {
        'application/json': {
          schema: ServiceInfoResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/health',
  tags: ['System'],
  summary: 'Health check',
  operationId: 'getHealth',
  responses: {
    200: {
      description: 'Server is healthy',
      content: {
        'application/json': {
          schema: HealthResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/openapi.json',
  tags: ['System'],
  summary: 'Get OpenAPI JSON',
  operationId: 'getOpenApiJson',
  responses: {
    200: {
      description: 'OpenAPI 3.1 JSON document',
      content: {
        'application/json': {
          schema: OpenApiDocumentResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/movies/popular',
  tags: ['Movies'],
  summary: 'Get popular movies',
  operationId: 'getPopularMovies',
  request: {
    query: popularQuerySchema,
  },
  responses: {
    200: {
      description: 'Popular movies from TMDB',
      content: {
        'application/json': {
          schema: MoviePopularResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    default: {
      description: 'TMDB upstream error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/movies/{id}',
  tags: ['Movies'],
  summary: 'Get movie details by ID',
  operationId: 'getMovieDetails',
  request: {
    params: z.object({
      id: z.string(),
    }),
    query: detailsQuerySchema,
  },
  responses: {
    200: {
      description: 'Movie details from TMDB',
      content: {
        'application/json': {
          schema: MovieDetails,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    default: {
      description: 'TMDB upstream error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/tv/popular',
  tags: ['TV'],
  summary: 'Get popular TV shows',
  operationId: 'getPopularTvShows',
  request: {
    query: popularQuerySchema,
  },
  responses: {
    200: {
      description: 'Popular TV shows from TMDB',
      content: {
        'application/json': {
          schema: TvPopularResponse,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    default: {
      description: 'TMDB upstream error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
})

registry.registerPath({
  method: 'get',
  path: '/api/tv/{id}',
  tags: ['TV'],
  summary: 'Get TV show details by ID',
  operationId: 'getTvShowDetails',
  request: {
    params: z.object({
      id: z.string(),
    }),
    query: detailsQuerySchema,
  },
  responses: {
    200: {
      description: 'TV show details from TMDB',
      content: {
        'application/json': {
          schema: TvShowDetails,
        },
      },
    },
    500: {
      description: 'Server error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
    default: {
      description: 'TMDB upstream error',
      content: {
        'application/json': {
          schema: ErrorResponse,
        },
      },
    },
  },
})

const generator = new OpenApiGeneratorV31(registry.definitions)

export const OPENAPI_SPEC = generator.generateDocument({
  openapi: '3.1.0',
  info: {
    title: 'MovieDB Discovery Backend API',
    version: '1.0.0',
    description: 'API specification for health, movie, and TV discovery endpoints.',
  },
  servers: [{ url: '/' }],
})

export function registerApiSpec(app: Express): void {
  app.get('/openapi.json', (_req, res) => {
    res.json(OPENAPI_SPEC)
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPEC))
}
