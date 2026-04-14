# HNG Stage 0 - Name Classifier API

HNG Stage 0 API: classify names using Genderize with validated, processed JSON output.

Live endpoint format: `GET /api/classify?name={name}`

Repository: `https://github.com/Habimana06/hng-stage0-name-classifier-api`

## Tech Stack

- Node.js
- Express.js
- Native `fetch` (Node 18+)

### Success Response (200)

```json
{
  "status": "success",
  "data": {
    "name": "john",
    "gender": "male",
    "probability": 0.99,
    "sample_size": 1234,
    "is_confident": true,
    "processed_at": "2026-04-01T12:00:00Z"
  }
}
```

### Error Responses

- `400 Bad Request`:

```json
{ "status": "error", "message": "Missing or empty name parameter" }
```

- `422 Unprocessable Entity`:

```json
{ "status": "error", "message": "name is not a string" }
```

- `200 OK` (Genderize edge case):

```json
{ "status": "error", "message": "No prediction available for the provided name" }
```

- `500 Internal Server Error`:

```json
{ "status": "error", "message": "Internal server error" }
```

- `502 Bad Gateway`:

```json
{ "status": "error", "message": "Upstream service failure" }
```

## Features Implemented

- Integrates with `https://api.genderize.io/?name={name}`
- Extracts `gender`, `probability`, and `count`
- Renames `count` to `sample_size`
- Computes `is_confident`:
  - `true` only when `probability >= 0.7` and `sample_size >= 100`
  - otherwise `false`
- Generates `processed_at` in UTC ISO 8601 (`new Date().toISOString()`)
- Handles edge case where `gender` is `null` or `sample_size` is `0`
- Sets CORS header `Access-Control-Allow-Origin: *`
- Uses `PORT` from environment, default `3000`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Run server:

```bash
npm start
```

3. Test endpoint:

```bash
curl "http://localhost:3000/api/classify?name=john"
```

## Deployment

This app can be deployed to Railway, Heroku, Vercel, AWS, or similar platforms.  
Render is not used, per task instruction.

### Railway

1. Push code to GitHub.
2. Create a new Railway project from the GitHub repo.
3. Railway auto-detects Node.js and runs `npm start`.
4. Set environment variable if needed:
   - `PORT` (Railway usually provides this automatically)
5. Deploy and copy your public base URL.

### Heroku

1. Push code to GitHub (or Heroku Git).
2. Create a Heroku app.
3. Set buildpack to Node.js (usually automatic).
4. Deploy from GitHub branch.
5. Confirm app is running and get app URL.

### Vercel (Serverless)

Use Vercel Node runtime support for Express-compatible handlers or deploy as a Node app via Vercel project settings.

## Quick API Checks

PowerShell:

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/classify?name=john" -Method GET | Select-Object -Expand Content
```

Bash:

```bash
curl "http://localhost:3000/api/classify?name=john"
```

## Submission Checklist

- API is live and reachable publicly
- Endpoint returns expected format
- CORS header is set to `*`
- GitHub repo includes this README
- Submit:
  - Base URL
  - GitHub repo URL: `https://github.com/Habimana06/hng-stage0-name-classifier-api`
