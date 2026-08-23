// @ts-nocheck
export async function sendEmail(to: string, subject: string, html: string) {
  const serviceId = process.env.EMAILJS_SERVICE_ID;
  const templateId = process.env.EMAILJS_TEMPLATE_ID;
  const publicKey = process.env.EMAILJS_PUBLIC_KEY;
  const privateKey = process.env.EMAILJS_PRIVATE_KEY;

  if (!serviceId || !templateId || !publicKey) {
    console.warn("[EmailJS] Credentials not set. Simulating email send...");
    console.log(`[EmailJS Simulation] To: ${to} | Subject: ${subject}`);
    return;
  }

  const payload = {
    service_id: serviceId,
    template_id: templateId,
    user_id: publicKey,
    accessToken: privateKey,
    template_params: {
      to_email: to,
      subject: subject,
      message: html
    }
  };

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`EmailJS Error: ${text}`);
    }
    
    console.log(`[EmailJS] Email Sent to ${to}!`);
  } catch (err) {
    console.error("[EmailJS Error]", err);
  }
}
