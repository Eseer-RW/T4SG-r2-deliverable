-- Migration: Add endangered column to species table
-- Run this in Supabase SQL Editor if your database was created before the endangered column was added.
-- After running, execute `npm run types` to regenerate lib/schema.ts.

alter table species add column if not exists endangered boolean not null default false;
