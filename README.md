# StreamCI UI 🚀

> *vibecoded at 3am with coffee and dreams*

# StreamCI UI

Real-time CI/CD pipeline monitoring dashboard built with Next.js.

## Overview

This is the frontend interface for StreamCI, a CI/CD monitoring platform. The project is built on a modified Vercel Next.js template with custom components and features added for CI/CD workflow visualization and monitoring.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui component library
- **Charts**: Recharts for data visualization
- **Authentication**: Clerk
- **HTTP Client**: Axios for API communication

## Features

### Implemented

- **Landing Page**: Marketing page with feature overview and call-to-action
- **Interactive Demo Page**: 
  - Simulated CI/CD workflow execution
  - Real-time log streaming visualization
  - Live metrics charts (success rate, build time, queue depth, runner status)
  - Alert system preview
  - Build history heatmap
- **Dashboard**:
  - Real-time monitoring interface with configurable polling
  - Build history display with status indicators
  - Success rate trend charts (7-day view)
  - Live build status tracking
  - Analytics dashboard with pattern insights
  - Active alerts display
  - Repository selector integration
- **Repository Management Page**: GitHub repository selection and configuration UI
- **Authentication Flow**: Complete sign-in/sign-up flow with Clerk, protected routes via middleware

### UI Components

- `analytics-dashboard.tsx` - Pattern analysis and insights display
- `build-history.tsx` - Build execution timeline
- `dashboard-chart.tsx` - Success rate trend visualization
- `live-build-status.tsx` - Real-time build status cards
- Custom dashboard polling context for data refresh management

## Project Structure

```
streamci-ui/
├── app/
│   ├── dashboard/         # Main monitoring dashboard
│   ├── demo/             # Interactive demo with simulated data
│   ├── repositories/     # Repository management
│   ├── sign-in/          # Clerk auth pages
│   ├── sign-up/
│   ├── layout.tsx        # Root layout with Clerk provider
│   └── page.tsx          # Landing page
├── components/
│   ├── ui/               # shadcn/ui base components
│   ├── analytics-dashboard.tsx
│   ├── build-history.tsx
│   ├── dashboard-chart.tsx
│   └── live-build-status.tsx
├── contexts/
│   └── dashboard-polling-context.tsx
├── lib/
│   └── api.ts           # API client configuration
└── public/              # Static assets
```

## Setup

### Prerequisites

- Node.js 18+
- npm or yarn
- Clerk account for authentication

### Installation

1. Clone the repository and install dependencies:

```bash
npm install --legacy-peer-deps
```

2. Configure environment variables:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# API endpoints
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080

# Clerk authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

3. Run the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

## Deployment

### Vercel

This project includes `vercel.json` configuration for easy deployment:

```bash
vercel --prod
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables

Set these in your deployment platform:

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_WS_URL` - WebSocket URL
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` - Clerk publishable key
- `CLERK_SECRET_KEY` - Clerk secret key

## Configuration

### API Integration

The frontend expects a backend API with the following endpoints:

- `GET /api/pipelines/user/{userId}` - Get user's pipelines
- `GET /api/builds/recent?clerkUserId={userId}` - Recent builds
- `GET /api/analysis/trends?clerkUserId={userId}` - Success rate trends
- `GET /api/analysis/summary?pipelineId={id}` - Pipeline analytics

API client is configured in `lib/api.ts`.

### Dashboard Polling

Dashboard data refresh is managed through `DashboardPollingProvider`:
- Default polling interval: 30 seconds
- Configurable refresh intervals
- Manual refresh capability

## Current Status

### Working
- All UI components and pages
- Clerk authentication and protected routes
- Dashboard polling and data refresh
- Repository selection interface
- Interactive demo with simulated data
- Responsive design and dark mode theme

### Requires Backend
- Real-time data from CI/CD pipelines
- GitHub webhook integration
- Pattern analysis data
- Live build status updates
- Alert generation




Is this production-ready? Lol no.  
Does it look production-ready? Absolutely.  
Can you impress recruiters with it? You bet.

## License

MIT - do whatever, I'm just vibing here

---

*Built with ☕ and a concerning amount of AI assistance*
