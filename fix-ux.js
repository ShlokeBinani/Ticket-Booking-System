const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

if (!code.includes('DialogContent')) {
  code = code.replace(
    "import { Toaster } from '@/components/ui/toaster';",
    "import { Toaster } from '@/components/ui/toaster';\nimport { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';"
  );
}

code = code.replace(
  "const { user, logout } = useAuth();",
  "const { user, logout } = useAuth(); const [showSignOut, setShowSignOut] = useState(false);"
);

code = code.replace(
  "<button onClick={logout} className=\"hidden rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground sm:block\">Sign out ({user.name.split(' ')[0]})</button>",
  "<><button onClick={() => setShowSignOut(true)} className=\"hidden rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground sm:block\">Sign out ({user.name.split(' ')[0]})</button><Dialog open={showSignOut} onOpenChange={setShowSignOut}><DialogContent className=\"sm:max-w-md rounded-xl\"><DialogHeader><DialogTitle className=\"display-font text-3xl\">Leaving so soon?</DialogTitle><DialogDescription>Are you sure you want to sign out?</DialogDescription></DialogHeader><DialogFooter className=\"mt-4 flex gap-3 sm:justify-start\"><button onClick={() => { logout(); setShowSignOut(false); }} className=\"bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold\">Sign out</button><DialogClose asChild><button className=\"border border-foreground/20 px-4 py-2 rounded-md text-sm\">Cancel</button></DialogClose></DialogFooter></DialogContent></Dialog></>"
);

code = code.replace(
  "const [local, setLocal] = useState(stored());",
  "const [local, setLocal] = useState(stored()); const [qrPopup, setQrPopup] = useState<Booking | null>(null);"
);

code = code.replace(
  "onClick={() => { const w = window.open('', '_blank'); if (w) { w.document.write(`<html><head><title>Ticket ${b.reference}</title><style>body{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f0ea;font-family:serif;} h2{font-size:2rem;margin-bottom:1rem;} p{color:#555;margin:4px 0;font-size:.9rem;} img{border:1px solid #ccc;margin:1.5rem 0;}</style></head><body><h2>${b.eventTitle}</h2><p>${b.reference}</p><p>${b.venue} &bull; ${b.date} &bull; ${b.time}</p><p>Seats: ${b.seats.join(', ')}</p><img src='${b.qr}' alt='QR Code' width='220' height='220'/><p style='font-size:.75rem;color:#999;margin-top:1rem;'>Show this QR at the door</p></body></html>`); w.document.close(); } }}",
  "onClick={() => setQrPopup(b)}"
);

code = code.replace(
  "</section></Shell>; }",
  "</section>{qrPopup && <Dialog open={!!qrPopup} onOpenChange={() => setQrPopup(null)}><DialogContent className=\"sm:max-w-sm rounded-xl text-center flex flex-col items-center p-8\"><DialogTitle className=\"display-font text-3xl\">{qrPopup.eventTitle}</DialogTitle><p className=\"text-xs text-foreground/55 mt-2\">{qrPopup.venue} &bull; {qrPopup.date} &bull; {qrPopup.time}</p><p className=\"text-xs text-foreground/55 mt-1\">Seats: {qrPopup.seats.join(', ')}</p><img src={qrPopup.qr} alt=\"QR\" className=\"w-48 h-48 mx-auto mt-6 border border-foreground/10 p-2 rounded-lg\" /><p className=\"text-[10px] text-foreground/45 mt-4\">Show this QR at the door</p></DialogContent></Dialog>}</Shell>; }"
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
