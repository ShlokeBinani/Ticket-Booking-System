const fs = require('fs');

let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldStudio = app.match(/function Studio\(\{ admin = false \}: \{ admin\?: boolean \}\) \{[\s\S]*?(?=function Auth\(\) \{)/)[0];

const newStudio = `function Studio({ admin = false }: { admin?: boolean }) {
  const [tab, setTab] = useState(admin ? 'Venues' : 'Overview');
  const { user } = useAuth();
  
  // Chatbot FAQs Management
  const [faqs, setFaqs] = useState<any[]>([]);
  useEffect(() => {
    try {
      const stored = localStorage.getItem('paradox-faqs');
      if (stored) setFaqs(JSON.parse(stored));
      else {
        const initial = [
          { q: 'How to cancel?', a: "You can cancel your ticket from the 'My tickets' page up to 24 hours before showtime.", link: { url: '/bookings', label: 'View My Tickets' } },
          { q: 'Where is my QR code?', a: "Your QR code is securely stored in your ticket wallet and also sent via email.", link: { url: '/bookings', label: 'View My Tickets' } },
          { q: 'Waitlist policy?', a: "Waitlist offers are valid for 10 minutes once a seat opens up." },
          { q: 'Refund policy?', a: "Full refunds are provided for cancellations made up to 24 hours before the event." },
          { q: 'I need human help', a: "I can route you to our support desk. They usually reply within one curtain call.", link: { url: '/support', label: 'Raise a ticket' } }
        ];
        setFaqs(initial);
        localStorage.setItem('paradox-faqs', JSON.stringify(initial));
      }
    } catch {}
  }, []);

  const [newFaq, setNewFaq] = useState({ q: '', a: '' });
  const addFaq = () => {
    if (!newFaq.q || !newFaq.a) return;
    const updated = [...faqs, newFaq];
    setFaqs(updated);
    localStorage.setItem('paradox-faqs', JSON.stringify(updated));
    setNewFaq({ q: '', a: '' });
  };
  const deleteFaq = (idx: number) => {
    const updated = faqs.filter((_, i) => i !== idx);
    setFaqs(updated);
    localStorage.setItem('paradox-faqs', JSON.stringify(updated));
  };

  // Support Tickets Management
  const [tickets, setTickets] = useState<any[]>([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('paradox-support-tickets') || '[]');
      setTickets(admin ? stored : stored.filter((t: any) => t.event !== 'General Issue'));
    } catch {}
  }, [admin]);

  return (
    <Shell>
      <section className="mx-auto max-w-[1180px] px-5 py-16 md:px-10 md:py-24">
        <span className="mono-label text-[10px] text-accent">{admin ? 'Back office / Paradox' : 'Organiser studio / June 2025'}</span>
        <h1 className="display-font mt-4 text-8xl leading-[.8]">{admin ? <>Keep the<br /><i>house ready.</i></> : <>Good nights<br /><i>add up.</i></>}</h1>
        
        {admin ? (
          <div className="mt-14 flex flex-wrap gap-6 border-b border-foreground/15">
            {['Venues', 'Support tickets', 'Chatbot Settings'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={\`pb-4 text-sm \${tab === t ? 'border-b-2 border-accent text-accent' : 'text-foreground/50'}\`}>
                {t}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-14 flex gap-6 border-b border-foreground/15">
            {['Overview', 'Support tickets'].map(t => (
              <button key={t} onClick={() => setTab(t)} className={\`pb-4 text-sm \${tab === t ? 'border-b-2 border-accent text-accent' : 'text-foreground/50'}\`}>
                {t}
              </button>
            ))}
          </div>
        )}

        {tab === 'Overview' && !admin && (
          <>
            <div className="mt-8 grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['Gross revenue', '?17,10,000'],
                ['Tickets moved', '684'],
                ['Sell-through', '87.6%'],
                ['Avg. ticket', '?2,500']
              ].map(([l, v]) => (
                <div key={l} className="bg-card p-6">
                  <span className="mono-label text-[9px] text-foreground/45">{l}</span>
                  <p className="mt-5 text-3xl font-semibold">{v}</p>
                  <span className="mt-2 block text-xs text-accent">+12.4% from last month</span>
                </div>
              ))}
            </div>
            <div className="mt-10 border border-foreground/15 bg-card p-8">
              <span className="mono-label text-[10px] text-foreground/45">Tonight's room</span>
              <h2 className="display-font mt-4 text-5xl">Arijit Singh Live</h2>
              <p className="mt-5 text-sm text-foreground/55">112 of 120 seats booked &middot; ?2,80,000 gross</p>
            </div>
          </>
        )}

        {tab === 'Venues' && admin && (
          <div className="mt-8 border border-foreground/15 bg-card p-7">
            <h2 className="display-font text-4xl">The Rivington</h2>
            <p className="mt-3 text-sm text-foreground/55">120 seats &middot; New York</p>
            <button className="mt-8 border border-foreground/20 px-4 py-3 text-xs font-semibold">Edit venue</button>
          </div>
        )}

        {tab === 'Chatbot Settings' && admin && (
          <div className="mt-8 border border-foreground/15 bg-card p-7 space-y-6">
            <h2 className="display-font text-4xl">Dot FAQs Manager</h2>
            <div className="space-y-4">
              {faqs.map((f, i) => (
                <div key={i} className="flex justify-between items-start border-b border-foreground/10 pb-4">
                  <div>
                    <p className="font-semibold text-sm">Q: {f.q}</p>
                    <p className="text-sm text-foreground/55 mt-1">A: {f.a}</p>
                  </div>
                  <button onClick={() => deleteFaq(i)} className="text-red-500 hover:text-red-400 text-xs px-3 py-1 border border-red-500/20 rounded">Delete</button>
                </div>
              ))}
            </div>
            <div className="pt-4 border-t border-foreground/10 space-y-4">
              <h3 className="font-semibold text-sm">Add New FAQ</h3>
              <input placeholder="Question" value={newFaq.q} onChange={e => setNewFaq({ ...newFaq, q: e.target.value })} className="w-full bg-transparent border-b border-foreground/20 py-2 outline-none text-sm" />
              <input placeholder="Answer" value={newFaq.a} onChange={e => setNewFaq({ ...newFaq, a: e.target.value })} className="w-full bg-transparent border-b border-foreground/20 py-2 outline-none text-sm" />
              <button onClick={addFaq} className="bg-primary text-primary-foreground px-4 py-2 text-xs font-semibold hover:bg-accent">Add to Chatbot</button>
            </div>
          </div>
        )}

        {tab === 'Support tickets' && (
          <div className="mt-8 border border-foreground/15 bg-card p-7 space-y-6">
            <h2 className="display-font text-4xl">Open Issues</h2>
            {tickets.length === 0 ? (
              <p className="text-sm text-foreground/55">No support tickets currently.</p>
            ) : (
              <div className="space-y-4">
                {tickets.map((t: any) => (
                  <div key={t.id} className="border border-foreground/10 p-4">
                    <div className="flex justify-between">
                      <span className="mono-label text-[10px] text-accent">{t.status} &middot; {t.date}</span>
                      <span className="text-xs font-semibold text-accent">{t.event}</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold">{t.name} ({t.email})</p>
                    <p className="mt-1 text-sm text-foreground/55">{t.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </Shell>
  );
}

`;

app = app.replace(oldStudio, newStudio);

// We must also update Chatbot to use the localStorage faqs if present
const oldChatbotFaqs = `const faqs = [
    { q: 'How to cancel?', a: "You can cancel your ticket from the 'My tickets' page up to 24 hours before showtime.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Where is my QR code?', a: "Your QR code is securely stored in your ticket wallet and also sent via email.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Waitlist policy?', a: "Waitlist offers are valid for 10 minutes once a seat opens up." },
    { q: 'Refund policy?', a: "Full refunds are provided for cancellations made up to 24 hours before the event." },
    { q: 'I need human help', a: "I can route you to our support desk. They usually reply within one curtain call.", link: { url: '/support', label: 'Raise a ticket' } },
  ];`;

const newChatbotFaqs = `const [faqs, setFaqs] = useState<any[]>([
    { q: 'How to cancel?', a: "You can cancel your ticket from the 'My tickets' page up to 24 hours before showtime.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Where is my QR code?', a: "Your QR code is securely stored in your ticket wallet and also sent via email.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Waitlist policy?', a: "Waitlist offers are valid for 10 minutes once a seat opens up." },
    { q: 'Refund policy?', a: "Full refunds are provided for cancellations made up to 24 hours before the event." },
    { q: 'I need human help', a: "I can route you to our support desk. They usually reply within one curtain call.", link: { url: '/support', label: 'Raise a ticket' } },
  ]);
  
  useEffect(() => {
    if (open) {
      try {
        const stored = localStorage.getItem('paradox-faqs');
        if (stored) setFaqs(JSON.parse(stored));
      } catch {}
    }
  }, [open]);`;

app = app.replace(oldChatbotFaqs, newChatbotFaqs);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Studio & Chatbot FAQ link replaced!");
