/* Dino Rush: background music through the Spotify embed player.
 * No login or API key is needed. Listeners logged in to Spotify in the browser hear
 * full tracks; everyone else hears 30-second previews (Spotify's rule, not ours). */
(() => {
  'use strict';

  const KEY = 'dinoRush.music.v1';
  const PRESETS = [
    { name: 'Top Gaming Tracks', uri: 'playlist/37i9dQZF1DWTyiBJ6yEqeu' },
    { name: 'Lofi Beats', uri: 'playlist/37i9dQZF1DWWQRwui0ExPn' },
    { name: 'Jazz Vibes', uri: 'playlist/37i9dQZF1DX0SM0LYsmbMT' },
    { name: 'Peaceful Piano', uri: 'playlist/37i9dQZF1DX4sWSpwq3LiO' },
  ];

  const $ = id => document.getElementById(id);
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { return {}; } };
  const store = () => { try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch (e) { /* ignore */ } };
  const prefs = Object.assign({ uri: PRESETS[0].uri, open: false }, load());

  // Accepts open.spotify.com links (with or without intl-xx / embed) and spotify: URIs.
  function parse(link) {
    const s = link.trim();
    let m = s.match(/^spotify:(playlist|album|track|artist|episode|show):([A-Za-z0-9]{10,})$/);
    if (m) return `${m[1]}/${m[2]}`;
    m = s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?(playlist|album|track|artist|episode|show)\/([A-Za-z0-9]{10,})/);
    return m ? `${m[1]}/${m[2]}` : null;
  }

  // The player is only created when the panel is first opened.
  function mount() {
    const box = $('musicFrame');
    const src = `https://open.spotify.com/embed/${prefs.uri}?utm_source=generator&theme=0`;
    const cur = box.querySelector('iframe');
    if (cur && cur.src === src) return;
    box.innerHTML = '';
    const f = document.createElement('iframe');
    f.src = src;
    f.title = 'Spotify player';
    f.height = 152;
    f.allow = 'autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture';
    box.append(f);
  }

  function renderPresets() {
    const el = $('musicPresets');
    el.innerHTML = '';
    for (const p of PRESETS) {
      const b = document.createElement('button');
      b.className = 'mchip' + (p.uri === prefs.uri ? ' on' : '');
      b.dataset.uri = p.uri;
      b.textContent = p.name;
      el.append(b);
    }
  }

  function choose(uri) {
    prefs.uri = uri;
    store();
    renderPresets();
    mount();
  }

  function setOpen(open) {
    prefs.open = open;
    store();
    $('music').classList.toggle('hidden', !open);
    $('btnMusic').classList.toggle('on', open);
    if (open) mount();
  }

  $('btnMusic').addEventListener('click', e => { e.currentTarget.blur(); setOpen($('music').classList.contains('hidden')); });
  $('musicClose').addEventListener('click', () => setOpen(false));
  $('musicPresets').addEventListener('click', e => {
    const b = e.target.closest('[data-uri]');
    if (b) { b.blur(); choose(b.dataset.uri); }
  });
  $('musicForm').addEventListener('submit', e => {
    e.preventDefault();
    const uri = parse($('musicLink').value);
    $('musicErr').classList.toggle('hidden', !!uri);
    if (!uri) return;
    $('musicLink').value = '';
    $('musicLink').blur();
    choose(uri);
  });

  window.DinoMusic = { open: () => setOpen(true) };
  renderPresets();
  setOpen(prefs.open);
})();
