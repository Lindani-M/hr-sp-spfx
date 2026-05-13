# API Reference - TalentGPT

The backend is a FastAPI app in [app.py](app.py).

Run locally:

```bash
uvicorn app:app --reload --port 8000
```

## Authentication

Current embed mode does not require frontend login or bearer tokens for `/chat` and `/search`.

## Rate Limits

Rate limiting is per IP address.

| Endpoint | Limit |
| --- | --- |
| `POST /chat` | 20 requests/minute |
| `POST /search` | 30 requests/minute |
| `GET /health` | Unlimited |

## Input Limits

| Field | Constraint |
| --- | --- |
| `question` / `query` | 1-2000 characters |
| `top_k` | 1-10 |
| `max_tokens` | 100-4000 |

## CORS

Set `ALLOWED_ORIGINS` as a comma-separated list of frontend origins.

Example:

```dotenv
ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend-domain
```

## API Docs

Swagger/Redoc are only enabled when `DEBUG=true`.

## Endpoints

### GET /health

```bash
curl http://localhost:8000/health
```

### POST /chat

Request:

```bash
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -d '{"question":"Why should we use RMSE over MAE?","top_k":5,"max_tokens":1500}'
```

Response shape:

```json
{
  "question": "...",
  "answer": "...",
  "response_type": "rag",
  "sources": [
    {
      "title": "...",
      "url": "...",
      "chunk_index": 0,
      "source_type": "file",
      "relevance_score": 95.2
    }
  ]
}
```

### POST /search

Request:

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Coresignal API candidate data","top_k":3}'
```

Response shape:

```json
{
  "query": "...",
  "results": [
    {
      "title": "...",
      "url": "...",
      "chunk_index": 0,
      "text": "...",
      "relevance_score": 92.1
    }
  ]
}
```

## Required Backend Env Vars

```dotenv
AZURE_OAI_ENDPOINT=https://<resource>.cognitiveservices.azure.com
AZURE_OAI_KEY=<key>
EMBED_DEPLOYMENT=text-embedding-ada-002

SEARCH_ENDPOINT=https://<resource>.search.windows.net
SEARCH_KEY=<key>
SEARCH_INDEX=sharepoint-pages
SEARCH_API_VERSION=2024-05-01-preview

CLAUDE_ENDPOINT=https://<project>.services.ai.azure.com/anthropic/
CLAUDE_API_KEY=<key>
CLAUDE_DEPLOYMENT_NAME=claude-sonnet-4-6

ALLOWED_ORIGINS=http://localhost:5173,https://<your-frontend-domain>
DEBUG=false
```
