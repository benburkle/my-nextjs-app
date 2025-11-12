This is a [Next.js](https://nextjs.org) project with [Mantine UI](https://mantine.dev/) components and [Prisma](https://www.prisma.io/) database integration.

## Features

- ⚡️ Next.js 16 with App Router
- 🎨 Mantine UI components library
- 🗄️ Prisma ORM with PostgreSQL database
- 📝 Full CRUD operations for posts
- 🔔 Toast notifications
- 💅 Modern, responsive UI

## Getting Started

First, install dependencies:

```bash
npm install
```

### Option 1: Using Docker Compose (Recommended)

Start the PostgreSQL database:

```bash
npm run db:start
```

This will start a PostgreSQL container on port 5432.

### Option 2: Local PostgreSQL Installation

If you have PostgreSQL installed locally, make sure it's running and create a database:

```sql
CREATE DATABASE abideguide;
```

### Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/abideguide?schema=public"
```

**Note**: If using Docker Compose, the default credentials are:
- User: `postgres`
- Password: `postgres`
- Database: `abideguide`
- Port: `5432`

### Initialize the Database

Generate the Prisma client and push the schema:

```bash
npm install
npm run db:push
```

Or use migrations (recommended for production):

```bash
npm run db:migrate
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Database

This project uses Prisma with PostgreSQL. 

### Local Development

The easiest way to run PostgreSQL locally is using Docker Compose:

```bash
# Start the database
npm run db:start

# Stop the database
npm run db:stop

# Reset the database (removes all data)
npm run db:reset
```

**Database Scripts:**
- `npm run db:start` - Start PostgreSQL with Docker Compose
- `npm run db:stop` - Stop PostgreSQL
- `npm run db:reset` - Reset database (removes all data and recreates)
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes without migrations
- `npm run db:studio` - Open Prisma Studio to view/edit data

**Default Docker Compose credentials:**
- User: `postgres`
- Password: `postgres`
- Database: `abideguide`
- Port: `5432`

Make sure your `.env` file has:
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/abideguide?schema=public"
```

### Production (Vercel)

For production on Vercel:

1. **Set up a PostgreSQL database**:
   - **Option A (Recommended)**: Use Vercel Postgres
     - Go to your Vercel project → Storage → Create Database → Postgres
     - Vercel will automatically add `DATABASE_URL` to your environment variables
   - **Option B**: Use an external provider (Supabase, Neon, Railway, etc.)
     - Get your connection string from your provider
     - Add it as `DATABASE_URL` in Vercel project settings

2. **Add Environment Variables in Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Make sure to select all environments (Production, Preview, Development)

3. **Run database migrations**:
   ```bash
   npx prisma migrate deploy
   ```
   Or Vercel will automatically run `prisma generate` via the `postinstall` script during build.

**Important**: After adding `DATABASE_URL`, you must redeploy your project for the changes to take effect.

### Viewing Your Database

To view your database:

```bash
npm run db:studio
```

This will open Prisma Studio in your browser where you can view and edit your data.

## Project Structure

- `app/` - Next.js app directory with pages and API routes
- `lib/` - Utility files including Prisma client
- `prisma/` - Prisma schema and database files
- `app/api/posts/` - API routes for post CRUD operations

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
