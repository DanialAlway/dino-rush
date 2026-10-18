/* Dino Rush: optional "Log in with Spotify" with your own playlists and playback control.
 * Uses the Authorization Code + PKCE flow entirely in the browser (no server, no secret),
 * the Web API for playlists and control, and the Web Playback SDK to play inside the game.
 * Spotify limits development-mode apps to 5 allowlisted accounts and needs Premium to play. */
(() => {
  'use strict';

  const $ = id => document.getElementById(id);
  const CLIENT_ID = window.DINO_SPOTIFY_CLIENT_ID || '';

  // Tabs work with or without login configured.
  function showTab(name) {
    for (const b of document.querySelectorAll('.mtab')) b.classList.toggle('on', b.dataset.tab === name);
    $('paneEmbed').classList.toggle('hidden', name !== 'embed');
    $('paneAccount').classList.toggle('hidden', name !== 'account');
    if (name === 'account') startPolling(); else stopPolling();
  }
  for (const b of document.querySelectorAll('.mtab')) b.addEventListener('click', () => { b.blur(); showTab(b.dataset.tab); });

  if (!CLIENT_ID) { $('mtabs').classList.add('hidden'); return; }

  const KEY = 'dinoRush.spotify.v1';
  const SCOPES = [
    'user-read-private', 'user-read-email', 'playlist-read-private', 'playlist-read-collaborative',
    'user-library-read', 'streaming', 'user-read-playback-state', 'user-modify-playback-state',
    'user-read-currently-playing',
  ].join(' ');
  const REDIRECT = location.origin + location.pathname.replace(/index\.html$/, '');

  const ls = {
    get(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } },
  };

  let auth = ls.get(KEY); // { access, refresh, expires }
  let sdkPlayer = null, sdkDevice = null, sdkRequested = false;
  let playing = false, pollTimer = 0, volTimer = 0, userId = '';

  function msg(text) {
    $('spMsg').textContent = text || '';
    $('spMsg').classList.toggle('hidden', !text);
  }

  // ---------------------------------------------------------------------------
  // Auth (PKCE)
  // ---------------------------------------------------------------------------
  const b64url = buf => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const randomString = n => b64url(crypto.getRandomValues(new Uint8Array(n))).slice(0, n);

  async function login() {
    const verifier = randomString(64);
    const challenge = b64url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
    const state = randomString(16);
    ls.set(KEY + '.pkce', { verifier, state });
    const q = new URLSearchParams({
      client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT,
      code_challenge_method: 'S256', code_challenge: challenge, scope: SCOPES, state,
    });
    location.assign('https://accounts.spotify.com/authorize?' + q);
  }

  async function requestToken(body) {
    const res = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(Object.assign({ client_id: CLIENT_ID }, body)),
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error_description || d.error || 'Spotify login failed');
    auth = { access: d.access_token, refresh: d.refresh_token || (auth && auth.refresh), expires: Date.now() + (d.expires_in - 60) * 1000 };
    ls.set(KEY, auth);
  }

  // Finishes the login when Spotify redirects back with ?code=...
  async function handleRedirect() {
    const q = new URLSearchParams(location.search);
    if (!q.has('code') && !q.has('error')) return false;
    const pk = ls.get(KEY + '.pkce');
    ls.del(KEY + '.pkce');
    history.replaceState(null, '', REDIRECT + location.hash);
    if (q.get('error')) {
      msg(q.get('error') === 'access_denied' ? 'Spotify login was cancelled.' : 'Spotify login failed: ' + q.get('error'));
      return true;
    }
    if (!pk || pk.state !== q.get('state')) { msg('That Spotify login expired. Please try again.'); return true; }
    await requestToken({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: REDIRECT, code_verifier: pk.verifier });
    return true;
  }

  async function accessToken() {
    if (!auth) throw new Error('Not logged in');
    if (Date.now() > auth.expires) await requestToken({ grant_type: 'refresh_token', refresh_token: auth.refresh });
    return auth.access;
  }

  async function api(path, opts = {}, retry = true) {
    const res = await fetch('https://api.spotify.com/v1' + path, Object.assign({}, opts, {
      headers: { Authorization: 'Bearer ' + await accessToken(), 'Content-Type': 'application/json' },
    }));
    if (res.status === 401 && retry && auth && auth.refresh) { auth.expires = 0; return api(path, opts, false); }
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = null; }
    if (!res.ok) {
      const err = new Error((data && data.error && data.error.message) || res.statusText || 'Spotify error');
      err.status = res.status;
      err.reason = data && data.error && data.error.reason;
      throw err;
    }
    return data;
  }

  function explain(e) {
    if (e.reason === 'NO_ACTIVE_DEVICE' || e.status === 404) return 'No device to play on. Open Spotify on your phone or computer, or pick a device under PLAY ON.';
    if (e.reason === 'PREMIUM_REQUIRED') return 'Spotify Premium is needed to control playback.';
    if (e.status === 403) {
      if (/not registered|developer dashboard|not allowed to access/i.test(e.message)) {
        return 'This Spotify account is not approved for Dino Rush yet. Spotify only allows 5 accounts, so ask Danial to add yours.';
      }
      return `Spotify refused that (${e.message}). Wait a second and try again, or pick another device under PLAY ON.`;
    }
    if (e.status === 429) return 'Spotify is busy. Try again in a minute.';
    return 'Spotify: ' + e.message;
  }

  function logout() {
    auth = null;
    ls.del(KEY);
    stopPolling();
    if (sdkPlayer) { sdkPlayer.disconnect(); sdkPlayer = null; sdkDevice = null; }
    render();
  }

  // ---------------------------------------------------------------------------
  // Data
  // ---------------------------------------------------------------------------
  async function loadMe() {
    const me = await api('/me');
    userId = me.id || '';
    $('spName').textContent = (me.display_name || me.id || 'Spotify user').toUpperCase();
    if (me.product && me.product !== 'premium') msg('Your account is not Premium. Spotify only lets Premium accounts play through apps like this, but you can still browse.');
  }

  async function loadPlaylists() {
    const el = $('spLists');
    el.innerHTML = '<p class="music-note">Loading your playlists…</p>';
    const items = [];
    let url = '/me/playlists?limit=50';
    for (let page = 0; url && page < 4; page++) {
      const d = await api(url);
      items.push(...(d.items || []).filter(Boolean));
      url = d.next ? d.next.replace('https://api.spotify.com/v1', '') : null;
    }
    el.innerHTML = '';
    el.append(listButton({ name: 'Liked Songs', liked: true }));
    for (const p of items) el.append(listButton(p));
    if (!items.length) el.insertAdjacentHTML('beforeend', '<p class="music-note">No playlists yet. Make one in Spotify and it shows up here.</p>');
  }

  function listButton(p) {
    const b = document.createElement('button');
    b.className = 'sp-list';
    if (p.liked) b.dataset.liked = '1'; else b.dataset.uri = p.uri;
    const img = p.images && p.images.length ? p.images[p.images.length > 1 ? 1 : 0].url : '';
    const count = p.liked ? 'Your saved songs' : `${((p.tracks || p.items || {}).total) ?? ''} songs`;
    b.innerHTML = `<span class="sp-cover${p.liked ? ' liked' : ''}">${img ? `<img src="${img}" alt="" loading="lazy">` : (p.liked ? '♥' : '♪')}</span>
      <span class="sp-ltext"><b></b><small></small></span>`;
    b.querySelector('b').textContent = p.name;
    b.querySelector('small').textContent = count;
    return b;
  }

  async function refreshDevices() {
    const d = await api('/me/player/devices');
    const sel = $('spDevice'), prev = sel.value;
    sel.innerHTML = '';
    const devices = (d && d.devices) || [];
    if (sdkDevice && !devices.some(x => x.id === sdkDevice)) devices.unshift({ id: sdkDevice, name: 'Dino Rush (this browser)' });
    for (const dev of devices) {
      const o = document.createElement('option');
      o.value = dev.id;
      o.textContent = dev.id === sdkDevice ? 'Dino Rush (this browser)' : dev.name + (dev.type ? ` · ${dev.type.toLowerCase()}` : '');
      sel.append(o);
    }
    if (!devices.length) {
      const o = document.createElement('option');
      o.value = '';
      o.textContent = 'No devices: open Spotify somewhere';
      sel.append(o);
    }
    const active = devices.find(x => x.is_active);
    sel.value = devices.some(x => x.id === prev) ? prev : (sdkDevice || (active && active.id) || (devices[0] && devices[0].id) || '');
  }

  function showTrack(item, isPlaying) {
    playing = !!isPlaying;
    $('spPlay').textContent = playing ? '❚❚' : '▶';
    $('spTrack').textContent = item ? item.name : 'Nothing playing';
    $('spArtist').textContent = item ? (item.artists || (item.show && [item.show]) || []).map(a => a.name).join(', ') : 'Pick a playlist below';
    const imgs = item && (item.album || item.show || {}).images;
    $('spArt').src = imgs && imgs.length ? imgs[imgs.length > 1 ? 1 : 0].url : '';
    $('spArt').classList.toggle('hidden', !(imgs && imgs.length));
  }

  // True when music should play inside this browser tab (the Web Playback SDK device).
  const local = () => !!(sdkPlayer && sdkDevice && $('spDevice').value === sdkDevice);

  async function refreshNow() {
    if (local()) {
      const st = await sdkPlayer.getCurrentState();
      if (st) { showTrack(st.track_window.current_track, !st.paused); return; }
    }
    const s = await api('/me/player');
    showTrack(s && s.item, s && s.is_playing);
    if (s && s.device && typeof s.device.volume_percent === 'number' && document.activeElement !== $('spVol')) $('spVol').value = s.device.volume_percent;
  }

  function startPolling() {
    stopPolling();
    if (!auth || $('paneAccount').classList.contains('hidden')) return;
    const tick = () => { refreshNow().catch(() => {}); };
    tick();
    pollTimer = setInterval(tick, 5000);
  }
  function stopPolling() { clearInterval(pollTimer); pollTimer = 0; }

  // ---------------------------------------------------------------------------
  // Playback
  // ---------------------------------------------------------------------------
  const deviceParam = () => ($('spDevice').value ? '?device_id=' + encodeURIComponent($('spDevice').value) : '');

  async function control(fn) {
    msg('');
    try { await fn(); setTimeout(() => refreshNow().catch(() => {}), 700); } catch (e) { msg(explain(e)); }
  }

  async function playList(btn) {
    let body;
    if (btn.dataset.liked) {
      let uris = [];
      try {
        const d = await api('/me/tracks?limit=50');
        uris = (d.items || []).map(i => i.track && i.track.uri).filter(Boolean);
      } catch (e) { uris = []; }
      // Fall back to the Liked Songs collection as a whole.
      body = uris.length ? { uris } : { context_uri: `spotify:user:${userId}:collection` };
    } else body = { context_uri: btn.dataset.uri };
    await api('/me/player/play' + deviceParam(), { method: 'PUT', body: JSON.stringify(body) });
    for (const b of document.querySelectorAll('.sp-list')) b.classList.toggle('on', b === btn);
  }

  // The Web Playback SDK makes this browser tab a Spotify device (desktop browsers only).
  function loadSdk() {
    if (sdkRequested) return;
    sdkRequested = true;
    window.onSpotifyWebPlaybackSDKReady = () => {
      sdkPlayer = new window.Spotify.Player({
        name: 'Dino Rush',
        getOAuthToken: cb => { accessToken().then(cb).catch(() => {}); },
        volume: 0.6,
      });
      sdkPlayer.addListener('ready', ({ device_id }) => { sdkDevice = device_id; refreshDevices().catch(() => {}); });
      sdkPlayer.addListener('not_ready', () => { sdkDevice = null; refreshDevices().catch(() => {}); });
      sdkPlayer.addListener('account_error', () => msg('Spotify Premium is needed to play inside the game. You can still pick another device under PLAY ON.'));
      sdkPlayer.addListener('initialization_error', () => msg('This browser cannot play Spotify inside the game (phones are not supported). Pick your phone or computer under PLAY ON instead.'));
      sdkPlayer.addListener('authentication_error', () => msg('Spotify login expired. Please log in again.'));
      sdkPlayer.addListener('player_state_changed', st => {
        if (st && local()) showTrack(st.track_window.current_track, !st.paused);
      });
      sdkPlayer.connect();
    };
    const s = document.createElement('script');
    s.src = 'https://sdk.scdn.co/spotify-player.js';
    s.async = true;
    document.head.append(s);
  }

  // ---------------------------------------------------------------------------
  // UI
  // ---------------------------------------------------------------------------
  function render() {
    $('spLoggedOut').classList.toggle('hidden', !!auth);
    $('spLoggedIn').classList.toggle('hidden', !auth);
  }

  async function start() {
    render();
    try {
      await loadMe();
      await loadPlaylists();
      loadSdk();
      await refreshDevices();
      startPolling();
    } catch (e) {
      msg(explain(e));
      if (e.status === 403 || e.message === 'Not logged in') logout();
    }
  }

  $('spLogin').addEventListener('click', () => { msg(''); login().catch(e => msg(explain(e))); });
  $('spLogout').addEventListener('click', logout);
  // Chrome keeps the in-game player silent until it is unlocked inside a click.
  const unlockAudio = () => { if (sdkPlayer && sdkPlayer.activateElement) sdkPlayer.activateElement(); };

  $('spPlay').addEventListener('click', () => {
    unlockAudio();
    control(() => (local() ? sdkPlayer.togglePlay() : api('/me/player/' + (playing ? 'pause' : 'play') + deviceParam(), { method: 'PUT' })));
  });
  $('spNext').addEventListener('click', () => {
    unlockAudio();
    control(() => (local() ? sdkPlayer.nextTrack() : api('/me/player/next' + deviceParam(), { method: 'POST' })));
  });
  $('spPrev').addEventListener('click', () => {
    unlockAudio();
    control(() => (local() ? sdkPlayer.previousTrack() : api('/me/player/previous' + deviceParam(), { method: 'POST' })));
  });
  $('spVol').addEventListener('input', e => {
    clearTimeout(volTimer);
    const v = e.target.value;
    volTimer = setTimeout(() => control(() => (local()
      ? sdkPlayer.setVolume(v / 100)
      : api('/me/player/volume?volume_percent=' + v + ($('spDevice').value ? '&device_id=' + encodeURIComponent($('spDevice').value) : ''), { method: 'PUT' }))), 300);
  });
  $('spDevice').addEventListener('change', e => {
    if (!e.target.value) return;
    unlockAudio();
    control(() => api('/me/player', { method: 'PUT', body: JSON.stringify({ device_ids: [e.target.value], play: playing }) }));
  });
  $('spRefresh').addEventListener('click', () => control(async () => { await refreshDevices(); await loadPlaylists(); }));
  $('spLists').addEventListener('click', e => {
    const b = e.target.closest('.sp-list');
    if (b) { b.blur(); unlockAudio(); control(() => playList(b)); }
  });

  (async () => {
    let returned = false;
    try { returned = await handleRedirect(); } catch (e) { msg(explain(e)); returned = true; }
    render();
    if (returned && window.DinoMusic) { window.DinoMusic.open(); showTab('account'); }
    if (auth) start();
  })();
})();
