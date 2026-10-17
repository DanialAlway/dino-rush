/* Dino Rush: a bigger take on the offline dinosaur game.
 * Plain canvas + vanilla JS, no build step. All art is drawn from pixel maps. */
(() => {
  'use strict';

  // ---------------------------------------------------------------------------
  // Constants
  // ---------------------------------------------------------------------------
  const W = 960, H = 360, GROUND = 300, PX = 3;
  const GRAVITY = 2700, JUMP_V = 900, AIR_JUMP_V = 800, JUMP_CUT = 520;
  const DAY_LEN = 90; // seconds for a full day/night cycle
  const FONT = '"Press Start 2P", monospace';
  const SAVE_KEY = 'dinoRush.save.v1';

  // ---------------------------------------------------------------------------
  // Pixel sprites  ('#' body, '+' accent, 'e' eye, ' ' empty)
  // ---------------------------------------------------------------------------
  const DINO_TOP = [
    '           ########',
    '          ##e######',
    '          #########',
    '          #########',
    '          #####',
    '          ########',
    '#        #####',
    '#       #######',
    '##     ##########',
    '###   ########  #',
    '#############',
    ' ###########',
    '  #########',
    '   #######',
  ];
  const LEGS_STAND = ['    ###  ##', '    ##    #', '    #     #', '    ##    ##'];
  const LEGS_RUN1  = ['    ###  ##', '    ##    ##', '    #', '    ##'];
  const LEGS_RUN2  = ['    ###  ##', '     ##   #', '          #', '          ##'];

  const DUCK_TOP = [
    '                    ########',
    '#        ########  ##e#######',
    '##     ######################',
    '###  ########################',
    '######################',
    ' ##################  #',
    '  ################',
    '   ##############',
  ];
  const DUCK_LEGS1 = ['    ###    ##', '    ##      ##', '    #'];
  const DUCK_LEGS2 = ['    ###    ##', '     ##     #', '            ##'];

  const FR_STAND = DINO_TOP.concat(LEGS_STAND);
  const FR_RUN1 = DINO_TOP.concat(LEGS_RUN1);
  const FR_RUN2 = DINO_TOP.concat(LEGS_RUN2);
  const FR_DUCK1 = DUCK_TOP.concat(DUCK_LEGS1);
  const FR_DUCK2 = DUCK_TOP.concat(DUCK_LEGS2);

  const PTERO_A = [
    '     #',
    '     ##',
    '     ###',
    '  #  ####',
    ' ##e #####',
    '###############',
    '   ###########',
    '     ######',
  ];
  const PTERO_B = [
    '',
    '',
    '',
    '  #',
    ' ##e',
    '###############',
    '   ###########',
    '     ########',
    '     #####',
    '     ###',
    '     ##',
  ];

  const CLOUD = [
    '      ######',
    '   ############',
    ' ################',
    '####################',
  ];

  // ---------------------------------------------------------------------------
  // Game data
  // ---------------------------------------------------------------------------
  const SKINS = [
    { id: 'classic', name: 'CLASSIC', price: 0, color: '#535353' },
    { id: 'forest', name: 'FOREST', price: 60, color: '#2f8f46' },
    { id: 'ocean', name: 'OCEAN', price: 120, color: '#2b6fd6' },
    { id: 'lava', name: 'LAVA', price: 200, color: '#d8432b' },
    { id: 'royal', name: 'ROYAL', price: 300, color: '#7b3fd1' },
    { id: 'gold', name: 'GOLDEN', price: 450, color: '#e0a91b' },
    { id: 'ghost', name: 'GHOST', price: 600, color: '#eef3ff', alpha: 0.6 },
    { id: 'rainbow', name: 'RAINBOW', price: 900, rainbow: true },
  ];

  const BIOMES = [
    {
      name: 'DESERT DUNES', weather: 'dust', obsKind: 'cactus',
      skyTop: '#f7d9a0', skyBot: '#fdf1d6', nTop: '#141a3a', nBot: '#3a3060',
      far: '#e8c08a', near: '#d9a868', ground: '#ecd3a0', line: '#8a6a3e', speck: '#b8915a',
      obs: '#3f7a3a', obsAccent: '#6fb35e', ptero: '#6b5a4a', rock: '#8b6b4a',
    },
    {
      name: 'GREEN PLAINS', weather: 'leaves', obsKind: 'cactus',
      skyTop: '#8fd3ff', skyBot: '#e2f6ff', nTop: '#0d1630', nBot: '#24345e',
      far: '#a6cfb0', near: '#6fae6a', ground: '#86c460', line: '#3f6b2c', speck: '#4f8c3a',
      obs: '#2e6b2a', obsAccent: '#58a34d', ptero: '#535353', rock: '#7d7468',
    },
    {
      name: 'FROZEN TUNDRA', weather: 'snow', obsKind: 'ice',
      skyTop: '#a9c8e4', skyBot: '#eef6fb', nTop: '#0b1426', nBot: '#2a3d5c',
      far: '#c9dbe9', near: '#a9c4da', ground: '#f2f7fb', line: '#7d98b0', speck: '#b5cad9',
      obs: '#3d8fc4', obsAccent: '#bfe8ff', ptero: '#46607a', rock: '#8fa7bf',
    },
    {
      name: 'VOLCANO ZONE', weather: 'ash', obsKind: 'rock',
      skyTop: '#d9694c', skyBot: '#f6c08a', nTop: '#1a0a10', nBot: '#4a1a1a',
      far: '#8a4a4a', near: '#5e2f2f', ground: '#4a3434', line: '#1f1414', speck: '#e0612a',
      obs: '#2a2222', obsAccent: '#ff7a2a', ptero: '#2b1d1d', rock: '#3a2a2a',
    },
  ];
  const COLOR_KEYS = ['skyTop', 'skyBot', 'nTop', 'nBot', 'far', 'near', 'ground', 'line',
    'speck', 'obs', 'obsAccent', 'ptero', 'rock'];

  const POWERS = {
    shield: { label: 'SHIELD', color: '#3fa9f5', icon: 'S' },
    magnet: { label: 'MAGNET', color: '#e8463b', icon: 'M' },
    slow: { label: 'SLOW-MO', color: '#9b59ff', icon: 'T' },
    double: { label: 'DOUBLE JUMP', color: '#2ecc71', icon: 'J' },
    x2: { label: '2X SCORE', color: '#f5b700', icon: '2' },
  };
  const POWER_KEYS = Object.keys(POWERS);

  const UPGRADES = [
    { id: 'dur', name: 'POWER TIME', desc: 'Power-ups last 1.5s longer per level.', max: 5, cost: lv => 80 * (lv + 1) },
    { id: 'startShield', name: 'HEAD START SHIELD', desc: 'Begin every run with a shield.', max: 1, cost: () => 250 },
  ];

  // ---------------------------------------------------------------------------
  // Save data (localStorage may be unavailable, so everything is guarded)
  // ---------------------------------------------------------------------------
  function defaults() {
    return { best: 0, coins: 0, owned: ['classic'], skin: 'classic', dur: 0, startShield: false, games: 0, muted: false };
  }
  function loadSave() {
    try {
      const raw = localStorage.getItem(SAVE_KEY);
      if (raw) return Object.assign(defaults(), JSON.parse(raw));
    } catch (e) { /* ignore */ }
    return defaults();
  }
  function persist() {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(save)); } catch (e) { /* ignore */ }
  }
  const save = loadSave();

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = t => t * t * (3 - 2 * t);
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.floor(rand(a, b + 1));
  const hash = i => { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };
  const spriteW = rows => rows.reduce((m, r) => Math.max(m, r.length), 0) * PX;

  function hexToRgb(h) {
    const n = parseInt(h.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function mix(a, b, t) {
    if (t <= 0) return a;
    if (t >= 1) return b;
    const A = hexToRgb(a), B = hexToRgb(b);
    return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
  }
  function weighted(list) {
    let total = 0;
    for (const [, w] of list) total += w;
    let r = Math.random() * total;
    for (const [k, w] of list) { if ((r -= w) < 0) return k; }
    return list[0][0];
  }
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // Draws a pixel map, merging horizontal runs of the same colour into one rect.
  function drawSprite(g, rows, x, top, colors) {
    x = Math.round(x); top = Math.round(top);
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      let c = 0;
      while (c < row.length) {
        const ch = row[c];
        if (ch === ' ') { c++; continue; }
        let e = c + 1;
        while (e < row.length && row[e] === ch) e++;
        let col = colors[ch];
        if (typeof col === 'function') col = col(r);
        if (col) {
          g.fillStyle = col;
          g.fillRect(x + c * PX, top + r * PX, (e - c) * PX, PX);
        }
        c = e;
      }
    }
  }

  function pixelCircle(cx, cy, r, color) {
    ctx.fillStyle = color;
    for (let y = -r; y < r; y += PX) {
      const hw = Math.sqrt(Math.max(0, r * r - (y + PX / 2) * (y + PX / 2)));
      const x0 = Math.round((cx - hw) / PX) * PX, x1 = Math.round((cx + hw) / PX) * PX;
      if (x1 > x0) ctx.fillRect(x0, Math.round(cy + y), x1 - x0, PX);
    }
  }

  // ---------------------------------------------------------------------------
  // Procedural obstacle shapes
  // ---------------------------------------------------------------------------
  const grid = (w, h) => Array.from({ length: h }, () => Array(w).fill(' '));
  const toRows = g => g.map(r => r.join('').replace(/\s+$/, ''));

  function makeCactus(big) {
    const w = big ? 9 : 7, h = big ? randInt(15, 17) : randInt(11, 13);
    const g = grid(w, h);
    const t0 = Math.floor((w - 3) / 2), t1 = t0 + 2;
    for (let y = 0; y < h; y++) for (let x = t0; x <= t1; x++) g[y][x] = '#';
    g[0][t0] = ' '; g[0][t1] = ' ';
    for (let y = 1; y < h - 1; y++) g[y][t0 + 1] = '+';
    const armLen = big ? 5 : 4, vw = Math.max(1, t0 - 1), thick = big ? 2 : 1;
    const arm = (left) => {
      const j = randInt(big ? 6 : 5, h - (big ? 5 : 4));
      for (let y = j - armLen + 1; y <= j; y++) {
        for (let k = 0; k < vw; k++) g[y][left ? k : w - 1 - k] = '#';
      }
      for (let y = j - thick + 1; y <= j; y++) {
        for (let k = 0; k < t0; k++) g[y][left ? k : w - 1 - k] = '#';
      }
    };
    if (Math.random() < 0.85) arm(true);
    if (Math.random() < 0.85) arm(false);
    return toRows(g);
  }

  function makeSpikes(big) {
    const w = big ? 10 : 7, h = big ? 16 : 12;
    const g = grid(w, h);
    const peaks = big ? [[2, h], [7, Math.round(h * 0.7)]] : [[3, h]];
    for (let x = 0; x < w; x++) {
      let ch = 2;
      for (const [pc, ph] of peaks) ch = Math.max(ch, ph - Math.abs(x - pc) * 3);
      ch = Math.min(h, ch);
      for (let y = h - ch; y < h; y++) g[y][x] = '#';
      if (peaks.some(([pc]) => pc === x)) for (let y = h - ch + 1; y < h - 2; y++) g[y][x] = '+';
    }
    return toRows(g);
  }

  function makeRock(big) {
    const w = big ? 11 : 8, h = big ? 13 : 10;
    const g = grid(w, h), mid = (w - 1) / 2;
    for (let x = 0; x < w; x++) {
      const ch = clamp(Math.round(h * (0.5 + 0.5 * (1 - Math.abs(x - mid) / mid)) + randInt(-1, 1)), 3, h);
      for (let y = h - ch; y < h; y++) g[y][x] = (y > h - ch + 1 && Math.random() < 0.12) ? '+' : '#';
    }
    return toRows(g);
  }

  const SHAPES = { cactus: makeCactus, ice: makeSpikes, rock: makeRock };

  // ---------------------------------------------------------------------------
  // Canvas
  // ---------------------------------------------------------------------------
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  let scale = 1;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssW = canvas.clientWidth || W;
    canvas.width = Math.round(cssW * dpr);
    canvas.height = Math.round(cssW * H / W * dpr);
    scale = canvas.width / W;
  }
  window.addEventListener('resize', resize);
  resize();

  // ---------------------------------------------------------------------------
  // Audio (tiny WebAudio synth, created on first user gesture)
  // ---------------------------------------------------------------------------
  let actx = null;
  function audio() {
    if (!actx) {
      try { actx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { actx = null; }
    }
    if (actx && actx.state === 'suspended') actx.resume();
    return actx;
  }
  function tone(f1, f2, dur, type = 'square', vol = 0.05, delay = 0) {
    if (save.muted) return;
    const a = audio();
    if (!a) return;
    const t0 = a.currentTime + delay;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f1, t0);
    if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(a.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }
  const sfx = {
    jump: () => tone(520, 900, 0.12),
    air: () => tone(700, 1400, 0.14, 'square', 0.045),
    coin: () => { tone(988, null, 0.06, 'square', 0.035); tone(1319, null, 0.12, 'square', 0.035, 0.06); },
    power: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, null, 0.1, 'square', 0.045, i * 0.07)),
    hit: () => { tone(260, 60, 0.4, 'sawtooth', 0.08); tone(130, 40, 0.5, 'square', 0.05, 0.05); },
    shield: () => tone(300, 1000, 0.25, 'triangle', 0.09),
    milestone: () => { tone(880, null, 0.08, 'square', 0.035); tone(1175, null, 0.14, 'square', 0.035, 0.09); },
    boom: () => tone(180, 40, 0.4, 'sawtooth', 0.06),
    zone: () => [392, 523, 659, 784, 1047].forEach((f, i) => tone(f, null, 0.14, 'triangle', 0.06, i * 0.1)),
    buy: () => [660, 880, 1320].forEach((f, i) => tone(f, null, 0.09, 'square', 0.04, i * 0.06)),
    nope: () => tone(160, 120, 0.18, 'square', 0.05),
  };

  // ---------------------------------------------------------------------------
  // World state
  // ---------------------------------------------------------------------------
  let state = 'menu'; // menu | play | pause | over
  let time = 0, elapsed = 0, score = 0, runCoins = 0;
  let worldX = 0, worldSpeed = 300, baseSpeed = 400;
  let nextGap = 600, powerTimer = 10, lastMilestone = 0, flashT = 0;
  let shake = 0, invuln = 0, cycleT = 0, night = 0, restartAt = 0, bestFlashed = false;

  const biome = { cur: 0, prev: 0, blend: 1, banner: 0 };
  const active = { shield: 0, magnet: 0, slow: 0, double: 0, x2: 0 };
  const activeMax = { shield: 1, magnet: 1, slow: 1, double: 1, x2: 1 };
  const input = { duck: false };
  const P = { x: 90, y: GROUND, vy: 0, ground: true, duck: false, airJumps: 0, buffer: 0, anim: 0, dead: false };

  const obstacles = [], coins = [], powerups = [], particles = [], weather = [], floaters = [];
  const clouds = Array.from({ length: 6 }, (_, i) => ({ x: i * 180 + rand(0, 100), y: rand(30, 140), s: rand(0.6, 1.2) }));
  const stars = Array.from({ length: 70 }, () => ({ x: rand(0, W), y: rand(0, GROUND - 90), tw: rand(0, 6), big: Math.random() < 0.15 }));

  const powerDuration = () => 7 + save.dur * 1.5;
  const currentSkin = () => SKINS.find(s => s.id === save.skin) || SKINS[0];

  // ---------------------------------------------------------------------------
  // Particles & floating text
  // ---------------------------------------------------------------------------
  function burst(x, y, n, color, speed = 220, life = 0.6, size = 3, grav = 700) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = speed * rand(0.3, 1);
      particles.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - speed * 0.3, life, max: life, color, size, grav });
    }
  }
  function dust(x, y, n = 1) {
    for (let i = 0; i < n; i++) {
      particles.push({ x: x + rand(-4, 4), y: y - rand(0, 4), vx: -rand(40, 140), vy: -rand(20, 80), life: 0.4, max: 0.4,
        color: 'rgba(120,100,80,.5)', size: 3, grav: 200 });
    }
  }
  function floater(x, y, text, color = '#fff') { floaters.push({ x, y, text, color, t: 0, max: 1.3 }); }

  // ---------------------------------------------------------------------------
  // Player
  // ---------------------------------------------------------------------------
  function playerRows() {
    if (P.dead || !P.ground) return FR_STAND;
    const f = Math.floor(P.anim) % 2;
    if (P.duck) return f ? FR_DUCK2 : FR_DUCK1;
    return f ? FR_RUN2 : FR_RUN1;
  }
  function playerBoxes() {
    const rows = playerRows();
    const h = rows.length * PX, top = P.y - h;
    if (rows === FR_DUCK1 || rows === FR_DUCK2) return [{ x: P.x + 4, y: top + 4, w: spriteW(rows) - 10, h: h - 6 }];
    return [
      { x: P.x + 30, y: top + 2, w: 26, h: 22 },
      { x: P.x + 6, y: top + 20, w: 40, h: h - 22 },
    ];
  }

  function doJump(v) {
    P.vy = -v;
    P.ground = false;
    dust(P.x + 20, P.y, 4);
  }
  function jumpPress() {
    if (state !== 'play' || P.dead) return;
    if (P.ground) { doJump(JUMP_V); sfx.jump(); }
    else if (P.airJumps > 0) {
      P.airJumps--;
      P.vy = -AIR_JUMP_V;
      burst(P.x + 28, P.y, 10, POWERS.double.color, 160, 0.4, 3, 0);
      sfx.air();
    } else P.buffer = 0.13; // jump buffer: fires on landing
  }
  function jumpRelease() {
    if (state === 'play' && !P.ground && P.vy < -JUMP_CUT) P.vy = -JUMP_CUT;
  }

  function updatePlayer(dt) {
    P.duck = input.duck;
    if (!P.ground) {
      P.vy += GRAVITY * (input.duck ? 2.6 : 1) * dt;
      P.y += P.vy * dt;
      if (P.y >= GROUND) {
        P.y = GROUND; P.vy = 0; P.ground = true;
        P.airJumps = active.double > 0 ? 1 : 0;
        dust(P.x + 20, P.y, 5);
        if (P.buffer > 0) { P.buffer = 0; doJump(JUMP_V); sfx.jump(); }
      }
    }
    P.buffer = Math.max(0, P.buffer - dt);
    P.anim += dt * worldSpeed / 45;
    if (P.ground && Math.random() < dt * 10) dust(P.x + 14, P.y);
  }

  // ---------------------------------------------------------------------------
  // Spawning
  // ---------------------------------------------------------------------------
  function spawnObstacleGroup(big, x0) {
    const kind = BIOMES[biome.cur].obsKind;
    let n = 1;
    if (Math.random() < (score > 400 ? 0.5 : 0.3)) n++;
    if (!big && score > 900 && Math.random() < 0.35) n++;
    let x = x0;
    for (let i = 0; i < n; i++) {
      const rows = SHAPES[kind](big);
      const w = spriteW(rows), h = rows.length * PX;
      obstacles.push({ kind: 'block', x, y: GROUND - h, w, h, rows });
      x += w - PX;
    }
    return x - x0;
  }

  function spawnPtero(x0) {
    const lvl = weighted([['low', 1], ['mid', 1.1], ['high', 0.8]]);
    const y = { low: GROUND - 34, mid: GROUND - 66, high: GROUND - 102 }[lvl];
    const w = spriteW(PTERO_A);
    obstacles.push({ kind: 'ptero', x: x0, y, w, h: 24, t: Math.random() });
    return { w, lvl };
  }

  function spawnMeteor(x0, s) {
    const vy = Math.max(380, s * 0.8), extra = 150;
    const T = (GROUND - 6 + 30) / vy;
    // Lands exactly where an obstacle spawned at x0 right now would be.
    const cx = x0 + 18 + extra * T;
    obstacles.push({ kind: 'meteor', x: cx - 11, y: -41, w: 22, h: 22, vy, vx: extra });
  }

  function spawnNext() {
    const s = baseSpeed, x0 = W + 20;
    const kind = weighted([
      ['small', 3],
      ['big', score > 120 ? 2.2 : 0.6],
      ['ptero', score > 350 ? 1.5 : 0],
      ['boulder', score > 800 ? 0.9 : 0],
      ['meteor', score > 1500 ? 0.8 : 0],
    ]);
    let w = 0, jumpable = true, filler = true, extraGap = 0;
    if (kind === 'small' || kind === 'big') w = spawnObstacleGroup(kind === 'big', x0);
    else if (kind === 'ptero') { const r = spawnPtero(x0); w = r.w; jumpable = r.lvl === 'low'; }
    else if (kind === 'boulder') {
      // Starts further away but rolls faster than the ground, so it catches up.
      obstacles.push({ kind: 'boulder', x: x0 + 300, y: GROUND - 42, w: 42, h: 42, vx: s * 0.25, rot: 0 });
      w = 42; filler = false; extraGap = 300;
    } else { spawnMeteor(x0, s); w = 36; }

    const gap = w + s * rand(0.72, 1.57) + 70 + extraGap;
    if (filler) fillGap(x0, w, gap, jumpable, s);
    nextGap += gap;
  }

  function fillGap(x0, w, gap, jumpable, s) {
    const free = gap - w;
    if (powerTimer <= 0 && free > 260) {
      const type = POWER_KEYS[randInt(0, POWER_KEYS.length - 1)];
      const high = Math.random() < 0.5;
      powerups.push({ x: x0 + w + free / 2 - 14, y: high ? GROUND - 140 : GROUND - 52, type, t: Math.random() * 6 });
      powerTimer = rand(14, 24);
      return;
    }
    const r = Math.random();
    if (r < 0.3 && jumpable) {
      // Coins along the jump arc over the obstacle.
      const span = s * 0.62 * 0.8, cx = x0 + w / 2;
      for (let i = 0; i <= 6; i++) {
        const t = i / 6;
        coins.push({ x: cx + (t - 0.5) * span, y: GROUND - 30 - Math.sin(Math.PI * t) * 105 });
      }
    } else if (r < 0.6 && free > 320) {
      const n = Math.min(6, Math.floor((free - 160) / 34));
      const start = x0 + w + (free - (n - 1) * 34) / 2;
      const y = Math.random() < 0.6 ? GROUND - 24 : GROUND - 120;
      for (let i = 0; i < n; i++) coins.push({ x: start + i * 34, y });
    }
  }

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------
  function scrollWorld(dt) {
    worldX += worldSpeed * dt;
    for (const c of clouds) {
      c.x -= (worldSpeed * 0.06 * c.s + 8) * dt;
      if (c.x < -80) { c.x = W + rand(0, 200); c.y = rand(30, 140); c.s = rand(0.6, 1.2); }
    }
  }

  function obstacleBox(o) {
    switch (o.kind) {
      case 'block': return { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 3 };
      case 'ptero': return { x: o.x + 3, y: o.y + 10, w: o.w - 6, h: 12 };
      case 'boulder': return { x: o.x + 5, y: o.y + 5, w: o.w - 10, h: o.h - 7 };
      case 'meteor': return { x: o.x + 3, y: o.y + 3, w: o.w - 6, h: o.h - 6 };
      case 'crater': return { x: o.x + 6, y: o.y + 6, w: o.w - 12, h: o.h - 6 };
    }
    return null;
  }

  function updateObstacles(dt) {
    for (const o of obstacles) {
      o.x -= (worldSpeed + (o.vx || 0)) * dt;
      if (o.kind === 'ptero') o.t += dt;
      else if (o.kind === 'boulder') {
        o.rot += (worldSpeed + o.vx) * dt / 21;
        if (Math.random() < dt * 20) dust(o.x + 21, GROUND);
      } else if (o.kind === 'meteor') {
        o.y += o.vy * dt;
        particles.push({ x: o.x + 11 + rand(-4, 4), y: o.y + 11 + rand(-4, 4), vx: rand(40, 120), vy: -rand(40, 120),
          life: 0.35, max: 0.35, color: Math.random() < 0.5 ? '#ffb347' : '#ff5a1f', size: 4, grav: 0 });
        if (o.y + 11 >= GROUND - 6) {
          const cx = o.x + 11;
          Object.assign(o, { kind: 'crater', x: cx - 18, y: GROUND - 18, w: 36, h: 18, vx: 0 });
          burst(cx, GROUND - 4, 22, '#ff7a1a', 300, 0.6, 4);
          burst(cx, GROUND - 4, 10, '#3a2a2a', 200, 0.7, 4);
          shake = Math.max(shake, 0.15);
          sfx.boom();
        }
      }
    }
    for (let i = obstacles.length - 1; i >= 0; i--) {
      const o = obstacles[i];
      if (o.dead || o.x + o.w < -60) obstacles.splice(i, 1);
    }
  }

  function updatePickups(dt) {
    const pb = playerBoxes();
    const pcx = P.x + 28, pcy = P.y - 27;
    for (const c of coins) {
      c.x -= worldSpeed * dt;
      if (active.magnet > 0) {
        const dx = pcx - c.x, dy = pcy - c.y, d = Math.hypot(dx, dy);
        if (d < 260 && d > 0) {
          const step = Math.min(d, 900 * dt);
          c.x += dx / d * step; c.y += dy / d * step;
        }
      }
      const box = { x: c.x - 10, y: c.y - 10, w: 20, h: 20 };
      if (pb.some(b => overlap(b, box))) {
        c.taken = true;
        runCoins++;
        sfx.coin();
        burst(c.x, c.y, 5, '#ffd84a', 120, 0.3, 3, 0);
      }
    }
    for (let i = coins.length - 1; i >= 0; i--) if (coins[i].taken || coins[i].x < -30) coins.splice(i, 1);

    for (const p of powerups) {
      p.x -= worldSpeed * dt;
      p.t += dt;
      const box = { x: p.x - 4, y: p.y - 4, w: 36, h: 36 };
      if (pb.some(b => overlap(b, box))) {
        p.taken = true;
        activatePower(p.type);
      }
    }
    for (let i = powerups.length - 1; i >= 0; i--) if (powerups[i].taken || powerups[i].x < -40) powerups.splice(i, 1);
  }

  function activatePower(type) {
    const d = powerDuration() * (type === 'shield' ? 2 : 1);
    if (active[type] !== Infinity) active[type] = d;
    activeMax[type] = d;
    if (type === 'double') P.airJumps = 1;
    const info = POWERS[type];
    floater(P.x + 30, P.y - 80, info.label + '!', info.color);
    burst(P.x + 28, P.y - 27, 16, info.color, 240, 0.5, 4, 0);
    sfx.power();
  }

  function checkCollisions() {
    if (invuln > 0) return;
    const pb = playerBoxes();
    for (const o of obstacles) {
      if (o.dead) continue;
      const ob = obstacleBox(o);
      if (ob && pb.some(b => overlap(b, ob))) { hitObstacle(o); return; }
    }
  }

  function hitObstacle(o) {
    if (active.shield > 0) {
      active.shield = 0;
      o.dead = true;
      invuln = 1;
      shake = 0.25;
      burst(o.x + o.w / 2, o.y + o.h / 2, 20, POWERS.shield.color, 300, 0.6, 4);
      floater(P.x + 30, P.y - 80, 'SHIELD BROKEN', POWERS.shield.color);
      sfx.shield();
      return;
    }
    die();
  }

  function updateWeather(dt) {
    const type = BIOMES[biome.cur].weather;
    const spawn = (rate, make) => { let n = rate * dt; while (n > 0) { if (Math.random() < n) weather.push(make()); n--; } };
    if (weather.length < 220) {
      if (type === 'snow') spawn(40, () => ({ x: rand(0, W + 200), y: -6, vx: -40 - worldSpeed * 0.25, vy: rand(40, 90),
        size: Math.random() < 0.3 ? 4 : 3, color: '#ffffff', wob: rand(0, 6), life: 8 }));
      else if (type === 'leaves') spawn(4, () => ({ x: W + 10, y: rand(20, GROUND - 60), vx: -worldSpeed * 0.6 - 40, vy: rand(10, 40),
        size: 4, color: ['#6ab04c', '#f0932b', '#badc58'][randInt(0, 2)], wob: rand(0, 6), life: 6 }));
      else if (type === 'dust') spawn(10, () => ({ x: W + 10, y: GROUND - rand(0, 50), vx: -worldSpeed * 1.3, vy: -rand(0, 15),
        size: 3, color: 'rgba(190,150,90,.55)', wob: 0, life: 3 }));
      else if (type === 'ash') {
        spawn(14, () => ({ x: rand(0, W + 200), y: -6, vx: -30 - worldSpeed * 0.2, vy: rand(30, 60),
          size: 3, color: 'rgba(80,70,70,.7)', wob: rand(0, 6), life: 8 }));
        spawn(6, () => ({ x: rand(0, W), y: GROUND, vx: -worldSpeed * 0.3, vy: -rand(60, 130),
          size: 3, color: '#ff8c32', wob: rand(0, 6), life: 2.2 }));
      }
    }
    for (const w of weather) {
      w.life -= dt;
      w.x += (w.vx + Math.sin(time * 3 + w.wob) * 20) * dt;
      w.y += w.vy * dt;
    }
    for (let i = weather.length - 1; i >= 0; i--) {
      const w = weather[i];
      if (w.life <= 0 || w.x < -20 || w.y > H || w.y < -20) weather.splice(i, 1);
    }
  }

  function updateParticles(dt) {
    for (const p of particles) {
      p.life -= dt;
      p.vy += p.grav * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    for (let i = particles.length - 1; i >= 0; i--) if (particles[i].life <= 0) particles.splice(i, 1);
    for (const f of floaters) { f.t += dt; f.y -= 30 * dt; }
    for (let i = floaters.length - 1; i >= 0; i--) if (floaters[i].t >= floaters[i].max) floaters.splice(i, 1);
  }

  function update(dt) {
    time += dt;
    if (state === 'pause') return;
    shake = Math.max(0, shake - dt);
    updateParticles(dt);
    updateWeather(dt);
    if (state === 'over') return;

    cycleT += dt;
    const raw = (1 - Math.cos((cycleT % DAY_LEN) / DAY_LEN * Math.PI * 2)) / 2;
    night = ease(clamp((raw - 0.35) / 0.3, 0, 1));

    if (state === 'menu') {
      worldSpeed = 300;
      scrollWorld(dt);
      P.anim += dt * 7;
      return;
    }

    // --- playing ---
    elapsed += dt;
    baseSpeed = 400 + 620 * (1 - Math.exp(-elapsed / 110));
    worldSpeed = baseSpeed * (active.slow > 0 ? 0.6 : 1);
    scrollWorld(dt);

    for (const k of POWER_KEYS) if (active[k] > 0 && active[k] !== Infinity) active[k] = Math.max(0, active[k] - dt);
    invuln = Math.max(0, invuln - dt);
    flashT = Math.max(0, flashT - dt);
    biome.banner = Math.max(0, biome.banner - dt);
    biome.blend = Math.min(1, biome.blend + dt / 2.5);
    powerTimer -= dt;

    score += worldSpeed * dt * 0.025 * (active.x2 > 0 ? 2 : 1);
    const ms = Math.floor(score / 100);
    if (ms > lastMilestone) { lastMilestone = ms; flashT = 0.9; sfx.milestone(); }
    if (!bestFlashed && save.best > 0 && score > save.best) {
      bestFlashed = true;
      floater(W / 2, 110, 'NEW BEST!', '#ffcc33');
    }
    const bi = Math.floor(score / 1000) % BIOMES.length;
    if (bi !== biome.cur) {
      biome.prev = biome.cur; biome.cur = bi; biome.blend = 0; biome.banner = 3;
      sfx.zone();
    }

    updatePlayer(dt);
    nextGap -= worldSpeed * dt;
    if (nextGap <= 0) spawnNext();
    updateObstacles(dt);
    updatePickups(dt);
    checkCollisions();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  function palette() {
    const a = BIOMES[biome.prev], b = BIOMES[biome.cur], k = ease(biome.blend);
    const p = {};
    for (const key of COLOR_KEYS) p[key] = mix(a[key], b[key], k);
    const n = night;
    p.skyTop = mix(p.skyTop, p.nTop, n);
    p.skyBot = mix(p.skyBot, p.nBot, n);
    p.far = mix(p.far, p.nBot, n * 0.6);
    p.near = mix(p.near, p.nTop, n * 0.5);
    p.ground = mix(p.ground, '#1c2033', n * 0.45);
    p.speck = mix(p.speck, '#1c2033', n * 0.3);
    p.obs = mix(p.obs, '#a7b4d6', n * 0.3);
    p.ptero = mix(p.ptero, '#b9c2e0', n * 0.6);
    p.text = mix('#535353', '#eef1ff', n);
    p.cloud = mix('#ffffff', '#4f5a84', n);
    return p;
  }

  function ridgeY(x, seed) {
    return Math.sin(x * 0.0031 + seed) * 0.55 + Math.sin(x * 0.0087 + seed * 1.7) * 0.3 + Math.sin(x * 0.021 + seed * 3.1) * 0.15;
  }
  function drawRidge(color, parallax, base, amp, seed, step) {
    const off = worldX * parallax;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(-20, GROUND);
    for (let x = -(off % step) - step; x <= W + step; x += step) {
      const y = Math.round((base - amp * (ridgeY(x + off, seed) * 0.5 + 0.5)) / PX) * PX;
      ctx.lineTo(x, y);
      ctx.lineTo(x + step, y);
    }
    ctx.lineTo(W + 20, GROUND);
    ctx.closePath();
    ctx.fill();
  }

  function drawBackground(p) {
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND);
    sky.addColorStop(0, p.skyTop);
    sky.addColorStop(1, p.skyBot);
    ctx.fillStyle = sky;
    ctx.fillRect(-20, -20, W + 40, GROUND + 20);

    if (night > 0.01) {
      for (const s of stars) {
        ctx.globalAlpha = night * (0.55 + 0.45 * Math.sin(time * 2 + s.tw));
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(Math.round(s.x), Math.round(s.y), s.big ? 4 : 2, s.big ? 4 : 2);
      }
      ctx.globalAlpha = night;
      pixelCircle(640, 88, 21, '#f4f1d8');
      pixelCircle(632, 82, 4, '#d8d3b4');
      pixelCircle(648, 98, 3, '#d8d3b4');
      ctx.globalAlpha = 1;
    }
    if (night < 0.99) {
      ctx.globalAlpha = (1 - night) * 0.25;
      pixelCircle(640, 92, 36, '#fff6c8');
      ctx.globalAlpha = 1 - night;
      pixelCircle(640, 92, 24, '#fff2a8');
      ctx.globalAlpha = 1;
    }

    drawRidge(p.far, 0.08, GROUND - 50, 90, 1.3, 12);
    for (const c of clouds) {
      ctx.globalAlpha = 0.85;
      drawSprite(ctx, CLOUD, c.x, c.y, { '#': p.cloud });
    }
    ctx.globalAlpha = 1;
    drawRidge(p.near, 0.25, GROUND - 6, 50, 4.2, 9);

    // Ground
    ctx.fillStyle = p.ground;
    ctx.fillRect(-20, GROUND, W + 40, H - GROUND + 20);
    ctx.fillStyle = p.line;
    ctx.fillRect(-20, GROUND, W + 40, 3);
    const tile = 18, i0 = Math.floor(worldX / tile);
    for (let i = i0; i < i0 + W / tile + 2; i++) {
      const h = hash(i), x = Math.round(i * tile - worldX);
      if (h < 0.4) {
        ctx.fillStyle = p.speck;
        ctx.fillRect(x + Math.floor(h * 10), GROUND + 9 + Math.floor(hash(i + 0.37) * 14) * PX, h < 0.15 ? 6 : 3, 3);
      } else if (h > 0.93) {
        ctx.fillStyle = p.line;
        ctx.fillRect(x, GROUND - 3, 6, 3);
      }
    }
  }

  function drawCoin(x, y, phase) {
    const w = Math.max(1, Math.round(Math.abs(Math.cos(phase)) * 3)) * 2 * PX;
    x = Math.round(x - w / 2); y = Math.round(y);
    ctx.fillStyle = '#c98a0c';
    ctx.fillRect(x, y - 6, w, 12);
    if (w > 6) ctx.fillRect(x + 3, y - 9, w - 6, 18);
    ctx.fillStyle = '#ffd84a';
    if (w > 6) { ctx.fillRect(x + 3, y - 6, w - 6, 12); }
    if (w > 12) { ctx.fillStyle = '#fff3a8'; ctx.fillRect(x + 6, y - 6, 3, 6); }
  }

  function drawPowerBox(x, y, type, size = 28, fontSize = 12) {
    const info = POWERS[type];
    ctx.fillStyle = 'rgba(0,0,0,.35)';
    ctx.fillRect(x + 3, y + 3, size, size);
    ctx.fillStyle = info.color;
    ctx.fillRect(x, y, size, size);
    ctx.fillStyle = 'rgba(255,255,255,.35)';
    ctx.fillRect(x, y, size, 3);
    ctx.fillStyle = '#fff';
    ctx.font = `${fontSize}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(info.icon, x + size / 2 + 1, y + size / 2 + 1);
  }

  function drawPickups() {
    for (const c of coins) drawCoin(c.x, c.y, time * 6 + c.x * 0.02);
    for (const p of powerups) {
      const bob = Math.sin(p.t * 4) * 4;
      ctx.globalAlpha = 0.25 + 0.15 * Math.sin(p.t * 8);
      ctx.fillStyle = POWERS[p.type].color;
      ctx.fillRect(p.x - 6, p.y - 6 + bob, 40, 40);
      ctx.globalAlpha = 1;
      drawPowerBox(p.x, p.y + bob, p.type);
    }
  }

  function drawBoulder(o, p) {
    const r = 21, cx = o.x + r, cy = o.y + r;
    const dark = mix(p.rock, '#000000', 0.3), light = mix(p.rock, '#ffffff', 0.25);
    const cos = Math.cos(o.rot), sin = Math.sin(o.rot);
    for (let y = -r; y < r; y += PX) {
      for (let x = -r; x < r; x += PX) {
        const dx = x + 1.5, dy = y + 1.5;
        if (dx * dx + dy * dy > r * r) continue;
        const u = dx * cos + dy * sin, v = -dx * sin + dy * cos;
        let col = p.rock;
        if ((Math.floor((u + 60) / 10) + Math.floor((v + 60) / 10)) % 3 === 0) col = dark;
        if (dx + dy < -r * 0.9) col = light;
        ctx.fillStyle = col;
        ctx.fillRect(Math.round(cx + x), Math.round(cy + y), PX, PX);
      }
    }
  }

  function drawObstacles(p) {
    for (const o of obstacles) {
      switch (o.kind) {
        case 'block':
          drawSprite(ctx, o.rows, o.x, o.y, { '#': p.obs, '+': p.obsAccent });
          break;
        case 'ptero':
          drawSprite(ctx, Math.floor(o.t / 0.18) % 2 ? PTERO_B : PTERO_A, o.x, o.y, { '#': p.ptero, e: '#ff4b3a' });
          break;
        case 'boulder':
          drawBoulder(o, p);
          break;
        case 'meteor':
          pixelCircle(o.x + 11, o.y + 11, 13, '#ff5a1f');
          pixelCircle(o.x + 11, o.y + 11, 8, '#ffd23f');
          break;
        case 'crater': {
          ctx.fillStyle = '#2a1a14';
          ctx.fillRect(Math.round(o.x), GROUND - 6, o.w, 6);
          for (let i = 0; i < 5; i++) {
            const fh = Math.round((8 + Math.sin(time * 18 + i * 1.7) * 4) / PX) * PX;
            const fx = Math.round(o.x + 3 + i * 6);
            ctx.fillStyle = '#ff5a1f';
            ctx.fillRect(fx, GROUND - 6 - fh, 6, fh);
            ctx.fillStyle = '#ffd23f';
            ctx.fillRect(fx + 1, GROUND - 6 - Math.round(fh / 2), 3, Math.round(fh / 2));
          }
          break;
        }
      }
    }
  }

  function drawPlayer() {
    const skin = currentSkin();
    const rows = playerRows();
    const w = spriteW(rows), h = rows.length * PX, top = P.y - h;

    const air = GROUND - P.y, sw = Math.max(16, 44 - air * 0.18);
    ctx.fillStyle = 'rgba(0,0,0,.14)';
    ctx.fillRect(Math.round(P.x + w / 2 - sw / 2), GROUND + 3, Math.round(sw), 3);

    if (invuln > 0 && Math.floor(time * 20) % 2 === 0) return;
    let body;
    if (skin.rainbow) body = r => `hsl(${Math.round(time * 160 + r * 18) % 360},85%,58%)`;
    else if (skin.id === 'classic') body = mix(skin.color, '#d9dcea', night);
    else body = skin.color;
    const eye = P.dead ? '#ff3b3b' : (skin.id === 'ghost' ? '#3a4a7a' : '#ffffff');
    ctx.globalAlpha = skin.alpha || 1;
    drawSprite(ctx, rows, P.x, top, { '#': body, e: eye });
    ctx.globalAlpha = 1;

    if (active.shield > 0 && !P.dead) {
      const fading = active.shield !== Infinity && active.shield < 2 && Math.floor(time * 10) % 2 === 0;
      if (!fading) {
        const rr = Math.max(w, h) / 2 + 10;
        ctx.beginPath();
        ctx.arc(P.x + w / 2, top + h / 2, rr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(63,169,245,.15)';
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(120,200,255,.85)';
        ctx.stroke();
      }
    }
    if (active.magnet > 0 && !P.dead) {
      ctx.strokeStyle = 'rgba(232,70,59,.35)';
      ctx.lineWidth = 2;
      const pulse = (time * 1.5) % 1;
      ctx.beginPath();
      ctx.arc(P.x + w / 2, top + h / 2, 30 + pulse * 120, 0, Math.PI * 2);
      ctx.globalAlpha = 1 - pulse;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  function drawFx() {
    for (const p of particles) {
      ctx.globalAlpha = clamp(p.life / p.max, 0, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
    }
    ctx.globalAlpha = 1;
    for (const w of weather) {
      ctx.fillStyle = w.color;
      ctx.fillRect(Math.round(w.x), Math.round(w.y), w.size, w.size);
    }
  }

  function text(str, x, y, size, color, align = 'left', shadow = null) {
    ctx.font = `${size}px ${FONT}`;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';
    if (shadow) { ctx.fillStyle = shadow; ctx.fillText(str, x + 2, y + 2); }
    ctx.fillStyle = color;
    ctx.fillText(str, x, y);
  }

  function drawHUD(p) {
    if (state === 'menu') return;
    const sc = String(Math.floor(score)).padStart(5, '0');
    const hi = String(Math.max(save.best, 0)).padStart(5, '0');
    if (flashT <= 0 || Math.floor(flashT * 8) % 2 === 0) text(sc, W - 20, 18, 16, p.text, 'right');
    ctx.globalAlpha = 0.6;
    text('HI ' + hi, W - 20 - 16 * 5 - 24, 18, 16, p.text, 'right');
    ctx.globalAlpha = 0.75;
    text(`ZONE ${Math.floor(score / 1000) + 1} · ${BIOMES[biome.cur].name}`, W - 20, 44, 8, p.text, 'right');
    ctx.globalAlpha = 1;

    drawCoin(30, 26, time * 4);
    text(String(runCoins), 46, 19, 14, p.text);

    let y = 50;
    for (const k of POWER_KEYS) {
      if (active[k] <= 0) continue;
      drawPowerBox(20, y, k, 20, 9);
      const ratio = active[k] === Infinity ? 1 : active[k] / activeMax[k];
      ctx.fillStyle = 'rgba(0,0,0,.25)';
      ctx.fillRect(48, y + 7, 80, 6);
      ctx.fillStyle = POWERS[k].color;
      ctx.fillRect(48, y + 7, Math.round(80 * ratio), 6);
      y += 28;
    }

    for (const f of floaters) {
      ctx.globalAlpha = clamp(1 - f.t / f.max, 0, 1);
      text(f.text, f.x, f.y, 10, f.color, 'center', 'rgba(0,0,0,.5)');
    }
    ctx.globalAlpha = 1;

    if (biome.banner > 0) {
      const t = biome.banner;
      ctx.globalAlpha = clamp(Math.min(t, (3 - t) * 3), 0, 1);
      text(`ZONE ${Math.floor(score / 1000) + 1}`, W / 2, 96, 24, '#ffffff', 'center', 'rgba(0,0,0,.55)');
      text(BIOMES[biome.cur].name, W / 2, 134, 12, '#ffcc33', 'center', 'rgba(0,0,0,.55)');
      ctx.globalAlpha = 1;
    }
  }

  function render() {
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.imageSmoothingEnabled = false;
    const p = palette();

    ctx.save();
    if (shake > 0) ctx.translate(rand(-1, 1) * shake * 30, rand(-1, 1) * shake * 30);
    drawBackground(p);
    drawPickups();
    drawObstacles(p);
    drawPlayer();
    drawFx();
    ctx.restore();

    if (active.slow > 0 && state !== 'menu') {
      ctx.fillStyle = 'rgba(140,90,255,.10)';
      ctx.fillRect(0, 0, W, H);
    }
    drawHUD(p);
  }

  // ---------------------------------------------------------------------------
  // Game flow
  // ---------------------------------------------------------------------------
  const $ = id => document.getElementById(id);
  const ui = { menu: $('menu'), pause: $('pause'), over: $('over'), shop: $('shop') };
  const isOpen = name => !ui[name].classList.contains('hidden');
  function show(name) {
    for (const k in ui) ui[k].classList.toggle('hidden', k !== name);
  }

  function resetRun() {
    obstacles.length = coins.length = powerups.length = particles.length = floaters.length = 0;
    score = 0; runCoins = 0; elapsed = 0; lastMilestone = 0; flashT = 0;
    nextGap = 500; powerTimer = 10; invuln = 0; shake = 0; cycleT = 0; bestFlashed = false;
    baseSpeed = worldSpeed = 400;
    for (const k of POWER_KEYS) { active[k] = 0; activeMax[k] = 1; }
    if (save.startShield) active.shield = Infinity;
    Object.assign(P, { y: GROUND, vy: 0, ground: true, duck: false, airJumps: 0, buffer: 0, dead: false });
    Object.assign(biome, { cur: 0, prev: 0, blend: 1, banner: 3 });
  }

  function startGame() {
    audio();
    resetRun();
    state = 'play';
    show(null);
  }

  function die() {
    P.dead = true;
    state = 'over';
    shake = 0.4;
    sfx.hit();
    burst(P.x + 28, P.y - 27, 26, currentSkin().color || '#ff4fd8', 340, 0.8, 4);

    const final = Math.floor(score);
    const bonus = Math.floor(final / 50);
    const earned = runCoins + bonus;
    const newBest = final > save.best;
    if (newBest) save.best = final;
    save.coins += earned;
    save.games++;
    persist();

    restartAt = time + 0.8;
    $('oScore').textContent = final;
    $('oBest').textContent = save.best;
    $('oCoins').textContent = '+' + earned;
    $('oZone').textContent = `Zone ${Math.floor(final / 1000) + 1} · ${BIOMES[biome.cur].name} · ${runCoins} coins + ${bonus} score bonus`;
    $('newBest').classList.toggle('hidden', !newBest);
    setTimeout(() => { if (state === 'over' && !isOpen('shop')) show('over'); }, 700);
  }

  function goMenu() {
    state = 'menu';
    obstacles.length = coins.length = powerups.length = 0;
    for (const k of POWER_KEYS) active[k] = 0;
    Object.assign(P, { y: GROUND, vy: 0, ground: true, duck: false, dead: false });
    $('mBest').textContent = save.best;
    $('mCoins').textContent = save.coins;
    show('menu');
  }

  function togglePause() {
    if (state === 'play') { state = 'pause'; show('pause'); }
    else if (state === 'pause') resume();
  }
  function resume() {
    if (state !== 'pause') return;
    state = 'play';
    show(null);
    last = performance.now();
  }

  function toggleMute() {
    save.muted = !save.muted;
    persist();
    $('btnMute').classList.toggle('off', save.muted);
  }

  // ---------------------------------------------------------------------------
  // Shop
  // ---------------------------------------------------------------------------
  function drawPreview(cv, skin) {
    const g = cv.getContext('2d');
    g.imageSmoothingEnabled = false;
    g.clearRect(0, 0, cv.width, cv.height);
    const rows = FR_STAND, w = spriteW(rows), h = rows.length * PX;
    g.fillStyle = '#8a6a3e';
    g.fillRect(8, cv.height - 14, cv.width - 16, 3);
    g.globalAlpha = skin.alpha || 1;
    const body = skin.rainbow ? (r => `hsl(${r * 20},85%,58%)`) : skin.color;
    drawSprite(g, rows, (cv.width - w) / 2, cv.height - 14 - h, { '#': body, e: skin.id === 'ghost' ? '#3a4a7a' : '#ffffff' });
    g.globalAlpha = 1;
  }

  function renderShop() {
    $('sCoins').textContent = save.coins;
    const gridEl = $('skinGrid');
    gridEl.innerHTML = '';
    for (const s of SKINS) {
      const owned = save.owned.includes(s.id), eq = save.skin === s.id;
      const card = document.createElement('button');
      card.className = 'skin' + (eq ? ' equipped' : '') + (!owned && save.coins < s.price ? ' locked' : '');
      card.dataset.skin = s.id;
      const cv = document.createElement('canvas');
      cv.width = 120; cv.height = 90;
      drawPreview(cv, s);
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = s.name;
      const price = document.createElement('div');
      price.className = 'price';
      price.textContent = eq ? 'EQUIPPED' : owned ? 'EQUIP' : '● ' + s.price;
      card.append(cv, name, price);
      gridEl.append(card);
    }

    const up = $('upgrades');
    up.innerHTML = '';
    for (const u of UPGRADES) {
      const lv = u.id === 'dur' ? save.dur : (save.startShield ? 1 : 0);
      const maxed = lv >= u.max, cost = u.cost(lv);
      const row = document.createElement('div');
      row.className = 'upgrade';
      row.innerHTML = `<div class="info"><div class="uname">${u.name}</div><div class="udesc">${u.desc}</div>
        <div class="pips">${Array.from({ length: u.max }, (_, i) => `<i class="${i < lv ? 'on' : ''}"></i>`).join('')}</div></div>`;
      const btn = document.createElement('button');
      btn.className = 'btn' + (maxed ? '' : ' primary');
      btn.dataset.up = u.id;
      btn.disabled = maxed;
      btn.textContent = maxed ? 'MAXED' : '● ' + cost;
      row.append(btn);
      up.append(row);
    }
  }

  function openShop() {
    renderShop();
    show('shop');
  }

  function buySkin(id, el) {
    const s = SKINS.find(x => x.id === id);
    if (!s) return;
    if (save.owned.includes(id)) { save.skin = id; sfx.coin(); }
    else if (save.coins >= s.price) {
      save.coins -= s.price;
      save.owned.push(id);
      save.skin = id;
      sfx.buy();
    } else { nope(el); return; }
    persist();
    renderShop();
  }

  function buyUpgrade(id, el) {
    const u = UPGRADES.find(x => x.id === id);
    const lv = id === 'dur' ? save.dur : (save.startShield ? 1 : 0);
    if (!u || lv >= u.max) return;
    const cost = u.cost(lv);
    if (save.coins < cost) { nope(el); return; }
    save.coins -= cost;
    if (id === 'dur') save.dur++; else save.startShield = true;
    sfx.buy();
    persist();
    renderShop();
  }

  function nope(el) {
    sfx.nope();
    el.classList.remove('nope');
    void el.offsetWidth;
    el.classList.add('nope');
  }

  // ---------------------------------------------------------------------------
  // Input
  // ---------------------------------------------------------------------------
  document.addEventListener('click', e => {
    const skinEl = e.target.closest('[data-skin]');
    if (skinEl) { skinEl.blur(); buySkin(skinEl.dataset.skin, skinEl); return; }
    const upEl = e.target.closest('[data-up]');
    if (upEl) { upEl.blur(); buyUpgrade(upEl.dataset.up, upEl); return; }
    const actEl = e.target.closest('[data-act]');
    if (!actEl) return;
    actEl.blur();
    switch (actEl.dataset.act) {
      case 'play': startGame(); break;
      case 'shop': openShop(); break;
      case 'help': $('help').classList.toggle('hidden'); break;
      case 'resume': resume(); break;
      case 'menu': case 'back': goMenu(); break;
    }
  });

  const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW'];
  const DUCK_KEYS = ['ArrowDown', 'KeyS'];

  window.addEventListener('keydown', e => {
    const isJump = JUMP_KEYS.includes(e.code), isDuck = DUCK_KEYS.includes(e.code);
    if (isJump || isDuck) e.preventDefault();
    if (isJump || e.code === 'Enter') {
      if (e.repeat) return;
      if (isOpen('shop')) return;
      if (state === 'menu') { startGame(); return; }
      if (state === 'over') { if (time >= restartAt) startGame(); return; }
      if (state === 'pause') { resume(); return; }
      if (isJump) jumpPress();
    }
    if (isDuck) input.duck = true;
    if (e.code === 'Escape' && isOpen('shop')) { goMenu(); return; }
    if (e.code === 'KeyP' || e.code === 'Escape') togglePause();
    if (e.code === 'KeyM') toggleMute();
  });
  window.addEventListener('keyup', e => {
    if (JUMP_KEYS.includes(e.code)) jumpRelease();
    if (DUCK_KEYS.includes(e.code)) input.duck = false;
  });

  function hold(el, down, up) {
    el.addEventListener('pointerdown', e => { e.preventDefault(); audio(); down(); });
    for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) el.addEventListener(ev, up);
    el.addEventListener('contextmenu', e => e.preventDefault());
  }
  hold($('tJump'), () => {
    if (state === 'over' && time >= restartAt) startGame();
    else jumpPress();
  }, jumpRelease);
  hold($('tDuck'), () => { input.duck = true; }, () => { input.duck = false; });
  hold(canvas, jumpPress, jumpRelease);

  $('btnPause').addEventListener('click', e => { e.currentTarget.blur(); togglePause(); });
  $('btnMute').addEventListener('click', e => { e.currentTarget.blur(); toggleMute(); });
  $('btnMute').classList.toggle('off', save.muted);

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && state === 'play') togglePause();
  });

  if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) document.body.classList.add('is-touch');

  // ---------------------------------------------------------------------------
  // Main loop
  // ---------------------------------------------------------------------------
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, Math.max(0, (now - last) / 1000));
    last = now;
    update(dt);
    render();
    requestAnimationFrame(frame);
  }

  goMenu();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(resize);
  requestAnimationFrame(frame);
})();
