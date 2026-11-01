import { useEffect, useState, useMemo } from 'react';
import { Link, useRouter } from '../lib/router.jsx';
import { useStore } from '../lib/store.jsx';
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import { Logo, Icon, Marquee, Img } from './ui.jsx';
import { cx, money } from '../lib/utils.js';

export default function Header() {
  const { count, setDrawer } = useStore();
  const { path } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menu, setMenu] = useState(false);
  const [mega, setMega] = useState(false);
  const [search, setSearch] = useState(false);
  const [bump, setBump] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);
  useEffect(() => { setMenu(false); setMega(false); setSearch(false); }, [path]);
  useEffect(() => {
    if (!count) return;
    setBump(true);
    const t = setTimeout(() => setBump(false), 500);
    return () => clearTimeout(t);
  }, [count]);

  const overHero = path === '/' && !scrolled;

  return (
    <>
      <div className="announce">
        <Marquee speed={38} items={['Now shipping to all 50 states', 'Delivered in 10–15 business days', 'Free standard shipping over $99', 'Secure checkout by Square', 'Karachi’s menswear house since 2011', 'Try every fit in 3D before you buy']} />
      </div>
      <header className={cx('site-header', scrolled && 'is-scrolled', overHero && 'is-over')} onMouseLeave={() => setMega(false)}>
        <div className="hdr-inner">
          <button className="icon-btn only-mobile" aria-label="Open menu" onClick={() => setMenu(true)}><Icon name="menu" /></button>
          <nav className="hdr-nav only-desktop" aria-label="Primary">
            <button className={cx('nav-link', mega && 'on')} onMouseEnter={() => setMega(true)} onClick={() => setMega((m) => !m)}>Shop</button>
            <Link className="nav-link" to="/shop/new">New In</Link>
            <Link className="nav-link" to="/fit-studio">3D Fit Studio <em className="pill">Free</em></Link>
            <Link className="nav-link" to="/women">Women <em className="pill pill-red">Soon</em></Link>
          </nav>
          <Link to="/" className="hdr-logo" aria-label="H&S Apparel home"><Logo /></Link>
          <div className="hdr-actions">
            <Link className="nav-link only-desktop" to="/about">Our Story</Link>
            <Link className="nav-link only-desktop" to="/contact">Contact</Link>
            <button className="icon-btn" aria-label="Search" onClick={() => setSearch(true)}><Icon name="search" /></button>
            <button className={cx('icon-btn bag-btn', bump && 'bump')} aria-label={`Bag, ${count} items`} onClick={() => setDrawer(true)}>
              <Icon name="bag" />
              {count > 0 && <span className="bag-count">{count}</span>}
            </button>
          </div>
        </div>
        <div className={cx('mega', mega && 'open')} onMouseEnter={() => setMega(true)}>
          <div className="mega-inner">
            <div className="mega-links">
              <p className="eyebrow">Departments</p>
              {CATEGORIES.map((c) => (
                <Link key={c.slug} to={c.soon ? '/women' : `/shop/${c.slug}`} className="mega-link">
                  {c.name} {c.soon && <em className="pill pill-red">Soon</em>}
                </Link>
              ))}
              <Link to="/shop" className="mega-link all">Shop everything <Icon name="arrow" size={16} /></Link>
            </div>
            <div className="mega-tiles">
              {CATEGORIES.slice(0, 3).map((c) => (
                <Link key={c.slug} to={`/shop/${c.slug}`} className="mega-tile">
                  <Img src={c.image} alt={c.name} />
                  <span>{c.short}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </header>

      <div className={cx('mobile-menu', menu && 'open')} aria-hidden={!menu}>
        <div className="mm-head">
          <Logo small />
          <button className="icon-btn" aria-label="Close menu" onClick={() => setMenu(false)}><Icon name="close" /></button>
        </div>
        <nav className="mm-nav">
          <Link to="/shop">Shop all</Link>
          <Link to="/shop/new">New in</Link>
          {CATEGORIES.map((c) => (
            <Link key={c.slug} to={c.soon ? '/women' : `/shop/${c.slug}`}>{c.name}{c.soon && <em className="pill pill-red">Soon</em>}</Link>
          ))}
          <Link to="/fit-studio">3D Fit Studio <em className="pill">Free</em></Link>
          <Link to="/about">Our story</Link>
          <Link to="/shipping">Shipping & returns</Link>
          <Link to="/contact">Contact us</Link>
        </nav>
        <p className="mm-foot">Shipping to all 50 US states · 10–15 business days</p>
      </div>
      {menu && <div className="scrim show mm-scrim" onClick={() => setMenu(false)} />}
      {search && <SearchOverlay onClose={() => setSearch(false)} />}
    </>
  );
}

function SearchOverlay({ onClose }) {
  const [q, setQ] = useState('');
  const { navigate } = useRouter();
  useEffect(() => {
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [onClose]);
  const results = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return PRODUCTS.filter((p) => p.badge === 'Bestseller' || p.badge === 'New').slice(0, 6);
    return PRODUCTS.filter((p) => `${p.name} ${p.color} ${p.brand} ${p.sub} ${p.category}`.toLowerCase().includes(t)).slice(0, 8);
  }, [q]);
  return (
    <div className="search-ov" onClick={onClose}>
      <div className="search-box" onClick={(e) => e.stopPropagation()}>
        <div className="search-input">
          <Icon name="search" />
          <input autoFocus placeholder="Search polos, jeans, oxford…" value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && results[0] && navigate(`/product/${results[0].slug}`)} />
          <button className="icon-btn" onClick={onClose} aria-label="Close search"><Icon name="close" /></button>
        </div>
        <p className="eyebrow">{q ? `${results.length} results` : 'Trending now'}</p>
        <div className="search-results">
          {results.map((p) => (
            <Link key={p.id} to={`/product/${p.slug}`} className="sr-item">
              <Img src={p.images[0]} alt={p.name} swatch={p.swatch} />
              <span><b>{p.name}</b><small>{p.color} · {money(p.price)}</small></span>
            </Link>
          ))}
          {!results.length && <p className="muted">Nothing found — try “polo”, “denim” or “chino”.</p>}
        </div>
      </div>
    </div>
  );
}
