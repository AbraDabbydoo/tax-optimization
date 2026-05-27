# Testing Checklist - Authentication & Data Persistence

Use this checklist to verify all features work correctly after completing Supabase setup.

## Pre-Testing
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `.env.local` has `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Supabase SQL setup script has been run
- [ ] Dev server is running (`npm run dev`)

## Authentication - Sign Up
- [ ] Visit `http://localhost:3000/auth/signup`
- [ ] Form displays correctly
- [ ] Can enter email and password
- [ ] Password confirmation validation works
- [ ] Error message shows if passwords don't match
- [ ] Error message shows if password < 6 characters
- [ ] "Sign In" link works
- [ ] Submit button shows loading state
- [ ] User is created in Supabase (check Dashboard > Auth > Users)
- [ ] User is redirected to `/dashboard` after signup
- [ ] Dashboard displays with "No calculations yet" message

## Authentication - Sign In
- [ ] Visit `http://localhost:3000/auth/login`
- [ ] Form displays correctly
- [ ] Can enter email and password
- [ ] "Sign up" link works
- [ ] "Forgot password" link appears (at least UI-wise)
- [ ] Submit with wrong password shows error
- [ ] Submit with correct credentials logs in
- [ ] User is redirected to `/dashboard`
- [ ] Dashboard displays user email in header

## Dashboard
- [ ] Header shows "WhereTax" logo
- [ ] Header shows user's email
- [ ] "Sign Out" button is visible
- [ ] "New Calculation" button is visible and linked to `/calculator`
- [ ] No calculations message shows (if no calculations exist)
- [ ] Results table is properly formatted (when calculations exist)

## Dashboard - Calculations
- [ ] Save a test calculation via API:
  ```bash
  curl -X POST http://localhost:3000/api/calculations \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","data":{},"results":{}}'
  ```
- [ ] Test calculation appears in dashboard
- [ ] Shows calculation name
- [ ] Shows creation date
- [ ] Shows tax rate (if in results)
- [ ] Shows total tax (if in results)
- [ ] Delete button removes calculation
- [ ] Download button is visible (placeholder)

## Sign Out
- [ ] Click "Sign Out" in header
- [ ] User is redirected to homepage
- [ ] Homepage shows "Sign In" and "Sign Up" buttons
- [ ] Authentication context is cleared
- [ ] Cannot access `/dashboard` without signing in again

## API Endpoints
- [ ] Test `GET /api/calculations`
  ```bash
  curl http://localhost:3000/api/calculations
  ```
  Returns list of calculations or 401 if not authenticated

- [ ] Test `POST /api/calculations`
  ```bash
  curl -X POST http://localhost:3000/api/calculations \
    -H "Content-Type: application/json" \
    -d '{"name":"Test","data":{"state":"CA"},"results":{}}'
  ```
  Creates calculation and returns it with ID

- [ ] Test `GET /api/calculations/[id]`
  Returns specific calculation or 404

- [ ] Test `PATCH /api/calculations/[id]`
  Updates calculation successfully

- [ ] Test `DELETE /api/calculations/[id]`
  Deletes calculation successfully

- [ ] All endpoints return 401 when logged out

## Security - Row Level Security
- [ ] User A and User B create accounts
- [ ] User A creates a calculation
- [ ] User B cannot see User A's calculation via API
- [ ] User B cannot GET, PATCH, or DELETE User A's calculations

## Homepage
- [ ] Homepage displays correctly
- [ ] Logged-out user sees "Sign In" and "Sign Up" buttons
- [ ] Logged-in user sees "Dashboard" and "Calculator" buttons
- [ ] Navigation updates based on auth state (no page reload)

## Integration (Once Calculator is Integrated)
- [ ] Calculator has "Save Calculation" button
- [ ] Clicking save prompts for name/description
- [ ] Saved calculation appears in dashboard
- [ ] Can view calculation results in dashboard
- [ ] Can delete from dashboard

## Error Handling
- [ ] Signing up with existing email shows error
- [ ] Network errors show appropriate messages
- [ ] Invalid auth token is handled gracefully
- [ ] Expired sessions are handled correctly

## Browser DevTools
- [ ] Check Network tab - auth requests use HTTPS (in prod)
- [ ] Check Application tab - auth tokens are not in localStorage (better practice)
- [ ] Check Console - no error messages during normal flow
- [ ] Check Session Storage (if using) - tokens are present

## Final Checklist
- [ ] All tests above pass
- [ ] No console errors
- [ ] No console warnings (besides expected ones)
- [ ] App is responsive on mobile
- [ ] Accessibility features are present (labels, ARIA, semantic HTML)

## Performance
- [ ] Dashboard loads within 2 seconds
- [ ] Save calculation completes within 1 second
- [ ] No layout shifts when UI updates

## Cross-Browser (Optional but Recommended)
- [ ] Chrome: ✓
- [ ] Firefox: ✓
- [ ] Safari: ✓
- [ ] Edge: ✓

## Device Testing (Optional)
- [ ] Desktop (1920x1080): ✓
- [ ] Tablet (768x1024): ✓
- [ ] Mobile (375x667): ✓

## Notes for Testers

### Common Issues

**Issue**: "Missing Supabase environment variables"
- **Solution**: Ensure `.env.local` has both keys and dev server was restarted

**Issue**: 401 Unauthorized on API calls
- **Solution**: Make sure you're signed in - check user state in React DevTools

**Issue**: Calculations not saving
- **Solution**: Check Supabase SQL Editor that `calculations` table exists

**Issue**: "No rows affected" when deleting
- **Solution**: Verify you're trying to delete your own calculation (RLS policy)

### Manual Database Check

In Supabase SQL Editor:
```sql
-- See your users
SELECT id, email, created_at FROM auth.users;

-- See your calculations
SELECT id, name, user_id FROM public.calculations;

-- See RLS policies
SELECT * FROM pg_policies WHERE tablename = 'calculations';
```

## After Testing

- [ ] Report any bugs with:
  - What you were doing
  - What you expected
  - What actually happened
  - Browser and OS version
  - Screenshots/videos if applicable

- [ ] Document any unexpected behavior

- [ ] Note any improvements or UX suggestions
