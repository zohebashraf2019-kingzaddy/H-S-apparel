// POST /api/contact — customer contact form.
// Sends an email via Resend when RESEND_API_KEY + CONTACT_TO_EMAIL are set;
// otherwise it logs the message (visible in Vercel → Logs) and still returns ok.
const clean = (s, max = 2000) => String(s ?? '').replace(/[\u0000-\u0008\u000b-\u001f]/g, ' ').trim().slice(0, max);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const b = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};
  if (b.website) return res.status(200).json({ ok: true }); // honeypot
  const name = clean(b.name, 100), email = clean(b.email, 120), message = clean(b.message, 4000);
  if (!name || !/^\S+@\S+\.\S+$/.test(email) || message.length < 10) return res.status(400).json({ error: 'Please include your name, email and a message.' });

  const text = `New message from the H&S US website\n\nName: ${name}\nEmail: ${email}\nPhone: ${clean(b.phone, 40) || '—'}\nTopic: ${clean(b.topic, 60)}\nOrder #: ${clean(b.order, 40) || '—'}\n\n${message}`;

  if (process.env.RESEND_API_KEY && process.env.CONTACT_TO_EMAIL) {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || 'H&S Website <onboarding@resend.dev>',
        to: [process.env.CONTACT_TO_EMAIL],
        reply_to: email,
        subject: `[H&S US] ${clean(b.topic, 60)} — ${name}`,
        text,
      }),
    });
    if (!r.ok) {
      console.error('resend error', r.status, await r.text());
      return res.status(502).json({ error: 'Message service is unavailable — please WhatsApp us at +92 300 9227425.' });
    }
  } else {
    console.log(text);
  }
  return res.status(200).json({ ok: true });
}
