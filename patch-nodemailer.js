const fs = require('fs');
let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

// Ensure nodemailer is imported
if (!file.includes('import nodemailer from "nodemailer"')) {
  file = file.replace('import { Router', 'import nodemailer from "nodemailer";\nimport { Router');
}

// Replace the sendTicketEmail function
const oldEmailFuncRegex = /async function sendTicketEmail\(.*?catch \(err\) \{\n    console\.error\("Failed to send email:", err\);\n  \}\n\}/s;

const newEmailFunc = `async function sendTicketEmail(to: string, reference: string, amount: number) {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  
  if (!user || !pass) {
    console.log("No GMAIL_USER or GMAIL_APP_PASSWORD found, skipping email.");
    return;
  }
  
  const qrUrl = makeQr(reference);
  
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });

  const mailOptions = {
    from: \`"Paradox Tickets" <\${user}>\`,
    to: to,
    subject: \`Your Paradox Ticket - \${reference}\`,
    html: \`
      <div style="font-family: sans-serif; max-w-xl; margin: 0 auto;">
        <h1>Your booking is confirmed.</h1>
        <p>Booking Reference: <strong>\${reference}</strong></p>
        <p>Total Paid: ?\${amount}</p>
        <p>Please present this QR code at the venue:</p>
        <img src="\${qrUrl}" alt="Ticket QR Code" />
        <p>See you at the show.</p>
      </div>
    \`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent successfully: " + info.response);
  } catch (error) {
    console.error("Failed to send email:", error);
  }
}`;

file = file.replace(oldEmailFuncRegex, newEmailFunc);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("Nodemailer logic added to ticketing.ts");
