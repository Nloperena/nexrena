# Stripe setup for Nexrena client portal

Online invoice payments use **Stripe Checkout**. The API never stores bank details — you complete onboarding in the Stripe Dashboard yourself.

## 1. Create your Stripe account

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com) and sign up.
2. Complete business verification. Sole proprietors without an EIN can use SSN + personal bank during onboarding.
3. Add your bank account **only in the Stripe Dashboard** — never in this repo, `.env`, or Heroku beyond API keys.

## 2. API keys (test mode first)

1. In Stripe Dashboard → **Developers → API keys**, stay in **Test mode**.
2. Create a **restricted key** (`rk_...`) with permissions:
   - Checkout Sessions — Write
   - Customers — Write
   - Subscriptions — Write
   - Products — Write
   - Prices — Write
   - Webhooks — Read (for verifying signatures)
3. Copy the restricted key — you will set it as `STRIPE_SECRET_KEY`.

Prefer restricted keys over full secret keys (`sk_...`). See [Stripe restricted API keys](https://docs.stripe.com/keys/restricted-api-keys).

## 3. Webhook endpoint

1. Dashboard → **Developers → Webhooks → Add endpoint**
2. URL: `https://nexrena-api-5dc54effaa9f.herokuapp.com/api/stripe/webhook`
3. Events to listen for:
   - `checkout.session.completed`
   - `invoice.paid`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. Copy the **Signing secret** (`whsec_...`) → `STRIPE_WEBHOOK_SECRET`

## 4. Heroku config

```bash
heroku config:set STRIPE_SECRET_KEY=rk_test_... -a nexrena-api-5dc54effaa9f
heroku config:set STRIPE_WEBHOOK_SECRET=whsec_... -a nexrena-api-5dc54effaa9f
heroku config:set PORTAL_URL=https://nexrena-ops.vercel.app -a nexrena-api-5dc54effaa9f
```

Use live keys (`rk_live_...`, live webhook secret) only after test payments succeed.

## 6. Subscription autopay (recurring hosting & add-ons)

Clients with active **Subscriptions** in Ops can enable autopay from the portal (**Billing** or **Settings**):

1. Portal → **Set up autopay** opens Stripe Checkout in **subscription** mode.
2. One Checkout can cover multiple services (e.g. hosting + analytics) on a single monthly charge.
3. After checkout, local subscriptions are linked to Stripe; **Run billing** skips them (`stripeSubscriptionId` set).
4. Stripe renewals fire `invoice.paid` → API records a paid local invoice for portal/Ops history.

Add webhook events: `customer.subscription.updated`, `customer.subscription.deleted`.

Restricted key also needs **Subscriptions**, **Products**, and **Prices** — Write.

## Warren autopay test

1. Ops → Subscriptions: confirm hosting ($20) + analytics ($20) for Warren.
2. Warren portal → **Billing** → **Set up autopay — $40/mo**.
3. Test card `4242…` → confirm both subs show **Autopay on**.
4. Stripe Dashboard → Subscriptions: one active sub, $40/mo.

## 5. Test a payment

1. Use Stripe test card `4242 4242 4242 4242`, any future expiry, any CVC.
2. In Ops, create or use a **sent** invoice for a portal client.
3. Sign in to the client portal → **Billing** → **Pay now**.
4. Confirm the invoice status becomes `paid` in Ops (webhook).

## 50/50 project payments

### Ops workflow

1. **Invoices → New Invoice** — select client + project, enter total, check **Split 50/50**.
2. API creates:
   - **Deposit** (50%, status `sent`, due immediately)
   - **Balance** (50%, status `draft`, hidden from portal until delivery)
3. Client pays deposit via portal Checkout when `STRIPE_SECRET_KEY` is set.
4. **Projects → Deliver** — marks project delivered and sends the balance invoice (`sent`).

Or call the API directly:

```bash
curl -X POST https://nexrena-api-5dc54effaa9f.herokuapp.com/api/invoices/split-deposit \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"total":5000,"projectId":"...","contactId":"...","description":"Website upgrade"}'
```

```bash
curl -X PATCH https://nexrena-api-5dc54effaa9f.herokuapp.com/api/projects/PROJECT_ID/deliver \
  -H "Authorization: Bearer $API_KEY"
```

### Portal display

- Billing lists deposit vs balance with labels: **Project deposit (50%)** / **Final payment (50%) — due on completion**
- Project view shows: **Deposit paid ✓ · Balance due on delivery** (or **Fully paid ✓**)

## Without Stripe keys

The portal still works. Unpaid invoices show **Online payment is coming soon** and clients can contact Nexrena to pay.

## Warren / TTAG test data

Run `npm run db:seed` in `nexrena-api` to seed Warren Daughtridge (TTAG) with a website upgrade project and 50/50 invoices ($2,500 total → $1,250 deposit sent, $1,250 balance draft).
