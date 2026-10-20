# Renewal Radar (practice repo)

A customer success app for a SaaS company. Customer Success Managers (CSMs)
track their accounts, each account's health score and renewal date, and the
tasks they need to do to keep each customer.

This is a **practice repo for a timed build exercise**. The `tickets/` folder
has two bug reports and one feature request, written by the people who use the
app. Built on the MERN stack: MongoDB, Express, React and Node.

## Run it

Needs Node 18 or newer.

```bash
# terminal 1: API on http://localhost:4100
cd server
npm install
npm run dev

# terminal 2: UI on http://localhost:5175
cd client
npm install
npm run dev
```

**No database to install.** If `MONGO_URL` is not set, the server starts a
throwaway in-memory MongoDB and fills it with sample data. The first start
downloads MongoDB once (about 100 MB), so give it a minute. Data resets every
time the server restarts, which is handy for starting over.

To use your own MongoDB instead (for example with Docker):

```bash
docker run -d -p 27017:27017 mongo:7
MONGO_URL=mongodb://localhost:27017/renewal-radar npm run dev   # inside server/
npm run seed                                                    # re-seed it any time
```

Run the backend tests with `cd server && npm test`.

## What is in here

```
server/
  src/
    app.js                  Express app, routes, error handling
    server.js               connects to MongoDB, seeds sample data, starts the API
    db.js                   MONGO_URL or in-memory MongoDB
    models/                 Mongoose models: Account, Task
    routes/                 accounts, tasks, dashboard
    services/importService.js   bulk import from spreadsheet rows
    seed/                   sample accounts and tasks
  tests/                    Vitest + Supertest API tests
client/
  src/
    App.jsx                 navigation between pages
    pages/                  Dashboard, Accounts, AccountDetail
    api.js                  all calls to the backend
tickets/                    the work to do
```

## Data model

**Account:** name, owner (the CSM), segment (SMB, Mid-Market, Enterprise),
arr (annual recurring revenue in USD), healthScore (0 to 100), renewalDate,
source (manual or import).

**Task:** accountId, title, dueDate, done, completedAt.

An account is **at risk** when its health score is under 40.

## API

| Method | Path | What it does |
| --- | --- | --- |
| GET | /api/accounts?owner= | List accounts, optionally for one CSM |
| POST | /api/accounts | Create an account |
| GET | /api/accounts/:id | One account |
| PUT | /api/accounts/:id | Update an account |
| POST | /api/accounts/import | Body `{ rows: [...] }`, bulk import from a spreadsheet |
| GET | /api/accounts/:id/tasks | Tasks for an account |
| POST | /api/accounts/:id/tasks | Add a task |
| PATCH | /api/tasks/:id | Body `{ done }`, mark a task done or not done |
| GET | /api/dashboard/summary | Account count, total ARR, at-risk count |
| GET | /api/dashboard/at-risk | At-risk accounts, lowest health first |
| GET | /api/dashboard/owners | List of CSMs |

## How to practice

Treat it like the real exercise.

1. **Plan (15 min):** read all three tickets, run the app and the tests, click
   through the screens, and write a short plan.
2. **Build (90 min):** the two bugs first, then the feature. Use an AI agent as
   much as you like, but understand every change it makes.
3. **Review (30 min):** a 10 minute pitch of the value you delivered, then
   defend your decisions as if two engineers were questioning you.

Tips:

- All the existing tests pass. That does not mean the app is free of bugs.
- Reproduce each bug before changing anything, and write down the exact steps.
- Write a test that fails for each bug, then make it pass.
- The feature request is vague on purpose. Decide what you would ask Jordan,
  and write down any assumptions you make.
- Think about data that already exists, not just new data.
