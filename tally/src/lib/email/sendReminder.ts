import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { renderReminderEmailHtml, renderReminderEmailText } from "./template";
import type { CloudSnapshot } from "@/lib/types";

let cachedTransporter: Transporter | null = null;

/** Lazily builds (and reuses, via SMTP connection pooling) a single
 *  transporter per server instance rather than one per email — the cron
 *  route may send to dozens of users in one invocation. */
function getTransporter(): Transporter {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT ?? 465);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "Missing SMTP credentials. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS (see .env.local.example)."
    );
  }

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
    pool: true,
    maxConnections: 3,
  });

  return cachedTransporter;
}

interface SendReminderArgs {
  to: string;
  displayName: string | null;
  snapshot: CloudSnapshot;
}

export async function sendReminderEmail({ to, displayName, snapshot }: SendReminderArgs) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const transporter = getTransporter();

  await transporter.sendMail({
    from: process.env.EMAIL_FROM ?? process.env.SMTP_USER,
    to,
    subject: "Your Tally reminder for today",
    text: renderReminderEmailText({ displayName, snapshot, appUrl }),
    html: renderReminderEmailHtml({ displayName, snapshot, appUrl }),
  });
}
