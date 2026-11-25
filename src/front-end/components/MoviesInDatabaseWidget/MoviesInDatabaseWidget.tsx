import './MoviesInDatabaseWidget.css';

export type MoviesInDatabaseWidgetState =
  | { status: 'loading' }
  | { status: 'ready'; count: number }
  | { status: 'error' };

interface MoviesInDatabaseWidgetProps {
  state: MoviesInDatabaseWidgetState;
}

export default function MoviesInDatabaseWidget({
  state,
}: MoviesInDatabaseWidgetProps) {
  return (
    <article
      className="movies-in-database-widget"
      aria-labelledby="movies-in-database-title"
      aria-busy={state.status === 'loading'}
    >
      <p className="movies-in-database-widget__eyebrow">
        Bibliothèque de films
      </p>
      <h2 id="movies-in-database-title">Films en base</h2>

      {state.status === 'loading' && (
        <p className="movies-in-database-widget__message" role="status">
          Chargement du nombre de films…
        </p>
      )}
      {state.status === 'error' && (
        <p className="movies-in-database-widget__message" role="alert">
          Impossible de charger le nombre de films.
        </p>
      )}
      {state.status === 'ready' && state.count === 0 && (
        <p className="movies-in-database-widget__message" role="status">
          Aucun film n'est enregistré pour le moment.
        </p>
      )}
      {state.status === 'ready' && state.count > 0 && (
        <p className="movies-in-database-widget__count" role="status">
          <strong>{new Intl.NumberFormat('fr-FR').format(state.count)}</strong>
          <span>
            {state.count === 1 ? 'film enregistré' : 'films enregistrés'}
          </span>
        </p>
      )}
    </article>
  );
}
