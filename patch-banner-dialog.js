const fs = require('fs');
let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldRender = `    return (
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border border-accent bg-card px-6 py-3 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
          <p className="text-sm font-semibold">You have seats held!</p>
        </div>
        <p className="text-xs text-foreground/60 font-mono">{timeLeft} left</p>
        <div className="flex items-center gap-3">
          <button onClick={() => { localStorage.removeItem('paradox-active-hold'); setHold(null); }} className="text-xs text-foreground/45 hover:text-accent">Release</button>
          <button onClick={() => setLocation(\`/checkout/\${hold.id}\`)} className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-primary">Complete Payment</button>
        </div>
      </div>
    );`;

const newRender = `    return (
      <Dialog open={true} onOpenChange={(o) => { if (!o) { localStorage.removeItem('paradox-active-hold'); setHold(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
              You have seats held!
            </DialogTitle>
            <DialogDescription>
              Your seats are reserved for another <strong className="text-accent">{timeLeft}</strong>. Complete your payment before the timer expires and the seats are released to other fans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-between items-center mt-4">
            <button onClick={() => { localStorage.removeItem('paradox-active-hold'); setHold(null); }} className="text-sm text-foreground/45 hover:text-foreground">Release Seats</button>
            <button onClick={() => { setLocation(\`/checkout/\${hold.id}\`); }} className="bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground hover:bg-primary">Complete Payment</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );`;

file = file.replace(oldRender, newRender);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Hold banner changed to dialog!");
