import React from 'react';
import { render } from '@testing-library/react';
import { BackgroundBeamsWithCollision } from './background-beams-with-collision';

// Mock motion/react
jest.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
    span: ({ children, className, ...props }: any) => (
      <span className={className} {...props}>
        {children}
      </span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('BackgroundBeamsWithCollision', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <BackgroundBeamsWithCollision>
        <div>Content</div>
      </BackgroundBeamsWithCollision>
    );
    expect(container).toBeInTheDocument();
  });
});
