# Nexrena Ops — Usage Guide

Internal operations platform for Nexrena LLC. Manage clients, proposals, projects, time, invoices, expenses, and website leads — all from one place.

> **Architecture:** React frontend (Next.js, Vercel) + Express API backend (Heroku) + PostgreSQL database. The website contact form at nexrena.com also feeds into the Leads section here.

---

## Environment Setup

### Backend (`nexrena-api`)

Create a `.env` file (copy from `.env.example`):

| Variable | Purpose | Example |
|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Set by Heroku Postgres automatically |
| `API_KEY` | Secret key for Ops dashboard auth | Any random string |
| `CORS_ORIGINS` | Comma-separated allowed origins | `https://nexrena.com,https://nexrena-ops.vercel.app` |
| `PORT` | Server port (Heroku sets this) | `4000` |

### Frontend (`nexrena-ops`)

Create a `.env.local` file:

| Variable | Purpose | Example |
|----------|---------|---------|
| `NEXT_PUBLIC_API_URL` | Backend URL | `https://your-app.herokuapp.com` |
| `NEXT_PUBLIC_API_KEY` | API key (must match backend `API_KEY`) | Same string as above |

### Website (`nexrena-web`)

Add to your `.env` or hosting env:

| Variable | Purpose | Example |
|----------|---------|---------|
| `PUBLIC_API_URL` | Backend URL for contact form | `https://your-app.herokuapp.com` |

---

## Deploying the Backend to Heroku

```bash
cd nexrena-api

# Create the Heroku app
heroku create nexrena-api

# Add PostgreSQL
heroku addons:create heroku-postgresql:essential-0

# Set environment variables
heroku config:set API_KEY="your-secret-key"
heroku config:set CORS_ORIGINS="https://nexrena.com,https://your-ops-url.vercel.app"

# Deploy
git subtree push --prefix nexrena-api heroku main

# Push the database schema
heroku run npx prisma db push
```

### After Each Schema Change

```bash
heroku run npx prisma db push
```

---

## Deploying the Frontend to Vercel

