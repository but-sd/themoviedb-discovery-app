// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import MoviesInDatabaseWidget from './MoviesInDatabaseWidget';

afterEach(cleanup);

describe('MoviesInDatabaseWidget', () => {
  it('renders the loading state accessibly', () => {
    // Arrange and act
    render(<MoviesInDatabaseWidget state={{ status: 'loading' }} />);

    // Assert: the widget announces loading and marks itself busy.
    expect(screen.getByRole('heading', { name: 'Films en base' })).toBeTruthy();
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('true');
  });

  it('renders an empty state when the database has no movies', () => {
    // Arrange and act
    render(<MoviesInDatabaseWidget state={{ status: 'ready', count: 0 }} />);

    // Assert: users receive a clear empty-state message.
    expect(
      screen.getByText("Aucun film n'est enregistré pour le moment."),
    ).toBeTruthy();
    expect(screen.getByRole('article').getAttribute('aria-busy')).toBe('false');
  });

  it('renders a localized movie count with singular and plural labels', () => {
    // Arrange and act
    const { rerender } = render(
      <MoviesInDatabaseWidget state={{ status: 'ready', count: 1234 }} />,
    );

    // Assert: the count is localized and the plural label is correct.
    expect(screen.getByRole('status').textContent).toContain('1\u202f234');
    expect(screen.getByText('films enregistrés')).toBeTruthy();

    // Act
    rerender(<MoviesInDatabaseWidget state={{ status: 'ready', count: 1 }} />);

    // Assert: a single movie uses the singular label.
    expect(screen.getByText('1', { selector: 'strong' })).toBeTruthy();
    expect(screen.getByText('film enregistré')).toBeTruthy();
  });

  it('renders an error state when the count cannot be loaded', () => {
    // Arrange and act
    render(<MoviesInDatabaseWidget state={{ status: 'error' }} />);

    // Assert: the error is announced to assistive technology.
    expect(screen.getByRole('alert').textContent).toContain(
      'Impossible de charger',
    );
  });
});
