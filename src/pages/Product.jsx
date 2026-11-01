import { useEffect, useState } from 'react';
import { PRODUCTS, productBySlug, SHIPPING } from '../data/products.js';
import { Link, useRouter } from '../lib/router.jsx';
import { useStore } from '../lib/store.jsx';
import { money, recommendFor, deliveryWindow, cx, TOP_CHART } from '../lib/utils.js';
import { Img, Icon, Button, Modal } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';

export function SizeGuide({ open, onClose, kind }) {
  return (
    <Modal open={open} onClose={onClose} title="Size guide" wide>
      {kind === 'pants' ? (
        <>
          <p className="muted">Waist sizes are in inches. Measure around your natural waist, where you normally wear your jeans. All pants have a 32″ inseam unless noted.</p>
          <table className="size-table">
            <thead><tr><th>Size</th><th>Body waist</th><th>Hip</th><th>Inseam</th></tr></thead>
            <tbody>
              {[28, 30, 32, 34, 36, 38].map((w) => <tr key={w}><td>{w}</td><td>{w - 1}–{w + 0.5}″</td><td>{w + 6}–{w + 8}″</td><td>32″</td></tr>)}
            </tbody>
          </table>
        </>
      ) : kind === 'shoes' ? (
        <p className="muted">Sneakers are listed in US men’s sizes. Each pair is one-of-one — message us for insole length before ordering.</p>
      ) : (
        <>
          <p className="muted">Body measurements in inches. Measure around the fullest part of your chest, under the arms. Oversized styles are cut roomy — size down for a regular fit.</p>
          <table className="size-table">
            <thead><tr><th>Size</th><th>Chest</th><th>Garment chest</th><th>Length</th><th>Sleeve (shirts)</th></tr></thead>
            <tbody>
              {Object.entries(TOP_CHART).map(([k, v]) => (
                <tr key={k}><td>{k}</td><td>{v.chest[0]}–{v.chest[1]}″</td><td>{v.garmentChest}″</td><td>{v.length}″</td><td>{v.sleeve}″</td></tr>
              ))}
            </tbody>
          </table>
        </>
      )}
      <Link to="/fit-studio" className="fit-nudge in-modal"><Icon name="cube" /><span><b>Prefer to see it?</b> Try your size on a 3D body built to your measurements.</span><Icon name="arrow" size={18} /></Link>
    </Modal>
  );
}

function Accordion({ title, children, open: o = false }) {
  const [open, setOpen] = useState(o);
  return (
    <div className={cx('acc', open && 'open')}>
      <button onClick={() => setOpen(!open)} aria-expanded={open}>{title}<Icon name="plus" size={16} /></button>
      <div className="acc-body"><div>{children}</div></div>
    </div>
  );
}

