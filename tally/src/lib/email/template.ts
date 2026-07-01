import type { CloudSnapshot } from "@/lib/types";

interface ReminderEmailData {
  displayName: string | null;
  snapshot: CloudSnapshot;
  appUrl: string;
}

/**
 * Email clients strip external stylesheets and CSS custom properties, so
 * this mirrors the app's ledger palette using inline hex styles rather than
 * importing globals.css. Kept intentionally plain — a single-column table
 * layout, one accent color — for maximum client compatibility.
 */
const INK = "#1a1916";
const INK_MUTED = "#726d63";
const PAPER = "#f2f0ea";
const SURFACE = "#fdfcfa";
const LINE = "#ddd8cd";
const ACCENT = "#3f5d42";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderListRows(items: string[], emptyLabel: string): string {
  if (items.length === 0) {
    return `<tr><td style="padding:10px 0;color:${INK_MUTED};font-size:14px;">${emptyLabel}</td></tr>`;
  }
  return items
    .map(
      (label) => `
        <tr>
          <td style="padding:9px 0;border-top:1px solid ${LINE};font-size:14px;color:${INK};">
            <span style="display:inline-block;width:14px;height:14px;border:1px solid ${LINE};border-radius:3px;margin-right:10px;vertical-align:middle;"></span>
            ${escapeHtml(label)}
          </td>
        </tr>`
    )
    .join("");
}

export function renderReminderEmailHtml(data: ReminderEmailData): string {
  const greetingName = data.displayName ? `, ${escapeHtml(data.displayName.split(" ")[0] ?? "")}` : "";
  const habitRows = renderListRows(
    data.snapshot.habitsPendingToday.map(
      (h) => `${h.name}${h.streak > 0 ? ` — ${h.streak} day streak` : ""}`
    ),
    "All habits are already ticked off today. Nicely done."
  );
  const taskRows = renderListRows(
    data.snapshot.pendingTasks.map((t) => t.title),
    "No open tasks right now."
  );

  return `<!DOCTYPE html>
<html>
  <body style="margin:0;padding:0;background-color:${PAPER};font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${PAPER};padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px;width:100%;background-color:${SURFACE};border:1px solid ${LINE};border-radius:8px;overflow:hidden;">
            <tr>
              <td style="padding:24px 28px 8px;">
                <span style="font-family:'SF Mono','Cascadia Mono',Consolas,monospace;font-size:13px;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;color:${INK};">Tally</span>
              </td>
            </tr>
            <tr>
              <td style="padding:4px 28px 20px;">
                <p style="margin:0;font-size:15px;color:${INK};">Good morning${greetingName} — here's what's open today.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Habits</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${habitRows}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 28px 0;">
                <p style="margin:0 0 4px;font-size:11px;font-weight:600;letter-spacing:0.08em;text-transform:uppercase;color:${INK_MUTED};">Tasks</p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">${taskRows}</table>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 28px 24px;">
                <a href="${data.appUrl}" style="display:inline-block;background-color:${ACCENT};color:${SURFACE};font-size:14px;font-weight:500;text-decoration:none;padding:10px 18px;border-radius:6px;">Open Tally</a>
              </td>
            </tr>
            <tr>
              <td style="padding:0 28px 24px;border-top:1px solid ${LINE};">
                <p style="margin:16px 0 0;font-size:12px;color:${INK_MUTED};">
                  You're receiving this because a daily reminder is turned on in Tally settings. Turn it off any time from the settings panel.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function renderReminderEmailText(data: ReminderEmailData): string {
  const lines: string[] = [];
  lines.push(`Tally — here's what's open today`);
  lines.push("");
  lines.push("HABITS");
  if (data.snapshot.habitsPendingToday.length === 0) {
    lines.push("  All habits are already ticked off today. Nicely done.");
  } else {
    for (const h of data.snapshot.habitsPendingToday) {
      lines.push(`  [ ] ${h.name}${h.streak > 0 ? ` (${h.streak} day streak)` : ""}`);
    }
  }
  lines.push("");
  lines.push("TASKS");
  if (data.snapshot.pendingTasks.length === 0) {
    lines.push("  No open tasks right now.");
  } else {
    for (const t of data.snapshot.pendingTasks) {
      lines.push(`  [ ] ${t.title}`);
    }
  }
  lines.push("");
  lines.push(`Open Tally: ${data.appUrl}`);
  return lines.join("\n");
}
