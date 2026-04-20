export type Item = {
  id: number;
  title: string;
  release_date?: string;
  vote_average: number;
  poster_path?: string;
};

export type Genre = {
  id: number;
  name: string;
};

export type MovieDetails = Item & {
  backdrop_path?: string;
  overview?: string;
  runtime?: number;
  genres?: Genre[];
  tagline?: string;
  original_title?: string;
};

export type TvShowDetails = Item & {
  backdrop_path?: string;
  overview?: string;
  episode_run_time?: number[];
  genres?: Genre[];
  tagline?: string;
  original_name?: string;
};
