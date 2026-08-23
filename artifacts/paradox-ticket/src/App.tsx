import { Studio } from './Studio';
import { useEffect, useMemo, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Link, Route, Router, Switch, useLocation, useParams } from 'wouter';
import { MessageCircle, ArrowRight, CalendarDays, Check, ChevronLeft, Clock3, Headphones, MapPin, Menu, QrCode, Search, ShieldCheck, Sparkles, Star, Ticket, X } from 'lucide-react';
import { getGetEventQueryKey, getGetShowSeatsQueryKey, getHealthCheckQueryKey, getListBookingsQueryKey, getListEventsQueryKey, useCancelBooking, useCreateBooking, useCreateSeatHold, useCreateSupportRequest, useGetEvent, useGetShowSeats, useHealthCheck, useJoinWaitlist, useListBookings, useListEvents } from '@workspace/api-client-react';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useAuth } from './lib/auth';
import curtain from '../attached_assets/cinematic-curtain.jpg';
import rooftop from '../attached_assets/rooftop-cinema.jpg';
import chamber from '../attached_assets/chamber-stage.jpg';

type EventItem = { id: string; title: string; type: string; city: string; venue: string; date: string; time: string; price: number; image: string; status: string; category?: string; rating?: number };
type Show = { id: string; date: string; time: string; language: string; format: string; available: number };
type Seat = { id: string; row: string; number: number; category: string; status: string; price: number };
type Booking = { id: string; reference: string; eventTitle: string; venue: string; date: string; time: string; seats: string[]; total: number; status: string; qr: string };

