import { useEffect } from 'react';
import { useStore } from '../lib/store.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { productById, SHIPPING } from '../data/products.js';
import { money, cx } from '../lib/utils.js';
import { Img, Icon, Button } from './ui.jsx';

export default function CartDrawer() {
  const { cart, drawer, setDrawer, update, totals } = useStore();
  const { path } = useRouter();
  useEffect(() => setDrawer(false), [path]);
  useEffect(() => {
    if (!drawer) return;
    const k = (e) => e.key === 'Escape' && setDrawer(false);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [drawer]);
  const remaining = Math.max(0, SHIPPING.freeOver - totals.subtotal);
  const pct = Math.min(100, (totals.subtotal / SHIPPING.freeOver) * 100);
  return (
    <>
      <div className={cx('scrim', drawer && 'show')} onClick={() => setDrawer(false)} />
      <aside className={cx('drawer', drawer && 'open')} aria-hidden={!drawer} aria-label="Shopping bag">
        <div className="drawer-head">
          <h3>Your Bag <span>({cart.reduce((s, l) => s + l.qty, 0)})</span></h3>
          <button className="icon-btn" onClick={() => setDrawer(false)} aria-label="Close bag"><Icon name="close" /></button>
        </div>
        <div className="ship-meter">
          <p>{remaining > 0 ? <>You’re <b>{money(remaining)}</b> away from free US shipping</> : <><Icon name="check" size={16} /> You’ve unlocked <b>free standard shipping</b></>}</p>
          <div className="meter"><span style={{ width: `${pct}%` }} /></div>
        </div>
        <div className="drawer-body">
          {!cart.length && (
            <div className="empty">
              <p className="display-3">Your bag is empty.</p>
              <p className="muted">Start with a bestseller — or build a full fit in 3D.</p>
              <Button to="/shop" onClick={() => setDrawer(false)}>Shop the edit</Button>
            </div>
          )}
          {cart.map((l) => {
            const p = productById(l.id);
            return (
              <div className="line" key={l.id + l.size}>
                <Link to={`/product/${p.slug}`} className="line-img"><Img src={p.images[0]} alt={p.name} swatch={p.swatch} /></Link>
                <div className="line-info">
                  <b>{p.name}</b>
                  <small>{p.color} · Size {l.size}</small>
                  <div className="qty">
                    <button onClick={() => update(l.id, l.size, l.qty - 1)} aria-label="Decrease"><Icon name="minus" size={14} /></button>
                    <span>{l.qty}</span>
                    <button onClick={() => update(l.id, l.size, l.qty + 1)} aria-label="Increase" disabled={p.sizes.length === 1 && p.badge === 'One of one'}><Icon name="plus" size={14} /></button>
                  </div>
                </div>
                <div className="line-price">
                  {money(p.price * l.qty)}
                  <button className="link-btn" onClick={() => update(l.id, l.size, 0)}>Remove</button>
                </div>
              </div>
            );
          })}
        </div>
        {cart.length > 0 && (
          <div className="drawer-foot">
            <div className="row"><span>Subtotal</span><b>{money(totals.subtotal)}</b></div>
            <p className="muted small">Shipping calculated at checkout · Delivered to US addresses in 10–15 business days</p>
            <Button to="/checkout" className="w100" icon="lock">Secure checkout</Button>
            <button className="link-btn center" onClick={() => setDrawer(false)}>Continue shopping</button>
          </div>
        )}
      </aside>
    </>
  );
}
