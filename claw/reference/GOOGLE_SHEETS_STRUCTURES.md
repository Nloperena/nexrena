# Nexrena — Google Sheets Structure Guide
## Create these 5 sheets. This doc defines exact columns, formulas, conditional formatting, and data validation for each.

---

# SHEET 1: Master Project Tracker
**Filename:** Nexrena — Project Tracker

## Columns

| Column | Header | Width | Type | Notes |
|--------|--------|-------|------|-------|
| A | Project Name | 200px | Text | |
| B | Client | 150px | Text | |
| C | Status | 120px | Dropdown | Lead, Proposal, In Progress, Review, Deployed, Maintenance, On Hold, Cancelled |
| D | Current Phase | 150px | Dropdown | Discovery, Design, Dev Sprint 1, Dev Sprint 2, QA, Launch, Post-Launch |
| E | Start Date | 100px | Date | |
| F | Deadline | 100px | Date | |
| G | Days Remaining | 80px | Formula | `=IF(F2="","",F2-TODAY())` |
| H | Budget | 100px | Currency | Total project value |
| I | Paid to Date | 100px | Currency | |
| J | Outstanding | 100px | Formula | `=H2-I2` |
| K | Repo Link | 200px | URL | GitHub repo |
| L | Staging URL | 200px | URL | |
| M | Production URL | 200px | URL | |
| N | Blockers | 250px | Text | |
| O | Next Milestone | 200px | Text | |
| P | Next Milestone Date | 100px | Date | |
| Q | Last Updated | 100px | Date | |
| R | Notes | 300px | Text | |

## Conditional Formatting
- Column C "Status":
  - Lead = Light yellow
  - Proposal = Light orange
  - In Progress = Light blue
  - Review = Light purple
  - Deployed = Light green
  - Maintenance = Light gray
  - On Hold = Dark yellow
  - Cancelled = Light red
- Column G "Days Remaining":
  - < 0 = Red background (overdue)
  - 0-3 = Orange background (urgent)
  - 4-7 = Yellow background (approaching)
  - > 7 = Green background (healthy)
- Column J "Outstanding":
  - > 0 = Light red background

## Summary Row (Row 1 — freeze this + header)
Add a summary section at the top (rows 1-3):
- Active projects: `=COUNTIFS(C:C,"In Progress")+COUNTIFS(C:C,"Review")`
- Total pipeline value: `=SUMIF(C:C,"Lead",H:H)+SUMIF(C:C,"Proposal",H:H)`
- Total outstanding: `=SUM(J:J)`

---

# SHEET 2: CRM / Lead Tracker
**Filename:** Nexrena — CRM

## Columns

| Column | Header | Width | Type | Notes |
|--------|--------|-------|------|-------|
| A | Company | 180px | Text | |
| B | Contact Name | 150px | Text | |
| C | Title | 120px | Text | |
| D | Email | 200px | Text | |
| E | Phone | 120px | Text | |
| F | LinkedIn | 200px | URL | |
| G | Source | 100px | Dropdown | Inbound, Outbound, Referral, Social, Other |
| H | Status | 120px | Dropdown | New, Contacted, Discovery, Proposal Sent, Negotiating, Won, Lost, Nurture |
| I | Lead Score | 80px | Dropdown | Hot, Warm, Cold |
| J | Est. Value | 100px | Currency | |
| K | First Contact | 100px | Date | |
| L | Last Contact | 100px | Date | |
| M | Days Since Contact | 80px | Formula | `=IF(L2="","",TODAY()-L2)` |
| N | Next Follow-Up | 100px | Date | |
| O | Follow-Up Overdue? | 80px | Formula | `=IF(N2="","",IF(TODAY()>N2,"⚠️ OVERDUE","OK"))` |
| P | Website Assessment | 300px | Text | |
| Q | Outreach Angle | 300px | Text | |
| R | Loss Reason | 150px | Text | Only fill when Status = Lost |
| S | Notes | 300px | Text | |

## Conditional Formatting
- Column H "Status":
  - New = Light blue
  - Contacted = Light yellow
  - Discovery = Light orange
  - Proposal Sent = Light purple
  - Negotiating = Orange
  - Won = Green
  - Lost = Red
  - Nurture = Gray
- Column I "Lead Score":
  - Hot = Red text
  - Warm = Orange text
  - Cold = Blue text
- Column M "Days Since Contact":
  - > 7 = Red background
  - 5-7 = Orange background
  - < 5 = Green background
- Column O: "⚠️ OVERDUE" = Red background

## Summary Section (Top)
- Total active leads: `=COUNTIFS(H:H,"<>Won",H:H,"<>Lost",H:H,"<>Nurture")-1`
- Hot leads: `=COUNTIF(I:I,"Hot")`
- Pipeline value: `=SUMIFS(J:J,H:H,"<>Won",H:H,"<>Lost")`
- Win rate: `=COUNTIF(H:H,"Won")/(COUNTIF(H:H,"Won")+COUNTIF(H:H,"Lost"))`
- Avg deal size: `=AVERAGEIF(H:H,"Won",J:J)`

---

# SHEET 3: Content Calendar
**Filename:** Nexrena — Content Calendar

## Columns

