const fs = require('fs');
let content = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

const eventTitle = 'body.eventTitle || "Paradox Event"';
const venue = 'body.venue || "Paradox Venue"';
const date = 'body.date || "Unknown Date"';
const time = 'body.time || "Unknown Time"';

const oldEmailCall = /sendEmail\([\s\S]*?\);/;

const newEmailCall = `
    const emailSubject = \`Your Paradox Ticket: \${body.eventTitle || "Confirmed"}\`;
    const emailBody = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <h1 style="color: #1a4f36;">It's official. You're going.</h1>
        <p style="font-size: 16px;">Here is your ticket for <strong>\${body.eventTitle || "the event"}</strong>.</p>
        
        <div style="background: #f4f1eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0 0 10px 0;"><strong>Event:</strong> \${body.eventTitle}</p>
          <p style="margin: 0 0 10px 0;"><strong>Venue:</strong> \${body.venue}</p>
          <p style="margin: 0 0 10px 0;"><strong>Date & Time:</strong> \${body.date} at \${body.time}</p>
          <p style="margin: 0;"><strong>Seats:</strong> \${validSeats.map(s => s.id).join(", ")}</p>
        </div>

        <p style="font-size: 14px; color: #666;">Please arrive 20 minutes before curtain. Present the QR code below at the door.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <img src="\${qrUrl}" alt="Ticket QR Code" style="width: 200px; height: 200px; border: 2px solid #eaeaea; padding: 10px; border-radius: 12px;"/>
          <p style="font-family: monospace; letter-spacing: 2px; color: #888;">\${reference}</p>
        </div>
        
        <p style="font-size: 12px; color: #999; text-align: center;">See you there,<br/>Paradox Ticket</p>
      </div>
    \`;

    sendEmail(body.email || req.user!.email, emailSubject, emailBody);
`;

content = content.replace(oldEmailCall, newEmailCall.trim());

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', content);
console.log("Patched email body");
