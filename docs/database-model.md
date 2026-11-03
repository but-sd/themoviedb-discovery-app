# Modèle de données du tableau de bord

## Périmètre

Le modèle stocke un échantillon de films provenant de TMDB et les informations
nécessaires à leur comparaison par année de sortie : titres, description,
genres, pays de production, indicateurs de votes, popularité, durée, budget,
recettes et date d'observation.

Un film est identifié par son identifiant TMDB. Une nouvelle collecte du même
film met à jour sa description, ses attributs et sa date d'observation ; elle
ne crée pas une nouvelle ligne et ne modifie pas son année de sortie.

Les valeurs inconnues pour la durée, le budget et les recettes sont stockées
`NULL`. Une valeur connue pour ces propriétés est strictement positive.
L'absence de popularité, de note ou de nombre de votes reste également
`NULL`, sans remplacement automatique par zéro.

## MCD

### Entités

| Entité    | Identifiant  | Propriétés principales                                                                                             |
| --------- | ------------ | ------------------------------------------------------------------------------------------------------------------ |
| **Film**  | `tmdb_id`    | titres, description, date et année de sortie, popularité, note, votes, durée, budget, recettes, date d'observation |
| **Genre** | `tmdb_id`    | libellé                                                                                                            |
| **Pays**  | `iso_3166_1` | nom                                                                                                                |

### Associations et cardinalités

- Un **film** peut avoir zéro à plusieurs **genres**.
- Un **genre** peut être associé à zéro à plusieurs **films**.
- Un **film** peut avoir zéro à plusieurs **pays de production**.
- Un **pays** peut participer à zéro à plusieurs **films**.
- Les deux relations plusieurs-à-plusieurs sont portées par les associations
  `movie_genres` et `production_countries`.
- Le code TMDB du genre et le code ISO 3166-1 du pays sont les identifiants
  stables ; le libellé ou le nom peuvent être actualisés sans changer
  l'identité de l'entité.

## Schéma relationnel

```text
movies(
  id PK,
  title NOT NULL,
  original_title NOT NULL,
  original_language NOT NULL,
  overview NOT NULL,
  release_date,
  release_year GENERATED,
  popularity,
  vote_average,
  vote_count,
  poster_path,
  backdrop_path,
  runtime_minutes CHECK (> 0 when known),
  budget CHECK (> 0 when known),
  revenue CHECK (> 0 when known),
  collected_at NOT NULL
)

genres(
  id PK,
  name NOT NULL
)

movie_genres(
  movie_id PK, FK -> movies.id,
  genre_id PK, FK -> genres.id
)

countries(
  code PK,
  name NOT NULL
)

production_countries(
  movie_id PK, FK -> movies.id,
  country_code PK, FK -> countries.code
)
```

Les clés primaires composites des tables d'association interdisent les
doublons. Les clés étrangères sont activées par la connexion SQLite et
garantissent qu'une association ne référence qu'un film, un genre ou un pays
existant. La suppression d'un film supprime ses associations ; les catalogues
de genres et de pays ne sont pas supprimés par cette opération.

`release_year` est dérivée de `release_date` et indexée pour permettre les
agrégations et comparaisons par année. `collected_at` représente la dernière
observation du film et est remplacée lors d'une actualisation.
