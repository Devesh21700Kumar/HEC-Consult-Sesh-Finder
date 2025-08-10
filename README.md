# HEC Session Manager

A Next.js application for HEC Paris students to manage case study sessions, find study partners, and schedule meetings with real Google Meet links.

## Features

- 🔐 **HEC Email Authentication** - Only @hec.edu emails allowed
- 👥 **Session Management** - Create and manage case study sessions
- 🤝 **Smart Pairing** - Algorithm to match students for sessions
- 📅 **Google Meet Integration** - Automatic Meet link generation
- 📱 **Responsive UI** - Beautiful Tailwind CSS interface
- 🔒 **Row Level Security** - Secure data access with Supabase RLS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Meeting Links**: Google Calendar API
- **Icons**: Lucide React

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd hec-session-manager
npm install
```

### 2. Set up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Run the SQL migration in `supabase/migrations/001_initial_schema.sql`
3. Enable Email Auth in Authentication > Settings
4. Copy your project URL and anon key

### 3. Environment Variables

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Google Service Account (optional, for Meet links)
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Database Schema

### Profiles Table
```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text unique,
  level text check (level in ('Beginner', 'Medium', 'Advanced')),
  consulting boolean default false,
  mna boolean default false,
  quant boolean default false,
  created_at timestamp default now()
);
```

### Sessions Table
```sql
create table sessions (
  id uuid primary key default uuid_generate_v4(),
  date date not null,
  time time not null,
  format text check (format in ('Video Call', 'In-person')),
  topic text,
  participant1 uuid references profiles(id) on delete set null,
  participant2 uuid references profiles(id) on delete set null,
  meet_link text,
  created_at timestamp default now()
);
```

## Project Structure

```
hec-session-manager/
├── src/
│   ├── pages/              # Next.js pages
│   │   ├── index.tsx       # Dashboard
│   │   ├── login.tsx       # Login page
│   │   └── sessions/       # Session management
│   ├── components/         # React components
│   │   ├── AuthGuard.tsx   # Authentication wrapper
│   │   └── Navbar.tsx      # Navigation
│   ├── lib/               # Utilities
│   │   ├── supabaseClient.ts
│   │   ├── matchAlgorithm.ts
│   │   └── dateUtils.ts
│   ├── styles/            # Global styles
│   └── types/             # TypeScript types
├── supabase/              # Database migrations
└── public/               # Static assets
```

## Authentication Flow

1. Users sign up with their @hec.edu email
2. Email validation ensures only HEC students can register
3. Supabase Auth handles authentication
4. User profiles are automatically created on first login
5. Row Level Security (RLS) protects user data

## Session Management

- **Create Sessions**: Users can schedule case study sessions
- **Find Partners**: Algorithm matches students based on availability
- **Google Meet**: Automatic Meet link generation for video calls
- **Rescheduling**: Easy session modification and partner finding

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Other Platforms

The app can be deployed to any Node.js hosting platform:
- Netlify
- Railway
- DigitalOcean App Platform

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For support, email [your-email@hec.edu](mailto:your-email@hec.edu) or create an issue in this repository.
