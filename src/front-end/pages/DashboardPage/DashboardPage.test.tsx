// @vitest-environment jsdom

import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import DashboardPage from './DashboardPage';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('DashboardPage', () => {
  it('loads and displays the movie count widget', async () => {
    // Arrange: return a populated movie-count response from the API.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({ count: 42 }),
    });
    vi.stubGlobal('fetch', fetchMock);

    // Act
    render(<DashboardPage />);

    // Assert: the loading state transitions to the count returned by the API.
    expect(screen.getByRole('status').textContent).toContain('Chargement');
    expect(
      await screen.findByRole('heading', { name: 'Films en base' }),
    ).toBeTruthy();
    expect(screen.getByText('42', { selector: 'strong' })).toBeTruthy();
    expect(fetchMock).toHaveBeenCalledWith('/api/movies/count');
  });

  it('shows an error when the count API fails', async () => {
    // Arrange: make the API return an unsuccessful response.
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      json: vi.fn(),
    });
    vi.stubGlobal('fetch', fetchMock);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    // Act
    render(<DashboardPage />);

    // Assert: the widget displays an accessible error and logs the failure.
    expect((await screen.findByRole('alert')).textContent).toContain(
      'Impossible de charger',
    );
    expect(errorSpy).toHaveBeenCalledOnce();
  });

  it.each([
    ['null response', null],
    ['missing count', {}],
    ['non-numeric count', { count: '3' }],
    ['fractional count', { count: 1.5 }],
    ['negative count', { count: -1 }],
  ])(
    'shows an error for an invalid count response: %s',
    async (_label, data) => {
      // Arrange: return data that does not match the movie-count API contract.
      vi.stubGlobal(
        'fetch',
        vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          json: vi.fn().mockResolvedValue(data),
        }),
      );
      vi.spyOn(console, 'error').mockImplementation(() => {});

      // Act
      render(<DashboardPage />);

      // Assert: malformed counts are not displayed as successful values.
      expect((await screen.findByRole('alert')).textContent).toContain(
        'Impossible de charger',
      );
    },
  );

  it('ignores a successful response after the page unmounts', async () => {
    // Arrange: hold the response until after the page has unmounted.
    let resolveResponse!: (value: { count: number }) => void;
    const data = new Promise<{ count: number }>((resolve) => {
      resolveResponse = resolve;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => data,
      }),
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<DashboardPage />);
    unmount();

    // Act
    await act(async () => {
      resolveResponse({ count: 8 });
      await data;
    });

    // Assert: the unmounted page does not trigger an error.
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('does not update state when a request fails after the page unmounts', async () => {
    // Arrange: hold a failing response until after the page has unmounted.
    let rejectResponse!: (error: Error) => void;
    const data = new Promise<never>((_resolve, reject) => {
      rejectResponse = reject;
    });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: () => data,
      }),
    );
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { unmount } = render(<DashboardPage />);
    unmount();

    // Act
    await act(async () => {
      rejectResponse(new Error('Network error'));
      await data.catch(() => {});
    });

    // Assert: failures after unmount are also ignored.
    expect(errorSpy).not.toHaveBeenCalled();
  });
});
