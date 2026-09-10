# Invoice and C Form Generator

A modern Next.js application to generate and print Bangladesh Bank Form-C (Declaration for inward remittance on account of ICT-related services) and accompanying Bank Invoices for clients.

## Features

- **Document Generation**: One-click print & PDF export for:
  - **Form-C (ICT)**: Official inward remittance declaration format.
  - **Bank Invoice**: Clean and structured invoice with client details and payment transfer info.
- **Invoice Creation**: Auto-numbered invoice generation (`TF-YYYY-MM-DD-XX`) with flexible payment method assignment.
- **Client Management**: Add, update, and manage international clients and their remitting bank details.
- **Payment & Bank Configuration**: Configure payout bank accounts with Bank Name, Name on Account, IBAN/Account Number/ID, BIC/SWIFT, and Bank Address.
- **Modern Light UI**: Responsive, clean light sidebar with intuitive navigation.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI & Styling**: React 19, Tailwind CSS v4, Lucide React
- **Forms & Printing**: `react-hook-form`, `react-to-print`, `date-fns`
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL with Row Level Security)

## Getting Started

### 1. Clone the repository
```bash
git clone git@github.com:tftuhin/Invoice-C-form-generator.git
cd Invoice-C-form-generator
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Database (Supabase)
Run the SQL script provided in [`supabase_schema.sql`](./supabase_schema.sql) in your Supabase SQL Editor to create the required tables:
- `clients`
- `payment_accounts`
- `invoices`

### 4. Configure Environment Variables
Copy the example environment file and add your Supabase credentials:
```bash
cp .env.local.example .env.local
```

Update `.env.local` with your project URL and public anon key:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 5. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## License
MIT
