export const DIRECTIONS = [
  { dx: 0, dy: -1, opposite: 2 },
  { dx: 1, dy: 0, opposite: 3 },
  { dx: 0, dy: 1, opposite: 0 },
  { dx: -1, dy: 0, opposite: 1 },
];

export function generateMaze(size, random = Math.random, algorithm = 'backtracker') {
  const cells = Array.from({ length: size * size }, () => [true, true, true, true]);
  const visited = new Set([0]);
  const stack = [0];
  while (stack.length) {
    // Growing Tree mixes fresh corridors with branches from earlier cells.
    const index = algorithm === 'growing-tree' && random() >= .55
      ? Math.floor(random() * stack.length) : stack.length - 1;
    const current = stack[index];
    const x = current % size;
    const y = Math.floor(current / size);
    const options = DIRECTIONS.flatMap(({ dx, dy }, direction) => {
      const nx = x + dx, ny = y + dy;
      const next = ny * size + nx;
      return nx >= 0 && nx < size && ny >= 0 && ny < size && !visited.has(next)
        ? [{ next, direction }] : [];
    });
    if (!options.length) { stack.splice(index, 1); continue; }
    const { next, direction } = options[Math.floor(random() * options.length)];
    cells[current][direction] = false;
    cells[next][DIRECTIONS[direction].opposite] = false;
    visited.add(next);
    stack.push(next);
  }
  return { size, cells };
}

export function generateExtremeMaze(size, random = Math.random) {
  let best, bestScore = -Infinity;
  // Favor real decisions along the solution, rather than just increasing grid size.
  for (let attempt = 0; attempt < 8; attempt++) {
    const maze = generateMaze(size, random, 'growing-tree');
    const route = solve(maze, 0);
    let junctions = 0, gap = 0, longestGap = 0;
    for (const position of route) {
      if (maze.cells[position].filter(wall => !wall).length >= 3) {
        junctions++; gap = 0;
      } else {
        gap++; longestGap = Math.max(longestGap, gap);
      }
    }
    const score = junctions + Math.min(route.length, size * 10) * .08 - longestGap * 1.5;
    if (score > bestScore) { best = maze; bestScore = score; }
  }
  return best;
}

export function move(maze, position, direction) {
  if (!DIRECTIONS[direction] || maze.cells[position][direction]) return position;
  const { dx, dy } = DIRECTIONS[direction];
  return position + dy * maze.size + dx;
}

// Continue straight, stopping at the first junction, corner, dead end, or exit.
export function slide(maze, position, direction) {
  const route = [];
  while (true) {
    const next = move(maze, position, direction);
    if (next === position) return route;
    route.push(next);
    position = next;
    const exits = maze.cells[position].filter(wall => !wall).length;
    if (exits >= 3 || position === maze.cells.length - 1) return route;
  }
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
