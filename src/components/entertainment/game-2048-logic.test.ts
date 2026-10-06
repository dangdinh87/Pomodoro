import { describe, expect, it } from 'vitest';
import { canMove, gridFromTiles, moveTiles, spawnTile, tilesFromGrid } from './game-2048-logic';

const move = (grid: number[][], dir: Parameters<typeof moveTiles>[1]) => {
  const res = moveTiles(tilesFromGrid(grid), dir);
  return { ...res, grid: gridFromTiles(res.tiles) };
};

describe('2048 logic', () => {
  it('merges equal neighbours once per move', () => {
    const { grid, gained } = move(
      [
        [2, 2, 2, 2],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      'left',
    );
    expect(grid[0]).toEqual([4, 4, 0, 0]);
    expect(gained).toBe(8);
  });

  it('does not chain-merge a freshly merged tile', () => {
    const { grid } = move(
      [
        [4, 2, 2, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      'left',
    );
    expect(grid[0]).toEqual([4, 4, 0, 0]);
  });

  it('slides toward the right and down', () => {
    expect(move([[2, 0, 0, 2], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'right').grid[0]).toEqual([0, 0, 0, 4]);
    const down = move([[2, 0, 0, 0], [0, 0, 0, 0], [2, 0, 0, 0], [4, 0, 0, 0]], 'down').grid;
    expect([down[0][0], down[1][0], down[2][0], down[3][0]]).toEqual([0, 0, 4, 4]);
  });

  it('reports no movement when nothing can change', () => {
    const res = move([[2, 4, 8, 16], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]], 'left');
    expect(res.moved).toBe(false);
    expect(res.gained).toBe(0);
  });

  it('keeps the merge ghost on the merge target', () => {
    const res = moveTiles(tilesFromGrid([[2, 2, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]]), 'left');
    expect(res.ghosts).toHaveLength(1);
    expect(res.ghosts[0]).toMatchObject({ r: 0, c: 0 });
  });

  it('detects a locked board', () => {
    const locked = [
      [2, 4, 2, 4],
      [4, 2, 4, 2],
      [2, 4, 2, 4],
      [4, 2, 4, 2],
    ];
    expect(canMove(tilesFromGrid(locked))).toBe(false);
    locked[3][3] = 4;
    expect(canMove(tilesFromGrid(locked))).toBe(true);
  });

  it('spawns into an empty cell only', () => {
    const tiles = tilesFromGrid([[2, 4, 2, 4], [4, 2, 4, 2], [2, 4, 2, 4], [4, 2, 4, 0]]);
    const next = spawnTile(tiles, 99, () => 0);
    expect(next).toHaveLength(16);
    expect(next[15]).toMatchObject({ r: 3, c: 3, value: 2, isNew: true });
  });
});
