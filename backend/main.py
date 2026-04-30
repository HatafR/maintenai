"""
MaintenAI Backend - FastAPI Application
Provides real-time sensor simulation and AI-based predictive maintenance
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import random
import joblib
import numpy as np

app = FastAPI(
    title="MaintenAI API",
    description="AI-Powered Predictive Maintenance",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== MODELS ====================

class SensorData(BaseModel):
    temperature: float
    vibration: float
    pressure: float

class PredictionRequest(BaseModel):
    temperature: float
    vibration: float
    pressure: float

class PredictionResult(BaseModel):
    anomaly_score: float
    health_score: int
    status: str
    confidence: float
    message: str

class SimulationResponse(BaseModel):
    timestamp: str
    sensor_data: SensorData
    prediction: PredictionResult

# GLOBAL STATE
model = None
is_model_loaded = False

def load_model():
    global model, is_model_loaded
    try:
        model = joblib.load('ai/models/isolation_forest_model.pkl')
        is_model_loaded = True
        print("✅ Model loaded successfully")
    except Exception as e:
        print(f"⚠️ Model not found: {e}")
        is_model_loaded = False

load_model()

# ==================== UTILITY FUNCTIONS ====================

def generate_sensor_data(is_anomaly: bool = False) -> SensorData:
    """Generate realistic sensor readings"""
    if is_anomaly:
        temperature = random.choice([
            random.uniform(50, 60),
            random.uniform(90, 100)
        ])
        vibration = random.choice([
            random.uniform(0.8, 1.0),
            random.uniform(0.2, 0.3)
        ])
        pressure = random.choice([
            random.uniform(120, 140),
            random.uniform(60, 80)
        ])
    else:
        temperature = random.gauss(77, 3)
        vibration = random.gauss(0.55, 0.08)
        pressure = random.gauss(105, 5)
    
    temperature = max(50, min(100, temperature))
    vibration = max(0.2, min(1.0, vibration))
    pressure = max(60, min(140, pressure))
    
    return SensorData(
        temperature=round(temperature, 1),
        vibration=round(vibration, 2),
        pressure=round(pressure, 1)
    )

def predict_with_model(sensor_data: SensorData) -> PredictionResult:
    """Use Isolation Forest for prediction"""
    
    if not is_model_loaded:
        return fallback_prediction(sensor_data)
    
    try:
        X = np.array([[
            sensor_data.temperature,
            sensor_data.vibration,
            sensor_data.pressure
        ]])
        
        anomaly_score = float(model.score_samples(X)[0])
        health_score = int(max(0, min(100, (anomaly_score + 0.5) * 100)))
        
        if health_score >= 80:
            status = "normal"
            confidence = 0.95
        elif health_score >= 60:
            status = "warning"
            confidence = 0.88
        else:
            status = "critical"
            confidence = 0.92
        
        message = generate_message(sensor_data, status)
        
        return PredictionResult(
            anomaly_score=round(anomaly_score, 3),
            health_score=health_score,
            status=status,
            confidence=round(confidence, 2),
            message=message
        )
    except Exception as e:
        print(f"Error: {e}")
        return fallback_prediction(sensor_data)

def fallback_prediction(sensor_data: SensorData) -> PredictionResult:
    """Fallback if model unavailable"""
    temp_score = max(0, 100 - abs(sensor_data.temperature - 75) * 2)
    vib_score = max(0, 100 - abs(sensor_data.vibration - 0.55) * 50)
    pres_score = max(0, 100 - abs(sensor_data.pressure - 105) * 1.5)
    
    health_score = int((temp_score + vib_score + pres_score) / 3)
    
    if health_score >= 80:
        status = "normal"
        anomaly_score = random.uniform(-0.5, 0)
    elif health_score >= 60:
        status = "warning"
        anomaly_score = random.uniform(0, 0.3)
    else:
        status = "critical"
        anomaly_score = random.uniform(0.3, 1.0)
    
    message = generate_message(sensor_data, status)
    
    return PredictionResult(
        anomaly_score=round(anomaly_score, 3),
        health_score=health_score,
        status=status,
        confidence=0.75,
        message=message
    )

def generate_message(sensor_data: SensorData, status: str) -> str:
    """Generate contextual message"""
    messages = {
        "normal": "✅ Machine operating normally. All systems healthy.",
        "warning": "⚠️ Anomaly detected. Maintenance recommended within 7 days.",
        "critical": "🚨 CRITICAL anomaly detected. Immediate maintenance required!"
    }
    
    if sensor_data.temperature > 90:
        if status == "critical":
            messages["critical"] += " High temperature → cooling failure risk!"
        else:
            messages["warning"] += " High temperature → cooling check needed."
    
    if sensor_data.vibration > 0.8:
        if status == "critical":
            messages["critical"] += " High vibration → bearing failure risk!"
        else:
            messages["warning"] += " High vibration → bearing check needed."
    
    if sensor_data.pressure > 125:
        if status == "critical":
            messages["critical"] += " High pressure → seal failure risk!"
        else:
            messages["warning"] += " High pressure → relief valve check."
    
    return messages[status]

# ==================== ENDPOINTS ====================

@app.get("/")
async def root():
    return {"name": "MaintenAI", "status": "🚀 Running", "docs": "/docs"}

@app.get("/health")
async def health_check():
    return {
        "status": "healthy" if is_model_loaded else "warning",
        "model_loaded": is_model_loaded,
        "version": "1.0.0"
    }

@app.get("/simulate", response_model=SimulationResponse)
async def simulate_sensor_data(anomaly: bool = False):
    """Generate simulated sensor data and predict"""
    sensor_data = generate_sensor_data(is_anomaly=anomaly)
    prediction = predict_with_model(sensor_data)
    
    return SimulationResponse(
        timestamp=datetime.utcnow().isoformat() + "Z",
        sensor_data=sensor_data,
        prediction=prediction
    )

@app.post("/predict", response_model=PredictionResult)
async def predict_sensor_data(request: PredictionRequest):
    """Submit custom sensor readings"""
    sensor_data = SensorData(
        temperature=request.temperature,
        vibration=request.vibration,
        pressure=request.pressure
    )
    
    if not (50 <= sensor_data.temperature <= 100):
        raise HTTPException(status_code=400, detail="Temperature: 50-100°C")
    if not (0.2 <= sensor_data.vibration <= 1.0):
        raise HTTPException(status_code=400, detail="Vibration: 0.2-1.0")
    if not (60 <= sensor_data.pressure <= 140):
        raise HTTPException(status_code=400, detail="Pressure: 60-140 PSI")
    
    return predict_with_model(sensor_data)

@app.on_event("startup")
async def startup_event():
    print("🚀 MaintenAI Backend Starting...")
    print("✅ Backend Ready!")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
