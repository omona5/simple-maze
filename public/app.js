import { generateMaze, move, solve } from './maze.js';

const $ = (selector) => document.querySelector(selector);
const board = $('#board');
const svg = $('#maze');
const levels = { easy: { size: 9, label: '가볍게' }, normal: { size: 15, label: '적당히' }, hard: { size: 21, label: '깊이' } };
const ns = 'http://www.w3.org/2000/svg';
let level = 'easy', maze, position, steps, trail, hint, assisted, finished;
let elapsed = 0, startedAt = null, pointer = null;
let bests = {};
try {
  const stored = JSON.parse(localStorage.getItem('simple-maze-bests') || '{}');
  if (stored && typeof stored === 'object' && !Array.isArray(stored)) bests = stored;
} catch { /* Storage is optional. */ }

function element(name, attrs) {
  const node = document.createElementNS(ns, name);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  return node;
}
function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}
function time() { return elapsed + (startedAt === null ? 0 : performance.now() - startedAt); }
function center(index) {
  const cell = 376 / maze.size;
  return [12 + (index % maze.size + .5) * cell, 12 + (Math.floor(index / maze.size) + .5) * cell];
}
function routePath(route) { return route.map((p, i) => `${i ? 'L' : 'M'}${center(p).join(' ')}`).join(' '); }

function renderBoard() {
  svg.replaceChildren();
  const cell = 376 / maze.size;
  const [sx, sy] = center(0);
  svg.append(element('rect', { x: sx - cell * .36, y: sy - cell * .36, width: cell * .72, height: cell * .72, rx: 4, fill: '#26382b' }));
  svg.append(element('path', { id: 'trail', class: 'trail' }));
  svg.append(element('path', { id: 'hint-path', class: 'hint-path' }));
  let walls = '';
  maze.cells.forEach((edges, i) => {
    const x = 12 + i % maze.size * cell, y = 12 + Math.floor(i / maze.size) * cell;
    if (edges[0]) walls += `M${x} ${y}h${cell}`;
    if (edges[3]) walls += `M${x} ${y}v${cell}`;
    if (i % maze.size === maze.size - 1 && edges[1]) walls += `M${x + cell} ${y}v${cell}`;
    if (Math.floor(i / maze.size) === maze.size - 1 && edges[2]) walls += `M${x} ${y + cell}h${cell}`;
  });
  svg.append(element('path', { d: walls, class: 'maze-wall' }));
  const [gx, gy] = center(maze.cells.length - 1);
  const radius = cell * .23;
  svg.append(element('rect', { x: gx - radius, y: gy - radius, width: radius * 2, height: radius * 2, rx: radius * .3, fill: '#c5e596' }));
  svg.append(element('path', { d: `M${gx - radius * .5} ${gy}l${radius * .35} ${radius * .4} ${radius * .7} ${-radius * .8}`, fill: 'none', stroke: '#243322', 'stroke-width': Math.max(1, cell * .04) }));
  svg.append(element('circle', { id: 'player', r: cell * .23, class: 'player' }));
  renderPosition();
}

function renderPosition() {
  const [x, y] = center(position);
  $('#player').setAttribute('cx', x);
  $('#player').setAttribute('cy', y);
  $('#trail').setAttribute('d', routePath(trail));
  $('#hint-path').setAttribute('d', hint ? routePath(solve(maze, position)) : '');
  $('#moves').replaceChildren(document.createTextNode(String(steps)));
  const unit = document.createElement('span');
  unit.className = 'stat-unit'; unit.textContent = '회'; $('#moves').append(unit);
}

function reset(newMaze = true) {
  if ($('#win-dialog').open) $('#win-dialog').close();
  if (newMaze) maze = generateMaze(levels[level].size);
  position = 0; steps = 0; trail = [0]; hint = false; assisted = false; finished = false;
  elapsed = 0; startedAt = null; pointer = null;
  $('#timer').textContent = '00:00';
  $('#hint').setAttribute('aria-pressed', 'false');
  const best = bests[level];
  $('#best').textContent = Number.isFinite(best) && best > 0 ? formatTime(best) : '—';
  $('#status').textContent = '주황색 점을 움직여 초록색 출구에 도착하세요.';
  renderBoard();
}

