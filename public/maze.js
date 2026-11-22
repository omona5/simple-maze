export const DIRECTIONS = [
  { dx: 0, dy: -1, opposite: 2 },
  { dx: 1, dy: 0, opposite: 3 },
  { dx: 0, dy: 1, opposite: 0 },
  { dx: -1, dy: 0, opposite: 1 },
];

export function generateMaze(size, random = Math.random) {
  const cells = Array.from({ length: size * size }, () => [true, true, true, true]);
  const visited = new Set([0]);
  const stack = [0];
  while (stack.length) {
    const current = stack.at(-1);
    const x = current % size;
    const y = Math.floor(current / size);
    const options = DIRECTIONS.flatMap(({ dx, dy }, direction) => {
      const nx = x + dx, ny = y + dy;
      const next = ny * size + nx;
      return nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(next)
        ? [{ next, direction }] : [];
    });
    if (!options.length) { stack.pop(); continue; }
    const { next, direction } = options[Math.floor(random() * options.length)];
    cells[current][direction] = false;
    cells[next][DIRECTIONS[direction].opposite] = false;
    visited.add(next);
    stack.push(next);
  }
  return { size, cells };
}

export function move(maze, position, direction) {
  if (!DIRECTIONS[direction] || maze.cells[position][direction]) return position;
  const { dx, dy } = DIRECTIONS[direction];
  return position + dy * maze.size + dx;
}

export function solve(maze, start, goal = maze.cells.length - 1) {
  const parents = new Map([[start, null]]);
  const queue = [start];
  for (let i = 0; i < queue.length; i++) {
    const current = queue[i];
    if (current === goal) break;
    for (let d = 0; d < 4; d++) {
      const next = move(maze, current, d);
      if (!parents.has(next)) { parents.set(next, current); queue.push(next); }
    }
  }
  if (!parents.has(goal)) return [];
  const route = [];
  for (let p = goal; p !== null; p = parents.get(p)) route.push(p);
  return route.reverse();
}
