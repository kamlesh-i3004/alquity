
import numpy as np
from sklearn.preprocessing import MinMaxScaler

def scale_data(data):
    scaler = MinMaxScaler()
    scaled = scaler.fit_transform(np.array(data).reshape(-1,1))
    return scaled, scaler
