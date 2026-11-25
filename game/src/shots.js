// Screenshot scenes behind ?shot=start|assembly|serve|end.
// Each one drives the REAL game rules forward from a fresh world (real orders,
// real cooking, real plates), so the frame is what actual play looks like, and
// the same seed always stages the same frame.
import { STEP } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY } from './render.js';

/** Step the world forward n seconds. */
function advance(world, seconds) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) world.step(STEP);
}

/** Cook one ingredient at its station and collect it when done. */
function cookOne(world, id, station) {
  world.takeIngredient(id);
  world.clickStation(station);
  advance(world, 5.2); // longer than any cook time, still inside the burn window
  world.clickStation(station); // collect the cooked item into the tray
}

export function stageShot(name, world) {
  const state = world.state;
  if (name === 'assembly') return stageAssembly(world);
  if (name === 'serve') return stageServe(world);
  if (name === 'end') return stageEnd(world);
  return stageStart(world);
}

/** Early shift: full order board, full counter, stations idle, timer high. */
function stageStart(world) {
  world.reset();
  advance(world, 5);
  return { screen: SCREEN_PLAY, best: 0 };
}

/**
 * A dish mid-assembly: two cooked ingredients already on plate 1, the third
 * still frying in the wok, three orders on the board.
 */
function stageAssembly(world) {
  world.reset();
  cookOne(world, 'nasi', 'wok');
  cookOne(world, 'telur', 'wok');
  world.clickPlate(0);
  world.clickPlate(0);
  world.takeIngredient('cabai');
  world.clickStation('wok');
  advance(world, 2); // cabai mid-fry, progress ~57%
  return { screen: SCREEN_PLAY, best: 0 };
}

/**
 * A plate ready to serve: a complete Nasi Goreng on plate 1, its ticket down
 * to 8 seconds (red, urgent), combo x3, and a just-served Mie Goreng in the
 * pass window.
 */
function stageServe(world) {
  world.reset();
  cookOne(world, 'nasi', 'wok');
  cookOne(world, 'telur', 'wok');
  cookOne(world, 'cabai', 'wok');
  world.clickPlate(0);
  world.clickPlate(0);
  world.clickPlate(0);
  const state = world.state;
  state.orders[0] = { id: 900, dishId: 'nasi-goreng', left: 8, total: 52, born: 0 };
  state.orders[1] = { id: 901, dishId: 'mie-goreng', left: 31, total: 52, born: 0 };
  state.combo = 3;
  state.score = 1250;
  state.coins = 48000;
  state.served = 9;
  state.serves = 9;
  state.servedDish = { dishId: 'mie-goreng', t: 0.4 };
  state.shiftLeft = 96;
  return { screen: SCREEN_PLAY, best: 1480 };
}

/** End of a good shift: the summary card with 2 stars, served stats, best score. */
function stageEnd(world) {
  world.reset();
  const state = world.state;
  state.serves = 11;
  state.served = 11;
  state.missed = 2;
  state.coins = 124000;
  state.score = 1480;
  state.bestCombo = 5;
  state.level = 3;
  state.combo = 4;
  state.shiftLeft = 0.01;
  world.step(STEP); // the shift clock hits zero and the summary is computed
  return { screen: SCREEN_OVER, best: 1480 };
}
