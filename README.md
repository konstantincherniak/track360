# User Sessions & Tab Presence Tracker

Angular 19 application demonstrating user authentication and reliable session presence tracking across multiple browser tabs and devices.

## Features

- **Authentication**: Sign up / Sign in with email + password (Supabase Auth)
- **Tab Tracking**: Device ID (localStorage) + Tab ID (sessionStorage)
- **Presence Tracking**: Real-time heartbeat with TTL-based state (active/idle/stale)
- **Dashboard**: View all sessions grouped by device with current tab highlighted

## Tech Stack

- Angular 19 (Signals, OnPush, Standalone Components)
- Supabase (Auth + PostgreSQL)
- Angular Material 19
- RxJS

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Environment Configuration

The Supabase credentials are already configured in `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  supabaseUrl: 'https://zqpezexjcilfatwgbduv.supabase.co',
  supabaseAnonKey: '...'
};
```

### Run Development Server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`

### Build

```bash
npm run build
```

## Project Structure

```
src/app/
├── core/
│   ├── guards/auth.guard.ts       # Route protection
│   ├── models/                     # TypeScript interfaces
│   └── services/
│       ├── auth.service.ts         # Authentication
│       ├── presence.service.ts     # Heartbeat & visibility tracking
│       ├── presence-id.service.ts  # Device/Tab ID management
│       ├── supabase.service.ts     # Supabase client
│       └── user-tabs.service.ts    # Tab data fetching & state
├── pages/
│   ├── auth/                       # Login/Signup page
│   └── app-dashboard/              # Main dashboard
│       └── components/
│           ├── device-group/       # Device grouping
│           ├── tab-card/           # Individual tab display
│           └── tabs-summary/       # Online count summary
└── shared/
    └── pipes/relative-time.pipe.ts
```

## Presence Strategy

### TTL-based Heartbeat (No beforeunload/unload)

The presence system uses a **heartbeat mechanism** that doesn't rely on `beforeunload` or `unload` events, which are unreliable in modern browsers.

#### How it works:

1. **Heartbeat Interval**: Every **15 seconds**, each tab updates its `last_seen` timestamp in Supabase
2. **Visibility Tracking**: Updates also occur immediately on `visibilitychange`, `focus`, and `blur` events
3. **State Computation**: When fetching tabs, state is computed based on time since `last_seen`:

| State | Condition | Meaning |
|-------|-----------|---------|
| `active` | < 30 seconds | Tab is actively being used |
| `idle` | 30s - 3 min | Tab exists but may be in background |
| `stale` | > 3 min | Tab likely closed or disconnected |

4. **Polling**: Dashboard refreshes tab list every **10 seconds**

#### Why this approach?

- **No flickering**: Wide TTL windows prevent rapid state changes
- **Tolerates throttling**: Background tabs may have delayed heartbeats; 30s active threshold accommodates this
- **No reliance on unload**: Tabs naturally transition to `stale` without explicit cleanup
- **Simple & reliable**: No complex leader election or coordination needed

#### Trade-offs

| Decision | Trade-off | Mitigation |
|----------|-----------|------------|
| Polling vs Realtime | Higher latency (~10s) | Acceptable for presence use case |
| No tab cleanup | Stale records accumulate in DB | Records expire visually; DB cleanup can be scheduled |
| No offline support | Requires connectivity | Out of scope for this assignment |

## Database Schema

The `user_tabs` table (pre-created in Supabase with RLS):

```sql
create table if not exists public.user_tabs (
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  tab_id text not null,
  user_agent text not null,
  is_active boolean not null default false,
  last_seen timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (user_id, device_id, tab_id)
);
```

## Usage

1. Open `http://localhost:4200/`
2. Sign up with email + password
3. After sign in, you'll see the dashboard with your current session
4. Open the app in multiple tabs/browsers to see presence tracking
5. The current tab is highlighted; other tabs show their state (active/idle/stale)

## Improvements (Given More Time)

- Supabase Realtime subscriptions for instant updates
- Scheduled DB cleanup for stale records
- Offline queue for presence updates
- Leader-tab pattern to reduce heartbeat frequency
- E2E tests with Playwright
