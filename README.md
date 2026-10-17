# 🦖 Dino Rush

A bigger take on the classic offline dinosaur game. It's pure HTML5 canvas and vanilla JavaScript, with no build step and no dependencies.

**Play:** https://danialalway.github.io/dino-rush/

## Features

- **4 zones:** Desert Dunes → Green Plains → Frozen Tundra → Volcano Zone. The zone changes every 1000 points, and each one has its own colours, obstacles and weather (dust, leaves, snow, ash and embers).
- **Day and night cycle** with stars and a moon.
- **More dangers:** cacti, ice spikes and lava rocks, pterodactyls at 3 heights, rolling boulders and falling meteors that leave burning craters.
- **5 power-ups:** Shield, Coin Magnet, Slow-mo, Double Jump and 2× Score.
- **Coins and shop:** 8 dino skins (including Ghost and Rainbow) and upgrades. Progress is saved in the browser.
- **Better controls:** variable-height jumps, fast-fall, and a jump buffer.
- Retro synth sound effects, particles, screen shake and parallax backgrounds.
- **Mobile friendly:** on-screen JUMP and DUCK buttons on touch devices.

## Controls

| Action | Keyboard | Touch |
| --- | --- | --- |
| Jump (hold = higher) | `Space` / `↑` / `W` | JUMP button / tap game |
| Duck / fast-fall | `↓` / `S` | DUCK button |
| Pause | `P` / `Esc` | II button |
| Mute | `M` | ♪ button |

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html`: page layout and the menus (main, pause, game over, shop)
- `style.css`: retro UI styling
- `game.js`: the game engine (physics, spawning, rendering, audio, shop, save data)
