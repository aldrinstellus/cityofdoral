# City of Doral Project

## Start Project

When user says "start project", run:
```bash
./start.sh
```

This starts both servers and opens the browser to the primary URL:
- **Primary URL**: http://localhost:8888/Home/index.html
- **Admin Panel**: http://localhost:3000/admin

## Architecture

- **Static Site (port 8888)**: Main website from `Website Scrapped/` directory
- **Next.js (port 3000)**: Admin dashboard and chat API backend

## Important

- The static site at port 8888 is the primary entry point
- Admin CTA links to http://localhost:3000/admin
- All routing is based on the static site structure
