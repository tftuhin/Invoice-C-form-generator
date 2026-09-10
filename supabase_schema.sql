-- =========================================================
-- Form-C & Bank Invoice Generator Database Schema
-- Run this in your Supabase project: SQL Editor -> New query -> Run
-- =========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Clients Table
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration for existing databases
ALTER TABLE clients ADD COLUMN IF NOT EXISTS tax_id TEXT;

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on clients" ON clients FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on clients" ON clients FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on clients" ON clients FOR DELETE USING (true);

-- 2. Payment Accounts Table (e.g. Paddle, SCB, Wise)
CREATE TABLE IF NOT EXISTS payment_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  bank_name TEXT NOT NULL,
  bank_address TEXT,
  name_on_account TEXT NOT NULL,
  bic_swift TEXT,
  account_number TEXT NOT NULL,
  account_name TEXT,
  account_details TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration helpers if table already existed previously
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS bank_address TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS name_on_account TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS bic_swift TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS account_number TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS account_name TEXT;
ALTER TABLE payment_accounts ADD COLUMN IF NOT EXISTS account_details TEXT;

ALTER TABLE payment_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on payment_accounts" ON payment_accounts FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on payment_accounts" ON payment_accounts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on payment_accounts" ON payment_accounts FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on payment_accounts" ON payment_accounts FOR DELETE USING (true);

-- 3. Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  invoice_number TEXT UNIQUE NOT NULL,
  invoice_date DATE,
  currency TEXT DEFAULT 'USD',
  amount NUMERIC,
  description TEXT,
  received_amount NUMERIC,
  payment_methods JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migration helpers for invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'USD';

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous read access on invoices" ON invoices FOR SELECT USING (true);
CREATE POLICY "Allow anonymous insert access on invoices" ON invoices FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anonymous update access on invoices" ON invoices FOR UPDATE USING (true);
CREATE POLICY "Allow anonymous delete access on invoices" ON invoices FOR DELETE USING (true);
