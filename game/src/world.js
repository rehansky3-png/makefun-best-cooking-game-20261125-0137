// Dapur Nusantara Rush — game state and rules.
// The loop: click a bin to take an ingredient, cook it at its station, put the
// cooked food on a plate, and click the matching order ticket to serve it.
// A cooked dish left in its station burns; an order left too long is lost.
import {
  BURN_AFTER,
  DISH_BY_ID,
  ING_BY_ID,
  LAYOUT,
  MAX_HEARTS,
  MAX_ORDERS,
  MAX_PLATE_ITEMS,
  MAX_TRAY,
  SHIFT_SECONDS,
  STATIONS,
  dishForPlate,
  levelForServes,
  patienceForLevel,
  spawnGapForLevel,
  unlockedDishes,
} from './config.js';
import { shuffle } from './rng.js';

/** Which station cooks this ingredient (null = served raw, straight to the plate). */
export const COOKS_AT = { nasi: 'wok', mie: 'pot', telur: 'wok', ayam: 'grill', cabai: 'wok', teh: null };
/** Seconds a station needs for one item. */
export const COOK_TIME = { wok: 3.5, grill: 5, pot: 4.5 };

export const EVENT_ORDER = 1;
export const EVENT_SERVED = 2;
export const EVENT_EXPIRED = 4;
export const EVENT_WRONG = 8;
export const EVENT_BURNED = 16;
export const EVENT_LEVEL = 32;
export const EVENT_OVER = 64;
export const EVENT_DONE = 128; // a cook just finished — time to collect it

let orderSeq = 0;