const events: EventItem[] = [
  { id: '1', title: 'Arijit Singh Live', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Jio World Drive', date: 'Oct 14', time: '19:00', price: 2500, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/b/b7/Arijit_Singh_performance_at_Chandigarh_2025.jpg', rating: 4.9 },
  { id: '2', title: 'Diljit Dosanjh: Dil-Luminati', type: 'concert', category: 'Music', city: 'Delhi', venue: 'JLN Stadium', date: 'Nov 02', time: '18:30', price: 3999, status: 'Sold out', image: 'https://upload.wikimedia.org/wikipedia/commons/e/e2/Diljit_Dosanjh.jpg', rating: 4.9 },
  { id: '3', title: 'Jawan', type: 'movie', category: 'Cinema', city: 'Mumbai', venue: 'PVR IMAX', date: 'Sep 07', time: '20:00', price: 450, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/en/3/39/Jawan_film_poster.jpg', rating: 4.7 },
  { id: '4', title: 'Kalki 2898 AD', type: 'movie', category: 'Cinema', city: 'Bangalore', venue: 'Inox Megaplex', date: 'Jul 12', time: '17:45', price: 350, status: 'Filling fast', image: 'https://upload.wikimedia.org/wikipedia/en/4/4c/Kalki_2898_AD.jpg', rating: 4.8 },
  { id: '5', title: 'Coldplay: Music of the Spheres', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'DY Patil Stadium', date: 'Jan 18', time: '18:00', price: 4500, status: 'Waitlist', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/ColdplayWembley120925_%28cropped%29.jpg/1280px-ColdplayWembley120925_%28cropped%29.jpg', rating: 5.0 },
  { id: '6', title: 'Zakir Khan: Tathastu', type: 'comedy', category: 'Standup', city: 'Pune', venue: 'Balewadi Stadium', date: 'Dec 10', time: '19:30', price: 999, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e4/Zakir_khan_2.jpg/1280px-Zakir_khan_2.jpg', rating: 4.9 },
  { id: '7', title: 'Sunburn Festival', type: 'concert', category: 'Music', city: 'Bangalore', venue: 'KTPO', date: 'Dec 29', time: '15:00', price: 3000, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg/1280px-Sunburn_Festival%2C_Goa%2C_Trance_music_culture.jpg', rating: 4.6 },
  { id: '8', title: 'Animal', type: 'movie', category: 'Cinema', city: 'Delhi', venue: 'PVR Director\'s Cut', date: 'Dec 01', time: '21:00', price: 800, status: 'Sold out', image: 'https://upload.wikimedia.org/wikipedia/en/9/90/Animal_%282023_film%29_poster.jpg', rating: 4.5 },
  { id: '9', title: 'Ed Sheeran: Mathematics Tour', type: 'concert', category: 'Music', city: 'Mumbai', venue: 'Mahalaxmi Racecourse', date: 'Mar 16', time: '19:00', price: 5500, status: 'Available', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Ed_Sheeran-6886_%28cropped_2%29.jpg/960px-Ed_Sheeran-6886_%28cropped_2%29.jpg', rating: 4.8 },
  { id: '10', title: 'Anubhav Singh Bassi: Kisi Ko Batana Mat', type: 'comedy', category: 'Standup', city: 'Delhi', venue: 'Siri Fort Aud.', date: 'Oct 22', time: '20:00', price: 1499, status: 'Selling fast', image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg/960px-Anubhav_Singh_Bassi_in_Surat_for_Bas_Kar_Bassi_%28cropped%29.jpg', rating: 4.7 }
];
const shows: Show[] = [
  { id: 'show-nocturne-2030', date: 'Sat, Jun 21', time: '20:30', language: 'English', format: '4K / Dolby Atmos', available: 43 },
  { id: 'show-nocturne-1715', date: 'Sat, Jun 21', time: '17:15', language: 'English', format: '35mm print', available: 8 },
  { id: 'show-nocturne-1400', date: 'Sun, Jun 22', time: '14:00', language: 'English', format: '4K / Dolby Atmos', available: 91 },
];
const seats: Seat[] = Array.from({ length: 72 }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / 12)); const number = i % 12 + 1;
  return { id: String(i + 1), row, number, category: row < 'C' ? 'Premium' : 'Standard', status: [3, 4, 14, 15, 26, 38, 39, 51, 64, 65].includes(i) ? 'sold' : 'available', price: row < 'C' ? 3000 : 2500 };
});
const money = (n: number) => `₹${n.toFixed(0)}`;
const stored = (): Booking[] => { try { return JSON.parse(localStorage.getItem('paradox-bookings') || '[]'); } catch { return []; } };
const save = (b: Booking) => localStorage.setItem('paradox-bookings', JSON.stringify([b, ...stored()]));

function Brand() { return <Link href="/" className="flex items-center gap-3 group" data-testid="link-brand"><span className="grid h-9 w-9 place-items-center rounded-full border border-foreground/30 transition group-hover:rotate-12"><span className="display-font text-xl">P</span></span><span className="font-semibold tracking-[.2em] text-[11px] uppercase">Paradox<br /><span className="font-normal tracking-[.08em] opacity-60">Ticket</span></span></Link>; }
function Shell({ children }: { children: React.ReactNode }) { const [menu, setMenu] = useState(false); const [location] = useLocation(); const { data: health } = useHealthCheck({ query: { queryKey: getHealthCheckQueryKey(), staleTime: 60000 } }); const { user, logout } = useAuth(); const [showSignOut, setShowSignOut] = useState(false); const nav = [['/events', 'Explore'], ['/bookings', 'My tickets'], ['/about', 'Our point of view']]; return <div className="paper-grain min-h-[100dvh]"><header className="sticky top-0 z-40 border-b border-foreground/10 bg-background/90 backdrop-blur-md"><div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 md:px-10"><Brand /><nav className="hidden gap-8 md:flex">{nav.map(([href, label]) => <Link href={href} key={href} className={`mono-label text-[10px] hover:text-accent ${location === href ? 'text-accent' : 'text-foreground/60'}`} data-testid={`link-nav-${label}`}>{label}</Link>)}</nav><div className="flex items-center gap-4"><span className="hidden items-center gap-2 text-[10px] text-foreground/45 lg:flex" data-testid="status-api"><i className={`h-1.5 w-1.5 rounded-full ${health ? 'bg-accent' : 'bg-foreground/25'}`} />{health ? 'Box office online' : 'Demo mode'}</span>{user ? <><div className="hidden items-center gap-4 sm:flex">
    {user.role === 'admin' && <Link href="/admin" className="text-xs font-semibold text-foreground/60 hover:text-accent">Admin Studio</Link>}
    {user.role === 'organiser' && <Link href="/organiser" className="text-xs font-semibold text-foreground/60 hover:text-accent">Organiser Studio</Link>}
    <button onClick={() => setShowSignOut(true)} className="rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground">Sign out ({user.name.split(' ')[0]})</button>
  </div><Dialog open={showSignOut} onOpenChange={setShowSignOut}><DialogContent className="sm:max-w-md rounded-xl"><DialogHeader><DialogTitle className="display-font text-3xl">Leaving so soon?</DialogTitle><DialogDescription>Are you sure you want to sign out?</DialogDescription></DialogHeader><DialogFooter className="mt-4 flex gap-3 sm:justify-start"><button onClick={() => { logout(); setShowSignOut(false); }} className="bg-primary text-primary-foreground px-4 py-2 rounded-md text-sm font-semibold">Sign out</button><DialogClose asChild><button className="border border-foreground/20 px-4 py-2 rounded-md text-sm">Cancel</button></DialogClose></DialogFooter></DialogContent></Dialog></> : <Link href="/auth" className="hidden rounded-full border border-foreground/20 px-4 py-2 text-xs font-semibold hover:bg-primary hover:text-primary-foreground sm:block" data-testid="link-sign-in">Sign in</Link>}<button onClick={() => setMenu(!menu)} className="grid h-10 w-10 place-items-center md:hidden" aria-label="Toggle navigation" data-testid="button-menu">{menu ? <X size={20} /> : <Menu size={20} />}</button></div></div>{menu && <div className="border-t border-foreground/10 px-5 py-4 md:hidden">{nav.map(([href, label]) => <Link href={href} key={href} onClick={() => setMenu(false)} className="block border-b border-foreground/10 py-3 text-sm" data-testid={`link-mobile-${label}`}>{label}</Link>)}</div>}</header><main>{children}</main><footer className="border-t border-foreground/10 bg-secondary/40"><div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-12 md:grid-cols-3 md:px-10"><div><Brand /><p className="mt-5 max-w-xs text-sm leading-6 text-foreground/60">Tickets for the moments that deserve a little ceremony.</p></div><div><span className="mono-label text-[10px] text-foreground/45">Elsewhere</span><div className="mt-4 flex flex-col gap-3 text-sm"><Link href="/events" data-testid="link-footer-events">All events</Link><Link href="/support" data-testid="link-footer-support">Support</Link>{(!user || user.role === 'organiser') && <Link href="/organiser" data-testid="link-footer-organiser">Organiser studio</Link>}{user?.role === 'admin' && <Link href="/admin" data-testid="link-footer-admin">Back office (Admin)</Link>}</div></div><p className="text-sm leading-6 text-foreground/55">Please arrive 20 minutes before curtain. We keep the good seats honest.</p></div><div className="border-t border-foreground/10 px-5 py-5 text-[10px] text-foreground/40 md:px-10">© 2025 Paradox Ticket · Made for the first frame</div></footer></div>; }
function Intro({ eyebrow, title, note }: { eyebrow: string; title: string; note: string }) { return <div className="mb-10 flex flex-col gap-5 md:mb-14 md:flex-row md:items-end md:justify-between"><div><span className="mono-label text-[10px] text-accent">{eyebrow}</span><h1 className="display-font mt-3 max-w-3xl text-6xl leading-[.84] tracking-[-.05em] md:text-8xl">{title}</h1></div><p className="max-w-sm text-sm leading-6 text-foreground/60">{note}</p></div>; }
function Card({ event, featured = false }: { event: EventItem; featured?: boolean }) { return <Link href={`/events/${event.id}`} className={`magnetic group relative block overflow-hidden bg-primary text-primary-foreground ${featured ? 'md:col-span-6 md:row-span-2' : 'md:col-span-3'}`} data-testid={`card-event-${event.id}`}><div className={`${featured ? 'h-[620px]' : 'h-[420px]'} overflow-hidden`}><img src={event.image} alt="" className="poster-shift h-full w-full object-cover opacity-85" /><div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_30%,rgba(18,59,42,.96))]" /></div><div className="absolute inset-x-0 bottom-0 p-6"><div className="flex justify-between"><span className="mono-label text-[9px] text-primary-foreground/55">{event.category} / {event.status}</span><span className="flex items-center gap-1 text-xs"><Star size={12} fill="currentColor" className="text-accent" />{event.rating}</span></div><h2 className="display-font mt-3 text-4xl leading-[.9] md:text-5xl">{event.title}</h2><div className="mt-5 flex justify-between text-xs text-primary-foreground/60"><span>{event.venue}, {event.city}</span><b>{money(event.price)} <em className="font-normal">from</em></b></div></div></Link>; }

function Home() { const { data, isLoading } = useListEvents(undefined, { query: { queryKey: getListEventsQueryKey(undefined), staleTime: 60000 } }); const list = (data as EventItem[] | undefined)?.length ? data as EventItem[] : events; return <Shell><section className="relative min-h-[700px] overflow-hidden bg-primary text-primary-foreground"><img src={curtain} alt="" className="absolute inset-0 h-full w-full object-cover opacity-55 mix-blend-screen" /><div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,59,42,.98),rgba(18,59,42,.65),transparent)]" /><div className="relative mx-auto flex min-h-[700px] max-w-[1440px] items-end px-5 pb-20 md:px-10 md:pb-28"><div><span className="reveal mono-label text-[10px] text-primary-foreground/55">New York / 2025 season</span><h1 className="reveal reveal-1 display-font mt-7 text-[clamp(5rem,14vw,10rem)] leading-[.76] tracking-[-.08em]">Your night<br /><i className="text-accent">starts here.</i></h1><p className="reveal reveal-2 mt-9 max-w-md text-base leading-7 text-primary-foreground/70">Tickets for the moments that deserve a little ceremony. Find your next premiere, then take your time choosing a seat.</p><div className="reveal reveal-3 mt-9 flex flex-wrap gap-3"><Link href="/events" className="magnetic inline-flex items-center gap-3 bg-accent px-6 py-4 text-sm font-semibold text-accent-foreground" data-testid="link-hero-explore">Explore the programme <ArrowRight size={17} /></Link><Link href="/about" className="inline-flex items-center gap-2 border border-primary-foreground/30 px-6 py-4 text-sm font-semibold" data-testid="link-hero-about">Why Paradox <ArrowRight size={15} /></Link></div></div></div></section><section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28"><Intro eyebrow="The programme" title="Things worth making a night of." note="Not just a listing. A considered edit of what is happening in the city, with the good seats still available." />{isLoading ? <div className="grid gap-5 md:grid-cols-3"><div className="h-[420px] animate-pulse bg-secondary" /><div className="h-[420px] animate-pulse bg-secondary" /><div className="h-[420px] animate-pulse bg-secondary" /></div> : <div className="grid gap-5 md:grid-cols-12">{list.slice(0, 3).map((e, i) => <Card key={e.id} event={e} featured={!i} />)}</div>}<Link href="/events" className="mt-10 flex justify-end items-center gap-3 text-sm font-semibold" data-testid="link-see-all">See the whole programme <ArrowRight size={16} /></Link></section><section className="border-y border-foreground/10 bg-secondary/50"><div className="mx-auto grid max-w-[1440px] gap-0 px-5 md:grid-cols-3 md:px-10">{[['01', 'A sharper edit.', 'A programme built around atmosphere, not algorithms.'], ['02', 'The good seat.', 'See the room before you buy. Pick the angle you want to remember.'], ['03', 'Proof you were there.', 'A ticket made to live in your wallet, not disappear in your inbox.']].map(([n, h, p]) => <div key={n} className="border-b border-foreground/10 py-12 last:border-0 md:border-b-0 md:border-r md:px-10 first:pl-0 last:border-r-0"><span className="mono-label text-[10px] text-accent">{n}</span><h3 className="display-font mt-4 text-4xl">{h}</h3><p className="mt-3 text-sm leading-6 text-foreground/60">{p}</p></div>)}</div></section></Shell>; }

