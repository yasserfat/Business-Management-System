# 🏢 BMS — Business Management System

Built for Abderrahim | Developed by Fetouhi Yasser Abdessamie

---

## ⚡ Quick Setup (5 steps)

### 1. Create a Supabase project
- Go to [supabase.com](https://supabase.com) → New Project
- Save your **Project URL** and **anon key** (Settings → API)

### 2. Run the database schema
- Go to Supabase Dashboard → **SQL Editor**
- Paste and run the contents of `supabase-schema.sql`

### 3. Create your 4 users
- Go to Supabase Dashboard → **Authentication → Users → Add User**
- Create 4 accounts with email + password
- To set display names, run in SQL Editor:
```sql
UPDATE auth.users 
SET raw_user_meta_data = jsonb_set(raw_user_meta_data, '{full_name}', '"Abderrahim"')
WHERE email = 'abderrahim@email.com';
```

### 4. Configure environment
```bash
cp .env.local.example .env.local
# Edit .env.local with your Supabase URL and anon key
```

### 5. Install and run
```bash
npm install
npm run dev
# App runs on http://localhost:3000
```

---

## 📁 Project Structure

```
bms/
├── app/
│   ├── (app)/               # Protected routes (require login)
│   │   ├── dashboard/       # Dashboard page
│   │   ├── appointments/    # Appointments CRUD
│   │   ├── stock/           # Stock management
│   │   └── caisse/          # Cash register
│   ├── login/               # Login page
│   └── globals.css
├── components/
│   ├── layout/
│   │   └── Sidebar.tsx      # Navigation sidebar
│   └── modals/
│       ├── AppointmentModal.tsx
│       ├── ProductModal.tsx
│       ├── TransactionModal.tsx
│       └── DeleteConfirmModal.tsx
├── lib/
│   ├── supabase.ts          # Browser client
│   ├── supabase-server.ts   # Server client
│   └── constants.ts         # Wilayas, service types
├── store/
│   ├── index.ts             # Redux store
│   ├── hooks.ts             # Typed hooks
│   └── slices/
│       ├── uiSlice.ts       # Modal state
│       ├── appointmentsSlice.ts
│       ├── productsSlice.ts
│       └── transactionsSlice.ts
├── types/index.ts
└── supabase-schema.sql      # DB setup
```

---

## 🚀 Deploy to Vercel (Free)

```bash
npm install -g vercel
vercel
# Follow prompts, add env variables when asked
```

Or connect your GitHub repo on [vercel.com](https://vercel.com) and it deploys automatically.

---

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| Next.js 14 (App Router) | React framework |
| Tailwind CSS | Styling |
| Supabase | Database + Auth (free tier) |
| Redux Toolkit | Client state management |
| date-fns | Date formatting |

---

## 📋 Features

- ✅ Login (4 users, email + password)
- ✅ Dashboard with daily stats + recent activity
- ✅ Appointments: full CRUD, search, 58 Algerian wilayas
- ✅ Stock: +/- quantity inline, low stock alerts (red highlight < 5)
- ✅ Caisse: IN/OUT transactions, daily summary, color-coded
- ✅ "Added by" tracking on appointments and transactions
- ✅ Responsive design (mobile + desktop)
- ✅ French UI throughout

---

