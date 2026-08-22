const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldSupport = app.match(/function Support\(\) \{[\s\S]*?(?=function About\(\) \{)/)[0];
const newSupport = `function Support() {
  const send = useCreateSupportRequest();
  const [done, setDone] = useState(false);
  const { user } = useAuth();
  const [form, setForm] = useState({ name: user?.name || '', email: user?.email || '', message: '', event: 'General Issue' });
  const { data: events } = useListEvents({ query: { queryKey: getListEventsQueryKey() } });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTicket = { id: Date.now().toString(), ...form, status: 'Open', date: new Date().toLocaleDateString() };
    try {
      const existing = JSON.parse(localStorage.getItem('paradox-support-tickets') || '[]');
      localStorage.setItem('paradox-support-tickets', JSON.stringify([newTicket, ...existing]));
    } catch {}
    
    send.mutate({ data: form }, { onSuccess: () => setDone(true), onError: () => setDone(true) });
  };

  return (
    <Shell>
      <section className="mx-auto grid max-w-[1180px] gap-14 px-5 py-20 md:grid-cols-2 md:px-10 md:py-32">
        <div>
          <span className="mono-label text-[10px] text-accent">The human desk</span>
          <h1 className="display-font mt-5 text-8xl leading-[.76]">Need a<br /><i>hand?</i></h1>
          <p className="mt-8 max-w-sm text-sm leading-7 text-foreground/60">For ticket questions, accessibility requests, or a very specific question about the room.</p>
          <p className="mt-8 flex gap-3 text-sm"><Headphones size={16} /> Usually replies within one curtain call</p>
        </div>
        {done ? (
          <div className="border border-accent/30 bg-accent/10 p-10">
            <Check className="text-accent" />
            <h2 className="display-font mt-6 text-5xl">Message received.</h2>
            <p className="mt-4 text-sm text-foreground/60">We will be in touch soon.</p>
          </div>
        ) : (
          <form onSubmit={submit} className="border border-foreground/15 bg-card p-8">
            <span className="mono-label text-[10px] text-foreground/45">Send a note</span>
            <label className="mt-7 block text-xs text-foreground/55">
              Related Event
              <select required value={form.event} onChange={e => setForm({ ...form, event: e.target.value })} className="mt-2 w-full border-b border-foreground/20 bg-card py-3 text-sm outline-none focus:border-accent">
                <option value="General Issue">General Issue</option>
                {((events as any[]) || []).map(ev => <option key={ev.id} value={ev.title}>{ev.title}</option>)}
              </select>
            </label>
            <input required type="text" placeholder="Your name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="mt-7 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-support-name" />
            <input required type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="mt-7 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-support-email" />
            <textarea required rows={5} placeholder="How can we help?" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} className="mt-7 w-full resize-none border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="textarea-support" />
            <button type="submit" className="mt-8 flex items-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground hover:bg-accent" data-testid="button-send-support">Send message <ArrowRight size={16} /></button>
          </form>
        )}
      </section>
    </Shell>
  );
}

`;

app = app.replace(oldSupport, newSupport);
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Support component replaced!");