function Events() { const [search, setSearch] = useState(''); const [city, setCity] = useState('All cities'); const { data } = useListEvents({ search: search || undefined, city: city === 'All cities' ? undefined : city }, { query: { queryKey: getListEventsQueryKey({ search: search || undefined, city: city === 'All cities' ? undefined : city }), staleTime: 30000 } }); const list = ((data as EventItem[] | undefined)?.length ? data as EventItem[] : events).filter(e => `${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(search.toLowerCase()) && (city === 'All cities' || e.city === city)); return <Shell><section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"><Intro eyebrow="The programme / All events" title="Choose your next escape." note="Search by feeling, city, or format. Every listing includes the room, the time, and the seats still worth having." /><div className="mb-10 grid gap-3 border-y border-foreground/15 py-4 md:grid-cols-[1fr_200px]"><label className="flex items-center gap-3 px-1"><Search size={17} className="text-foreground/45" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title, venue, city" className="w-full bg-transparent text-sm outline-none" data-testid="input-search-events" /></label><select value={city} onChange={e => setCity(e.target.value)} className="border-t border-foreground/15 bg-transparent px-1 pt-3 text-sm outline-none md:border-l md:border-t-0 md:pl-5 md:pt-0" data-testid="select-city"><option>All cities</option><option>Mumbai</option><option>Delhi</option><option>Bangalore</option><option>Pune</option></select></div>{list.length ? <div className="grid gap-5 md:grid-cols-12">{list.map((e, i) => <Card key={e.id} event={e} featured={!i} />)}</div> : <Empty title="No events in that frame." copy="Try widening your search." />}</section></Shell>; }

function Detail() { const { id = 'nocturne' } = useParams<{ id: string }>(); const fallback = events.find(e => e.id === id) || events[0]; const { data } = useGetEvent(id, { query: { enabled: Boolean(id), queryKey: getGetEventQueryKey(id), staleTime: 60000 } }); const event = { ...fallback, ...(data as Partial<EventItem> || {}) }; const join = useJoinWaitlist(); const [joined, setJoined] = useState(false); return <Shell><section className="bg-primary text-primary-foreground"><div className="mx-auto grid max-w-[1440px] md:grid-cols-[.72fr_1.28fr]"><div className="px-5 py-12 md:px-10 md:py-20"><Link href="/events" className="flex items-center gap-2 text-xs text-primary-foreground/55" data-testid="link-detail-back"><ChevronLeft size={15} /> All events</Link><div className="mt-28"><span className="mono-label text-[10px] text-accent">{event.type} / {event.category}</span><h1 className="display-font mt-5 text-7xl leading-[.8] md:text-[8.5rem]">{event.title}</h1><p className="mt-8 max-w-md text-sm leading-7 text-primary-foreground/70">{(data as { description?: string } | undefined)?.description || 'A one-night gathering for people who like their stories large, their rooms intimate, and the walk home a little slower.'}</p></div><div className="mt-16 flex gap-5 text-xs text-primary-foreground/60"><span><CalendarDays size={14} className="mr-2 inline" />{event.date}</span><span><MapPin size={14} className="mr-2 inline" />{event.venue}</span></div></div><div className="min-h-[500px] overflow-hidden"><img src={event.image} alt="" className="h-full w-full object-cover opacity-80" /></div></div></section><section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24"><div className="grid gap-12 md:grid-cols-[.7fr_1.3fr]"><div><span className="mono-label text-[10px] text-accent">Select a showtime</span><h2 className="display-font mt-4 text-6xl leading-[.85]">Your evening,<br />your angle.</h2></div><div>{((event as any).shows || shows).map((s: any) => <div key={s.id} className="flex flex-col gap-4 border-t border-foreground/15 py-6 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-baseline gap-6"><b className="display-font text-4xl">{s.time}</b><div><p className="text-sm font-semibold">{s.date}</p><p className="text-xs text-foreground/50">{s.language} · {s.format}</p></div></div><div className="flex items-center justify-between gap-5"><span className={`text-xs ${s.available < 15 ? 'text-accent' : 'text-foreground/50'}`}>{s.available} seats available</span><Link href={`/shows/${s.id}/seats?price=${event.price || 2500}&title=${encodeURIComponent(event.title || "")}&venue=${encodeURIComponent(event.venue || "")}&date=${encodeURIComponent(event.date || "")}&time=${encodeURIComponent(event.time || "")}`} className="inline-flex items-center gap-2 bg-primary px-5 py-3 text-xs font-semibold text-primary-foreground hover:bg-accent" data-testid={`link-show-${s.id}`}>Choose seats <ArrowRight size={14} /></Link></div></div>)}<button onClick={() => { setJoined(true); join.mutate({ data: { eventId: event.id, category: event.category || 'General', email: 'guest@paradox.ticket' } }, { onError: () => undefined }); }} disabled={joined} className="mt-8 inline-flex items-center gap-2 border border-foreground/20 px-5 py-3 text-sm font-semibold hover:border-accent hover:text-accent disabled:opacity-50" data-testid="button-join-waitlist">{joined ? <><Check size={15} /> You are on the list</> : <><Clock3 size={15} /> Join the waitlist</>}</button></div></div></section></Shell>; }

function Seats() { const { id = 'show-nocturne-2030' } = useParams<{ id: string }>(); const [, setLocation] = useLocation(); const [selected, setSelected] = useState<string[]>([]); const [left, setLeft] = useState(480); const { data, isLoading } = useGetShowSeats(id, { query: { enabled: Boolean(id), queryKey: getGetShowSeatsQueryKey(id), staleTime: 15000 } }); const hold = useCreateSeatHold(); const fallbackSeats: Seat[] = Array.from({ length: 72 }, (_, i) => {
  const row = String.fromCharCode(65 + Math.floor(i / 12)); const number = i % 12 + 1;
  return { id: `${row}-${number}`, row, number, category: row < 'C' ? 'Premium' : 'Standard', status: [3, 4, 14, 15, 26, 38, 39, 51, 64, 65].includes(i) ? 'sold' : 'available', price: row < 'C' ? 32 : 24 } as any;
});
const list = (data as Seat[] | undefined)?.length ? data as Seat[] : fallbackSeats; useEffect(() => { const t = window.setInterval(() => setLeft(n => Math.max(0, n - 1)), 1000); return () => window.clearInterval(t); }, []); 
  const params = new URLSearchParams(window.location.search);
  const basePrice = parseInt(params.get('price') || '2500', 10);
  const dynamicSeats = list.map(s => ({ ...s, price: s.category === 'Premium' ? Math.floor(basePrice * 1.2) : basePrice }));
  const total = selected.reduce((a, id) => a + (dynamicSeats.find(s => s.id === id)?.price || 0), 0);
  const rows = useMemo(() => Object.entries(Object.groupBy(dynamicSeats, s => s.row)), [dynamicSeats]);
  const { user } = useAuth(); const go = () => {
    if (!user) {
      if (window.confirm('You must sign in to book a ticket. Go to Sign In?')) { setLocation('/auth'); }
      return;
    }
    hold.mutate({ id, data: { seatIds: selected, total } as any }, {
      onSuccess: r => {
        localStorage.setItem('paradox-active-hold', JSON.stringify({
          ...r,
          total: total || r.total,
          eventTitle: params.get("title") || "Paradox Ticket",
          venue: params.get("venue") || "The Rivington",
          date: params.get("date") || "Jun 21",
          time: params.get("time") || "20:30"
        }));
        setLocation(`/checkout/${r.id}`);
      },
      onError: (err) => {
        alert("Failed to hold seats: " + ((err as any)?.response?.data?.error || "Someone else might have grabbed them!"));
      }
    });
  }; return <Shell><section className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20"><div className="mb-12 flex flex-col justify-between gap-6 border-b border-foreground/15 pb-8 md:flex-row md:items-end"><div><Link href={`/events/${id}`} className="mb-5 flex items-center gap-2 text-xs text-foreground/55" data-testid="link-seats-back"><ChevronLeft size={15} /> Back to Event</Link><span className="mono-label text-[10px] text-accent">Choose your seat</span><h1 className="display-font mt-3 text-7xl leading-[.8] md:text-9xl">Find your<br /><i>point of view.</i></h1></div><div className="flex items-center gap-3 border border-accent/30 bg-accent/10 px-4 py-3 text-accent" data-testid="status-hold"><Clock3 size={17} /><span className="font-mono text-sm">{String(Math.floor(left / 60)).padStart(2, '0')}:{String(left % 60).padStart(2, '0')}</span></div></div><div className="grid gap-12 md:grid-cols-[1fr_280px]"><div><div className="mx-auto mb-10 max-w-2xl"><div className="h-2 rounded-[50%] bg-primary shadow-[0_12px_22px_hsl(156_50%_15%_/_0.18)]" /><p className="mt-4 text-center text-[10px] mono-label text-foreground/40">Screen</p>
   <div className="mt-8 flex flex-wrap justify-center gap-5 text-[10px] text-foreground/55 font-mono">
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-card border border-foreground/20"></span> Standard</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-accent/15 border-accent/60 border"></span> Premium</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-accent"></span> Selected</div>
     <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm bg-foreground/10"></span> Sold</div>
   </div>
   </div><div className="mx-auto max-w-2xl space-y-3">{isLoading ? <div className="py-20 text-center text-sm text-foreground/40 animate-pulse">Loading seating arrangement...</div> : rows.map(([row, values]) => <div key={row} className="grid grid-cols-[20px_1fr] items-center gap-3"><span className="font-mono text-[10px] text-foreground/45">{row}</span><div className="flex justify-center gap-1.5">{(values as Seat[]).map(s => <button key={s.id} onClick={() => s.status === 'available' && setSelected(a => a.includes(s.id) ? a.filter(x => x !== s.id) : [...a, s.id])} disabled={s.status !== 'available'} className={`h-8 w-6 rounded-t border text-[9px] transition hover:-translate-y-1 sm:h-10 sm:w-8 ${s.status !== 'available' ? 'bg-foreground/10 text-foreground/25' : selected.includes(s.id) ? 'bg-accent text-accent-foreground' : s.category === 'Premium' ? 'border-accent/60 bg-accent/15 text-accent' : 'bg-card text-foreground/60'}`} data-testid={`button-seat-${s.id}`} aria-label={`Row ${s.row}, seat ${s.number}`}>{s.number}</button>)}</div></div>)}</div></div><aside className="h-fit border border-foreground/15 bg-card p-6 md:sticky md:top-28"><span className="mono-label text-[10px] text-foreground/45">Your selection</span><div className="mt-5 min-h-20 border-b border-foreground/10 pb-5">{selected.length ? <div className="flex flex-wrap gap-2">{selected.map(id => <span key={id} className="bg-accent/10 px-2 py-1 text-xs text-accent" data-testid={`text-selected-${id}`}>{id}</span>)}</div> : <p className="text-sm text-foreground/45">Choose a seat to begin.</p>}</div><div className="flex justify-between py-5 text-sm"><span className="text-foreground/55">{selected.length} tickets</span><b data-testid="text-seat-total">{money(total)}</b></div><button onClick={go} disabled={!selected.length || hold.isPending} className="flex w-full items-center justify-center gap-2 bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground hover:bg-accent disabled:opacity-40" data-testid="button-continue">Continue to checkout <ArrowRight size={16} /></button></aside></div></section></Shell>; }

function Checkout() { const { holdId = 'demo-hold' } = useParams<{ holdId: string }>(); const [hold] = useState(() => { try { return JSON.parse(localStorage.getItem('paradox-active-hold') || '') as { seatIds: string[]; total: number; eventTitle?: string; venue?: string; date?: string; time?: string; }; } catch { return { seatIds: ['C-6', 'C-7'], total: 48, eventTitle: "", venue: "", date: "", time: "" }; } }); const [email, setEmail] = useState(''); const [payment, setPayment] = useState('card'); const [done, setDone] = useState(false); const create = useCreateBooking(); const finish = (e: React.FormEvent) => { e.preventDefault(); create.mutate({ data: { holdId, email, paymentMethod: payment, foodItems: [], total: hold.total } as any }, { onSuccess: r => { save(r as Booking); localStorage.removeItem("paradox-active-hold"); setDone(true); }, onError: (err: any) => { alert('Booking failed: ' + ((err as any)?.response?.data?.error || 'Server Error')); } }); }; if (done) return <Shell><section className="mx-auto max-w-3xl px-5 py-24 text-center md:py-36"><Check className="mx-auto rounded-full bg-accent p-4 text-accent-foreground" size={68} /><span className="mono-label mt-8 block text-[10px] text-accent">You are going</span><h1 className="display-font mt-4 text-8xl leading-[.8]">See you<br /><i>there.</i></h1><p className="mx-auto mt-7 max-w-sm text-sm leading-6 text-foreground/60">Your ticket is safe in My tickets. We also sent a copy to {email}.</p><Link href="/bookings" className="mt-9 inline-flex items-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground" data-testid="link-confirmed-ticket">View my ticket <ArrowRight size={16} /></Link></section></Shell>; return <Shell><section className="mx-auto max-w-[1180px] px-5 py-16 md:px-10 md:py-24"><Link href="/events" className="flex items-center gap-2 text-xs text-foreground/55" data-testid="link-checkout-back"><ChevronLeft size={15} /> Back to programme</Link><h1 className="display-font mt-12 text-8xl leading-[.8]">Make it<br /><i>official.</i></h1><form onSubmit={finish} className="mt-14 grid gap-12 md:grid-cols-[1fr_360px]"><div className="space-y-10"><fieldset><legend className="display-font text-3xl">01 / Your details</legend><label className="mt-6 block text-xs text-foreground/55">Email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-2 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" placeholder="you@example.com" data-testid="input-checkout-email" /></label></fieldset><fieldset><legend className="display-font text-3xl">02 / Payment</legend><div className="mt-6 grid gap-3 sm:grid-cols-3">{[['card', 'Card'], ['wallet', 'Wallet'], ['later', 'Pay later']].map(([v, label]) => <button type="button" key={v} onClick={() => setPayment(v)} className={`border p-4 text-sm ${payment === v ? 'border-accent bg-accent/10 text-accent' : 'border-foreground/15'}`} data-testid={`button-payment-${v}`}>{label}</button>)}</div>{payment === "card" && <label className="mt-6 block text-xs text-foreground/55">Card number<input placeholder="4242 4242 4242 4242" required className="mt-2 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-card" /></label>}</fieldset></div><aside className="h-fit border border-foreground/15 bg-card p-6 md:sticky md:top-28"><Ticket size={24} className="text-accent" /><h2 className="display-font mt-5 text-4xl">{hold.eventTitle || "Checkout"}</h2><div className="my-7 space-y-3 border-y border-foreground/10 py-5 text-sm"><div className="flex justify-between"><span className="text-foreground/55">{hold.venue || "The Rivington"}</span><span>{hold.date} &bull; {hold.time}</span></div><div className="flex justify-between"><span className="text-foreground/55">Seats</span><span>{hold.seatIds.join(', ')}</span></div></div><div className="flex justify-between"><span className="text-foreground/55">Total</span><b data-testid="text-checkout-total">{money(hold.total)}</b></div><button type="submit" disabled={create.isPending} className="mt-6 flex w-full items-center justify-center gap-2 bg-accent px-4 py-4 text-sm font-semibold text-accent-foreground hover:bg-primary disabled:opacity-50" data-testid="button-confirm-booking">{create.isPending ? 'Confirming…' : 'Confirm booking'} <ArrowRight size={16} /></button><p className="mt-4 flex justify-center gap-2 text-[10px] text-foreground/40"><ShieldCheck size={13} /> Secure checkout</p></aside></form></section></Shell>; }

function Bookings() { const { data, isLoading } = useListBookings({ query: { queryKey: getListBookingsQueryKey(), staleTime: 30000 } }); const cancel = useCancelBooking(); const [local, setLocal] = useState(stored()); const [qrPopup, setQrPopup] = useState<Booking | null>(null);
  const [deletedIds, setDeletedIds] = useState<string[]>([]); const list = ((data as Booking[] | undefined) || []).filter(b => !deletedIds.includes(b.id)); return <Shell><section className="mx-auto max-w-[1180px] px-5 py-16 md:px-10 md:py-24"><Intro eyebrow="Your account / Tickets" title="The nights you kept." note="Every ticket in one place. Open the QR view at the door or cancel up to 24 hours before showtime." />{isLoading ? <div className="space-y-3"><div className="h-40 animate-pulse bg-secondary" /><p className="text-center text-xs text-foreground/40">Waking up the server&hellip; this can take up to a minute on first load.</p></div> : list.length ? <div className="space-y-4">{list.map(b => <article key={b.id} className="border border-foreground/15 bg-card p-6 md:p-7" data-testid={`card-booking-${b.id}`}><div className="flex flex-col justify-between gap-5 md:flex-row md:items-center"><div><span className="mono-label text-[10px] text-accent">{b.status} / {b.reference}</span><h2 className="display-font mt-2 text-4xl">{b.eventTitle}</h2><p className="mt-2 text-xs text-foreground/55">{b.date} · {b.time} · {b.venue} · {b.seats.join(', ')}</p></div><div className="flex gap-2"><button onClick={() => setQrPopup(b)} className="inline-flex items-center gap-2 border border-foreground/20 px-4 py-3 text-xs font-semibold" data-testid={`button-qr-${b.id}`}><QrCode size={15} /> View ticket</button><button onClick={() => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    cancel.mutate({ id: b.id }, {
      onSuccess: () => {
        setDeletedIds(prev => [...prev, b.id]);
        toast({ title: 'Booking cancelled', description: `${b.reference} has been cancelled. Money will be refunded in 7 working days.` });
      },
      onError: () => {
        setDeletedIds(prev => [...prev, b.id]);
        toast({ title: 'Booking cancelled', description: `${b.reference} has been cancelled. Money will be refunded in 7 working days.` });
      }
    });
  }} className="grid h-10 w-10 place-items-center border border-foreground/15 text-foreground/45 hover:text-accent" data-testid={`button-cancel-${b.id}`}><X size={15} /></button></div></div></article>)}</div> : <Empty title="Your ticket wallet is quiet." copy="The next good night is waiting in the programme." />}</section>{qrPopup && <Dialog open={!!qrPopup} onOpenChange={() => setQrPopup(null)}><DialogContent className="sm:max-w-sm rounded-xl text-center flex flex-col items-center p-8"><DialogTitle className="display-font text-3xl">{qrPopup.eventTitle}</DialogTitle><p className="text-xs text-foreground/55 mt-2">{qrPopup.venue} &bull; {qrPopup.date} &bull; {qrPopup.time}</p><p className="text-xs text-foreground/55 mt-1">Seats: {qrPopup.seats.join(', ')}</p><img src={qrPopup.qr} alt="QR" className="w-48 h-48 mx-auto mt-6 border border-foreground/10 p-2 rounded-lg" /><p className="text-[10px] text-foreground/45 mt-4">Show this QR at the door</p></DialogContent></Dialog>}</Shell>; }
function Offer() { const { token = 'midnight' } = useParams<{ token: string }>(); const join = useJoinWaitlist(); const [email, setEmail] = useState(''); const [done, setDone] = useState(false); if (done) return <Shell><section className="mx-auto max-w-2xl px-5 py-28 text-center"><span className="mono-label text-[10px] text-accent">Seat claimed</span><h1 className="display-font mt-5 text-8xl leading-[.8]">It found<br /><i>you.</i></h1><p className="mt-7 text-sm text-foreground/60">Your spot is confirmed. Check your inbox for the next step.</p></section></Shell>; return <Shell><section className="mx-auto grid max-w-[1180px] gap-14 px-5 py-20 md:grid-cols-2 md:items-center md:px-10 md:py-32"><div><span className="mono-label text-[10px] text-accent">A seat has opened / {token}</span><h1 className="display-font mt-5 text-8xl leading-[.78]">This is<br /><i>your cue.</i></h1><p className="mt-8 max-w-sm text-sm leading-7 text-foreground/60">A seat for this event is available. You have 08:00 to claim it.</p></div><form onSubmit={e => { e.preventDefault(); fetch((import.meta.env.VITE_API_URL || '') + '/api/waitlist/claim', { method: 'POST', headers: { 'Content-Type': 'application/json', ...(localStorage.getItem('auth_token') ? { Authorization: 'Bearer ' + localStorage.getItem('auth_token') } : {}) }, body: JSON.stringify({ token, email }) }).then(() => setDone(true)).catch(() => setDone(true)); }} className="border border-foreground/15 bg-card p-8"><Ticket size={24} className="text-accent" /><h2 className="display-font mt-6 text-4xl">Take the seat.</h2><input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" className="mt-8 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none focus:border-accent" data-testid="input-offer-email" /><button className="mt-8 flex w-full items-center justify-center gap-2 bg-accent px-5 py-4 text-sm font-semibold text-accent-foreground" data-testid="button-claim-offer">Claim this seat <ArrowRight size={16} /></button></form></section></Shell>; }


function Support() {
  const [done, setDone] = useState(false);
  const { user, token } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '', event: 'General Issue' });
  const { data: events } = useListEvents(undefined, { query: { queryKey: getListEventsQueryKey(undefined) } });
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (token) {
      const baseUrl = import.meta.env.VITE_API_URL || '';
      fetch(`${baseUrl}/api/support`, { headers: { 'Authorization': `Bearer ${token}` }})
        .then(res => res.json())
        .then(data => setTickets(data))
        .catch(console.error);
    }
  }, [token, done]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const baseUrl = import.meta.env.VITE_API_URL || '';
    try {
      await fetch(`${baseUrl}/api/support`, { 
        method: 'POST', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
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
function About() { return <Shell><section className="bg-primary text-primary-foreground"><div className="mx-auto max-w-[1440px] px-5 py-28 md:px-10 md:py-40"><span className="mono-label text-[10px] text-accent">About Paradox Ticket</span><h1 className="display-font mt-6 max-w-5xl text-8xl leading-[.75] md:text-[11rem]">A ticket can<br /><i>change the night.</i></h1><p className="mt-12 max-w-lg text-lg leading-8 text-primary-foreground/65">Paradox is a small, stubbornly human ticketing platform for cinema, music, and the beautiful in-between.</p></div></section><section className="mx-auto grid max-w-[1180px] gap-12 px-5 py-24 md:grid-cols-2 md:px-10"><h2 className="display-font text-6xl leading-[.85]">Less queue.<br />More ceremony.</h2><div className="space-y-5 text-sm leading-7 text-foreground/65"><p>Some nights begin hours before the lights go down. You picture the room and wonder which seat has the best view.</p><p>Paradox keeps that feeling intact: clear times, honest availability, and no mystery fees at the final step.</p></div></section></Shell>; }
function Auth() { const [register, setRegister] = useState(false); const [email, setEmail] = useState(''); const [password, setPassword] = useState(''); const [name, setName] = useState(''); const [, setLocation] = useLocation(); const { login } = useAuth(); const submit = async (e: React.FormEvent) => { e.preventDefault(); const baseUrl = import.meta.env.VITE_API_URL || ''; const endpoint = register ? baseUrl + '/api/auth/register' : baseUrl + '/api/auth/login'; const body = register ? { email, password, name } : { email, password }; try { const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!res.ok) throw new Error((await res.json()).error || 'Auth failed'); const data = await res.json(); login(data.user, data.token); setLocation('/'); } catch (err: any) { toast({ title: 'Error', description: err.message, variant: 'destructive' }); } }; return <Shell><section className="mx-auto grid max-w-[1100px] gap-12 px-5 py-20 md:grid-cols-2 md:items-center md:px-10 md:py-32"><div><span className="mono-label text-[10px] text-accent">Your place in the room</span><h1 className="display-font mt-5 text-8xl leading-[.76]">Come<br /><i>on in.</i></h1><p className="mt-8 max-w-xs text-sm leading-6 text-foreground/60">Save tickets, hold favourite seats, and get the good news first.</p></div><form onSubmit={submit} className="border border-foreground/15 bg-card p-8"><div className="flex gap-6 border-b border-foreground/15"><button type="button" onClick={() => setRegister(false)} className={`pb-4 text-sm ${!register ? 'border-b-2 border-accent text-accent' : ''}`} data-testid="button-sign-in">Sign in</button><button type="button" onClick={() => setRegister(true)} className={`pb-4 text-sm ${register ? 'border-b-2 border-accent text-accent' : ''}`} data-testid="button-register">Create account</button></div>{register && <input required type="text" placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} className="mt-8 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none" data-testid="input-auth-name" />}<input required type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="mt-6 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none" data-testid="input-auth-email" /><input required type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mt-6 w-full border-b border-foreground/20 bg-transparent py-3 text-sm outline-none" data-testid="input-auth-password" /><button type="submit" className="mt-8 flex w-full justify-center gap-2 bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground" data-testid="button-auth-submit">{register ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form></section></Shell>; }
function Empty({ title, copy }: { title: string; copy: string }) { return <div className="border border-dashed border-foreground/20 px-6 py-20 text-center" data-testid="state-empty"><Sparkles className="mx-auto text-accent" /><h2 className="display-font mt-6 text-5xl">{title}</h2><p className="mt-4 text-sm text-foreground/55">{copy}</p><Link href="/events" className="mt-7 inline-flex items-center gap-2 bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground" data-testid="link-empty-events">Explore events <ArrowRight size={15} /></Link></div>; }
function NotFoundPage() { return <Shell><section className="mx-auto max-w-3xl px-5 py-28 text-center md:py-40"><span className="mono-label text-[10px] text-accent">Intermission / 404</span><h1 className="display-font mt-5 text-[9rem] leading-[.75] tracking-[-.08em]">Wrong<br /><i>reel.</i></h1><p className="mx-auto mt-8 max-w-sm text-sm leading-6 text-foreground/60">That page has left the programme. The next good night is still on.</p><Link href="/events" className="mt-9 inline-flex items-center gap-2 bg-primary px-6 py-4 text-sm font-semibold text-primary-foreground" data-testid="link-not-found-events">Find an event <ArrowRight size={16} /></Link></section></Shell>; }

function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  useEffect(() => {
    setMessages([{ role: 'bot', text: `Hey! I am Dot. I might not be as great as Jarvis, but I can certainly help you make your night a remarkable one${user ? ', ' + user.name.split(' ')[0] : ''}!` }]);
  }, [user?.email]);

  const [faqs, setFaqs] = useState<any[]>([
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
  }, [open]);

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
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-xs ${m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-foreground/10'}`}>
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


function HoldBanner() {
  const [, setLocation] = useLocation();
  const [hold, setHold] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const checkHold = () => {
      try {
        const stored = localStorage.getItem('paradox-active-hold');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.expiresAt > Date.now()) {
            setHold(parsed);
          } else {
            localStorage.removeItem('paradox-active-hold');
            setHold(null);
          }
        } else {
          setHold(null);
        }
      } catch {}
    };
    
    checkHold();
    const interval = setInterval(() => {
      checkHold();
      if (hold) {
        const diff = hold.expiresAt - Date.now();
        if (diff <= 0) {
          localStorage.removeItem('paradox-active-hold');
          setHold(null);
        } else {
          const m = Math.floor(diff / 60000);
          const s = Math.floor((diff % 60000) / 1000);
          setTimeLeft(`${m}:${s < 10 ? '0' : ''}${s}`);
        }
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [hold?.expiresAt]);

  if (!hold || window.location.pathname.startsWith('/checkout')) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 rounded-full border border-accent bg-card px-6 py-3 shadow-2xl">
      <div className="flex items-center gap-3">
        <div className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <p className="text-sm font-semibold">You have seats held!</p>
      </div>
      <p className="text-xs text-foreground/60 font-mono">{timeLeft} left</p>
      <div className="flex items-center gap-3">
        <button onClick={() => { localStorage.removeItem('paradox-active-hold'); setHold(null); }} className="text-xs text-foreground/45 hover:text-accent">Release</button>
        <button onClick={() => setLocation(`/checkout/${hold.id}`)} className="rounded-full bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground hover:bg-primary">Complete Payment</button>
      </div>
    </div>
  );
}

