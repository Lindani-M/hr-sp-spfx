# TalentGPT

TalentGPT is a SharePoint-embeddable chatbot built with:

- FastAPI backend for RAG (`/chat`, `/search`, `/health`)
- React + Vite frontend that can be embedded using SharePoint's Embed web part
- SharePoint ingestion pipeline to populate Azure AI Search

## Architecture (Embed Web Part Model)

1. Host the frontend as a normal web app (Azure Static Web Apps or App Service)
2. Host the backend API separately (Azure App Service recommended)
3. On SharePoint, use Edit -> Add Web Part -> Embed and paste the frontend URL
4. The embedded frontend calls the backend over HTTPS

## Project Structure

- `app.py`: FastAPI RAG API
- `backend/ingest.py`: SharePoint scrape/chunk/embed/index upload pipeline
- `frontend/`: embeddable React app
- `docs/api.md`: endpoint details
- `docs/pipeline.md`: ingestion pipeline details

## Environment Variables

Use `.env.example` as a reference for backend and ingestion settings.

Frontend variables:

- `VITE_API_BASE_URL` (required in production): backend API origin, e.g. `https://talentgpt-api.azurewebsites.net`
- `VITE_BEARER_TOKEN` (optional): only if you add custom bearer auth later

## Local Development

### 1) Backend

```bash
pip install -r requirements.txt
uvicorn app:app --reload --port 8000
```

Health check:

```bash
curl http://localhost:8000/health
```

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

This runs the frontend on `http://localhost:5173` and proxies `/chat`, `/search`, `/health` to `http://localhost:8000`.

### 3) Local E2E test

1. Start backend on port 8000
2. Start frontend on port 5173
3. Open `http://localhost:5173`
4. Ask a question and confirm response + source cards render

## Azure Deployment Order

1. Deploy backend API first (App Service)
2. Add backend app settings from `.env.example`
3. Set `ALLOWED_ORIGINS` to your frontend domain (and local dev if needed)
4. Deploy frontend (Static Web Apps or App Service static hosting)
5. Set frontend env `VITE_API_BASE_URL` to backend origin
6. Build/redeploy frontend
7. Embed frontend URL in SharePoint page

## SharePoint Embed Steps

1. Open SharePoint page in edit mode
2. Add web part: `Embed`
3. Paste deployed frontend URL
4. Publish page

If your tenant blocks iframe embedding for the target domain, ask your SharePoint admin to allow that external domain.