1. Push repo to GitHub
2. [vercel.com](https://vercel.com) → **Add New** → **Project**
3. Import the repository
4. Set **Root Directory** to `nexrena-ops`
5. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your Heroku app URL
   - `NEXT_PUBLIC_API_KEY` = your API key
6. Click **Deploy**

---

## Local Development

```bash
# Terminal 1 — Backend
cd nexrena-api
cp .env.example .env   # then edit DATABASE_URL to point to local Postgres
npm install
npx prisma db push     # create tables
npm run dev             # runs on :4000

# Terminal 2 — Frontend
cd nexrena-ops
# create .env.local with NEXT_PUBLIC_API_URL=http://localhost:4000 and NEXT_PUBLIC_API_KEY=your-key
npm run dev             # runs on :3001
```

---

## Dashboard (`/`)

At a glance:

- **Pipeline Value** — total deal value of active (non-won/lost) contacts
- **Revenue Closed** — total value of "won" deals
- **Outstanding** — dollar amount of invoices with "sent" status
- **Total Collected** — dollar amount of "paid" invoices
- **Hours This Month** — billable + non-billable hours logged this month
- **MTD Expenses** — month-to-date expense total
- **Pending Proposals** — proposals awaiting client response
- **Website Leads** — total lead submissions
- **Pipeline list** — your 5 most recent contacts with stage badges
- **Active Projects** — projects not yet delivered, with progress bars
- **Recent Invoices** — your 4 most recent invoices with status and amount
- **Pipeline by Stage** — visual funnel chart

---

## CRM Pipeline (`/crm`)

Manage your clients and sales pipeline.

### Adding a Contact
1. Click **+ Add Contact**
2. Fill in: name, company, email, phone, industry, deal stage, deal value
3. Optionally add a **billing address** (this auto-fills into invoices later)
4. Add notes for context
5. Click **Save Contact**

### Kanban vs. List View
Toggle between **Kanban** and **List** using the toggle buttons in the header.

### Editing / Deleting
- **List:** Hover a row, click **Edit** or **Del**
- **Kanban:** Click any card to open the edit modal

---

## Proposals (`/proposals`)

Create, manage, and send branded proposals to clients.

### Creating a Proposal
1. Click **+ New Proposal**
2. **Auto-fill from CRM** — select a contact to populate name, company, email
3. Add a title, set valid-until date and timeline
4. Add **services** from Nexrena's service menu or type a custom description
5. Set pricing per service, optionally apply a **discount**
6. Write a **Scope of Work** describing deliverables
7. Click **Create Proposal**

### Quick Actions
- **View** — opens the print-ready branded proposal document
- **Edit** — opens the edit form
- **Dup** — duplicates as a new draft
- **Del** — deletes

### Print / PDF Export (`/proposals/[id]/print`)
1. Click **View** on any proposal
2. Click **Download PDF** → browser print dialog → **Save as PDF**

---

## Projects (`/projects`)

Track project progress with phase-based checklists.

### Creating a Project
1. Click **+ New Project**
2. Enter project name, client name, project type (Web, SEO, or Both)
3. Set status, start/end dates, and project value
4. Click **Save Project**

A default phase checklist is auto-generated based on project type.

### Tracking Progress
Expand a project row to see phase checklists. Click checkboxes to mark tasks done. The progress bar updates in real-time.

---

## Time Tracking (`/time`)

Track hours spent on projects for billing and profitability analysis.

### Logging Time
1. Click **+ Log Time**
2. Select a project from the dropdown or type a project name
3. Describe what you worked on
4. Enter hours (supports 0.25 increments) and date
5. Mark as billable or non-billable
6. Click **Log Time**

### Filters
- **Period:** This Month, This Week, All Time
- **Project:** Filter by specific project

### Mark as Billed
Click **Billed** on any unbilled entry to mark it as invoiced.

### Stats
- **Total Hours** / **Billable Hours** / **Unbilled** / **Utilization %**

---

## Invoices (`/invoices`)

Create, manage, and export professional invoices.

### Creating an Invoice
1. Click **+ New Invoice**
2. **Auto-fill from saved client** — select a CRM contact to auto-populate name, company, email, and billing address
3. The invoice number is auto-generated (`NXR-2026-001`, `NXR-2026-002`, etc.)
4. Select **Payment Terms** (Net 15, Net 30, or Custom) — the due date auto-calculates
5. Add **line items**: select from Nexrena's service menu or type a custom description
6. Set **Tax %** if applicable (optional — defaults to 0)
7. Review the **subtotal**, **tax**, and **grand total**
8. The **Notes** field comes pre-filled with default payment terms
9. Click **Create Invoice**

### Quick Actions
- **View** — opens the print-ready preview
- **Edit** — opens the edit form
- **Paid** — one-click mark as paid
- **Dup** — duplicates the invoice as a new draft
- **Del** — deletes

---

## Print / PDF Export (`/invoices/[id]/print`)

1. Click **View** on any invoice
2. Click **Download PDF** → browser print dialog → **Save as PDF**

The output is a branded A4 document with Nexrena lettermark, line items, tax breakdown, payment terms, and footer.

---

## Expenses (`/expenses`)

Track business expenses by category, optionally tied to projects.

### Adding an Expense
1. Click **+ Add Expense**
2. Select a category: Software, Contractors, Hosting, Marketing, Office, Other
3. Enter amount, description, vendor, and date
4. Optionally link to a project for profitability tracking
5. Click **Save Expense**

### Filters
- **Period:** This Month, This Quarter, All Time
- **Category:** Filter by expense type

---

## Reports (`/reports`)

Revenue analytics, profitability, and utilization metrics.

### Key Metrics
- **Revenue** — total collected from paid invoices
- **Expenses** — total costs in period
- **Net Profit** — revenue minus expenses, with margin %
- **Outstanding** — unpaid invoices
- **Effective Rate** — revenue / billable hours

### Charts
- **Monthly Revenue** — bar chart of collected revenue by month
- **Expenses by Category** — breakdown of spending
- **Project Profitability** — revenue, costs, hours, and profit per project
- **Revenue by Client** — top clients by collected revenue

### Period Filters
- **YTD** — year to date
- **12 Mo** — trailing 12 months
- **All** — all time

---

## Website Leads (`/leads`)

All contact form submissions from nexrena.com appear here automatically.

### Viewing Leads
- Table with name, company, email, project type, budget, and date
- Click any row to expand and read the full message

### Convert to CRM
Click **→ CRM** on any lead to create a CRM contact from it, pre-filled with their info and original message in notes.

### How It Works
The contact form at `nexrena.com/contact` POSTs to `POST /api/leads` on the backend. This endpoint is public (no API key required) but rate-limited to prevent spam.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/health` | — | Health check |
| `POST` | `/api/leads` | Public | Website contact form submission |
| `GET` | `/api/leads` | API Key | List all leads |
| `DELETE` | `/api/leads/:id` | API Key | Delete a lead |
| `GET` | `/api/contacts` | API Key | List all contacts |
| `POST` | `/api/contacts` | API Key | Create a contact |
| `PUT` | `/api/contacts/:id` | API Key | Update a contact |
| `DELETE` | `/api/contacts/:id` | API Key | Delete a contact |
| `GET` | `/api/proposals` | API Key | List all proposals |
| `POST` | `/api/proposals` | API Key | Create a proposal |
| `PUT` | `/api/proposals/:id` | API Key | Update a proposal |
| `DELETE` | `/api/proposals/:id` | API Key | Delete a proposal |
| `GET` | `/api/projects` | API Key | List all projects |
| `POST` | `/api/projects` | API Key | Create a project |
| `PUT` | `/api/projects/:id` | API Key | Update a project |
| `DELETE` | `/api/projects/:id` | API Key | Delete a project |
| `GET` | `/api/time-entries` | API Key | List all time entries |
| `POST` | `/api/time-entries` | API Key | Create a time entry |
| `PUT` | `/api/time-entries/:id` | API Key | Update a time entry |
| `DELETE` | `/api/time-entries/:id` | API Key | Delete a time entry |
| `GET` | `/api/invoices` | API Key | List all invoices |
| `POST` | `/api/invoices` | API Key | Create an invoice |
| `PUT` | `/api/invoices/:id` | API Key | Update an invoice |
| `DELETE` | `/api/invoices/:id` | API Key | Delete an invoice |
| `GET` | `/api/expenses` | API Key | List all expenses |
| `POST` | `/api/expenses` | API Key | Create an expense |
| `PUT` | `/api/expenses/:id` | API Key | Update an expense |
| `DELETE` | `/api/expenses/:id` | API Key | Delete an expense |

All protected endpoints require `Authorization: Bearer <API_KEY>` header.
