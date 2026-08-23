const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. Fix Seats placeholders
const oldSeatsLink = `<Link href="/events/nocturne" className="mb-5 flex items-center gap-2 text-xs text-foreground/55" data-testid="link-seats-back"><ChevronLeft size={15} /> Nocturne for a City</Link>`;
app = app.replace(oldSeatsLink, `<Link href={\`/events/\${id}\`} className="mb-5 flex items-center gap-2 text-xs text-foreground/55" data-testid="link-seats-back"><ChevronLeft size={15} /> Back to Event</Link>`);

const oldSeatsList = `const list = (data as Seat[] | undefined)?.length ? data as Seat[] : [];`;
const newSeatsList = `const fallbackSeats: Seat[] = [];
['A','B','C'].forEach(r => {
  for(let i=1; i<=10; i++) {
    fallbackSeats.push({ id: \`\${r}-\${i}\`, row: r, number: i, status: 'available', category: i <= 2 ? 'Premium' : 'Standard', price: i <= 2 ? 3000 : 2500 } as any);
  }
});
const list = (data as Seat[] | undefined)?.length ? data as Seat[] : fallbackSeats;`;
app = app.replace(oldSeatsList, newSeatsList);

// 2. Fix Jawan check in Seats checkout passing demo metadata
const oldDemo = `const demo = { id: \`demo-\${Date.now()}\`, seatIds: selected, total, expiresAt: Date.now() + left * 1000, eventTitle: 'Nocturne for a City', venue: 'The Rivington', date: 'Jun 21', time: '20:30' };`;
const newDemo = `const fallbackEvent = events.find(e => e.id === id) || events[0];
const demo = { id: \`demo-\${Date.now()}\`, seatIds: selected, total, expiresAt: Date.now() + left * 1000, eventTitle: fallbackEvent.title, venue: fallbackEvent.venue, date: fallbackEvent.date, time: fallbackEvent.time };`;
app = app.replace(oldDemo, newDemo);

// 3. Fix Checkout placeholders
const oldCheckoutAside = `<h2 className="display-font mt-5 text-4xl">Nocturne for<br />a City</h2><div className="my-7 space-y-3 border-y border-foreground/10 py-5 text-sm"><div className="flex justify-between"><span className="text-foreground/55">The Rivington</span><span>Jun 21 A 20:30</span></div>`;
const newCheckoutAside = `<h2 className="display-font mt-5 text-4xl">{hold.eventTitle || 'Your Event'}</h2><div className="my-7 space-y-3 border-y border-foreground/10 py-5 text-sm"><div className="flex justify-between"><span className="text-foreground/55">{hold.venue || 'Event Venue'}</span><span>{hold.date || ''} &bull; {hold.time || ''}</span></div>`;
app = app.replace(oldCheckoutAside, newCheckoutAside);

const oldSeeYou = `See you<br /><i>in the dark.</i>`;
const newSeeYou = `See you<br /><i>there.</i>`;
app = app.replace(oldSeeYou, newSeeYou);

const oldOfferCue = `A seat for Nocturne for a City is available. You have 08:00 to claim it.`;
const newOfferCue = `A seat for this event is available. You have 08:00 to claim it.`;
app = app.replace(oldOfferCue, newOfferCue);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Placeholders fixed!");
