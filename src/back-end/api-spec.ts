import type { Express } from 'express'
import swaggerUi from 'swagger-ui-express'

export const OPENAPI_SPEC = {
  openapi: '3.1.0',
  info: {
    title: 'MovieDB Discovery Backend API',
    version: '1.0.0',
    description: 'API specification for health, movie, and TV discovery endpoints.',
  },
  servers: [{ url: '/' }],
  paths: {
    '/': {
      get: {
        tags: ['System'],
        summary: 'Service information',
        responses: {
          '200': {
            description: 'Service metadata and useful links',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ServiceInfoResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'Server is healthy',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/HealthResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/movies/popular': {
      get: {
        tags: ['Movies'],
        summary: 'Get popular movies',
        parameters: [
          {
            name: 'language',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'fr-FR' },
          },
          {
            name: 'region',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'FR' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'string', default: '1' },
          },
        ],
        responses: {
          '200': {
            description: 'Popular movies from TMDB',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MoviePopularResponse',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          default: {
            description: 'TMDB upstream error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/movies/{id}': {
      get: {
        tags: ['Movies'],
        summary: 'Get movie details by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'language',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'fr-FR' },
          },
        ],
        responses: {
          '200': {
            description: 'Movie details from TMDB',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MovieDetails',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          default: {
            description: 'TMDB upstream error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/tv/popular': {
      get: {
        tags: ['TV'],
        summary: 'Get popular TV shows',
        parameters: [
          {
            name: 'language',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'fr-FR' },
          },
          {
            name: 'region',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'FR' },
          },
          {
            name: 'page',
            in: 'query',
            required: false,
            schema: { type: 'string', default: '1' },
          },
        ],
        responses: {
          '200': {
            description: 'Popular TV shows from TMDB',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TvPopularResponse',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          default: {
            description: 'TMDB upstream error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
    '/api/tv/{id}': {
      get: {
        tags: ['TV'],
        summary: 'Get TV show details by ID',
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string' },
          },
          {
            name: 'language',
            in: 'query',
            required: false,
            schema: { type: 'string', default: 'fr-FR' },
          },
        ],
        responses: {
          '200': {
            description: 'TV show details from TMDB',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/TvShowDetails',
                },
              },
            },
          },
          '500': {
            description: 'Server error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
          default: {
            description: 'TMDB upstream error',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ErrorResponse',
                },
              },
            },
          },
        },
      },
    },
  },
  components: {
    schemas: {
      ServiceInfoResponse: {
        type: 'object',
        required: ['service', 'status', 'version', 'docs', 'openapi', 'endpoints'],
        properties: {
          service: { type: 'string', example: 'themoviedb-discovery-backend' },
          status: { type: 'string', example: 'ok' },
          version: { type: 'string', example: '1.0.0' },
          docs: { type: 'string', example: '/api/docs' },
          openapi: { type: 'string', example: '/openapi.json' },
          endpoints: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
      HealthResponse: {
        type: 'object',
        required: ['status'],
        properties: {
          status: { type: 'string', example: 'ok' },
        },
      },
      ErrorResponse: {
        type: 'object',
        required: ['error'],
        properties: {
          error: { type: 'string' },
          details: { type: 'string' },
        },
      },
      Genre: {
        type: 'object',
        required: ['id', 'name'],
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
        },
      },
      Item: {
        type: 'object',
        required: ['id', 'title', 'vote_average'],
        properties: {
          id: { type: 'number' },
          title: { type: 'string' },
          release_date: { type: 'string' },
          vote_average: { type: 'number' },
          poster_path: { type: 'string' },
        },
      },
      MovieItem: {
        type: 'object',
        required: [
          'adult',
          'backdrop_path',
          'genre_ids',
          'id',
          'original_language',
          'original_title',
          'overview',
          'popularity',
          'poster_path',
          'release_date',
          'title',
          'video',
          'vote_average',
          'vote_count',
        ],
        properties: {
          adult: { type: 'boolean' },
          backdrop_path: { type: ['string', 'null'] },
          genre_ids: { type: 'array', items: { type: 'number' } },
          id: { type: 'number' },
          original_language: { type: 'string' },
          original_title: { type: 'string' },
          overview: { type: 'string' },
          popularity: { type: 'number' },
          poster_path: { type: ['string', 'null'] },
          release_date: { type: 'string' },
          title: { type: 'string' },
          video: { type: 'boolean' },
          vote_average: { type: 'number' },
          vote_count: { type: 'number' },
        },
      },
      TvItem: {
        type: 'object',
        required: [
          'adult',
          'backdrop_path',
          'genre_ids',
          'id',
          'origin_country',
          'original_language',
          'original_name',
          'overview',
          'popularity',
          'poster_path',
          'first_air_date',
          'name',
          'vote_average',
          'vote_count',
        ],
        properties: {
          adult: { type: 'boolean' },
          backdrop_path: { type: ['string', 'null'] },
          genre_ids: { type: 'array', items: { type: 'number' } },
          id: { type: 'number' },
          origin_country: { type: 'array', items: { type: 'string' } },
          original_language: { type: 'string' },
          original_name: { type: 'string' },
          overview: { type: 'string' },
          popularity: { type: 'number' },
          poster_path: { type: ['string', 'null'] },
          first_air_date: { type: 'string' },
          name: { type: 'string' },
          vote_average: { type: 'number' },
          vote_count: { type: 'number' },
        },
      },
      MoviePopularResponse: {
        type: 'object',
        required: ['page', 'results', 'total_pages', 'total_results'],
        properties: {
          page: { type: 'number' },
          results: {
            type: 'array',
            items: { $ref: '#/components/schemas/MovieItem' },
          },
          total_pages: { type: 'number' },
          total_results: { type: 'number' },
        },
      },
      TvPopularResponse: {
        type: 'object',
        required: ['page', 'results', 'total_pages', 'total_results'],
        properties: {
          page: { type: 'number' },
          results: {
            type: 'array',
            items: { $ref: '#/components/schemas/TvItem' },
          },
          total_pages: { type: 'number' },
          total_results: { type: 'number' },
        },
      },
      MovieDetails: {
        allOf: [
          { $ref: '#/components/schemas/Item' },
          {
            type: 'object',
            properties: {
              backdrop_path: { type: 'string' },
              overview: { type: 'string' },
              runtime: { type: 'number' },
              genres: {
                type: 'array',
                items: { $ref: '#/components/schemas/Genre' },
              },
              tagline: { type: 'string' },
              original_title: { type: 'string' },
            },
          },
        ],
      },
      TvShowDetails: {
        allOf: [
          { $ref: '#/components/schemas/Item' },
          {
            type: 'object',
            required: ['name'],
            properties: {
              name: { type: 'string' },
              backdrop_path: { type: 'string' },
              overview: { type: 'string' },
              episode_run_time: { type: 'array', items: { type: 'number' } },
              genres: {
                type: 'array',
                items: { $ref: '#/components/schemas/Genre' },
              },
              tagline: { type: 'string' },
              original_name: { type: 'string' },
              first_air_date: { type: 'string' },
            },
          },
        ],
      },
    },
  },
} as const

export function registerApiSpec(app: Express): void {
  app.get('/openapi.json', (_req, res) => {
    res.json(OPENAPI_SPEC)
  })

  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(OPENAPI_SPEC))
}