| Column | Header | Width | Type | Notes |
|--------|--------|-------|------|-------|
| A | Date | 100px | Date | Target publish date |
| B | Platform | 100px | Dropdown | Blog, LinkedIn, X/Twitter, Email, Newsletter |
| C | Type | 120px | Dropdown | Thought Leadership, Client Education, Case Study, Hot Take, Dev Tips, Agency Update, Behind the Scenes |
| D | Title / Hook | 300px | Text | |
| E | Status | 100px | Dropdown | Idea, Drafted, Boss Review, Approved, Published, Killed |
| F | Draft Link | 200px | URL | Link to Google Doc or MD file |
| G | Published Link | 200px | URL | Live URL once published |
| H | Performance | 100px | Text | Views / likes / leads generated |
| I | Notes | 200px | Text | |

## Conditional Formatting
- Column E:
  - Idea = White
  - Drafted = Light yellow
  - Boss Review = Light orange
  - Approved = Light blue
  - Published = Green
  - Killed = Light red with strikethrough

## Views to Create (Filtered views in Google Sheets)
1. "This Week" — Filter A for current week dates
2. "Needs Review" — Filter E for "Boss Review"
3. "By Platform" — Group by Column B
4. "Ideas Backlog" — Filter E for "Idea"

---

# SHEET 4: Revenue Tracker
**Filename:** Nexrena — Revenue Tracker

## Columns

| Column | Header | Width | Type | Notes |
|--------|--------|-------|------|-------|
| A | Invoice # | 80px | Text | NX-001, NX-002, etc. |
| B | Date Sent | 100px | Date | |
| C | Client | 150px | Text | |
| D | Project | 200px | Text | |
| E | Description | 200px | Text | e.g., "50% deposit", "Design milestone" |
| F | Amount | 100px | Currency | |
| G | Due Date | 100px | Date | |
| H | Status | 100px | Dropdown | Draft, Sent, Paid, Overdue, Cancelled, Refunded |
| I | Days Overdue | 80px | Formula | `=IF(H2="Paid","",IF(H2="Sent",IF(TODAY()>G2,TODAY()-G2,0),""))` |
| J | Payment Date | 100px | Date | |
| K | Payment Method | 100px | Dropdown | Stripe, Bank Transfer, Check, Cash, Other |
| L | Notes | 200px | Text | |

## Conditional Formatting
- Column H:
  - Draft = Gray
  - Sent = Light yellow
  - Paid = Green
  - Overdue = Red
  - Cancelled = Strikethrough
- Column I:
  - > 30 = Dark red
  - 15-30 = Red
  - 7-14 = Orange
  - 1-6 = Yellow

## Summary Section
- Total invoiced (this month): `=SUMIFS(F:F,B:B,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),B:B,"<="&EOMONTH(TODAY(),0))`
- Total collected (this month): `=SUMIFS(F:F,J:J,">="&DATE(YEAR(TODAY()),MONTH(TODAY()),1),J:J,"<="&EOMONTH(TODAY(),0))`
- Total outstanding: `=SUMIF(H:H,"Sent",F:F)+SUMIF(H:H,"Overdue",F:F)`
- Overdue amount: `=SUMIF(H:H,"Overdue",F:F)`
- Collection rate: `=SUMIF(H:H,"Paid",F:F)/SUMIFS(F:F,H:H,"<>Draft",H:H,"<>Cancelled")`

---

# SHEET 5: Monthly P&L
**Filename:** Nexrena — P&L

## Structure (Each month gets a row)

| Column | Header | Type |
|--------|--------|------|
| A | Month | Date (MMM YYYY) |
| B | Revenue Invoiced | Currency |
| C | Revenue Collected | Currency |
| D | Outstanding | Formula: `=B2-C2` |
| E | Expenses: Tools | Currency |
| F | Expenses: Contractors | Currency |
| G | Expenses: Marketing | Currency |
| H | Expenses: Other | Currency |
| I | Total Expenses | Formula: `=SUM(E2:H2)` |
| J | Net Profit | Formula: `=C2-I2` |
| K | Margin | Formula: `=IF(C2>0,J2/C2,"N/A")` |
| L | Active Projects | Number |
| M | New Clients | Number |
| N | Deals Won | Number |
| O | Deals Lost | Number |
| P | Win Rate | Formula: `=IF(N2+O2>0,N2/(N2+O2),"N/A")` |
| Q | Avg Deal Size | Currency |
| R | Notes | Text |

## Conditional Formatting
- Column J (Net Profit):
  - Positive = Green
  - Negative = Red
- Column K (Margin):
  - > 50% = Green
  - 20-50% = Yellow
  - < 20% = Red

## Chart
Create a line chart on a separate tab: "Revenue Collected" and "Net Profit" by month. This shows the financial trajectory at a glance.

---

# BONUS: TOOLS & SUBSCRIPTIONS TRACKER
**Add as a tab in the P&L sheet**

| Column | Header | Type |
|--------|--------|------|
| A | Tool Name | Text |
| B | Purpose | Text |
| C | Monthly Cost | Currency |
| D | Annual Cost | Currency |
| E | Billing Cycle | Dropdown: Monthly, Annual |
| F | Next Billing Date | Date |
| G | Essential? | Dropdown: Critical, Nice-to-Have, Cut Candidate |
| H | Login Email | Text |
| I | Notes | Text |

## Summary
- Total monthly tool spend: `=SUM(C:C)`
- Annual run rate: `=SUM(C:C)*12`
- Cut candidates total: `=SUMIF(G:G,"Cut Candidate",C:C)`
