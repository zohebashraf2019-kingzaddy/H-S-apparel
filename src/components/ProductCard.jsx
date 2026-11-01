import { useState } from 'react';
import { Link } from '../lib/router.jsx';
import { useStore } from '../lib/store.jsx';
import { money, recommendFor, cx } from '../lib/utils.js';
import { Img, Icon } from './ui.jsx';

export default function ProductCard({ p, i = 0 }) {
  const { add, body, bodySaved, notify } = useStore();
  const [hover, setHover] = useState(false);
  const rec = bodySaved ? recommendFor(p, body) : null;
  const href = `/product/${p.slug}`;
  const single = p.sizes.length === 1;
  return (
    <article className="pcard" data-reveal style={{ '--d': `${(i % 4) * 70}ms` }} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
      <Link to={href} className="pcard-media" aria-label={`${p.name} — ${p.color}`}>
        <Img src={p.images[0]} alt={`${p.name} in ${p.color}`} swatch={p.swatch} label={p.name} />
        {p.images[1] && <Img src={p.images[1]} alt="" swatch={p.swatch} className={cx('pcard-alt', hover && 'on')} />}
        {p.badge && <span className={cx('badge', p.badge === 'One of one' && 'badge-red')}>{p.badge}</span>}
        {p.fit3d && <span className="pcard-3d"><Icon name="cube" size={14} /> 3D try-on</span>}
      </Link>
      <div className="pcard-quick">
        {p.category === 'women' ? null : single ? (
          <button className="qsize wide" onClick={() => { add(p.id, p.sizes[0]); notify(`Added ${p.name}`); }}>Add to bag · {p.sizes[0]}</button>
        ) : (
          p.sizes.map((s) => (
            <button key={s} className={cx('qsize', rec === s && 'rec')} onClick={() => { add(p.id, s); notify(`Added ${p.name} · ${s}`); }} title={rec === s ? 'Your recommended size' : `Add size ${s}`}>
              {s}
            </button>
          ))
        )}
      </div>
      <Link to={href} className="pcard-info">
        <span className="pcard-brand">{p.brand}</span>
        <h3 className="pcard-name">{p.name}</h3>
        <span className="pcard-color"><i style={{ background: p.swatch }} />{p.color}</span>
        <span className="pcard-price">
          {money(p.price)} {p.compareAt && <s>{money(p.compareAt)}</s>}
        </span>
      </Link>
    </article>
  );
}
