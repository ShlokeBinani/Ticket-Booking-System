const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. Update Chatbot Component
const chatbotOld = app.match(/function Chatbot\(\) \{[\s\S]*?(?=function App\(\))/)[0];
const chatbotNew = `function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([
    { role: 'bot', text: 'Hey! I am Dot. I might not be as great as Jarvis, but I can certainly help you make your night a remarkable one!' }
  ]);
  const [, setLocation] = useLocation();

  const faqs = [
    { q: 'How to cancel?', a: "You can cancel your ticket from the 'My tickets' page up to 24 hours before showtime.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Where is my QR code?', a: "Your QR code is securely stored in your ticket wallet and also sent via email.", link: { url: '/bookings', label: 'View My Tickets' } },
    { q: 'Waitlist policy?', a: "Waitlist offers are valid for 10 minutes once a seat opens up." },
    { q: 'Refund policy?', a: "Full refunds are provided for cancellations made up to 24 hours before the event." },
    { q: 'I need human help', a: "I can route you to our support desk. They usually reply within one curtain call.", link: { url: '/support', label: 'Raise a ticket' } },
  ];

  const handleFaq = (faq: any) => {
    setMessages(prev => [...prev, { role: 'user', text: faq.q }, { role: 'bot', text: faq.a, link: faq.link }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 w-80 rounded-2xl border border-foreground/15 bg-background shadow-2xl overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <span className="font-semibold text-sm">Dot</span>
            <button onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            {messages.map((m, i) => (
              <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[85%] rounded-lg p-3 text-xs \${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-foreground/10'}\`}>
                  {m.text}
                  {m.link && (
                    <button onClick={() => { setOpen(false); setLocation(m.link.url); }} className="mt-3 block w-full rounded-md border border-accent/20 bg-accent/10 px-3 py-2 text-center text-[10px] font-semibold text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
                      {m.link.label}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          <div className="p-3 bg-card border-t border-foreground/10 flex flex-wrap gap-2">
            {faqs.map((faq, i) => (
              <button key={i} type="button" onClick={() => handleFaq(faq)} className="text-[10px] rounded-full border border-foreground/20 px-3 py-1.5 hover:bg-foreground/5 transition-colors">
                {faq.q}
              </button>
            ))}
            <button onClick={() => { setOpen(false); setLocation('/support'); }} className="text-[10px] rounded-full border border-accent/20 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
              Raise a ticket
            </button>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg grid place-items-center hover:scale-105 transition-transform">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}

`;
app = app.replace(chatbotOld, chatbotNew);

// 2. Update Header Links
app = app.replace(
  /<button onClick=\{\(\) => setShowSignOut\(true\)\} className="hidden rounded-full border border-foreground\/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground sm:block">Sign out \(\{user\.name\.split\(' '\)\[0\]\}\)<\/button>/,
  `<div className="hidden items-center gap-4 sm:flex">
    {user.role === 'admin' && <Link href="/admin" className="text-xs font-semibold text-foreground/60 hover:text-accent">Admin Studio</Link>}
    {user.role === 'organiser' && <Link href="/organiser" className="text-xs font-semibold text-foreground/60 hover:text-accent">Organiser Studio</Link>}
    <button onClick={() => setShowSignOut(true)} className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground">Sign out ({user.name.split(' ')[0]})</button>
  </div>`
);

// 3. Update Seat Legend
app = app.replace(
  /<p className="mt-4 text-center text-\[10px\] mono-label text-foreground\/40">Screen<\/p><\/div>/,
  `<p className="mt-4 text-center text-[10px] mono-label text-foreground/40">Screen</p>
   <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] text-foreground/55 font-mono">
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-card border border-foreground/20"></span> Standard</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-accent/15 border-accent/60 border"></span> Premium</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-accent"></span> Selected</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-foreground/10"></span> Sold</div>
   </div>
   </div>`
);

// 4. Update App() Routes for Protection
app = app.replace(/<Route path="\/organiser" component=\{\(\) => <Studio \/>\} \/>/, `<Route path="/organiser" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (!user || user.role !== 'organiser') loc('/'); }, [user]); return user?.role === 'organiser' ? <Studio /> : null; }} />`);
app = app.replace(/<Route path="\/admin" component=\{\(\) => <Studio admin \/>\} \/>/, `<Route path="/admin" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (!user || user.role !== 'admin') loc('/'); }, [user]); return user?.role === 'admin' ? <Studio admin /> : null; }} />`);
app = app.replace(/<Route path="\/bookings" component=\{Bookings\} \/>/, `<Route path="/bookings" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (user === null) loc('/auth'); }, [user]); return user ? <Bookings /> : null; }} />`);
app = app.replace(/<Route path="\/support" component=\{Support\} \/>/, `<Route path="/support" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (user === null) loc('/auth'); }, [user]); return user ? <Support /> : null; }} />`);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("UX Updates applied.");
