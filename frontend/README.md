# PactFlow Frontend

> Production-grade Next.js 15 frontend for the PactFlow platform.
> **Constellation Design System** — dark-mode-first, accessible, fully typed.

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Next.js | 16.x (App Router) | Framework |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling |
| Framer Motion | 12.x | Animations |
| TanStack Query | 5.x | Server state |
| Zustand | 5.x | Client state |
| React Hook Form | 7.x | Form management |
| Zod | 3.x | Validation |
| Radix UI | Latest | Accessible primitives |
| Sonner | Latest | Toast notifications |

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type check
npm run typecheck
```

## Folder Structure

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout (fonts, providers, metadata)
│   ├── globals.css         # Global styles + Tailwind entry
│   ├── page.tsx            # Root redirect → /dashboard
│   ├── error.tsx           # Global error boundary
│   ├── loading.tsx         # Global loading skeleton
│   ├── not-found.tsx       # 404 page
│   ├── dashboard/          # Dashboard route
│   ├── projects/           # Projects routes
│   ├── wallet/             # Wallet route
│   └── ...
├── components/
│   ├── ui/                 # Reusable design system components
│   │   ├── button.tsx      # Button variants
│   │   ├── card.tsx        # Card + StatCard
│   │   ├── dialog.tsx      # Modal system
│   │   ├── typography.tsx  # Text + Heading + Badge
│   │   ├── skeleton.tsx    # Loading skeletons
│   │   ├── breadcrumb.tsx  # Navigation breadcrumbs
│   │   ├── empty-state.tsx # Empty state illustrations
│   │   └── index.ts        # Barrel export
│   ├── layout/             # App shell components
│   │   ├── sidebar.tsx     # Animated collapsible sidebar
│   │   ├── topnav.tsx      # Top navigation bar
│   │   └── dashboard-shell.tsx # Main layout wrapper
│   └── providers.tsx       # Context providers (Query, Theme, Toast)
├── lib/
│   ├── utils.ts            # cn() + domain helpers
│   ├── api-client.ts       # Base HTTP client
│   ├── mock-data.ts        # Development mock data
│   └── toast.ts            # Toast notification helpers
├── store/
│   └── app-store.ts        # Zustand global store
├── styles/
│   └── design-tokens.css   # Constellation design tokens
└── types/
    └── domain.ts           # TypeScript domain types
```

## Design System — Constellation

The Constellation Design System is PactFlow's visual language.

### Core Principles
- **Dark-mode first** — all colors designed for dark backgrounds
- **Token-driven** — all visual values are CSS custom properties in `design-tokens.css`
- **WCAG 2.1 AA compliant** — all interactive elements meet contrast requirements
- **Motion-enhanced** — subtle Framer Motion animations on all key interactions

### Color Palette
- **Brand**: Indigo (`hsl(240, 84%, 60%)`)
- **Accent**: Emerald (`hsl(158, 64%, 52%)`)
- **Surfaces**: Deep dark blue scale (`hsl(222, 84%, 4%)` → `hsl(218, 28%, 18%)`)

### Component Usage

```tsx
import { Button, Card, StatCard, Dialog, Badge } from "@/components/ui";

// Button
<Button variant="primary" size="md" isLoading={false}>
  Release Payment
</Button>

// StatCard
<StatCard
  label="In Escrow"
  value="350K XLM"
  icon={<Wallet />}
  trend={{ value: "+12%", direction: "up" }}
/>

// Dialog
<Dialog open={open} onOpenChange={setOpen}>
  <DialogContent size="md">
    <DialogTitle>Confirm Payment Release</DialogTitle>
    <DialogDescription>...</DialogDescription>
  </DialogContent>
</Dialog>
```

## Environment Variables

```bash
# .env.local (never commit)
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_STELLAR_NETWORK=TESTNET
NEXT_PUBLIC_HORIZON_URL=https://horizon-testnet.stellar.org
```

## Security Notes

- Access tokens stored **in memory only** (never localStorage)
- Refresh token via `httpOnly` cookie
- All forms validated with Zod before submission
- Security headers configured in `next.config.ts`
- Wallet private keys **never** touch the server

## Next Milestones

1. **Milestone 2**: Authentication (login, register, JWT flow)
2. **Milestone 3**: Wallet integration (Freighter/WalletKit)
3. **Milestone 4**: Projects & Milestones CRUD
4. **Milestone 5**: Escrow flow (fund, submit, approve, release)
