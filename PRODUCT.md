# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

TasKeep is primarily for individuals organizing their personal lives through a verified Firebase account.

## Product Purpose

TasKeep is a private, all-in-one personal command center that brings everyday planning and self-management into one place. It helps an individual manage tasks, habits, journal entries, and personal finances with verified account access and user-scoped cloud records.

Success means the user can understand what needs attention, record progress and reflection, and maintain useful personal records from a single responsive application.

## Positioning

TasKeep combines task planning, habit tracking, journaling, productivity statistics, and personal finance tracking in one private workspace. Its defining mechanism is the connection of these everyday self-management activities under one verified Firebase identity.

## Operating Context

- Used by one person on desktop or mobile web with a verified Firebase account.
- Account records are stored as Firebase user-scoped cloud data and can be accessed after sign-in on another browser or device.
- A user may optionally import readable browser-local records once; the import retains the local records.
- Task work can be viewed as a Kanban board, list, calendar, or statistics dashboard.

## Capabilities and Constraints

- Create, edit, complete, delete, categorize, prioritize, schedule, filter, and search tasks.
- Organize tasks with subtasks and recurring schedules.
- Track habits and completion history.
- Write date-based journal entries.
- Record and categorize personal finance transactions.
- Review task and productivity statistics.
- Persist account records as user-scoped Cloud Firestore data after email verification.
- Authentication is Firebase email/password identity with verification before cloud data access.
- No account deletion, MFA, email-address change, or admin interface is provided.
- The application must remain usable on desktop and mobile web.

## Brand Commitments

- Product name: TasKeep.
- Product data and account records are private to the signed-in user through Firebase Authentication and Firestore access rules.

## Evidence on Hand

- The implemented application in `src/` demonstrates the current product capabilities.
- No testimonials, customer claims, usage metrics, case studies, or external proof assets are present; future work must not fabricate them.

## Product Principles

1. Keep everyday self-management unified rather than scattering it across disconnected tools.
2. Preserve user privacy through verified, user-scoped account access.
3. Make the user’s current priorities and progress easy to understand.
4. Support quick daily use across desktop and mobile web.
5. Treat task planning, routines, reflection, and spending as complementary views of personal life.
