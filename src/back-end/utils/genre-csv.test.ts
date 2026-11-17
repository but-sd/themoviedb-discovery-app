import { describe, expect, it } from 'vitest';
import { parseGenresCsv } from './genre-csv';

describe('parseGenresCsv', () => {
  it('parses headers in any order and without case sensitivity', () => {
    // Arrange
    const csv = 'NAME,ID\r\n"Science, Fiction",878\r\n';

    // Act
    const genres = parseGenresCsv(csv);

    // Assert
    expect(genres).toEqual([{ id: 878, name: 'Science, Fiction' }]);
  });

  it('supports UTF-8 BOM, escaped quotes, and ignores empty lines', () => {
    // Arrange
    const csv = '\uFEFFid,name\n\n28,"Action ""classic"""\n\n';

    // Act
    const genres = parseGenresCsv(csv);

    // Assert
    expect(genres).toEqual([{ id: 28, name: 'Action "classic"' }]);
  });

  it('rejects a missing, extra, or invalid header', () => {
    // Arrange
    const invalidCsvDocuments = [
      '',
      'id\n28',
      'id,name,extra\n28,Action,value',
      'genre_id,label\n28,Action',
      ' id,name\n28,Action',
    ];

    // Act and assert
    for (const csv of invalidCsvDocuments) {
      expect(() => parseGenresCsv(csv)).toThrow(
        /Genres CSV (must contain a header row|headers must be exactly id and name)/,
      );
    }
  });

  it('rejects invalid identifiers and empty names', () => {
    // Arrange
    const invalidRows = [
      'id,name\n0,Action',
      'id,name\n-1,Action',
      'id,name\n1.5,Action',
      'id,name\n9007199254740992,Action',
      'id,name\n28,',
    ];

    // Act and assert
    for (const csv of invalidRows) {
      expect(() => parseGenresCsv(csv)).toThrow();
    }
  });

  it('propagates malformed CSV syntax errors', () => {
    // Arrange
    const malformedCsv = 'id,name\n28,"Action';

    // Act and assert
    expect(() => parseGenresCsv(malformedCsv)).toThrow();
  });
});
