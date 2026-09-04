# RedFlaggers Database Setup (Phase 2)

The application uses Supabase PostgreSQL. Follow these instructions to initialize your local development environment or reproduce the database on a remote project.

## 1. Local Development Setup

To test the application locally with a fresh database:

1. Ensure Docker is running on your machine.
2. Initialize Supabase (if not already done):
   ```bash
   npx supabase init
   ```
3. Start the local database:
   ```bash
   npx supabase start
   ```
   *This command will output your local `API URL` and `anon key`, as well as a `service_role key`.*

4. Update your `.env.local` file with the values provided by the `start` command:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
   SUPABASE_SECRET_KEY=<your-service-role-key>
   ```

5. The migrations in `supabase/migrations/` and the seed data in `supabase/seed.sql` are automatically applied when starting a fresh local instance.

## 2. Deploying to a Remote Supabase Project

To apply these migrations to your hosted Supabase project:

1. Link your Supabase CLI to your remote project:
   ```bash
   npx supabase link --project-ref <your-project-ref>
   ```
   *(You will be prompted for your database password).*

2. Push the schema migrations to the remote database:
   ```bash
   npx supabase db push
   ```

3. (Optional) Push the baseline seed data (incident types, behaviors, contexts):
   ```bash
   npx supabase db reset
   ```
   **Warning:** `db reset` will wipe existing data. If you only want to insert seed data without resetting, run:
   ```bash
   psql -h aws-0-REGION.pooler.supabase.com -p 5432 -d postgres -U postgres.PROJECT_REF -f supabase/seed.sql
   ```

4. Configure Vercel Environment Variables:
   Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `SUPABASE_SECRET_KEY` to your Vercel project settings matching your remote Supabase instance.
