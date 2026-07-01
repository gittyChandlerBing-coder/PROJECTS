# Tally

A minimalist, offline-first daily habit tracker and task manager, built as
a full-stack portfolio piece. Habit ticks and tasks live in Local Storage
for instant, offline-capable interaction; a lightweight Firestore mirror
powers a server-side daily email reminder.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
Tailwind CSS v4 · Zustand · Firebase (Auth + Firestore) · Nodemailer

---

## Why this stack

| Concern | Choice | Reasoning |
|---|---|---|
| Framework | Next.js App Router | One codebase for the UI and the API route the cron job hits — no separate backend service to deploy. |
| Styling | Tailwind v4 (CSS-first `@theme`) | Fast, zero-runtime, and its utility classes keep the "no flashy animation, purposeful micro-interactions" constraint easy to enforce by hand. |
| State | Zustand + Local Storage | Habits/tasks need to feel instant and work offline. Zustand's `persist` middleware writes to Local Storage synchronously on every action — no loading spinners, no network round-trip for the core loop. |
| Auth + sync | Firebase Auth + Firestore | Google sign-in is a checkbox with Firebase; Firestore's security rules give per-user data isolation without hand-rolling a permissions layer. |
| Email | Nodemailer + a polled API route | See "The hybrid data model" below — this is the one place a traditional backend is unavoidable. |

---

## The hybrid data model

