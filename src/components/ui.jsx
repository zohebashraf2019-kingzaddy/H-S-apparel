import { useEffect, useState } from 'react';
import { Link } from '../lib/router.jsx';
import { cx } from '../lib/utils.js';

export function Logo({ className, small }) {
  return (
    <span className={cx('logo', small && 'logo-sm', className)} aria-label="H&S Apparel">
      <span className="logo-mark">
        <span className="lH">H</span>
        <span className="lA">&amp;</span>
        <span className="lS">S</span>
        <sup>®</sup>
      </span>
      <span className="logo-word">APPAREL</span>
    </span>
  );
}

const paths = {
  bag: <><path d="M5 8h14l-1.2 12.2a1 1 0 0 1-1 .8H7.2a1 1 0 0 1-1-.8L5 8Z" /><path d="M9 8V6.5a3 3 0 0 1 6 0V8" /></>,
  search: <><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h10" /></>,
  close: <><path d="M6 6l12 12M18 6 6 18" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  minus: <><path d="M5 12h14" /></>,
  truck: <><path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" /><circle cx="7" cy="17.5" r="1.7" /><circle cx="17.5" cy="17.5" r="1.7" /></>,
  shield: <><path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>,
  cube: <><path d="M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Z" /><path d="M4 7.5 12 12l8-4.5M12 12v9" /></>,
  ruler: <><path d="M3 16 16 3l5 5L8 21l-5-5Z" /><path d="m7 12 2 2M10 9l2 2M13 6l2 2" /></>,
  chat: <><path d="M4 5h16v11H9l-5 4V5Z" /></>,
  check: <><path d="m5 12 4.5 4.5L19 7" /></>,
  star: <><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3Z" /></>,
  ig: <><rect x="3.5" y="3.5" width="17" height="17" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.2" cy="6.8" r=".8" fill="currentColor" /></>,
  fb: <><path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8Z" /></>,
  wa: <><path d="M4 20l1.3-4.2A8 8 0 1 1 8.4 19L4 20Z" /><path d="M9 9c0 3 2.5 6 6 6l1-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2L9 9Z" /></>,
  lock: <><rect x="5" y="10" width="14" height="10" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  globe: <><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.5 2.6 3.5 5.4 3.5 8.5s-1 5.9-3.5 8.5c-2.5-2.6-3.5-5.4-3.5-8.5s1-5.9 3.5-8.5Z" /></>,
  rotate: <><path d="M20 12a8 8 0 1 1-2.3-5.7" /><path d="M20 4v4h-4" /></>,
  heart: <><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10Z" /></>,
};
export function Icon({ name, size = 20, className, stroke = 1.6 }) {
  return (
    <svg className={cx('ico', className)} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

/** Image that degrades to an elegant swatch tile if the remote file can't load. */
export function Img({ src, alt, swatch = '#2a2724', className, label, eager }) {
  const [bad, setBad] = useState(false);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { setBad(false); setLoaded(false); }, [src]);
  if (bad || !src)
    return (
      <div className={cx('img-fallback', className)} style={{ '--sw': swatch }} role="img" aria-label={alt}>
        <span>{label || alt}</span>
      </div>
    );
  return (
    <img
      src={src}
      alt={alt}
      className={cx(className, 'fade-img', loaded && 'is-loaded')}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onLoad={() => setLoaded(true)}
      onError={() => setBad(true)}
    />
  );
}

export function Button({ to, children, variant = 'solid', className, icon = 'arrow', ...rest }) {
  const inner = (
    <>
      <span className="btn-label">{children}</span>
      {icon && <Icon name={icon} size={18} />}
    </>
  );
  const cls = cx('btn', `btn-${variant}`, className);
  return to ? <Link to={to} className={cls} {...rest}>{inner}</Link> : <button className={cls} {...rest}>{inner}</button>;
}

export function Modal({ open, onClose, children, title, wide }) {
  useEffect(() => {
    if (!open) return;
    const k = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', k);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', k); document.body.style.overflow = ''; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className={cx('modal', wide && 'modal-wide')} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><Icon name="close" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function Marquee({ items, className, speed = 40 }) {
  const row = [...items, ...items];
  return (
    <div className={cx('marquee', className)} style={{ '--speed': `${speed}s` }}>
      <div className="marquee-track">
        {row.map((t, i) => (
          <span key={i} className="marquee-item">{t}<i className="dot" /></span>
        ))}
      </div>
    </div>
  );
}

export function SectionHead({ eyebrow, title, children, align = 'left', action }) {
  return (
    <div className={cx('section-head', `align-${align}`)} data-reveal>
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="display-2">{title}</h2>
        {children && <p className="lede">{children}</p>}
      </div>
      {action}
    </div>
  );
}
