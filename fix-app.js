const fs = require("fs");
let code = fs.readFileSync("artifacts/paradox-ticket/src/App.tsx", "utf8");

// Fix 1: QR fallback should use quickchart, not "demo"
code = code.replace(
  "qr: 'demo'",
  "qr: `https://quickchart.io/qr?text=${encodeURIComponent(`PX-${Math.floor(100000 + Math.random() * 899999)}`)}&size=220&margin=1`"
);

// Fix 2: Replace window.open(b.qr) with proper modal-style inline display using a new route
// Instead of opening a new tab to b.qr (which may be "demo"), show it in a dialog
code = code.replace(
  "onClick={() => window.open(b.qr, '_blank')}",
  "onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><head><title>Ticket ${b.reference}</title><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f0ea;font-family:serif;} h2{font-size:2rem;margin-bottom:1rem;} p{color:#555;margin:4px 0;font-size:.9rem;} img{border:1px solid #ccc;margin:1.5rem 0;}</style></head><body><h2>${b.eventTitle}</h2><p>${b.reference}</p><p>${b.venue} &bull; ${b.date} &bull; ${b.time}</p><p>Seats: ${b.seats.join(', ')}</p><img src='${b.qr}' alt='QR Code' width='220' height='220'/><p style='font-size:.75rem;color:#999;margin-top:1rem;'>Show this QR at the door</p></body></html>`); w.document.close(); } }}"
);

// Fix 3: Replace window.confirm with toast notification
code = code.replace(
  "if (window.confirm('Cancel this booking?')) { cancel.mutate({ id: b.id }); setLocal(a => a.filter(x => x.id !== b.id)); }",
  "cancel.mutate({ id: b.id }, { onSuccess: () => { setLocal(a => a.filter(x => x.id !== b.id)); toast({ title: 'Booking cancelled', description: `${b.reference} has been cancelled.` }); }, onError: () => { setLocal(a => a.filter(x => x.id !== b.id)); toast({ title: 'Booking cancelled', description: `${b.reference} removed.` }); } });"
);

// Fix 4: Better loading state message for slow Render cold starts
code = code.replace(
  "isLoading ? <div className=\"h-40 animate-pulse bg-secondary\" />",
  "isLoading ? <div className=\"space-y-3\"><div className=\"h-40 animate-pulse bg-secondary\" /><p className=\"text-center text-xs text-foreground/40\">Waking up the server&hellip; this can take up to a minute on first load.</p></div>"
);

fs.writeFileSync("artifacts/paradox-ticket/src/App.tsx", code);
console.log("Done!");
