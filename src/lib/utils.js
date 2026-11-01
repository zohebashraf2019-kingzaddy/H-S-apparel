export const money = (n) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);

export function addBusinessDays(date, days) {
  const d = new Date(date);
  let added = 0;
  while (added < days) {
    d.setDate(d.getDate() + 1);
    const w = d.getDay();
    if (w !== 0 && w !== 6) added++;
  }
  return d;
}
export const fmtDate = (d) => d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
export const deliveryWindow = ([a, b]) => {
  const now = new Date();
  return `${fmtDate(addBusinessDays(now, a))} – ${fmtDate(addBusinessDays(now, b))}`;
};

// ── Size charts (body measurements in inches) ──
export const TOP_CHART = {
  S: { chest: [34, 37], garmentChest: 40, length: 27.5, sleeve: 33 },
  M: { chest: [37, 40], garmentChest: 43, length: 28.5, sleeve: 34 },
  L: { chest: [40, 43], garmentChest: 46, length: 29.5, sleeve: 35 },
  XL: { chest: [43, 46], garmentChest: 49, length: 30.5, sleeve: 36 },
  XXL: { chest: [46, 50], garmentChest: 53, length: 31.5, sleeve: 37 },
};
export const recommendTop = (chest) => {
  for (const [k, v] of Object.entries(TOP_CHART)) if (chest < v.chest[1]) return k;
  return 'XXL';
};
export const recommendWaist = (waist) => {
  const sizes = [28, 30, 32, 34, 36, 38];
  return String(sizes.find((s) => waist <= s + 0.5) ?? 38);
};
export const recommendShoe = (heightIn) => String(Math.min(12, Math.max(7, Math.round((heightIn - 62) / 2.4 + 7))));

export function recommendFor(product, body) {
  if (!body || !product) return null;
  const c = product.category;
  if (c === 'pants') return recommendWaist(body.waist);
  if (c === 'shoes') return body.shoe || recommendShoe(body.height);
  if (c === 'women') return null;
  return recommendTop(body.chest);
}

export const DEFAULT_BODY = {
  height: 70, chest: 40, waist: 33, hips: 39, shoulders: 18, arm: 25, inseam: 32, neck: 15.5, skin: 2, shoe: '10',
};

export const safeStore = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

export const cx = (...a) => a.filter(Boolean).join(' ');
