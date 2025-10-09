# ml/inference/app.py

import torch
import torch.nn.functional as F
import requests
from io import BytesIO
from pathlib import Path
from PIL import Image
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import torchvision.transforms as T
from torchvision import models

# FastAPI app initialize karna
app = FastAPI(title="Crop Disease Detection API")

# --- Model Path Configuration ---
# Yahan bhi 'models' folder ka path dynamically set kiya gaya hai
MODELS_DIR = Path(__file__).resolve().parents[1] / "models"
CKPT_PATH = MODELS_DIR / "model_best.pt"

# --- Pydantic Models for API ---
# Input me kya aayega (image_url)
class PredictIn(BaseModel):
    image_url: str

# --- Model Loading ---
# Yeh function API start hote hi model ko memory me load kar leta hai
def load_model():
    if not CKPT_PATH.exists():
        raise FileNotFoundError(f"Model checkpoint not found at {CKPT_PATH}")
    
    # Checkpoint se model aur classes ka naam load karna
    ckpt = torch.load(str(CKPT_PATH), map_location="cpu")
    classes = ckpt["classes"]
    num_classes = len(classes)
    
    # Model ka structure banana
    model = models.efficientnet_b0(weights=None)
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
    
    # Trained weights load karna
    model.load_state_dict(ckpt["state_dict"])
    model.eval() # Model ko evaluation mode me set karna
    return model, classes

# API start hone par model load ho jayega
model, classes = load_model()

# Image ko model ke input ke liye taiyar karne wale transformations
tf = T.Compose([
    T.Resize(256),
    T.CenterCrop(224),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225]),
])

# --- API Endpoint ---
@app.get("/")
def read_root():
    return {"message": "Welcome to the Crop Disease Detection API. Use the /predict endpoint to get predictions."}

@app.post("/predict")
def predict(inp: PredictIn):
    # Step 1: Image URL se image download karna
    try:
        r = requests.get(inp.image_url, timeout=10)
        r.raise_for_status() # Agar download me error ho to exception raise karega
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image fetch failed: {e}")

    # Step 2: Image ko process karna
    img = Image.open(BytesIO(r.content)).convert("RGB")
    x = tf(img).unsqueeze(0) # Transformations apply karna aur batch dimension add karna

    # Step 3: Model se prediction lena
    with torch.no_grad():
        logits = model(x)
        probs = F.softmax(logits, dim=1)[0].tolist()

    # Step 4: Result ko format karna (confidence ke hisab se sort karke)
    ranked = sorted(
        [{"disease_id": None, "name": classes[i], "confidence": p} for i, p in enumerate(probs)],
        key=lambda d: d["confidence"],
        reverse=True
    )
    return {"predictions": ranked}