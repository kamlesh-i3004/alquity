# AI-QUITY Project — Features, Improvements & Remaining Work

> Consolidated from [`backend/backend_review.md`](backend/backend_review.md) and [`frontend/frontend.md`](frontend/frontend.md)

---

## ✅ Features Currently Working

### Backend
| Feature | File |
|---------|------|
| Stock data fetching via yfinance | [`data_collector.py`](backend/app/services/data_collector.py) |
| Basic LSTM prediction model | [`lstm_model.py`](backend/app/models/lstm_model.py) |
| VADER sentiment analysis | [`sentiment_analysis.py`](backend/app/services/sentiment_analysis.py) |
| Portfolio weight calculation | [`portfolio_optimizer.py`](backend/app/services/portfolio_optimizer.py) |
| Technical indicator (SMA) | [`indicators.py`](backend/app/utils/indicators.py) |
| 3 REST API route groups (stocks, predictions, sentiment) | [`main.py`](backend/app/main.py) |

### Frontend
| Feature | File |
|---------|------|
| Dashboard with aggregated metrics | [`Dashboard.tsx`](frontend/src/components/Dashboard.tsx) |
| Candlestick chart with technical analysis (RSI, MACD, Bollinger Bands) | [`CandlestickChart.tsx`](frontend/src/components/CandlestickChart.tsx) |
| AI Prediction display panel | [`AIPrediction.tsx`](frontend/src/components/AIPrediction.tsx) |
| Sentiment analysis viewer | [`SentimentAnalysis.tsx`](frontend/src/components/SentimentAnalysis.tsx) |
| Portfolio tracker UI | [`PortfolioTracker.tsx`](frontend/src/components/PortfolioTracker.tsx) |
| Model performance viewer | [`ModelPerformance.tsx`](frontend/src/components/ModelPerformance.tsx) |
| Stock search | [`StockSearch.tsx`](frontend/src/components/StockSearch.tsx) |
| Login screen | [`Login.tsx`](frontend/src/components/Login.tsx) |
| Settings panel | [`Settings.tsx`](frontend/src/components/Settings.tsx) |
| Help page | [`Help.tsx`](frontend/src/components/Help.tsx) |
| Neural network 3D background | [`NeuralBackground.tsx`](frontend/src/components/NeuralBackground.tsx) |
| Dark theme with glass morphism + purple accents | [`index.css`](frontend/src/index.css) |
| Framer Motion + GSAP animations | [`App.tsx`](frontend/src/App.tsx) |
| Strict TypeScript configuration | [`tsconfig.app.json`](frontend/tsconfig.app.json) |
| 40+ shadcn/Radix UI components | [`frontend/src/components/ui/`](frontend/src/components/ui/) |

---

## ❌ Broken / Incomplete Features

### Backend
| Issue | File | Severity |
|-------|------|----------|
| Model trained on random dummy data — produces meaningless predictions | [`lstm_model.py`](backend/app/models/lstm_model.py) | 🔴 Critical |
| Model retrains from scratch on every API call | [`prediction_model.py`](backend/app/services/prediction_model.py) | 🔴 Critical |
| Global mutable model state — thread-unsafe | [`prediction_model.py`](backend/app/services/prediction_model.py) | 🔴 Critical |
| Database layer is a complete stub returning `None` | [`database.py`](backend/app/database.py) | 🔴 High |
| Transformer model defined but never exposed in any route | [`transformer_model.py`](backend/app/models/transformer_model.py) | 🟠 Medium |
| Portfolio optimizer only returns naive equal weights | [`portfolio_optimizer.py`](backend/app/services/portfolio_optimizer.py) | 🟡 Low |
| No error handling — raw stack traces returned to client | All route files | 🔴 High |
| No logging anywhere | All service/route files | 🔴 High |
| No input validation or Pydantic schemas | All route files | 🔴 High |
| No authentication / authorization | [`main.py`](backend/app/main.py) | 🔴 Critical |
| CORS not configured | [`main.py`](backend/app/main.py) | 🔴 High |
| No rate limiting | [`main.py`](backend/app/main.py) | 🔴 High |
| Config has no environment variable support | [`config.py`](backend/app/config.py) | 🟠 Medium |
| No caching for stock data, predictions, or sentiment | [`data_collector.py`](backend/app/services/data_collector.py) | 🟠 Medium |
| yfinance fetches only 1 month; LSTM needs 60+ days min | [`data_collector.py`](backend/app/services/data_collector.py) | 🟠 Medium |
| All yfinance calls are synchronous/blocking | [`data_collector.py`](backend/app/services/data_collector.py) | 🟠 Medium |
| No health check endpoint | [`main.py`](backend/app/main.py) | 🟡 Low |
| Dependency versions unpinned in requirements.txt | [`requirements.txt`](backend/requirements.txt) | 🟠 Medium |

