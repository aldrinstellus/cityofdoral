# Savepoint: Chat Widget Embedded on Scraped Homepage

**Date:** 2026-01-01
**Description:** AI Chat Widget embedded on the scraped City of Doral homepage

## Main Entry Point
- **Homepage:** `Website Scrapped/Home/index.html` (served at localhost:8888)
- **API Backend:** Next.js app at localhost:3000

## Changes Made

### New Files Created
- `public/chat-widget.css` - Standalone widget styles (matches accessibility widget)
- `public/chat-widget.js` - Self-contained vanilla JS chat widget

### Modified Files
- `Website Scrapped/Home/index.html` - Injected chat widget scripts
- `src/app/api/chat/route.ts` - Added CORS headers for cross-origin requests

## Chat Widget Features
- Floating Action Button (FAB) - bottom right, mirrors accessibility widget
- Size: 56px × 56px
- Color: #000080 (matches accessibility blue)
- Shadow: 0 4px 12px rgba(0,0,0,0.4)
- Position: bottom: 20px, right: 20px

### Widget Capabilities
- Bilingual support (EN/ES toggle)
- RAG-powered responses from 580-page knowledge base
- Source links for transparency
- Thumbs up/down feedback
- Sentiment analysis with escalation option
- WCAG 2.1 accessible
- Mobile responsive (full-screen on small devices)

## Architecture
```
localhost:8888 (Static Homepage)
    └── loads chat-widget.js & chat-widget.css from localhost:3000
           └── calls POST /api/chat on localhost:3000
                  └── queries /api/knowledge (RAG)
                  └── calls OpenAI GPT-4o-mini
```

## To Run
1. Start Next.js API: `npm run dev` (port 3000)
2. Serve scraped site: `python3 -m http.server 8888` in project root
3. Open: http://localhost:8888/Home/index.html
