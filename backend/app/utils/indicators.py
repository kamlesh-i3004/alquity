
import pandas as pd

def moving_average(data, window=5):
    return pd.Series(data).rolling(window).mean().tolist()
