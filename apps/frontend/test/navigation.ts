import { vi } from 'vitest';

export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  back: vi.fn(),
  prefetch: vi.fn(),
};

let searchParams = new URLSearchParams();

export const setSearchParams = (params: URLSearchParams) => {
  searchParams = params;
};

export const getSearchParams = () => searchParams;

export const resetNavigationMocks = () => {
  routerMock.push.mockReset();
  routerMock.replace.mockReset();
  routerMock.back.mockReset();
  routerMock.prefetch.mockReset();
  searchParams = new URLSearchParams();
};
