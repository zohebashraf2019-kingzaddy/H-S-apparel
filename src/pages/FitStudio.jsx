import { useEffect, useMemo, useRef, useState } from 'react';
import { PRODUCTS, productById } from '../data/products.js';
import { useStore } from '../lib/store.jsx';
import { useRouter, Link } from '../lib/router.jsx';
import { money, recommendTop, recommendWaist, recommendShoe, cx, DEFAULT_BODY } from '../lib/utils.js';
import { createStudio, SKIN_TONES } from '../fit/scene.js';
import { Icon, Img, Button } from '../components/ui.jsx';

const TOPS = PRODUCTS.filter((p) => p.fit3d && ['tee', 'polo', 'shirt'].includes(p.fit3d.type));
const BOTTOMS = PRODUCTS.filter((p) => p.fit3d?.type === 'pants');
const SHOES = PRODUCTS.filter((p) => p.fit3d?.type === 'shoe');
const SETS = PRODUCTS.filter((p) => p.fit3d?.type === 'set');

const ftIn = (n) => `${Math.floor(n / 12)}′${Math.round(n % 12)}″`;
const PRESETS = {
  Slim: { height: 69, chest: 36, waist: 29, hips: 35, shoulders: 16.8, arm: 24.5, inseam: 32, neck: 14.5 },
  Athletic: { height: 71, chest: 42, waist: 32, hips: 39, shoulders: 19.2, arm: 25.5, inseam: 32.5, neck: 16 },
  Regular: { height: 70, chest: 40, waist: 33, hips: 39, shoulders: 18, arm: 25, inseam: 32, neck: 15.5 },
  Broad: { height: 72, chest: 46, waist: 39, hips: 44, shoulders: 20.2, arm: 26, inseam: 32, neck: 17 },
};
const SLIDERS = [
  ['height', 'Height', 60, 80, 0.5, ftIn],
  ['chest', 'Chest', 32, 54, 0.5],
  ['waist', 'Waist', 26, 48, 0.5],
  ['hips', 'Hips / seat', 32, 52, 0.5],
  ['shoulders', 'Shoulder width', 15, 23, 0.2],
  ['arm', 'Arm length (shoulder → wrist)', 20, 29, 0.25],
  ['inseam', 'Inseam', 26, 36, 0.5],
  ['neck', 'Neck', 13, 19, 0.25],
];

function Seg({ value, onChange, options }) {
  return (
    <div className="seg">
      {options.map(([v, l]) => (
        <button key={v} className={cx(value === v && 'on')} onClick={() => onChange(v)}>{l}</button>
      ))}
    </div>
  );
}
function Picker({ items, value, onChange, allowNone, noneLabel = 'None' }) {
  return (
    <div className="picker">
      {allowNone && <button className={cx('pk none', !value && 'on')} onClick={() => onChange(null)}><span>{noneLabel}</span></button>}
      {items.map((p) => (
        <button key={p.id} className={cx('pk', value === p.id && 'on')} onClick={() => onChange(p.id)} title={`${p.name} — ${p.color}`}>
          <Img src={p.images[0]} alt={p.name} swatch={p.swatch} />
          <i style={{ background: p.swatch }} />
        </button>
      ))}
    </div>
  );
}
const Verdict = ({ label, v }) => v ? <div className={cx('verdict', v.tone)}><small>{label}</small><b>{v.label}</b>{typeof v.diff === 'number' && <em>{v.diff >= 0 ? '+' : ''}{v.diff.toFixed(1)}″ ease</em>}</div> : null;

