import type { Express, Request, Response } from 'express';
import { tmdbAccessToken } from '../utils/config';
import { toSupportedMovie } from '../utils/converter';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_PAGE,
  DEFAULT_REGION,
} from '../utils/constants';
import type {
  MoviesApiResponse,
  TmdbMoviesRawResponse,
} from '../types/MoviesTypes';

function getOptionalQueryString(value: unknown, defaultValue: string): string {
  return typeof value === 'string' && value.length > 0 ? value : defaultValue;
}

/**
 * Registers the TMDB movie discovery route.
 * @param app - The Express application instance.
 */
export function registerDiscoverApi(app: Express): void {
  app.get(
    '/api/discover/movies',
    async (req: Request, res: Response): Promise<void> => {
      const { year } = req.query;
      if (
        typeof year !== 'string' ||
        !/^\d{4}$/.test(year) ||
        Number(year) < 1000 ||
        Number(year) > 9999
      ) {
        res.status(400).json({
          error:
            'Invalid or missing year. Expected a four-digit year between 1000 and 9999.',
        });
        return;
      }

      const queryParams = new URLSearchParams({
        primary_release_year: year,
        language: getOptionalQueryString(req.query.language, DEFAULT_LANGUAGE),
        page: getOptionalQueryString(req.query.page, String(DEFAULT_PAGE)),
        region: getOptionalQueryString(req.query.region, DEFAULT_REGION),
      });

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/discover/movie?${queryParams.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${tmdbAccessToken}`,
              'Content-Type': 'application/json;charset=utf-8',
            },
          },
        );

        if (!response.ok) {
          throw new Error(
            `TMDB API request failed with status ${response.status}`,
          );
        }

        const rawData = (await response.json()) as TmdbMoviesRawResponse;
        const data: MoviesApiResponse = {
          page: rawData.page,
          results: rawData.results.map((movie) => toSupportedMovie(movie)),
          total_pages: rawData.total_pages,
          total_results: rawData.total_results,
        };

        res.json(data);
      } catch (error) {
        console.error('Error discovering movies:', error);
        res.status(500).json({ error: 'Failed to discover movies' });
      }
    },
  );
}
