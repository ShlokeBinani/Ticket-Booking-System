// @ts-nocheck
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  family: 4,
  auth: {
    user: "planetarymotive@gmail.com",
    pass: "eanm eexf zpsu qhck"
  }
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from: '"Paradox Ticket" <planetarymotive@gmail.com>',
      to,
      subject,
      html
    });
    console.log(`[Nodemailer] Email Sent! Message ID: ${info.messageId}`);
  } catch (err) {
    console.error("[Nodemailer Error]", err);
  }
}