### Frontend
| Issue | File | Severity |
|-------|------|----------|
| All data is mock — no real backend API calls wired up | [`App.tsx`](frontend/src/App.tsx) / [`mockData.ts`](frontend/src/utils/mockData.ts) | 🔴 Critical |
| "Download Report" button exists but is not implemented | [`Dashboard.tsx`](frontend/src/components/Dashboard.tsx) | 🟠 Medium |
| `layoutConfig: any` type in Plotly chart — no type safety | [`CandlestickChart.tsx`](frontend/src/components/CandlestickChart.tsx) | 🟠 Medium |
| Mock authentication — no real JWT/session handling | [`Login.tsx`](frontend/src/components/Login.tsx) | 🔴 Critical |
| State lost on page refresh (no persistence) | [`App.tsx`](frontend/src/App.tsx) | 🟠 Medium |
| Hardcoded 1500 ms fake loading delay | [`App.tsx`](frontend/src/App.tsx) | 🟡 Low |
| Portfolio add/edit does not validate ticker existence | [`PortfolioTracker.tsx`](frontend/src/components/PortfolioTracker.tsx) | 🟠 Medium |
| No error boundary or error states for async failures | Global | 🔴 High |
| No loading state reset if a data fetch fails | [`App.tsx`](frontend/src/App.tsx) | 🟠 Medium |
| No ARIA labels on icon-only buttons | Multiple components | 🟠 Medium |
| Color-only bull/bear/neutral differentiation (a11y) | Multiple components | 🟠 Medium |
| No keyboard navigation / focus trapping in dialogs | Multiple components | 🟠 Medium |
| No WebSocket support for real-time price updates | Global | 🟠 Medium |
| No code splitting / lazy loading | [`App.tsx`](frontend/src/App.tsx) | 🟠 Medium |
| All 40+ UI components bundled (no tree-shaking strategy) | [`App.tsx`](frontend/src/App.tsx) | 🟡 Low |
| NeuralBackground constant animation may degrade low-end devices | [`NeuralBackground.tsx`](frontend/src/components/NeuralBackground.tsx) | 🟡 Low |
| No unit tests or E2E tests | Entire repo | 🔴 High |

---

## 🛠️ Improvements Needed (Prioritized)

### 🔴 Phase 1 — Critical Fixes (Do First)

#### Backend
1. **Replace global model state** with FastAPI lifespan + `app.state` dependency injection (`prediction_model.py`)
2. **Train real LSTM** on 1–5 years of historical data; save/load `.h5` or `.onnx` checkpoint (`lstm_model.py`)
3. **Add Pydantic schemas** for all request/response bodies (`models/schemas.py`)
4. **Add comprehensive error handling** with `HTTPException` and structured error responses across all routes
5. **Add structured logging** using Python `logging` module in all services and routes
6. **Implement JWT authentication** and CORS middleware in `main.py`
7. **Implement real database layer** (SQLAlchemy + PostgreSQL/SQLite, managed with Alembic migrations)

#### Frontend
8. **Wire up real API calls** — replace all `mockData.ts` usage with Axios/Fetch calls to the backend
9. **Implement real authentication flow** — JWT storage, refresh tokens, protected routes
10. **Add global Error Boundary** component and per-feature error states with retry logic

---

### 🟠 Phase 2 — Stability & Data Quality (Short-Term)

