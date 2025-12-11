import '@testing-library/jest-dom/vitest';
import { beforeEach, vi } from 'vitest';
import { getSearchParams, resetNavigationMocks, routerMock } from './test/navigation';

beforeEach(() => {
  resetNavigationMocks();
});

vi.mock('next/image', () => ({
  __esModule: true,
  default: (props: {
    src: string | { src: string };
    alt?: string;
    width?: number;
    height?: number;
  }) => {
    const { alt = '', src, ...rest } = props;
    const { fill, priority, ...cleaned } = rest as Record<string, unknown>;
    void fill;
    void priority;
    const resolvedSrc = typeof src === 'string' ? src : (src?.src ?? '');
    // eslint-disable-next-line @next/next/no-img-element
    return <img alt={alt} src={resolvedSrc} {...cleaned} />;
  },
}));

vi.mock('next/navigation', () => ({
  __esModule: true,
  useRouter: () => routerMock,
  useSearchParams: () => getSearchParams(),
  usePathname: () => '/',
}));
