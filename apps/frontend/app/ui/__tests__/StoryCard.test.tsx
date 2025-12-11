import { render, screen } from '@testing-library/react';
import StoryCard from '../StoryCard';

const baseStory = {
  id: '1',
  title: 'Test Story',
  description: 'A short description.',
  genre: 'ไซไฟ',
  coverImage: 'https://picsum.photos/seed/test/800/450',
  rating: 4.5,
  duration: '45 นาที',
  totalEndings: 3,
  totalPlayers: 1200,
  tags: [],
};

describe('StoryCard', () => {
  it('renders story info', () => {
    render(<StoryCard story={baseStory} />);

    expect(screen.getByText('Test Story')).toBeInTheDocument();
    expect(screen.getByText('A short description.')).toBeInTheDocument();
    expect(screen.getByText('ไซไฟ')).toBeInTheDocument();
    expect(screen.getByText('45 นาที')).toBeInTheDocument();
  });

  it('shows coming soon badge with date', () => {
    render(
      <StoryCard
        story={{
          ...baseStory,
          comingSoon: true,
          launchDate: '2025-01-01',
        }}
      />
    );

    expect(screen.getByText(/เร็วๆ นี้/)).toBeInTheDocument();
    expect(screen.getByText(/เปิดให้เล่น/)).toBeInTheDocument();
    expect(screen.getByText('2025-01-01')).toBeInTheDocument();
  });
});
