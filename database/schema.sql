CREATE TABLE film (
  tmdb_id INTEGER PRIMARY KEY CHECK (tmdb_id > 0),
  title TEXT NOT NULL,
  original_title TEXT NOT NULL,
  overview TEXT,
  release_date DATE,
  original_language VARCHAR(10),
  poster_path TEXT,
  backdrop_path TEXT,
  popularity NUMERIC(12, 3),
  vote_average NUMERIC(4, 2),
  vote_count INTEGER,
  runtime_minutes INTEGER CHECK (
    runtime_minutes IS NULL OR runtime_minutes > 0
  ),
  budget BIGINT CHECK (budget IS NULL OR budget > 0),
  revenue BIGINT CHECK (revenue IS NULL OR revenue > 0),
  observed_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE genre (
  tmdb_id INTEGER PRIMARY KEY CHECK (tmdb_id > 0),
  name TEXT NOT NULL
);

CREATE TABLE country (
  iso_3166_1 CHAR(2) PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE film_genre (
  film_tmdb_id INTEGER NOT NULL REFERENCES film (tmdb_id) ON DELETE CASCADE,
  genre_tmdb_id INTEGER NOT NULL REFERENCES genre (tmdb_id) ON DELETE RESTRICT,
  PRIMARY KEY (film_tmdb_id, genre_tmdb_id)
);

CREATE TABLE film_country (
  film_tmdb_id INTEGER NOT NULL REFERENCES film (tmdb_id) ON DELETE CASCADE,
  country_iso_3166_1 CHAR(2) NOT NULL
    REFERENCES country (iso_3166_1) ON DELETE RESTRICT,
  PRIMARY KEY (film_tmdb_id, country_iso_3166_1)
);

CREATE INDEX film_release_date_idx ON film (release_date);
CREATE INDEX film_genre_genre_idx ON film_genre (genre_tmdb_id);
CREATE INDEX film_country_country_idx ON film_country (country_iso_3166_1);
