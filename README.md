# School Management System

A comprehensive web application for managing school schedules, events, and support tickets.

## Features

- User authentication with role-based access control
- Schedule management for students, teachers, and classes
- Calendar for school events
- Support ticket system for IT and cafeteria
- Admin panel for user management

## Tech Stack

- Next.js
- TypeScript
- React
- PostgreSQL
- Prisma
- Tailwind CSS
- NextAuth.js

## Prerequisites

- Node.js (v14 or later)
- PostgreSQL
- npm or yarn

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd school-management
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up the database:
- Create a PostgreSQL database
- Update the DATABASE_URL in .env file with your database credentials

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:3000

## Environment Variables

Create a .env file in the root directory with the following variables:

```
DATABASE_URL="postgresql://user:password@localhost:5432/school_management"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## User Roles

- 0: Student
- 1: Teacher
- 2: System Administrator
- 3: Admin

## License

MIT #   A P P _ S C H O O L  
 