export default function FitStudio() {
  const { body: savedBody, saveBody, bodySaved, add, notify, setDrawer } = useStore();
  const { query } = useRouter();
  const hostRef = useRef(null);
  const studio = useRef(null);
  const [tab, setTab] = useState('body');
  const [body, setBody] = useState(savedBody || DEFAULT_BODY);
  const [skin, setSkin] = useState(savedBody?.skin ?? 2);
  const [auto, setAuto] = useState(false);
  const [measure, setMeasure] = useState(false);
  const [result, setResult] = useState(null);
  const [failed, setFailed] = useState(false);

  const recTop = recommendTop(body.chest);
  const recWaist = recommendWaist(body.waist);
  const recShoe = body.shoe || recommendShoe(body.height);

  // garment selections
  const [topId, setTopId] = useState('hs-103');
  const [topSize, setTopSize] = useState(recTop);
  const [sleeve, setSleeve] = useState('short');
  const [fit, setFit] = useState('regular');
  const [tucked, setTucked] = useState(false);
  const [botId, setBotId] = useState('hs-302');
  const [botSize, setBotSize] = useState(recWaist);
  const [rise, setRise] = useState('mid');
  const [length, setLength] = useState('full');
  const [leg, setLeg] = useState('straight');
  const [shoeId, setShoeId] = useState('hs-401');
  const [setId, setSetId] = useState(null);

  const applyTop = (id, size) => {
    const p = productById(id);
    if (!p) { setTopId(null); return; }
    setTopId(id);
    setSleeve(p.fit3d.sleeve || 'short');
    setFit(p.fit3d.fit || 'regular');
    setTopSize(size && p.sizes.includes(size) ? size : p.sizes.includes(recommendTop(body.chest)) ? recommendTop(body.chest) : p.sizes[0]);
  };
  const applyBottom = (id, size) => {
    const p = productById(id);
    if (!p) { setBotId(null); return; }
    setBotId(id);
    setRise(p.fit3d.rise || 'mid');
    setLeg(p.fit3d.leg || 'straight');
    setLength('full');
    setBotSize(size && p.sizes.includes(size) ? size : p.sizes.includes(recommendWaist(body.waist)) ? recommendWaist(body.waist) : p.sizes[0]);
  };

  // deep link: /fit-studio?item=hs-101&size=M
  useEffect(() => {
    const id = query.get('item');
    const size = query.get('size');
    const p = id && productById(id);
    if (!p?.fit3d) { applyTop('hs-103'); applyBottom('hs-302'); return; }
    if (p.fit3d.type === 'pants') { applyBottom(p.id, size); setTab('bottom'); }
    else if (p.fit3d.type === 'shoe') { setShoeId(p.id); setTab('shoes'); }
    else if (p.fit3d.type === 'set') { setTopId(null); setBotId(null); setTab('top'); setSetId(p.id); return; }
    else { applyTop(p.id, size); setTab('top'); }
  }, []);

  // build state for the scene
  const sceneState = useMemo(() => {
    const top = setId ? productById(setId).fit3d.top : topId ? productById(topId).fit3d : null;
    const bottom = setId ? productById(setId).fit3d.bottom : botId ? productById(botId).fit3d : null;
    const shoe = shoeId ? productById(shoeId).fit3d : null;
    const setSizeWaist = setId ? recommendWaist(body.waist) : botSize;
    return {
      body,
      skin: SKIN_TONES[skin],
      top: top ? { ...top, size: setId ? topSize : topSize, sleeve, fit, tucked } : null,
      bottom: bottom ? { ...bottom, size: setSizeWaist, rise, length, leg } : null,
      shoe: shoe ? { ...shoe, size: shoeId && productById(shoeId).sizes[0] } : null,
    };
  }, [body, skin, topId, topSize, sleeve, fit, tucked, botId, botSize, rise, length, leg, shoeId, setId]);

  useEffect(() => {
    if (!hostRef.current) return;
    try {
      studio.current = createStudio(hostRef.current);
    } catch (e) {
      console.error(e);
      setFailed(true);
    }
    return () => studio.current?.dispose();
  }, []);

  useEffect(() => {
    if (!studio.current) return;
    const id = requestAnimationFrame(() => setResult(studio.current.update(sceneState)));
    return () => cancelAnimationFrame(id);
  }, [sceneState]);

  useEffect(() => { studio.current?.setAutoRotate(auto); }, [auto]);
  useEffect(() => { studio.current?.setMeasure(measure, sceneState); }, [measure]);

  // when picking a set, sync its sleeves
  useEffect(() => {
    if (!setId) return;
    const s = productById(setId).fit3d;
    setSleeve(s.top.sleeve); setFit(s.top.fit || 'regular'); setRise(s.bottom.rise); setLeg(s.bottom.leg); setLength('full');
    setTopSize(recommendTop(body.chest));
  }, [setId]);

  const topP = setId ? productById(setId) : topId && productById(topId);
  const botP = !setId && botId && productById(botId);
  const shoeP = shoeId && productById(shoeId);

  const outfitTotal = (topP ? topP.price : 0) + (botP ? botP.price : 0) + (shoeP ? shoeP.price : 0);
  const addOutfit = () => {
    let n = 0;
    if (topP) { add(topP.id, topP.sizes.includes(topSize) ? topSize : topP.sizes[0], 1, { open: false }); n++; }
    if (botP) { add(botP.id, botP.sizes.includes(botSize) ? botSize : botP.sizes[0], 1, { open: false }); n++; }
    if (shoeP) { add(shoeP.id, shoeP.sizes[0], 1, { open: false }); n++; }
    if (n) { notify(`Added ${n} piece${n > 1 ? 's' : ''} to your bag`); setDrawer(true); }
  };

  const save = () => { saveBody({ ...body, skin }); notify('Measurements saved — your size is now marked on every product'); };
  const setB = (k, v) => setBody((b) => ({ ...b, [k]: v }));

  return (
    <div className="studio">
      <div className="studio-head">
        <div>
          <p className="eyebrow">Free · No app needed</p>
          <h1 className="display-2">3D Fit <em>Studio</em></h1>
        </div>
        <p className="muted">Build your body to the inch, dress it in any H&S piece and see exactly how it fits — sleeves, rise, length and all.</p>
      </div>

      <div className="studio-grid">
        <div className="stage">
          <div className="stage-canvas" ref={hostRef} />
          {failed && <div className="stage-fail"><p>Your browser couldn’t start 3D (WebGL is off). Use the size guide on each product instead.</p></div>}
          <div className="stage-tools">
            {[['front', 'Front'], ['three', '¾'], ['side', 'Side'], ['back', 'Back']].map(([v, l]) => (
              <button key={v} onClick={() => studio.current?.setView(v)}>{l}</button>
            ))}
            <span className="sep" />
            <button className={cx(auto && 'on')} onClick={() => setAuto(!auto)} title="Auto-rotate"><Icon name="rotate" size={16} /></button>
            <button className={cx(measure && 'on')} onClick={() => setMeasure(!measure)} title="Show measurements"><Icon name="ruler" size={16} /></button>
            <button onClick={() => studio.current?.zoom(1)} title="Zoom in"><Icon name="plus" size={16} /></button>
            <button onClick={() => studio.current?.zoom(-1)} title="Zoom out"><Icon name="minus" size={16} /></button>
          </div>
          <div className="stage-badge">
            <span>{ftIn(body.height)}</span><span>Chest {body.chest}″</span><span>Waist {body.waist}″</span><span>Inseam {body.inseam}″</span>
          </div>
          <div className="stage-verdicts">
            <Verdict label="Chest fit" v={result?.top?.chest} />
            <Verdict label="Top length" v={result?.top?.length} />
            <Verdict label="Sleeves" v={result?.top?.sleeve} />
            <Verdict label="Waist fit" v={result?.bottom?.waist} />
            <Verdict label="Hem" v={result?.bottom?.length} />
          </div>
          <p className="stage-hint">Drag to rotate · scroll or pinch to zoom</p>
        </div>

        <aside className="panel">
          <div className="tabs">
            {[['body', '1 · Body'], ['top', '2 · Top'], ['bottom', '3 · Bottom'], ['shoes', '4 · Shoes']].map(([k, l]) => (
              <button key={k} className={cx(tab === k && 'on')} onClick={() => setTab(k)}>{l}</button>
            ))}
          </div>

          {tab === 'body' && (
            <div className="tab-body">
              <div className="presets">
                {Object.keys(PRESETS).map((k) => <button key={k} onClick={() => { const nb = { ...body, ...PRESETS[k] }; setBody(nb); const tp = topId && productById(topId); const bp = botId && productById(botId); const rt = recommendTop(nb.chest), rw = recommendWaist(nb.waist); if (setId || (tp && tp.sizes.includes(rt))) setTopSize(rt); if (bp && bp.sizes.includes(rw)) setBotSize(rw); }}>{k}</button>)}
              </div>
              {SLIDERS.map(([k, label, min, max, step, fmt]) => (
                <label key={k} className="slider">
                  <span className="sl-top"><span>{label}</span><b>{fmt ? fmt(body[k]) : `${body[k]}″`}</b></span>
                  <input type="range" min={min} max={max} step={step} value={body[k]} onChange={(e) => setB(k, parseFloat(e.target.value))} style={{ '--p': `${((body[k] - min) / (max - min)) * 100}%` }} />
                </label>
              ))}
              <div className="skin">
                <span>Mannequin tone</span>
                <div>{SKIN_TONES.map((c, i) => <button key={c} className={cx(skin === i && 'on')} style={{ background: c }} onClick={() => setSkin(i)} aria-label={`Tone ${i + 1}`} />)}</div>
              </div>
              <div className="recs">
                <div><small>Tops</small><b>{recTop}</b></div>
                <div><small>Waist</small><b>{recWaist}</b></div>
                <div><small>Shoes (US)</small><b>{recShoe}</b></div>
              </div>
              <Button className="w100" icon="check" onClick={save}>{bodySaved ? 'Update my measurements' : 'Save my measurements'}</Button>
              <p className="muted small">Saved on this device only. We use it to highlight your size on every product.</p>
              <button className="link-btn" onClick={() => setTab('top')}>Next: choose a top →</button>
            </div>
          )}

          {tab === 'top' && (
            <div className="tab-body">
              <p className="flabel">Tops</p>
              <Picker items={TOPS} value={setId ? null : topId} onChange={(id) => { setSetId(null); applyTop(id); }} allowNone />
              {SETS.length > 0 && <>
                <p className="flabel">Co-ord sets</p>
                <Picker items={SETS} value={setId} onChange={(id) => setSetId(id)} />
              </>}
              {topP && (
                <>
                  <div className="sel-name"><b>{topP.name}</b> <span>{topP.color} · {money(topP.price)}</span> <Link to={`/product/${topP.slug}`}>View</Link></div>
                  <p className="flabel">Size {recTop && <em className="rec-tag">Recommended: {recTop}</em>}</p>
                  <Seg value={topSize} onChange={setTopSize} options={(setId ? ['S', 'M', 'L', 'XL', 'XXL'] : topP.sizes).map((s) => [s, s])} />
                  <p className="flabel">Sleeve length</p>
                  <Seg value={sleeve} onChange={setSleeve} options={[['short', 'Short'], ['elbow', 'Elbow'], ['threeq', '¾'], ['long', 'Long']]} />
                  <p className="flabel">Fit</p>
                  <Seg value={fit} onChange={setFit} options={[['slim', 'Slim'], ['regular', 'Regular'], ['relaxed', 'Relaxed'], ['oversized', 'Oversized']]} />
                  <label className="check"><input type="checkbox" checked={tucked} onChange={(e) => setTucked(e.target.checked)} disabled={!botId && !setId} /> Tuck it in</label>
                  <p className="muted small">Sleeve & fit previews show how the piece wears when rolled or sized differently. The product ships as described on its page.</p>
                </>
              )}
            </div>
          )}

          {tab === 'bottom' && (
            <div className="tab-body">
              <p className="flabel">Pants, denim & chinos</p>
              <Picker items={BOTTOMS} value={setId ? null : botId} onChange={(id) => { setSetId(null); applyBottom(id); }} allowNone />
              {(botP || setId) && (
                <>
                  {botP && <div className="sel-name"><b>{botP.name}</b> <span>{botP.color} · {money(botP.price)}</span> <Link to={`/product/${botP.slug}`}>View</Link></div>}
                  {botP && <>
                    <p className="flabel">Waist size <em className="rec-tag">Recommended: {recWaist}</em></p>
                    <Seg value={botSize} onChange={setBotSize} options={botP.sizes.map((s) => [s, s])} />
                  </>}
                  <p className="flabel">Rise (where it sits)</p>
                  <Seg value={rise} onChange={setRise} options={[['low', 'Low'], ['mid', 'Mid'], ['high', 'High waist']]} />
                  <p className="flabel">Length</p>
                  <Seg value={length} onChange={setLength} options={[['shorts5', 'Shorts 5″'], ['shorts9', 'Shorts 9″'], ['cropped', 'Cropped'], ['full', 'Full']]} />
                  <p className="flabel">Leg shape</p>
                  <Seg value={leg} onChange={setLeg} options={[['skinny', 'Skinny'], ['slim', 'Slim'], ['straight', 'Straight'], ['wide', 'Wide']]} />
                </>
              )}
            </div>
          )}

          {tab === 'shoes' && (
            <div className="tab-body">
              <p className="flabel">Sneakers</p>
              <Picker items={SHOES} value={shoeId} onChange={setShoeId} allowNone noneLabel="Barefoot" />
              {shoeP && <div className="sel-name"><b>{shoeP.brand} {shoeP.name}</b> <span>US {shoeP.sizes[0]} · {money(shoeP.price)}</span> <Link to={`/product/${shoeP.slug}`}>View</Link></div>}
              {shoeP && shoeP.sizes[0] !== recShoe && <p className="note"><Icon name="ruler" size={16} /> This pair is US {shoeP.sizes[0]}; your estimated size is {recShoe}. Message us for insole length.</p>}
            </div>
          )}

          <div className="outfit">
            <p className="eyebrow">Your outfit</p>
            {[topP && [topP, setId ? `Set · ${topSize}` : topSize], botP && [botP, botSize], shoeP && [shoeP, `US ${shoeP.sizes[0]}`]].filter(Boolean).map(([p, s]) => (
              <div className="of-line" key={p.id}><Img src={p.images[0]} alt="" swatch={p.swatch} /><span><b>{p.name}</b><small>{p.color} · {s}</small></span><span>{money(p.price)}</span></div>
            ))}
            {outfitTotal > 0 ? (
              <Button className="w100" icon="bag" onClick={addOutfit}>Add outfit to bag — {money(outfitTotal)}</Button>
            ) : <p className="muted small">Pick a top, bottom or shoes to build an outfit.</p>}
          </div>
        </aside>
      </div>
    </div>
  );
}
