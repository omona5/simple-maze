import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMaze, move, slide, solve, DIRECTIONS } from '../public/maze.js';

for (const size of [9, 15, 21, 35]) {
  test(`${size}×${size}: generated mazes are connected trees with closed borders and reciprocal walls`, () => {
    for (let run = 0; run < 30; run++) {
      const maze = generateMaze(size);
      let openings = 0;
      const reachable = new Set([0]);
      const queue = [0];
      for (let i = 0; i < queue.length; i++) {
        for (let d = 0; d < 4; d++) {
          const next = move(maze, queue[i], d);
          if (!reachable.has(next)) { reachable.add(next); queue.push(next); }
        }
      }
      assert.equal(reachable.size, size * size);
      maze.cells.forEach((edges, p) => {
        const x = p % size, y = Math.floor(p / size);
        if (x === 0) assert.ok(edges[3]);
        if (y === 0) assert.ok(edges[0]);
        if (x === size - 1) assert.ok(edges[1]);
        if (y === size - 1) assert.ok(edges[2]);
        for (let d = 0; d < 4; d++) {
          const next = move(maze, p, d);
          if (edges[d]) assert.equal(next, p);
          else { openings++; assert.equal(maze.cells[next][DIRECTIONS[d].opposite], false); }
        }
      });
      assert.equal(openings / 2, size * size - 1);
      for (const start of [0, Math.floor(size * size / 2), size * size - 1]) {
        const route = solve(maze, start);
        assert.equal(route[0], start);
        assert.equal(route.at(-1), size * size - 1);
        for (let i = 1; i < route.length; i++) {
          assert.ok(DIRECTIONS.some((_, d) => move(maze, route[i - 1], d) === route[i]));
        }
      }
    }
  });
}

function fixture(paths) {
  const maze = { size: 5, cells: Array.from({ length: 25 }, () => [true, true, true, true]) };
  for (const path of paths) {
    for (let i = 1; i < path.length; i++) {
      const from = path[i - 1], to = path[i];
      const direction = DIRECTIONS.findIndex(({ dx, dy }) => from + dx + dy * maze.size === to);
      maze.cells[from][direction] = false;
      maze.cells[to][DIRECTIONS[direction].opposite] = false;
    }
  }
  return maze;
}

test('one input travels a corridor and stops at the first junction in either direction', () => {
  const maze = fixture([[5, 6, 7, 8, 9], [2, 7, 12]]);
  assert.deepEqual(slide(maze, 5, 1), [6, 7]);
  assert.deepEqual(slide(maze, 9, 3), [8, 7]);
  assert.deepEqual(slide(maze, 7, 1), [8, 9]);
  assert.deepEqual(slide(maze, 7, 0), [2]);
});

test('walls block movement and corners require another directional input', () => {
  const maze = fixture([[0, 1, 2, 7, 12]]);
  assert.deepEqual(slide(maze, 0, 0), []);
  assert.deepEqual(slide(maze, 0, 1), [1, 2]);
  assert.deepEqual(slide(maze, 2, 1), []);
  assert.deepEqual(slide(maze, 2, 2), [7, 12]);
});

test('a long corridor reaches the exit without moving outside the maze', () => {
  const maze = fixture([[20, 21, 22, 23, 24]]);
  assert.deepEqual(slide(maze, 20, 1), [21, 22, 23, 24]);
  assert.deepEqual(slide(maze, 24, 1), []);
});
