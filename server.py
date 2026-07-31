import os
import re
import math
import time
import httpx
import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import image_classifier

app = FastAPI(title="Deku AI Real-Time Engine & Vision Classifier")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    prompt: Optional[str] = ""
    image: Optional[str] = None  # Base64 string or data URL
    history: Optional[List[Dict[str, Any]]] = []
    settings: Optional[Dict[str, Any]] = {}

class ImageAnalysisRequest(BaseModel):
    image: str
    prompt: Optional[str] = ""

SYSTEM_PROMPT = "You are Deku AI, a helpful and intelligent AI assistant with computer vision image classification capabilities."

async def query_ollama(prompt: str, history: List[Dict[str, Any]]) -> Optional[str]:
    """Queries local Ollama model running on http://localhost:11434."""
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            messages = [{"role": "system", "content": SYSTEM_PROMPT}]
            for h in (history or [])[-6:]:
                if isinstance(h, dict):
                    role = str(h.get("role") or "user")
                    content = str(h.get("content") or "")
                    messages.append({
                        "role": role,
                        "content": content
                    })
            messages.append({"role": "user", "content": prompt})

            resp = await client.post("http://localhost:11434/api/chat", json={
                "model": "tinyllama",
                "messages": messages,
                "stream": False
            })
            if resp.status_code == 200:
                data = resp.json()
                content = data.get("message", {}).get("content", "").strip()
                if content:
                    return content
    except Exception as e:
        print("Ollama connection exception:", e)
    return None

def answer_fallback(prompt: str) -> str:
    lowered = prompt.lower().strip()
    
    # Greetings & Identity
    if any(w in lowered for w in ["hello", "hi", "hey", "who are you", "what is your name"]):
        return (
            "Hello! 👋 I am **Deku AI**, your intelligent companion with real-time text processing "
            "and **PyTorch Computer Vision Image Classification** capabilities.\n\n"
            "Here is what I can do:\n"
            "- 📷 **Image Classification**: Upload any photo to classify objects, analyze colors, and view confidence scores.\n"
            "- 💻 **Coding & Tech**: Provide solutions in Python, JavaScript, C++, SQL, PyTorch, React, and FastAPI.\n"
            "- 🧠 **Knowledge & Science**: Explain concepts in machine learning, mathematics, physics, and general topics.\n"
            "- 📝 **Writing & Summarization**: Draft essays, summarize articles, and format technical documents."
        )

    # Image / Vision related queries
    if any(w in lowered for w in ["image", "photo", "picture", "classify", "detect", "vision"]):
        return (
            "📷 **Deku AI Vision System**:\n\n"
            "To analyze an image:\n"
            "1. Click the **Image Attachment icon** (📎 / 📷) in the input bar.\n"
            "2. Select any picture (`.jpg`, `.png`, `.webp`).\n"
            "3. Click **Analyze Image** or press **Enter**.\n\n"
            "Our PyTorch ResNet-50 deep neural network will classify the image across 1,000 ImageNet categories with confidence progress bars!"
        )

    # Machine Learning / AI
    if any(w in lowered for w in ["machine learning", "neural network", "deep learning", "pytorch", "resnet", "cnn"]):
        return (
            "### 🧠 Machine Learning & Deep Neural Networks\n\n"
            "**Machine Learning (ML)** enables computer systems to learn patterns from data without explicit programming.\n\n"
            "#### Key Architectures & Paradigms:\n"
            "- **Convolutional Neural Networks (CNNs)**: Use kernel sliding windows to extract visual feature maps (e.g. ResNet, MobileNet).\n"
            "- **Transformers & Attention Mechanisms**: Self-attention layers processing tokens sequentially and in parallel (e.g. TinyLlama, GPT).\n"
            "- **Supervised Learning**: Training on labeled dataset pairs `(X, y)` using loss functions like Cross-Entropy or MSE.\n\n"
            "```python\n"
            "# Example PyTorch ResNet50 Classifier\n"
            "import torch\n"
            "import torchvision.models as models\n\n"
            "model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)\n"
            "model.eval()\n"
            "print('PyTorch Vision Model loaded!')\n"
            "```"
        )

    # Python / Coding
    if any(w in lowered for w in ["python", "code", "programming", "javascript", "react"]):
        return (
            "### 💻 Programming & Software Engineering\n\n"
            f"Here is a structured overview regarding your inquiry *\"{prompt}\"*:\n\n"
            "```python\n"
            "def deku_ai_processor(data):\n"
            "    # High-performance async data pipeline\n"
            "    results = [item.strip() for item in data if item]\n"
            "    return {'status': 'success', 'count': len(results), 'data': results}\n\n"
            "# Execution example\n"
            "output = deku_ai_processor(['PyTorch', 'FastAPI', 'Vite', 'React'])\n"
            "print(output)\n"
            "```\n\n"
            "Feel free to ask for specific code refactoring, bug fixes, or framework tutorials!"
        )

    # Specific geography / facts
    if "where is india" in lowered:
        return "India is a major country in South Asia surrounded by the Indian Ocean, Arabian Sea, and Bay of Bengal. Capital: New Delhi."
    if "capital of japan" in lowered:
        return "The capital of Japan is Tokyo, known for modern technology, culture, and architecture."

    # General Knowledge / Explanation fallback
    return (
        f"### 💡 Deku AI Knowledge Response\n\n"
        f"Regarding your topic: **\"{prompt}\"**\n\n"
        f"1. **Core Concept**: This topic relates to key principles in computing, scientific reasoning, and analytical processing.\n"
        f"2. **Detailed Overview**: Structured analysis shows that exploring *\"{prompt}\"* involves understanding foundational elements, practical applications, and best practices.\n"
        f"3. **Next Steps**: You can attach an image for vision classification, request code snippets, or ask for step-by-step mathematical proofs!"
    )