function go(direction) {
  if (finished || $('#win-dialog').open) return;
  const next = move(maze, position, direction);
  if (next === position) {
    board.classList.remove('bump');
    void board.offsetWidth;
    board.classList.add('bump');
    return;
  }
  if (startedAt === null && !document.hidden) startedAt = performance.now();
  position = next; steps++;
  if (trail.at(-2) === next) trail.pop(); else trail.push(next);
  renderPosition();
  if (position === maze.cells.length - 1) win();
}

function win() {
  elapsed = time(); startedAt = null; finished = true; pointer = null;
  $('#timer').textContent = formatTime(elapsed);
  const previous = bests[level];
  const newBest = !assisted && (!Number.isFinite(previous) || elapsed < previous);
  if (newBest) {
    bests[level] = elapsed;
    try { localStorage.setItem('simple-maze-bests', JSON.stringify(bests)); } catch { /* Private mode can block storage. */ }
    $('#best').textContent = formatTime(elapsed);
  }
  $('#win-summary').textContent = `${levels[level].label} · ${formatTime(elapsed)} · ${steps}회 이동`;
  $('#win-record').textContent = assisted ? '힌트와 함께 찾은 길! 다음에는 혼자 도전해 봐요.' : newBest ? '새로운 최고 기록이에요. 멋져요!' : '잠깐의 모험, 잘 즐기셨나요?';
  $('#status').textContent = `미로 완주! ${formatTime(elapsed)}, ${steps}회 이동.`;
  $('#win-dialog').showModal();
}

document.querySelectorAll('[data-level]').forEach((button) => button.addEventListener('click', () => {
  if (level === button.dataset.level) return;
  level = button.dataset.level;
  document.querySelectorAll('[data-level]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  reset();
}));
$('#new-game').addEventListener('click', () => reset());
$('#restart').addEventListener('click', () => reset(false));
$('#hint').addEventListener('click', () => {
  if (finished) return;
  hint = !hint;
  if (hint) assisted = true;
  $('#hint').setAttribute('aria-pressed', String(hint));
  $('#status').textContent = hint ? '점선을 따라가 보세요. 힌트를 사용한 판은 최고 기록에 포함되지 않아요.' : '힌트를 숨겼어요. 천천히 길을 찾아보세요.';
  renderPosition();
});
$('#play-again').addEventListener('click', () => reset());
$('#close-dialog').addEventListener('click', () => { $('#win-dialog').close(); board.focus({ preventScroll: true }); });
document.querySelectorAll('[data-direction]').forEach(b => b.addEventListener('click', () => go(Number(b.dataset.direction))));

const keys = { ArrowUp: 0, w: 0, ArrowRight: 1, d: 1, ArrowDown: 2, s: 2, ArrowLeft: 3, a: 3 };
document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey || $('#win-dialog').open) return;
  if (event.target.closest('input, select, textarea, [contenteditable=true]')) return;
  const direction = keys[event.key] ?? keys[event.key.toLowerCase()];
  if (direction === undefined) return;
  event.preventDefault(); go(direction);
});

board.addEventListener('pointerdown', (event) => {
  if (!event.isPrimary || event.button !== 0) return;
  board.focus({ preventScroll: true });
  board.setPointerCapture(event.pointerId);
  pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
});
board.addEventListener('pointermove', (event) => {
  if (!pointer || event.pointerId !== pointer.id) return;
  const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y;
  const threshold = Math.max(15, Math.min(30, board.clientWidth / maze.size));
  const distance = Math.max(Math.abs(dx), Math.abs(dy));
  if (distance < threshold) return;
  const horizontal = Math.abs(dx) > Math.abs(dy);
  const direction = horizontal ? dx > 0 ? 1 : 3 : dy > 0 ? 2 : 0;
  const count = Math.min(maze.size, Math.floor(distance / threshold));
  for (let i = 0; i < count && !finished; i++) go(direction);
  if (pointer) { pointer.x = event.clientX; pointer.y = event.clientY; }
});
for (const name of ['pointerup', 'pointercancel', 'lostpointercapture']) board.addEventListener(name, (event) => {
  if (pointer?.id === event.pointerId) pointer = null;
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden && startedAt !== null) { elapsed = time(); startedAt = null; }
  else if (!document.hidden && steps > 0 && !finished) startedAt = performance.now();
});
setInterval(() => { if (!document.hidden && !finished) $('#timer').textContent = formatTime(time()); }, 200);
reset();
