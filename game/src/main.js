// Boot and the one loop: input is read on click/key, the world advances in
// fixed 1/60 s steps, and the renderer paints what is there. Screens: title,
// play, paused, game over.
//
// ?seed=N fixes the order pattern. ?shot=start|assembly|serve|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice and
// sets window.__shotReady for a screenshot.
import { BEST_KEY, STEP } from './config.js';
import { createRandom } from './rng.js';
import {
  EVENT_BURNED,
  EVENT_DONE,
  EVENT_EXPIRED,
  EVENT_LEVEL,
  EVENT_ORDER,
  EVENT_OVER,
  EVENT_SERVED,
  EVENT_WRONG,
  createWorld,
} from './world.js';
import { createInput } from './input.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, createRenderer } from './render.js';
import { createAudio } from './audio.js';
import { stageShot } from './shots.js';

const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const audio = createAudio();
const renderer = createRenderer(canvas);
// Debug/test handle: lets automated play-tests read the live game state.
window.__dapur = world;

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best score then lasts this visit only.
  }
}

/** Play the sound for a world event bitmask. */
function playEvents(bits) {
  if (bits & EVENT_SERVED) {
    audio.coin();
    audio.ding();
  }
  if (bits & EVENT_ORDER) audio.ding();
  if (bits & EVENT_DONE) audio.ding();
  if (bits & EVENT_EXPIRED) audio.wrong();
  if (bits & EVENT_WRONG) audio.wrong();
  if (bits & EVENT_BURNED) audio.burn();
  if (bits & EVENT_LEVEL) audio.levelUp();
  if (bits & EVENT_OVER) audio.endJingle();
}

function runShot(name) {
  const scene = stageShot(name, world);
  const t = 3.7; // fixed, so the same seed always paints the same frame
  let painted = 0;
  function paint() {
    renderer.draw(world.state, scene.screen, scene.best, t, false);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  let screen = SCREEN_TITLE;
  let best = readBest();
  let accumulator = 0;
  let last = performance.now();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    audio.unlock();
    world.reset();
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Bermain. Layani pesanan sebelum waktunya habis!');
  }

  function endGame() {
    screen = SCREEN_OVER;
    if (world.state.score > best) {
      best = world.state.score;
      saveBest(best);
    }
    announce(`Shift selesai. Skor ${world.state.score}. Terbaik ${best}.`);
  }

  /** Map a click/key result to its sound. */
  function soundFor(result) {
    if (result === 'take') audio.pickup();
    else if (result === 'cook') {
      audio.chop();
      audio.sizzleStart();
    } else if (result === 'collect' || result === 'plate') audio.place();
    else if (result === 'serve') {
      audio.coin();
      audio.ding();
    } else if (result === 'trash') audio.burn();
    else if (result === 'wrong' || result === 'wrong-station' || result === 'full') audio.wrong();
    else if (result === 'select' || result === 'cooking') audio.click();
  }

  const input = createInput(canvas, () => world.state, {
    onBin: (id) => soundFor(world.takeIngredient(id)),
    onStation: (id) => soundFor(world.clickStation(id)),
    onPlate: (i) => soundFor(world.clickPlate(i)),
    onTicket: (id) => soundFor(world.clickTicket(id)),
    onSelectTray: () => audio.click(),
    onStart: () => {
      if (screen === SCREEN_TITLE) startGame();
    },
    onAgain: () => {
      if (screen === SCREEN_OVER) startGame();
    },
    onPause: () => {
      if (screen === SCREEN_PLAY) {
        screen = SCREEN_PAUSED;
        announce('Jeda.');
      } else if (screen === SCREEN_PAUSED) {
        screen = SCREEN_PLAY;
        announce('Bermain.');
      }
    },
    onMute: () => {
      audio.unlock();
      const muted = audio.toggleMute();
      announce(muted ? 'Suara mati.' : 'Suara hidup.');
    },
    onServe: () => {
      if (screen === SCREEN_PLAY) soundFor(world.serveFirstMatch());
    },
  });

  function step() {
    const bits = world.step(STEP);
    playEvents(bits);
    if (bits & EVENT_OVER) endGame();
    if (world.state.cooking) audio.sizzleLoop();
    else audio.sizzleStop();
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    world.state.hoverBin = input.hoverBin;
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP) {
        step();
        accumulator -= STEP;
        if (screen !== SCREEN_PLAY) {
          accumulator = 0;
          break;
        }
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen, best, now / 1000, audio.muted);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Jeda.');
    }
  });

  announce('Dapur Nusantara Rush. Klik MULAI SHIFT atau tekan Spasi.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
