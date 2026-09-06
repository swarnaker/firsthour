# FIRSTHOUR

**Pons first hour · research, not a wallet**

FIRSTHOUR is a Next.js application that tracks Pons tokens in their first 60 minutes of existence on the Robinhood chain. It provides real-time monitoring, heat scoring, and optional Telegram alerts for high-heat tokens.

## Features

- **Feed Tab**: Live feed of Pons tokens under 1 hour old
  - Filter: All, New, Bonding, Almost bonded, Graduated, Heat>200
  - Sort: Heat (default), Newest, Mcap, Curve %
  - Search by ticker or contract address
  
- **Watchlist Tab**: Star tokens to keep them in your watchlist
  - Tokens remain visible even after they age past 1 hour (marked as AGED)
  - Persisted in browser localStorage

- **Alerts Tab**: Configure Telegram notifications
  - Alerts trigger when heat crosses 200 while age < 1 hour
  - 30-minute dedupe per CA to prevent spam
  - Requires TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID environment variables

- **Settings Tab**: Admin panel
  - System health monitoring
  - RPC status
  - Telegram configuration status
  - Environment variable documentation

## Data Sources

FIRSTHOUR aggregates data from multiple sources:

1. **Pons Graduated Catalog**: `https://www.ponsfamily.com/api/pons-launches/graduations?catalog=1&v=8`
   - Provides graduated tokens with names, symbols, and market data

2. **RPC Graduation Events** (optional, requires ROBINHOOD_RPC_URL):
   - PoolGraduated events (topic: `0x0a44ef75df69c534f43cd6c1aa3ef8983065fe5fe79ef9e79f6494e6f258c259`)
   - LaunchSwept events (topic: `0xcdb72f157fd3666758a6ce201387ffb52038c7562e4fff352828da1096c4b6b4`)
   - Scans last 80,000 blocks for recent graduations

## Heat Scoring

Heat scores range from 0-400 and are calculated based on:

- **Freshness** (28%): Decays linearly from 0-6 hours
- **Buy Pressure** (22%): Buy percentage from transactions
- **Volume** (18%): 1-hour trading volume (logarithmic scale)
- **Acceleration** (10%): Volume/mcap ratio
- **Moving Bonus** (18%): High volume + liquidity + buy% threshold
- **Curve Fill** (16%): Bonding curve completion for Pons tokens

Penalties apply for low liquidity, duplicate names, high bundle/sniper percentages, and red risk flags.

## Installation

```bash
# Install dependencies
npm install
# or
pnpm install
# or
yarn install
```

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```env
# Optional: RPC endpoint for real-time graduation events
ROBINHOOD_RPC_URL=

# Admin authentication (defaults to admin/admin)
ADMIN_USER=admin
ADMIN_PASSWORD=admin

# Telegram alerts (optional)
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# Cron endpoint protection (optional)
CRON_SECRET=
```

## Running Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Building for Production

```bash
npm run build
npm start
```

## Telegram Alerts Setup

1. Create a Telegram bot via [@BotFather](https://t.me/BotFather)
2. Get your Chat ID (use [@userinfobot](https://t.me/userinfobot) or similar)
3. Add `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` to your environment variables
4. Set up a cron job to hit `/api/cron/notify` every 5-10 minutes

### Example Cron Setup (with CRON_SECRET)

```bash
*/5 * * * * curl -H "Authorization: Bearer YOUR_CRON_SECRET" https://your-domain.com/api/cron/notify
```

### Example Cron Setup (without CRON_SECRET)

```bash
*/5 * * * * curl https://your-domain.com/api/cron/notify
```

## API Endpoints

- `GET /api/tokens` - Fetch all tokens under 1 hour
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/cron/notify` - Trigger Telegram alerts (for cron jobs)
- `GET /api/settings/chat-id` - Get Telegram configuration status

## Architecture

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Custom CSS variables
- **Data Caching**: In-memory cache with 5-minute TTL
- **State Management**: React hooks + localStorage for watchlist
- **Authentication**: httpOnly cookies for admin sessions

## Key Differences from LINE (desk)

- **Age Gate**: FIRSTHOUR shows tokens < 60 minutes (LINE shows 6-hour survivors)
- **No Wallet**: No wallet connection or swap functionality
- **Signal Only**: Research-focused interface with no transaction capabilities
- **Pons Only**: Exclusively tracks Pons tokens (no Pump, O1, or LONG)

## Design

Dark TrenchRadar-style interface:
- Near-black backgrounds (#0a0a0a, #141414, #1a1a1a)
- Gold accents (#D4AF37)
- Dense monospace table layout
- Minimal color palette

## Security Notes

- Admin credentials should be changed from defaults in production
- CRON_SECRET should be used to protect the notify endpoint
- Never expose TELEGRAM_BOT_TOKEN or other secrets in client-side code
- All sensitive operations require authentication

## License

Private research tool - not for public distribution

## Support

For issues or questions, refer to the Pons family documentation at [ponsfamily.com](https://www.ponsfamily.com/)
