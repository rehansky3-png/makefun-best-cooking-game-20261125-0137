// Dapur Nusantara Rush — all canvas drawing. Every pixel is drawn in code:
// the warung kitchen, the food, the tickets, the plates and the screens.
import {
  COLORS,
  DISH_BY_ID,
  ING_BY_ID,
  LAYOUT,
  STATIONS,
  W,
  H,
  binRect,
  clock,
  dishForPlate,
  plateProgressFor,
  plateRect,
  rupiah,
  stationRect,
  ticketRect,
  trayRect,
} from './config.js';
import { COOKS_AT, COOK_TIME } from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, s, x, y, size, color, weight = 700, align = 'left', font = '"Trebuchet MS", system-ui, sans-serif') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${font}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(s, x, y);
}

function ellipse(ctx, x, y, rx, ry, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function circle(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

/** One ingredient's vector drawing. cooked changes its look (fried, grilled, boiled). */
export function drawIngredient(ctx, id, x, y, r, cooked = false, t = 0) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ellipse(ctx, 0, r * 0.25, r * 0.95, r * 0.55, cooked ? '#e8a94e' : '#fff8e7');
    ellipse(ctx, -r * 0.3, -r * 0.15, r * 0.55, r * 0.42, cooked ? '#f2c14e' : '#fffdf4');
    ellipse(ctx, r * 0.25, -r * 0.2, r * 0.5, r * 0.4, cooked ? '#e8a94e' : '#fdf6e0');
    ctx.fillStyle = cooked ? '#5da130' : '#e8dcc0';
    for (let i = 0; i < 5; i += 1) {
      const a = -0.6 + i * 0.3;
      ctx.fillRect(Math.cos(a) * r * 0.55 - 2, Math.sin(a) * r * 0.3 - 2, 4, 4);
    }
    if (cooked) {
      ctx.fillStyle = '#d62828';
      ctx.fillRect(-r * 0.2, -r * 0.35, 6, 3);
      ctx.fillRect(r * 0.15, -r * 0.1, 6, 3);
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = cooked ? '#d99a26' : '#f2c14e';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    for (let i = 0; i < 4; i += 1) {
      ctx.beginPath();
      ctx.arc(0, r * 0.1, r * (0.75 - i * 0.16), Math.PI * (0.15 + i * 0.12), Math.PI * (0.85 - i * 0.08));
      ctx.stroke();
    }
    if (cooked) {
      ctx.fillStyle = '#8ac926';
      circle(ctx, -r * 0.4, -r * 0.3, r * 0.12, '#8ac926');
      circle(ctx, r * 0.35, -r * 0.25, r * 0.12, '#8ac926');
    }
  } else if (id === 'telur') {
    if (cooked) {
      ctx.fillStyle = '#fffdf4';
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0.2, 0, Math.PI * 2);
      ctx.fill();
      circle(ctx, r * 0.1, -r * 0.05, r * 0.38, '#f4a300');
      circle(ctx, r * 0.02, -r * 0.12, r * 0.14, '#ffd166');
    } else {
      ellipse(ctx, 0, 0, r * 0.62, r * 0.8, '#ffe9a8');
      ellipse(ctx, -r * 0.12, -r * 0.18, r * 0.3, r * 0.42, '#fff3c4');
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = cooked ? '#a34a1d' : '#e2703a';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.62, r * 0.55, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = cooked ? '#7a3410' : '#c25a28';
    ctx.beginPath();
    ctx.ellipse(r * 0.1, -r * 0.2, r * 0.4, r * 0.32, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#fdf6e0';
    ctx.lineWidth = r * 0.16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(r * 0.55, r * 0.35);
    ctx.lineTo(r * 0.85, r * 0.65);
    ctx.stroke();
    circle(ctx, r * 0.88, r * 0.68, r * 0.16, '#fdf6e0');
    if (cooked) {
      ctx.strokeStyle = '#5c2408';
      ctx.lineWidth = r * 0.09;
      ctx.beginPath();
      ctx.moveTo(-r * 0.4, -r * 0.35);
      ctx.lineTo(-r * 0.1, -r * 0.05);
      ctx.moveTo(-r * 0.2, -r * 0.45);
      ctx.lineTo(r * 0.1, -r * 0.15);
      ctx.stroke();
    }
  } else if (id === 'cabai') {
    ctx.strokeStyle = cooked ? '#8f1a1a' : '#d62828';
    ctx.lineWidth = r * 0.34;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.3);
    ctx.quadraticCurveTo(0, r * 0.75, r * 0.75, -r * 0.35);
    ctx.stroke();
    ctx.strokeStyle = '#5da130';
    ctx.lineWidth = r * 0.14;
    ctx.beginPath();
    ctx.moveTo(-r * 0.7, -r * 0.3);
    ctx.lineTo(-r * 0.85, -r * 0.62);
    ctx.stroke();
  } else if (id === 'teh') {
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    rr(ctx, -r * 0.5, -r * 0.7, r, r * 1.4, r * 0.15);
    ctx.fill();
    ctx.fillStyle = '#b5651d';
    rr(ctx, -r * 0.38, -r * 0.25, r * 0.76, r * 0.85, r * 0.1);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.fillRect(-r * 0.3, -r * 0.15, r * 0.16, r * 0.16);
    ctx.fillRect(r * 0.05, r * 0.15, r * 0.16, r * 0.16);
    ctx.strokeStyle = '#d62828';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(r * 0.15, -r * 0.55);
    ctx.lineTo(r * 0.4, -r * 1.05);
    ctx.stroke();
  }
  ctx.restore();
}

/** A finished dish, drawn on a plate or ticket. */
export function drawDish(ctx, dishId, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (dishId === 'nasi-goreng' || dishId === 'mie-goreng') {
    const base = dishId === 'nasi-goreng' ? '#e8a94e' : '#f2c14e';
    ellipse(ctx, 0, r * 0.15, r * 0.95, r * 0.6, base);
    ellipse(ctx, 0, -r * 0.1, r * 0.75, r * 0.5, dishId === 'nasi-goreng' ? '#f2c14e' : '#e8a94e');
    drawIngredient(ctx, 'telur', r * 0.15, -r * 0.3, r * 0.45, true);
    ctx.fillStyle = '#5da130';
    circle(ctx, -r * 0.5, -r * 0.1, r * 0.1, '#5da130');
    circle(ctx, r * 0.5, r * 0.05, r * 0.1, '#5da130');
    drawIngredient(ctx, 'cabai', -r * 0.55, r * 0.35, r * 0.3, true);
  } else if (dishId === 'ayam-bakar') {
    drawIngredient(ctx, 'ayam', -r * 0.1, 0, r * 0.85, true);
    drawIngredient(ctx, 'cabai', r * 0.55, r * 0.3, r * 0.32, true);
  } else if (dishId === 'soto-ayam') {
    ctx.fillStyle = '#fdf6e0';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.95, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2c14e';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.05, r * 0.8, r * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#e8a94e';
    ctx.lineWidth = r * 0.08;
    for (let i = 0; i < 3; i += 1) {
      ctx.beginPath();
      ctx.arc(0, 0, r * (0.55 - i * 0.15), Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
    drawIngredient(ctx, 'ayam', r * 0.25, -r * 0.15, r * 0.35, true);
  } else if (dishId === 'es-teh') {
    drawIngredient(ctx, 'teh', 0, 0, r * 0.8, true);
  }
  ctx.restore();
}

/** The warung: wooden plank wall, hanging lamps, tiled floor. */
function drawBackground(ctx, t) {
  ctx.fillStyle = COLORS.wall;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  for (let x = 0; x < W; x += 96) ctx.fillRect(x, 0, 3, H);
  ctx.fillStyle = 'rgba(255,255,255,0.05)';
  for (let x = 48; x < W; x += 96) ctx.fillRect(x, 0, 2, H);
  // Warm glow over the counter.
  const glow = ctx.createRadialGradient(640, 300, 60, 640, 300, 620);
  glow.addColorStop(0, 'rgba(255,190,90,0.20)');
  glow.addColorStop(1, 'rgba(255,190,90,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
  // Floor tiles.
  ctx.fillStyle = COLORS.floor;
  ctx.fillRect(0, 668, W, 52);
  ctx.fillStyle = COLORS.floorDark;
  for (let x = 0; x < W; x += 64) ctx.fillRect(x, 668, 2, 52);
  ctx.fillRect(0, 668, W, 3);
  ctx.fillStyle = 'rgba(255,255,255,0.10)';
  ctx.fillRect(0, 671, W, 2);
  // Hanging lamps with a gentle sway.
  for (const lx of [420, 640, 860]) {
    const sway = Math.sin(t * 0.7 + lx) * 4;
    ctx.strokeStyle = '#3a2415';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(lx + sway, 0);
    ctx.lineTo(lx + sway, 34);
    ctx.stroke();
    ctx.fillStyle = '#2b1a0e';
    ctx.beginPath();
    ctx.moveTo(lx + sway - 16, 36);
    ctx.lineTo(lx + sway + 16, 36);
    ctx.lineTo(lx + sway + 8, 52);
    ctx.lineTo(lx + sway - 8, 52);
    ctx.closePath();
    ctx.fill();
    const lg = ctx.createRadialGradient(lx + sway, 56, 2, lx + sway, 56, 46);
    lg.addColorStop(0, 'rgba(255,214,120,0.85)');
    lg.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = lg;
    ctx.beginPath();
    ctx.arc(lx + sway, 56, 46, 0, Math.PI * 2);
    ctx.fill();
    circle(ctx, lx + sway, 54, 7, '#ffe9a8');
  }
  // Wall sign.
  ctx.save();
  ctx.translate(154, 40);
  ctx.fillStyle = '#5c3416';
  rr(ctx, -138, -16, 276, 32, 8);
  ctx.fill();
  ctx.strokeStyle = '#f4a300';
  ctx.lineWidth = 2;
  rr(ctx, -138, -16, 276, 32, 8);
  ctx.stroke();
  text(ctx, '★ DAPUR NUSANTARA ★', 0, 6, 17, '#ffd166', 800, 'center');
  ctx.restore();
}

/** Top HUD: shift clock, score, coins, combo, hearts, level, pause/mute. */
function drawTopBar(ctx, s, best, muted) {
  const bar = LAYOUT.topBar;
  ctx.fillStyle = 'rgba(40,20,8,0.55)';
  ctx.fillRect(bar.x, bar.y, bar.w, bar.h);
  ctx.fillStyle = COLORS.gold;
  ctx.fillRect(0, bar.h - 3, W, 3);
  // Shift clock — big, center-left.
  const low = s.shiftLeft <= 30;
  const pulse = low ? 1 + Math.sin(s.time * 8) * 0.08 : 1;
  ctx.save();
  ctx.translate(352, 34);
  ctx.scale(pulse, pulse);
  text(ctx, '⏱ ' + clock(s.shiftLeft), 0, 0, 30, low ? '#ff6b6b' : '#fff3d6', 800, 'center');
  ctx.restore();
  // Score and coins.
  text(ctx, `SKOR ${s.score.toLocaleString('id-ID')}`, 470, 26, 20, '#fff3d6', 800);
  text(ctx, `${rupiah(s.coins)}`, 470, 50, 18, '#ffd166', 800);
  // Combo.
  if (s.combo >= 2) {
    ctx.fillStyle = '#d62828';
    rr(ctx, 640, 10, 150, 42, 10);
    ctx.fill();
    text(ctx, `COMBO x${s.combo}`, 715, 38, 22, '#fff3d6', 800, 'center');
  }
  // Level.
  text(ctx, `LEVEL ${s.level}`, 810, 26, 18, '#8ac926', 800);
  text(ctx, `Terbaik ${best.toLocaleString('id-ID')}`, 810, 50, 14, '#fff3d6', 700);
  // Hearts.
  for (let i = 0; i < 3; i += 1) {
    const hx = 950 + i * 34;
    drawHeart(ctx, hx, 32, 13, i < s.hearts ? '#ff4d6d' : 'rgba(255,255,255,0.25)');
  }
  text(ctx, 'PELANGGAN', 1010, 56, 11, '#ffd166', 700, 'center');
  // Pause / mute buttons.
  for (const [r, label] of [
    [LAYOUT.pauseButton, 'II'],
    [LAYOUT.muteButton, muted ? '✕' : '♪'],
  ]) {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    rr(ctx, r.x, r.y, r.w, r.h, 8);
    ctx.fill();
    text(ctx, label, r.x + r.w / 2, r.y + r.h / 2 + 7, 18, '#fff3d6', 800, 'center');
  }
}

function drawHeart(ctx, x, y, r, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 0.9);
  ctx.bezierCurveTo(x - r * 1.4, y, x - r * 0.7, y - r, x, y - r * 0.35);
  ctx.bezierCurveTo(x + r * 0.7, y - r, x + r * 1.4, y, x, y + r * 0.9);
  ctx.fill();
}

/** The order board: paper tickets with dish, recipe chips and a patience bar. */
function drawBoard(ctx, s, t) {
  const b = LAYOUT.board;
  ctx.fillStyle = '#5c3416';
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = '#7c4f24';
  rr(ctx, b.x + 4, b.y + 4, b.w - 8, b.h - 8, 10);
  ctx.fill();
  text(ctx, '— PAPAN PESANAN —', b.x + b.w / 2, b.y + 24, 16, '#ffd166', 800, 'center');
  s.orders.forEach((order, i) => {
    const r = ticketRect(i);
    const dish = DISH_BY_ID[order.dishId];
    const frac = Math.max(0, order.left / order.total);
    const urgent = order.left <= 10;
    const wobble = urgent ? Math.sin(t * 10 + i) * 1.5 : 0;
    ctx.save();
    ctx.translate(r.x + r.w / 2 + wobble, r.y + r.h / 2);
    ctx.rotate(urgent ? Math.sin(t * 6 + i) * 0.012 : (i - 1) * 0.008);
    ctx.translate(-r.w / 2, -r.h / 2);
    ctx.fillStyle = COLORS.shadow;
    rr(ctx, 3, 5, r.w, r.h, 10);
    ctx.fill();
    ctx.fillStyle = COLORS.paper;
    rr(ctx, 0, 0, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = urgent ? '#d62828' : '#d8c49a';
    ctx.lineWidth = urgent ? 3 : 2;
    rr(ctx, 1, 1, r.w - 2, r.h - 2, 10);
    ctx.stroke();
    drawDish(ctx, dish.id, 46, 44, 30);
    text(ctx, dish.name, 84, 30, 19, COLORS.ink, 800);
    text(ctx, rupiah(dish.price), 84, 52, 15, '#a34a1d', 800);
    // Recipe chips: ingredient + its station icon.
    dish.needs.forEach((id, j) => {
      const cx = 88 + j * 56;
      drawIngredient(ctx, id, cx, 76, 13, false);
      const st = COOKS_AT[id];
      text(ctx, st === 'wok' ? 'W' : st === 'grill' ? 'G' : st === 'pot' ? 'P' : '✦', cx + 13, 86, 11, '#6b4a2f', 800);
    });
    // Patience bar.
    ctx.fillStyle = '#e8dcc0';
    rr(ctx, 12, r.h - 18, r.w - 24, 10, 5);
    ctx.fill();
    const barColor = frac > 0.5 ? '#5da130' : frac > 0.25 ? '#f4a300' : '#d62828';
    ctx.fillStyle = barColor;
    if (frac > 0.02) {
      rr(ctx, 12, r.h - 18, Math.max(10, (r.w - 24) * frac), 10, 5);
      ctx.fill();
    }
    text(ctx, `${Math.ceil(order.left)} dtk`, r.w - 14, r.h - 24, 12, urgent ? '#d62828' : '#6b4a2f', 800, 'right');
    ctx.restore();
  });
  if (s.orders.length === 0) {
    text(ctx, 'Tidak ada pesanan…', b.x + b.w / 2, b.y + 120, 16, '#ffd166', 700, 'center');
    text(ctx, 'Pesanan baru segera datang!', b.x + b.w / 2, b.y + 146, 14, '#fff3d6', 700, 'center');
  }
  text(ctx, 'Klik tiket untuk mengantar', b.x + b.w / 2, b.y + b.h - 30, 12, '#ffd166', 700, 'center');
  text(ctx, 'hidangan yang cocok!', b.x + b.w / 2, b.y + b.h - 12, 12, '#ffd166', 700, 'center');
}

/** Ingredient bins on the counter. */
function drawBins(ctx, s, t) {
  const bins = LAYOUT.bins;
  ctx.fillStyle = COLORS.counter;
  rr(ctx, bins.x - 8, bins.y - 8, bins.w + 16, bins.h + 16, 12);
  ctx.fill();
  ctx.fillStyle = COLORS.counterEdge;
  ctx.fillRect(bins.x - 8, bins.y + bins.h - 2, bins.w + 16, 10);
  text(ctx, 'BAHAN DI MEJA — klik untuk mengambil', bins.x + 4, bins.y - 14, 13, '#ffd166', 800);
  const names = ['nasi', 'mie', 'telur', 'ayam', 'cabai', 'teh'];
  names.forEach((id, i) => {
    const r = binRect(i);
    const g = ING_BY_ID[id];
    const hover = s.hoverBin === id;
    ctx.fillStyle = hover ? '#fff8e7' : '#f3e3c2';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = '#a9803e';
    ctx.lineWidth = 2;
    rr(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 10);
    ctx.stroke();
    drawIngredient(ctx, id, r.x + r.w / 2, r.y + 42, 26, false, t);
    text(ctx, g.name, r.x + r.w / 2, r.y + 82, 15, COLORS.ink, 800, 'center');
    const st = COOKS_AT[id];
    text(
      ctx,
      st === null ? 'langsung saji' : st === 'wok' ? '→ Wajan' : st === 'grill' ? '→ Panggang' : '→ Panci',
      r.x + r.w / 2,
      r.y + 99,
      11,
      '#6b4a2f',
      700,
      'center',
    );
    ctx.fillStyle = '#3a2415';
    circle(ctx, r.x + r.w - 14, r.y + 14, 11, '#3a2415');
    text(ctx, g.key, r.x + r.w - 14, r.y + 18, 13, '#ffd166', 800, 'center');
  });
}

/** The three cooking stations with flames, progress rings and burn smoke. */
function drawStations(ctx, s, t) {
  text(ctx, 'ALAT MASAK — klik untuk memasak / mengambil', LAYOUT.stations.x + 4, LAYOUT.stations.y - 12, 13, '#ffd166', 800);
  STATIONS.forEach((st, i) => {
    const r = stationRect(i);
    const slot = s.stations[st.id];
    ctx.fillStyle = 'rgba(0,0,0,0.28)';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.fillStyle = '#4a3220';
    rr(ctx, r.x + 3, r.y + 3, r.w - 6, r.h - 6, 10);
    ctx.fill();
    const cx = r.x + r.w / 2;
    const cy = r.y + 78;
    if (st.id === 'wok') {
      drawFlame(ctx, cx, r.y + r.h - 26, 34, t);
      ctx.fillStyle = COLORS.wok;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 74, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a3430';
      ctx.beginPath();
      ctx.ellipse(cx, cy - 4, 66, 24, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (st.id === 'grill') {
      for (let c = 0; c < 5; c += 1) {
        const flick = 0.75 + Math.sin(t * 5 + c * 1.7) * 0.25;
        circle(ctx, cx - 56 + c * 28, r.y + r.h - 30, 11, `rgba(251,133,0,${0.5 * flick})`);
      }
      ctx.fillStyle = '#6e6e6e';
      rr(ctx, cx - 78, cy - 26, 156, 12, 4);
      ctx.fill();
      ctx.strokeStyle = '#3a3a3a';
      ctx.lineWidth = 2;
      for (let g = 0; g < 6; g += 1) {
        ctx.beginPath();
        ctx.moveTo(cx - 70 + g * 28, cy - 26);
        ctx.lineTo(cx - 70 + g * 28, cy - 14);
        ctx.stroke();
      }
    } else {
      drawFlame(ctx, cx, r.y + r.h - 22, 26, t + 2);
      ctx.fillStyle = '#8a8f96';
      rr(ctx, cx - 62, cy - 34, 124, 62, 10);
      ctx.fill();
      ctx.fillStyle = '#6e7278';
      rr(ctx, cx - 70, cy - 42, 140, 14, 7);
      ctx.fill();
    }
    if (slot) {
      if (slot.burned) {
        drawIngredient(ctx, slot.itemId, cx, cy - 6, 26, true, t);
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ellipse(ctx, cx, cy - 6, 34, 26, 'rgba(0,0,0,0.55)');
        text(ctx, 'GOSONG!', cx, cy - 44, 16, '#ff6b6b', 800, 'center');
        text(ctx, 'klik untuk buang', cx, cy + 52, 12, '#ffd166', 700, 'center');
      } else {
        drawIngredient(ctx, slot.itemId, cx, cy - 6, 26, slot.done, t);
        // Progress ring.
        const pr = 30;
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy - 6, pr + 12, 0, Math.PI * 2);
        ctx.stroke();
        ctx.strokeStyle = slot.done ? '#8ac926' : '#f4a300';
        ctx.beginPath();
        ctx.arc(cx, cy - 6, pr + 12, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * slot.progress);
        ctx.stroke();
        if (slot.done) {
          const blink = 0.6 + Math.sin(t * 8) * 0.4;
          text(ctx, 'SIAP!', cx, cy - 52, 18, `rgba(138,201,38,${blink})`, 800, 'center');
          text(ctx, `${Math.ceil(slot.burnLeft)} dtk lagi gosong`, cx, cy + 52, 12, '#ff9d5c', 700, 'center');
        } else {
          text(ctx, `${Math.ceil((1 - slot.progress) * slot.cook)} dtk`, cx, cy + 52, 13, '#fff3d6', 800, 'center');
        }
      }
    }
    text(ctx, `${st.name}  [${st.key}]`, cx, r.y + 22, 15, '#ffd166', 800, 'center');
    text(ctx, st.desc, cx, r.y + r.h - 8, 11, '#c9a06a', 700, 'center');
  });
}

function drawFlame(ctx, x, y, size, t) {
  for (let i = 0; i < 3; i += 1) {
    const wob = Math.sin(t * 9 + i * 2.1) * size * 0.08;
    const h = size * (1 + Math.sin(t * 7 + i * 1.3) * 0.15);
    ctx.fillStyle = [COLORS.flameC, COLORS.flameB, COLORS.flameA][i];
    ctx.beginPath();
    ctx.moveTo(x - size * 0.55 + wob, y);
    ctx.quadraticCurveTo(x - size * 0.3 + wob, y - h * 0.8, x + wob, y - h);
    ctx.quadraticCurveTo(x + size * 0.3 + wob, y - h * 0.8, x + size * 0.55 + wob, y);
    ctx.closePath();
    ctx.fill();
  }
}

/** Plates where dishes are assembled. */
function drawPlates(ctx, s) {
  text(ctx, 'PIRING — klik untuk menaruh bahan matang', LAYOUT.plates.x + 4, LAYOUT.plates.y - 12, 13, '#ffd166', 800);
  s.plates.forEach((plate, i) => {
    const r = plateRect(i);
    const dish = dishForPlate(plate);
    const selected = s.selectedPlate === i;
    ctx.fillStyle = selected ? 'rgba(244,163,0,0.25)' : 'rgba(0,0,0,0.28)';
    rr(ctx, r.x, r.y, r.w, r.h, 12);
    ctx.fill();
    ctx.strokeStyle = selected ? COLORS.gold : 'rgba(255,255,255,0.18)';
    ctx.lineWidth = selected ? 3 : 2;
    rr(ctx, r.x + 2, r.y + 2, r.w - 4, r.h - 4, 10);
    ctx.stroke();
    const cx = r.x + 92;
    const cy = r.y + r.h / 2 + 6;
    // The plate itself.
    ellipse(ctx, cx, cy + 8, 74, 16, 'rgba(0,0,0,0.3)');
    ellipse(ctx, cx, cy, 72, 52, '#fdf6e0');
    ellipse(ctx, cx, cy, 56, 40, '#fffdf4');
    ctx.strokeStyle = '#d8c49a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(cx, cy, 56, 40, 0, 0, Math.PI * 2);
    ctx.stroke();
    if (dish) {
      drawDish(ctx, dish.id, cx, cy - 4, 34);
    } else {
      plate.forEach((it, j) => {
        drawIngredient(ctx, it.id, cx - 34 + j * 34, cy - 2, 20, it.cooked);
      });
      if (plate.length === 0) text(ctx, 'piring kosong', cx, cy + 4, 13, '#b8a888', 700, 'center');
    }
    const tx = r.x + 186;
    if (dish) {
      ctx.fillStyle = '#2e7d32';
      rr(ctx, tx - 8, r.y + 18, 128, 30, 8);
      ctx.fill();
      text(ctx, '✓ SIAP DIANTAR', tx + 56, r.y + 39, 15, '#fff3d6', 800, 'center');
      text(ctx, dish.name, tx, r.y + 74, 21, '#fff3d6', 800);
      text(ctx, rupiah(dish.price), tx, r.y + 100, 18, '#ffd166', 800);
      text(ctx, dish.needs.map((n) => ING_BY_ID[n].name).join(' + '), tx, r.y + 124, 11, '#e8dcc0', 700);
    } else {
      text(ctx, `Piring ${i + 1}`, tx, r.y + 40, 19, '#fff3d6', 800);
      if (plate.length > 0) {
        text(ctx, 'Belum lengkap —', tx, r.y + 68, 14, '#e8dcc0', 700);
        text(ctx, 'cek resep di tiket', tx, r.y + 88, 14, '#e8dcc0', 700);
        const need = plate.length;
        text(ctx, `${need}/3 bahan di piring`, tx, r.y + 116, 14, '#ffd166', 800);
      } else {
        text(ctx, 'Taruh bahan matang', tx, r.y + 68, 14, '#e8dcc0', 700);
        text(ctx, 'di sini untuk', tx, r.y + 88, 14, '#e8dcc0', 700);
        text(ctx, 'merakit hidangan.', tx, r.y + 108, 14, '#e8dcc0', 700);
      }
    }
    text(ctx, `[${i === 0 ? 'Z' : 'X'}]`, r.x + r.w - 16, r.y + 20, 12, '#ffd166', 800, 'right');
  });
}

/** The pass window: served dishes appear here with a bell. */
function drawPass(ctx, s, t) {
  const p = LAYOUT.pass;
  ctx.fillStyle = '#5c3416';
  rr(ctx, p.x, p.y, p.w, p.h, 14);
  ctx.fill();
  ctx.fillStyle = '#3a2415';
  rr(ctx, p.x + 8, p.y + 8, p.w - 16, p.h - 16, 10);
  ctx.fill();
  text(ctx, '— JENDELA SAJI —', p.x + p.w / 2, p.y + 30, 15, '#ffd166', 800, 'center');
  // Shelf.
  ctx.fillStyle = '#a06a35';
  rr(ctx, p.x + 16, p.y + 128, p.w - 32, 14, 4);
  ctx.fill();
  if (s.servedDish) {
    const dish = DISH_BY_ID[s.servedDish.dishId];
    const bob = Math.sin(s.servedDish.t * 6) * 3;
    drawDish(ctx, dish.id, p.x + p.w / 2 - 30, p.y + 92 + bob, 36);
    text(ctx, dish.name, p.x + p.w / 2 + 44, p.y + 84, 15, '#fff3d6', 800);
    text(ctx, 'Disajikan!', p.x + p.w / 2 + 44, p.y + 106, 13, '#8ac926', 800);
  } else {
    text(ctx, 'Belum ada hidangan', p.x + p.w / 2, p.y + 96, 14, '#c9a06a', 700, 'center');
    text(ctx, 'yang diantar.', p.x + p.w / 2, p.y + 116, 14, '#c9a06a', 700, 'center');
  }
  // Service bell.
  circle(ctx, p.x + p.w - 34, p.y + 160, 14, '#f4a300');
  circle(ctx, p.x + p.w - 34, p.y + 148, 5, '#c77f00');
  text(ctx, 'TING!', p.x + p.w - 34, p.y + 40, 12, '#ffd166', 800, 'center');
}

/** Right side panel: menu, combo meter and hints. */
function drawSide(ctx, s) {
  const p = LAYOUT.side;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  rr(ctx, p.x, p.y, p.w, p.h, 12);
  ctx.fill();
  text(ctx, '— MENU WARUNG —', p.x + p.w / 2, p.y + 26, 15, '#ffd166', 800, 'center');
  const dishes = ['nasi-goreng', 'mie-goreng', 'ayam-bakar', 'soto-ayam', 'es-teh'];
  dishes.forEach((id, i) => {
    const d = DISH_BY_ID[id];
    const y = p.y + 40 + i * 38;
    const unlocked = d.unlockLevel <= s.level;
    ctx.fillStyle = unlocked ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.25)';
    rr(ctx, p.x + 10, y, p.w - 20, 34, 8);
    ctx.fill();
    if (unlocked) {
      drawDish(ctx, id, p.x + 32, y + 17, 13);
      text(ctx, d.name, p.x + 56, y + 15, 14, '#fff3d6', 800);
      text(ctx, d.needs.map((n) => ING_BY_ID[n].name).join(' + '), p.x + 56, y + 29, 11, '#e8dcc0', 700);
      text(ctx, rupiah(d.price), p.x + p.w - 16, y + 22, 13, '#ffd166', 800, 'right');
    } else {
      text(ctx, '🔒', p.x + 32, y + 22, 14, '#ffd166', 700, 'center');
      text(ctx, `${d.name} — buka di Level ${d.unlockLevel}`, p.x + 56, y + 22, 13, '#c9a06a', 700);
    }
  });
  const hy = p.y + 40 + dishes.length * 38 + 6;
  const hintLines = wrapLines(ctx, s.hint, 11, p.w - 24);
  hintLines.slice(0, 2).forEach((line, i) => {
    text(ctx, line, p.x + 12, hy + i * 14, 11, '#fff3d6', 700);
  });
  text(ctx, 'Tombol: 1-6 bahan · Q/W/E alat', p.x + 12, hy + 32, 11, '#c9a06a', 700);
  text(ctx, 'Z/X piring · Spasi antar · P jeda · M suara', p.x + 12, hy + 46, 11, '#c9a06a', 700);
}

/** Split a line of text into lines that fit maxWidth at the given size. */
function wrapLines(ctx, line, size, maxWidth) {
  ctx.font = `700 ${size}px "Trebuchet MS", system-ui, sans-serif`;
  const words = line.split(' ');
  const lines = [];
  let cur = '';
  for (const word of words) {
    const next = cur === '' ? word : `${cur} ${word}`;
    if (ctx.measureText(next).width > maxWidth && cur !== '') {
      lines.push(cur);
      cur = word;
    } else {
      cur = next;
    }
  }
  if (cur !== '') lines.push(cur);
  return lines;
}

/** The hand (tray) at the bottom. */
function drawTray(ctx, s) {
  const tr = LAYOUT.tray;
  ctx.fillStyle = 'rgba(0,0,0,0.28)';
  rr(ctx, tr.x, tr.y, tr.w, tr.h, 12);
  ctx.fill();
  text(ctx, 'TANGAN', tr.x + 16, tr.y + 34, 15, '#ffd166', 800);
  text(ctx, 'Bahan yang kamu pegang', tr.x + 16, tr.y + 56, 12, '#e8dcc0', 700);
  for (let i = 0; i < 3; i += 1) {
    const r = trayRect(i);
    ctx.fillStyle = 'rgba(255,255,255,0.10)';
    rr(ctx, r.x, r.y, r.w, r.h, 10);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.25)';
    ctx.lineWidth = 2;
    rr(ctx, r.x + 1, r.y + 1, r.w - 2, r.h - 2, 10);
    ctx.stroke();
    const item = s.tray[i];
    if (item) {
      drawIngredient(ctx, item.id, r.x + r.w / 2, r.y + r.h / 2 - 6, 26, item.cooked);
      text(ctx, item.cooked ? 'MATANG ✓' : ING_BY_ID[item.id].name, r.x + r.w / 2, r.y + r.h - 8, 11, item.cooked ? '#8ac926' : '#fff3d6', 800, 'center');
    }
  }
  const hx = tr.x + 500;
  text(ctx, 'SHIFT', hx, tr.y + 30, 12, '#ffd166', 700);
  const frac = Math.max(0, s.shiftLeft / 150);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  rr(ctx, hx, tr.y + 38, 148, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac > 0.5 ? '#5da130' : frac > 0.25 ? '#f4a300' : '#d62828';
  if (frac > 0.02) {
    rr(ctx, hx, tr.y + 38, Math.max(12, 148 * frac), 12, 6);
    ctx.fill();
  }
  text(ctx, `${s.served} disajikan · ${s.missed} hangus`, hx, tr.y + 74, 13, '#fff3d6', 700);
  text(ctx, `Kombo terbaik x${s.bestCombo}`, hx, tr.y + 94, 13, '#ffd166', 700);
}

/** Particles and floating score texts. */
function drawEffects(ctx, s) {
  for (const p of s.particles) {
    const a = Math.max(0, p.life / p.max);
    if (p.kind === 'steam' || p.kind === 'smoke') {
      ctx.fillStyle = p.kind === 'smoke' ? `rgba(60,60,60,${a * 0.5})` : `rgba(255,255,255,${a * 0.55})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1.6 - a * 0.6), 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * a + 1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  for (const f of s.floats) {
    ctx.globalAlpha = Math.min(1, f.life / 0.6);
    text(ctx, f.text, f.x, f.y, f.size, f.color, 800, 'center');
    ctx.globalAlpha = 1;
  }
  if (s.flash) {
    ctx.fillStyle = s.flash.color;
    ctx.fillRect(0, 0, W, H);
  }
}

/** Title screen: logo, steaming wok, how to play, menu preview, best score. */
function drawTitle(ctx, s, best, t) {
  ctx.fillStyle = 'rgba(30,15,5,0.72)';
  ctx.fillRect(0, 0, W, H);
  // Steaming wok emblem.
  const cx = 640;
  drawFlame(ctx, cx, 300, 90, t);
  ctx.fillStyle = COLORS.wok;
  ctx.beginPath();
  ctx.ellipse(cx, 268, 190, 62, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#3a3430';
  ctx.beginPath();
  ctx.ellipse(cx, 258, 172, 50, 0, 0, Math.PI * 2);
  ctx.fill();
  drawIngredient(ctx, 'nasi', cx - 60, 250, 42, true, t);
  drawIngredient(ctx, 'ayam', cx + 50, 252, 40, true, t);
  drawIngredient(ctx, 'cabai', cx + 110, 240, 22, true, t);
  for (let i = 0; i < 5; i += 1) {
    const sx = cx - 90 + i * 45 + Math.sin(t * 1.4 + i) * 8;
    const sy = 210 - Math.sin(t * 2 + i * 1.3) * 10 - i * 4;
    ctx.fillStyle = `rgba(255,255,255,${0.35 + 0.2 * Math.sin(t * 2 + i)})`;
    ctx.beginPath();
    ctx.arc(sx, sy, 12 + (i % 2) * 5, 0, Math.PI * 2);
    ctx.fill();
  }
  text(ctx, 'DAPUR NUSANTARA', cx, 130, 64, '#ffd166', 800, 'center');
  text(ctx, '— RUSH —', cx, 168, 30, '#ff6b6b', 800, 'center');
  text(ctx, 'Warung paling sibuk di kota! Masak, rakit, antar — sebelum pelanggan kabur.', cx, 356, 18, '#fff3d6', 700, 'center');
  // How to play, four steps.
  const steps = [
    ['1', 'AMBIL BAHAN', 'Klik bahan di meja (atau tombol 1-6)'],
    ['2', 'MASAK', 'Klik alat yang cocok: Wajan / Panggang / Panci'],
    ['3', 'RAKIT', 'Taruh bahan matang di piring sampai resep lengkap'],
    ['4', 'ANTAR', 'Klik tiket pesanan yang cocok sebelum waktunya habis'],
  ];
  steps.forEach((step, i) => {
    const x = 190 + i * 230;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    rr(ctx, x, 392, 210, 96, 12);
    ctx.fill();
    circle(ctx, x + 105, 420, 20, '#f4a300');
    text(ctx, step[0], x + 105, 427, 20, '#3a2415', 800, 'center');
    text(ctx, step[1], x + 105, 458, 15, '#fff3d6', 800, 'center');
    text(ctx, step[2], x + 105, 476, 11, '#e8dcc0', 700, 'center');
  });
  // Start button.
  const b = LAYOUT.startButton;
  const pulse = 1 + Math.sin(t * 4) * 0.03;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = '#d62828';
  rr(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 14);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  rr(ctx, -b.w / 2, -b.h / 2, b.w, 18, 14);
  ctx.fill();
  text(ctx, '▶  MULAI SHIFT', 0, 9, 26, '#fff3d6', 800, 'center');
  ctx.restore();
  text(ctx, 'Klik atau tekan Spasi', cx, b.y + b.h + 28, 14, '#ffd166', 700, 'center');
  if (best > 0) text(ctx, `Skor terbaik: ${best.toLocaleString('id-ID')}`, cx, 660, 16, '#fff3d6', 700, 'center');
  text(ctx, 'Nasi Goreng · Mie Goreng · Ayam Bakar · Soto Ayam · Es Teh Manis', cx, 688, 14, '#c9a06a', 700, 'center');
}

function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30,15,5,0.7)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'JEDA', 640, 320, 64, '#ffd166', 800, 'center');
  text(ctx, 'Tekan P atau klik untuk lanjut', 640, 372, 18, '#fff3d6', 700, 'center');
}

/** End-of-shift summary with stars and stats. */
function drawOver(ctx, s, best) {
  ctx.fillStyle = 'rgba(30,15,5,0.75)';
  ctx.fillRect(0, 0, W, H);
  const sum = s.summary;
  const cx = 640;
  ctx.fillStyle = COLORS.paper;
  rr(ctx, cx - 300, 110, 600, 420, 18);
  ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 3;
  rr(ctx, cx - 300, 110, 600, 420, 18);
  ctx.stroke();
  text(ctx, sum.reason === 'hearts' ? 'WARUNG TUTUP!' : 'SHIFT SELESAI!', cx, 168, 40, COLORS.ink, 800, 'center');
  text(
    ctx,
    sum.reason === 'hearts' ? 'Semua pelanggan kecewa dan pulang.' : 'Waktu shift habis. Kerja bagus, juru masak!',
    cx,
    198,
    16,
    '#6b4a2f',
    700,
    'center',
  );
  for (let i = 0; i < 3; i += 1) {
    const sx = cx - 90 + i * 90;
    const lit = i < sum.stars;
    text(ctx, '★', sx, 268, 64, lit ? '#f4a300' : '#d8c49a', 800, 'center');
  }
  const rows = [
    ['Hidangan disajikan', `${sum.served}`],
    ['Pesanan hangus', `${sum.missed}`],
    ['Pendapatan', rupiah(sum.coins)],
    ['Kombo terbaik', `x${sum.bestCombo}`],
    ['Level tercapai', `${sum.level}`],
  ];
  rows.forEach((row, i) => {
    const y = 310 + i * 32;
    text(ctx, row[0], cx - 220, y, 18, '#6b4a2f', 700);
    text(ctx, row[1], cx + 220, y, 18, COLORS.ink, 800, 'right');
  });
  text(ctx, `SKOR AKHIR  ${sum.score.toLocaleString('id-ID')}`, cx, 486, 26, '#a31d1d', 800, 'center');
  if (sum.score >= best && sum.score > 0) text(ctx, '★ Skor terbaik baru! ★', cx, 514, 15, '#d62828', 800, 'center');
  const b = LAYOUT.againButton;
  ctx.fillStyle = '#d62828';
  rr(ctx, b.x, b.y, b.w, b.h, 14);
  ctx.fill();
  text(ctx, '↻  MAIN LAGI', b.x + b.w / 2, b.y + 41, 24, '#fff3d6', 800, 'center');
  text(ctx, 'Klik atau tekan Spasi', cx, b.y + b.h + 26, 14, '#6b4a2f', 700, 'center');
}

/** Create the renderer for a canvas. draw(state, screen, best, time) paints one frame. */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  return {
    draw(state, screen, best, t, muted = false) {
      ctx.save();
      if (state.shake > 0) {
        const m = state.shake * 14;
        ctx.translate((Math.random() - 0.5) * m, (Math.random() - 0.5) * m);
      }
      drawBackground(ctx, t);
      if (screen === SCREEN_TITLE) {
        drawBoard(ctx, { ...state, orders: state.orders.slice(0, 0) }, t);
        drawBins(ctx, state, t);
        drawStations(ctx, state, t);
        drawPlates(ctx, state);
        drawPass(ctx, state, t);
        drawSide(ctx, state);
        drawTray(ctx, state);
        drawTitle(ctx, state, best, t);
      } else {
        drawTopBar(ctx, state, best, muted);
        drawBoard(ctx, state, t);
        drawBins(ctx, state, t);
        drawStations(ctx, state, t);
        drawPlates(ctx, state);
        drawPass(ctx, state, t);
        drawSide(ctx, state);
        drawTray(ctx, state);
        drawEffects(ctx, state);
        if (screen === SCREEN_PAUSED) drawPaused(ctx);
        if (screen === SCREEN_OVER) drawOver(ctx, state, best);
      }
      ctx.restore();
    },
  };
}
