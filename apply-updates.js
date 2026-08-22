const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. Add MessageCircle to imports
code = code.replace(/import \{ ([^}]+) \} from 'lucide-react';/, (match, p1) => {
  if (!p1.includes('MessageCircle')) {
    return `import { MessageCircle, ${p1} } from 'lucide-react';`;
  }
  return match;
});

// 2. Fix the Studio metrics and banner
code = code.replace(/Gross revenue', '?14,58,462'/, "Gross revenue', '?17,10,000'");
code = code.replace(/<h2 className="display-font mt-4 text-5xl">Nocturne for a City<\/h2>/, '<h2 className="display-font mt-4 text-5xl">Arijit Singh Live</h2>');
code = code.replace(/112 of 120 seats booked · ?2,53,440 gross/, '112 of 120 seats booked · ?2,80,000 gross');

// 3. Inject Chatbot before App
const chatbotCode = `
function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! I am the Paradox AI assistant. How can I help you today?' }
  ]);

  const faqs = [
    { q: 'How to cancel?', a: "You can cancel your ticket from the 'My tickets' page up to 24 hours before." },
    { q: 'Where is my QR code?', a: "Your QR code is available in 'My tickets' and via email." },
    { q: 'Waitlist policy?', a: "Waitlist offers are valid for 10 minutes once a seat opens up." },
  ];

  const handleFaq = (faq) => {
    setMessages(prev => [...prev, { role: 'user', text: faq.q }, { role: 'bot', text: faq.a }]);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="mb-4 w-80 rounded-2xl border border-foreground/15 bg-background shadow-2xl overflow-hidden">
          <div className="bg-primary p-4 text-primary-foreground flex justify-between items-center">
            <span className="font-semibold text-sm">Paradox AI Support</span>
            <button onClick={() => setOpen(false)}><X size={16} /></button>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3 bg-secondary/20">
            {messages.map((m, i) => (
              <div key={i} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
                <div className={\`max-w-[80%] rounded-lg p-3 text-xs \${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-foreground/10'}\`}>
                  {m.text}
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
            <Link onClick={() => setOpen(false)} href="/support" className="text-[10px] rounded-full border border-accent/20 px-3 py-1.5 bg-accent/10 text-accent hover:bg-accent hover:text-accent-foreground transition-colors">
              Raise a ticket
            </Link>
          </div>
        </div>
      )}
      <button type="button" onClick={() => setOpen(!open)} className="h-14 w-14 rounded-full bg-accent text-accent-foreground shadow-lg grid place-items-center hover:scale-105 transition-transform">
        {open ? <X size={24} /> : <MessageCircle size={24} />}
      </button>
    </div>
  );
}

function App() {`;

code = code.replace("function App() {", chatbotCode);

// Inject Chatbot in App component (around Toaster)
code = code.replace("<Toaster /></TooltipProvider>", "<Toaster /><Chatbot /></TooltipProvider>");

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
console.log('Successfully patched App.tsx');
