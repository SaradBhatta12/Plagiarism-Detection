# LLM-Powered Plagiarism Detection System

A modern, high-performance plagiarism detection system built with Next.js, TypeORM, and LLM integration. This application allows students to submit assignments and automatically detects plagiarism using advanced Large Language Models (LLMs) like Groq.

## 🚀 Features

- **LLM-Powered Analysis**: Leverages Groq API for fast and accurate plagiarism detection.
- **Student Dashboard**: Intuitive interface for assignment submissions and report tracking.
- **Teacher/Admin Dashboard**: Manage students, assignments, and review plagiarism reports.
- **File Management**: Integrated with Cloudinary for secure document storage.
- **Robust Authentication**: Secure JWT-based authentication with role-based access control.
- **Modern UI**: Built with Tailwind CSS v4 and Radix UI components for a premium look and feel.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15+](https://nextjs.org/) (App Router)
- **Database**: [PostgreSQL](https://www.postgresql.org/) with [TypeORM](https://typeorm.io/)
- **LLM Engine**: [Groq API](https://groq.com/) / Local LLM
- **State Management**: [Redux Toolkit](https://redux-toolkit.js.org/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Storage**: [Cloudinary](https://cloudinary.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v18 or later)
- [PostgreSQL](https://www.postgresql.org/) (Ensure it's running)
- [Git](https://git-scm.com/)

---

## ⚙️ Setup & Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd plagiarism-detection
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory and configure the following variables (refer to `.env.example` if available):

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_NAME=plagiarism_detector

# JWT Secrets
JWT_ACCESS_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d

# Cloudinary Configuration
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name

# LLM Configuration
LLM_BASE_URL=http://localhost:11434 # For local LLM (Ollama)
GROQ_API_KEY=your_groq_api_key
GROQ_API_URL=https://api.groq.com/openai/v1
```

---

## 🗄️ Database Setup & Migrations

This project uses TypeORM for database management. Follow these steps to set up your database schema:

### 1. Create the Database
Ensure you have created a database in PostgreSQL named `plagiarism_detector` (or the name you specified in `.env`).

### 2. Run Migrations
To create the necessary tables and schema:
```bash
npm run migration:run
```

### 3. Other Migration Commands
- **Generate Migrations**: `npm run migration:generate`
- **Revert Migrations**: `npm run migration:revert`

---

## 🏃 Running the Project

### Development Mode
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build & Production
```bash
npm run build
npm start
```

---

## 📝 License
This project is licensed under the MIT License.

