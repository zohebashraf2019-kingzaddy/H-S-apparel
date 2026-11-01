import { lazy, Suspense, useEffect } from 'react';
import { Router, useRouter, match } from './lib/router.jsx';
import { StoreProvider, useStore } from './lib/store.jsx';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { Icon, Button } from './components/ui.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import Product from './pages/Product.jsx';
import Checkout, { Confirmation } from './pages/Checkout.jsx';
import { Contact, Women, About, Shipping } from './pages/Info.jsx';

const FitStudio = lazy(() => import('./pages/FitStudio.jsx'));

function useRevealObserver() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }),
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in):not([data-obs])').forEach((el) => { el.setAttribute('data-obs', ''); io.observe(el); });
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => { io.disconnect(); mo.disconnect(); };
  }, []);
}

function Routes() {
  const { path } = useRouter();
  let m;
  if (path === '/') return <Home />;
  if (path === '/shop') return <Shop />;
  if ((m = match('/shop/:cat', path))) return m.cat === 'women' ? <Women /> : <Shop cat={m.cat} />;
  if ((m = match('/product/:slug', path))) return <Product slug={m.slug} />;
  if (path === '/fit-studio') return <Suspense fallback={<div className="loading-studio"><span className="spinner" /> Loading the 3D Fit Studio…</div>}><FitStudio /></Suspense>;
  if (path === '/checkout') return <Checkout />;
  if ((m = match('/order/:id', path))) return <Confirmation id={m.id} />;
  if (path === '/contact') return <Contact />;
  if (path === '/women') return <Women />;
  if (path === '/about') return <About />;
  if (path === '/shipping') return <Shipping />;
  return (
    <div className="notfound">
      <p className="eyebrow">404</p>
      <h1 className="display-1">This page took a different fit.</h1>
      <Button to="/shop">Back to the shop</Button>
    </div>
  );
}

function Toast() {
  const { toast } = useStore();
  if (!toast) return null;
  return <div className="toast" key={toast.k}><Icon name="check" size={18} /> {toast.msg}</div>;
}

function Shell() {
  const { path } = useRouter();
  useRevealObserver();
  const bare = path === '/checkout';
  return (
    <>
      {!bare && <Header />}
      <main className={bare ? 'main bare' : 'main'} key={path}>
        <Routes />
      </main>
      {!bare && <Footer />}
      <CartDrawer />
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <Router>
      <StoreProvider>
        <Shell />
      </StoreProvider>
    </Router>
  );
}
