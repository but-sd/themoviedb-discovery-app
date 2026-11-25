import { Link } from 'react-router';
import './DashboardPage.css';

export default function DashboardPage() {
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
        className="dashboard-empty"
        aria-labelledby="dashboard-empty-title"
      >
        <p className="dashboard-empty-label">Aucun widget configuré</p>
        <h2 id="dashboard-empty-title">Votre tableau de bord est prêt</h2>
        <p>
          Les widgets de visualisation des films, des genres et des pays de
          production seront disponibles prochainement.
        </p>
        <Link to="/movies">Explorer les films populaires</Link>
      </section>
    </main>
  );
}
