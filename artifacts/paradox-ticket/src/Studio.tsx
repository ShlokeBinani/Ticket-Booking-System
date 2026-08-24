import React, { useState, useEffect } from 'react';
import { useAuth } from './lib/auth';

// Using native fetch with the token
const apiFetch = async (path: string, token: string | null, options: any = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL || '';
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers
  };
  const res = await fetch(`${baseUrl}/api${path}`, { ...options, headers });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function Studio({ admin = false }: { admin?: boolean }) {
  const [tab, setTab] = useState(admin ? 'Users' : 'Overview');
  const { user, token } = useAuth();

  // Data states
  const [users, setUsers] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ grossRevenue: 0, ticketsMoved: 0, avgTicket: 0, sellThrough: "0%" });

  // Form states
  const [newVenue, setNewVenue] = useState({ name: '', city: '', address: '', capacity: 120 });
  const [newEvent, setNewEvent] = useState({ title: '', type: 'concert', category: 'Music', description: '', venueId: '', showDate: '' });

  const loadData = async () => {
    try {
      if (admin) {
        setUsers(await apiFetch('/admin/users', token));
        setVenues(await apiFetch('/admin/venues', token));
      } else {
        setMetrics(await apiFetch('/organiser/stats', token));
      }
      setTickets(await apiFetch('/support', token));
      // For events, we can just fetch all events and filter by organiser later or just show all
      setEvents(await apiFetch('/events', null)); // public endpoint
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) loadData();
  }, [token, admin]);

  // Actions
  const updateRole = async (userId: number, role: string) => {
    await apiFetch(`/admin/users/${userId}/role`, token, { method: 'PUT', body: JSON.stringify({ role }) });
    loadData();
  };

  const addVenue = async () => {
    await apiFetch('/admin/venues', token, { method: 'POST', body: JSON.stringify(newVenue) });
    setNewVenue({ name: '', city: '', address: '', capacity: 120 });
    loadData();
  };

  const addEvent = async () => {
    await apiFetch('/organiser/events', token, { method: 'POST', body: JSON.stringify(newEvent) });
    setNewEvent({ title: '', type: 'concert', category: 'Music', description: '', venueId: '', showDate: '' });
    loadData();
  };

  const deleteEvent = async (id: number) => {
    await apiFetch(`/organiser/events/${id}`, token, { method: 'DELETE' });
    loadData();
  };

  const updateTicket = async (id: number, update: any) => {
    await apiFetch(`/support/${id}`, token, { method: 'PUT', body: JSON.stringify(update) });
    loadData();
  };

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-16 md:px-10 md:py-24 text-primary-foreground bg-primary min-h-screen">
      <div className="flex justify-between items-center mb-8"> <span className="mono-label text-[10px] text-accent">{admin ? 'Back office / Paradox' : 'Organiser studio'}</span> <button onClick={() => window.location.href = '/'} className="text-sm border border-primary-foreground/20 px-4 py-2 rounded hover:bg-primary-foreground/10 transition-colors">&larr; Exit Studio</button> </div>
      <h1 className="display-font text-8xl leading-[.8]">{admin ? 'Control Panel' : 'Dashboard'}</h1>
      
      <div className="mt-14 flex flex-wrap gap-6 border-b border-foreground/15 mb-8">
        {(admin ? ['Users', 'Venues', 'Events', 'Support tickets'] : ['Overview', 'Events', 'Support tickets']).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`pb-4 text-sm ${tab === t ? 'border-b-2 border-accent text-accent' : 'text-primary-foreground opacity-50'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'Overview' && !admin && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-6 bg-card border border-foreground/10 text-foreground rounded">
              <p className="text-xs text-primary-foreground opacity-50">Gross Revenue</p>
              <p className="text-3xl mt-2 font-bold">₹{metrics.grossRevenue}</p>
            </div>
            <div className="p-6 bg-card border border-foreground/10 text-foreground rounded">
              <p className="text-xs text-primary-foreground opacity-50">Tickets Moved</p>
              <p className="text-3xl mt-2 font-bold">{metrics.ticketsMoved}</p>
            </div>
          </div>
          
          {metrics.breakdown && metrics.breakdown.length > 0 && (
            <div className="bg-card text-foreground p-6 border border-foreground/10 rounded">
              <h2 className="text-2xl font-bold mb-4">Revenue per event</h2>
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-foreground/10">
                    <th className="pb-2">Event</th>
                    <th className="pb-2">Tickets Sold</th>
                    <th className="pb-2">Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {metrics.breakdown.map((b: any, i: number) => (
                    <tr key={i} className="border-b border-foreground/10 last:border-0">
                      <td className="py-3">{b.title}</td>
                      <td>{b.tickets}</td>
                      <td>₹{b.revenue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'Users' && admin && (
        <div className="bg-card text-foreground p-6 border border-foreground/10 rounded">
          <h2 className="text-2xl font-bold mb-4">Manage Roles</h2>
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-foreground/10"><th className="pb-2">Name</th><th className="pb-2">Email</th><th className="pb-2">Role</th><th className="pb-2">Action</th></tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-foreground/10 last:border-0">
                  <td className="py-3">{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>
                    <select className="bg-transparent border border-foreground/20 p-1" value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}>
                      <option value="customer">Customer</option>
                      <option value="organiser">Organiser</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'Venues' && admin && (
        <div className="space-y-8">
          <div className="bg-card text-foreground p-6 border border-foreground/10 rounded">
            <h2 className="text-2xl font-bold mb-4">Add Venue</h2>
            <div className="grid grid-cols-4 gap-4">
              <input placeholder="Name" value={newVenue.name} onChange={e=>setNewVenue({...newVenue, name:e.target.value})} className="border p-2 bg-transparent text-sm"/>
              <input placeholder="City" value={newVenue.city} onChange={e=>setNewVenue({...newVenue, city:e.target.value})} className="border p-2 bg-transparent text-sm"/>
              <input placeholder="Address" value={newVenue.address} onChange={e=>setNewVenue({...newVenue, address:e.target.value})} className="border p-2 bg-transparent text-sm"/>
              <button onClick={addVenue} className="bg-primary text-primary-foreground text-sm font-bold">Add Venue</button>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-foreground">
            {venues.map(v => (
              <div key={v.id} className="p-4 bg-card border border-foreground/10 rounded">
                <p className="font-bold">{v.name}</p>
                <p className="text-xs">{v.city} - {v.capacity} seats</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Events' && (
        <div className="space-y-8">
          <div className="bg-card text-foreground p-6 border border-foreground/10 rounded">
            <h2 className="text-2xl font-bold mb-4">Add Event</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <input placeholder="Title" value={newEvent.title} onChange={e=>setNewEvent({...newEvent, title:e.target.value})} className="border p-2 bg-transparent text-sm"/>
              <input placeholder="Date (YYYY-MM-DD)" value={newEvent.showDate} onChange={e=>setNewEvent({...newEvent, showDate:e.target.value})} className="border p-2 bg-transparent text-sm"/>
              <select value={newEvent.venueId} onChange={e=>setNewEvent({...newEvent, venueId:e.target.value})} className="border p-2 bg-transparent text-sm">
                <option value="">Select Venue...</option>
                {venues.map((v:any) => <option key={v.id} value={v.id}>{v.name} ({v.city})</option>)}
              </select>
            </div>
            <button onClick={addEvent} className="bg-primary text-primary-foreground px-4 py-2 text-sm font-bold w-full">Create Event</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-foreground">
            {events.map(e => (
              <div key={e.id} className="p-4 bg-card border border-foreground/10 rounded flex justify-between">
                <div>
                  <p className="font-bold">{e.title}</p>
                  <p className="text-xs">{e.city} &middot; {e.date}</p>
                </div>
                <button onClick={() => deleteEvent(e.id)} className="text-red-500 text-xs">Delete</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'Support tickets' && (
        <div className="space-y-4 text-foreground">
          {tickets.map(t => (
            <div key={t.id} className="p-6 bg-card border border-foreground/10 rounded">
              <div className="flex justify-between border-b border-foreground/10 pb-4 mb-4">
                <div>
                  <p className="font-bold">{t.subject} <span className="text-xs font-normal bg-accent text-accent-foreground px-2 py-0.5 rounded ml-2">{t.status}</span></p>
                  <p className="text-xs text-primary-foreground opacity-50 mt-1">From: {t.name} ({t.email}) &middot; Event: {t.event}</p>
                </div>
                {admin && (
                  <select value={t.assignedTo || ''} onChange={(e) => updateTicket(t.id, { assignedTo: e.target.value })} className="bg-transparent border border-foreground/20 p-1 text-sm h-8">
                    <option value="">Assign to...</option>
                    {users.filter((u:any) => u.role === 'organiser').map((u:any) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <p className="text-sm">{t.message}</p>
              
              <div className="mt-4 pt-4 border-t border-foreground/10">
                {t.reply ? (
                  <div className="bg-secondary p-4 rounded text-sm">
                    <p className="font-semibold mb-1">Reply:</p>
                    <p>{t.reply}</p>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input id={`reply-${t.id}`} placeholder="Type reply..." className="flex-1 border border-foreground/20 p-2 bg-transparent text-sm" />
                    <button onClick={() => {
                      const val = (document.getElementById(`reply-${t.id}`) as HTMLInputElement).value;
                      updateTicket(t.id, { reply: val, status: 'Resolved' });
                    }} className="bg-primary text-primary-foreground px-4 text-sm font-bold">Reply & Resolve</button>
                  </div>
                )}
              </div>
            </div>
          ))}
          {tickets.length === 0 && <p className="text-primary-foreground/70">No tickets found.</p>}
        </div>
      )}
    </div>
  );
}
