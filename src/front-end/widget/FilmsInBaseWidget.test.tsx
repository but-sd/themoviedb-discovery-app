// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { FilmsInBaseWidget } from './FilmsInBaseWidget';

afterEach(cleanup);

describe('FilmsInBaseWidget', () => {
  it('renders the film count, top genres, and top countries', () => {
    // Arrange
    const widgetData = {
      moviesCount: 1420,
      topGenres: ['Action', 'Drame'],
      topCountries: ['France', 'Japon'],
    };

    // Act
    render(<FilmsInBaseWidget {...widgetData} />);

    // Assert: the dashboard displays all provided database statistics.
    expect(
      screen.getByRole('heading', { level: 3, name: 'Films en base' }),
    ).toBeTruthy();
    expect(screen.getByText('1420')).toBeTruthy();
    expect(screen.getByText('Films enregistrés')).toBeTruthy();
    expect(screen.getByText('Top Genres')).toBeTruthy();
    expect(screen.getByText('Action')).toBeTruthy();
    expect(screen.getByText('Drame')).toBeTruthy();
    expect(screen.getByText('Principaux pays')).toBeTruthy();
    expect(screen.getByText('France')).toBeTruthy();
    expect(screen.getByText('Japon')).toBeTruthy();
  });

  it('renders the loading state before the database data is available', () => {
    // Arrange and act
    render(<FilmsInBaseWidget isLoading />);

    // Assert: loading feedback is displayed instead of the statistics.
    expect(screen.getByText('Chargement en cours...')).toBeTruthy();
    expect(screen.queryByText('Films enregistrés')).toBeNull();
  });

  it('renders the empty state when no film is available', () => {
    // Arrange and act
    render(<FilmsInBaseWidget moviesCount={0} />);

    // Assert: the empty database message is displayed.
    expect(
      screen.getByText('Aucun film disponible pour le moment.'),
    ).toBeTruthy();
    expect(screen.queryByText('Films enregistrés')).toBeNull();
  });
});
