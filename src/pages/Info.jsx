import { useState } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { PRODUCTS } from '../data/products.js';
import { Button, Icon, Img } from '../components/ui.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { SOCIAL } from '../components/Footer.jsx';
import { cx } from '../lib/utils.js';

/* ───────────────────────── CONTACT ───────────────────────── */
export function Contact() {
  const { query } = useRouter();
  const [f, setF] = useState({ name: '', email: '', phone: '', topic: query.get('product') ? 'Product question' : 'Order question', order: '', message: query.get('product') ? `Hi! I have a question about: ${query.get('product')}\n\n` : '', website: '' });
  const [state, setState] = useState('idle');
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!f.name.trim() || !/^\S+@\S+\.\S+$/.test(f.email) || f.message.trim().length < 10) {
      setErr('Please add your name, a valid email and a short message (10+ characters).');
      return;
    }
    setState('sending');
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(f) });
      if (!res.ok && res.status !== 404) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error || 'Could not send your message.');
      }
      setState('sent');
    } catch (e2) {
      setState('idle');
      setErr(e2.message);
    }
  };

  return (
    <div className="contact">
      <div className="contact-intro" data-reveal>
        <p className="eyebrow">Customer care</p>
        <h1 className="display-1">Questions? <em>We’re here.</em></h1>
        <p className="lede">Ask about sizing, exact measurements, an order or delivery to your state. A real person from our team replies within 24 hours.</p>
        <div className="contact-cards">
          <a href={SOCIAL.wa} target="_blank" rel="noreferrer" className="cc"><Icon name="wa" /><span><b>WhatsApp</b>+92 300 9227425</span></a>
          <a href="mailto:career@hnsapparel.com" className="cc"><Icon name="chat" /><span><b>Email</b>career@hnsapparel.com</span></a>
          <a href={SOCIAL.ig} target="_blank" rel="noreferrer" className="cc"><Icon name="ig" /><span><b>Instagram</b>@hsapparelco</span></a>
          <div className="cc"><Icon name="globe" /><span><b>Flagship</b>41-C, Street #2, Phase VII, DHA, Karachi</span></div>
        </div>
      </div>
      <div className="contact-form-wrap" data-reveal>
        {state === 'sent' ? (
          <div className="sent">
            <div className="confirm-check"><Icon name="check" size={36} stroke={2} /></div>
            <h2 className="display-2">Message received.</h2>
            <p className="lede">Thanks, {f.name.split(' ')[0]}. We’ll reply to <b>{f.email}</b> within 24 hours.</p>
            <Button to="/shop">Keep shopping</Button>
          </div>
        ) : (
          <form className="contact-form" onSubmit={submit} noValidate>
            <h2 className="display-3">Send us a message</h2>
            <div className="fields">
              <label className="field half"><span>Full name *</span><input value={f.name} onChange={set('name')} autoComplete="name" /></label>
              <label className="field half"><span>Email *</span><input type="email" value={f.email} onChange={set('email')} autoComplete="email" /></label>
              <label className="field half"><span>Phone (optional)</span><input type="tel" value={f.phone} onChange={set('phone')} autoComplete="tel" /></label>
              <label className="field half"><span>Topic</span>
                <select value={f.topic} onChange={set('topic')}>
                  {['Order question', 'Product question', 'Sizing & fit', 'Shipping & delivery', 'Returns & exchanges', 'Wholesale / partnership', 'Something else'].map((t) => <option key={t}>{t}</option>)}
                </select>
              </label>
              <label className="field"><span>Order number (if you have one)</span><input value={f.order} onChange={set('order')} placeholder="HS-XXXXXX" /></label>
              <label className="field"><span>Message *</span><textarea rows={6} value={f.message} onChange={set('message')} placeholder="How can we help?" /></label>
              <input className="hp" tabIndex={-1} autoComplete="off" value={f.website} onChange={set('website')} aria-hidden="true" />
            </div>
            {err && <p className="pay-err">{err}</p>}
            <Button className="w100" disabled={state === 'sending'}>{state === 'sending' ? 'Sending…' : 'Send message'}</Button>
          </form>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────── WOMEN ───────────────────────── */
export function Women() {
  const [email, setEmail] = useState('');
  const [joined, setJoined] = useState(false);
  const preview = PRODUCTS.filter((p) => p.category === 'women');
  return (
    <div className="women">
      <section className="women-hero">
        <video src="/video/women-teaser.mp4" poster="/video/women-poster.jpg" autoPlay muted loop playsInline />
        <div className="wh-copy">
          <p className="eyebrow light">H&S Woman · Coming soon</p>
          <h1 className="display-xl">A new chapter <em>begins.</em></h1>
          <p>We’ve spent years earning your trust in men’s fashion. Now, we’re bringing the same commitment to quality, style and attention to detail to women.</p>
          <p className="wt-sig">This is only the beginning.</p>
          {joined ? (
            <p className="ft-done light"><Icon name="check" /> You’re on the list — first access is yours.</p>
          ) : (
            <form className="ft-form light" onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(email)) setJoined(true); }}>
              <input type="email" required placeholder="Email for early access" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email" />
              <button className="btn btn-light">Join waitlist</button>
            </form>
          )}
        </div>
      </section>
      <section className="women-strip">
        {['women-dress', 'women-ruffle', 'women-back'].map((f, i) => (
          <div key={f} className="ws" data-reveal style={{ '--d': `${i * 90}ms` }}><Img src={`/img/${f}.webp`} alt="H&S Woman preview" /></div>
        ))}
      </section>
      <section className="section">
        <div className="section-head" data-reveal><div><p className="eyebrow">Available now</p><h2 className="display-2">The first <em>drop preview.</em></h2><p className="lede">Two one-of-one pieces, ready to ship to the US today.</p></div></div>
        <div className="grid-4">{preview.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>
    </div>
  );
}

/* ───────────────────────── ABOUT ───────────────────────── */
export function About() {
  return (
    <div className="about">
      <section className="about-hero">
        <p className="eyebrow" data-reveal>Our story</p>
        <h1 className="display-xl" data-reveal>From one small room <em>to six stores</em> — and now, America.</h1>
      </section>
      <section className="about-split">
        <div data-reveal><Img src="/img/look-camel-tee.webp" alt="H&S Apparel store" /></div>
        <div className="about-text" data-reveal>
          <p className="lede">What started in a small room in 2011 is now Karachi’s top choice for men’s fashion — built with passion, hard work and a commitment to quality.</p>
          <p>For more than a decade we’ve brought premium European high-street brands to our customers at unbeatable prices: casual shirts, denim, polos, graphic tees, seasonal outerwear, sneakers and fragrances. Today H&S has six stores across Karachi — Bahadurabad, DHA Phase VII, Gulshan-e-Iqbal, Gulistan-e-Johar, North Nazimabad and Malir Cantt — and a community of more than 96,000 people on Instagram.</p>
          <p>So many of our customers have family in the United States. This store exists for them: the same hand-picked edit, priced in dollars, quality-checked by our team in Karachi and shipped to all 50 states in 10–15 business days.</p>
          <div className="stats">
            <div><b>2011</b><span>Founded</span></div>
            <div><b>6</b><span>Karachi stores</span></div>
            <div><b>96K+</b><span>Followers</span></div>
          </div>
        </div>
      </section>
      <section className="values">
        {[
          ['Actual items', 'The photos on every listing are of the real piece, shot in our own stores.'],
          ['Condition checked', 'Each item is inspected, steamed and packed by hand before it ships.'],
          ['Fit measured', 'Measured garments plus our 3D Fit Studio, so you order the right size first time.'],
          ['Human support', 'Real people on WhatsApp, email and our contact form — no bots.'],
        ].map(([t, d], i) => (
          <div key={t} data-reveal style={{ '--d': `${i * 80}ms` }}><span className="how-n">0{i + 1}</span><h3>{t}</h3><p>{d}</p></div>
        ))}
      </section>
      <div className="center-row pad-b"><Button to="/shop">Shop the edit</Button></div>
    </div>
  );
}

/* ───────────────────────── SHIPPING / RETURNS / FAQ ───────────────────────── */
const FAQ = [
  ['Where do you ship?', 'We currently deliver to addresses in all 50 US states and Washington, DC. Customers in Pakistan (or anywhere) can order and pay by card for delivery to a US address — perfect for gifts.'],
  ['How long does delivery take?', 'Orders are quality-checked and dispatched from Karachi within 1–2 business days. Standard shipping arrives in 10–15 business days; Express Priority in 6–9 business days. You’ll get tracking by email.'],
  ['How much is shipping?', 'Standard shipping is $9.95 and free on orders over $99. Express Priority is $24.95.'],
  ['Will I pay customs or import fees?', 'Import duties on US orders are prepaid by H&S, so nothing extra is due at your door.'],
  ['Which payment methods do you accept?', 'All major credit and debit cards — Visa, Mastercard, American Express and Discover — processed securely by Square. International cards, including cards issued in Pakistan, are charged in USD.'],
  ['How do I choose my size?', 'Use the size guide on each product, or build your body in our free 3D Fit Studio. Once you save your measurements we mark your recommended size on every product.'],
  ['Are “One of one” pieces authentic?', 'Yes. Branded one-of-one pieces are inspected by our team and photographed as the exact item you receive.'],
  ['Can I change or cancel my order?', 'Message us within 12 hours of ordering and we’ll do our best before it ships.'],
];
export function Shipping() {
  const [open, setOpen] = useState(0);
  return (
    <div className="policy">
      <section className="about-hero">
        <p className="eyebrow">Help center</p>
        <h1 className="display-xl">Shipping, returns <em>& answers.</em></h1>
      </section>
      <div className="policy-grid">
        <section id="shipping" className="pcard-box" data-reveal>
          <Icon name="truck" size={30} />
          <h2 className="display-3">Shipping to the USA</h2>
          <table className="size-table">
            <thead><tr><th>Method</th><th>Delivery</th><th>Cost</th></tr></thead>
            <tbody>
              <tr><td>Standard International</td><td>10–15 business days</td><td>$9.95 · Free over $99</td></tr>
              <tr><td>Express Priority</td><td>6–9 business days</td><td>$24.95</td></tr>
            </tbody>
          </table>
          <p>Orders are packed in Karachi within 1–2 business days. Delivery times are counted from dispatch. US addresses only (50 states + DC).</p>
        </section>
        <section id="returns" className="pcard-box" data-reveal>
          <Icon name="rotate" size={30} />
          <h2 className="display-3">Returns & exchanges</h2>
          <p>Request a return within <b>14 days of delivery</b>. Items must be unworn with tags. We offer a free size exchange or full store credit; refunds to your original card are available for faulty or incorrect items.</p>
          <p>To start, <Link to="/contact">contact us</Link> with your order number and we’ll send return instructions.</p>
        </section>
      </div>
      <section id="faq" className="faq" data-reveal>
        <h2 className="display-2">Frequently asked</h2>
        {FAQ.map(([q, a], i) => (
          <div key={q} className={cx('acc', open === i && 'open')}>
            <button onClick={() => setOpen(open === i ? -1 : i)} aria-expanded={open === i}>{q}<Icon name="plus" size={16} /></button>
            <div className="acc-body"><div><p>{a}</p></div></div>
          </div>
        ))}
      </section>
    </div>
  );
}
