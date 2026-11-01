import { useState } from 'react';
import { Link } from '../lib/router.jsx';
import { CATEGORIES } from '../data/products.js';
import { Logo, Icon } from './ui.jsx';
import { useStore } from '../lib/store.jsx';

export const SOCIAL = {
  ig: 'https://www.instagram.com/hsapparelco',
  fb: 'https://www.facebook.com/hsapparelco',
  wa: 'https://wa.me/923009227425',
};

export default function Footer() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);
  const { notify } = useStore();
  return (
    <footer className="site-footer">
      <div className="ft-news">
        <div>
          <p className="eyebrow">The H&S List</p>
          <h3 className="display-3">New drops, private offers & first access to the women’s launch.</h3>
        </div>
        {done ? (
          <p className="ft-done"><Icon name="check" /> You’re on the list. Welcome to H&S.</p>
        ) : (
          <form className="ft-form" onSubmit={(e) => { e.preventDefault(); if (/\S+@\S+\.\S+/.test(email)) { setDone(true); notify('Subscribed — welcome!'); } }}>
            <input type="email" required placeholder="Your email address" value={email} onChange={(e) => setEmail(e.target.value)} aria-label="Email address" />
            <button className="btn btn-solid">Join</button>
          </form>
        )}
      </div>
      <div className="ft-grid">
        <div className="ft-brand">
          <Logo />
          <p>Karachi’s menswear house since 2011 — premium European high-street pieces, quality-checked and now shipped to customers across the United States.</p>
          <div className="ft-social">
            <a href={SOCIAL.ig} target="_blank" rel="noreferrer" aria-label="Instagram"><Icon name="ig" /></a>
            <a href={SOCIAL.fb} target="_blank" rel="noreferrer" aria-label="Facebook"><Icon name="fb" /></a>
            <a href={SOCIAL.wa} target="_blank" rel="noreferrer" aria-label="WhatsApp"><Icon name="wa" /></a>
          </div>
        </div>
        <div>
          <h4>Shop</h4>
          <Link to="/shop/new">New in</Link>
          {CATEGORIES.map((c) => <Link key={c.slug} to={c.soon ? '/women' : `/shop/${c.slug}`}>{c.short}</Link>)}
        </div>
        <div>
          <h4>Help</h4>
          <Link to="/shipping">Shipping & delivery</Link>
          <Link to="/shipping#returns">Returns & exchanges</Link>
          <Link to="/fit-studio">3D Fit Studio & sizing</Link>
          <Link to="/shipping#faq">FAQ</Link>
          <Link to="/contact">Contact us</Link>
        </div>
        <div>
          <h4>Visit us</h4>
          <p>41-C, Street #2, Phase VII, D.H.A., Karachi 75500</p>
          <p>Bahadurabad · DHA · Gulshan · Johar · N. Nazimabad · Malir Cantt</p>
          <p><a href={SOCIAL.wa} target="_blank" rel="noreferrer">WhatsApp +92 300 9227425</a></p>
          <p><a href="mailto:career@hnsapparel.com">career@hnsapparel.com</a></p>
        </div>
      </div>
      <div className="ft-base">
        <span>© {new Date().getFullYear()} H&S Apparel. All rights reserved.</span>
        <span className="ft-pay"><Icon name="lock" size={14} /> Payments secured by Square · Visa · Mastercard · Amex · Discover</span>
        <span>Ships to US addresses only · Prices in USD</span>
      </div>
      <div className="ft-giant" aria-hidden="true">H<span>&amp;</span>S</div>
    </footer>
  );
}
