// H&S 3D Fit Studio — procedural mannequin + garments built from real measurements.
// Everything is generated in code (no 3D model files), so it loads instantly and
// re-shapes live as the customer moves the sliders.
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TOP_CHART } from '../lib/utils.js';

const IN = 0.0254;
const TAU = Math.PI * 2;
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export const SKIN_TONES = ['#f1d3bc', '#e2b896', '#c99470', '#9c6a48', '#6b4630', '#d8d2c8'];

// ── geometry helpers ───────────────────────────────────────────────
// Ellipse perimeter ↔ radii (Ramanujan-lite)
const perim = (rx, rz) => TAU * Math.sqrt((rx * rx + rz * rz) / 2);
const ellipse = (circIn, k) => {
  const C = circIn * IN;
  const rx = C / (TAU * Math.sqrt((1 + k * k) / 2));
  return { rx, rz: rx * k };
};

function catmull(p0, p1, p2, p3, t) {
  const t2 = t * t, t3 = t2 * t;
  return 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3);
}
function smoothRings(r, steps = 5) {
  const out = [];
  const keys = ['y', 'rx', 'rz', 'cx', 'cz'];
  for (let i = 0; i < r.length - 1; i++) {
    const p0 = r[i - 1] || r[i], p1 = r[i], p2 = r[i + 1], p3 = r[i + 2] || r[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, o = {};
      for (const k of keys) o[k] = catmull(p0[k] ?? 0, p1[k] ?? 0, p2[k] ?? 0, p3[k] ?? 0, t);
      out.push(o);
    }
  }
  out.push({ cx: 0, cz: 0, ...r[r.length - 1] });
  return out;
}
/** Sample a ring list (sorted by y, any direction) at height y. */
function sampleAt(rings, y) {
  const asc = rings[0].y < rings[rings.length - 1].y;
  for (let i = 0; i < rings.length - 1; i++) {
    const a = rings[i], b = rings[i + 1];
    const lo = Math.min(a.y, b.y), hi = Math.max(a.y, b.y);
    if (y >= lo && y <= hi) {
      const t = (y - a.y) / (b.y - a.y || 1);
      return { y, rx: lerp(a.rx, b.rx, t), rz: lerp(a.rz, b.rz, t), cx: lerp(a.cx || 0, b.cx || 0, t), cz: lerp(a.cz || 0, b.cz || 0, t) };
    }
  }
  const end = (asc ? y < rings[0].y : y > rings[0].y) ? rings[0] : rings[rings.length - 1];
  return { ...end, cx: end.cx || 0, cz: end.cz || 0, y };
}

/** Loft a tube through elliptical rings. u wraps around, v runs along. */
function loft(rings, { seg = 56, capStart = false, capEnd = false, vScale = 1, uScale = 1 } = {}) {
  const pos = [], uv = [], idx = [];
  let vAcc = 0;
  rings.forEach((r, i) => {
    if (i > 0) vAcc += Math.abs(r.y - rings[i - 1].y);
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * TAU;
      pos.push((r.cx || 0) + r.rx * Math.sin(a), r.y, (r.cz || 0) + r.rz * Math.cos(a));
      uv.push((j / seg) * uScale, vAcc * vScale);
    }
  });
  const row = seg + 1;
  for (let i = 0; i < rings.length - 1; i++)
    for (let j = 0; j < seg; j++) {
      const a = i * row + j, b = a + 1, c = a + row, d = c + 1;
      idx.push(a, c, b, b, c, d);
    }
  const cap = (ri, flip) => {
    const r = rings[ri];
    const ci = pos.length / 3;
    pos.push(r.cx || 0, r.y, r.cz || 0);
    uv.push(0.5, 0.5);
    for (let j = 0; j < seg; j++) {
      const a = ri * row + j, b = a + 1;
      flip ? idx.push(ci, a, b) : idx.push(ci, b, a);
    }
  };
  // winding depends on ring order direction
  const up = rings[rings.length - 1].y > rings[0].y;
  if (capStart) cap(0, !up);
  if (capEnd) cap(rings.length - 1, up);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// ── fabric textures (procedural canvas) ────────────────────────────