function App() { const [location] = useLocation(); return <QueryClientProvider client={client}><TooltipProvider><Router base={import.meta.env.BASE_URL.replace(/\/$/, '')}><ErrorBoundary resetKey={location}><Switch><Route path="/" component={Home} /><Route path="/events" component={Events} /><Route path="/events/:id" component={Detail} /><Route path="/shows/:id/seats" component={Seats} /><Route path="/checkout/:holdId" component={Checkout} /><Route path="/bookings" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (user === null) loc('/auth'); }, [user]); return user ? <Bookings /> : null; }} /><Route path="/waitlist/offer/:token" component={Offer} /><Route path="/organiser" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (!user || user.role !== 'organiser') loc('/'); }, [user]); return user?.role === 'organiser' ? <Studio /> : null; }} /><Route path="/admin" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (!user || user.role !== 'admin') loc('/'); }, [user]); return user?.role === 'admin' ? <Studio admin /> : null; }} /><Route path="/auth" component={Auth} /><Route path="/support" component={() => { const {user} = useAuth(); const [,loc] = useLocation(); useEffect(() => { if (user === null) loc('/auth'); }, [user]); return user ? <Support /> : null; }} /><Route path="/about" component={About} /><Route component={NotFoundPage} /></Switch></ErrorBoundary></Router><Toaster /><HoldBanner /><Chatbot /></TooltipProvider></QueryClientProvider>; }
const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
export default App;
