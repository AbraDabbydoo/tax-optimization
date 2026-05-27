# Supabase Setup Guide

This guide will walk you through setting up Supabase for authentication and data persistence in the WhereTax application.

## Step 1: Create a Supabase Account

1. Go to [https://supabase.com](https://supabase.com)
2. Click "Start your project" or sign up
3. Create a new account or log in

## Step 2: Create a New Project

1. In the Supabase dashboard, click "New project"
2. Fill in the project details:
   - **Name**: tax-optimization
   - **Database Password**: Create a strong password
   - **Region**: Choose closest to your users (e.g., us-east-1)
3. Click "Create new project"
4. Wait for the project to initialize (2-3 minutes)

## Step 3: Get Your API Keys

1. Once the project is ready, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL**: `https://...supabase.co`
   - **anon key**: (under "Project API keys")
   - **service_role key**: (under "Project API keys") - keep this secret!

## Step 4: Update Environment Variables

Add these to your `.env.local` file:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## Step 5: Create Database Tables

In your Supabase dashboard, go to **SQL Editor** and run the following SQL to create the necessary tables:

```sql
-- Create users table (Supabase auth handles this, but we'll reference it)
-- Auth tables are created automatically

-- Create calculations table
CREATE TABLE public.calculations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name varchar NOT NULL,
  description text,
  data jsonb NOT NULL,
  results jsonb,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Add index for faster queries
CREATE INDEX idx_calculations_user_id ON public.calculations(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.calculations ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read only their own calculations
CREATE POLICY "Users can read their own calculations"
  ON public.calculations
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own calculations
CREATE POLICY "Users can insert their own calculations"
  ON public.calculations
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own calculations
CREATE POLICY "Users can update their own calculations"
  ON public.calculations
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to delete their own calculations
CREATE POLICY "Users can delete their own calculations"
  ON public.calculations
  FOR DELETE
  USING (auth.uid() = user_id);
```

## Step 6: Enable Email Authentication

1. In your Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure "Email" is enabled (it is by default)
3. Optionally enable other providers (Google, GitHub, etc.)

## Step 7: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Navigate to `http://localhost:3000/auth/signup`
3. Create a test account
4. You should be redirected to `/dashboard`
5. Go back to the Supabase dashboard to verify the user was created under **Authentication** → **Users**

## Step 8: Verify Database Access

In the SQL Editor, run:

```sql
SELECT id, email, created_at FROM auth.users;
SELECT * FROM public.calculations;
```

You should see the test user and any calculations they've saved.

## Database Schema

### `calculations` table

- **id** (uuid): Primary key
- **user_id** (uuid): Foreign key to auth.users
- **name** (varchar): Name of the calculation
- **description** (text): Optional description
- **data** (jsonb): The input data for the calculation (income, deductions, etc.)
- **results** (jsonb): The calculated results
- **created_at** (timestamp): When the calculation was created
- **updated_at** (timestamp): Last update time

## API Endpoints

### GET /api/calculations
Get all calculations for the logged-in user

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "California 2025",
    "description": "Annual tax calculation for CA",
    "data": {...},
    "results": {...},
    "created_at": "2024-05-14T00:00:00Z",
    "updated_at": "2024-05-14T00:00:00Z"
  }
]
```

### POST /api/calculations
Save a new calculation

**Request:**
```json
{
  "name": "California 2025",
  "description": "Annual tax calculation",
  "data": {...},
  "results": {...}
}
```

### GET /api/calculations/[id]
Get a specific calculation

### PATCH /api/calculations/[id]
Update a calculation

### DELETE /api/calculations/[id]
Delete a calculation

## Troubleshooting

### "Missing Supabase environment variables"
- Make sure `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in `.env.local`
- Restart your dev server after adding env vars

### "User not found" errors
- Check that the user was created in Supabase Dashboard → Authentication → Users
- Verify the user's email is confirmed

### "Row Level Security" errors
- Make sure RLS policies are correctly set up in the SQL Editor
- The policies should allow users to read/write only their own data

### Database table doesn't exist
- Go to Supabase Dashboard → SQL Editor
- Run the SQL setup script again
- Check for any errors in the execution

## Next Steps

1. Integrate calculation saving into the calculator flow
2. Add the ability to load and continue previous calculations
3. Implement PDF export functionality
4. Add password reset functionality
5. Add two-factor authentication
