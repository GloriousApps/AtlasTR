# AtlasTR

Vercel-ready Next.js MVP for live Last War server searches.

## Features

- Player search by server and name
- Full map scan route using the Last War Tools API
- Server-side API key proxy (the key is never exposed to the browser)
- Mobile-friendly results with coordinate copy

## Local setup

```bash
npm install
copy .env.example .env.local
```

Set `LASTWAR_API_KEY` in `.env.local`, then run:

```bash
npm run dev
```

## Vercel deployment

Import `https://github.com/GloriousApps/AtlasTR` into Vercel and add this Environment Variable for Production, Preview, and Development:

```text
LASTWAR_API_KEY=your_lastwar_tools_api_key
```

The app uses `/api/player` and `/api/scan` as server-side proxies to `https://api.lastwar.tools`.

The live API may require an API subscription/key and may enforce its own queue and rate limits. The application does not request or store game passwords.
