export type Movie = {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  poster_path?: string;
};

export type TvShow = {
  id: number;
  name: string;
  first_air_date?: string;
  vote_average: number;
  poster_path?: string;
};

export type Genre = {
  id: number;
  name: string;
};

export type MovieDetails = Movie & {
  backdrop_path?: string;
  overview?: string;
  runtime?: number;
  genres?: Genre[];
  tagline?: string;
  original_title?: string;
};

export type TvShowDetails = TvShow & {
  backdrop_path?: string;
  overview?: string;
  episode_run_time?: number[];
  genres?: Genre[];
  tagline?: string;
  original_name?: string;
};
