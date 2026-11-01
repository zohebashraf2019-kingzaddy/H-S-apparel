import { useEffect, useRef } from 'react';
import { Link } from '../lib/router.jsx';
import { CATEGORIES, PRODUCTS } from '../data/products.js';
import ProductCard from '../components/ProductCard.jsx';
import { Button, Icon, Img, Marquee, SectionHead } from '../components/ui.jsx';
import { SOCIAL } from '../components/Footer.jsx';

const NEW_IN = ['hs-103', 'hs-106', 'hs-308', 'hs-104', 'hs-304', 'hs-201', 'hs-109', 'hs-501'];
const BEST = ['hs-101', 'hs-301', 'hs-201', 'hs-102'];
const pick = (ids) => ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter(Boolean);

function SplitTitle({ lines }) {
  let n = 0;
  return (
    <h1 className="hero-title">
      {lines.map((line, li) => (
        <span className="hero-line" key={li}>
          {line.split(' ').map((w, wi) => (
            <span key={wi}>
              {wi > 0 && ' '}
              <span className="word">
                <span style={{ '--i': n++ }} className={w.startsWith('*') ? 'it' : ''}>{w.replace('*', '')}</span>
              </span>
            </span>
          ))}
        </span>
      ))}
    </h1>
  );
}

function Rail({ items }) {
  const ref = useRef(null);
  const go = (d) => ref.current?.scrollBy({ left: d * ref.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="rail-wrap">
      <div className="rail" ref={ref}>
        {items.map((p, i) => <div className="rail-cell" key={p.id}><ProductCard p={p} i={i} /></div>)}
      </div>
      <div className="rail-ctrl">
        <button className="icon-btn ring" onClick={() => go(-1)} aria-label="Previous"><Icon name="arrow" className="flip" /></button>
        <button className="icon-btn ring" onClick={() => go(1)} aria-label="Next"><Icon name="arrow" /></button>
      </div>
    </div>
  );
}

export default function Home() {
  const heroRef = useRef(null);
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const on = () => {
      const y = Math.min(window.scrollY, 900);
      el.style.setProperty('--sy', y);
    };
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  return (
    <div className="home">
      {/* ───────────── HERO ───────────── */}
      <section className="hero" ref={heroRef}>
        <div className="hero-bgword" aria-hidden="true">H<i>&amp;</i>S</div>
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow hero-eyebrow"><span className="live-dot" /> Karachi · Est. 2011 — now shipping to the USA</p>
            <SplitTitle lines={['Dressed in Karachi.', '*Delivered to America.']} />
            <p className="hero-sub">Premium polos, oxfords, denim and chinos from Karachi’s favorite menswear house — hand-checked, priced in dollars and at your door in <b>10–15 business days</b>.</p>
            <div className="hero-ctas">
              <Button to="/shop">Shop the edit</Button>
              <Button to="/fit-studio" variant="ghost" icon="cube">Try it on in 3D</Button>
            </div>
            <ul className="hero-trust">
              <li><Icon name="truck" size={18} /> All 50 states</li>
              <li><Icon name="lock" size={18} /> Square secure checkout</li>
              <li><Icon name="ruler" size={18} /> Free 3D fit preview</li>
            </ul>
          </div>
          <div className="hero-media">
            <div className="hero-video">
              <video src="/video/men-fit.mp4" poster="/video/men-fit-poster.jpg" autoPlay muted loop playsInline />
              <span className="hero-tag">The Fit of the Week</span>
            </div>
            <Link to="/product/crest-pique-polo-sand" className="hero-float hf-1">
              <Img src="/img/look-beige-crest-polo.webp" alt="Crest Piqué Polo" eager />
              <span><small>New</small>Crest Piqué Polo · $36</span>
            </Link>
            <div className="hero-float hf-2">
              <b>10–15</b>
              <span>business days<br />Karachi → your door</span>
            </div>
          </div>
        </div>
        <a href="#departments" className="scroll-cue" aria-label="Scroll"><span /></a>
      </section>

      <Marquee className="marquee-serif" speed={50} items={['Piqué Polos', 'Oxford Shirts', 'Straight Denim', 'Slim Chinos', 'Oversized Tees', 'Co-ord Sets', 'Sneakers']} />

      {/* ───────────── DEPARTMENTS ───────────── */}
      <section className="section" id="departments">
        <SectionHead eyebrow="Shop by department" title={<>Find your <em>next rotation.</em></>} action={<Button to="/shop" variant="link">View everything</Button>} />
        <div className="cat-grid">
          {CATEGORIES.map((c, i) => (
            <Link key={c.slug} to={c.soon ? '/women' : `/shop/${c.slug}`} className={`cat-tile ct-${i}`} data-reveal style={{ '--d': `${i * 60}ms` }}>
              <Img src={c.image} alt={c.name} />
              <div className="cat-copy">
                <span className="cat-num">0{i + 1}</span>
                <h3>{c.short} {c.soon && <em className="pill pill-red">Coming soon</em>}</h3>
                <p>{c.blurb}</p>
                <span className="cat-go"><Icon name="arrow" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ───────────── NEW IN ───────────── */}
      <section className="section section-tight">
        <SectionHead eyebrow="Just landed" title={<>New in <em>this week.</em></>} action={<Button to="/shop/new" variant="link">Shop new in</Button>}>
          Hand-picked, quality-checked and ready to ship to the US.
        </SectionHead>
        <Rail items={pick(NEW_IN)} />
      </section>

      {/* ───────────── FIT STUDIO PROMO ───────────── */}
      <section className="fit-promo">
        <div className="fit-promo-copy" data-reveal>
          <p className="eyebrow">New · Free for every customer</p>
          <h2 className="display-1">See the fit <em>before</em> you buy.</h2>
          <p className="lede">Enter your height, chest, waist and inseam and our 3D Fit Studio builds a mannequin to your measurements. Dress it in any piece — adjust sleeve length, rise and leg — and get your recommended size instantly.</p>
          <ul className="ticks">
            <li><Icon name="check" size={18} /> Your body, to the inch</li>
            <li><Icon name="check" size={18} /> Short, elbow & long sleeve previews</li>
            <li><Icon name="check" size={18} /> Low, mid & high rise · shorts to full length</li>
            <li><Icon name="check" size={18} /> Size recommendation saved to every product</li>
          </ul>
          <Button to="/fit-studio" icon="cube">Open the 3D Fit Studio</Button>
        </div>
        <div className="fit-promo-art" data-reveal aria-hidden="true">
          <svg viewBox="-10 0 330 530" width="330" height="530" className="mannequin-svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <linearGradient id="mg" x1="0" x2="1">
                <stop offset="0" stopColor="#3a3530" /><stop offset=".5" stopColor="#6b6158" /><stop offset="1" stopColor="#2c2824" />
              </linearGradient>
            </defs>
            <g className="ms-body">
              <ellipse cx="150" cy="52" rx="26" ry="32" fill="url(#mg)" />
              <path d="M138 82h24l4 18h-32z" fill="url(#mg)" />
              <path d="M96 104c18-8 36-10 54-10s36 2 54 10l8 70c-6 30-10 56-12 80H100c-2-24-6-50-12-80z" fill="#d6c4a2" className="ms-top" />
              <path d="M96 106l-26 120 14 4 28-96zM204 106l26 120-14 4-28-96z" fill="#d6c4a2" className="ms-top" />
              <path d="M100 254h100l6 236h-40l-16-190-16 190H94z" fill="#35517b" className="ms-bottom" />
            </g>
            <g className="ms-measure">
              <line x1="70" y1="150" x2="230" y2="150" /><text x="236" y="154">Chest 40″</text>
              <line x1="96" y1="246" x2="204" y2="246" /><text x="210" y="250">Waist 33″</text>
              <line x1="262" y1="290" x2="262" y2="490" /><text x="230" y="510">Inseam 32″</text>
              <line x1="40" y1="20" x2="40" y2="500" /><text x="0" y="14">5′10″</text>
            </g>
          </svg>
          <div className="fit-chip fc-1"><b>M</b> recommended</div>
          <div className="fit-chip fc-2">Sleeve: <b>short</b></div>
          <div className="fit-chip fc-3">Rise: <b>mid</b></div>
        </div>
      </section>

      {/* ───────────── LOOKBOOK ───────────── */}
      <section className="section">
        <SectionHead eyebrow="The lookbook" title={<>Styled in-store. <em>Worn everywhere.</em></>} align="center" />
        <div className="lookbook">
          <Link to="/product/oxford-button-down-sky" className="lb lb-a" data-reveal><Img src="/img/look-oxford-navy-chino.webp" alt="Oxford shirt with navy chinos" /><span>Oxford & Navy Chino</span></Link>
          <div className="lb lb-b" data-reveal style={{ '--d': '80ms' }}><video src="/video/check-shirts.mp4" autoPlay muted loop playsInline /><span>The Check Shirt Edit</span></div>
          <Link to="/product/resort-knit-polo-navy" className="lb lb-c" data-reveal style={{ '--d': '160ms' }}><Img src="/img/look-navy-knit-polo.webp" alt="Navy knit polo" /><span>Resort Knit Polo</span></Link>
          <div className="lb lb-d" data-reveal><video src="/video/tee-set.mp4" autoPlay muted loop playsInline /><span>Weekend Co-ord Set</span></div>
          <Link to="/product/patch-heavyweight-tee-camel" className="lb lb-e" data-reveal style={{ '--d': '80ms' }}><Img src="/img/look-camel-tee.webp" alt="Camel heavyweight tee" /><span>Patch Heavyweight Tee</span></Link>
          <Link to="/product/wordmark-polo-black" className="lb lb-f" data-reveal style={{ '--d': '160ms' }}><Img src="/img/look-black-polo-chino.webp" alt="Black wordmark polo" /><span>Wordmark Polo</span></Link>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section className="how">
        <SectionHead eyebrow="Karachi → your door" title={<>How US delivery <em>works.</em></>} align="center" />
        <ol className="how-steps">
          {[
            ['Order in dollars', 'Shop in USD and pay securely with Square — Visa, Mastercard, Amex & Discover.', 'bag'],
            ['Hand-checked', 'Our Karachi team inspects, steams and packs every piece within 1–2 business days.', 'shield'],
            ['Shipped & tracked', 'Your parcel flies international express with tracking emailed to you.', 'truck'],
            ['At your door', 'Delivered anywhere in the 50 states in 10–15 business days.', 'check'],
          ].map(([t, d, ic], i) => (
            <li key={t} data-reveal style={{ '--d': `${i * 90}ms` }}>
              <span className="how-n">0{i + 1}</span>
              <Icon name={ic} size={28} />
              <h3>{t}</h3>
              <p>{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────────── BESTSELLERS ───────────── */}
      <section className="section">
        <SectionHead eyebrow="Customer favorites" title={<>The <em>bestsellers.</em></>} action={<Button to="/shop" variant="link">Shop all</Button>} />
        <div className="grid-4">{pick(BEST).map((p, i) => <ProductCard key={p.id} p={p} i={i} />)}</div>
      </section>

      {/* ───────────── STORY / STATS ───────────── */}
      <section className="story">
        <div className="story-img" data-reveal><Img src="/img/look-white-graphic-tee.webp" alt="H&S Apparel store in Karachi" /></div>
        <div className="story-copy" data-reveal>
          <p className="eyebrow">Our story</p>
          <h2 className="display-2">What started in a small room in 2011 is now <em>Karachi’s top choice</em> for men’s fashion.</h2>
          <p className="lede">Built with passion, hard work and a commitment to quality, H&S brings premium European high-street brands at prices that make sense. Now we’re bringing that same edit to customers in the United States.</p>
          <div className="stats">
            <div><b>2011</b><span>Founded in Karachi</span></div>
            <div><b>6</b><span>Stores across the city</span></div>
            <div><b>96K+</b><span>Instagram community</span></div>
          </div>
          <Button to="/about" variant="ghost">Read our story</Button>
        </div>
      </section>

      {/* ───────────── WOMEN TEASER ───────────── */}
      <section className="women-teaser">
        <video src="/video/women-teaser.mp4" poster="/video/women-poster.jpg" autoPlay muted loop playsInline />
        <div className="wt-copy" data-reveal>
          <p className="eyebrow light">Coming soon</p>
          <h2 className="display-1">A new chapter begins at <em>H&S Apparel.</em></h2>
          <p>We’ve spent years earning your trust in men’s fashion. Now, we’re bringing the same commitment to quality, style and attention to detail to women.</p>
          <p className="wt-sig">This is only the beginning.</p>
          <Button to="/women" variant="light">Join the women’s waitlist</Button>
        </div>
      </section>

      {/* ───────────── GIFTING FROM PAKISTAN ───────────── */}
      <section className="gift-band" data-reveal>
        <Icon name="globe" size={34} />
        <div>
          <h3 className="display-3">Shopping from Pakistan for family in the US?</h3>
          <p>Pay with your card in dollars and we’ll deliver straight to their American address — gift note included.</p>
        </div>
        <Button to="/shop" variant="ghost">Send a gift</Button>
      </section>

      {/* ───────────── SOCIAL ───────────── */}
      <section className="section">
        <SectionHead eyebrow="@hsapparelco · 96K followers" title={<>From our <em>social edit.</em></>} align="center" />
        <div className="ig-grid">
          {['look-camel-tee', 'polo-script-black', 'look-navy-knit-polo', 'jeans-indigo-straight', 'tee-hustle-back', 'look-black-polo-chino'].map((f, i) => (
            <a key={f} href={SOCIAL.ig} target="_blank" rel="noreferrer" className="ig-cell" data-reveal style={{ '--d': `${i * 50}ms` }}>
              <Img src={`/img/${f}.webp`} alt="H&S Apparel on Instagram" />
              <span><Icon name="ig" size={26} /></span>
            </a>
          ))}
        </div>
        <div className="center-row"><Button href={SOCIAL.ig} variant="ghost" icon="ig" onClick={() => window.open(SOCIAL.ig, '_blank')}>Follow @hsapparelco</Button></div>
      </section>
    </div>
  );
}
