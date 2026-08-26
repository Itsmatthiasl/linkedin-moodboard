# LinkedIn Post Moodboard

A personal, single-user tool for collecting LinkedIn posts (hooks, formats, story structures) onto themed visual boards for reference before writing.

## Stack

- Next.js 16 (App Router, Server Actions)
- Supabase (email/password auth + Postgres, with RLS scoping every board/post to its owner)
- Tailwind CSS v4

## Setup

```bash
npm install
cp .env.local.example .env.local # fill in your Supabase project URL + anon key
npm run dev
```

The database schema (boards, posts, RLS policies) lives in `supabase/migrations/0001_init.sql`.

## How it works

- Sign up with email + password.
- Create a board, then add a post by pasting its LinkedIn URL and manually typing the author, post text, and engagement line (LinkedIn has no public API for this — see the PRD for why manual entry was chosen for v1).
- Posts show in a 3-column masonry grid per board, with infinite scroll. Clicking a card opens the original post on LinkedIn in a new tab.
