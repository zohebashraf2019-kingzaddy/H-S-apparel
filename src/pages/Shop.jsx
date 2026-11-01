import { useMemo, useState, useEffect } from 'react';
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { Link } from '../lib/router.jsx';
import { Img, Icon } from '../components/ui.jsx';
import { cx } from '../lib/utils.js';
import { useStore } from '../lib/store.jsx';

const NEW_IDS = ['hs-103', 'hs-106', 'hs-308', 'hs-104', 'hs-304', 'hs-201', 'hs-109', 'hs-501', 'hs-502', 'hs-107'];

export default function Shop({ cat }) {
  const { bodySaved } = useStore();
  const category = CATEGORIES.find((c) => c.slug === cat);
  const isNew = cat === 'new';
  const base = useMemo(() => {
    if (isNew) return NEW_IDS.map((id) => PRODUCTS.find((p) => p.id === id));
    if (category) return PRODUCTS.filter((p) => p.category === category.slug);
    return PRODUCTS.filter((p) => p.category !== 'women');
  }, [cat]);

  const subs = useMemo(() => [...new Set(base.map((p) => p.sub))], [base]);
  const sizes = useMemo(() => [...new Set(base.flatMap((p) => p.sizes))], [base]);
  const [sub, setSub] = useState('All');
  const [size, setSize] = useState(null);
  const [sort, setSort] = useState('featured');
  useEffect(() => { setSub('All'); setSize(null); }, [cat]);

  const list = useMemo(() => {
    let l = base.filter((p) => (sub === 'All' || p.sub === sub) && (!size || p.sizes.includes(size)));
    if (sort === 'low') l = [...l].sort((a, b) => a.price - b.price);
    if (sort === 'high') l = [...l].sort((a, b) => b.price - a.price);
    if (sort === 'az') l = [...l].sort((a, b) => a.name.localeCompare(b.name));
    return l;
  }, [base, sub, size, sort]);

  const title = isNew ? 'New In' : category ? category.name : 'Shop All Menswear';
  const blurb = isNew ? 'The latest arrivals — quality-checked in Karachi and ready to ship to the US.' : category ? category.blurb : 'Every piece, every category — shipped to all 50 states in 10–15 business days.';
  const img = category?.image || (isNew ? '/img/look-navy-knit-polo.webp' : '/img/look-beige-crest-polo.webp');

  return (
    <div className="shop">
      <header className="shop-hero">
        <Img src={img} alt="" eager />
        <div className="shop-hero-copy">
          <nav className="crumbs"><Link to="/">Home</Link> / <Link to="/shop">Shop</Link>{(category || isNew) && <> / <span>{title}</span></>}</nav>
          <h1 className="display-1">{title}</h1>
          <p>{blurb}</p>
        </div>
      </header>

      <div className="cat-chips">
        <Link to="/shop" className={cx('chip', !cat && 'on')}>All</Link>
        <Link to="/shop/new" className={cx('chip', isNew && 'on')}>New In</Link>
        {CATEGORIES.map((c) => (
          <Link key={c.slug} to={c.soon ? '/women' : `/shop/${c.slug}`} className={cx('chip', cat === c.slug && 'on')}>{c.short}</Link>
        ))}
      </div>

      <div className="toolbar">
        <div className="filters">
          {subs.length > 1 && (
            <div className="fgroup">
              {['All', ...subs].map((s) => (
                <button key={s} className={cx('fchip', sub === s && 'on')} onClick={() => setSub(s)}>{s}</button>
              ))}
            </div>
          )}
          <div className="fgroup sizes">
            <span className="flabel">Size</span>
            {sizes.map((s) => (
              <button key={s} className={cx('fchip sm', size === s && 'on')} onClick={() => setSize(size === s ? null : s)}>{s}</button>
            ))}
          </div>
        </div>
        <div className="sort">
          <span className="muted">{list.length} pieces</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort">
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="az">A–Z</option>
          </select>
        </div>
      </div>

      {!bodySaved && cat !== 'shoes' && (
        <Link to="/fit-studio" className="fit-nudge">
          <Icon name="cube" /> <span><b>Not sure of your size?</b> Build your 3D body in 60 seconds and we’ll highlight your size on every product.</span> <Icon name="arrow" size={18} />
        </Link>
      )}

      <div className="grid-4 shop-grid">
        {list.map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}
      </div>
      {!list.length && <p className="empty-note">No pieces match those filters right now — try another size.</p>}
    </div>
  );
}
