// POST /api/checkout — creates a Square order + payment.
// Prices are ALWAYS recalculated here from the catalog; the browser total is never trusted.
//
// Env vars (Vercel → Settings → Environment Variables):
//   SQUARE_ACCESS_TOKEN   secret access token (sandbox or production)
//   SQUARE_LOCATION_ID    location to charge
//   SQUARE_ENV            "sandbox" (default) or "production"
//   RESEND_API_KEY        optional — email the store about new orders
//   ORDER_NOTIFY_EMAIL    optional — where order notifications go
import { randomUUID } from 'node:crypto';
import { priceOrder } from '../src/data/products.js';

const cents = (n) => Math.round(n * 100);
const clean = (s, max = 120) => String(s ?? '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  const { sourceId, items, shippingMethod, customer = {}, address = {}, gift = '' } = body;

  // ── validate ──
  const order = priceOrder(items, shippingMethod);
  if (!order.lines.length) return res.status(400).json({ error: 'Your bag is empty or contains unavailable items.' });
  if (!/^\S+@\S+\.\S+$/.test(customer.email || '')) return res.status(400).json({ error: 'A valid email is required.' });
  if (address.country !== 'US' || !/^\d{5}(-\d{4})?$/.test(String(address.zip || '').trim()) || !address.state || !address.address1 || !address.city)
    return res.status(400).json({ error: 'We currently ship to complete US addresses only.' });

  const token = process.env.SQUARE_ACCESS_TOKEN;
  const locationId = process.env.SQUARE_LOCATION_ID || process.env.PUBLIC_SQUARE_LOCATION_ID;
  const ref = 'HS-' + randomUUID().slice(0, 6).toUpperCase();

  // ── demo mode: Square not configured yet ──
  if (!token || !locationId) {
    return res.status(200).json({ ok: true, demo: true, orderId: ref, total: order.total });
  }
  if (!sourceId || sourceId === 'demo-nonce') return res.status(400).json({ error: 'Card details are missing.' });

  const base = process.env.SQUARE_ENV === 'production' ? 'https://connect.squareup.com' : 'https://connect.squareupsandbox.com';
  const sq = async (path, payload) => {
    const r = await fetch(base + path, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', 'Square-Version': '2025-01-23' },
      body: JSON.stringify(payload),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      const msg = data?.errors?.[0]?.detail || data?.errors?.[0]?.code || 'Payment provider error';
      throw Object.assign(new Error(msg), { status: r.status, data });
    }
    return data;
  };

  const sqAddress = {
    address_line_1: clean(address.address1),
    address_line_2: clean(address.address2),
    locality: clean(address.city, 60),
    administrative_district_level_1: clean(address.state, 2),
    postal_code: clean(address.zip, 10),
    country: 'US',
    first_name: clean(customer.first, 60),
    last_name: clean(customer.last, 60),
  };

  try {
    // 1) Order — itemised so it shows up nicely in the Square Dashboard
    const { order: sqOrder } = await sq('/v2/orders', {
      idempotency_key: randomUUID(),
      order: {
        location_id: locationId,
        reference_id: ref,
        line_items: order.lines.map((l) => ({
          name: l.name.slice(0, 200),
          variation_name: `Size ${l.size}`,
          quantity: String(l.qty),
          base_price_money: { amount: cents(l.unit), currency: 'USD' },
          note: l.id,
        })),
        service_charges: order.shipping
          ? [{ name: `Shipping — ${order.method.name}`, amount_money: { amount: cents(order.shipping), currency: 'USD' }, calculation_phase: 'TOTAL_PHASE' }]
          : undefined,
        fulfillments: [{
          type: 'SHIPMENT',
          state: 'PROPOSED',
          shipment_details: {
            recipient: {
              display_name: `${clean(customer.first, 60)} ${clean(customer.last, 60)}`,
              email_address: clean(customer.email, 120),
              phone_number: clean(customer.phone, 30),
              address: sqAddress,
            },
            carrier: order.method.name,
            shipping_note: gift ? `GIFT — hide prices. Note: ${clean(gift, 240)}` : undefined,
          },
        }],
      },
    });

    const amount = sqOrder.total_money?.amount ?? cents(order.total);
    if (amount !== cents(order.total)) throw new Error('Order total mismatch — please refresh and try again.');

    // 2) Payment against that order
    const { payment } = await sq('/v2/payments', {
      idempotency_key: randomUUID(),
      source_id: sourceId,
      amount_money: { amount, currency: 'USD' },
      order_id: sqOrder.id,
      location_id: locationId,
      autocomplete: true,
      reference_id: ref,
      buyer_email_address: clean(customer.email, 120),
      shipping_address: sqAddress,
      note: `H&S US web order ${ref}${customer.payerCountry === 'PK' ? ' (paid from Pakistan)' : ''}`,
    });

    // 3) Optional store notification
    if (process.env.RESEND_API_KEY && process.env.ORDER_NOTIFY_EMAIL) {
      const lines = order.lines.map((l) => `${l.qty} × ${l.name} (${l.size}) — $${l.total.toFixed(2)}`).join('\n');
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || 'H&S Orders <onboarding@resend.dev>',
          to: [process.env.ORDER_NOTIFY_EMAIL],
          reply_to: customer.email,
          subject: `New US order ${ref} — $${order.total.toFixed(2)}`,
          text: `${lines}\nShipping: $${order.shipping.toFixed(2)} (${order.method.name})\nTotal: $${order.total.toFixed(2)}\n\nShip to:\n${customer.first} ${customer.last}\n${address.address1} ${address.address2 || ''}\n${address.city}, ${address.state} ${address.zip}\nPhone: ${customer.phone}\nEmail: ${customer.email}\n${gift ? `\nGIFT NOTE: ${gift}` : ''}\nSquare payment: ${payment.id}`,
        }),
      }).catch(() => {});
    }

    return res.status(200).json({ ok: true, orderId: ref, paymentId: payment.id, receiptUrl: payment.receipt_url, total: order.total });
  } catch (e) {
    console.error('checkout error', e.status, JSON.stringify(e.data || e.message));
    const declined = /CARD|DECLINE|CVV|VERIFY|INSUFFICIENT|EXPIR/i.test(e.message);
    return res.status(declined ? 402 : 500).json({ error: declined ? `Your card was declined (${e.message}). Please try another card.` : e.message || 'Payment failed.' });
  }
}
