import React from 'react';

interface FilmsInBaseWidgetProps {
  moviesCount?: number;
  topGenres?: string[];
  topCountries?: string[];
  isLoading?: boolean;
}

export const FilmsInBaseWidget: React.FC<FilmsInBaseWidgetProps> = ({
  moviesCount = 0,
  topGenres = [],
  topCountries = [],
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div style={styles.card}>
        <h3>Films en base</h3>
        <p>Chargement en cours...</p>
      </div>
    );
  }

  if (moviesCount === 0) {
    return (
      <div style={styles.card}>
        <h3>Films en base</h3>
        <p>Aucun film disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <div style={styles.card}>
      <h3>Films en base</h3>
      <div style={styles.metric}>
        <span style={styles.number}>{moviesCount}</span>
        <span style={styles.label}>Films enregistrés</span>
      </div>

      <div style={styles.section}>
        <h4>Top Genres</h4>
        <ul>
          {topGenres.map((genre, index) => (
            <li key={index}>{genre}</li>
          ))}
        </ul>
      </div>

      <div style={styles.section}>
        <h4>Principaux pays</h4>
        <ul>
          {topCountries.map((country, index) => (
            <li key={index}>{country}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const styles = {
  card: {
    border: '1px solid #e1e4e8',
    borderRadius: '8px',
    padding: '20px',
    maxWidth: '350px',
    fontFamily: 'sans-serif',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
  },
  metric: {
    margin: '15px 0',
  },
  number: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0366d6',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    color: '#586069',
  },
  section: {
    marginTop: '15px',
  },
};
