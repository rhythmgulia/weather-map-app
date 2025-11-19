# Weather Map SPA

Full-stack application featuring a React/Vite frontend and Node/Express backend with MongoDB authentication. Users can sign up/login, interact with a Mapbox map, and fetch real-time weather (temperature, humidity, conditions) from OpenWeather—kept in sync with map interactions.

## Features
- Secure auth (signup/login/logout) with hashed passwords and JWT stored in HTTP-only cookies
- React single-page app (SPA) with protected dashboard, Mapbox GL map, and weather panel
- Map and weather synchronization: searches or map clicks update weather
- Graceful error messaging for failed auth, invalid cities, API/rate-limit errors
- Backend weather proxy to centralize API key usage and handle provider failures

## Getting Started

### Prerequisites
- Node 18+
- MongoDB instance (local or hosted)
- Mapbox access token
- OpenWeather API key

### Backend setup
```bash
cd backend
cp .env.example .env   # update values
npm install
npm run dev
```

Required env keys:
- `PORT` – defaults to `5000`
- `CLIENT_URL` – comma-separated list of allowed origins (`http://localhost:5173`)
- `MONGODB_URI` – Mongo connection string
- `JWT_SECRET` – strong secret for signing tokens
- `WEATHER_API_KEY` – OpenWeather API key

### Frontend setup
```bash
cd frontend
cp .env.example .env   # set VITE_API_URL + VITE_MAPBOX_TOKEN
npm install
npm run dev
```

Vite dev server runs on `http://localhost:5173` and proxies `/api/*` to the backend via `VITE_API_URL`.

### Usage
1. Register a new user via the signup form.
2. Log in to access the dashboard.
3. Search a location or click anywhere on the map; the weather card updates automatically.
4. Logout ends the session by clearing the JWT cookie.

## Testing & Linting
- `frontend`: `npm run lint`
- `backend`: `npm run lint`

## Future enhancements
- Persist favorite locations per user
- Add hourly/weekly forecasts
- Offline caching of recent weather requests
