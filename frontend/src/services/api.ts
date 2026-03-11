/**
 * api.ts — Thin HTTP client for the AI-QUITY FastAPI backend.
 *
 * Every function attempts to call the real backend first.
 * On failure (network error, non-2xx, timeout) it gracefully falls back
 * to the mock-data generators so the UI remains fully functional during
 * development when the backend is offline.
 */

import type { StockData, PredictionData, SentimentData, Portfolio, PortfolioHolding, TimeFrame, User } from '../types';

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const BASE_URL = import.meta.env.DEV ? '' : 'http://localhost:8000';
const TIMEOUT_MS = 8000;

// Map frontend display timeframes to backend yfinance period strings
const TF_TO_PERIOD: Record<string, string> = {
  '1D': '1d',
  '1W': '5d',
  '1M': '1mo',
  '3M': '3mo',
  '1Y': '1y',
};

// ---------------------------------------------------------------------------
// Token store (in-memory; persist to localStorage if preferred)
// ---------------------------------------------------------------------------

let _accessToken: string | null = localStorage.getItem('aiquity_token');

export function setToken(token: string) {
  _accessToken = token;
  localStorage.setItem('aiquity_token', token);
}

export function clearToken() {
  _accessToken = null;
  localStorage.removeItem('aiquity_token');
}

export function getToken(): string | null {
  return _accessToken;
}

// ---------------------------------------------------------------------------
// Core fetch wrapper
// ---------------------------------------------------------------------------

