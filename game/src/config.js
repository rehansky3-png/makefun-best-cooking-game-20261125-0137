// Dapur Nusantara Rush — game data and layout.
// A busy Indonesian street-food (warung) kitchen: take orders, cook at the wok,
// grill and pot, assemble dishes on plates and serve before the ticket timer ends.
export const W = 1280;
export const H = 720;
export const STEP = 1 / 60;
export const SHIFT_SECONDS = 150;
export const MAX_HEARTS = 3;
export const MAX_ORDERS = 3;
export const MAX_TRAY = 3;
export const MAX_PLATE_ITEMS = 3;
export const PLATE_COUNT = 2;
export const BURN_AFTER = 5; // seconds a finished cook may sit before it burns
export const BEST_KEY = 'dapur-nusantara-best';

/** Warm warung palette. */
export const COLORS = {
  wall: '#8a4f2a',
  wallDark: '#6e3c1e',
  floor: '#c98f5a',
  floorDark: '#b57d47',
  counter: '#a06a35',
  counterEdge: '#7c4f24',
  cream: '#fff3d6',
  paper: '#fff8e7',
  ink: '#3a2415',
  inkSoft: '#6b4a2f',
  red: '#d62828',
  redDark: '#a31d1d',
  green: '#5da130',
  lime: '#8ac926',
  gold: '#f4a300',
  goldDark: '#c77f00',
  wok: '#26221f',
  steel: '#c9c9c9',
  flameA: '#ffb703',
  flameB: '#fb8500',
  flameC: '#ff5400',
  steam: 'rgba(255,255,255,0.75)',
  shadow: 'rgba(0,0,0,0.25)',
};

/** Ingredients on the counter. key = keyboard shortcut. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', color: '#fff8e7', dark: '#e8dcc0', desc: 'Nasi putih' },
  { id: 'mie', name: 'Mie', key: '2', color: '#f2c14e', dark: '#c98f1e', desc: 'Mie kuning' },
  { id: 'telur', name: 'Telur', key: '3', color: '#ffe9a8', dark: '#e0a800', desc: 'Telur ayam' },
  { id: 'ayam', name: 'Ayam', key: '4', color: '#e2703a', dark: '#a34a1d', desc: 'Ayam potong' },
  { id: 'cabai', name: 'Cabai', key: '5', color: '#d62828', dark: '#8f1a1a', desc: 'Cabai merah' },
  { id: 'teh', name: 'Es Teh', key: '6', color: '#b5651d', dark: '#7a3f0e', desc: 'Teh manis dingin' },
];

export const ING_BY_ID = Object.fromEntries(INGREDIENTS.map((g) => [g.id, g]));

/**
 * Dishes. station: 'wok' | 'grill' | 'pot' | null (null = no cooking, straight to the plate).
 * needs: ingredient ids, each cooked at the dish station unless the dish needs no cooking.
 */
export const DISHES = [
  {
    id: 'nasi-goreng',
    name: 'Nasi Goreng',
    price: 12000,
    station: 'wok',
    cookSeconds: 4,
    needs: ['nasi', 'telur', 'cabai'],
    unlockLevel: 1,
    blurb: 'Nasi + telur + cabai, digoreng di wajan',
  },
  {
    id: 'mie-goreng',
    name: 'Mie Goreng',
    price: 14000,
    station: 'wok',
    cookSeconds: 4,
    needs: ['mie', 'ayam', 'cabai'],
    unlockLevel: 1,
    blurb: 'Mie + ayam + cabai, digoreng di wajan',
  },
  {
    id: 'ayam-bakar',
    name: 'Ayam Bakar',
    price: 16000,
    station: 'grill',
    cookSeconds: 5,
    needs: ['ayam', 'cabai'],
    unlockLevel: 1,
    blurb: 'Ayam + cabai, dibakar di panggangan',
  },
  {
    id: 'soto-ayam',
    name: 'Soto Ayam',
    price: 13000,
    station: 'pot',
    cookSeconds: 5,
    needs: ['mie', 'ayam'],
    unlockLevel: 2,
    blurb: 'Mie + ayam, direbus di panci',
  },
  {
    id: 'es-teh',
    name: 'Es Teh Manis',
    price: 5000,
    station: null,
    cookSeconds: 0,
    needs: ['teh'],
    unlockLevel: 3,
    blurb: 'Teh dingin, langsung disajikan',
  },
];

export const DISH_BY_ID = Object.fromEntries(DISHES.map((d) => [d.id, d]));

/** Cooking stations. */
export const STATIONS = [
  { id: 'wok', name: 'Wajan', key: 'Q', desc: 'Goreng cepat' },
  { id: 'grill', name: 'Panggangan', key: 'W', desc: 'Bakar perlahan' },
  { id: 'pot', name: 'Panci', key: 'E', desc: 'Rebus kuah' },
];

