# Whizz Fund

A decentralized fund management platform built on Solana. Whizz Fund enables users to invest in managed  fund pools and allows fund managers to create, operate, and grow their own investment strategies on-chain. Empower your very own onchain wizard to allocate to funds to all tradeable assets available on Solana.

## Features

**For Investors**
- Browse and discover fund managers with live performance metrics (30d/1y returns, AUM, risk levels)
- Deposit SOL into managed fund pools and receive fund tokens
- Track portfolio allocations with interactive charts and real-time updates
- Withdraw funds with transparent performance fee calculations
- Emergency withdrawal support with configurable cooldown periods
- Full transaction history with on-chain verification

**For Fund Managers**
- Register and manage fund pools with custom fee structures (up to 20% management fee)
- Trading dashboard for position tracking and strategy execution
- Performance analytics with historical charting
- Investor management and AUM tracking

**Platform**
- Real-time data via Tarobase subscriptions (live portfolio values, fund performance, transactions)
- Wallet-based authentication via Privy
- Jupiter Terminal integration for token swaps
- Admin dashboard with wallet-based access control
- Responsive design with dark theme

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 19, TypeScript, Vite 6 |
| Styling | Tailwind CSS, Shadcn/UI, Framer Motion |
| Blockchain | Solana, Tarobase SDK, Jupiter Swap |
| Charts | Recharts, D3.js, Lightweight Charts |
| State | Zustand, React Hook Form + Zod |
| Backend | PartyServer (WebSocket), Hono REST API |
| Auth | Privy (Solana wallet) |

## Getting Started

### Prerequisites

- Node.js v22.14.0 or later
- npm or yarn

### Installation

```bash
npm install
```

### Environment Setup

A `.env` file is included with the project containing necessary configuration (Tarobase App ID, RPC endpoints, etc.). Review it before running.

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build

```bash
# Preview build (includes preview bar)
npm run build

# Production build
npm run build:prod
```

### Other Commands

```bash
npm run lint          # Run ESLint
npm run format        # Format with Prettier
npm run check-types   # TypeScript type checking
npm run preview       # Preview production build
```

## Project Structure

```
src/
├── components/
│   ├── ui/                        # Shadcn/UI component library
│   ├── WizardFundDashboard.tsx    # Main dashboard
│   ├── FundManagerList.tsx        # Manager discovery
│   ├── DepositForm.tsx            # Deposit into fund pools
│   ├── WithdrawForm.tsx           # Standard withdrawals
│   ├── EmergencyWithdraw.tsx      # Emergency withdrawals
│   ├── PortfolioView.tsx          # Portfolio visualization
│   ├── TradingDashboard.tsx       # Manager trading interface
│   ├── PerformanceChart.tsx       # Historical performance charts
│   ├── TransactionHistory.tsx     # Transaction log
│   ├── AdminPage.tsx              # Admin dashboard
│   ├── Header.tsx                 # Navigation & wallet status
│   └── HomePage.tsx               # Landing page
├── hooks/
│   ├── use-tarobase-data.tsx      # Real-time data subscriptions
│   ├── use-mobile.tsx             # Responsive breakpoint detection
│   └── usePartyServerAuth.tsx     # WebSocket authentication
├── lib/
│   ├── tarobase.ts                # Tarobase SDK (CRUD, blockchain APIs, subscriptions)
│   ├── api-client.ts              # Backend REST API client
│   ├── constants.ts               # Protocol parameters & config
│   ├── config.ts                  # Environment & app config
│   ├── utils.ts                   # Utility functions
│   └── errorReporting.ts          # Error tracking
├── pages/                         # Route pages
├── App.tsx                        # Router setup
├── main.tsx                       # App entry point
└── globals.css                    # Theme & global styles
```

## Protocol Parameters

| Parameter | Value |
|---|---|
| Protocol Fee | 1% (100 bps) |
| Max Manager Fee | 20% (2,000 bps) |
| Withdrawal Cooldown | 24 hours |
| Large Withdrawal Timelock | 3 days |
| Large Withdrawal Threshold | 10 SOL |

## Built With

Built with [poof.new](https://poof.new) -- a platform for creating Solana dApps.
