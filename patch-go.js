const fs = require('fs');
let content = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

// Replace the synchronous go function with an asynchronous one that waits for the mutation
content = content.replace(
  /const go = \(\) => \{[\s\S]*?setLocation\(\`\/checkout\/\$\{demo\.id\}\`\);\s*\};/m,
  `const go = () => {
    if (!user) {
      if (window.confirm('You must sign in to book a ticket. Go to Sign In?')) { setLocation('/auth'); }
      return;
    }
    hold.mutate({ id, data: { seatIds: selected } }, {
      onSuccess: r => {
        localStorage.setItem('paradox-active-hold', JSON.stringify({
          ...r,
          eventTitle: event.title || "Paradox Ticket",
          venue: event.venue || "The Rivington",
          date: event.date || "Jun 21",
          time: event.time || "20:30"
        }));
        setLocation(\`/checkout/\${r.id}\`);
      },
      onError: (err) => {
        alert("Failed to hold seats: " + ((err as any)?.response?.data?.error || "Someone else might have grabbed them!"));
      }
    });
  };`
);

fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', content);
console.log("Patched go()");
