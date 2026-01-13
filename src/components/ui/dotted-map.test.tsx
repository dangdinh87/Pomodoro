import React, { useState } from 'react';
import { render, act } from '@testing-library/react';
import { DottedMap } from './dotted-map';

// Mock svg-dotted-map
const mockCreateMap = jest.fn();

jest.mock('svg-dotted-map', () => ({
  createMap: (args: any) => {
    mockCreateMap(args);
    return {
      points: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
      addMarkers: jest.fn().mockReturnValue([]),
    };
  },
}));

describe('DottedMap Performance', () => {
  beforeEach(() => {
    mockCreateMap.mockClear();
  });

  it('calls createMap only once with optimization', () => {
    const Wrapper = () => {
      const [count, setCount] = useState(0);
      return (
        <div>
          <button onClick={() => setCount(c => c + 1)}>Increment</button>
          <DottedMap mapSamples={100} />
        </div>
      );
    };

    const { getByText } = render(<Wrapper />);

    // Initial render
    expect(mockCreateMap).toHaveBeenCalledTimes(1);

    // Trigger re-render
    act(() => {
      getByText('Increment').click();
    });

    // Should NOT have been called again (still 1)
    expect(mockCreateMap).toHaveBeenCalledTimes(1);

    // Trigger another re-render
    act(() => {
      getByText('Increment').click();
    });

    // Should NOT have been called again (still 1)
    expect(mockCreateMap).toHaveBeenCalledTimes(1);
  });
});
