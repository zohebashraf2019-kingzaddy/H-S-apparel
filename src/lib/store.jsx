import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { productById, priceOrder } from '../data/products.js';
import { safeStore, DEFAULT_BODY } from './utils.js';

const StoreCtx = createContext(null);

export function StoreProvider({ children }) {
  const [cart, setCart] = useState(() => safeStore.get('hs_cart', []).filter((l) => productById(l.id)));
  const [body, setBody] = useState(() => ({ ...DEFAULT_BODY, ...safeStore.get('hs_body', {}) }));
  const [bodySaved, setBodySaved] = useState(() => !!safeStore.get('hs_body', null));
  const [drawer, setDrawer] = useState(false);
  const [toast, setToast] = useState(null);
  const [shipMethod, setShipMethod] = useState('standard');

  useEffect(() => safeStore.set('hs_cart', cart), [cart]);

  const notify = useCallback((msg) => {
    setToast({ msg, k: Math.random() });
  }, []);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const add = useCallback((id, size, qty = 1, { open = true } = {}) => {
    setCart((c) => {
      const i = c.findIndex((l) => l.id === id && l.size === size);
      if (i >= 0) {
        const n = [...c];
        n[i] = { ...n[i], qty: Math.min(10, n[i].qty + qty) };
        return n;
      }
      return [...c, { id, size, qty }];
    });
    if (open) setDrawer(true);
  }, []);
  const update = (id, size, qty) =>
    setCart((c) => (qty <= 0 ? c.filter((l) => !(l.id === id && l.size === size)) : c.map((l) => (l.id === id && l.size === size ? { ...l, qty: Math.min(10, qty) } : l))));
  const clear = () => setCart([]);

  const saveBody = (b) => {
    setBody(b);
    safeStore.set('hs_body', b);
    setBodySaved(true);
  };

  const totals = useMemo(() => priceOrder(cart, shipMethod), [cart, shipMethod]);
  const count = cart.reduce((s, l) => s + l.qty, 0);

  return (
    <StoreCtx.Provider value={{ cart, add, update, clear, totals, count, drawer, setDrawer, body, setBody, saveBody, bodySaved, toast, notify, shipMethod, setShipMethod }}>
      {children}
    </StoreCtx.Provider>
  );
}
export const useStore = () => useContext(StoreCtx);
