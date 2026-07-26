[![Netlify Status](https://api.netlify.com/api/v1/badges/265f2635-d4b4-4a42-a5a2-8d9dbd6b9458/deploy-status)](https://app.netlify.com/sites/oasa-live/deploys)

<h1 align="center">

  [Oasa.live](https://oasa.live/) repository
</h1>

Live map of Athens public buses. Shows real-time bus positions and per-stop arrival estimates using the OASA telematics API.

## Architecture

```
                 ┌──────────────────────────────┐
                 │  telematics.oasa.gr (OASA)   │
                 └──────┬───────────────┬───────┘
                        │               │
              every 3 min (cron)     on demand
                        │               │
                 ┌──────┴───────────────┴───────┐
                 │        backend server        │
                 │  - updateLocations.js (cron) │
                 │  - server.js (arrivals proxy)│
                 └──────┬───────────────┬───────┘
                        │               │
                 uploads JSON      proxied by
                        │               │
                 ┌──────┴──────┐ ┌──────┴──────────────┐
                 │  S3 bucket  │ │  Netlify function   │
                 │  "oasa"     │ │  fetchStopArrivals  │
                 └──────┬──────┘ └──────┬──────────────┘
                        │               │
                 ┌──────┴───────────────┴───────┐
                 │   oasa.live (Gatsby/Netlify) │
                 └──────────────────────────────┘
```

- **Frontend**: Gatsby site on Netlify. Bus positions are fetched by the browser directly from the public S3 file `routeLocations.json` (see `src/lib/track-manager.js`). Stop arrivals go through the Netlify function `src/lambda/netlify/fetchStopArrivals.js`, which proxies to the backend via the `GATSBY_STOP_API_URL` env var (set in the Netlify UI; **baked in at build time — changing it requires a redeploy**).
- **Backend** (a small VPS running Node 22):
  - `src/lambda/updateLocations.js` — cron, every 3 minutes. Fetches bus positions per route from OASA, computes covered distance/speed against the route geometry (turf), uploads `routeLocations.json` to S3.
  - `src/lambda/server.js` — the arrivals proxy behind the Netlify function. Proxies `?stopCode=` requests to OASA's `getStopArrivals` with an 8s fail-fast timeout.
  - `src/lambda/updateStaticData.js` — cron, nightly. Refreshes lines/routes/schedules in S3.

Operational details (server access, deploy steps, incident history) are kept in a private `OPERATIONS.md` that is deliberately **not** committed to this public repo.

## Health checks

```bash
# arrivals (expect JSON or "null", fast):
curl "https://oasa.live/.netlify/functions/fetchStopArrivals?stopCode=380066"
# bus position freshness (timestamps are epoch ms; should be < ~5 min old):
curl -s https://s3.eu-central-1.amazonaws.com/oasa/routeLocations.json | head -c 300
```

## Local development

```bash
npm install          # Gatsby site
npm run develop      # http://localhost:8000
```

The lambda/server code needs Node ≥ 14 (uses `Intl` timezone APIs); production runs Node 22.
