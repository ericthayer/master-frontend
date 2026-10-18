# Launch checklist

Work through this list in order. Anything marked **(blocker)** must be done before the first paid sale.

## 1. Content

- [ ] **(blocker)** Re-check every fact in `src/content/reference.ts` against the live Copilot app, GitHub and Netlify. Then set `verifiedOn` to today's date. The list of facts is in `docs/decisions.md` §3.
- [ ] Walk through each course end-to-end on a fresh GitHub and Netlify account. Time it (target: 60 minutes or less) and fix any step that doesn't match the real UI.
- [ ] Replace the practice brief and prices in the Track A and Track C prompts if test learners find them confusing.
- [ ] Run `npm run ebooks` and read each PDF once.

## 2. Accounts and services

- [ ] **(blocker)** Supabase:
  - create the project and run `supabase/migrations/0001_init.sql`
  - enable email (magic-link) auth
  - set the Site URL and add `<site>/login` to the redirect URLs
  - customise the magic-link email
- [ ] **(blocker)** Stripe products and prices:
  - a $5 one-time price for courses (`STRIPE_PRICE_COURSE`)
  - a $24/year recurring price for the pass (`STRIPE_PRICE_PASS`)
  - a $5-off "once" coupon for upgrades (`STRIPE_COUPON_UPGRADE`)
- [ ] **(blocker)** Stripe webhook:
  - endpoint: `<site>/api/stripe-webhook`
  - events:
    - `checkout.session.completed`
    - `checkout.session.async_payment_succeeded`
    - `customer.subscription.created`, `customer.subscription.updated` and `customer.subscription.deleted`
  - put the signing secret in `STRIPE_WEBHOOK_SECRET`
- [ ] **(blocker)** Stripe customer portal: allow cancelling, updating cards and viewing invoices.
- [ ] Stripe Tax: decide whether to enable it. If you do, set `STRIPE_AUTOMATIC_TAX=true`.
- [ ] **(blocker)** Netlify:
  - set the base directory to `pilot-notes`
  - set every variable from `.env.example`
  - enable form notifications for the `leads` form
- [ ] GitHub: add the repository secrets `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`, then run the **Pilot Notes e-books** workflow once.
- [ ] Replace `supportEmail` in `src/config/product.ts`. Point a real domain at Netlify.

## 3. Test payments (Stripe test mode)

- [ ] Buy one course → you land on `/checkout/success` → access appears → paid modules unlock → the e-book downloads.
- [ ] Buy the pass after a course purchase → the $5 upgrade credit is applied → `/library` shows every course.
- [ ] Cancel the pass in the billing portal → access ends at the end of the period, and purchased courses still work.
- [ ] Send the same webhook twice → no duplicate rows are created.
- [ ] Sign out → paid modules show the paywall again. Bodies are not visible in the page source.
- [ ] Refund flow: issue a refund in Stripe, then remove the entitlement row by hand. This is a manual step and only rarely needed.

## 4. Quality

- [ ] `npm test`, `npm run check` and `npm run build` are all green.
- [ ] Lighthouse on `/` and `/learn/copilot-in-30/f1`, on mobile and desktop: performance 90 or above, accessibility 95 or above.
- [ ] Keyboard-only run of one module (sidebar, checkpoints, sandbox tabs, celebration dialog).
- [ ] With reduced motion on: no 3D hero, confetti or count-ups.
- [ ] Have the legal pages (`/legal/*`) reviewed. They are placeholders.

## 5. Launch funnel

- [ ] The free course CTA works from every page. `/free` redirects to module 1.
- [ ] The track quiz at the end of the free course links to the right paid course.
- [ ] Export the waitlist from Netlify Forms into your email tool and send the launch email.
- [ ] Launch-week offer, if you want one: create a Stripe promotion code. `allow_promotion_codes` is already on in checkout.
- [ ] Add real, permissioned testimonials to `product.testimonials` once they arrive. The section appears automatically.
