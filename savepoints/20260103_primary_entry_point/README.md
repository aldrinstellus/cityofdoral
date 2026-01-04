# City of Doral - PRIMARY ENTRY POINT SAVEPOINT

**Created:** January 3, 2026
**Priority:** CRITICAL - This is the most important savepoint

## Primary URL

```
http://localhost:8888/Home/index.html
```

This is THE definitive starting point for the City of Doral website with AI chatbot.

---

## Quick Start

### Option 1: Single Command (Recommended)
```bash
cd /Users/aldrin-mac-mini/cityofdoral
./start.sh
```

### Option 2: npm Script
```bash
cd /Users/aldrin-mac-mini/cityofdoral
npm run start-all
```

### Option 3: Manual Start
```bash
# Terminal 1: Start Next.js backend (for chatbot API)
cd /Users/aldrin-mac-mini/cityofdoral
npm run dev

# Terminal 2: Start static site server
cd /Users/aldrin-mac-mini/cityofdoral
npm run serve-site

# Then open browser to:
open http://localhost:8888/Home/index.html
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    USER'S BROWSER                           │
│                                                             │
│  http://localhost:8888/Home/index.html                      │
│  (Scraped City of Doral website with embedded chatbot)      │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┴───────────────┐
          │                               │
          ▼                               ▼
┌─────────────────────┐       ┌─────────────────────┐
│   STATIC SERVER     │       │   NEXT.JS BACKEND   │
│   Port 8888         │       │   Port 3000         │
│                     │       │                     │
│ Serves:             │       │ Provides:           │
│ - HTML pages        │       │ - /api/chat         │
│ - CSS/JS assets     │       │ - /api/knowledge    │
│ - Images            │       │ - chat-widget.js    │
│ - Documents         │       │ - chat-widget.css   │
│                     │       │ - Admin panel       │
└─────────────────────┘       └─────────────────────┘
          │                               │
          └───────────────┬───────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │   KNOWLEDGE BASE      │
              │   /data/              │
              │                       │
              │ - knowledge-base.json │
              │ - conversations.json  │
              │ - 580+ indexed pages  │
              └───────────────────────┘
```

---

## Services & Ports

| Service | Port | URL | Purpose |
|---------|------|-----|---------|
| Static Site | 8888 | http://localhost:8888 | Scraped website with chatbot |
| Next.js API | 3000 | http://localhost:3000 | Chat API & widget assets |
| Admin Panel | 3000 | http://localhost:3000/admin | Content management |

---

## Key Files

### Startup
- `/Users/aldrin-mac-mini/cityofdoral/start.sh` - Main startup script

### Static Site
- `/Users/aldrin-mac-mini/cityofdoral/Website Scrapped/Home/index.html` - Homepage with chatbot
- `/Users/aldrin-mac-mini/cityofdoral/Website Scrapped/index.html` - Root redirect

### Chatbot Widget
- Embedded in `Home/index.html` via:
  ```html
  <link rel="stylesheet" href="http://localhost:3000/chat-widget.css">
  <script src="http://localhost:3000/chat-widget.js"></script>
  ```

### Knowledge Base
- `/Users/aldrin-mac-mini/cityofdoral/data/knowledge-base.json` - 580+ pages indexed
- `/Users/aldrin-mac-mini/cityofdoral/data/knowledge-base-es.json` - Spanish version

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Kill process on port 8888
lsof -ti:8888 | xargs kill -9
```

### Chatbot Not Loading
1. Ensure Next.js is running on port 3000
2. Check browser console for CORS errors
3. Verify `/public/chat-widget.js` exists

### Check Logs
```bash
# Next.js logs
cat /tmp/nextjs-cityofdoral.log

# Static server logs
cat /tmp/static-cityofdoral.log
```

---

## Files in This Savepoint

- `README.md` - This documentation
- `start.sh` - Startup script copy
- `index.html` - Root redirect copy
- `Home-index.html` - Homepage with chatbot copy
- `package.json` - Package configuration copy

---

## Important Notes

1. **Always start with `./start.sh`** - This ensures both servers run correctly
2. **Primary URL is port 8888** - The static site, NOT port 3000
3. **Chatbot requires both servers** - Static site + Next.js API
4. **Admin panel is on port 3000** - http://localhost:3000/admin

---

## Recovery

If something goes wrong, restore from this savepoint:

```bash
# Copy files back from savepoint
cp savepoints/20260103_primary_entry_point/start.sh ./start.sh
cp savepoints/20260103_primary_entry_point/index.html "Website Scrapped/index.html"
cp savepoints/20260103_primary_entry_point/Home-index.html "Website Scrapped/Home/index.html"
chmod +x start.sh
```

---

**This savepoint represents the stable, working configuration of the City of Doral AI Chatbot website.**
