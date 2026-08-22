const fs = require('fs');
let code = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// 1. Replace all '$' with '?' in strings
code = code.replace(/\$18,462/g, '?14,58,462');
code = code.replace(/\$27.00/g, '?2,500');
code = code.replace(/\$3,168/g, '?2,53,440');

// 2. Replace the hardcoded cities in filter
code = code.replace(
  "<option>New York</option><option>Brooklyn</option><option>Queens</option><option>Manhattan</option>",
  "<option>Mumbai</option><option>Delhi</option><option>Bangalore</option><option>Pune</option>"
);

// 3. Replace the events array with 10 Indian events
const eventsRegex = /const events: EventItem\[\] = \[([\s\S]*?)\];/;
const newEvents = `const events: EventItem[] = [
  { id: '1', title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Jio World Drive', date: 'Oct 14', time: '19:00', price: 2500, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1540039155732-d688126b8b0b?q=80&w=800&auto=format&fit=crop', rating: 4.9 },
  { id: '2', title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venue: 'JLN Stadium', date: 'Nov 02', time: '18:30', price: 3999, status: 'Sold out', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop', rating: 4.9 },
  { id: '3', title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venue: 'PVR IMAX', date: 'Sep 07', time: '20:00', price: 450, status: 'Available', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop', rating: 4.7 },
  { id: '4', title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venue: 'Inox Megaplex', date: 'Jul 12', time: '17:45', price: 350, status: 'Filling fast', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', rating: 4.8 },
  { id: '5', title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'DY Patil Stadium', date: 'Jan 18', time: '18:00', price: 4500, status: 'Waitlist', image: 'https://images.unsplash.com/photo-1470229722913-7c090be3226a?q=80&w=800&auto=format&fit=crop', rating: 5.0 },
  { id: '6', title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venue: 'Balewadi Stadium', date: 'Dec 10', time: '19:30', price: 999, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop', rating: 4.9 },
  { id: '7', title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venue: 'KTPO', date: 'Dec 29', time: '15:00', price: 3000, status: 'Available', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', rating: 4.6 },
  { id: '8', title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venue: 'PVR Director\\\'s Cut', date: 'Dec 01', time: '21:00', price: 800, status: 'Sold out', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop', rating: 4.5 },
  { id: '9', title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Mahalaxmi Racecourse', date: 'Mar 16', time: '19:00', price: 5500, status: 'Available', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop', rating: 4.8 },
  { id: '10', title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venue: 'Siri Fort Aud.', date: 'Oct 22', time: '20:00', price: 1499, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1527224857830-43a7eaa58c73?q=80&w=800&auto=format&fit=crop', rating: 4.7 }
];`;
code = code.replace(eventsRegex, newEvents);

// 4. Update Studio component tabs
code = code.replace(
  "{['Venues', 'Seat layouts', 'Roles'].map",
  "{['Venues', 'Seat layouts', 'Support tickets'].map"
);

// Check if string contains "A" or "A " because of previous encoding issue from prettier
code = code.replace(/A/g, '·');
code = code.replace(/A /g, '·');

code = code.replace(
  "<><div className=\"mt-14 grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4\">",
  "<div className=\"mt-14 flex gap-6 border-b border-foreground/15\">{['Overview', 'Support tickets'].map(t => <button key={t} onClick={() => setTab(t)} className={`pb-4 text-sm ${tab === t ? 'border-b-2 border-accent text-accent' : 'text-foreground/50'}`}>{t}</button>)}</div>{tab === 'Overview' ? <><div className=\"mt-8 grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4\">"
);

code = code.replace(
  "112 of 120 seats booked · ?2,53,440 gross</p></div></>",
  "112 of 120 seats booked · ?2,53,440 gross</p></div></> : <div className=\"mt-8 border border-foreground/15 bg-card p-7\"><h2 className=\"display-font text-4xl\">Support tickets</h2><p className=\"mt-3 text-sm text-foreground/55\">Customer queries for your events.</p><div className=\"mt-6 space-y-4\"><div className=\"border-b border-foreground/10 pb-4\"><span className=\"mono-label text-[10px] text-accent\">New</span><p className=\"mt-1 text-sm font-medium\">Location issue - Your event</p><p className=\"mt-1 text-xs text-foreground/60\">Customer reported wrong map pin for the venue.</p><button className=\"mt-3 text-[10px] uppercase tracking-wider text-accent\">Resolve</button></div></div></div>}"
);

code = code.replace(
  "text-foreground/55\">{tab === 'Venues' ? '120 seats · New York' : 'Manage the details that keep the room ready.'}</p><button className=\"mt-8 border border-foreground/20 px-4 py-3 text-xs font-semibold\" data-testid=\"button-admin-action\">Edit {tab.toLowerCase()}</button></div></>",
  "text-foreground/55\">{tab === 'Venues' ? '120 seats · New York' : tab === 'Support tickets' ? 'System wide customer support queries.' : 'Manage the details that keep the room ready.'}</p>{tab === 'Support tickets' ? <div className=\"mt-6 space-y-4\"><div className=\"border-b border-foreground/10 pb-4\"><span className=\"mono-label text-[10px] text-accent\">New</span><p className=\"mt-1 text-sm font-medium\">Name/ID issue</p><p className=\"mt-1 text-xs text-foreground/60\">Customer needs to update name on ticket for transfer.</p><button className=\"mt-3 text-[10px] uppercase tracking-wider text-accent\">Resolve</button></div><div className=\"border-b border-foreground/10 pb-4\"><span className=\"mono-label text-[10px] text-accent\">New</span><p className=\"mt-1 text-sm font-medium\">Location issue - System wide</p><p className=\"mt-1 text-xs text-foreground/60\">Customer reported wrong map pin for the venue.</p><button className=\"mt-3 text-[10px] uppercase tracking-wider text-accent\">Resolve</button></div></div> : <button className=\"mt-8 border border-foreground/20 px-4 py-3 text-xs font-semibold\" data-testid=\"button-admin-action\">Edit {tab.toLowerCase()}</button>}</div></>"
);

// Fix New York in Admin tab to Mumbai
code = code.replace(
  "'120 seats · New York'",
  "'120 seats · Mumbai'"
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', code);
