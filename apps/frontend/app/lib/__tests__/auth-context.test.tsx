import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { useEffect } from 'react';
import { useAuth } from '../auth-context';
import Providers from '@/app/providers';

function AuthHarness() {
  const { user, login, toggleFavorite, addRatingBonus, spendCredit, updateUser } = useAuth();

  useEffect(() => {
    void login('player@example.com', 'password123');
  }, [login]);

  if (!user) return <div data-testid="loading">loading</div>;

  return (
    <div>
      <div data-testid="user-name">{user.name}</div>
      <div data-testid="favorites-count">{user.favorites.length}</div>
      <div data-testid="credits">{user.credits}</div>
      <div data-testid="rated">{user.ratedStoriesForBonus.join(',')}</div>
      <button onClick={() => toggleFavorite('story-1')}>fav</button>
      <button
        onClick={() => {
          updateUser({ credits: 5 });
          addRatingBonus('story-1');
        }}
      >
        bonus
      </button>
      <button onClick={() => spendCredit()}>spend</button>
    </div>
  );
}

describe('auth-context', () => {
  it('updates favorites, awards rating bonus, and spends credits', async () => {
    render(
      <Providers>
        <AuthHarness />
      </Providers>,
    );

    await waitFor(() => expect(screen.getByTestId('user-name').textContent).toContain('player'));

    fireEvent.click(screen.getByText('fav'));
    expect(screen.getByTestId('favorites-count').textContent).toBe('1');

    fireEvent.click(screen.getByText('bonus'));
    expect(screen.getByTestId('rated').textContent).toContain('story-1');
    await waitFor(() => expect(Number(screen.getByTestId('credits').textContent)).toBeGreaterThanOrEqual(10));

    const creditsAfterBonus = Number(screen.getByTestId('credits').textContent);

    fireEvent.click(screen.getByText('spend'));
    await waitFor(() =>
      expect(Number(screen.getByTestId('credits').textContent)).toBeLessThan(creditsAfterBonus),
    );
  });
});
