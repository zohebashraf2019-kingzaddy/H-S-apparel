import { useEffect, useRef, useState } from 'react';
import { useStore } from '../lib/store.jsx';
import { Link, useRouter } from '../lib/router.jsx';
import { productById, SHIPPING } from '../data/products.js';
import { money, deliveryWindow, cx, safeStore } from '../lib/utils.js';
import { loadSquare, squareConfigured, SQUARE, US_STATES } from '../lib/square.js';
import { Img, Icon, Button, Logo } from '../components/ui.jsx';

const blank = { email: '', phone: '', first: '', last: '', address1: '', address2: '', city: '', state: '', zip: '', payerCountry: 'US', gift: false, giftNote: '', news: true };

export default function Checkout() {
  const { cart, totals, shipMethod, setShipMethod, clear } = useStore();
  const { navigate } = useRouter();
  const [f, setF] = useState(() => ({ ...blank, ...safeStore.get('hs_checkout', {}) }));
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [payErr, setPayErr] = useState('');
  const [cardReady, setCardReady] = useState(false);
  const [demoCard, setDemoCard] = useState({ num: '', exp: '', cvc: '', zip: '' });
  const cardRef = useRef(null);
  const payments = useRef(null);

  useEffect(() => {
    const { gift, giftNote, ...keep } = f;
    safeStore.set('hs_checkout', { ...keep, payerCountry: f.payerCountry });
  }, [f]);

  // Attach the Square card form.
  useEffect(() => {
    if (!squareConfigured || !cart.length) return;
    let card;
    let cancelled = false;
    (async () => {
      try {
        const Square = await loadSquare();
        payments.current = Square.payments(SQUARE.appId, SQUARE.locationId);
        card = await payments.current.card({
          style: {
            '.input-container': { borderColor: '#d9d2c5', borderRadius: '10px' },
            '.input-container.is-focus': { borderColor: '#0e0d0c' },
            '.message-text': { color: '#6b645b' },
            input: { fontSize: '15px', color: '#0e0d0c' },
          },
        });
        if (cancelled) return;
        await card.attach('#sq-card');
        cardRef.current = card;
        setCardReady(true);
      } catch (e) {
        console.error(e);
        setPayErr('The secure card form could not load. Please refresh the page or contact us.');
      }
    })();
    return () => { cancelled = true; card?.destroy?.(); };
  }, [cart.length]);

  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const validate = () => {
    const e = {};
    if (!/^\S+@\S+\.\S+$/.test(f.email)) e.email = 'Enter a valid email';
    if (f.phone.replace(/\D/g, '').length < 10) e.phone = 'Enter a phone number for the courier';
    if (!f.first.trim()) e.first = 'Required';
    if (!f.last.trim()) e.last = 'Required';
    if (f.address1.trim().length < 4) e.address1 = 'Enter a street address';
    if (!f.city.trim()) e.city = 'Required';
    if (!f.state) e.state = 'Choose a state';
    if (!/^\d{5}(-\d{4})?$/.test(f.zip.trim())) e.zip = 'Enter a 5-digit US ZIP';
    if (!squareConfigured) {
      if (demoCard.num.replace(/\D/g, '').length < 15) e.card = 'Enter a card number (demo: 4111 1111 1111 1111)';
    }
    setErrors(e);
    if (Object.keys(e).length) document.querySelector('.field.has-err, .demo-card.has-err')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return !Object.keys(e).length;
  };

  const placeOrder = async (ev) => {
    ev.preventDefault();
    setPayErr('');
    if (!validate()) return;
    setBusy(true);
    try {
      let sourceId = 'demo-nonce';
      if (squareConfigured) {
        const result = await cardRef.current.tokenize({
          amount: totals.total.toFixed(2),
          currencyCode: 'USD',
          intent: 'CHARGE',
          customerInitiated: true,
          sellerKeyedIn: false,
          billingContact: { givenName: f.first, familyName: f.last, email: f.email, phone: f.phone, countryCode: f.payerCountry === 'PK' ? 'PK' : 'US' },
        });
        if (result.status !== 'OK') throw new Error(result.errors?.[0]?.message || 'Card could not be verified.');
        sourceId = result.token;
      }
      const payload = {
        sourceId,
        items: cart.map(({ id, size, qty }) => ({ id, size, qty })),
        shippingMethod: shipMethod,
        customer: { email: f.email, phone: f.phone, first: f.first, last: f.last, payerCountry: f.payerCountry, newsletter: f.news },
        address: { address1: f.address1, address2: f.address2, city: f.city, state: f.state, zip: f.zip, country: 'US' },
        gift: f.gift ? f.giftNote : '',
      };
      let data;
      try {
        const res = await fetch('/api/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        data = await res.json().catch(() => null);
        if (!res.ok && data?.error) throw new Error(data.error);
        if (!res.ok) throw Object.assign(new Error('offline'), { offline: true });
      } catch (e) {
        // Local preview without the API: fall back to a demo order (never in Square mode).
        if (!e.offline || squareConfigured) throw e;
        data = { ok: true, demo: true, orderId: 'HS-' + Math.random().toString(36).slice(2, 8).toUpperCase() };
      }
      const order = {
        id: data.orderId,
        demo: !!data.demo,
        receiptUrl: data.receiptUrl,
        placedAt: new Date().toISOString(),
        lines: totals.lines,
        subtotal: totals.subtotal,
        shipping: totals.shipping,
        total: totals.total,
        method: totals.method,
        name: `${f.first} ${f.last}`,
        email: f.email,
        address: `${f.address1}${f.address2 ? ', ' + f.address2 : ''}, ${f.city}, ${f.state} ${f.zip}`,
      };
      safeStore.set('hs_last_order', order);
      clear();
      navigate(`/order/${order.id}`);
    } catch (e) {
      setPayErr(e.message || 'Payment failed. Please check your card details and try again.');
    } finally {
      setBusy(false);
    }
  };

  if (!cart.length)
    return (
      <div className="checkout-empty">
        <h1 className="display-1">Your bag is empty.</h1>
        <p className="lede">Add a few pieces and come back to check out.</p>
        <Button to="/shop">Shop the edit</Button>
      </div>
    );

  const Field = ({ k, label, type = 'text', auto, half, ...rest }) => (
    <label className={cx('field', half && 'half', errors[k] && 'has-err')}>
      <span>{label}</span>
      <input type={type} value={f[k]} onChange={set(k)} autoComplete={auto} {...rest} />
      {errors[k] && <em>{errors[k]}</em>}
    </label>
  );

  return (
    <div className="checkout">
      <div className="co-top">
        <Link to="/"><Logo small /></Link>
        <span className="co-secure"><Icon name="lock" size={16} /> Secure checkout</span>
      </div>
      <form className="co-grid" onSubmit={placeOrder} noValidate>
        <div className="co-main">
          <section className="co-sec">
            <h2><span>1</span> Contact</h2>
            <div className="fields">
              {Field({ k: 'email', label: 'Email (for your receipt & tracking)', type: 'email', auto: 'email' })}
              {Field({ k: 'phone', label: 'Phone (for the courier)', type: 'tel', auto: 'tel', placeholder: '(555) 123-4567' })}
              <label className="check"><input type="checkbox" checked={f.news} onChange={set('news')} /> Email me new drops & private offers</label>
            </div>
          </section>

          <section className="co-sec">
            <h2><span>2</span> US delivery address</h2>
            <p className="note"><Icon name="truck" size={16} /> We currently ship to addresses in the United States only — including gifts sent from Pakistan.</p>
            <div className="fields">
              {Field({ k: 'first', label: 'First name', auto: 'given-name', half: true })}
              {Field({ k: 'last', label: 'Last name', auto: 'family-name', half: true })}
              {Field({ k: 'address1', label: 'Street address', auto: 'address-line1' })}
              {Field({ k: 'address2', label: 'Apt, suite, unit (optional)', auto: 'address-line2' })}
              {Field({ k: 'city', label: 'City', auto: 'address-level2', half: true })}
              <label className={cx('field', 'quarter', errors.state && 'has-err')}>
                <span>State</span>
                <select value={f.state} onChange={set('state')} autoComplete="address-level1">
                  <option value="">—</option>
                  {US_STATES.map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                </select>
                {errors.state && <em>{errors.state}</em>}
              </label>
              <label className={cx('field', 'quarter', errors.zip && 'has-err')}>
                <span>ZIP code</span>
                <input value={f.zip} onChange={set('zip')} inputMode="numeric" autoComplete="postal-code" maxLength={10} />
                {errors.zip && <em>{errors.zip}</em>}
              </label>
              <label className="field"><span>Country</span><input value="United States" disabled /></label>
              <label className="check"><input type="checkbox" checked={f.gift} onChange={set('gift')} /> This is a gift — add a note and hide prices on the packing slip</label>
              {f.gift && (
                <label className="field"><span>Gift note</span><textarea rows={2} maxLength={240} value={f.giftNote} onChange={set('giftNote')} placeholder="Happy birthday bhai! Love from Karachi." /></label>
              )}
            </div>
          </section>

          <section className="co-sec">
            <h2><span>3</span> Shipping speed</h2>
            <div className="ship-opts">
              {SHIPPING.methods.map((m) => {
                const free = m.id === 'standard' && totals.subtotal >= SHIPPING.freeOver;
                return (
                  <label key={m.id} className={cx('ship-opt', shipMethod === m.id && 'on')}>
                    <input type="radio" name="ship" checked={shipMethod === m.id} onChange={() => setShipMethod(m.id)} />
                    <span className="so-main"><b>{m.name}</b><small>{m.days[0]}–{m.days[1]} business days · arrives {deliveryWindow(m.days)}</small><small>{m.note}</small></span>
                    <span className="so-price">{free ? 'Free' : money(m.price)}</span>
                  </label>
                );
              })}
            </div>
          </section>

          <section className="co-sec">
            <h2><span>4</span> Payment</h2>
            <label className="field">
              <span>Paying from</span>
              <select value={f.payerCountry} onChange={set('payerCountry')}>
                <option value="US">United States card</option>
                <option value="PK">Pakistan card (Visa / Mastercard)</option>
                <option value="OTHER">Another country</option>
              </select>
            </label>
            {f.payerCountry === 'PK' && <p className="note"><Icon name="globe" size={16} /> International cards are charged in USD. Make sure your bank has international online payments enabled.</p>}
            {squareConfigured ? (
              <div className="sq-wrap">
                <div id="sq-card" />
                {!cardReady && !payErr && <p className="muted small">Loading secure card form…</p>}
              </div>
            ) : (
              <div className={cx('demo-card', errors.card && 'has-err')}>
                <div className="demo-flag">Demo mode — Square isn’t connected yet, no real charge</div>
                <input placeholder="Card number" inputMode="numeric" value={demoCard.num} onChange={(e) => setDemoCard({ ...demoCard, num: e.target.value.replace(/[^\d ]/g, '').slice(0, 19) })} />
                <div className="demo-row">
                  <input placeholder="MM / YY" value={demoCard.exp} onChange={(e) => setDemoCard({ ...demoCard, exp: e.target.value.slice(0, 7) })} />
                  <input placeholder="CVV" value={demoCard.cvc} onChange={(e) => setDemoCard({ ...demoCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })} />
                  <input placeholder="ZIP" value={demoCard.zip} onChange={(e) => setDemoCard({ ...demoCard, zip: e.target.value.slice(0, 10) })} />
                </div>
                {errors.card && <em>{errors.card}</em>}
              </div>
            )}
            <p className="pay-logos"><Icon name="lock" size={14} /> Processed by Square · PCI-DSS compliant · We never see or store your card number</p>
            {payErr && <p className="pay-err">{payErr}</p>}
          </section>

          <Button className="w100 place" icon={busy ? null : 'lock'} disabled={busy || (squareConfigured && !cardReady)}>
            {busy ? 'Processing payment…' : `Pay ${money(totals.total)}`}
          </Button>
          <p className="muted small center">By placing your order you agree to our <Link to="/shipping">shipping & returns policy</Link>.</p>
        </div>

        <aside className="co-summary">
          <h3>Order summary</h3>
          <div className="co-lines">
            {cart.map((l) => {
              const p = productById(l.id);
              return (
                <div className="co-line" key={l.id + l.size}>
                  <span className="co-thumb"><Img src={p.images[0]} alt={p.name} swatch={p.swatch} /><i>{l.qty}</i></span>
                  <span className="co-desc"><b>{p.name}</b><small>{p.color} · {l.size}</small></span>
                  <span>{money(p.price * l.qty)}</span>
                </div>
              );
            })}
          </div>
          <div className="co-totals">
            <div><span>Subtotal</span><span>{money(totals.subtotal)}</span></div>
            <div><span>Shipping · {totals.method.name}</span><span>{totals.shipping ? money(totals.shipping) : 'Free'}</span></div>
            <div className="grand"><span>Total</span><span><small>USD</small> {money(totals.total)}</span></div>
          </div>
          <div className="co-promise">
            <p><Icon name="truck" size={16} /> Estimated delivery <b>{deliveryWindow(totals.method.days)}</b></p>
            <p><Icon name="shield" size={16} /> Every piece quality-checked before it ships</p>
            <p><Icon name="chat" size={16} /> Questions? <Link to="/contact">Message us</Link> — we reply within 24h</p>
          </div>
        </aside>
      </form>
    </div>
  );
}

export function Confirmation({ id }) {
  const order = safeStore.get('hs_last_order', null);
  const ok = order && order.id === id;
  return (
    <div className="confirm">
      <div className="confirm-card" data-reveal>
        <div className="confirm-check"><Icon name="check" size={40} stroke={2} /></div>
        <p className="eyebrow">Order {id}</p>
        <h1 className="display-1">Thank you{ok ? `, ${order.name.split(' ')[0]}` : ''}.</h1>
        <p className="lede">Your order is confirmed. Our Karachi team will quality-check and pack it within 1–2 business days, then email tracking to {ok ? <b>{order.email}</b> : 'you'}.</p>
        {ok && order.demo && <p className="demo-flag">Demo order — no payment was taken. Connect Square to accept real payments.</p>}
        {ok && (
          <div className="confirm-sum">
            {order.lines.map((l) => <div key={l.id + l.size}><span>{l.qty} × {l.name} · {l.size}</span><span>{money(l.total)}</span></div>)}
            <div><span>Shipping ({order.method.name})</span><span>{order.shipping ? money(order.shipping) : 'Free'}</span></div>
            <div className="grand"><span>Total paid</span><span>{money(order.total)}</span></div>
            <p className="muted small">Shipping to: {order.address}</p>
            <p className="muted small">Estimated delivery: <b>{deliveryWindow(order.method.days)}</b></p>
            {order.receiptUrl && <a className="link-btn" href={order.receiptUrl} target="_blank" rel="noreferrer">View Square receipt</a>}
          </div>
        )}
        <div className="confirm-steps">
          <span className="on">Confirmed</span><span>Quality check</span><span>Shipped</span><span>Delivered</span>
        </div>
        <Button to="/shop">Continue shopping</Button>
      </div>
    </div>
  );
}
