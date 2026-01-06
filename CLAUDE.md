# City of Doral Project

## CRITICAL: Primary URL

**http://localhost:8888/Home/index.html** is the PRIMARY entry point.

When user says ANY of these commands, ALWAYS open this URL:
- "start project"
- "run home page"
- "run homepage"
- "open homepage"
- "start"

## Start Project

When user says "start project" or "start", run:
```bash
./start.sh
```

Then ALWAYS open: **http://localhost:8888/Home/index.html**

## Run Home Page

When user says "run home page" or "run homepage":
1. Ensure servers are running (run `./start.sh` if not)
2. Open: **http://localhost:8888/Home/index.html**

```bash
open http://localhost:8888/Home/index.html
```

## Architecture

- **Static Site (port 8888)**: Main website from `Website Scrapped/` directory
- **Next.js (port 3000)**: Admin dashboard, chat API, FAQ API backend

## URLs

| Purpose | URL |
|---------|-----|
| **Homepage (PRIMARY)** | http://localhost:8888/Home/index.html |
| Admin Panel | http://localhost:3000/admin |
| Admin Content/FAQs | http://localhost:3000/admin/content |

## Key Features

- **FAQ Widget**: Homepage displays FAQs from admin portal (`/api/faqs`)
- **Chat Widget**: AI chatbot powered by knowledge base
- **Admin Portal**: Full CRUD for FAQs, knowledge base, announcements

## Important Rules

1. The static site at port 8888 is ALWAYS the primary entry point
2. When resuming a session, ALWAYS verify http://localhost:8888/Home/index.html works
3. Admin CTA links to http://localhost:3000/admin
4. All public-facing changes should be visible at port 8888