export function createWorld(rng) {
  const state = {
    rng,
    phase: 'title',
    time: 0,
    shiftLeft: SHIFT_SECONDS,
    score: 0,
    coins: 0,
    combo: 0,
    bestCombo: 0,
    hearts: MAX_HEARTS,
    serves: 0,
    served: 0,
    missed: 0,
    wrong: 0,
    level: 1,
    orders: [],
    spawnIn: 4,
    tray: [],
    stations: { wok: null, grill: null, pot: null },
    plates: [[], []],
    selectedPlate: 0,
    particles: [],
    floats: [],
    servedDish: null, // { dishId, t } shown flying into the pass window
    shake: 0,
    flash: null, // { color, t }
    hint: '', // short helper text under the counter
    hintT: 0,
    summary: null,
    events: [],
    steamT: 0,
  };
  return {
    state,
    reset,
    step,
    takeIngredient,
    clickStation,
    clickPlate,
    clickTicket,
    serveFirstMatch,
    dishForOrder,
  };

  function reset() {
    orderSeq = 0;
    state.phase = 'play';
    state.time = 0;
    state.shiftLeft = SHIFT_SECONDS;
    state.score = 0;
    state.coins = 0;
    state.combo = 0;
    state.bestCombo = 0;
    state.hearts = MAX_HEARTS;
    state.serves = 0;
    state.served = 0;
    state.missed = 0;
    state.wrong = 0;
    state.level = 1;
    state.orders = [];
    state.spawnIn = 4;
    state.tray = [];
    state.stations = { wok: null, grill: null, pot: null };
    state.plates = [[], []];
    state.selectedPlate = 0;
    state.particles = [];
    state.floats = [];
    state.servedDish = null;
    state.shake = 0;
    state.flash = null;
    state.hint = 'Klik bahan, masak di alatnya, susun di piring, antar ke pesanan!';
    state.hintT = 6;
    state.summary = null;
    state.events = [];
    spawnOrder(true);
    spawnOrder(true);
  }

  /** Spawn one order ticket (first two at shift start lean toward quick dishes). */
  function spawnOrder(early = false) {
    if (state.orders.length >= MAX_ORDERS) return;
    const pool = unlockedDishes(state.level);
    let dish = state.rng.pick(pool);
    if (early) {
      // Quick dishes first — but only when at least two kinds qualify,
      // otherwise the board fills with copies of one dish.
      const quick = pool.filter((d) => d.needs.length <= 2);
      const earlyPool = new Set(quick.map((d) => d.id)).size >= 2 ? quick : pool;
      dish = state.rng.pick(earlyPool);
    }
    // Never show the same dish three times at once.
    const same = state.orders.filter((o) => o.dishId === dish.id).length;
    if (same >= 2) {
      const others = pool.filter((d) => d.id !== dish.id);
      if (others.length > 0) dish = state.rng.pick(others);
    }
    const patience = patienceForLevel(state.level);
    state.orders.push({
      id: ++orderSeq,
      dishId: dish.id,
      left: patience,
      total: patience,
      born: state.time,
    });
    state.events.push(EVENT_ORDER);
  }

  /** The dish a ticket asks for. */
  function dishForOrder(order) {
    return DISH_BY_ID[order.dishId];
  }

  /** Take one raw ingredient from a bin into the hand (tray). */
  function takeIngredient(id) {
    if (state.phase !== 'play') return 'idle';
    if (state.tray.length >= MAX_TRAY) {
      setHint('Tangan penuh! Masak atau susun dulu bahan yang ada.');
      return 'full';
    }
    state.tray.push({ id, cooked: false });
    return 'take';
  }

  /** Click a station: clear a burnt item, collect a finished cook, or start cooking. */
  function clickStation(id) {
    if (state.phase !== 'play') return 'idle';
    const slot = state.stations[id];
    if (slot && slot.burned) {
      state.stations[id] = null;
      state.events.push(EVENT_BURNED);
      setHint('Makanan gosong dibuang. Ayo masak lagi!');
      return 'trash';
    }
    if (slot && slot.done) {
      if (state.tray.length >= MAX_TRAY) {
        setHint('Tangan penuh! Kosongkan dulu.');
        return 'full';
      }
      state.tray.push({ id: slot.itemId, cooked: true });
      state.stations[id] = null;
      return 'collect';
    }
    if (slot) return 'cooking';
    const idx = state.tray.findIndex((it) => !it.cooked && COOKS_AT[it.id] === id);
    if (idx < 0) {
      const hasRaw = state.tray.some((it) => !it.cooked);
      setHint(
        hasRaw
          ? `${STATIONS.find((s) => s.id === id).name} bukan untuk bahan itu — cek ikon alat di tiket.`
          : 'Ambil bahan dulu dari meja, baru masak di sini.',
      );
      return 'wrong-station';
    }
    const item = state.tray.splice(idx, 1)[0];
    state.stations[id] = { itemId: item.id, progress: 0, cook: COOK_TIME[id], done: false, burnLeft: BURN_AFTER, burned: false };
    return 'cook';
  }

  /** Click a plate: put a cooked item (or raw tea) on it, or select it. */
  function clickPlate(i) {
    if (state.phase !== 'play') return 'idle';
    state.selectedPlate = i;
    const plate = state.plates[i];
    const idx = state.tray.findIndex((it) => it.cooked || COOKS_AT[it.id] === null);
    if (idx < 0) {
      if (state.tray.length > 0) setHint('Bahan mentah harus dimasak dulu di alatnya.');
      return 'select';
    }
    if (plate.length >= MAX_PLATE_ITEMS) {
      setHint('Piring sudah penuh (3 bahan). Antar dulu ke pesanan!');
      return 'full';
    }
    plate.push(state.tray.splice(idx, 1)[0]);
    const dish = dishForPlate(plate);
    if (dish) setHint(`${dish.name} siap! Klik tiket ${dish.name} untuk mengantar.`);
    return 'plate';
  }

  /** Click an order ticket: serve it from the plate that holds the matching dish. */
  function clickTicket(orderId) {
    if (state.phase !== 'play') return 'idle';
    const order = state.orders.find((o) => o.id === orderId);
    if (!order) return 'idle';
    const plateIdx = state.plates.findIndex((p) => {
      const dish = dishForPlate(p);
      return dish && dish.id === order.dishId;
    });
    if (plateIdx < 0) {
      state.wrong += 1;
      state.events.push(EVENT_WRONG);
      setHint('Belum ada piring yang cocok. Susun dulu sesuai resep di tiket!');
      return 'wrong';
    }
    serve(order, plateIdx);
    return 'serve';
  }

  /** Serve the first order that has a matching complete plate (Space key). */
  function serveFirstMatch() {
    if (state.phase !== 'play') return 'idle';
    for (const order of state.orders) {
      const plateIdx = state.plates.findIndex((p) => {
        const dish = dishForPlate(p);
        return dish && dish.id === order.dishId;
      });
      if (plateIdx >= 0) {
        serve(order, plateIdx);
        return 'serve';
      }
    }
    setHint('Belum ada hidangan lengkap untuk pesanan yang ada.');
    return 'wrong';
  }

  function serve(order, plateIdx) {
    const dish = DISH_BY_ID[order.dishId];
    state.plates[plateIdx] = [];
    state.orders = state.orders.filter((o) => o.id !== order.id);
    state.combo += 1;
    state.bestCombo = Math.max(state.bestCombo, state.combo);
    const mult = 1 + Math.min(2, (state.combo - 1) * 0.25);
    const pts = Math.round((dish.price / 100) * mult);
    state.score += pts;
    state.coins += dish.price;
    state.serves += 1;
    state.served += 1;
    const oldLevel = state.level;
    state.level = levelForServes(state.serves);
    state.servedDish = { dishId: dish.id, t: 0 };
    const rect = { x: LAYOUT.pass.x + 40, y: LAYOUT.pass.y + 60 };
    addFloat(rect.x + 90, rect.y + 10, `+Rp${dish.price.toLocaleString('id-ID')}`, '#f4a300', 26);
    addFloat(rect.x + 90, rect.y + 44, `+${pts} poin${state.combo > 1 ? `  COMBO x${state.combo}` : ''}`, '#fff3d6', 20);
    burst(rect.x + 90, rect.y + 30, '#ffd166', 14);
    state.events.push(EVENT_SERVED);
    if (state.level > oldLevel) {
      state.events.push(EVENT_LEVEL);
      const unlocked = unlockedDishes(state.level).filter((d) => d.unlockLevel === state.level);
      setHint(
        unlocked.length > 0
          ? `LEVEL ${state.level}! Menu baru: ${unlocked.map((d) => d.name).join(', ')}. Pesanan makin cepat!`
          : `LEVEL ${state.level}! Pesanan makin cepat!`,
      );
    }
  }

  function setHint(text) {
    state.hint = text;
    state.hintT = 4;
  }

  function addFloat(x, y, text, color, size) {
    state.floats.push({ x, y, life: 1.6, max: 1.6, text, color, size });
  }

  function burst(x, y, color, n) {
    for (let i = 0; i < n; i += 1) {
      const a = state.rng.next() * Math.PI * 2;
      const sp = 40 + state.rng.next() * 120;
      state.particles.push({
        kind: 'spark',
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 40,
        life: 0.7 + state.rng.next() * 0.4,
        max: 1,
        size: 3 + state.rng.next() * 4,
        color,
      });
    }
  }

  /** Advance the world one fixed step. Returns the event bits raised this step. */
  function step(dt) {
    if (state.phase !== 'play') return 0;
    state.time += dt;
    state.shiftLeft -= dt;
    if (state.hintT > 0) state.hintT -= dt;
    if (state.shake > 0) state.shake -= dt;
    if (state.flash) {
      state.flash.t -= dt;
      if (state.flash.t <= 0) state.flash = null;
    }
    if (state.servedDish) {
      state.servedDish.t += dt;
      if (state.servedDish.t > 3) state.servedDish = null;
    }

    // New orders arrive on a timer.
    state.spawnIn -= dt;
    if (state.spawnIn <= 0) {
      spawnOrder();
      state.spawnIn = spawnGapForLevel(state.level) * (0.85 + state.rng.next() * 0.3);
    }

    // Order patience runs out.
    for (const order of [...state.orders]) {
      order.left -= dt;
      if (order.left <= 0) {
        state.orders = state.orders.filter((o) => o.id !== order.id);
        state.missed += 1;
        state.hearts -= 1;
        state.combo = 0;
        state.shake = 0.35;
        state.flash = { color: 'rgba(214,40,40,0.25)', t: 0.4 };
        state.events.push(EVENT_EXPIRED);
        setHint(`Pesanan ${DISH_BY_ID[order.dishId].name} hangus — pelanggan pulang kecewa!`);
        if (state.hearts <= 0) {
          endShift('hearts');
          return drainEvents();
        }
      }
    }

    // Cooking progresses; finished food burns if ignored.
    let anyCooking = false;
    for (const [id, slot] of Object.entries(state.stations)) {
      if (!slot) continue;
      if (!slot.done) {
        anyCooking = true;
        slot.progress += dt / slot.cook;
        if (slot.progress >= 1) {
          slot.progress = 1;
          slot.done = true;
          slot.burnLeft = BURN_AFTER;
          state.events.push(EVENT_DONE);
        }
      } else if (!slot.burned) {
        slot.burnLeft -= dt;
        if (slot.burnLeft <= 0) {
          slot.burned = true;
          state.events.push(EVENT_BURNED);
          setHint('Makanan gosong! Klik alatnya untuk membuang.');
        }
      }
    }
    state.cooking = anyCooking;

    // Steam and smoke particles.
    state.steamT -= dt;
    if (state.steamT <= 0) {
      state.steamT = 0.22;
      for (const [id, slot] of Object.entries(state.stations)) {
        if (!slot || slot.burned) continue;
        const r = stationRectFor(id);
        state.particles.push({
          kind: slot.burned ? 'smoke' : 'steam',
          x: r.x + r.w / 2 + (state.rng.next() - 0.5) * 60,
          y: r.y + 42,
          vx: (state.rng.next() - 0.5) * 12,
          vy: -28 - state.rng.next() * 18,
          life: 0.9 + state.rng.next() * 0.5,
          max: 1.4,
          size: 7 + state.rng.next() * 8,
          color: slot.burned ? '#555' : '#fff',
        });
      }
    }
    for (const p of state.particles) {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.kind === 'spark') p.vy += 260 * dt;
    }
    state.particles = state.particles.filter((p) => p.life > 0);
    for (const f of state.floats) {
      f.life -= dt;
      f.y -= 26 * dt;
    }
    state.floats = state.floats.filter((f) => f.life > 0);

    if (state.shiftLeft <= 0) {
      state.shiftLeft = 0;
      endShift('time');
    }
    return drainEvents();
  }

  function stationRectFor(id) {
    const i = STATIONS.findIndex((s) => s.id === id);
    return {
      x: LAYOUT.stations.x + i * (LAYOUT.station.w + LAYOUT.station.gap),
      y: LAYOUT.stations.y,
      w: LAYOUT.station.w,
      h: LAYOUT.station.h,
    };
  }

  function endShift(reason) {
    state.phase = 'over';
    const stars = state.served >= 12 ? 3 : state.served >= 8 ? 2 : state.served >= 4 ? 1 : 0;
    state.summary = {
      reason,
      served: state.served,
      missed: state.missed,
      coins: state.coins,
      score: state.score,
      bestCombo: state.bestCombo,
      stars,
      level: state.level,
    };
    state.events.push(EVENT_OVER);
  }

  function drainEvents() {
    let bits = 0;
    for (const e of state.events) bits |= e;
    state.events = [];
    return bits;
  }
}
