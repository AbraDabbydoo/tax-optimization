# Authentication & Data Persistence Implementation

This document describes the new user authentication and data persistence features added to WhereTax.

## Overview

Users can now:
1. **Sign up** with email and password
2. **Log in** to their accounts
3. **Save tax calculations** and access them later
4. **View saved calculations** in a personalized dashboard
5. **Delete calculations** they no longer need

## Architecture

### Stack
- **Authentication**: Supabase Auth (email/password)
- **Database**: Supabase PostgreSQL
- **Frontend State**: React Context API
- **API**: Next.js API Routes with Row-Level Security

### Folder Structure

```
app/
├── auth/
│   ├── layout.tsx          # Auth pages layout
│   ├── login/page.tsx      # Login page
│   └── signup/page.tsx     # Sign up page
├── dashboard/
│   └── page.tsx            # User dashboard (shows saved calculations)
├── api/
│   └── calculations/
│       ├── route.ts        # GET all, POST new calculations
│       └── [id]/route.ts   # GET, PATCH, DELETE specific calculation
├── layout.tsx              # Updated with AuthProvider
└── providers.tsx           # Wraps app with authentication context

lib/
├── supabase.ts             # Supabase client initialization
├── auth-context.tsx        # React Context for auth
└── hooks.ts                # Custom hooks (useAuth, useCalculations)
```

## Setup Instructions

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md) for detailed setup instructions.

### Quick Start

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
4. Run the SQL setup script in Supabase
5. Start the dev server and test auth at `/auth/signup`

## API Reference

### Authentication Endpoints (Supabase)

Handled by Supabase Auth. Use the `useAuth()` hook.

```typescript
const { user, signUp, signIn, signOut } = useAuth()

// Sign up
await signUp('user@example.com', 'password123')

// Sign in
await signIn('user@example.com', 'password123')

// Sign out
await signOut()
```

### Calculations Endpoints

#### GET /api/calculations
Get all calculations for the logged-in user.

```typescript
const response = await fetch('/api/calculations')
const calculations = await response.json()
```

#### POST /api/calculations
Save a new calculation.

```typescript
const response = await fetch('/api/calculations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'CA 2025 Analysis',
    description: 'Tax analysis for California',
    data: { /* calculation input data */ },
    results: { /* calculation results */ }
  })
})
```

#### GET /api/calculations/[id]
Get a specific calculation.

#### PATCH /api/calculations/[id]
Update a calculation.

#### DELETE /api/calculations/[id]
Delete a calculation.

## Custom Hooks

### useAuth()
Returns authentication state and methods.

```typescript
import { useAuth } from '@/lib/auth-context'

function MyComponent() {
  const { user, loading, signUp, signIn, signOut } = useAuth()
  
  // user: User | null
  // loading: boolean
}
```

### useCalculations()
Returns calculation management functions.

```typescript
import { useCalculations } from '@/lib/hooks'

function MyComponent() {
  const { 
    saveCalculation, 
    updateCalculation, 
    deleteCalculation, 
    getCalculation,
    loading,
    error 
  } = useCalculations()

  // Save a calculation
  const saved = await saveCalculation({
    name: 'My Calculation',
    data: { /* ... */ },
    results: { /* ... */ }
  })

  // Update a calculation
  await updateCalculation(calculationId, {
    name: 'Updated Name',
    results: { /* updated results */ }
  })

  // Delete a calculation
  await deleteCalculation(calculationId)

  // Get a specific calculation
  const calc = await getCalculation(calculationId)
}
```

## Integration Example

To integrate calculation saving into the calculator:

```typescript
'use client'

import { useAuth } from '@/lib/auth-context'
import { useCalculations } from '@/lib/hooks'

export function Calculator() {
  const { user } = useAuth()
  const { saveCalculation, loading, error } = useCalculations()

  const handleSaveCalculation = async (calculationData: any) => {
    if (!user) {
      // Redirect to login or show message
      return
    }

    try {
      const saved = await saveCalculation({
        name: `${selectedState} ${new Date().getFullYear()}`,
        description: 'Tax calculation',
        data: calculationData,
        results: calculateTaxes(calculationData)
      })
      
      console.log('Saved:', saved)
    } catch (err) {
      console.error('Failed to save:', err)
    }
  }

  return (
    // Your calculator UI with save button
    <button onClick={() => handleSaveCalculation(data)} disabled={loading}>
      {loading ? 'Saving...' : 'Save Calculation'}
    </button>
  )
}
```

## Database Schema

### calculations table
- **id** (uuid): Primary key
- **user_id** (uuid): Foreign key to auth.users
- **name** (varchar): Calculation name
- **description** (text): Optional description
- **data** (jsonb): Input data
- **results** (jsonb): Calculation results
- **created_at** (timestamp): Creation timestamp
- **updated_at** (timestamp): Last update timestamp

Row Level Security is enabled to ensure users can only access their own data.

## Security

1. **Row Level Security (RLS)**: Database enforces that users can only read/write their own data
2. **Auth Middleware**: API routes use Supabase `auth.getUser()` to verify requests
3. **Environment Variables**: Sensitive keys are stored in `.env.local` (not in repo)
4. **Password Security**: Supabase handles password hashing and security

## Next Steps

1. **Integrate calculator save**: Add a "Save Calculation" button to the calculator that calls `useCalculations().saveCalculation()`

2. **Load calculation**: Create a page to load and continue previous calculations

3. **PDF Export**: Add PDF generation and download functionality

4. **Password Reset**: Implement password reset emails

5. **Two-Factor Authentication**: Add 2FA support

6. **Social Login**: Add Google, GitHub login options

7. **Email Verification**: Require email confirmation on signup

## Troubleshooting

See [SUPABASE_SETUP.md](SUPABASE_SETUP.md#troubleshooting) for common issues and solutions.

## Files Created/Modified

### New Files
- `app/auth/layout.tsx`
- `app/auth/login/page.tsx`
- `app/auth/signup/page.tsx`
- `app/dashboard/page.tsx`
- `app/api/calculations/route.ts`
- `app/api/calculations/[id]/route.ts`
- `app/providers.tsx`
- `lib/supabase.ts`
- `lib/auth-context.tsx`
- `lib/hooks.ts`
- `SUPABASE_SETUP.md`
- `AUTH_DATA_PERSISTENCE.md` (this file)

### Modified Files
- `app/layout.tsx` (added AuthProvider)
- `app/page.tsx` (added auth links to header)
- `package.json` (added @supabase/supabase-js)

## Testing

### Manual Testing Checklist
- [ ] Sign up with new email at `/auth/signup`
- [ ] Verify user appears in Supabase Auth dashboard
- [ ] Sign in at `/auth/login`
- [ ] Verify redirected to `/dashboard`
- [ ] Verify "New Calculation" button works
- [ ] Create a test calculation (via API or UI)
- [ ] Verify calculation appears in dashboard
- [ ] Verify can delete calculation
- [ ] Sign out and verify redirected
- [ ] Sign back in and verify calculations still there
