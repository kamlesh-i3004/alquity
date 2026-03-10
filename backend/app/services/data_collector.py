
import math
import numpy as np
import yfinance as yf
from functools import lru_cache
from datetime import datetime, timedelta
from app.config import settings

# ---------------------------------------------------------------------------
# Technical indicator helpers
# ---------------------------------------------------------------------------

def _ema(prices: list[float], period: int) -> list[float]:
    result = []
    k = 2 / (period + 1)
    for i, p in enumerate(prices):
        if i == 0:
            result.append(p)
        else:
            result.append(p * k + result[-1] * (1 - k))
    return result

def _rsi(prices: list[float], period: int = 14) -> list[float]:
    rsi = []
    for i in range(len(prices)):
        if i < period:
            rsi.append(50.0)
            continue
        gains = losses = 0.0
        for j in range(i - period + 1, i + 1):
            chg = prices[j] - prices[j - 1]
            if chg > 0:
                gains += chg
            else:
                losses -= chg
        avg_gain = gains / period
        avg_loss = losses / period
        if avg_loss == 0:
            rsi.append(100.0)
        else:
            rs = avg_gain / avg_loss
            rsi.append(100 - 100 / (1 + rs))
    return rsi

def _macd(prices: list[float]):
    ema12 = _ema(prices, 12)
    ema26 = _ema(prices, 26)
    macd_line = [a - b for a, b in zip(ema12, ema26)]
    signal = _ema(macd_line, 9)
    histogram = [a - b for a, b in zip(macd_line, signal)]
    return {"macd": macd_line, "signal": signal, "histogram": histogram}

def _bollinger(prices: list[float], period: int = 20, std_dev: int = 2):
    upper, middle, lower = [], [], []
    for i in range(len(prices)):
        if i < period - 1:
            upper.append(prices[i])
            middle.append(prices[i])
            lower.append(prices[i])
        else:
            sl = prices[i - period + 1 : i + 1]
            sma = sum(sl) / period
            variance = sum((x - sma) ** 2 for x in sl) / period
            std = math.sqrt(variance)
            middle.append(sma)
            upper.append(sma + std_dev * std)
            lower.append(sma - std_dev * std)
    return {"upper": upper, "middle": middle, "lower": lower}

def _sma(prices: list[float], period: int = 20) -> list[float]:
    result = []
    for i in range(len(prices)):
        if i < period - 1:
            result.append(prices[i])
        else:
            result.append(sum(prices[i - period + 1 : i + 1]) / period)
    return result

# ---------------------------------------------------------------------------
# Main data fetch
# ---------------------------------------------------------------------------

_PERIOD_MAP = {"1D": "5d", "1W": "1mo", "1M": "3mo", "3M": "1y", "1Y": "2y"}
_STOCK_NAMES = {
    "AAPL": "Apple Inc.", "TSLA": "Tesla, Inc.", "MSFT": "Microsoft Corporation",
    "GOOGL": "Alphabet Inc.", "AMZN": "Amazon.com Inc.", "NVDA": "NVIDIA Corporation",
    "META": "Meta Platforms, Inc.", "NFLX": "Netflix, Inc.",
    "RELIANCE.NS": "Reliance Industries", "TCS.NS": "Tata Consultancy Services",
}

def get_stock_data(symbol: str, timeframe: str = "1M") -> dict:
    """Return a StockData-shaped dict compatible with the frontend types."""
    try:
        period = _PERIOD_MAP.get(timeframe, "3mo")
        ticker = yf.Ticker(symbol)
        info = ticker.info or {}
        hist = ticker.history(period=period)

        if hist.empty:
            raise ValueError(f"No data returned for {symbol}")

        hist = hist.reset_index()
        candles = []
        for _, row in hist.iterrows():
            date_val = row["Date"]
            if hasattr(date_val, "strftime"):
                date_str = date_val.strftime("%Y-%m-%d")
            else:
                date_str = str(date_val)[:10]
            candles.append({
                "date": date_str,
                "open": round(float(row["Open"]), 2),
                "high": round(float(row["High"]), 2),
                "low": round(float(row["Low"]), 2),
                "close": round(float(row["Close"]), 2),
                "volume": int(row["Volume"]),
            })

        prices = [c["close"] for c in candles]
        current_price = prices[-1]
        prev_price = prices[-2] if len(prices) > 1 else current_price
        change = current_price - prev_price
        change_pct = (change / prev_price * 100) if prev_price else 0

        rsi = _rsi(prices)
        macd = _macd(prices)
        bb = _bollinger(prices)
        sma = _sma(prices)

        trend = "bullish" if change_pct > 1 else ("bearish" if change_pct < -1 else "neutral")

        market_cap = info.get("marketCap", 0)
        if market_cap:
            mc_str = f"${market_cap / 1e12:.2f}T" if market_cap >= 1e12 else f"${market_cap / 1e9:.1f}B"
        else:
            mc_str = "N/A"

        avg_vol = info.get("averageVolume", 0)
        avg_vol_str = f"{avg_vol / 1e6:.1f}M" if avg_vol else "N/A"

        return {
            "ticker": symbol,
            "name": info.get("longName") or _STOCK_NAMES.get(symbol, f"{symbol} Corp"),
            "price": round(current_price, 2),
            "change": round(change, 2),
            "changePercent": round(change_pct, 2),
            "volume": candles[-1]["volume"],
            "marketCap": mc_str,
            "peRatio": round(float(info.get("trailingPE", 0) or 0), 2),
            "high52w": round(float(info.get("fiftyTwoWeekHigh", max(prices))), 2),
            "low52w": round(float(info.get("fiftyTwoWeekLow", min(prices))), 2),
            "avgVolume": avg_vol_str,
            "candleData": candles,
            "rsi": [round(v, 2) for v in rsi],
            "macd": {
                "macd": [round(v, 4) for v in macd["macd"]],
                "signal": [round(v, 4) for v in macd["signal"]],
                "histogram": [round(v, 4) for v in macd["histogram"]],
            },
            "bollingerBands": {
                "upper": [round(v, 2) for v in bb["upper"]],
                "middle": [round(v, 2) for v in bb["middle"]],
                "lower": [round(v, 2) for v in bb["lower"]],
            },
            "movingAverage": [round(v, 2) for v in sma],
            "trend": trend,
        }
    except Exception as exc:
        raise RuntimeError(f"Failed to fetch data for {symbol}: {exc}") from exc