#### Backend
11. **Add caching layer** — `lru_cache` or Redis for stock prices (5-minute TTL), predictions, sentiment
12. **Make yfinance calls async** using `asyncio.run_in_executor` or `httpx`
13. **Implement proper preprocessing pipeline** — 60-day lookback, MinMax scaling, NaN handling
14. **Expose Transformer model** via its own prediction route
15. **Add health check endpoint** (`GET /health`)
16. **Pin all dependency versions** in `requirements.txt`
17. **Externalize config** to `.env` via `python-dotenv` or Pydantic `BaseSettings`
18. **Add rate limiting** (e.g., `slowapi`)
19. **Add API versioning** (`/api/v1/...`)

#### Frontend
20. **Add React.lazy + Suspense** code splitting for heavy components (`ModelPerformance`, `CandlestickChart`)
21. **Persist user preferences** to localStorage (theme, selected ticker, etc.)
22. **Implement State Management upgrade** — Zustand or Context API to eliminate prop drilling in `App.tsx`
23. **Fix `layoutConfig: any`** in `CandlestickChart.tsx` with a proper Plotly type extension
24. **Add loading skeleton** components with Suspense boundaries
25. **Validate ticker symbols** before adding to portfolio
26. **Implement Download Report** functionality (PDF/CSV export)

---

### 🟡 Phase 3 — Production Readiness (Medium-Term)

#### Backend
27. **Proper train/test split** (80/20) and evaluation metrics (MSE, RMSE, MAE, directional accuracy)
28. **Implement Ensemble predictions** (LSTM + Transformer combined)
29. **Add request tracing** with correlation IDs and Prometheus metrics
30. **Celery background task queue** for model training jobs and long-running predictions
31. **Unit + integration tests** targeting ≥80% coverage (pytest)
32. **Docker containerization** and docker-compose for local dev
33. **Kubernetes manifests** for production deployment

#### Frontend
34. **Accessibility audit** — add ARIA labels, `role` attributes, keyboard navigation, focus trapping in modals
35. **`prefers-reduced-motion`** CSS media query to disable animations for accessibility
36. **Unit tests** — Jest + React Testing Library for all feature components
37. **E2E tests** — Playwright or Cypress
38. **Optimize NeuralBackground** — replace live Three.js canvas with static SVG or reduce node count
39. **WebSocket integration** for real-time price streaming
40. **Add undo/redo** for portfolio actions

---

### 🔵 Phase 4 — Advanced Features (Long-Term)

41. **SHAP / explainability** layer to surface which features drove each prediction
42. **Backtesting framework** — simulate trades on historical data with return/risk metrics
43. **Multi-ticker batch predictions** endpoint
44. **Model quantization + ONNX export** for faster, cross-platform inference
45. **Favorites / Watchlist** feature in frontend
46. **Storybook** component documentation
47. **Pre-commit hooks** (husky + lint-staged) and PR templates
48. **CDN** for static model files and assets

---

## 📋 Quick Reference Summary Table

| Area | Status | Top Priority Action |
|------|--------|---------------------|
| Backend ML Models | 🔴 Broken (dummy data) | Train real LSTM & save checkpoint |
| Backend API Security | 🔴 None | Add JWT auth + CORS |
| Backend Error Handling | 🔴 None | Add try/except + HTTPException |
| Backend Database | 🔴 Stub | Implement SQLAlchemy ORM |
| Backend Logging | 🔴 None | Add Python logging |
| Backend Caching | 🟠 Missing | Add lru_cache / Redis |
| Backend Async | 🟠 Blocking | Use asyncio.run_in_executor |
| Frontend API Integration | 🔴 Mock only | Wire real API calls |
| Frontend Auth | 🔴 Mock only | Implement real JWT flow |
| Frontend Error Handling | 🔴 None | Add Error Boundary |
| Frontend State Mgmt | 🟠 Prop drilling | Migrate to Zustand |
| Frontend Performance | 🟠 No code splitting | Add React.lazy |
| Frontend Accessibility | 🟠 Gaps | Add ARIA, keyboard nav |
| Frontend Type Safety | 🟠 One `any` type | Fix Plotly layout type |
| Tests (Both) | 🔴 None | Add unit + E2E tests |
| Documentation | 🟡 Minimal | Docstrings + Storybook |
