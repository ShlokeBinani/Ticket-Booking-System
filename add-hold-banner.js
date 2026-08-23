const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const holdBannerCode = `
function HoldBanner() {
  const [, setLocation] = useLocation();
  const [hold, setHold] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const checkHold = () => {
      try {
        const stored = localStorage.getItem('paradox-active-hold');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.expiresAt > Date.now()) {
            setHold(parsed);
          } else {
            localStorage.removeItem('paradox-active-hold');
            setHold(null);
          }
        } else {
          setHold(null);
        }
      } catch {}
    };
    
    checkHold();
    const interval = setInterval(() => {
      checkHold();
      if (hold) {
        const diff = hold.expiresAt - Date.now();
        if (diff <= 0) {
          localStorage.removeItem('paradox-active-hold');
          setHold(null);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(\`\${m}:\${s < 10 ? '0' : ''}\${s}\`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hold?.expiresAt]);

  if (!hold || window.location.pathname.startsWith('/checkout')) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border border-accent bg-card px-6 py-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <p className="text-sm font-semibold">You have seats held!</p>
      </div>
      <p className="text-xs text-foreground/60 font-mono">{timeLeft} left</p>
      <div className="flex items-center gap-3">
        <button onClick={() => { localStorage.removeItem('paradox-active-hold'); setHold(null); }} className="text-xs text-foreground/45 hover:text-accent">Release</button>
        <button onClick={() => setLocation(\`/checkout/\${hold.eventId}\`)} className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-primary">Complete Payment</button>
      </div>
    </div>
  );
}
`;

// Insert the component before function App
app = app.replace('function App() {', holdBannerCode + '\nfunction App() {');

// Add <HoldBanner /> to the render inside <QueryClientProvider><TooltipProvider> ... <Toaster /><HoldBanner /><Chatbot />
app = app.replace('<Chatbot /></TooltipProvider>', '<HoldBanner /><Chatbot /></TooltipProvider>');

// Now we need to modify the Seats component to store 'paradox-active-hold'
// Look for the onClick in Seats component that routes to /checkout
app = app.replace(
  /onClick=\{\(\) => \{ hold\.mutate\(\{ data: \{ showId: id, seatIds: selected \} \}, \{ onSuccess: \(\) => setLocation\(`\/checkout\/\$\{id\}`\), onError: \(\) => setLocation\(`\/checkout\/\$\{id\}`\) \} \); \}\}/,
  "onClick={() => { const h = { eventId: id, seatIds: selected, total, expiresAt: Date.now() + 10 * 60 * 1000 }; localStorage.setItem('paradox-active-hold', JSON.stringify(h)); hold.mutate({ data: { showId: id, seatIds: selected } }, { onSuccess: () => setLocation(`/checkout/${id}`), onError: () => setLocation(`/checkout/${id}`) }); }}"
);

// We also want to clear the hold if they complete checkout!
// Look for Checkout submit
app = app.replace(
  /onSuccess: \(\) => \{ setDone\(true\); \}/,
  "onSuccess: () => { localStorage.removeItem('paradox-active-hold'); setDone(true); }"
);
app = app.replace(
  /onError: \(\) => \{ setDone\(true\); \}/,
  "onError: () => { localStorage.removeItem('paradox-active-hold'); setDone(true); }"
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Hold banner added successfully!");
