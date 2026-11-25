import type { Meta, StoryObj } from '@storybook/react-vite';
import MoviesInDatabaseWidget from './MoviesInDatabaseWidget';

const meta = {
  title: 'Dashboard/Widgets/FilmsEnBase',
  component: MoviesInDatabaseWidget,
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    state: {
      control: 'object',
      description: 'Current loading, ready, or error state for the widget.',
    },
  },
} satisfies Meta<typeof MoviesInDatabaseWidget>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Loading: Story = {
  args: {
    state: { status: 'loading' },
  },
};

export const Empty: Story = {
  args: {
    state: { status: 'ready', count: 0 },
  },
};

export const Populated: Story = {
  args: {
    state: { status: 'ready', count: 128 },
  },
};

export const Error: Story = {
  args: {
    state: { status: 'error' },
  },
};
