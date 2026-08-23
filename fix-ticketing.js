const fs = require('fs');
let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// I will remove the broken makeQr and sendTicketEmail, and insert it properly.
const regex = /function makeQr\(reference: string\) \{.*?&\w+=1`;\n\}/s;
const properFunctions = `function makeQr(reference: string) {
  return \`https://quickchart.io/qr?text=\${encodeURIComponent(reference)}&size=220&margin=1\`;
}

async function sendTicketEmail(to: string, reference: string, amount: number) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.log("No RESEND_API_KEY found, skipping real email send.");
    return;
  }
  const qrUrl = makeQr(reference);
  try {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        from: 'Paradox Tickets <tickets@resend.dev>',
        to: [to],
        subject: \`Your Paradox Ticket - \${reference}\`,
        html: \`
          <div style="font-family: sans-serif; max-w: 36rem; margin: 0 auto;">
            <h1>Your booking is confirmed.</h1>
            <p>Booking Reference: <strong>\${reference}</strong></p>
            <p>Total Paid: ?\${amount}</p>
            <p>Please present this QR code at the venue:</p>
            <img src="\${qrUrl}" alt="Ticket QR Code" />
            <p>See you at the show.</p>
          </div>
        \`
      })
    });
    console.log("Email sent to", to);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}`;

file = file.replace(/function makeQr\(reference: string\) \{.*?&\w+=1`;\n\}/s, properFunctions);

// If the regex didn't work because it's already broken:
if (!file.includes('async function sendTicketEmail(to: string, reference: string, amount: number) {')) {
   // manual replace
   const brokenChunk = file.substring(file.indexOf('function makeQr'), file.indexOf('&size=220&margin=1`;\n}') + 22);
   file = file.replace(brokenChunk, properFunctions);
}

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("Fixed!");
