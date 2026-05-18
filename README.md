# MedWeb Event Management System

A premium, full-stack medical event management application built with Next.js, Prisma, and Supabase.

## 🚀 Features

- **Admin Dashboard**: Real-time stats and attendee management.
- **QR Code Check-in**: Secure scanning system for medical event entry.
- **Admin Management**: Role-based access control (Super Admin vs. Subadmins).
- **Automated Reminders**: Cron jobs for talk reminders and schedule updates.
- **Responsive Design**: Modern, glassmorphism UI tailored for medical professionals.

## 🛠️ Technology Stack

- **Framework**: Next.js 15+ (App Router)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: JWT-based session management
- **Styling**: Vanilla CSS with modern design tokens
- **Icons**: Lucide React

## 📦 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file with the following:
```env
DATABASE_URL="your_postgresql_url"
DIRECT_URL="your_direct_postgresql_url"
EMAIL_USER="your_gmail@gmail.com"
EMAIL_PASS="your_gmail_app_password"
JWT_SECRET="your_secure_secret"
```

### 3. Database Initialization
```bash
npx prisma db push
npm run prisma:seed
```

### 4. Run Development Server
```bash
npm run dev
```

## 🔐 Administrative Access

To initialize or update the Super Admin account, modify the credentials in `prisma/seed.js` and run:
```bash
npx prisma db seed
```

## 📄 License
This project is private and intended for MedWeb internal use.