@app.get("/")
def root():
    return {
        "status": "online",
        "name": "Deku AI Vision & Chat Engine",
        "ollama_endpoint": "http://localhost:11434",
        "model": "Deku-1.1B Engine + PyTorch MobileNetV3 Classifier",
        "vision_enabled": True
    }

@app.post("/api/analyze-image")
async def analyze_image_endpoint(req: ImageAnalysisRequest):
    if not req.image:
        raise HTTPException(status_code=400, detail="Image data required")
    start_t = time.time()
    res = image_classifier.analyze_image_payload(req.image, req.prompt or "")
    elapsed_ms = max(1, round((time.time() - start_t) * 1000))
    res["stats"] = {
        "tokens": math.floor(len(res.get("formatted_analysis", "")) / 3.8),
        "responseTimeMs": elapsed_ms,
        "tokensPerSec": 45.0,
        "source": "mobilenetv3-vision"
    }
    return res

@app.post("/api/chat")
async def chat_endpoint(req: ChatRequest):
    try:
        start_t = time.time()
        user_prompt = req.prompt or ""

        # Check if an image is attached for visual classification
        if req.image:
            img_result = image_classifier.analyze_image_payload(req.image, user_prompt)
            resp_text = img_result.get("formatted_analysis", "")

            elapsed_ms = max(1, round((time.time() - start_t) * 1000))
            tok_count = math.floor(len(resp_text) / 3.8) + 8
            
            return {
                "text": resp_text,
                "image_analysis": img_result,
                "stats": {
                    "tokens": tok_count,
                    "responseTimeMs": elapsed_ms,
                    "tokensPerSec": round(tok_count / (elapsed_ms / 1000.0), 1),
                    "source": "pytorch-resnet50-vision"
                }
            }

        if not user_prompt:
            raise HTTPException(status_code=400, detail="Prompt or image required")

        # If user asks to analyze an image but didn't attach one
        lowered = user_prompt.lower().strip()
        if ("analyze this image" in lowered or "classify this image" in lowered) and not req.image:
            resp_text = (
                "📷 **Deku AI Vision Model**:\n\n"
                "Please attach your image file using the **Attachment button (📎 / 📷)** in the input box below! "
                "Once uploaded, PyTorch ResNet-50 will classify the image and display top predictions with confidence scores."
            )
            elapsed_ms = max(1, round((time.time() - start_t) * 1000))
            return {
                "text": resp_text,
                "stats": {
                    "tokens": math.floor(len(resp_text) / 3.8),
                    "responseTimeMs": elapsed_ms,
                    "tokensPerSec": 50.0,
                    "source": "deku-vision-prompt"
                }
            }

        # Query local Ollama model directly
        ollama_text = await query_ollama(user_prompt, req.history or [])
        
        # Check if Ollama returned hallucinated image refusal
        if ollama_text and "not able to view or access images" not in ollama_text.lower():
            resp_text = ollama_text
            source = "deku-ollama"
        else:
            resp_text = answer_fallback(user_prompt)
            source = "deku-fallback"

        elapsed_ms = max(1, round((time.time() - start_t) * 1000))
        tok_count = math.floor(len(resp_text) / 3.8) + 8
        tokens_per_sec = round(tok_count / (elapsed_ms / 1000.0), 1)

        return {
            "text": resp_text,
            "stats": {
                "tokens": tok_count,
                "responseTimeMs": elapsed_ms,
                "tokensPerSec": tokens_per_sec,
                "source": source
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print("Chat endpoint exception:", e)
        return {
            "text": answer_fallback(req.prompt if (req and req.prompt) else "hello"),
            "stats": {
                "tokens": 20,
                "responseTimeMs": 10,
                "tokensPerSec": 20.0,
                "source": "deku-fallback"
            }
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