export const STATION_BY_ID = Object.fromEntries(STATIONS.map((s) => [s.id, s]));

/** Level curve: serves needed to reach the level, spawn gap and order patience. */
export function levelForServes(serves) {
  if (serves >= 12) return 4;
  if (serves >= 8) return 3;
  if (serves >= 4) return 2;
  return 1;
}

export function spawnGapForLevel(level) {
  return [11, 9, 7.5, 6][level - 1] ?? 6;
}

export function patienceForLevel(level) {
  return [52, 48, 44, 40][level - 1] ?? 40;
}

export function unlockedDishes(level) {
  return DISHES.filter((d) => d.unlockLevel <= level);
}

/** Shared layout: render, input and the screenshot stager all use these rects. */
export const LAYOUT = {
  topBar: { x: 0, y: 0, w: W, h: 62 },
  board: { x: 16, y: 84, w: 276, h: 560 },
  ticket: { w: 260, h: 118, gap: 10 },
  bins: { x: 308, y: 86, w: 664, h: 118 },
  bin: { w: 102, h: 106, gap: 9 },
  stations: { x: 308, y: 218, w: 664, h: 168 },
  station: { w: 212, h: 156, gap: 14 },
  plates: { x: 308, y: 400, w: 664, h: 176 },
  plate: { w: 322, h: 164, gap: 20 },
  pass: { x: 988, y: 84, w: 276, h: 190 },
  side: { x: 988, y: 288, w: 276, h: 288 },
  tray: { x: 308, y: 580, w: 664, h: 124 },
  traySlot: { w: 96, h: 96, gap: 12 },
  startButton: { x: 490, y: 520, w: 300, h: 64 },
  againButton: { x: 490, y: 560, w: 300, h: 64 },
  muteButton: { x: 1224, y: 10, w: 44, h: 42 },
  pauseButton: { x: 1172, y: 10, w: 44, h: 42 },
};

/** Rect of the i-th ingredient bin. */
export function binRect(i) {
  return {
    x: LAYOUT.bins.x + i * (LAYOUT.bin.w + LAYOUT.bin.gap),
    y: LAYOUT.bins.y,
    w: LAYOUT.bin.w,
    h: LAYOUT.bin.h,
  };
}

/** Rect of the i-th station (order: wok, grill, pot). */
export function stationRect(i) {
  return {
    x: LAYOUT.stations.x + i * (LAYOUT.station.w + LAYOUT.station.gap),
    y: LAYOUT.stations.y,
    w: LAYOUT.station.w,
    h: LAYOUT.station.h,
  };
}

/** Rect of the i-th plate. */
export function plateRect(i) {
  return {
    x: LAYOUT.plates.x + i * (LAYOUT.plate.w + LAYOUT.plate.gap),
    y: LAYOUT.plates.y,
    w: LAYOUT.plate.w,
    h: LAYOUT.plate.h,
  };
}

/** Rect of the i-th order ticket. */
export function ticketRect(i) {
  return {
    x: LAYOUT.board.x + 8,
    y: LAYOUT.board.y + 30 + i * (LAYOUT.ticket.h + LAYOUT.ticket.gap),
    w: LAYOUT.ticket.w,
    h: LAYOUT.ticket.h,
  };
}

/** Rect of the i-th tray slot. */
export function trayRect(i) {
  return {
    x: LAYOUT.tray.x + 150 + i * (LAYOUT.traySlot.w + LAYOUT.traySlot.gap),
    y: LAYOUT.tray.y + 14,
    w: LAYOUT.traySlot.w,
    h: LAYOUT.traySlot.h,
  };
}

/** Does a plate's items complete a dish? Returns the dish or null. */
export function dishForPlate(items) {
  const cooked = items.filter((it) => it.cooked).map((it) => it.id).sort();
  const raw = items.filter((it) => !it.cooked).map((it) => it.id).sort();
  for (const dish of DISHES) {
    const needs = [...dish.needs].sort();
    if (dish.station === null) {
      if (raw.length === needs.length && raw.every((id, i) => id === needs[i])) return dish;
    } else if (
      cooked.length === needs.length &&
      cooked.every((id, i) => id === needs[i]) &&
      items.every((it) => it.cooked)
    ) {
      return dish;
    }
  }
  return null;
}

/** Which dish does this order ask for, and which of its ingredients are on the plate already? */
export function plateProgressFor(dish, items) {
  const have = new Set(items.map((it) => it.id));
  return dish.needs.map((id) => ({ id, have: have.has(id) }));
}

/** Rupiah formatting: 12000 -> "Rp12.000". */
export function rupiah(n) {
  return `Rp${Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}

/** mm:ss for the shift clock. */
export function clock(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** Point inside a rect. */
export function inside(x, y, r) {
  return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h;
}
