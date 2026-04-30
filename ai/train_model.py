"""
MaintenAI - Model Training Script
Trains Isolation Forest on synthetic normal data
Run this once to generate the trained model
"""

import numpy as np
import joblib
from sklearn.ensemble import IsolationForest
import os

# Create models directory
os.makedirs('ai/models', exist_ok=True)

print("🤖 Training Isolation Forest Model...")
print("=" * 50)

# Set random seed for reproducibility
np.random.seed(42)

# Generate synthetic "normal" machine operation data
# Normal operating ranges:
# - Temperature: 70-85°C (mean 77, std 3)
# - Vibration: 0.4-0.7 (mean 0.55, std 0.08)
# - Pressure: 95-115 PSI (mean 105, std 5)

n_samples = 5000

# Generate normal data
temperature = np.random.normal(77, 3, n_samples)
vibration = np.random.normal(0.55, 0.08, n_samples)
pressure = np.random.normal(105, 5, n_samples)

# Clamp to realistic ranges
temperature = np.clip(temperature, 50, 100)
vibration = np.clip(vibration, 0.2, 1.0)
pressure = np.clip(pressure, 60, 140)

# Combine features
X_train = np.column_stack([temperature, vibration, pressure])

print(f"✅ Generated {n_samples} training samples")
print(f"\nFeature Ranges:")
print(f"  Temperature: {temperature.min():.1f}°C - {temperature.max():.1f}°C")
print(f"  Vibration:   {vibration.min():.2f} - {vibration.max():.2f}")
print(f"  Pressure:    {pressure.min():.1f} PSI - {pressure.max():.1f} PSI")

# Train Isolation Forest
print(f"\n📚 Training Isolation Forest...")
iso_forest = IsolationForest(
    contamination=0.05,  # Assume 5% of data is anomalous
    random_state=42,
    n_estimators=100
)

iso_forest.fit(X_train)

print(f"✅ Model trained!")
print(f"   Estimators: {iso_forest.n_estimators}")
print(f"   Features: 3 (temperature, vibration, pressure)")
print(f"   Contamination: {iso_forest.contamination}")

# Save model
model_path = 'ai/models/isolation_forest_model.pkl'
joblib.dump(iso_forest, model_path)

print(f"\n✅ Model saved to: {model_path}")

# Test the model
print(f"\n🧪 Testing model...")

# Test on normal data
test_normal = np.array([[77, 0.55, 105]])
score_normal = iso_forest.score_samples(test_normal)
print(f"   Normal data (77°C, 0.55V, 105PSI):")
print(f"   Anomaly score: {score_normal[0]:.3f} (should be ≈ 0)")

# Test on anomalous data
test_anomaly = np.array([[95, 0.9, 130]])
score_anomaly = iso_forest.score_samples(test_anomaly)
print(f"\n   Anomalous data (95°C, 0.9V, 130PSI):")
print(f"   Anomaly score: {score_anomaly[0]:.3f} (should be positive)")

print(f"\n" + "=" * 50)
print(f"✅ Training complete!")
print(f"   Model is ready for inference in backend/main.py")
print(f"=" * 50)