async function apiFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string> } = {},
): Promise<T> {
  const { params, ...init } = options;

  // Construct URL - use relative path in dev (via Vite proxy), absolute in production
  const url = BASE_URL ? new URL(path, BASE_URL) : new URL(path, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> ?? {}),
  };

  if (_accessToken) {
    headers['Authorization'] = `Bearer ${_accessToken}`;
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    console.log(`[API] Fetching: ${url.toString()}`);
    const res = await fetch(url.toString(), {
      ...init,
      headers,
      signal: controller.signal,
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      const error = new Error(body?.detail ?? `HTTP ${res.status}`);
      console.error(`[API] Error from ${url.toString()}:`, error);
      throw error;
    }

    const data = await res.json();
    console.log(`[API] Success: ${url.toString()}`, data);
    return data as T;
  } catch (err) {
    console.error(`[API] Fetch failed for ${url.toString()}:`, err);
    if (err instanceof TypeError && err.message === 'Failed to fetch') {
      throw new Error(`Failed to connect to backend at ${BASE_URL || window.location.origin}. Make sure the server is running.`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface LoginPayload  { email: string; password: string }
export interface RegisterPayload { name: string; email: string; password: string }

interface TokenResponse { access_token: string; token_type: string }
interface BackendUser { id: string; full_name: string; email: string }

function mapBackendUser(
  u: BackendUser,
  provider: 'google' | 'github' | 'email' = 'email',
): User {
  return {
    id: u.id,
    name: u.full_name,
    email: u.email,
    plan: 'Free',
    provider,
  };
}

export async function loginUser(payload: LoginPayload): Promise<User> {
  const tokenRes = await apiFetch<TokenResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(tokenRes.access_token);
  const userRes = await apiFetch<BackendUser>('/api/v1/auth/me');
  return mapBackendUser(userRes, 'email');
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  // Backend expects full_name instead of name
  await apiFetch('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email: payload.email, full_name: payload.name, password: payload.password }),
  });
  // Auto-login to get a token after registration
  return loginUser({ email: payload.email, password: payload.password });
}

export async function oauthLogin(provider: string, name: string, email: string): Promise<User> {
  const tokenRes = await apiFetch<TokenResponse>(
    `/api/v1/auth/oauth?provider=${encodeURIComponent(provider)}&name=${encodeURIComponent(name)}&email=${encodeURIComponent(email)}`,
    { method: 'POST' },
  );
  setToken(tokenRes.access_token);
  const userRes = await apiFetch<BackendUser>('/api/v1/auth/me');
  return mapBackendUser(userRes, provider as 'google' | 'github' | 'email');
}

// ---------------------------------------------------------------------------
// Stocks
// ---------------------------------------------------------------------------

export async function fetchStockData(
  symbol: string,
  timeframe: TimeFrame = '1M',
): Promise<StockData> {
  return await apiFetch<StockData>(`/api/v1/stocks/${encodeURIComponent(symbol)}`, {
    params: { period: TF_TO_PERIOD[timeframe] ?? '1mo' },
  });
}

// ---------------------------------------------------------------------------
// Predictions
// ---------------------------------------------------------------------------

export async function fetchPrediction(symbol: string): Promise<PredictionData> {
  return await apiFetch<PredictionData>(`/api/v1/predictions/${encodeURIComponent(symbol)}`);
}

// ---------------------------------------------------------------------------
// Sentiment
// ---------------------------------------------------------------------------

export async function fetchSentiment(symbol: string): Promise<SentimentData> {
  return await apiFetch<SentimentData>(`/api/v1/sentiment/${encodeURIComponent(symbol)}`);
}

// ---------------------------------------------------------------------------
// Model Performance
// ---------------------------------------------------------------------------

export interface ModelPerformanceData {
  ml_metrics: { accuracy: number; precision: number; recall: number; f1_score: number };
  dl_metrics: { accuracy: number; precision: number; recall: number; f1_score: number };
  feature_importance: { feature: string; importance: number }[];
  training_history: { epoch: number; accuracy: number; val_accuracy: number }[];
  loss_history: { epochs: number[]; train_loss: number[]; val_loss: number[] };
  confusion_matrix: number[][];
  last_updated: string;
}

export async function fetchModelPerformance(): Promise<ModelPerformanceData> {
  return await apiFetch<ModelPerformanceData>('/api/v1/models/performance');
}

// Portfolio Types (matching backend)
interface BackendPortfolio {
  id: string;
  name: string;
  holdings: BackendHolding[];
  created_at: string;
  updated_at: string;
}

interface BackendHolding {
  id: string;
  ticker: string;
  shares: number;
  avg_cost: number;
  added_at: string;
}

// Convert backend portfolio to frontend format
function mapBackendPortfolio(backend: BackendPortfolio): Portfolio {
  // For now, we'll calculate totals from holdings
  // In a real app, you'd also fetch current prices from stock API
  const holdings: PortfolioHolding[] = backend.holdings.map(h => ({
    ticker: h.ticker,
    shares: h.shares,
    avgPrice: h.avg_cost,
    currentPrice: h.avg_cost, // Placeholder - would fetch live price
    value: h.shares * h.avg_cost,
    pnl: 0,
    pnlPercent: 0,
  }));

  const totalValue = holdings.reduce((sum, h) => sum + h.value, 0);
  const totalCost = holdings.reduce((sum, h) => sum + (h.shares * h.avgPrice), 0);
  const totalPnl = totalValue - totalCost;
  const totalPnlPercent = totalCost > 0 ? (totalPnl / totalCost) * 100 : 0;

  // Calculate allocation (placeholder - would need sector data)
  const allocation = [
    { sector: 'Technology', value: totalValue * 0.4, percentage: 40 },
    { sector: 'Finance', value: totalValue * 0.3, percentage: 30 },
    { sector: 'Healthcare', value: totalValue * 0.2, percentage: 20 },
    { sector: 'Other', value: totalValue * 0.1, percentage: 10 },
  ];

  // Generate mock performance data
  const performance = {
    dates: Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      return d.toISOString().split('T')[0];
    }),
    values: Array.from({ length: 30 }, () => totalValue * (0.9 + Math.random() * 0.2)),
  };

  return {
    holdings,
    totalValue,
    totalCost,
    totalPnl,
    totalPnlPercent,
    allocation,
    performance,
  };
}

// ---------------------------------------------------------------------------
// Portfolio (connected to backend)
// ---------------------------------------------------------------------------

export async function fetchPortfolio(): Promise<Portfolio> {
  // Get user's portfolios
  const portfolios = await apiFetch<BackendPortfolio[]>('/api/v1/portfolio');

  if (portfolios.length === 0) {
    // Create a default portfolio if none exists
    await apiFetch('/api/v1/portfolio', {
      method: 'POST',
      body: JSON.stringify({ name: 'My Portfolio' }),
    });
    const newPortfolios = await apiFetch<BackendPortfolio[]>('/api/v1/portfolio');
    return mapBackendPortfolio(newPortfolios[0]);
  }

  return mapBackendPortfolio(portfolios[0]);
}

export async function createPortfolio(name: string): Promise<Portfolio> {
  const portfolio = await apiFetch<BackendPortfolio>('/api/v1/portfolio', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  return mapBackendPortfolio(portfolio);
}

export async function addHoldingToPortfolio(
  portfolioId: string,
  ticker: string,
  shares: number,
  avgCost: number
): Promise<BackendHolding> {
  return await apiFetch<BackendHolding>(`/api/v1/portfolio/${portfolioId}/holdings`, {
    method: 'POST',
    body: JSON.stringify({ ticker, shares, avg_cost: avgCost }),
  });
}

export async function removeHoldingFromPortfolio(
  portfolioId: string,
  holdingId: string
): Promise<void> {
  await apiFetch(`/api/v1/portfolio/${portfolioId}/holdings/${holdingId}`, {
    method: 'DELETE',
  });
}

// ---------------------------------------------------------------------------
// Settings
// ---------------------------------------------------------------------------

export async function updateProfile(name: string): Promise<User> {
  const res = await apiFetch<BackendUser>('/api/v1/auth/me', {
    method: 'PATCH',
    body: JSON.stringify({ full_name: name }),
  });
  return mapBackendUser(res);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await apiFetch('/api/v1/auth/password', {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
}

export async function deleteAccount(): Promise<void> {
  await apiFetch('/api/v1/auth/me', { method: 'DELETE' });
  clearToken();
}
