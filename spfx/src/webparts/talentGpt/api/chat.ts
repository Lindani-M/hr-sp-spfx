import type { ChatResponse, ApiError } from '../types/chat';

function buildUrl(apiBaseUrl: string, path: string): string {
  const base = apiBaseUrl.trim().replace(/\/$/, '');
  if (!base) return path;
  return `${base}${path}`;
}

function classifyError(status: number, detail: string): ApiError {
  if (status === 401) {
    return {
      code: 'network',
      userMessage: 'The request was rejected by the API. Please contact support if this continues.',
    };
  }
  if (status === 429) {
    return {
      code: 'rate_limit',
      userMessage: "You're sending messages too quickly. Please wait a moment and try again.",
    };
  }
  if (status === 422) {
    const isLength =
      detail.toLowerCase().includes('max_length') ||
      detail.toLowerCase().includes('too long');
    return {
      code: isLength ? 'too_long' : 'validation',
      userMessage: isLength
        ? 'Your message exceeds the maximum allowed length. Please shorten it and try again.'
        : `Your request couldn't be processed: ${detail}`,
    };
  }
  if (status === 502 || status === 503) {
    if (detail.toLowerCase().includes('embedding')) {
      return {
        code: 'service_unavailable',
        userMessage: 'The AI embedding service is temporarily unavailable. Please try again shortly.',
      };
    }
    if (
      detail.toLowerCase().includes('search') ||
      detail.toLowerCase().includes('knowledge base')
    ) {
      return {
        code: 'service_unavailable',
        userMessage:
          'The knowledge base search service is temporarily unavailable. Please try again shortly.',
      };
    }
    if (
      detail.toLowerCase().includes('ai answer') ||
      detail.toLowerCase().includes('llm') ||
      detail.toLowerCase().includes('claude')
    ) {
      return {
        code: 'service_unavailable',
        userMessage:
          'The AI answer service is temporarily unavailable. Please try again shortly.',
      };
    }
    return {
      code: 'service_unavailable',
      userMessage:
        detail || 'A backend service is temporarily unavailable. Please try again shortly.',
    };
  }
  if (status >= 500) {
    return {
      code: 'server_error',
      userMessage: 'An unexpected server error occurred. Please try again shortly.',
    };
  }
  return { code: 'unknown', userMessage: 'An unexpected error occurred. Please try again.' };
}

// NOTE: In production the FastAPI backend must include the SharePoint tenant origin in
// ALLOWED_ORIGINS, e.g.:
//   ALLOWED_ORIGINS=https://roleio.sharepoint.com,https://localhost:4321
export async function sendChat(
  question: string,
  apiBaseUrl: string,
  topK = 5,
  maxTokens = 1500
): Promise<ChatResponse> {
  let res: Response;

  try {
    res = await fetch(buildUrl(apiBaseUrl, '/chat'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, top_k: topK, max_tokens: maxTokens }),
    });
  } catch {
    const err: ApiError = {
      code: 'network',
      userMessage: 'Unable to reach the server. Please check your connection and try again.',
    };
    throw err;
  }

  let payload: unknown;
  try {
    payload = await res.json();
  } catch {
    const err: ApiError = {
      code: 'server_error',
      userMessage: 'The server returned an unreadable response. Please try again.',
    };
    throw err;
  }

  if (!res.ok) {
    throw classifyError(res.status, (payload as { detail?: string })?.detail ?? '');
  }

  return payload as ChatResponse;
}
