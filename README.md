# 🦖 Dino Rush

A bigger take on the classic offline dinosaur game. It's pure HTML5 canvas and vanilla JavaScript, with no build step and no dependencies.

**Play:** https://danialalway.github.io/dino-rush/

## Features

- **17 venues:** Desert Dunes, Green Plains, Sunny Beach, Cherry Blossom, Autumn Woods, Frozen Tundra, Aurora Night, Candy Land, Neon City, Mushroom Forest, Haunted Hollow, Coral Reef, Crystal Cave, Savanna Sunset, Volcano Zone, Moon Base and Cloud Kingdom.
  - The venue changes every 600 points. Each one has its own sky, scenery, obstacles (cacti, sandcastles, bamboo, candy, traffic cones, mushrooms, pumpkins, tombstones, crystals…) and weather (rain, petals, confetti, bubbles, fireflies, aurora…).
  - Start a run in any venue from the **Venues** menu.
- **48 characters, all free to pick:** each has its own running and ducking animation.
  - 8 dino colours
  - 16 Pop Mart friends: Labubu, Mokoko, Zimomo, Molly, Dimoo, Skullpanda, Crybaby, Hirono, Pucky, Hacipupu, Sweet Bean, Bunny, Yoki, Duckoo, Azura and Peach Riot
  - 9 cuties (Mochi Cat, Cloud Pup, Fang Fuzz, Unicorn…)
  - 15 animals (cat, shiba, panda, fox, penguin, frog, tiger…)
- **Day and night cycle** with stars and a moon.
- **More dangers:** pterodactyls at 3 heights, rolling boulders, and falling meteors that leave burning craters.
- **5 power-ups:** Shield, Coin Magnet, Slow-mo, Double Jump and 2× Score.
- **Coins:** spend them on upgrades. Progress is saved in the browser.
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
- `characters.js`: the character roster and the chibi pixel-art generator
- `venues.js`: venue colours, obstacles, weather and scenery styles

## Fan art notice

The Pop Mart characters in this game are unofficial pixel fan art made for fun. Dino Rush is not affiliated with or endorsed by Pop Mart, and all character rights belong to their owners.
