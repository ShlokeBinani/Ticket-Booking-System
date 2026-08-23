// @ts-nocheck
export async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.EMAIL_API_KEY;
  if (!apiKey || apiKey === "re_your_api_key_here") {
    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return;
  }
  
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Paradox Ticket <tickets@paradoxticket.com>",
        to: [to],
        subject,
        html
      })
    });
    if (!res.ok) {
      console.error("[Email Error]", await res.text());
    } else {
      console.log(`[Email Sent] To: ${to}`);
    }
  } catch (err) {
    console.error("[Email Exception]", err);
  }
}
