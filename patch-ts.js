const fs = require('fs');
let app = fs.readFileSync('artifacts/paradox-ticket/src/App.tsx', 'utf8');

app = app.replace(`onError: (err) => { alert('Booking failed: ' + (err?.response?.data?.error || 'Server Error')); }`, `onError: (err: any) => { alert('Booking failed: ' + (err?.response?.data?.error || 'Server Error')); }`);

// Oh wait, wait. The error is that err is of type Response from fetch maybe?
// Actually, earlier the error boundary was hiding it.
app = app.replace(`(err?.response?.data?.error`, `((err as any)?.response?.data?.error`);
fs.writeFileSync('artifacts/paradox-ticket/src/App.tsx', app);
console.log("Fixed TS error!");
