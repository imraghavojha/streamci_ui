# StreamCI UI 🚀

> *vibecoded at 3am with coffee and dreams*

## What is this?

So basically I took a Vercel Next.js template and went absolutely feral with it. This is StreamCI - a CI/CD monitoring dashboard that looks way cooler than it has any right to be.

## The Vibe

Started with: ✨ Vercel's fancy template  
Ended with: 🎨 A whole CI/CD monitoring dashboard

## What Actually Works

✅ **The Pretty Stuff:**
- Landing page with animations that go *brrrr*
- Demo page with fake workflows that look super real
- Dashboard with charts and graphs
- Dark mode only (because we're professionals)
- Clerk authentication (login actually works!)
- Repository selection page

✅ **The Smart Stuff:**
- Real-time dashboard polling (it refreshes, I promise)
- Build history display
- Success rate trends
- Live build status component
- Analytics dashboard with actual charts
- Alert system UI

✅ **The Backend (Spring Boot):**
- Pattern analysis APIs
- Queue monitoring service
- Alert service
- GitHub webhook setup (infrastructure)
- PostgreSQL database schemas

## What's... "In Progress"

🚧 **The Real MVP Stuff:**
- Actual GitHub webhook integration (templates are there tho)
- Real-time WebSocket connections (currently vibing with polling)
- Full backend-frontend data flow (mock data doing its best)
- Database actually being populated (you'll need to configure that)
- The ML/prediction features (they exist in code, just need data)

## Tech Stack

**Frontend:**
- Next.js 14 (App Router because we're modern)
- TypeScript (for that false sense of security)
- Tailwind + shadcn/ui (making it pretty)
- Recharts (for the graph vibes)
- Clerk (authentication that actually works)

**Backend:**
- Spring Boot (Java in 2025, fight me)
- PostgreSQL (with Supabase)
- WebSocket support (theoretically)
- Pattern analysis algorithms (they're there!)

## Setup (if you're brave)

```bash
# frontend
npm install --legacy-peer-deps
npm run dev

# backend (Spring Boot)
./mvnw spring-boot:run
```

Don't forget to:
1. Copy `.env.example` to `.env.local`
2. Add your Clerk keys
3. Configure the database (check those .template files)
4. Set up GitHub tokens if you want the real deal

## Deployment

Frontend: Vercel (one click, it's already there)  
Backend: Render.com or Railway (templates included)

## The Honest Truth

Is this production-ready? Lol no.  
Does it look production-ready? Absolutely.  
Can you impress recruiters with it? You bet.

## License

MIT - do whatever, I'm just vibing here

---

*Built with ☕ and a concerning amount of AI assistance*
