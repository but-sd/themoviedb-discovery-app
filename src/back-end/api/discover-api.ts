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

const DISCOVER_MOVIES_URL = 'https://api.themoviedb.org/3/discover/movie';

function getQueryString(
  query: Request['query'],
  key: 'language' | 'page' | 'region',
  defaultValue: string,
): string {
  const value = query[key];
  return typeof value === 'string' && value !== '' ? value : defaultValue;
}

function getYear(query: Request['query']): string {
  const year = query.year;
  if (typeof year !== 'string' || !/^\d{4}$/.test(year)) {
    throw new Error('The year query parameter must be a four-digit year');
  }
  return year;
}

export function registerDiscoverApi(app: Express): void {
  app.get(
    '/api/discover/movies',
    async (req: Request, res: Response): Promise<void> => {
      let year: string;
      try {
        year = getYear(req.query);
      } catch {
        res.status(400).json({
          error: 'The year query parameter must be a four-digit year',
        });
        return;
      }

      const queryParams = new URLSearchParams({
        primary_release_year: year,
        language: getQueryString(req.query, 'language', DEFAULT_LANGUAGE),
        page: getQueryString(req.query, 'page', String(DEFAULT_PAGE)),
        region: getQueryString(req.query, 'region', DEFAULT_REGION),
      });

      try {
        const response = await fetch(
          `${DISCOVER_MOVIES_URL}?${queryParams.toString()}`,
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
