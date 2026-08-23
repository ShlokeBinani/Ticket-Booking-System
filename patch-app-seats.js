const fs = require('fs');

let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Replace the Seats component loading behavior
const oldSeats = `function Seats() { const { id = 'show-nocturne-2030' } = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const [selected, setSelected] = useState<string[]>([]); const [left, setLeft] = useState(480); const { data } = useGetShowSeats(id, { query: { enabled: Boolean(id), queryKey: getGetShowSeatsQueryKey(id), staleTime: 15000 } }); const hold = useCreateSeatHold(); const list = (data as Seat[] | undefined)?.length ? data as Seat[] : seats;`;

const newSeats = `function Seats() { const { id = 'show-nocturne-2030' } = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const [selected, setSelected] = useState<string[]>([]); const [left, setLeft] = useState(480); const { data, isLoading } = useGetShowSeats(id, { query: { enabled: Boolean(id), queryKey: getGetShowSeatsQueryKey(id), staleTime: 15000 } }); const hold = useCreateSeatHold(); const list = (data as Seat[] | undefined)?.length ? data as Seat[] : [];`;

file = file.replace(oldSeats, newSeats);

const oldRows = `</div><div className="mx-auto max-w-2xl space-y-3">{rows.map(([row, values]) => <div key={row} className="grid grid-cols-[20px_1fr] items-center gap-3"><span className="font-mono text-[10px] text-foreground/45">{row}</span><div className="flex justify-center gap-1.5">{(values as Seat[]).map(s => <button key={s.id} onClick={() => s.status === 'available' && setSelected(a => a.includes(s.id) ? a.filter(x => x !== s.id) : [...a, s.id])} disabled={s.status !== 'available'} className={\`h-8 w-6 rounded-t border text-[9px] transition hover:-translate-y-1 sm:h-10 sm:w-8 \${s.status !== 'available' ? 'bg-foreground/10 text-foreground/25' : selected.includes(s.id) ? 'bg-accent text-accent-foreground' : s.category === 'Premium' ? 'border-accent/60 bg-accent/15 text-accent' : 'bg-card text-foreground/60'}\`} data-testid={\`button-seat-\${s.id}\`} aria-label={\`Row \${s.row}, seat \${s.number}\`}>{s.number}</button>)}</div></div>)}</div></div>`;

const newRows = `</div><div className="mx-auto max-w-2xl space-y-3">{isLoading ? <div className="py-20 text-center text-sm text-foreground/40 animate-pulse">Loading seating arrangement...</div> : rows.map(([row, values]) => <div key={row} className="grid grid-cols-[20px_1fr] items-center gap-3"><span className="font-mono text-[10px] text-foreground/45">{row}</span><div className="flex justify-center gap-1.5">{(values as Seat[]).map(s => <button key={s.id} onClick={() => s.status === 'available' && setSelected(a => a.includes(s.id) ? a.filter(x => x !== s.id) : [...a, s.id])} disabled={s.status !== 'available'} className={\`h-8 w-6 rounded-t border text-[9px] transition hover:-translate-y-1 sm:h-10 sm:w-8 \${s.status !== 'available' ? 'bg-foreground/10 text-foreground/25' : selected.includes(s.id) ? 'bg-accent text-accent-foreground' : s.category === 'Premium' ? 'border-accent/60 bg-accent/15 text-accent' : 'bg-card text-foreground/60'}\`} data-testid={\`button-seat-\${s.id}\`} aria-label={\`Row \${s.row}, seat \${s.number}\`}>{s.number}</button>)}</div></div>)}</div></div>`;

file = file.replace(oldRows, newRows);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("App.tsx Seats component fixed!");
