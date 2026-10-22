# ECHO — Blockworld Journey

An original voxel city adventure by Sudip, Sondor, Eric and Abinash. Explore three cities, leave time echoes, complete missions, and build with textured cubes.

[Play Blockworld](https://sudip09-sys.github.io/ECHO/dist/)

## Voxel edition

- Textured block terrain, cubic trees and characters, sunny Kisaragi, Azure Harbor, and Sakura Heights.
- Five-slot inventory: meadow, timber, stone, sea glass and glowstone. Starter stock is included.
- Mine resource stacks or placed blocks; build in open areas and jump onto blocks. Story architecture and mission paths stay protected.
- Builds and inventory persist through rewinds, chapters and solo saves. Mine five and place five blocks to earn World builder and 50 starlight.
- WASD move, drag to look, V switches first/third person, Space jumps, C crouches, Z goes prone.
- B toggles build mode. Click mines, right-click places. X/G offer the same tools. 1–5 or the hotbar select blocks; I opens inventory. E interacts with missions; R rewinds.
- Building is bounded to each city, with a five-block tool reach and a six-block build height. City terrain and buildings are permanent.
- GitHub Pages supports solo play. The optional Node server supports authenticated co-op rooms with shared city edits and individual inventories.

## Run locally

Requires Node.js 22 or newer. No dependencies are needed.

```sh
npm start
```

Open http://localhost:3001/. Windows users can run START-ECHO.cmd.

## Verify

```sh
npm run check
```

GitHub Actions checks game rules and verifies a rendered frame in headless Chrome before publishing.