const texCache = new Map();
function fabricTexture(kind, colorA = '#ffffff', colorB = '#000000') {
  const key = `${kind}|${colorA}|${colorB}`;
  if (texCache.has(key)) return texCache.get(key);
  const S = 256;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#ffffff';
  g.fillRect(0, 0, S, S);
  const noise = (alpha) => {
    const d = g.getImageData(0, 0, S, S);
    for (let i = 0; i < d.data.length; i += 4) {
      const n = (Math.random() - 0.5) * alpha;
      d.data[i] += n; d.data[i + 1] += n; d.data[i + 2] += n;
    }
    g.putImageData(d, 0, 0);
  };
  if (kind === 'pique') {
    g.fillStyle = 'rgba(0,0,0,0.10)';
    for (let y = 0; y < S; y += 6) for (let x = (y / 6) % 2 ? 3 : 0; x < S; x += 6) { g.beginPath(); g.arc(x, y, 1.4, 0, TAU); g.fill(); }
    noise(14);
  } else if (kind === 'knit') {
    for (let x = 0; x < S; x += 5) { g.fillStyle = 'rgba(0,0,0,0.09)'; g.fillRect(x, 0, 2, S); }
    noise(12);
  } else if (kind === 'oxford') {
    g.strokeStyle = 'rgba(0,0,0,0.07)';
    for (let i = 0; i < S; i += 3) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, S); g.stroke(); }
    g.strokeStyle = 'rgba(255,255,255,0.35)';
    for (let i = 0; i < S; i += 4) { g.beginPath(); g.moveTo(0, i); g.lineTo(S, i); g.stroke(); }
    noise(10);
  } else if (kind === 'denim' || kind === 'twill') {
    g.strokeStyle = kind === 'denim' ? 'rgba(255,255,255,0.22)' : 'rgba(0,0,0,0.08)';
    g.lineWidth = 1.2;
    for (let i = -S; i < S * 2; i += 4) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i + S, S); g.stroke(); }
    if (kind === 'denim') {
      for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(255,255,255,${Math.random() * 0.18})`; g.fillRect(Math.random() * S, Math.random() * S, 1, 6 + Math.random() * 18); }
    }
    noise(16);
  } else if (kind === 'check') {
    // full-color plaid: base colorA, bands of colorB
    g.fillStyle = colorA; g.fillRect(0, 0, S, S);
    const band = (pos, w, col, alpha, vertical) => {
      g.globalAlpha = alpha; g.fillStyle = col;
      vertical ? g.fillRect(pos, 0, w, S) : g.fillRect(0, pos, S, w);
      g.globalAlpha = 1;
    };
    for (let i = 0; i < S; i += 64) {
      band(i, 22, colorB, 0.55, true); band(i, 22, colorB, 0.55, false);
      band(i + 40, 4, colorB, 0.7, true); band(i + 40, 4, colorB, 0.7, false);
      band(i + 30, 2, '#000', 0.25, true); band(i + 30, 2, '#000', 0.25, false);
    }
    noise(10);
  } else {
    noise(10); // jersey
  }
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  texCache.set(key, t);
  return t;
}

function printTexture(color) {
  const key = `print|${color}`;
  if (texCache.has(key)) return texCache.get(key);
  const c = document.createElement('canvas');
  c.width = 256; c.height = 256;
  const g = c.getContext('2d');
  g.fillStyle = color;
  g.font = 'bold 30px Arial, sans-serif';
  g.textAlign = 'center';
  ['PARIS MILANO', 'LONDON SEOUL', 'NEW YORK', 'HELLO HOLY', 'HEAVEN'].forEach((s, i) => g.fillText(s, 128, 50 + i * 42));
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(key, t);
  return t;
}

function floorTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(256, 256, 10, 256, 256, 256);
  grd.addColorStop(0, 'rgba(255,255,255,0.95)');
  grd.addColorStop(0.55, 'rgba(240,234,224,0.55)');
  grd.addColorStop(1, 'rgba(240,234,224,0)');
  g.fillStyle = grd;
  g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(226,38,28,0.55)';
  g.lineWidth = 2;
  g.beginPath(); g.arc(256, 256, 150, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(14,13,12,0.12)';
  g.lineWidth = 1;
  for (let r = 60; r < 250; r += 30) { g.beginPath(); g.arc(256, 256, r, 0, TAU); g.stroke(); }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// ── the studio ─────────────────────────────────────────────────────
export function createStudio(host) {
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 50);
  camera.position.set(0.9, 1.15, 5.6);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.95, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.minDistance = 1.4;
  controls.maxDistance = 8;
  controls.maxPolarAngle = Math.PI * 0.53;
  controls.enablePan = false;
  controls.autoRotateSpeed = 1.6;

  scene.add(new THREE.HemisphereLight(0xfff6ea, 0x3a3128, 1.15));
  const key = new THREE.DirectionalLight(0xffffff, 2.2);
  key.position.set(2.2, 4, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -1.5; key.shadow.camera.right = 1.5; key.shadow.camera.top = 2.5; key.shadow.camera.bottom = -0.5;
  key.shadow.bias = -0.0008;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 4;
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xffc98a, 1.3);
  rim.position.set(-3, 2.5, -3);
  scene.add(rim);
  const fill = new THREE.DirectionalLight(0xdfe8ff, 0.55);
  fill.position.set(-3, 1.5, 2.5);
  scene.add(fill);

  const floor = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshStandardMaterial({ map: floorTexture(), transparent: true, roughness: 1 }));
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  scene.add(floor);
  const shadowCatcher = new THREE.Mesh(new THREE.CircleGeometry(1.2, 48), new THREE.ShadowMaterial({ opacity: 0.22 }));
  shadowCatcher.rotation.x = -Math.PI / 2;
  shadowCatcher.position.y = 0.001;
  shadowCatcher.receiveShadow = true;
  scene.add(shadowCatcher);

  const root = new THREE.Group();
  scene.add(root);

  let disposables = [];
  const track = (o) => { disposables.push(o); return o; };
  const mesh = (geo, mat, parent) => {
    const m = new THREE.Mesh(track(geo), mat);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const fabricMat = (spec, side = THREE.DoubleSide) => {
    const isCheck = spec.texture === 'check';
    const map = fabricTexture(spec.texture || 'jersey', spec.color, spec.check || '#ffffff');
    const m = new THREE.MeshStandardMaterial({ color: isCheck ? 0xffffff : spec.color, map, roughness: spec.texture === 'knit' ? 0.95 : 0.82, side });
    track(m);
    return m;
  };
  const plainMat = (color, rough = 0.6, extra = {}) => track(new THREE.MeshStandardMaterial({ color, roughness: rough, ...extra }));

  let lastResult = null;
  let showMeasure = false;

  function build(state) {
    // clear
    root.clear();
    disposables.forEach((d) => d.dispose?.());
    disposables = [];

    const b = state.body;
    const H = b.height * IN;
    const scaleH = b.height / 70;
    const inseam = clamp(b.inseam, 26, 37) * IN;
    const crotchY = inseam + 0.035;
    const ankleY = 0.075 * scaleH;
    const kneeY = lerp(ankleY, crotchY, 0.5) + 0.02;
    const hipY = crotchY + 0.085 * scaleH;
    const neckBase = H * 0.835;
    const shoulderY = H * 0.812;
    const chestY = lerp(hipY, shoulderY, 0.62);
    const waistY = lerp(hipY, chestY, 0.48);
    const chinY = H * 0.872;

    const hip = ellipse(b.hips, 0.78);
    const waist = ellipse(b.waist, 0.8);
    const chest = ellipse(b.chest, 0.68);
    const neck = ellipse(b.neck || 15.5, 0.92);
    const shW = (b.shoulders * IN) / 2;

    // ── TORSO ──
    const torsoKeys = [
      { y: crotchY - 0.03, rx: hip.rx * 0.45, rz: hip.rz * 0.5 },
      { y: crotchY + 0.005, rx: hip.rx * 0.9, rz: hip.rz * 0.92, cz: -0.006 },
      { y: hipY, rx: hip.rx, rz: hip.rz, cz: -0.012 },
      { y: lerp(hipY, waistY, 0.55), rx: lerp(hip.rx, waist.rx, 0.6), rz: lerp(hip.rz, waist.rz, 0.6), cz: -0.004 },
      { y: waistY, rx: waist.rx, rz: waist.rz, cz: 0.004 },
      { y: lerp(waistY, chestY, 0.5), rx: lerp(waist.rx, chest.rx, 0.55), rz: lerp(waist.rz, chest.rz, 0.6), cz: 0.01 },
      { y: chestY, rx: chest.rx, rz: chest.rz, cz: 0.016 },
      { y: lerp(chestY, shoulderY, 0.55), rx: Math.max(chest.rx * 0.98, shW * 0.86), rz: chest.rz * 0.92, cz: 0.012 },
      { y: shoulderY - 0.012, rx: shW * 0.93, rz: chest.rz * 0.72, cz: 0.0 },
      { y: shoulderY + 0.016, rx: shW * 0.62, rz: chest.rz * 0.55, cz: -0.006 },
      { y: neckBase, rx: neck.rx * 1.25, rz: neck.rz * 1.15, cz: -0.012 },
      { y: neckBase + 0.03, rx: neck.rx, rz: neck.rz, cz: -0.008 },
      { y: chinY, rx: neck.rx * 0.98, rz: neck.rz * 0.98, cz: 0.0 },
    ];
    const torso = smoothRings(torsoKeys, 6);
    const skin = state.skin ?? SKIN_TONES[2];
    const skinMat = plainMat(skin, 0.58);
    mesh(loft(torso, { capStart: true, capEnd: true }), skinMat, root);

    // head (stylised mannequin head)
    const headRy = 0.112 * scaleH;
    const head = mesh(new THREE.SphereGeometry(1, 48, 36), skinMat, root);
    head.scale.set(headRy * 0.7, headRy, headRy * 0.84);
    head.position.set(0, chinY + headRy * 0.78, 0.004);
    const jaw = mesh(new THREE.SphereGeometry(1, 32, 24), skinMat, root);
    jaw.scale.set(headRy * 0.52, headRy * 0.5, headRy * 0.62);
    jaw.position.set(0, chinY + headRy * 0.32, 0.026);
    const nose = mesh(new THREE.SphereGeometry(1, 16, 12), skinMat, root);
    nose.scale.set(0.011, 0.02, 0.014);
    nose.position.set(0, chinY + headRy * 0.72, 0.004 + headRy * 0.84 - 0.002);

    // ── ARMS ──
    const armLen = clamp(b.arm, 20, 30) * IN;
    const upper = armLen * 0.54;
    const bicep = ((b.chest * 0.31) * IN) / TAU;
    const armRingsLocal = smoothRings([
      { y: 0.03, rx: bicep * 1.02, rz: bicep * 1.08 },
      { y: -0.02, rx: bicep * 1.08, rz: bicep * 1.1 },
      { y: -upper * 0.45, rx: bicep, rz: bicep * 1.0 },
      { y: -upper, rx: bicep * 0.72, rz: bicep * 0.76 },
      { y: -upper - armLen * 0.12, rx: bicep * 0.8, rz: bicep * 0.78 },
      { y: -armLen + 0.01, rx: bicep * 0.5, rz: bicep * 0.42 },
      { y: -armLen - 0.005, rx: bicep * 0.46, rz: bicep * 0.38 },
    ], 4);
    const armAngle = 0.2;
    const arms = [-1, 1].map((side) => {
      const g = new THREE.Group();
      g.position.set(side * (shW - bicep * 0.62), shoulderY - 0.05, -0.005);
      g.rotation.z = side * armAngle;
      root.add(g);
      mesh(loft(armRingsLocal, { capStart: true, capEnd: true, seg: 36 }), skinMat, g);
      const cap = mesh(new THREE.SphereGeometry(bicep * 1.04, 28, 20), skinMat, g);
      cap.position.y = 0.0;
      const hand = mesh(new THREE.SphereGeometry(1, 24, 18), skinMat, g);
      hand.scale.set(0.022 * scaleH, 0.07 * scaleH, 0.04 * scaleH);
      hand.position.set(0, -armLen - 0.06 * scaleH, 0.006);
      return g;
    });

    // ── LEGS ──
    const thighR = ((b.hips * 0.6) * IN) / TAU;
    const legX = hip.rx - thighR * 0.92;
    const pivotY = crotchY + 0.07;
    const legRingsLocal = smoothRings([
      { y: 0.02, rx: thighR * 0.92, rz: thighR * 0.96 },
      { y: -0.07, rx: thighR, rz: thighR * 1.02 },
      { y: -(pivotY - lerp(kneeY, crotchY, 0.45)), rx: thighR * 0.82, rz: thighR * 0.85 },
      { y: -(pivotY - kneeY), rx: thighR * 0.6, rz: thighR * 0.62 },
      { y: -(pivotY - (kneeY - 0.11 * scaleH)), rx: thighR * 0.64, rz: thighR * 0.7, cz: -0.01 },
      { y: -(pivotY - ankleY - 0.02), rx: thighR * 0.36, rz: thighR * 0.38 },
      { y: -(pivotY - ankleY + 0.025), rx: thighR * 0.38, rz: thighR * 0.42 },
    ], 5);
    const legAngle = 0.035;
    const legs = [-1, 1].map((side) => {
      const g = new THREE.Group();
      g.position.set(side * legX, pivotY, 0);
      g.rotation.z = side * legAngle;
      root.add(g);
      mesh(loft(legRingsLocal, { capStart: true, capEnd: true, seg: 40 }), skinMat, g);
      return g;
    });
    const legLocalBottom = -(pivotY - ankleY + 0.025);

    // ── FEET / SHOES ──
    const shoeSize = parseFloat(state.shoe?.size || b.shoe || 10);
    const footLen = (7.9 + 0.333 * shoeSize) * IN;
    legs.forEach((g) => {
      const footY = legLocalBottom - 0.02;
      if (state.shoe) {
        const s = state.shoe;
        const upperM = mesh(new THREE.SphereGeometry(1, 32, 20), plainMat(s.color, 0.55), g);
        upperM.scale.set(0.048, 0.052, footLen * 0.58);
        upperM.position.set(0, footY + 0.018, footLen * 0.24);
        const collar = mesh(new THREE.CylinderGeometry(0.05, 0.054, 0.07, 28), plainMat(s.color, 0.55), g);
        collar.position.set(0, footY + 0.04, -0.005);
        const sole = mesh(new THREE.BoxGeometry(0.088, 0.024, footLen * 1.08), plainMat(s.sole, 0.7), g);
        sole.position.set(0, footY - 0.03, footLen * 0.24);
        const stripe = mesh(new THREE.BoxGeometry(0.098, 0.008, footLen * 0.8), plainMat(s.sole === '#c62828' ? '#c62828' : '#111111', 0.5), g);
        stripe.position.set(0, footY + 0.0, footLen * 0.22);
        stripe.scale.z = 0.8;
      } else {
        const foot = mesh(new THREE.SphereGeometry(1, 28, 18), skinMat, g);
        foot.scale.set(0.042, 0.03, footLen * 0.55);
        foot.position.set(0, footY - 0.012, footLen * 0.24);
      }
    });

    // ── BOTTOM GARMENT ──
    const result = { top: null, bottom: null };
    let pantsAt = null; // y → outer radius of pants pelvis (for layering)
    let riseY = waistY;
    if (state.bottom) {
      const p = state.bottom;
      const riseIn = { low: 8.6, mid: 10, high: 11.6 }[p.rise || 'mid'] * scaleH;
      riseY = clamp(crotchY + riseIn * IN, crotchY + 0.15, chestY - 0.06);
      const bodyAtRise = sampleAt(torso, riseY);
      const bodyCircIn = perim(bodyAtRise.rx, bodyAtRise.rz) / IN;
      const garmentWaist = parseFloat(p.size) + 0.75;
      const ease = garmentWaist - bodyCircIn; // inches
      const easeM = clamp(ease * IN / TAU, 0.002, 0.06);
      const legEase = { skinny: 0.003, slim: 0.008, straight: 0.014, wide: 0.026 }[p.leg || 'straight'] + Math.max(0, ease) * 0.0012;
      const mat = fabricMat(p);
      if (mat.map) mat.map.repeat.set(1, 1);

      const pelvisRings = torso
        .filter((r) => r.y >= crotchY + 0.01 && r.y <= riseY)
        .map((r) => ({ ...r, rx: Math.max(r.rx, hip.rx * 0.9) + easeM + 0.004, rz: Math.max(r.rz, hip.rz * 0.9) + easeM * 0.8 + 0.004 }));
      pelvisRings.unshift(
        { y: crotchY - 0.045, rx: hip.rx * 0.55, rz: hip.rz * 0.6, cz: -0.006 },
        { y: crotchY - 0.02, rx: hip.rx * 0.86 + easeM, rz: hip.rz * 0.86 + easeM * 0.8, cz: -0.006 },
      );
      const top = sampleAt(torso, riseY);
      pelvisRings.push({ ...top, rx: top.rx + easeM + 0.004, rz: top.rz + easeM * 0.8 + 0.004 });
      mesh(loft(pelvisRings, { capStart: true, vScale: 6, uScale: 4 }), mat, root);
      // waistband
      const wb = mesh(new THREE.TorusGeometry(1, 0.0085, 10, 64), plainMat(new THREE.Color(p.color).multiplyScalar(0.82), 0.8), root);
      wb.rotation.x = Math.PI / 2;
      wb.scale.set(top.rx + easeM + 0.006, top.rz + easeM * 0.8 + 0.006, 1);
      wb.position.set(top.cx || 0, riseY - 0.012, top.cz || 0);
      // fly + button
      const fly = mesh(new THREE.BoxGeometry(0.004, Math.max(0.05, riseY - crotchY - 0.04), 0.004), plainMat(new THREE.Color(p.color).multiplyScalar(0.65), 0.8), root);
      fly.position.set(0.012, (riseY + crotchY) / 2 + 0.01, (top.cz || 0) + top.rz + easeM * 0.8 + 0.005);
      const btn = mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.004, 16), plainMat('#b08d57', 0.3, { metalness: 0.8 }), root);
      btn.rotation.x = Math.PI / 2;
      btn.position.set(0, riseY - 0.012, (top.cz || 0) + top.rz + easeM * 0.8 + 0.011);

      // legs: hem by length option
      const productInseam = { full: p.inseam || 32, cropped: (p.inseam || 32) - 3.5, shorts9: 9, shorts5: 5 }[p.length || 'full'];
      const hemY = Math.max(ankleY - 0.035, crotchY - productInseam * IN);
      const hemLocal = -(pivotY - hemY);
      const thighOuter = thighR + legEase + Math.max(0, easeM) * 0.4;
      const pantLeg = [];
      for (let i = 0; i < legRingsLocal.length; i++) {
        const r = legRingsLocal[i];
        if (r.y < hemLocal) break;
        let rx = r.rx + legEase, rz = r.rz + legEase;
        const kneeLocal = -(pivotY - kneeY);
        if (p.leg === 'straight' && r.y < -0.12) { rx = Math.max(rx, thighOuter * 0.66); rz = Math.max(rz, thighOuter * 0.68); }
        if (p.leg === 'wide' && r.y < -0.1) { const t = clamp((-0.1 - r.y) / (0.1 - kneeLocal - 0.2 + 0.4), 0, 1); rx = Math.max(rx, thighOuter * lerp(0.86, 0.98, t)); rz = Math.max(rz, thighOuter * lerp(0.88, 1.0, t)); }
        if (p.leg === 'slim' && r.y < kneeLocal) { rx = Math.max(rx, thighOuter * 0.5); rz = Math.max(rz, thighOuter * 0.52); }
        if (r.y < -0.08) rx = Math.min(rx, legX * 0.97 + Math.max(0, -r.y - 0.08) * Math.sin(legAngle) * 1.5);
        pantLeg.push({ ...r, rx, rz });
      }
      const last = pantLeg[pantLeg.length - 1];
      const hemR = sampleAt(legRingsLocal, hemLocal);
      pantLeg.push({ y: hemLocal, rx: Math.max(last.rx, hemR.rx + legEase), rz: Math.max(last.rz, hemR.rz + legEase), cz: last.cz || 0 });
      pantLeg[0] = { ...pantLeg[0], y: 0.06, rx: thighOuter * 1.02, rz: thighOuter * 1.05 };
      legs.forEach((g) => {
        mesh(loft(pantLeg, { vScale: 6, uScale: 3 }), mat, g);
        // hem fold
        const hem = mesh(new THREE.TorusGeometry(1, 0.0045, 8, 48), plainMat(new THREE.Color(p.color).multiplyScalar(0.88), 0.85), g);
        hem.rotation.x = Math.PI / 2;
        const hl = pantLeg[pantLeg.length - 1];
        hem.scale.set(hl.rx, hl.rz, 1);
        hem.position.set(0, hemLocal + 0.004, hl.cz || 0);
      });
      pantsAt = (y) => {
        const r = sampleAt(torso, clamp(y, crotchY, riseY));
        return { rx: r.rx + easeM + 0.004, rz: r.rz + easeM * 0.8 + 0.004 };
      };

      const bodyInseamIn = b.inseam;
      const lenDiff = productInseam - bodyInseamIn;
      result.bottom = {
        waist: ease < -0.5 ? { label: 'Too tight', tone: 'bad', diff: ease } : ease < 0.6 ? { label: 'Snug', tone: 'warn', diff: ease } : ease < 2.2 ? { label: 'Perfect', tone: 'good', diff: ease } : ease < 3.5 ? { label: 'Roomy — belt it', tone: 'warn', diff: ease } : { label: 'Too loose', tone: 'bad', diff: ease },
        length: p.length === 'shorts5' || p.length === 'shorts9' ? { label: `${productInseam}″ short`, tone: 'good' } : p.length === 'cropped' ? { label: 'Cropped at ankle', tone: 'good' } : lenDiff >= 1 ? { label: 'Full break · stacks', tone: 'warn' } : lenDiff >= -0.5 ? { label: 'Clean break', tone: 'good' } : lenDiff >= -2 ? { label: 'Ankle length', tone: 'good' } : { label: 'Too short', tone: 'bad' },
        riseLabel: { low: 'Low rise', mid: 'Mid rise', high: 'High rise' }[p.rise || 'mid'],
      };
    }

    // ── TOP GARMENT ──
    if (state.top) {
      const t = state.top;
      const chart = TOP_CHART[t.size] || TOP_CHART.M;
      const fitAdd = { slim: -1.5, regular: 0, relaxed: 2.5, oversized: 6 }[t.fit || 'regular'];
      const garmentChest = chart.garmentChest + fitAdd;
      const chestEase = garmentChest - b.chest;
      const dropShoulder = t.fit === 'oversized' ? 0.03 : 0;
      const lengthIn = chart.length + (t.fit === 'oversized' ? 1.2 : 0) + (t.type === 'shirt' ? 1.5 : 0);
      let hemY = neckBase + 0.02 - lengthIn * IN * 0.9;
      const tucked = !!t.tucked && !!state.bottom;
      if (tucked) hemY = riseY - 0.045;
      hemY = Math.max(hemY, crotchY - 0.02);
      const mat = fabricMat(t);
      if (mat.map) mat.map.repeat.set(t.texture === 'check' ? 3 : 4, t.texture === 'check' ? 3 : 4);

      const garmentRx = (circIn, k) => ellipse(circIn, k);
      const gChest = garmentRx(Math.max(garmentChest, b.chest + 0.6), 0.7);
      const rings = [];
      const ys = torso.filter((r) => r.y > hemY && r.y < neckBase + 0.012).map((r) => r.y);
      ys.unshift(hemY);
      if (pantsAt && !tucked) for (let yy = riseY - 0.05; yy <= riseY + 0.05; yy += 0.0125) if (yy > hemY) ys.push(yy);
      ys.sort((a, b) => a - b);
      ys.forEach((y) => {
        const bdy = sampleAt(torso, y);
        let rx, rz;
        if (y <= chestY) {
          // below chest: drape — never smaller than body+ease, approaches garment chest
          const drape = tucked ? 0.35 : t.type === 'shirt' || t.fit === 'oversized' ? 0.94 : 0.86;
          rx = Math.max(bdy.rx + 0.006, lerp(bdy.rx + 0.006, gChest.rx, drape));
          rz = Math.max(bdy.rz + 0.006, lerp(bdy.rz + 0.006, gChest.rz, drape));
          if (tucked && y < riseY + 0.04) { rx = bdy.rx + 0.004; rz = bdy.rz + 0.004; }
        } else {
          const k = clamp((y - chestY) / (shoulderY - chestY), 0, 1);
          rx = lerp(Math.max(gChest.rx, bdy.rx + 0.006), bdy.rx + 0.007 + dropShoulder * (1 - k * 0.3), Math.pow(k, 1.6));
          rz = lerp(Math.max(gChest.rz, bdy.rz + 0.006), bdy.rz + 0.008, Math.pow(k, 1.4));
          if (y > shoulderY) { rx = bdy.rx + 0.008; rz = bdy.rz + 0.008; }
        }
        // layer over pants
        if (pantsAt && !tucked && y < riseY + 0.06) {
          const pr = pantsAt(y);
          const m = Math.abs(y - riseY) < 0.05 ? 0.024 : 0.01;
          rx = Math.max(rx, pr.rx + m);
          rz = Math.max(rz, pr.rz + m);
        }
        rings.push({ y, rx, rz, cx: bdy.cx || 0, cz: bdy.cz || 0 });
      });
      // flare hem a touch
      if (!tucked) { rings[0].rx *= 1.015; rings[0].rz *= 1.02; }
      mesh(loft(rings, { vScale: 5, uScale: 3 }), mat, root);
      const topRing = rings[rings.length - 1];
      const trimColor = t.trim || new THREE.Color(t.color).multiplyScalar(0.85).getStyle();

      // neckline
      if (t.type === 'tee') {
        const rib = mesh(new THREE.TorusGeometry(1, 0.0075, 10, 48), plainMat(new THREE.Color(t.color).multiplyScalar(0.92), 0.9), root);
        rib.rotation.x = Math.PI / 2;
        rib.scale.set(topRing.rx * 0.98, topRing.rz * 0.98, 1);
        rib.position.set(0, topRing.y - 0.004, topRing.cz);
      } else {
        // collar stand + fall
        const collarGeo = new THREE.CylinderGeometry(1.08, 0.86, 0.032, 48, 1, true);
        const collar = mesh(collarGeo, t.texture === 'check' ? mat : plainMat(t.type === 'polo' ? new THREE.Color(t.color).multiplyScalar(0.95) : t.color, 0.85, { side: THREE.DoubleSide }), root);
        collar.scale.set(topRing.rx * 1.12, 1, topRing.rz * 1.18);
        collar.position.set(0, topRing.y + 0.006, topRing.cz - 0.002);
        collar.rotation.x = -0.12;
        if (t.trim) {
          const tip = mesh(new THREE.TorusGeometry(1, 0.0028, 6, 48), plainMat(t.trim, 0.6), root);
          tip.rotation.x = Math.PI / 2 - 0.12;
          tip.scale.set(topRing.rx * 1.27, topRing.rz * 1.34, 1);
          tip.position.set(0, topRing.y + 0.021, topRing.cz - 0.004);
        }
        // placket + buttons on chest front
        const plackLen = t.type === 'shirt' ? neckBase - hemY - 0.03 : 0.14;
        const front = (y) => { const r = rings.reduce((a, c) => (Math.abs(c.y - y) < Math.abs(a.y - y) ? c : a)); return r.cz + r.rz; };
                const segs = Math.max(2, Math.round(plackLen / 0.03));
        for (let i = 0; i < segs; i++) {
          const y0 = neckBase - 0.01 - (i + 0.5) * (plackLen / segs);
          const pl = mesh(new THREE.BoxGeometry(0.03, plackLen / segs + 0.002, 0.003), t.texture === 'check' ? mat : plainMat(new THREE.Color(t.color).multiplyScalar(0.94), 0.85), root);
          pl.position.set(0, y0, front(y0) + 0.0005);
        }
        const nBtn = t.type === 'shirt' ? 7 : 3;
        for (let i = 0; i < nBtn; i++) {
          const by = neckBase - 0.03 - i * (plackLen - 0.03) / Math.max(1, nBtn - 1);
          const bt = mesh(new THREE.CylinderGeometry(0.0055, 0.0055, 0.003, 14), plainMat('#efece4', 0.35), root);
          bt.rotation.x = Math.PI / 2;
          bt.position.set(0, by, front(by) + 0.004);
        }
        if (t.type === 'shirt') {
          const pocket = mesh(new THREE.BoxGeometry(0.075, 0.085, 0.003), t.texture === 'check' ? mat : plainMat(new THREE.Color(t.color).multiplyScalar(0.96), 0.85), root);
          const py = lerp(chestY, shoulderY, 0.15);
          pocket.position.set(0.075, py, front(py) - 0.004);
          pocket.rotation.y = 0.32;
        }
      }
      // chest print for graphic tees
      if (t.print) {
        const pr = mesh(new THREE.PlaneGeometry(0.17, 0.17), track(new THREE.MeshStandardMaterial({ map: printTexture(t.print), transparent: true, roughness: 0.9 })), root);
        const r = sampleAt(rings, chestY - 0.02);
        pr.position.set(0, chestY - 0.03, r.cz + r.rz + 0.006);
        pr.castShadow = false;
      }

      // sleeves
      const sizeIdx = Object.keys(TOP_CHART).indexOf(t.size);
      const shortLen = (8.5 + sizeIdx * 0.35) * IN;
      const longFromShoulder = (chart.sleeve - b.shoulders / 2) * IN;
      const sleeveLenMap = { short: shortLen, elbow: (12 + sizeIdx * 0.3) * IN, threeq: (18 + sizeIdx * 0.4) * IN, long: longFromShoulder };
      let sleeveLen = sleeveLenMap[t.sleeve || 'short'] + dropShoulder;
      sleeveLen = Math.min(sleeveLen, armLen + 0.09);
      const sleeveEase = (t.sleeve === 'long' ? 0.008 : 0.016) + Math.max(0, chestEase) * 0.0011 + (t.fit === 'oversized' ? 0.012 : 0);
      const sleeveRings = [];
      for (const r of armRingsLocal) {
        if (r.y < -sleeveLen) break;
        sleeveRings.push({ ...r, rx: r.rx + sleeveEase, rz: r.rz + sleeveEase });
      }
      const end = sampleAt(armRingsLocal, -sleeveLen);
      const openEase = t.sleeve === 'long' ? sleeveEase * 0.7 : sleeveEase * 1.25;
      sleeveRings.push({ y: -sleeveLen, rx: Math.max(end.rx + openEase, t.sleeve === 'long' ? 0 : sleeveRings[sleeveRings.length - 1].rx * 0.97), rz: Math.max(end.rz + openEase, t.sleeve === 'long' ? 0 : sleeveRings[sleeveRings.length - 1].rz * 0.97) });
      sleeveRings[0] = { ...sleeveRings[0], y: 0.0, rx: bicep * 1.06 + sleeveEase, rz: bicep * 1.1 + sleeveEase };
      arms.forEach((g) => {
        mesh(loft(sleeveRings, { vScale: 5, uScale: 2, seg: 40 }), mat, g);
        const capS = mesh(new THREE.SphereGeometry(bicep * 1.07 + sleeveEase * 0.6, 28, 16, 0, TAU, 0, Math.PI / 2), mat, g);
        capS.position.y = 0.0;
        const cuffC = t.trim && t.type === 'polo' ? t.trim : trimColor;
        const cuff = mesh(new THREE.TorusGeometry(1, t.sleeve === 'long' ? 0.006 : 0.0045, 8, 40), plainMat(cuffC, 0.8), g);
        cuff.rotation.x = Math.PI / 2;
        const lr = sleeveRings[sleeveRings.length - 1];
        cuff.scale.set(lr.rx, lr.rz, 1);
        cuff.position.y = -sleeveLen + 0.004;
      });

      const lengthNote = tucked ? { label: 'Tucked in', tone: 'good' } : hemY < crotchY + 0.01 ? { label: 'Long — covers seat', tone: 'warn' } : hemY > riseY - 0.01 ? { label: 'Cropped — shows skin', tone: 'bad' } : hemY < hipY - 0.02 ? { label: 'Hits low hip', tone: 'good' } : { label: 'Hits at belt', tone: 'good' };
      const sleeveDiff = (sleeveLenMap.long - armLen) / IN;
      result.top = {
        chest: chestEase < 0.5 ? { label: 'Too tight', tone: 'bad', diff: chestEase } : chestEase < 2.5 ? { label: 'Slim', tone: 'warn', diff: chestEase } : chestEase < 5.5 ? { label: 'Regular', tone: 'good', diff: chestEase } : chestEase < 9.5 ? { label: 'Relaxed', tone: 'good', diff: chestEase } : { label: 'Oversized', tone: 'warn', diff: chestEase },
        length: lengthNote,
        sleeve: t.sleeve === 'long'
          ? (sleeveDiff < -1 ? { label: `${Math.abs(sleeveDiff).toFixed(1)}″ short of wrist`, tone: 'bad' } : sleeveDiff > 1.5 ? { label: `${sleeveDiff.toFixed(1)}″ past wrist`, tone: 'warn' } : { label: 'Ends at wrist', tone: 'good' })
          : { label: { short: 'Mid-bicep', elbow: 'At the elbow', threeq: 'Three-quarter' }[t.sleeve || 'short'], tone: 'good' },
      };
    }

    // ── measurement rings ──
    if (showMeasure) {
      const mm = track(new THREE.MeshBasicMaterial({ color: 0xe2261c }));
      [[chestY, chest], [waistY, waist], [hipY, hip]].forEach(([y, e]) => {
        const r = new THREE.Mesh(track(new THREE.TorusGeometry(1, 0.0025, 6, 64)), mm);
        r.rotation.x = Math.PI / 2;
        r.scale.set(e.rx + 0.03, e.rz + 0.03, 1);
        r.position.y = y;
        root.add(r);
      });
      const hl = new THREE.Mesh(track(new THREE.CylinderGeometry(0.002, 0.002, H, 6)), mm);
      hl.position.set(-0.42, H / 2, 0);
      root.add(hl);
      [0, H].forEach((y) => { const tk = new THREE.Mesh(track(new THREE.BoxGeometry(0.06, 0.003, 0.003)), mm); tk.position.set(-0.42, y, 0); root.add(tk); });
    }

    // frame camera to body height once per height change
    const tgtY = H * 0.5;
    controls.target.y = lerp(controls.target.y, tgtY, 1);
    lastResult = result;
    return result;
  }

  // ── loop ──
  let raf = 0;
  let disposed = false;
  const resize = () => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(host);
  resize();
  const tick = () => {
    if (disposed) return;
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(tick);
  };
  tick();

  // intro sweep
  const intro = { t: 0 };
  const introTick = () => {
    intro.t += 0.02;
    if (intro.t > 1) return;
    const e = 1 - Math.pow(1 - intro.t, 3);
    camera.position.set(lerp(2.8, 0.9, e), lerp(1.9, 1.15, e), lerp(4.2, 5.6, e));
    requestAnimationFrame(introTick);
  };
  introTick();

  return {
    update: (state) => build(state),
    setView(view) {
      const d = camera.position.distanceTo(controls.target);
      const y = controls.target.y + 0.15;
      const map = { front: [0, y, d], side: [d, y, 0], back: [0, y, -d], three: [d * 0.6, y + 0.2, d * 0.8] };
      const [x, yy, z] = map[view] || map.front;
      const from = camera.position.clone();
      const to = new THREE.Vector3(x, yy, z);
      let k = 0;
      const anim = () => { k += 0.06; camera.position.lerpVectors(from, to, 1 - Math.pow(1 - Math.min(k, 1), 3)); if (k < 1) requestAnimationFrame(anim); };
      anim();
    },
    setAutoRotate(v) { controls.autoRotate = v; },
    setMeasure(v, state) { showMeasure = v; build(state); },
    zoom(dir) {
      const v = camera.position.clone().sub(controls.target);
      v.multiplyScalar(dir > 0 ? 0.85 : 1.18);
      const len = clamp(v.length(), controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(v.setLength(len));
    },
    snapshot() { return renderer.domElement.toDataURL('image/png'); },
    get result() { return lastResult; },
    dispose() {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      controls.dispose();
      disposables.forEach((d) => d.dispose?.());
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
