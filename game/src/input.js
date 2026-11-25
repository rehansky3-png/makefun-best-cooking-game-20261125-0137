// Pointer and keyboard input. Clicks are converted from page pixels to the
// game's 1280x720 logical space; keys mirror the on-screen controls.
import { INGREDIENTS, LAYOUT, STATIONS, W, H, binRect, inside, plateRect, stationRect, ticketRect, trayRect } from './config.js';

/**
 * @param canvas the game canvas (fixed 1280x720 backing store, CSS-scaled)
 * @param getState () => world state (for hit-testing tickets and tray)
 * @param act { onBin, onStation, onPlate, onTicket, onStart, onAgain, onPause, onMute, onServe, onSelectTray }
 */
export function createInput(canvas, getState, act) {
  const hover = { bin: null };

  function logical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  function handleClick(x, y) {
    const s = getState();
    if (inside(x, y, LAYOUT.muteButton)) {
      act.onMute();
      return;
    }
    if (inside(x, y, LAYOUT.pauseButton)) {
      act.onPause();
      return;
    }
    if (s.phase === 'title') {
      if (inside(x, y, LAYOUT.startButton)) act.onStart();
      return;
    }
    if (s.phase === 'over') {
      if (inside(x, y, LAYOUT.againButton)) act.onAgain();
      return;
    }
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (inside(x, y, binRect(i))) {
        act.onBin(INGREDIENTS[i].id);
        return;
      }
    }
    for (let i = 0; i < STATIONS.length; i += 1) {
      if (inside(x, y, stationRect(i))) {
        act.onStation(STATIONS[i].id);
        return;
      }
    }
    for (let i = 0; i < 2; i += 1) {
      if (inside(x, y, plateRect(i))) {
        act.onPlate(i);
        return;
      }
    }
    for (let i = 0; i < s.orders.length; i += 1) {
      if (inside(x, y, ticketRect(i))) {
        act.onTicket(s.orders[i].id);
        return;
      }
    }
    for (let i = 0; i < 3; i += 1) {
      if (inside(x, y, trayRect(i))) {
        act.onSelectTray(i);
        return;
      }
    }
  }

  canvas.addEventListener('click', (event) => {
    const p = logical(event);
    handleClick(p.x, p.y);
  });
  canvas.addEventListener('mousemove', (event) => {
    const p = logical(event);
    let found = null;
    for (let i = 0; i < INGREDIENTS.length; i += 1) {
      if (inside(p.x, p.y, binRect(i))) found = INGREDIENTS[i].id;
    }
    hover.bin = found;
  });

  window.addEventListener('keydown', (event) => {
    const s = getState();
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    const ing = INGREDIENTS.find((g) => g.key === key);
    if (ing && s.phase === 'play') {
      act.onBin(ing.id);
      return;
    }
    const stationKey = { q: 'wok', w: 'grill', e: 'pot' }[key];
    if (stationKey && s.phase === 'play') {
      act.onStation(stationKey);
      return;
    }
    if (key === 'z' && s.phase === 'play') {
      act.onPlate(0);
      return;
    }
    if (key === 'x' && s.phase === 'play') {
      act.onPlate(1);
      return;
    }
    if (key === ' ') {
      event.preventDefault();
      if (s.phase === 'title') act.onStart();
      else if (s.phase === 'over') act.onAgain();
      else act.onServe();
      return;
    }
    if (key === 'p' || key === 'escape') {
      act.onPause();
      return;
    }
    if (key === 'm') {
      act.onMute();
    }
  });

  return {
    /** The ingredient bin the pointer is over, for the hover highlight. */
    get hoverBin() {
      return hover.bin;
    },
  };
}
