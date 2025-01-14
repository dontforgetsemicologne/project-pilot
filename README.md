# Task Management System

A modern task management application built with Next.js, SST, and Supabase. This system provides an intuitive interface for managing tasks, user profiles, and team collaboration.

## Features

- **Task Management Interface**
  - Create, update, and delete tasks
  - Set deadlines and priorities
  - Assign team members
  - Add task descriptions and tags
  - Track task progress

- **User Profile Management**
  - Personal information management
  - Preference settings
  - Team member profiles

- **Authentication**
  - Email and password login using Supabase Auth
  - Secure session management
  - User role management

- **Dashboard** (Optional)
  - Project overview
  - Task lists and timelines
  - Team collaboration features
  - Analytics and summaries

## Tech Stack

- **Frontend**: Next.js
- **Backend**: SST (Serverless Stack) on AWS
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Deployment**: AWS

## Prerequisites

- Node.js >= 18
- AWS Account with configured credentials
- Supabase Account
- Git

## Environment Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd [project-name]
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file with the following variables:
```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Setup

1. Create a new Supabase project
2. Set up the following tables:

```sql
-- Users table is handled by Supabase Auth

-- Tasks table
create table tasks (
  id uuid default uuid_generate_v4() primary key,
  title text not null,
  description text,
  due_date timestamp with time zone,
  priority text,
  status text,
  assigned_to uuid references auth.users,
  created_by uuid references auth.users,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tags table
create table tags (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  created_at timestamp with time zone default now()
);

-- Task Tags junction table
create table task_tags (
  task_id uuid references tasks,
  tag_id uuid references tags,
  primary key (task_id, tag_id)
);
```

## Local Development

1. Start the development server:
```bash
npm run dev
```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### SST Setup (To be implemented)

1. Install SST globally:
```bash
npm install -g sst
```

2. Initialize SST in your project:
```bash
npx create-sst
```

3. Configure AWS credentials and region

### Deploy to Production

```bash
npm run deploy
```

## Project Structure

```
├── src/
│   ├── app/              # Next.js app directory
│   ├── components/       # Reusable components
│   ├── lib/             # Utility functions and APIs
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── sst/                 # SST configuration (To be added)
└── supabase/           # Supabase configuration and migrations
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details

## TODO

- [ ] Implement SST backend configuration
- [ ] Set up CI/CD pipeline
- [ ] Add comprehensive test coverage
- [ ] Implement dashboard features
- [ ] Add team collaboration features