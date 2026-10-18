/* Dino Rush: playable characters besides the dino.
 * Each one is a chibi built by a small pixel-art generator: big head, tiny body,
 * two-frame run, and a squished duck pose. All characters are original designs.
 *
 * Palette letters: '#' body/outfit  'w' light patch  'o' outline  'e' eyes/dark  'p' cheeks
 *                  'i' inner ear  'a' accent  'd' dark marks  't' teeth  'm' mane
 *                  's' sprout  'f' feet  'k' skin  'h' hair  'b' tears  'r' lips  'x' eye shine
 *
 * The POP MART group is fan art of Pop Mart characters; it is not affiliated with Pop Mart. */
window.DinoCharacters = (() => {
  'use strict';

  const make = (w, h) => Array.from({ length: h }, () => Array(w).fill(' '));
  const set = (g, x, y, ch) => { if (g[y] && x >= 0 && x < g[y].length) g[y][x] = ch; };
  const isBody = (g, x, y) => g[y] && g[y][x] === '#';

  function ellipse(g, cx, cy, rx, ry, ch, onlyFilled = false) {
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
        const dx = (x - cx) / rx, dy = (y - cy) / ry;
        if (dx * dx + dy * dy > 1) continue;
        if (onlyFilled && !(g[y] && g[y][x] !== ' ')) continue;
        set(g, x, y, ch);
      }
    }
  }

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => Math.round(v * k));
    return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
  }

  // ---------------------------------------------------------------------------
  // Generator
  // ---------------------------------------------------------------------------
  const HEAD_TOP = { bunny: 6, monster: 4, horn: 3, antenna: 3 };
  const HAIR_TOP = { cloud: 4, messy: 4, spiky: 4, bun: 4 };

  // Hair for human characters: a cap over the head plus a style on top.
  function hair(g, style, T) {
    for (let y = T - 1; y <= T + 2; y++) {
      for (let x = 4; x <= 20; x++) {
        const dx = (x - 12) / 7.1, dy = (y - (T + 4.5)) / 5.7;
        if (dx * dx + dy * dy <= 1) set(g, x, y, 'h');
      }
    }
    for (let y = T + 3; y <= T + 7; y++) for (let x = 5; x <= 8; x++) if (g[y][x] === 'k') set(g, x, y, 'h');
    const px = pts => pts.forEach(([x, y]) => set(g, x, y, 'h'));
    switch (style) {
      case 'long': for (let y = T + 3; y <= T + 13; y++) for (const x of [4, 5, 6]) set(g, x, y, 'h'); break;
      case 'messy': px([[8, T - 2], [11, T - 2], [14, T - 2], [10, T - 3], [16, T - 1], [17, T], [6, T]]); break;
      case 'spiky': px([[7, T - 2], [9, T - 3], [12, T - 4], [15, T - 3], [17, T - 2], [11, T - 2], [13, T - 2], [8, T - 2], [14, T - 2]]); break;
      case 'cloud':
        for (const [cx, cy, rx, ry] of [[7.5, T + 0.5, 3.2, 2.6], [12, T - 1, 3.8, 2.6], [16.5, T + 0.5, 3.2, 2.6], [5.5, T + 3.2, 2.4, 2.6]]) ellipse(g, cx, cy, rx, ry, 'h');
        break;
      case 'bun': ellipse(g, 11, T - 1.8, 2, 1.6, 'h'); break;
    }
  }

  function ears(g, type, T, ch) {
    const px = (pts, c = ch) => pts.forEach(([x, y]) => set(g, x, y, c));
    switch (type) {
      case 'cat':
        px([[7, T - 2], [7, T - 1], [8, T - 1], [6, T], [7, T], [8, T], [9, T]]);
        px([[16, T - 2], [15, T - 1], [16, T - 1], [14, T], [15, T], [16, T], [17, T]]);
        px([[8, T - 1], [15, T - 1]], 'i');
        break;
      case 'bear':
        ellipse(g, 7.5, T - 0.5, 1.7, 1.5, ch);
        ellipse(g, 16.5, T - 0.5, 1.7, 1.5, ch);
        px([[7, T - 1], [16, T - 1]], 'i');
        break;
      case 'bunny':
        for (let y = 0; y <= T; y++) { set(g, 8, y, ch); set(g, 9, y, ch); }
        for (let y = 1; y <= T; y++) { set(g, 13, y, ch); set(g, 14, y, ch); }
        for (let y = 1; y < T; y++) set(g, 9, y, 'i');
        for (let y = 2; y < T; y++) set(g, 13, y, 'i');
        break;
      case 'monster':
        px([[7, 0], [7, 1], [8, 1], [6, 2], [7, 2], [8, 2], [6, 3], [7, 3], [8, 3]]);
        px([[16, 0], [15, 1], [16, 1], [15, 2], [16, 2], [17, 2], [15, 3], [16, 3], [17, 3]]);
        px([[7, 2], [7, 3], [16, 2], [16, 3]], 'i');
        break;
      case 'horn':
        px([[8, T - 2], [8, T - 1], [9, T - 1]]);
        px([[15, 0], [14, 1], [15, 1], [13, 2], [14, 2]], 'a');
        break;
      case 'antenna':
        px([[9, 1], [9, 2], [15, 1], [15, 2]], 'e');
        px([[9, 0], [15, 0]], 'a');
        break;
      case 'sprout':
        px([[12, 1], [11, 0], [13, 0]], 's');
        break;
      case 'frog':
        ellipse(g, 13.8, T + 0.2, 1.6, 1.5, ch);
        ellipse(g, 17.2, T + 0.2, 1.6, 1.5, ch);
        break;
    }
  }

  function tail(g, type, T) {
    const px = (pts, c) => pts.forEach(([x, y]) => set(g, x, y, c));
    switch (type) {
      case 'cat': px([[3, T + 6], [4, T + 7], [4, T + 8], [4, T + 9], [5, T + 10], [5, T + 11], [6, T + 11]], '#'); break;
      case 'fox':
        ellipse(g, 4.5, T + 9.5, 2.2, 3, '#');
        ellipse(g, 3.6, T + 7.4, 1.3, 1.2, 'w');
        break;
      case 'puff': ellipse(g, 5.2, T + 11, 1.3, 1.2, 'w'); break;
      case 'curl': px([[4, T + 8], [5, T + 8], [4, T + 9], [5, T + 10]], '#'); break;
      case 'mane': ellipse(g, 4.6, T + 10, 1.6, 2.6, 'm'); break;
      case 'stinger': px([[4, T + 11], [5, T + 11]], 'e'); break;
    }
  }

  // Wraps every filled cell in a 1-cell outline so characters read on any sky.
  function outline(g) {
    const H = g.length + 2, W = g[0].length + 2, out = make(W, H);
    for (let y = 0; y < g.length; y++) for (let x = 0; x < g[0].length; x++) out[y + 1][x + 1] = g[y][x];
    const filled = (x, y) => out[y] && out[y][x] && out[y][x] !== ' ' && out[y][x] !== 'O';
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (out[y][x] !== ' ') continue;
        if (filled(x - 1, y) || filled(x + 1, y) || filled(x, y - 1) || filled(x, y + 1)) out[y][x] = 'O';
      }
    }
    return out.map(r => r.map(c => (c === 'O' ? 'o' : c)));
  }

  function chibi(o) {
    const T = HEAD_TOP[o.ears] ?? HAIR_TOP[o.hair] ?? (o.beret ? 3 : 2);
    const W = 23, H = T + 16;
    const base = make(W, H);
    const earCh = o.earChar || '#';

    ears(base, o.ears, T, earCh);
    tail(base, o.tail, T);
    ellipse(base, 11, T + 11.5, 5, 3, '#');           // body
    ellipse(base, 12, T + 4.5, 6.6, 5.2, o.human ? 'k' : '#');   // head
    if (o.ears === 'frog') ears(base, 'frog', T, earCh);

    if (o.face) ellipse(base, 13.5, T + 5.5, 4.6, 3.6, 'w');
    if (o.belly) ellipse(base, 11.5, T + 12, 2.6, 1.8, 'w');
    if (o.mane) ellipse(base, 6.6, T + 3.2, 1.4, 3.4, 'm');
    if (o.stripes) for (const x of [10, 12, 14]) for (const y of [T, T + 1]) if (isBody(base, x, y)) set(base, x, y, 'd');
    if (o.bodyStripes) for (const x of [9, 12, 15]) for (let y = T + 9; y <= T + 14; y++) if (isBody(base, x, y)) set(base, x, y, 'd');
    if (o.spots) for (const [x, y] of [[8, T + 2], [9, T + 2], [8, T + 3], [10, T + 11], [11, T + 11], [10, T + 12], [14, T + 12]]) if (isBody(base, x, y)) set(base, x, y, 'd');
    if (o.gills) for (const [x, y] of [[4, T + 1], [5, T + 2], [3, T + 3], [4, T + 3], [5, T + 4], [4, T + 6], [5, T + 6]]) set(base, x, y, 'a');
    if (o.muzzle) ellipse(base, 16.4, T + 6.6, 2.3, 1.3, 'w');
    if (o.patches) { ellipse(base, 14, T + 4.6, 1.2, 1.7, 'd'); ellipse(base, 17, T + 4.6, 1.2, 1.7, 'd'); }
    if (o.hair) hair(base, o.hair, T);
    if (o.beret) { ellipse(base, 10.5, T - 0.6, 5.5, 1.5, 'a'); set(base, 10, T - 2, 'a'); }
    if (o.bow) [[10, T - 1], [11, T - 1], [13, T - 1], [14, T - 1], [10, T], [11, T], [12, T], [13, T], [14, T], [10, T + 1], [14, T + 1]]
      .forEach(([x, y]) => set(base, x, y, 'a'));

    // Face (looking right)
    const side = o.muzzle || o.snout || o.beak;
    if (o.ears === 'frog') { set(base, 14, T, 'e'); set(base, 17, T, 'e'); }
    else if (o.bigEyes) {
      for (const x of [13, 14, 16, 17]) for (const y of [T + 4, T + 5]) set(base, x, y, 'e');
      set(base, 14, T + 4, 'x'); set(base, 17, T + 4, 'x');
    } else if (o.closedEyes) [[13, T + 5], [14, T + 5], [16, T + 5], [17, T + 5]].forEach(([x, y]) => set(base, x, y, 'e'));
    else if (o.smallEyes) { set(base, 14, T + 5, 'e'); set(base, 17, T + 5, 'e'); }
    else {
      const eye = o.patches ? 'w' : 'e';
      for (const x of [14, 17]) { set(base, x, T + 4, eye); if (!o.patches) set(base, x, T + 5, eye); }
    }
    if (o.cheeks !== false) { set(base, 13, T + 6, 'p'); if (!side) set(base, 18, T + 6, 'p'); }
    if (o.tears) [[13, T + 6], [13, T + 7], [16, T + 6], [16, T + 7], [13, T + 8]].forEach(([x, y]) => set(base, x, y, 'b'));
    if (o.snout) {
      for (const x of [15, 16, 17, 18]) { set(base, x, T + 6, 'i'); set(base, x, T + 7, 'i'); }
      set(base, 16, T + 7, 'e'); set(base, 17, T + 7, 'e');
    }
    if (o.muzzle) { set(base, 18, T + 6, 'e'); set(base, 17, T + 7, 'e'); }
    if (o.beak) [[18, T + 5], [19, T + 5], [20, T + 5], [18, T + 6], [19, T + 6]].forEach(([x, y]) => set(base, x, y, 'a'));
    if (o.nose) [[15, T + 6], [16, T + 6], [15, T + 7], [16, T + 7]].forEach(([x, y]) => set(base, x, y, 'e'));
    switch (o.mouth || (side || o.nose ? 'none' : 'smile')) {
      case 'smile': set(base, 15, T + 6, 'e'); set(base, 16, T + 6, 'e'); break;
      case 'grin':
        [[14, 't'], [15, 'e'], [16, 't'], [17, 'e']].forEach(([x, c]) => set(base, x, T + 6, c));
        set(base, 15, T + 7, 'e'); set(base, 16, T + 7, 'e');
        break;
      case 'wide': for (let x = 14; x <= 18; x++) set(base, x, T + 6, 'e'); break;
      case 'pout': set(base, 15, T + 7, 'r'); break;
    }

    // Legs: stand, and two run frames.
    const legs = {
      stand: [[8, 14], [9, 14], [8, 15], [9, 15], [13, 14], [14, 14], [13, 15], [14, 15]],
      run1: [[9, 14], [10, 14], [9, 15], [10, 15], [13, 14], [14, 14]],
      run2: [[8, 14], [9, 14], [12, 14], [13, 14], [12, 15], [13, 15]],
    };
    const frames = {};
    for (const k in legs) {
      const g = base.map(r => r.slice());
      for (const [x, y] of legs[k]) set(g, x, T + y, 'f');
      frames[k] = outline(g);
    }

    // Trim empty columns shared by every frame, then turn grids into strings.
    const all = Object.values(frames);
    let minX = Infinity;
    for (const g of all) for (const r of g) { const i = r.findIndex(c => c !== ' '); if (i >= 0) minX = Math.min(minX, i); }
    const toRows = g => g.map(r => r.slice(minX).join('').replace(/\s+$/, ''));
    const squish = rows => rows.filter((_, i) => i % 2 === 0 || i === rows.length - 1);
    const stand = toRows(frames.stand), run1 = toRows(frames.run1), run2 = toRows(frames.run2);
    return { stand, run1, run2, duck1: squish(run1), duck2: squish(run2) };
  }

  // ---------------------------------------------------------------------------
  // Roster
  // ---------------------------------------------------------------------------
  const DEFS = [
    // Pop Mart (fan art)
    { id: 'labubu', name: 'LABUBU', group: 'popmart', ears: 'monster', face: true, mouth: 'grin', pal: { '#': '#a3784e', w: '#f6e3c8', i: '#f5a0b4' } },
    { id: 'mokoko', name: 'MOKOKO', group: 'popmart', ears: 'monster', face: true, mouth: 'grin', pal: { '#': '#f7a8c4', w: '#fff1f5', i: '#ff7fa6' } },
    { id: 'zimomo', name: 'ZIMOMO', group: 'popmart', ears: 'monster', face: true, mouth: 'grin', tail: 'cat', pal: { '#': '#6e4a32', w: '#e9d2b4', i: '#e98aa0' } },
    { id: 'molly', name: 'MOLLY', group: 'popmart', human: true, hair: 'bob', beret: true, bigEyes: true, mouth: 'pout', pal: { '#': '#f2e6cf', h: '#f2c14e', a: '#d83a3a', e: '#2fa7a3' } },
    { id: 'dimoo', name: 'DIMOO', group: 'popmart', human: true, hair: 'cloud', smallEyes: true, pal: { '#': '#9cc7f0', h: '#f7f7fb', o: '#5b6f91' } },
    { id: 'skullpanda', name: 'SKULLPANDA', group: 'popmart', ears: 'bear', face: true, bigEyes: true, cheeks: false, mouth: 'none', pal: { '#': '#f2f2f2', w: '#2b2b33', e: '#ffffff', i: '#2b2b33', x: '#9fd8ff' } },
    { id: 'crybaby', name: 'CRYBABY', group: 'popmart', ears: 'bunny', face: true, bigEyes: true, tears: true, mouth: 'pout', pal: { '#': '#ffb3c8', w: '#ffe8de', i: '#ff8fb1', e: '#3a2a3a' } },
    { id: 'hirono', name: 'HIRONO', group: 'popmart', human: true, hair: 'messy', smallEyes: true, cheeks: false, mouth: 'none', pal: { '#': '#6b7a8f', h: '#2b2724', k: '#f8ece4' } },
    { id: 'pucky', name: 'PUCKY', group: 'popmart', ears: 'sprout', face: true, bigEyes: true, mouth: 'pout', pal: { '#': '#8fd1a8', w: '#fff0e6', s: '#4caf6a', e: '#1f1f1f' } },
    { id: 'hacipupu', name: 'HACIPUPU', group: 'popmart', ears: 'bear', face: true, bigEyes: true, pal: { '#': '#c9925f', w: '#ffe9dc', i: '#f2b8a0' } },
    { id: 'sweetbean', name: 'SWEET BEAN', group: 'popmart', human: true, hair: 'messy', smallEyes: true, pal: { '#': '#ffffff', h: '#b07a46', o: '#5a4a40' } },
    { id: 'popbunny', name: 'BUNNY', group: 'popmart', ears: 'bunny', bow: true, tail: 'puff', pal: { '#': '#fff4e6', a: '#e8456f' } },
    { id: 'yoki', name: 'YOKI', group: 'popmart', ears: 'monster', belly: true, pal: { '#': '#5a4a6e', w: '#cdbfe0', i: '#9b86c0', e: '#ffe066' } },
    { id: 'duckoo', name: 'DUCKOO', group: 'popmart', beak: true, closedEyes: true, cheeks: false, pal: { '#': '#ffffff', a: '#ffa733', f: '#ffa733' } },
    { id: 'azura', name: 'AZURA', group: 'popmart', human: true, hair: 'long', bigEyes: true, pal: { '#': '#e6eeff', h: '#a9d4f5', e: '#4a6fd0' } },
    { id: 'peachriot', name: 'PEACH RIOT', group: 'popmart', human: true, hair: 'spiky', pal: { '#': '#2a2a2a', h: '#ff6fa8', f: '#ffffff' } },
    // Animals
    { id: 'dumpling', name: 'DUMPLING', price: 60, group: 'cute', ears: 'sprout', pal: { '#': '#fff2dc' } },
    { id: 'duckling', name: 'DUCKLING', price: 70, group: 'animal', ears: 'sprout', beak: true, pal: { '#': '#ffd84a', a: '#ff9a2b', f: '#ff9a2b', s: '#ffd84a' } },
    { id: 'ginger', name: 'GINGER CAT', price: 80, group: 'animal', ears: 'cat', tail: 'cat', stripes: true, belly: true, pal: { '#': '#f2a04f', d: '#c96a21', w: '#fff1e0' } },
    { id: 'bear', name: 'HONEY BEAR', price: 90, group: 'animal', ears: 'bear', muzzle: true, belly: true, pal: { '#': '#a9714b', w: '#ead0ad' } },
    { id: 'hamster', name: 'HAMSTER', price: 90, group: 'animal', ears: 'bear', muzzle: true, belly: true, pal: { '#': '#e8b27a', w: '#fff3e3' } },
    { id: 'shiba', name: 'SHIBA', price: 100, group: 'animal', ears: 'cat', tail: 'curl', muzzle: true, belly: true, pal: { '#': '#e8994a', w: '#fff3e2' } },
    { id: 'frog', name: 'FROGGY', price: 100, group: 'animal', ears: 'frog', belly: true, mouth: 'wide', pal: { '#': '#7cc96b', w: '#e6f5c9' } },
    { id: 'piglet', name: 'PIGLET', price: 110, group: 'animal', ears: 'cat', snout: true, tail: 'curl', pal: { '#': '#ffb6c8', i: '#ff8fab' } },
    { id: 'bunny', name: 'MILK BUNNY', price: 120, group: 'animal', ears: 'bunny', tail: 'puff', pal: { '#': '#fff8fb' } },
    { id: 'cow', name: 'MOO COW', price: 120, group: 'animal', ears: 'bear', spots: true, snout: true, pal: { '#': '#ffffff', d: '#2f2f2f', i: '#ffb3c1' } },
    { id: 'penguin', name: 'PENGUIN', price: 130, group: 'animal', face: true, beak: true, belly: true, cheeks: false, pal: { '#': '#2f3a56', w: '#ffffff', a: '#ffaa2b', f: '#ffaa2b', o: '#141a28' } },
    { id: 'fox', name: 'FOX', price: 140, group: 'animal', ears: 'cat', tail: 'fox', muzzle: true, pal: { '#': '#ef7d32', w: '#ffffff', f: '#3a2a22' } },
    { id: 'koala', name: 'KOALA', price: 150, group: 'animal', ears: 'bear', nose: true, belly: true, pal: { '#': '#9aa3ad', w: '#e6eaee', i: '#ffffff' } },
    { id: 'bee', name: 'BUMBLE', price: 160, group: 'animal', ears: 'antenna', bodyStripes: true, tail: 'stinger', pal: { '#': '#ffcf3a', d: '#3a2a1a', a: '#3a2a1a' } },
    { id: 'panda', name: 'PANDA', price: 180, group: 'animal', ears: 'bear', earChar: 'd', patches: true, pal: { '#': '#ffffff', d: '#2b2b2b', i: '#2b2b2b', f: '#2b2b2b' } },
    { id: 'tiger', name: 'TIGER', price: 220, group: 'animal', ears: 'cat', stripes: true, bodyStripes: true, tail: 'cat', muzzle: true, pal: { '#': '#f39233', d: '#2f2420', w: '#ffffff' } },
    // Cuties
    { id: 'mochi', name: 'MOCHI CAT', price: 150, group: 'cute', ears: 'cat', bow: true, tail: 'cat', pal: { '#': '#fdfbf7', a: '#ff4d7d' } },
    { id: 'cloud', name: 'CLOUD PUP', price: 250, group: 'cute', ears: 'bunny', earChar: 'w', tail: 'puff', pal: { '#': '#ffffff', w: '#ffffff', i: '#ffffff', e: '#2f6fd0', o: '#6f93c8' } },
    { id: 'axolotl', name: 'AXOLOTL', price: 260, group: 'cute', gills: true, pal: { '#': '#ffb3cf', a: '#ff5f97' } },
    { id: 'berry', name: 'BERRY BUNNY', price: 300, group: 'cute', ears: 'bunny', tail: 'puff', bow: true, belly: true, pal: { '#': '#ffc4d8', a: '#e8456f', w: '#fff0f5', i: '#ff8fb1' } },
    { id: 'alien', name: 'LIL ALIEN', price: 350, group: 'cute', ears: 'antenna', pal: { '#': '#9be564', a: '#ff5ca8' } },
    { id: 'fuzz', name: 'FANG FUZZ', price: 400, group: 'cute', ears: 'monster', face: true, mouth: 'grin', pal: { '#': '#a47a52', w: '#f3dfc1', i: '#f6a3b5' } },
    { id: 'imp', name: 'MIDNIGHT IMP', price: 500, group: 'cute', ears: 'monster', face: true, bow: true, pal: { '#': '#2b2733', w: '#ffffff', a: '#ff6fae', i: '#ff6fae', o: '#141118' } },
    { id: 'unicorn', name: 'UNICORN', price: 700, group: 'cute', ears: 'horn', tail: 'mane', mane: true, pal: { '#': '#ffffff', a: '#ffd34d', m: '#c99bff' } },
  ];

  const list = DEFS.map(d => {
    const body = d.pal['#'];
    const palette = Object.assign({
      o: '#3a2f2f', e: '#2a2222', p: '#ff9db5', i: '#ffb7c9', w: '#ffffff', t: '#ffffff',
      a: '#ff4d7d', s: '#5cbf60', m: '#c99bff', d: shade(body, 0.72), f: body,
      k: '#ffe2d0', h: '#3a2a22', b: '#5fb8ff', r: '#e0525e', x: '#ffffff',
    }, d.pal);
    return { id: d.id, name: d.name, group: d.group, palette, frames: chibi(d), color: body };
  });

  return { list };
})();
