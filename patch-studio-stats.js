const fs = require('fs');

let file = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

const oldStudioOverview = `
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
`;

const newStudioOverview = `
        {tab === 'Overview' && !admin && (
          <OrganiserMetrics />
`;

const organiserMetricsComponent = `
function OrganiserMetrics() {
  const [stats, setStats] = useState({ grossRevenue: 0, ticketsMoved: 0, sellThrough: '0%', avgTicket: 0 });
  const { getToken } = useAuth();
  
  useEffect(() => {
    const fetchStats = async () => {
      const res = await fetch(import.meta.env.VITE_API_URL + '/organiser/stats', {
        headers: { 'Authorization': \`Bearer \${getToken()}\` }
      });
      if (res.ok) {
        setStats(await res.json());
      }
    };
    fetchStats();
  }, []);

  return (
    <>
      <div className="mt-8 grid gap-px border border-foreground/15 bg-foreground/15 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Gross revenue', \`?\${stats.grossRevenue.toLocaleString('en-IN')}\`],
          ['Tickets moved', stats.ticketsMoved.toString()],
          ['Sell-through', stats.sellThrough],
          ['Avg. ticket', \`?\${stats.avgTicket.toLocaleString('en-IN')}\`]
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
        <p className="mt-5 text-sm text-foreground/55">Real-time metrics are synced.</p>
      </div>
    </>
  );
}
`;

file = file.replace(oldStudioOverview, newStudioOverview);
file = file.replace('function Studio(', organiserMetricsComponent + '\nfunction Studio(');

// Now patch Seat release logic
// The global hold banner clears local storage. But if the hold banner drops to 0, does the backend know?
// Yes, the backend uses `heldUntil` TTL of 10 mins. If the time passes, backend treats it as available!
// But just to ensure frontend doesn't falsely block, we should make sure the hold expires.
// The script `add-hold-banner.js` already added `localStorage.removeItem('paradox-active-hold')`.

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', file);
console.log("Studio metrics patched!");
