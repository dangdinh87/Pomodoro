export type Dir = 'up' | 'down' | 'left' | 'right';

export interface Tile {
  id: number;
  value: number;
  r: number;
  c: number;
  merged?: boolean;
  isNew?: boolean;
}

export const SIZE = 4;

function slot(dir: Dir, line: number, k: number): { r: number; c: number } {
  switch (dir) {
    case 'left':
      return { r: line, c: k };
    case 'right':
      return { r: line, c: SIZE - 1 - k };
    case 'up':
      return { r: k, c: line };
    case 'down':
      return { r: SIZE - 1 - k, c: line };
  }
}

export interface MoveResult {
  tiles: Tile[];
  /** Tiles that slid into a merge; render them moving, then drop them. */
  ghosts: Tile[];
  gained: number;
  moved: boolean;
}

/** Slides every tile as far as it goes in `dir`; equal neighbours merge once per move. */
export function moveTiles(tiles: Tile[], dir: Dir): MoveResult {
  const result: Tile[] = [];
  const ghosts: Tile[] = [];
  let gained = 0;
  let moved = false;

  for (let line = 0; line < SIZE; line++) {
    const placed: Tile[] = [];
    for (let k = 0; k < SIZE; k++) {
      const { r, c } = slot(dir, line, k);
      const tile = tiles.find((t) => t.r === r && t.c === c);
      if (!tile) continue;
      const last = placed[placed.length - 1];
      if (last && !last.merged && last.value === tile.value) {
        last.value *= 2;
        last.merged = true;
        gained += last.value;
        moved = true;
        ghosts.push({ ...tile, r: last.r, c: last.c, merged: false, isNew: false });
        continue;
      }
      const target = slot(dir, line, placed.length);
      if (target.r !== tile.r || target.c !== tile.c) moved = true;
      placed.push({ ...tile, r: target.r, c: target.c, merged: false, isNew: false });
    }
    result.push(...placed);
  }
  return { tiles: result, ghosts, gained, moved };
}

export function emptyCells(tiles: Tile[]): { r: number; c: number }[] {
  const cells: { r: number; c: number }[] = [];
  for (let r = 0; r < SIZE; r++)
    for (let c = 0; c < SIZE; c++) if (!tiles.some((t) => t.r === r && t.c === c)) cells.push({ r, c });
  return cells;
}

export function spawnTile(tiles: Tile[], id: number, rng: () => number = Math.random): Tile[] {
  const cells = emptyCells(tiles);
  if (cells.length === 0) return tiles;
  const cell = cells[Math.floor(rng() * cells.length)];
  return [...tiles, { id, value: rng() < 0.9 ? 2 : 4, r: cell.r, c: cell.c, isNew: true }];
}

export function canMove(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  return (['left', 'up'] as Dir[]).some((dir) => moveTiles(tiles, dir).moved);
}

/** Builds tiles from a value grid (0 = empty); used by tests and quick setup. */
export function tilesFromGrid(grid: number[][]): Tile[] {
  const tiles: Tile[] = [];
  let id = 1;
  grid.forEach((row, r) =>
    row.forEach((value, c) => {
      if (value) tiles.push({ id: id++, value, r, c });
    }),
  );
  return tiles;
}

export function gridFromTiles(tiles: Tile[]): number[][] {
  const grid = Array.from({ length: SIZE }, () => Array<number>(SIZE).fill(0));
  tiles.forEach((t) => {
    grid[t.r][t.c] = t.value;
  });
  return grid;
}
