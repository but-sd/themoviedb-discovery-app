import { parse } from 'csv-parse/sync';
import type { Genre } from '../types/MoviesTypes';

const REQUIRED_HEADERS = ['id', 'name'] as const;

/**
 * Parses and validates a genres CSV document.
 */
export function parseGenresCsv(csv: string): Genre[] {
  const rows = parse(csv, {
    bom: true,
    skip_empty_lines: true,
    relax_column_count: false,
  }) as unknown[][];

  if (rows.length === 0) {
    throw new Error('Genres CSV must contain a header row');
  }

  const headers = rows[0].map((header) => String(header).toLowerCase());
  if (
    headers.length !== REQUIRED_HEADERS.length ||
    [...REQUIRED_HEADERS].some((header) => !headers.includes(header))
  ) {
    throw new Error('Genres CSV headers must be exactly id and name');
  }

  const idIndex = headers.indexOf('id');
  const nameIndex = headers.indexOf('name');

  return rows.slice(1).map((row, rowIndex) => {
    const idValue = String(row[idIndex]).trim();
    const name = String(row[nameIndex]).trim();

    if (!/^[1-9]\d*$/.test(idValue)) {
      throw new Error(
        `Invalid genre id at CSV row ${rowIndex + 2}: expected a positive safe integer`,
      );
    }

    const id = Number(idValue);
    if (!Number.isSafeInteger(id)) {
      throw new Error(
        `Invalid genre id at CSV row ${rowIndex + 2}: expected a positive safe integer`,
      );
    }

    if (name.length === 0) {
      throw new Error(
        `Invalid genre name at CSV row ${rowIndex + 2}: name must not be empty`,
      );
    }

    return { id, name };
  });
}
