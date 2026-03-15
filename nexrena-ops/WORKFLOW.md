# Nexrena Ops — How It Works

One default path for everything. Two shortcuts for repeat work.

---

## The Default Flow

```
Lead  ->  Proposal  ->  Project  ->  Invoice  ->  Paid
```

| Step | Where | Action |
|------|-------|--------|
| 1. New lead | `/leads` | Click **-> CRM** to convert |
| 2. Send proposal | `/proposals` | **+ New** -> select client -> fill -> PDF -> send |
| 3. They signed | `/crm` | Mark as `won` |
| 4. Start project | `/projects` | **+ New Project** -> select client -> phases auto-create |
| 5. Bill client | `/invoices` | **+ New** -> select client (auto-fills) -> add items -> PDF -> send |
| 6. They paid | `/invoices` | Click **Paid** |

That covers every new client engagement from first contact to collected payment.

---

## Shortcut: Repeat Client

Client already exists in CRM. Skip leads and proposals.

```
Project  ->  Invoice  ->  Paid
```

1. `/projects` -> **+ New Project** -> select existing client
2. `/invoices` -> **+ New** -> select client (everything auto-fills)
3. Click **Paid** when payment arrives

---

## Shortcut: Monthly / Recurring Billing

Same client, same service, every month.

```
Duplicate last invoice  ->  Update date  ->  Send  ->  Mark paid
```

1. `/invoices` -> find last month's invoice -> click **Dup**
2. Update invoice date and line item month
3. PDF -> send
4. Click **Paid** when payment arrives

---

## Daily Routine (Under 2 Minutes)

1. Open the dashboard — see what needs attention
2. Act on anything flagged: convert a lead, follow up on a proposal, send an invoice, mark a payment

That's it. Everything else is when-you-need-it.

---

## When-You-Need-It Tools

These are useful but not required every day.

| Tool | When to use |
|------|-------------|
| **CRM** | Update a deal stage, edit client info, add billing address |
| **Expenses** | When you pay for something (hosting, software, contractors) |
| **Reports** | Monthly check-in on revenue and profit margins |

---

## Business Rules

- New business always starts in **Leads** or **CRM**
- A signed deal always creates a **Project**
- Billing always happens from **Invoices**
- Reports are a monthly habit, not a daily one
- Always add billing address when creating a CRM contact (saves time on every invoice)

---

## Quick Reference

| I need to... | Go to... | Do this... |
|--------------|----------|------------|
| See new leads | `/leads` | Click **-> CRM** |
| Send a proposal | `/proposals` | **+ New** -> select client -> fill -> PDF |
| Start a project | `/projects` | **+ New** -> select client |
| Bill a client | `/invoices` | **+ New** -> select client -> add items -> PDF |
| Collect payment | `/invoices` | Click **Paid** |
| Monthly retainer | `/invoices` | **Dup** last invoice -> update date -> send |
| See how business is doing | `/reports` | Check monthly |
