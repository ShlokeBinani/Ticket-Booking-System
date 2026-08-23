const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldSeats = `function Seats() { const { id = 'show-nocturne-2030' } = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const [selected, setSelected] = useState<string[]>([]); const [left, setLeft] = useState(480); const { data, isLoading } = useGetShowSeats(id, { query: { enabled: Boolean(id), queryKey: getGetShowSeatsQueryKey(id), staleTime: 15000 } }); const hold = useCreateSeatHold(); const list = (data as Seat[] | undefined)?.length ? data as Seat[] : []; useEffect(() => { const t = window.setInterval(() => setLeft(n => Math.max(0, n - 1)), 1000); return () => window.clearInterval(t); }, []); 
    const params = new URLSearchParams(window.location.search);
    const basePrice = parseInt(params.get('price') || '2500', 10);
    const localBookings = (() => { try { return JSON.parse(localStorage.getItem('paradox-bookings') || '[]'); } catch { return []; } })();
    const bookedSeatIds = localBookings.flatMap((b: any) => b.seats || []);
    const dynamicSeats = list.map(s => ({ ...s, status: bookedSeatIds.includes(s.id) ? 'sold' : s.status, price: s.category === 'Premium' ? Math.floor(basePrice * 1.2) : basePrice }));
    const total = selected.reduce((a, id) => a + (dynamicSeats.find(s => s.id === id)?.price || 0), 0);
    const rows = useMemo(() => Object.entries(Object.groupBy(dynamicSeats, s => s.row)), [dynamicSeats]);
    const { user } = useAuth(); const go = () => { if (!user) { if (window.confirm('You must sign in to book a ticket. Go to Sign In?')) { setLocation('/auth'); } return; } const demo = { id: \`demo-\${Date.now()}\`, seatIds: selected, total, expiresAt: Date.now() + left * 1000, eventTitle: 'Nocturne for a City', venue: 'The Rivington', date: 'Jun 21', time: '20:30' }; localStorage.setItem('paradox-active-hold', JSON.stringify(demo)); hold.mutate({ id, data: { seatIds: selected } }, { onSuccess: r => localStorage.setItem('paradox-active-hold', JSON.stringify({...r, eventTitle: 'Nocturne for a City', venue: 'The Rivington', date: 'Jun 21', time: '20:30'})), onError: () => undefined }); setLocation(\`/checkout/\${demo.id}\`); }; return <Shell><section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20"><div className="mb-12 flex flex-col justify-between gap-6 border-b border-foreground/15 pb-8 md:flex-row md:items-end"><div><Link href="/events/nocturne" className="mb-5 flex items-center gap-2 text-xs text-foreground/55" data-testid="link-seats-back"><ChevronLeft size={15} /> Nocturne for a City</Link><span className="mono-label text-[10px] text-accent">Choose your seat</span><h1 className="display-font mt-3 text-7xl leading-[.8] md:text-9xl">Find your<br /><i>point of view.</i></h1></div><div className="flex items-center gap-3 border border-accent/30 bg-accent/10 px-4 py-3 text-accent" data-testid="status-hold"><Clock3 size={17} /><span className="font-mono text-sm">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span></div></div>`;

const newSeats = `function Seats() { const { id = '1' } = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const [selected, setSelected] = useState<string[]>([]); const [left, setLeft] = useState(480); const { data, isLoading } = useGetShowSeats(id, { query: { enabled: Boolean(id), queryKey: getGetShowSeatsQueryKey(id), staleTime: 15000 } }); const hold = useCreateSeatHold(); 
    
    // Fallback data in case API fails on Vercel
    const fallbackEvent = events.find(e => e.id === id) || events[0];
    const mockSeats = [];
    ['A','B','C'].forEach(r => {
      for(let i=1; i<=10; i++) {
        mockSeats.push({ id: \`\${r}-\${i}\`, row: r, number: i, status: 'available', category: i <= 2 ? 'Premium' : 'Standard', price: i <= 2 ? 3000 : 2500 });
      }
    });
    
    const list = (data as Seat[] | undefined)?.length ? data as Seat[] : mockSeats; 
    useEffect(() => { const t = window.setInterval(() => setLeft(n => Math.max(0, n - 1)), 1000); return () => window.clearInterval(t); }, []); 
    const params = new URLSearchParams(window.location.search);
    const basePrice = parseInt(params.get('price') || String(fallbackEvent.price || 2500), 10);
    const localBookings = (() => { try { return JSON.parse(localStorage.getItem('paradox-bookings') || '[]'); } catch { return []; } })();
    const bookedSeatIds = localBookings.flatMap((b: any) => b.seats || []);
    const dynamicSeats = list.map(s => ({ ...s, status: bookedSeatIds.includes(s.id) ? 'sold' : s.status, price: s.category === 'Premium' ? Math.floor(basePrice * 1.2) : basePrice }));
    const total = selected.reduce((a, id) => a + (dynamicSeats.find(s => s.id === id)?.price || 0), 0);
    
    const rows = useMemo(() => {
      const grouped = dynamicSeats.reduce((acc, s) => {
        if (!acc[s.row]) acc[s.row] = [];
        acc[s.row].push(s);
        return acc;
      }, {} as Record<string, typeof dynamicSeats>);
      return Object.entries(grouped);
    }, [dynamicSeats]);
    
    const { user } = useAuth(); const go = () => { if (!user) { if (window.confirm('You must sign in to book a ticket. Go to Sign In?')) { setLocation('/auth'); } return; } const demo = { id: \`demo-\${Date.now()}\`, seatIds: selected, total, expiresAt: Date.now() + left * 1000, eventTitle: fallbackEvent.title, venue: fallbackEvent.venue, date: fallbackEvent.date, time: fallbackEvent.time }; localStorage.setItem('paradox-active-hold', JSON.stringify(demo)); hold.mutate({ id, data: { seatIds: selected } }, { onSuccess: r => localStorage.setItem('paradox-active-hold', JSON.stringify({...r, eventTitle: fallbackEvent.title, venue: fallbackEvent.venue, date: fallbackEvent.date, time: fallbackEvent.time})), onError: () => undefined }); setLocation(\`/checkout/\${demo.id}\`); }; return <Shell><section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20"><div className="mb-12 flex flex-col justify-between gap-6 border-b border-foreground/15 pb-8 md:flex-row md:items-end"><div><Link href={\`/events/\${fallbackEvent.id}\`} className="mb-5 flex items-center gap-2 text-xs text-foreground/55" data-testid="link-seats-back"><ChevronLeft size={15} /> {fallbackEvent.title}</Link><span className="mono-label text-[10px] text-accent">Choose your seat</span><h1 className="display-font mt-3 text-7xl leading-[.8] md:text-9xl">Find your<br /><i>point of view.</i></h1></div><div className="flex items-center gap-3 border border-accent/30 bg-accent/10 px-4 py-3 text-accent" data-testid="status-hold"><Clock3 size={17} /><span className="font-mono text-sm">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span></div></div>`;

if (file.includes('eventTitle: \'Nocturne for a City\'')) {
  file = file.replace(oldSeats, newSeats);
  fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
  console.log("Replaced placeholders in Seats!");
} else {
  console.log("Could not find oldSeats. Doing partial replacement.");
  file = file.replace(/Nocturne for a City/g, '{fallbackEvent.title}');
}
