import { FilmsInBaseWidget } from './FilmsInBaseWidget';

export default {
  title: 'Widgets/FilmsInBaseWidget',
  component: FilmsInBaseWidget,
};

export const Default = {
  args: {
    moviesCount: 1420,
    topGenres: ['Action', 'Drame', 'Comédie'],
    topCountries: ['États-Unis', 'France', 'Japon'],
  },
};

export const Loading = {
  args: {
    isLoading: true,
  },
};

export const Empty = {
  args: {
    moviesCount: 0,
    topGenres: [],
    topCountries: [],
  },
};