export default function Product({ slug }) {
  const p = productBySlug(slug);
  const { add, body, bodySaved, notify } = useStore();
  const { navigate } = useRouter();
  const [img, setImg] = useState(0);
  const [size, setSize] = useState(null);
  const [guide, setGuide] = useState(false);
  const [err, setErr] = useState(false);
  const [zoom, setZoom] = useState(null);

  const rec = p && bodySaved ? recommendFor(p, body) : null;
  useEffect(() => {
    setImg(0);
    setErr(false);
    if (!p) return;
    setSize(p.sizes.length === 1 ? p.sizes[0] : rec && p.sizes.includes(rec) ? rec : null);
    document.title = `${p.name} — ${p.color} | H&S Apparel`;
    return () => { document.title = 'H&S Apparel — Premium Menswear, Shipped to the USA'; };
  }, [slug]);

  if (!p) return <div className="notfound"><h1 className="display-1">Piece not found.</h1><Button to="/shop">Back to shop</Button></div>;

  const related = PRODUCTS.filter((x) => x.id !== p.id && x.category === p.category).slice(0, 4);
  const pairCat = p.category === 'pants' ? 'tees-polos' : p.category === 'shoes' || p.category === 'women' ? null : 'pants';
  const pair = pairCat ? PRODUCTS.filter((x) => x.category === pairCat).slice(0, 4) : [];
  const std = SHIPPING.methods[0];
  const exp = SHIPPING.methods[1];

  const addToBag = () => {
    if (!size) { setErr(true); return; }
    add(p.id, size);
    notify(`Added ${p.name} · ${size}`);
  };

  return (
    <div className="product">
      <nav className="crumbs pad"><Link to="/">Home</Link> / <Link to={`/shop/${p.category}`}>{p.category === 'tees-polos' ? 'Tees & Polos' : p.category[0].toUpperCase() + p.category.slice(1)}</Link> / <span>{p.name}</span></nav>
      <div className="pdp">
        <div className="pdp-gallery">
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((s, i) => (
                <button key={s} className={cx(i === img && 'on')} onClick={() => setImg(i)} aria-label={`Image ${i + 1}`}><Img src={s} alt="" swatch={p.swatch} /></button>
              ))}
            </div>
          )}
          <div
            className={cx('pdp-main', zoom && 'zooming')}
            onMouseMove={(e) => { const r = e.currentTarget.getBoundingClientRect(); setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 }); }}
            onMouseLeave={() => setZoom(null)}
            style={zoom ? { '--zx': `${zoom.x}%`, '--zy': `${zoom.y}%` } : undefined}
          >
            <Img key={p.images[img]} src={p.images[img]} alt={`${p.name} — ${p.color}`} swatch={p.swatch} label={`${p.name} · ${p.color}`} eager />
            {p.badge && <span className={cx('badge', p.badge === 'One of one' && 'badge-red')}>{p.badge}</span>}
          </div>
        </div>

        <div className="pdp-info">
          <p className="pdp-brand">{p.brand}</p>
          <h1 className="pdp-title">{p.name}</h1>
          <p className="pdp-price">{money(p.price)} {p.compareAt && <><s>{money(p.compareAt)}</s><em className="save">Save {Math.round((1 - p.price / p.compareAt) * 100)}%</em></>}</p>
          <p className="pdp-color"><i style={{ background: p.swatch }} /> {p.color}</p>
          <p className="pdp-desc">{p.desc}</p>

          <div className="pdp-sizes">
            <div className="row">
              <span className="flabel">{p.category === 'pants' ? 'Waist' : p.category === 'shoes' ? 'US size' : 'Size'}{size && <b> · {size}</b>}</span>
              <button className="link-btn" onClick={() => setGuide(true)}><Icon name="ruler" size={16} /> Size guide</button>
            </div>
            <div className="size-row">
              {p.sizes.map((s) => (
                <button key={s} className={cx('size-btn', size === s && 'on', rec === s && 'rec')} onClick={() => { setSize(s); setErr(false); }}>
                  {s}{rec === s && <small>Your fit</small>}
                </button>
              ))}
            </div>
            {err && <p className="err">Please choose a size.</p>}
            {p.sizes.length === 1 && <p className="muted small">One-of-one piece — only this size available.</p>}
          </div>

          <div className="pdp-actions">
            <Button className="w100" icon="bag" onClick={addToBag}>Add to bag — {money(p.price)}</Button>
            {p.fit3d && (
              <Button variant="ghost" className="w100" icon="cube" onClick={() => navigate(`/fit-studio?item=${p.id}${size ? `&size=${size}` : ''}`)}>
                Try it on in 3D
              </Button>
            )}
          </div>
          {!bodySaved && p.fit3d && <p className="muted small center">Tip: save your measurements in the Fit Studio and we’ll mark your size on every product.</p>}

          <div className="pdp-ship">
            <div><Icon name="truck" /><span><b>Standard</b> {deliveryWindow(std.days)} · {p.price >= SHIPPING.freeOver ? 'Free' : `${money(std.price)} (free over $${SHIPPING.freeOver})`}</span></div>
            <div><Icon name="globe" /><span><b>Express</b> {deliveryWindow(exp.days)} · {money(exp.price)}</span></div>
            <div><Icon name="shield" /><span>Quality-checked in Karachi before dispatch</span></div>
          </div>

          <Accordion title="Details & fabric" open>
            <ul className="dots">{p.details.map((d) => <li key={d}>{d}</li>)}</ul>
          </Accordion>
          <Accordion title="Shipping to the USA">
            <p>Ships from Karachi within 1–2 business days. Standard delivery takes 10–15 business days; Express Priority takes 6–9. Tracking is emailed as soon as your parcel leaves us. We currently deliver to US addresses only.</p>
          </Accordion>
          <Accordion title="Returns & exchanges">
            <p>Not the right fit? Request a return within 14 days of delivery for store credit or a size exchange. See our <Link to="/shipping#returns">returns policy</Link>.</p>
          </Accordion>
          <Accordion title="Questions about this piece?">
            <p>Ask us for exact measurements or more photos — <Link to={`/contact?product=${encodeURIComponent(p.name + ' — ' + p.color)}`}>send a message</Link> and we’ll reply within 24 hours.</p>
          </Accordion>
        </div>
      </div>

      <div className="mobile-buy">
        <div><b>{money(p.price)}</b><small>{size ? `Size ${size}` : 'Select a size'}</small></div>
        <Button icon="bag" onClick={addToBag}>Add to bag</Button>
      </div>

      {pair.length > 0 && (
        <section className="section">
          <div className="section-head" data-reveal><div><p className="eyebrow">Complete the look</p><h2 className="display-2">Pair it <em>with.</em></h2></div></div>
          <div className="grid-4">{pair.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div>
        </section>
      )}
      {related.length > 0 && (
        <section className="section section-tight">
          <div className="section-head" data-reveal><div><p className="eyebrow">You may also like</p><h2 className="display-2">More in <em>this edit.</em></h2></div></div>
          <div className="grid-4">{related.map((x, i) => <ProductCard key={x.id} p={x} i={i} />)}</div>
        </section>
      )}
      <SizeGuide open={guide} onClose={() => setGuide(false)} kind={p.category} />
    </div>
  );
}
