import { formatSignalTime, getGreeting, getPhase } from './greeting.js';
import './style.css';

const STAR_COUNT = 180;
const MAX_RIPPLES = 12;

const canvas = document.querySelector('#field');
const stage = document.querySelector('#stage');
const clock = document.querySelector('#clock');
const greetingNode = document.querySelector('[data-greeting]');
const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
const pointer = { x: 0, y: 0, targetX: 0, targetY: 0 };
const ripples = [];
const stars = [];

let reducedMotion = motionQuery.matches;

const ctx = canvas.getContext('2d', { alpha: false });
let inkColor = '#07080c';

function refreshInk() {
  inkColor =
    getComputedStyle(document.documentElement).getPropertyValue('--ink').trim() || '#07080c';
}

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(window.innerWidth * dpr);
  canvas.height = Math.floor(window.innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function seedStars() {
  stars.length = 0;
  for (let i = 0; i < STAR_COUNT; i += 1) {
    stars.push({
      x: Math.random(),
      y: Math.random(),
      depth: 0.25 + Math.random() * 0.75,
      size: Math.random() * 1.4 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
    });
  }
}

function paintBackdrop() {
  const { innerWidth: width, innerHeight: height } = window;
  ctx.fillStyle = inkColor;
  ctx.fillRect(0, 0, width, height);
}

function paintAurora(time) {
  const { innerWidth: width, innerHeight: height } = window;
  const blobs = [
    { x: 0.32, y: 0.38, radius: 0.46, color: 'rgba(94, 234, 212, 0.16)' },
    { x: 0.68, y: 0.52, radius: 0.42, color: 'rgba(232, 192, 122, 0.1)' },
    { x: 0.5, y: 0.18, radius: 0.34, color: 'rgba(129, 140, 248, 0.1)' },
  ];

  ctx.globalCompositeOperation = 'screen';
  blobs.forEach((blob, index) => {
    const drift = reducedMotion ? 0 : Math.sin(time * 0.00018 + index) * 0.03;
    const cx = (blob.x + drift + pointer.x * 0.03) * width;
    const cy = (blob.y - drift * 0.6 + pointer.y * 0.03) * height;
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, blob.radius * Math.max(width, height));
    gradient.addColorStop(0, blob.color);
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  });
  ctx.globalCompositeOperation = 'source-over';
}

function paintStars(time) {
  const { innerWidth: width, innerHeight: height } = window;
  stars.forEach((star) => {
    const parallax = reducedMotion ? 0 : 18 * star.depth;
    const x = star.x * width + pointer.x * parallax;
    const y = star.y * height + pointer.y * parallax;
    const pulse = reducedMotion ? 0.7 : 0.45 + Math.sin(time * 0.0015 + star.twinkle) * 0.35;
    ctx.fillStyle = `rgba(243, 238, 228, ${0.35 * star.depth * pulse})`;
    ctx.beginPath();
    ctx.arc(x, y, star.size * star.depth, 0, Math.PI * 2);
    ctx.fill();
  });
}

function paintRipples() {
  ripples.forEach((ripple) => {
    ctx.strokeStyle = `rgba(232, 192, 122, ${ripple.alpha})`;
    ctx.lineWidth = 1.25;
    ctx.beginPath();
    ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
    ctx.stroke();
  });
}

function stepRipples() {
  for (let i = ripples.length - 1; i >= 0; i -= 1) {
    const ripple = ripples[i];
    ripple.radius += 2.8;
    ripple.alpha -= 0.012;
    if (ripple.alpha <= 0) {
      ripples.splice(i, 1);
    }
  }
}

function draw(time) {
  pointer.x += (pointer.targetX - pointer.x) * 0.06;
  pointer.y += (pointer.targetY - pointer.y) * 0.06;

  if (!reducedMotion) {
    const tiltX = pointer.x * 10;
    const tiltY = pointer.y * 8;
    stage.style.transform = `translate3d(${tiltX}px, ${tiltY}px, 0)`;
  }

  paintBackdrop();
  paintAurora(time);
  paintStars(time);
  if (!reducedMotion) {
    stepRipples();
    paintRipples();
  }

  if (!reducedMotion && !document.hidden) {
    window.requestAnimationFrame(draw);
  }
}

function emitRipple(clientX, clientY) {
  if (reducedMotion) return;
  if (ripples.length >= MAX_RIPPLES) {
    ripples.shift();
  }
  ripples.push({ x: clientX, y: clientY, radius: 8, alpha: 0.55 });
}

function syncCopy(date = new Date()) {
  const greeting = getGreeting(date);
  const phase = getPhase(date);
  document.documentElement.dataset.phase = phase;
  refreshInk();
  greetingNode.textContent = greeting;
  clock.textContent = formatSignalTime(date);
  clock.setAttribute('datetime', date.toISOString());
}

resize();
seedStars();
syncCopy();
draw(0);

window.addEventListener('resize', () => {
  resize();
  if (reducedMotion) {
    draw(0);
  }
});

window.addEventListener('pointermove', (event) => {
  pointer.targetX = event.clientX / window.innerWidth - 0.5;
  pointer.targetY = event.clientY / window.innerHeight - 0.5;
});

window.addEventListener('pointerdown', (event) => {
  emitRipple(event.clientX, event.clientY);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    emitRipple(window.innerWidth / 2, window.innerHeight / 2);
  }
});

window.setInterval(() => {
  syncCopy();
}, 1000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && !reducedMotion) {
    window.requestAnimationFrame(draw);
  }
});

motionQuery.addEventListener('change', (event) => {
  reducedMotion = event.matches;
  if (reducedMotion) {
    stage.style.transform = '';
    ripples.length = 0;
    draw(0);
    return;
  }
  window.requestAnimationFrame(draw);
});
