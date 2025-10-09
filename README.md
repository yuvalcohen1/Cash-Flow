# CashFlow - Personal Finance Tracker with AI Reports

A full-stack personal finance management application with AI-powered financial insights and personalized reports.

## Features

- 📊 **Dashboard** - Visual overview of income, expenses, and financial trends
- 💰 **Transaction Management** - Track income and expenses with categories
- 🤖 **AI Reports** - Personalized financial insights powered by Google Gemini AI
- 📈 **Analytics** - Charts and graphs for spending patterns
- 🔐 **Authentication** - Secure JWT-based user authentication

## Tech Stack

**Frontend:**

- React + TypeScript
- TailwindCSS
- Recharts (data visualization)
- React Markdown

**Backend (Main API):**

- Express.js + TypeScript
- SQLite database
- JWT authentication

**AI Service:**

- FastAPI (Python)
- Google Gemini 1.5 Flash
- SQLite database (shared with main backend)

## Project Structure

```
├── frontend/              # React TypeScript application (port 3001)
├── backend/              # Express.js API server (port 3000)
└── ai-reports-service/   # FastAPI AI service (port 8000)
```

## Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

## Installation

### 1. Backend Setup (Express)

```bash
cd backend
npm install
```

Create `.env`:

```env
PORT=3000
JWT_SECRET=your-secret-key-here
```

Run:

```bash
npm run dev
```

### 2. AI Reports Service Setup (FastAPI)

```bash
cd ai-reports-service
pip install -r requirements.txt
```

Create `.env`:

```env
GEMINI_API_KEY=your-gemini-api-key
GEMINI_MODEL=your-gemini-model
JWT_SECRET_KEY=your-secret-key-here  # Must match backend
JWT_ALGORITHM=HS256
DATABASE_PATH=../data/app.db
```

Run:

```bash
python main.py
```

### 3. Frontend Setup (React)

```bash
cd frontend
npm install
npm run dev
```

### 4. Database Setup

```bash
DB will be set up as soon as you run the Node.js backend
```

## API Endpoints

### Main Backend (Port 3000)

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/transactions` - List transactions
- `POST /api/transactions` - Create transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/categories` - List categories
- `GET /api/charts/summary` - Financial summary
- `GET /api/charts/trends` - Spending trends
- `GET /api/charts/category-breakdown` - Category breakdown

### AI Reports Service (Port 8000)

- `POST /api/v1/reports/generate` - Generate AI report
- `POST /api/v1/reports/insights` - Get financial insights

**Authentication:** All protected endpoints require JWT token in `Authorization: Bearer <token>` header.

## Usage

1. **Register/Login** - Create an account or sign in
2. **Add Transactions** - Record your income and expenses
3. **View Dashboard** - See financial overview and charts
4. **Generate AI Report** - Get personalized insights and recommendations

## AI Report Features

The AI service analyzes your transactions and provides:

- Overall financial health snapshot
- Savings rate analysis
- Spending patterns by day/category
- Anomaly detection (unusual expenses)
- Personalized action steps
- Behavioral insights
- Milestone achievements
