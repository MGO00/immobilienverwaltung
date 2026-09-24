import "server-only";
import nodemailer from "nodemailer";

function transporter() {
  const port = Number(process.env.SMTP_PORT ?? 587);
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD } : undefined,
  });
}

const escape = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

// Bestätigungsmail (Double-Opt-in). Bewusst schlicht; es wird nichts weiter
// verschickt, solange die Adresse nicht bestätigt ist.
export async function sendeBestaetigungsmail(empfaenger: string, bestaetigenUrl: string, abmeldenUrl: string) {
  const betreff = "Bitte bestätige deine E-Mail-Adresse";
  const text = [
    "Hallo,",
    "",
    "du hast dich für die Neuigkeiten von Immobilienverwaltung angemeldet. Bitte bestätige deine Adresse über diesen Link (48 Stunden gültig):",
    "",
    bestaetigenUrl,
    "",
    "Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach. Dann passiert nichts. Du kannst deine Adresse auch direkt entfernen:",
    abmeldenUrl,
  ].join("\n");
  const html = `<p>Hallo,</p>
<p>du hast dich für die Neuigkeiten von Immobilienverwaltung angemeldet. Bitte bestätige deine Adresse (der Link ist 48 Stunden gültig):</p>
<p><a href="${escape(bestaetigenUrl)}">Adresse bestätigen</a></p>
<p>Wenn du dich nicht angemeldet hast, ignoriere diese E-Mail einfach. Dann passiert nichts. Du kannst deine Adresse auch <a href="${escape(abmeldenUrl)}">direkt entfernen</a>.</p>`;

  await transporter().sendMail({ from: process.env.MAIL_FROM, to: empfaenger, subject: betreff, text, html });
}
