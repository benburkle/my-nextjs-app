# SaaS Migration Guide

This document describes the changes made to convert the app into a SaaS application with user authentication and data isolation.

## Changes Made

### 1. Authentication System
- **NextAuth.js**: Installed and configured with credentials provider
- **User Model**: Added User model to Prisma schema with email/password authentication
- **Session Management**: JWT-based sessions for authentication

### 2. Database Schema Updates
- Added `User` model with authentication fields
- Added `Account`, `SessionAuth`, and `VerificationToken` models for NextAuth
- Added `userId` field to all main entities:
  - `Schedule`
  - `Resource`
  - `Study`
  - `Guide`
  - `Session`
- All relationships updated to include user ownership

### 3. API Routes Protection
- All API routes now require authentication
- All queries filter by `userId` to ensure data isolation
- Updated routes:
  - `/api/studies` (GET, POST)
  - `/api/studies/[id]` (GET, PUT, DELETE)
  - `/api/guides` (GET, POST)
  - `/api/guides/[id]` (GET, PUT, DELETE)
  - `/api/resources` (GET, POST)
  - `/api/resources/[id]` (GET, PUT, DELETE)
  - `/api/sessions` (GET, POST)
  - `/api/sessions/[id]` (GET, PUT, DELETE)
  - `/api/schedules` (GET, POST)

### 4. Authentication Pages
- `/auth/signin` - Login page
- `/auth/signup` - Registration page
- Home page redirects to signin if not authenticated

### 5. UI Updates
- TopNavBar shows user email and logout option
- SessionProvider wraps the app for session management
- Proxy protects routes requiring authentication

## Environment Variables Required

Add these to your `.env` file:

```env
AUTH_SECRET=your-secret-key-here
# Or use NEXTAUTH_SECRET for backward compatibility
# NEXTAUTH_SECRET=your-secret-key-here

AUTH_URL=http://localhost:3000
# Or use NEXTAUTH_URL for backward compatibility  
# NEXTAUTH_URL=http://localhost:3000

DATABASE_URL=your-database-url
```

**Note:** NextAuth v5 beta uses `AUTH_SECRET` and `AUTH_URL` instead of `NEXTAUTH_SECRET` and `NEXTAUTH_URL`, but the code supports both for backward compatibility.

For production, set `AUTH_URL` to your production domain.

To generate a secure secret, you can use:
```bash
openssl rand -base64 32
```

## Migration Steps

### For Existing Data

If you have existing data in your database:

1. The schema has been updated with nullable `userId` fields
2. Run the migration script to assign existing data to a default user:
   ```bash
   npx tsx scripts/migrate-to-saas.ts
   ```
3. **IMPORTANT**: Change the password for the migration user after running the script
   - Email: `migration@abideguide.com`
   - Temporary password: `ChangeMe123!`

### For New Installations

1. Run Prisma migrations:
   ```bash
   npx prisma migrate dev
   ```

2. Create your first user account through the signup page at `/auth/signup`

## Security Notes

- Passwords are hashed using bcryptjs
- All API routes verify user authentication
- Data is isolated per user - users can only see/modify their own data
- Proxy protects routes from unauthorized access

## Next Steps

1. Set up environment variables in production
2. Run the migration script if you have existing data
3. Create your admin user account
4. Update the migration user password or delete it after migration
5. Consider making `userId` required (non-nullable) after migration is complete