The brief's core architectural tension: local data should be instant and
offline-first, but a **server** has to be the one sending email (a browser
tab can't send mail while closed). Tally resolves this by keeping two tiers
of data with very different shapes:

- **Full history — Local Storage only.** Every habit, every day's tick,
  every task lives in `localStorage` via Zustand's `persist` middleware
  (`src/lib/store/*`). This is the actual source of truth. It's instant,
  it's private to the device, and it works with no network at all.

- **A small derived snapshot — mirrored to Firestore.** `useCloudSync`
  (`src/lib/sync/useCloudSync.ts`) watches the local stores and, debounced
  by 2 seconds, pushes just three things to `/users/{uid}` in Firestore:
  reminder settings (enabled/time/timezone), the list of habits *not yet
  ticked today*, and the list of *open* tasks. Full history never leaves
  the device.

A server-side route (`/api/cron/send-reminders`) reads only that small
mirror, compares each user's local time against their chosen reminder
time, and sends an email once a day per user. It never needs — and never
gets — the complete habit/task history.

If Firestore is briefly unreachable, `useCloudSync` fails silently and
retries on the next local edit; nothing about the local experience
degrades, since Local Storage was never waiting on it.

---

## Project structure

```
src/
  app/
    layout.tsx              Root layout: metadata, PWA links, AuthProvider
    page.tsx                Dashboard (behind AuthGuard)
    login/page.tsx           Google sign-in screen
    api/cron/send-reminders/route.ts   The daily email cron endpoint
    globals.css              Tailwind v4 theme tokens ("Ledger" design system)
  components/
    ui/                      Primitives: Button, Card, Modal, Switch, ProgressRing, Logo…
    auth/                    GoogleSignInButton, AuthGuard
    layout/                  Header, DashboardShell, ServiceWorkerRegister
    habits/                  HabitGrid, HabitRow, HabitCell, StreakBadge, AddHabitForm
    tasks/                   TaskList, TaskItem, AddTaskForm
    timers/                  PomodoroTimer, Stopwatch, TimerWidget, FocusModeOverlay
    settings/                SettingsPanel
  context/
    AuthContext.tsx           Firebase Auth state + sign-in/out
  lib/
    types/                   Shared TypeScript types (single source of truth for shapes)
    store/                   Zustand stores — habits, tasks, settings, timer (all Local-Storage-backed)
    utils/                   date/streak/id/classname helpers (pure functions, unit-testable)
    firebase/                client.ts (browser SDK), admin.ts (server SDK), firestore.ts (typed helpers)
    email/                   template.ts (HTML/text), sendReminder.ts (Nodemailer transport)
    sync/                    useCloudSync — the local→cloud debounced mirror
  hooks/
    useTodayKey.ts            Midnight-rollover-aware "today" (see below)
    usePomodoroEngine.ts      Countdown derivation + auto phase-advance
    useTimerTick.ts           1s re-render pulse while a timer runs
public/
  manifest.json, sw.js, icons/, favicon.ico
scripts/
  generate-icons.sh           Regenerates every icon from the two SVG sources
```

Each domain (habits, tasks, timers, settings) is a self-contained vertical
slice: its own store, its own components, its own types — so any one of
them could be lifted into a different project largely unchanged.

---

## Core features

### Habit tracker
A week-view grid (`HabitGrid` → `HabitRow` → `HabitCell`) — rows are
habits, columns are the current Monday–Sunday week, today's column is
highlighted. Ticking a cell fills it with a short hand-drawn-style stroke
animation. Streaks (`🔥 N`) are computed live from the completion map
(`lib/utils/streak.ts`) — a streak counts backward from *yesterday* if
today isn't ticked yet, so it doesn't look broken the moment you open the
app before your morning routine.

On screens under Tailwind's `sm` breakpoint, each habit becomes its own
stacked card (name + streak on one line, the seven day-cells on the next)
instead of one wide table — the brief's own suggested mobile fallback.

### Task manager
Standard CRUD (`useTaskStore`): add, inline-rename (click the title),
toggle complete, delete, plus a "clear completed" action. Pending tasks
sort above completed ones.

### Timers
- **Pomodoro** (`PomodoroTimer` + `usePomodoroEngine`): work/short-break/
  long-break phases with configurable durations, auto-advancing to the
  next phase in the store (`useTimerStore.completePhase`) the instant the
  countdown hits zero.
- **Stopwatch** (`Stopwatch`): open-ended count-up, sharing the same
  visual frame as the Pomodoro ring for consistency when switching tabs.
- **Focus Mode** (`FocusModeOverlay`): a toggle on the timer widget that
  replaces the entire screen with just the timer, centered, full-height —
  everything else (habit grid, task list, header) unmounts from view.
  `Esc` or the exit button leaves it.

Elapsed time is derived from a stored `startedAt` timestamp plus banked
`accumulatedMs`, not a per-second `setInterval` write to Local Storage —
`useTimerTick` just forces a once-a-second re-render so the *display*
stays live without spamming storage writes.

### Email reminders
See "The hybrid data model" above for the architecture. The email itself
(`lib/email/template.ts`) is a single-column, inline-styled HTML table
(email clients don't honor external stylesheets or CSS variables) plus a
plain-text fallback, listing today's un-ticked habits and open tasks with
a link back into the app.

### Midnight reset
Habit completions are keyed by calendar date, so there's no data to
"clear" at midnight — a new day simply has no entries yet. What does need
to refresh is anything reading "today" if a tab is left open overnight:
`useTodayKey` schedules a timer to the next local midnight (recomputed
every time it fires, plus a `visibilitychange` re-check in case the tab
was backgrounded and the browser throttled the timer), and every
today-aware component re-renders from that single hook.

### PWA
`public/manifest.json` + a hand-rolled `public/sw.js` (no build plugin).
The service worker doesn't need to precache a build-time asset manifest —
Next.js content-hashes everything under `/_next/static/`, so the worker
just caches whatever gets requested at runtime (cache-first for hashed
static assets, network-first-with-cache-fallback for page navigations),
skipping `/api/*` and cross-origin requests entirely so auth and the cron
endpoint always hit the live network. Icons are generated from a single
hand-drawn tally-mark SVG — see [Design system](#design-system) — via
`scripts/generate-icons.sh`.

---

## Design system

The visual language is called **"Ledger"** in the codebase
(`src/app/globals.css`): the brief's own "deep charcoal, off-white,
subtle grays" direction, taken literally. A habit tracker is, at its
root, a paper grid someone fills in by hand — so instead of a generic
SaaS-dashboard look, hairline rules are treated as structural (they *are*
the grid), numerals are tabular/monospace the way a ledger aligns its
columns, and the canvas carries a faint graph-paper texture.

- **Color:** off-white paper (`--color-paper`) and near-black ink
  (`--color-ink`), with a single restrained accent — a muted moss green
  (`--color-accent`) — used only for completed states, the primary
  action, and focus rings. A desaturated brick red is reserved for
  destructive actions only.
- **Type:** the OS system-font stack, deliberately — no external font
  request, which is both faster and consistent with the offline-first
  nature of the app. Data (dates, streak counts, timer readouts) uses
  `tabular-nums` so digits align like a real ledger column.
- **Logomark:** a literal hand tally-mark (four verticals + a diagonal
  strike) — see `components/ui/Logo.tsx` — reused as the favicon and
  every PWA icon.
- **Motion:** a 180ms stroke-draw on habit ticks, a 100ms press-scale on
  buttons, nothing else. `prefers-reduced-motion` disables both.

A `prefers-color-scheme: dark` variant is included (same tokens,
re-themed), since it was low-cost given the CSS-variable approach.

---

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in the values below
npm run dev
```

### 1. Firebase project

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com).
2. **Authentication** → Sign-in method → enable **Google**.
3. **Firestore Database** → create one (production mode is fine — the
   rules below lock it down).
4. Project settings → General → "Your apps" → add a Web app → copy the
   config values into `NEXT_PUBLIC_FIREBASE_*` in `.env.local`.
5. Project settings → Service accounts → **Generate new private key** →
   use the downloaded JSON's `project_id`, `client_email`, and
   `private_key` fields for the `FIREBASE_ADMIN_*` variables (keep the
   `\n` escapes literal — `lib/firebase/admin.ts` unescapes them at
   runtime).
6. Deploy the security rules:
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules --project <your-project-id>
   ```
   (`firestore.rules` restricts every read/write to `request.auth.uid ==
   userId` — one user can never read or write another's document.)

### 2. Outbound email

Any SMTP provider works. For Gmail: Google Account → Security → 2-Step
Verification → **App passwords** → generate one, and use it as
`SMTP_PASS` (not your normal password). Fill in `SMTP_HOST`, `SMTP_PORT`,
`SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM`.

### 3. Cron secret

```bash
openssl rand -hex 32   # → CRON_SECRET
```

This gates `/api/cron/send-reminders` so it can't be triggered by anyone
who finds the URL.

---

## Deploying + scheduling the reminder email

Deploy to Vercel as a standard Next.js app (`vercel --prod`, or connect
the GitHub repo). Add every variable from `.env.local` to the project's
Environment Variables.

**The scheduling problem:** Vercel's **Hobby** plan limits built-in Cron
Jobs to once a day with imprecise timing — enough for one fixed global
send time, but not for *each user's own chosen time*. Two options:

- **Free (default in this repo):** `.github/workflows/send-reminders.yml`
  polls `/api/cron/send-reminders` every 15 minutes via GitHub Actions.
  The route itself decides per-user whether "now" has reached their saved
  time, so however often it's polled, each user gets exactly one email a
  day, sent as close to on-time as the poll interval allows. Add
  `APP_URL` and `CRON_SECRET` as repo secrets (Settings → Secrets and
  variables → Actions) and it runs automatically once merged to the
  default branch.
- **Vercel Pro:** add a `crons` block to `vercel.json` at whatever
  frequency you like and delete the GitHub Actions workflow.

---

## A note on code quality

- **Types** are centralized in `lib/types/index.ts` — every store,
  component, and API route imports from one place rather than redefining
  shapes.
- **Pure logic is separated from React.** Streak math, date-key math, and
  the Pomodoro phase-advance rules are plain functions in `lib/utils/`
  and the Zustand stores — no hooks required to test them.
- **Local Storage persistence** is handled once, generically, via
  Zustand's `persist` middleware — each store just declares what to
  persist (`partialize`) rather than hand-rolling `localStorage.getItem`/
  `setItem` calls throughout the component tree.
- `npm run build` and `npm run lint` both pass clean (0 errors, 0
  warnings) as shipped.

## Possible next steps

Left out of this pass deliberately, to keep scope matched to the brief —
worth mentioning in an interview as "here's what I'd add next":

- Monthly/yearly habit history view (the data already supports it — every
  completion is keyed by date, only the current week is rendered)
- Undo for archived (soft-deleted) habits
- Push notifications (service worker is already in place; would need the
  Web Push API + VAPID keys)
- Automated tests (Vitest for `lib/utils`/`lib/store`, Playwright for the
  core flows)
