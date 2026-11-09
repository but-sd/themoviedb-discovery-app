import { describe, expect, it } from 'vitest';
import { parseGenresCsv } from './genre-csv.ts';

describe('genre-csv', () => {
  it('parses BOM, CRLF, reordered headers, quoted commas, and escaped quotes', () => {
    const csv =
      '\ufeffNAME,ID\r\n"Science, Fiction",878\r\n"He said ""hi""",99\r\n';

    expect(parseGenresCsv(csv)).toEqual([
      { id: 878, name: 'Science, Fiction' },
      { id: 99, name: 'He said "hi"' },
    ]);
  });

  it('ignores empty lines and accepts case-insensitive headers', () => {
    expect(parseGenresCsv('Id,NaMe\n\n18,Drama\n\n')).toEqual([
      { id: 18, name: 'Drama' },
    ]);
  });

  it('rejects invalid headers, rows, values, and CSV syntax', () => {
    expect(() => parseGenresCsv('')).toThrow(/header is missing/);
    expect(() => parseGenresCsv('id,title\n18,Drama')).toThrow(
      /expected id and name headers/,
    );
    expect(() => parseGenresCsv('id,name\nabc,Drama')).toThrow(
      /invalid positive id/,
    );
    expect(() => parseGenresCsv('id,name\n0,Drama')).toThrow(
      /invalid positive id/,
    );
    expect(() => parseGenresCsv('id,name\n9007199254740992,Drama')).toThrow(
      /invalid positive id/,
    );
    expect(() => parseGenresCsv('id,name\n18,')).toThrow(/empty name/);
    expect(() => parseGenresCsv('id,name\n18,"Drama')).toThrow(
      /Invalid genres CSV/,
    );
  });
});
