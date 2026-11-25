// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';
import DashboardPage from './DashboardPage';

afterEach(cleanup);

describe('DashboardPage', () => {
  it('shows the dashboard empty state without widgets', () => {
    // Arrange
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>,
    );

    // Act
    const dashboardHeading = screen.getByRole('heading', {
      level: 1,
      name: 'Tableau de bord des films',
    });
    const emptyState = screen.getByRole('region', {
      name: 'Votre tableau de bord est prêt',
    });

    // Assert
    expect(dashboardHeading).toBeTruthy();
    expect(
      screen.getByText('Aucun widget configuré', { exact: true }),
    ).toBeTruthy();
    expect(emptyState).toBeTruthy();
    expect(screen.queryByRole('article')).toBeNull();
    expect(
      screen
        .getByRole('link', { name: 'Explorer les films populaires' })
        .getAttribute('href'),
    ).toBe('/movies');
  });
});
