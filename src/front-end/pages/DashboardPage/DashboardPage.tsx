import { useEffect, useState } from 'react';
import MoviesInDatabaseWidget, {
  type MoviesInDatabaseWidgetState,
} from '../../components/MoviesInDatabaseWidget/MoviesInDatabaseWidget';
import './DashboardPage.css';

function isMovieCountResponse(value: unknown): value is { count: number } {
  return (
    typeof value === 'object' &&
    value !== null &&
    'count' in value &&
    typeof value.count === 'number' &&
    Number.isInteger(value.count) &&
    value.count >= 0
  );
}

export default function DashboardPage() {
  const [widgetState, setWidgetState] = useState<MoviesInDatabaseWidgetState>({
    status: 'loading',
  });

  useEffect(() => {
    let active = true;

    async function loadMovieCount() {
      try {
        const response = await fetch('/api/movies/count');
        if (!response.ok) {
          throw new Error(
            `Movie count request failed with status ${response.status}`,
          );
        }

        const data: unknown = await response.json();
        if (!isMovieCountResponse(data)) {
          throw new Error('Invalid movie count response');
        }

        if (active) {
          setWidgetState({ status: 'ready', count: data.count });
        }
      } catch (error) {
        if (active) {
          console.error('Error loading movie count widget:', error);
          setWidgetState({ status: 'error' });
        }
      }
    }

    void loadMovieCount();
    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="app-shell dashboard-page">
      <header className="dashboard-header">
        <p className="dashboard-eyebrow">Dashboard des films</p>
        <h1>Tableau de bord des films</h1>
        <p className="dashboard-intro">
          Une vue d'ensemble de vos films, de leurs genres et de leurs pays de
          production.
        </p>
      </header>

      <section
        className="dashboard-widgets"
        aria-label="Widgets du tableau de bord"
      >
        <MoviesInDatabaseWidget state={widgetState} />
      </section>
    </main>
  );
}
