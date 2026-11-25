# Dapur Nusantara Rush

[![make.fun · best-cooking-game-20261125-0137](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![rank](https://make.fun/badge/best-cooking-game-20261125-0137/rehansky3-png/makefun-best-cooking-game-20261125-0137/rank.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)
[![reward](https://make.fun/badge/best-cooking-game-20261125-0137/rehansky3-png/makefun-best-cooking-game-20261125-0137/reward.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137?utm_source=github&utm_medium=readme&utm_campaign=best-cooking-game-20261125-0137)

A complete, original cooking game: run the busiest warung kitchen in town.
Take orders from the board, cook ingredients at the wok, grill and pot, assemble
dishes on plates, and serve them before the ticket timer runs out.

See the bounty: https://make.fun/bounty/best-cooking-game-20261125-0137

## How to play

1. **Ambil bahan** — click an ingredient on the counter (or press 1-6).
2. **Masak** — click the station that cooks it: Wajan (Q), Panggangan (W), Panci (E).
   Food left too long after it is done burns — click the station to throw it away.
3. **Rakit** — put cooked food on a plate (Z / X) until the recipe is complete.
4. **Antar** — click the matching order ticket (or press Space) to serve it.

Serve fast to build a combo (up to x3 score). An expired order costs a heart;
lose all three and the warung closes early. A shift lasts 150 seconds — serve
as many dishes as you can, unlock Soto Ayam at level 2 and Es Teh Manis at
level 3, and chase three stars on the end-of-shift summary.

## The menu

| Dish | Recipe | Station | Price |
| --- | --- | --- | --- |
| Nasi Goreng | Nasi + Telur + Cabai | Wajan | Rp12.000 |
| Mie Goreng | Mie + Ayam + Cabai | Wajan | Rp14.000 |
| Ayam Bakar | Ayam + Cabai | Panggangan | Rp16.000 |
| Soto Ayam | Mie + Ayam | Panci | Rp13.000 |
| Es Teh Manis | Es Teh | — (langsung saji) | Rp5.000 |

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

The game is plain static files under `game/` — `index.html` plus ES modules,
no libraries, no network requests, no external assets. All art is drawn in
code on canvas; all sounds are synthesized with WebAudio. It plays with mouse
and keyboard in a desktop browser, and works from `file://` too.

## Screenshots

Four real renders of the game, taken in headless Chromium from the game's own
`?shot=` scenes (see `shots.json`):

1. `1-start.jpg` — the kitchen at the start of a shift: full order board,
   ingredients on the counter, stations ready, shift timer running.
2. `2-assembly.jpg` — a dish mid-assembly: two ingredients on the plate, the
   third frying in the wok.
3. `3-serve.jpg` — a plate ready to serve, its ticket down to 8 seconds, and a
   just-served dish in the pass window.
4. `4-end.jpg` — the end-of-shift summary with stars and stats.

## Hand in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts` library.

## Layout

- `main.ts` — the hand-in program.
- `serve.ts` — a tiny static server for local play-testing.
- `game/index.html` — the page (1280×720 canvas).
- `game/src/config.js` — dishes, ingredients, stations, layout.
- `game/src/world.js` — game state and rules (orders, cooking, serving).
- `game/src/render.js` — all canvas drawing.
- `game/src/input.js` — pointer and keyboard input.
- `game/src/audio.js` — synthesized WebAudio sounds.
- `game/src/rng.js` — seeded random (deterministic screenshots).
- `game/src/shots.js` — the four staged screenshot scenes.
- `game/src/main.js` — boot, game loop, screens.
- `shots.json` — screenshot names and their `?shot=` queries.
- `vendor/makefun-game.ts` — make.fun's dossier library, copied unchanged.
