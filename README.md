# FitPrep

FitPrep is a React Native mobile app prototype for **PrepMate**, a weekly fitness meal-prep preorder system built for a mobile development class.

The app models a small meal-prep business workflow: admins publish weekly meal plans, customers browse and preorder a plan for an upcoming week, checkout records a mock-paid GCash order, and both sides can view daily delivery progress for the ordered week.

## What This App Is For

PrepMate is built around a structured weekly preorder model. It is not an on-demand food delivery app, a rider dispatch app, or a full subscription platform.

The app is meant for:

- Fitness-oriented customers who want predictable weekly meals with visible calories and macros.
- Busy students, professionals, gym-goers, and health-conscious users who want less daily food decision-making.
- Meal-prep businesses that need a simple way to publish weekly plans, collect preorders, and track fulfillment.

For the class deliverable, the goal is a stable, demoable MVP that proves the main customer/admin workflow without overbuilding payment, logistics, or subscription infrastructure.

## Current MVP

The prototype supports:

- Supabase email/password authentication.
- Role-based customer and admin experiences.
- Customer profile data through Supabase Auth metadata and the app-facing `profiles` table.
- Admin weekly plan CRUD for `Cutting`, `Bulking`, and `Maintenance` plans.
- Admin meal CRUD under each weekly plan.
- Customer weekly browsing with Monday-Sunday plan weeks.
- Customer preorder checkout for upcoming published plans.
- Mock GCash payment recorded as `Paid (Mock)`.
- Durable weekly order rows in Supabase.
- Generated daily delivery rows for the ordered Monday-Sunday week.
- Admin delivery tracking by date, delivery slot, and status.
- Customer delivery tracking scoped to the signed-in user.
- Demo-friendly delivery status projection for upcoming, same-day, and past slots.
- Mock-data fallback when Supabase environment variables are not configured.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Mobile app | React Native with Expo |
| UI runtime | React 19, React Native 0.85 |
| Backend | Supabase PostgreSQL |
| Auth | Supabase Auth |
| State | React Context and local component state |
| Styling | React Native StyleSheet, shared theme module |
| Fonts | Plus Jakarta Sans via Expo Google Fonts |

## Project Structure

```text
FitPrep/
  app.json
  eas.json
  index.js
  metro.config.js
  package.json
  seed_plans.sql
  assets/
  src/
    App.js
    components/
    context/
    lib/
    mock/
    screens/
    services/
```

Important folders:

- `src/screens` contains the customer and admin app screens.
- `src/services` contains Supabase-facing data operations.
- `src/context` contains shared app state, including plan loading.
- `src/components` contains shared UI elements and navigation bars.
- `src/mock` contains fallback data for local/demo use.
- `assets` contains app icons and brand imagery.

## Environment Variables

Create a local Expo environment file with:

```text
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

When those variables are missing, the app logs a warning and uses mock/demo fallbacks where supported.

## Supabase Data Model

The app expects these main tables:

| Table | Purpose |
| --- | --- |
| `profiles` | App-facing profile mirror for Supabase Auth users. |
| `published_weekly_plans` | Weekly plan offerings for a Monday-Sunday week. |
| `weekly_plan_meals` | Meals attached to each weekly plan. |
| `weekly_orders` | Customer preorders with mock payment and plan snapshot data. |
| `daily_deliveries` | One delivery row per ordered day, used for admin and customer tracking. |

Supabase Auth remains the identity source. Order and delivery rows reference `auth.users.id`.

The included `seed_plans.sql` file provides sample weekly plan and meal data for demos.

## Main User Flows

### Customer

1. Register or log in.
2. Browse published weekly plans.
3. Filter by `Cutting`, `Bulking`, or `Maintenance`.
4. Open a weekly plan and review daily meals, descriptions, calories, and macros.
5. Choose a delivery slot: `06:00` or `10:00`.
6. Place a mock-paid GCash preorder.
7. View the order and daily delivery statuses.
8. Use the local demo review flow where available.

### Admin

1. Log in with an admin role.
2. Create, edit, publish, and delete weekly plans.
3. Add, edit, and delete meals for each plan.
4. View customer orders and daily deliveries.
5. Filter deliveries by date, slot, and status.
6. Update daily delivery status for demo fulfillment.
7. View and manage customer profile rows where admin access is available.

## Business Rules

- A plan week starts on Monday and ends on Sunday.
- The supported plan categories are `Cutting`, `Bulking`, and `Maintenance`.
- Customers browse published plans only.
- Customers preorder upcoming published plans.
- Checkout uses mock GCash payment, not a real payment gateway.
- The order stores a `plan_snapshot` so old orders remain understandable after admins edit plans.
- Daily deliveries are generated from the weekly order.
- Customers can only read their own orders and deliveries.
- Admins can manage plans, meals, orders, deliveries, and profiles according to Supabase policies.

## Demo Walkthrough

1. Admin logs in and opens the manage plans area.
2. Admin creates or edits a weekly plan.
3. Admin adds meals for the week.
4. Customer logs in and sees the published plan.
5. Customer opens the plan, checks meals/macros, and places a preorder.
6. Checkout records a mock-paid GCash order and generates daily deliveries.
7. Admin opens delivery tracking and updates a delivery status.
8. Customer opens delivery tracking and sees their own delivery progress.


## Scope Boundaries

These are intentionally out of scope for the MVP:

- Real payment processing.
- GPS or map-based delivery tracking.
- Rider assignment.
- Push notifications.
- Multi-week subscriptions.
- Pause or skip logic.
- Meal customization.
- AI recommendations.
- Full order status audit history.
- Persisted production reviews.


## Key Source Files

| File | Role |
| --- | --- |
| `src/App.js` | Top-level navigation, auth session handling, and screen routing. |
| `src/lib/supabaseClient.js` | Supabase client setup and mock fallback detection. |
| `src/context/PlansContext.js` | Shared weekly plan state. |
| `src/services/plansService.js` | Plan queries and admin plan CRUD. |
| `src/services/mealsService.js` | Meal create, update, and delete operations. |
| `src/services/ordersService.js` | Checkout, weekly order creation, snapshots, and delivery generation. |
| `src/services/deliveriesService.js` | Admin/customer daily delivery queries and status updates. |
| `src/services/profilesService.js` | Customer profile and admin profile access. |
| `src/services/deliveryStatusService.js` | Demo delivery status projection. |

