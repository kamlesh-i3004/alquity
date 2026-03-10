
import numpy as np

def optimize_portfolio(returns):
    weights = np.ones(len(returns)) / len(returns)
    portfolio_return = np.dot(weights, returns)
    return {"weights": weights.tolist(), "expected_return": float(portfolio_return)}
