# ECHO — The Last Tram

**Street Edition · Web Programming Midterm**  
Team: **Sudip · Sondor · Eric · Abinash**

A city resets every 90 seconds. Each rewind leaves an echo that repeats your route and holds its final position. Recover a ticket, leave past selves at the gate and generator, and catch the last tram.

[Play on GitHub Pages](https://sudip09-sys.github.io/ECHO/) · [Presentation walkthrough](DEMO.md)

## Play locally

Requires **Node.js 22 or later**. No dependency installation is needed.

```sh
npm start
```

Open **http://localhost:3001/**. On Windows, you can also double-click `START-ECHO.cmd`.

Move with **WASD / arrow keys** or click/tap a street. **E** interacts, **R** rewinds, **M** opens the city overview, and **Escape** pauses solo play. Camera controls provide zoom and fullscreen.

## Features

- Perspective city rendered from original 3D polygons with Canvas 2D.
- A following camera, large animated character, and responsive touch controls.
- Three color moods: Afterglow, Sakura Dusk, and Daybreak.
- Time-stamped echo recordings with interpolated playback.
- A complete ticket, bridge, generator, and tram puzzle.
- Five collectible memory lights, achievement badges, and optional landmarks.
- Local solo saves, echo timeline, and downloadable PNG postcards.
- An optional Node server for live rooms with up to four players.

## GitHub Pages deployment

The included **Publish ECHO on GitHub Pages** workflow checks the source and publishes `dist/`.

Enable **Settings → Pages → Build and deployment → Source → GitHub Actions**. A successful workflow deployment publishes the solo edition at **https://sudip09-sys.github.io/ECHO/**. If the first run fails because Pages was not enabled, enable that setting and rerun the workflow.

GitHub Pages serves the solo game. The multiplayer API requires the included Node server.

## Four-player rooms

Run `npm start` on one laptop. On the same private network, teammates open `http://HOST-IP:3001` using the host laptop's Wi-Fi IPv4 address. Click **Play with your people**, select different characters, and join the host's six-character code.

The host starts and rewinds. All players can move, collect, interact, and hold the pads. The server validates movement and actions and sends state through Server-Sent Events. Rooms are temporary: restarting the server clears them. Campus Wi-Fi may isolate devices; a private hotspot is an alternative.

For internet multiplayer, the included `Dockerfile` and `render.yaml` support a Node hosting service. No public multiplayer deployment is implied by the GitHub Pages workflow.

## Source map

| File | Purpose |
|---|---|
| `dist/index.html` | Interface and controls |
| `dist/street.css` | Street Edition visual design |
| `dist/street3d.mjs` | Perspective projection, polygons, character and city |
| `dist/game.mjs` | Input, UI, room client, saves and postcard export |
| `dist/engine.mjs` | Shared puzzle, collision, replay and collection rules |
| `dist/themes.mjs` | Palettes and achievement definitions |
| `dist/camera.mjs` | Overview/minimap projection helpers |
| `dist/render.mjs` | Earlier isometric renderer and minimap projection |
| `dist/effects.mjs` | Earlier renderer's animated props |
| `server.mjs` | Local hosting and cooperative room server |
| `tests/` | Rules, camera, projection and real HTTP checks |
| `.github/workflows/pages.yml` | GitHub Pages verification and deployment |

## Validation

```sh
npm run check
```

The project includes 16 tests covering the full three-loop solution, replay, collection, camera projection/picking, collisions, and real four-player HTTP authorization. Browser visual review and a real four-device rehearsal remain separate checks.

All characters, locations, and events are fictional. Proposed team presentation roles are documented in `DEMO.md`; members should review and adapt the generated source before presenting it.
