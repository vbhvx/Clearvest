# Clearvest

Clearvest is an India-focused financial-planning application for goals and scenarios, portfolios and manual holdings, instruments, investment comparison, order previews/orders, privacy requests, consent management, administrative gates, and assistant messages.

## Stack

The app uses Next.js 16, React 19, TypeScript, Prisma/PostgreSQL, Zod, JWT utilities, Decimal.js, Tailwind CSS, and Vitest. Pages are in `src/app`; its REST handlers are under `src/app/api/v1`; schema, migrations, and seed data are under `prisma/`.

## Setup

```bash
cd 51_Clearvest
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run dev
```

Use separate development/test database URLs and a strong `JWT_SECRET`. The included configuration deliberately starts in demo mode with simulated market data, sandbox aggregation/brokerage, disabled personalized advice, and a grounded local AI provider.

```bash
npm test
npm run lint
npm run build
```
