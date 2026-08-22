const fs = require('fs');
let code = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

const newEvents = `
  const eventsList = [
    { id: '1', title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Jio World Drive', date: 'Oct 14', time: '19:00', price: 2500, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1540039155732-d688126b8b0b?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'Experience the magic.' },
    { id: '2', title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venue: 'JLN Stadium', date: 'Nov 02', time: '18:30', price: 3999, status: 'Sold out', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'The biggest tour of the year.' },
    { id: '3', title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venue: 'PVR IMAX', date: 'Sep 07', time: '20:00', price: 450, status: 'Available', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop', rating: 4.7, description: 'Blockbuster movie.' },
    { id: '4', title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venue: 'Inox Megaplex', date: 'Jul 12', time: '17:45', price: 350, status: 'Filling fast', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', rating: 4.8, description: 'Epic sci-fi.' },
    { id: '5', title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'DY Patil Stadium', date: 'Jan 18', time: '18:00', price: 4500, status: 'Waitlist', image: 'https://images.unsplash.com/photo-1470229722913-7c090be3226a?q=80&w=800&auto=format&fit=crop', rating: 5.0, description: 'Global stadium tour.' },
    { id: '6', title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venue: 'Balewadi Stadium', date: 'Dec 10', time: '19:30', price: 999, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'Laugh out loud.' },
    { id: '7', title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venue: 'KTPO', date: 'Dec 29', time: '15:00', price: 3000, status: 'Available', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', rating: 4.6, description: 'EDM festival.' },
    { id: '8', title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venue: 'PVR Director\\\'s Cut', date: 'Dec 01', time: '21:00', price: 800, status: 'Sold out', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop', rating: 4.5, description: 'Action thriller.' },
    { id: '9', title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Mahalaxmi Racecourse', date: 'Mar 16', time: '19:00', price: 5500, status: 'Available', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop', rating: 4.8, description: 'Live in Mumbai.' },
    { id: '10', title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venue: 'Siri Fort Aud.', date: 'Oct 22', time: '20:00', price: 1499, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1527224857830-43a7eaa58c73?q=80&w=800&auto=format&fit=crop', rating: 4.7, description: 'Standup special.' }
  ];
  res.json(eventsList);
`;

code = code.replace(
  /const eventsList = await db\.select\([\s\S]*?res\.json\(eventsList\.map[\s\S]*?\}\)\)\);/m,
  newEvents
);

code = code.replace(
  /const \[event\] = await db\.select\(\)\.from\(eventsTable\)\.where\(eq\(eventsTable\.id, eventId\)\)\.limit\(1\);[\s\S]*?res\.json\(\{[\s\S]*?\}\);/m,
  `
  const eventsList = [
    { id: '1', title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Jio World Drive', date: 'Oct 14', time: '19:00', price: 2500, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1540039155732-d688126b8b0b?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'Experience the magic.' },
    { id: '2', title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venue: 'JLN Stadium', date: 'Nov 02', time: '18:30', price: 3999, status: 'Sold out', image: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'The biggest tour of the year.' },
    { id: '3', title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venue: 'PVR IMAX', date: 'Sep 07', time: '20:00', price: 450, status: 'Available', image: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=800&auto=format&fit=crop', rating: 4.7, description: 'Blockbuster movie.' },
    { id: '4', title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venue: 'Inox Megaplex', date: 'Jul 12', time: '17:45', price: 350, status: 'Filling fast', image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop', rating: 4.8, description: 'Epic sci-fi.' },
    { id: '5', title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'DY Patil Stadium', date: 'Jan 18', time: '18:00', price: 4500, status: 'Waitlist', image: 'https://images.unsplash.com/photo-1470229722913-7c090be3226a?q=80&w=800&auto=format&fit=crop', rating: 5.0, description: 'Global stadium tour.' },
    { id: '6', title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venue: 'Balewadi Stadium', date: 'Dec 10', time: '19:30', price: 999, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca?q=80&w=800&auto=format&fit=crop', rating: 4.9, description: 'Laugh out loud.' },
    { id: '7', title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venue: 'KTPO', date: 'Dec 29', time: '15:00', price: 3000, status: 'Available', image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=800&auto=format&fit=crop', rating: 4.6, description: 'EDM festival.' },
    { id: '8', title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venue: 'PVR Director\\\'s Cut', date: 'Dec 01', time: '21:00', price: 800, status: 'Sold out', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop', rating: 4.5, description: 'Action thriller.' },
    { id: '9', title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Mahalaxmi Racecourse', date: 'Mar 16', time: '19:00', price: 5500, status: 'Available', image: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=800&auto=format&fit=crop', rating: 4.8, description: 'Live in Mumbai.' },
    { id: '10', title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venue: 'Siri Fort Aud.', date: 'Oct 22', time: '20:00', price: 1499, status: 'Selling fast', image: 'https://images.unsplash.com/photo-1527224857830-43a7eaa58c73?q=80&w=800&auto=format&fit=crop', rating: 4.7, description: 'Standup special.' }
  ];
  
  const event = eventsList.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: "Event not found" });
  
  res.json({
    ...event,
    shows: [
      { id: "1", date: new Date().toISOString(), time: event.time, language: "English/Hindi", format: "Standard", available: 120 }
    ]
  });
`
);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', code);
