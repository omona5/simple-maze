import test from 'node:test';
import assert from 'node:assert/strict';
import { generateMaze, move, solve, DIRECTIONS } from '../public/maze.js';

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
