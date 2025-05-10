
# Development Setup Guide

This guide will help you set up a local development environment for this project on your Linux laptop.

## Prerequisites

1. Node.js 20.x
2. PostgreSQL 16

## Installing Prerequisites

### Node.js 20.x Installation
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash - 
sudo apt-get install -y nodejs
```

### PostgreSQL 16 Installation
```bash
sudo sh -c 'echo "deb http://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main" > /etc/apt/sources.list.d/pgdg.list'
wget --quiet -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get -y install postgresql-16
```

## Project Setup

1. Create the database and set password:
```bash
sudo -u postgres createdb events_manager
sudo -u postgres psql -c "ALTER USER postgres PASSWORD 'your_password';"
```

2. Clone and install dependencies:
```bash
git clone <your-repo-url>
cd <project-directory>
cp .env.example .env
npm install
```

3. Initialize the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

The application will be available at http://0.0.0.0:5000

## Environment Variables

Edit the `.env` file with your database credentials before starting the application. Use the `.env.example` file as a template.

Key environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `PGHOST`: Database host
- `PGUSER`: Database user
- `PGPASSWORD`: Database password
- `PGDATABASE`: Database name
- `PGPORT`: Database port
- `NODE_ENV`: Set to "development" for local development
- `PORT`: Application port (default: 5000)

## Project Structure

```
├── client/             # Frontend React application
│   ├── src/           
│   │   ├── components/ # React components
│   │   ├── hooks/     # Custom React hooks
│   │   ├── lib/       # Utility functions
│   │   └── pages/     # Page components
├── server/            # Backend Express application
│   ├── middleware/    # Express middlewares
│   ├── routes/       # API routes
│   └── db.ts         # Database configuration
├── shared/           # Shared types and utilities
└── uploads/          # File upload directory
```

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run check`: Run TypeScript checks
- `npm run db:push`: Update database schema
