import fs from 'fs';
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. Prepend import { Studio } from './Studio';
if (!code.includes('import { Studio } from')) {
  code = `import { Studio } from './Studio';\n` + code;
}

// 2. Remove function Studio
code = code.replace(/function Studio\([\s\S]*?\}\n\}/, '');

// 3. Replace function Support
const supportRegex = /function Support\(\) \{[\s\S]*?(?=function Auth\(\) \{)/;
const newSupport = `
function Support() {
  const [done, setDone] = useState(false);
  const { user, token } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '', event: 'General Issue' });
  const { data: events } = useListEvents(undefined, { query: { queryKey: getListEventsQueryKey(undefined) } });
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      fetch(\`\${baseUrl}/api/support\`, { headers: { 'Authorization': \`Bearer \${token}\` }})
        .then(res => res.json())
        .then(data => setTickets(data))
        .catch(console.error);
    }
  }, [token, done]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(\`\${baseUrl}/api/support\`, { 
        method: 'POST', 
        headers: { 'Authorization': \`Bearer \${token}\`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      setDone(true);
      setForm({...form, message: '', subject: ''});
    } catch {}
  };

  return (
    <Shell>
      <section className="mx-auto grid max-w-[1180px] gap-14 px-5 py-20 md:grid-cols-2 md:px-10 md:py-32">
        <div>
          <span className="mono-label text-[10px] text-accent">The human desk</span>
          <h1 className="display-font mt-5 text-8xl leading-[.76]">Need a<br /><i>hand?</i></h1>
          <p className="mt-8 max-w-sm text-sm leading-7 text-foreground/60">For ticket questions, accessibility requests, or a very specific question about the room.</p>
          
          <div className="mt-12">
            <h2 className="display-font text-4xl mb-4">Your Tickets</h2>
            <div className="space-y-4">
              {tickets.length === 0 ? <p className="text-sm text-foreground/50">No past tickets.</p> : tickets.map((t) => (
                <div key={t.id} className="border border-foreground/15 p-4 rounded bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <p className="font-bold text-sm">{t.subject} <span className="ml-2 px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] uppercase">{t.status}</span></p>
                  </div>
                  <p className="text-xs text-foreground/70 mb-3">{t.message}</p>
                  {t.reply && (
                    <div className="bg-secondary p-3 text-xs rounded border-l-2 border-accent">
                      <p className="font-bold mb-1">Reply:</p>
                      <p>{t.reply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div>
          {done && <div className="mb-8 border border-accent/30 bg-accent/10 p-5 flex items-center justify-between"><span className="text-sm">Message received. We'll reply soon.</span><button onClick={() => setDone(false)} className="text-xs border px-3 py-1">New Message</button></div>}
          {!done && (
            <form onSubmit={submit} className="border border-foreground/15 bg-card p-8">
              <h2 className="display-font text-3xl mb-6">Open a ticket</h2>
              <select required value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} className="w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none mb-6">
                <option value="General Issue">General Issue</option>
                {(events || []).map((e: any) => <option key={e.id} value={e.title}>{e.title}</option>)}
              </select>
              <input required placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} className="w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none mb-6" />
              <textarea required placeholder="How can we help?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none min-h-[120px] mb-6" />
              <button type="submit" className="w-full bg-primary py-4 text-sm font-semibold text-primary-foreground">Send to desk</button>
            </form>
          )}
        </div>
      </section>
    </Shell>
  );
}
`;

code = code.replace(supportRegex, newSupport);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
console.log('App.tsx successfully updated!');
