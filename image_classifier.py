import os
import json
import base64
import io
import math
from PIL import Image, ImageStat
import torch
import torchvision.transforms as transforms
import torchvision.models as models

MODEL_DIR = os.path.join(os.path.dirname(__file__), "image_model")
RESNET_WEIGHTS_PATH = os.path.join(MODEL_DIR, "resnet50.pth")
MOBILENET_WEIGHTS_PATH = os.path.join(MODEL_DIR, "mobilenet_v3.pth")
CATEGORIES_PATH = os.path.join(MODEL_DIR, "categories.json")

# Global singleton models & categories
_resnet_model = None
_mobilenet_model = None
_categories = None
_transform = None

def get_transform():
    global _transform
    if _transform is None:
        _transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize(
                mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]
            )
        ])
    return _transform

def load_categories():
    global _categories
    if _categories is None:
        if os.path.exists(CATEGORIES_PATH):
            with open(CATEGORIES_PATH, "r", encoding="utf-8") as f:
                _categories = json.load(f)
        else:
            weights = models.ResNet50_Weights.DEFAULT
            _categories = weights.meta["categories"]
    return _categories

def load_models():
    global _resnet_model, _mobilenet_model
    categories = load_categories()

    # Load ResNet-50
    if _resnet_model is None:
        try:
            if os.path.exists(RESNET_WEIGHTS_PATH):
                _resnet_model = models.resnet50(weights=None)
                _resnet_model.load_state_dict(torch.load(RESNET_WEIGHTS_PATH, map_location="cpu"))
            else:
                _resnet_model = models.resnet50(weights=models.ResNet50_Weights.DEFAULT)
            _resnet_model.eval()
            print("ResNet-50 model ready.")
        except Exception as e:
            print("Error loading ResNet-50:", e)

    # Load MobileNetV3 Large
    if _mobilenet_model is None:
        try:
            if os.path.exists(MOBILENET_WEIGHTS_PATH):
                _mobilenet_model = models.mobilenet_v3_large(weights=None)
                _mobilenet_model.load_state_dict(torch.load(MOBILENET_WEIGHTS_PATH, map_location="cpu"))
            else:
                _mobilenet_model = models.mobilenet_v3_large(weights=models.MobileNet_V3_Large_Weights.DEFAULT)
            _mobilenet_model.eval()
            print("MobileNetV3 model ready.")
        except Exception as e:
            print("Error loading MobileNetV3:", e)

    return _resnet_model, _mobilenet_model, categories

def run_model_inference(model, tensor, categories, top_k=5):
    if model is None:
        return []
    with torch.no_grad():
        outputs = model(tensor)
        probabilities = torch.nn.functional.softmax(outputs[0], dim=0)

    top_probs, top_indices = torch.topk(probabilities, top_k)

    predictions = []
    for prob, idx in zip(top_probs, top_indices):
        label_raw = categories[idx.item()]
        label_clean = label_raw.replace("_", " ").title()
        conf_pct = round(prob.item() * 100, 2)
        predictions.append({
            "class_id": idx.item(),
            "label": label_clean,
            "confidence": conf_pct
        })
    return predictions

def get_image_color_stats(img: Image.Image):
    """Computes color distribution, dominant hue, brightness, and contrast."""
    if img.mode != "RGB":
        img = img.convert("RGB")

    stat = ImageStat.Stat(img)
    r_mean, g_mean, b_mean = stat.mean[:3]
    r_std, g_std, b_std = stat.stddev[:3]

    brightness = round((r_mean * 0.299 + g_mean * 0.587 + b_mean * 0.114), 1)
    contrast = round((r_std + g_std + b_std) / 3, 1)

    # Determine dominant color
    if brightness < 30:
        dominant_color = "Dark / Black"
    elif brightness > 220 and contrast < 25:
        dominant_color = "Bright / White"
    elif abs(r_mean - g_mean) < 15 and abs(g_mean - b_mean) < 15:
        dominant_color = "Grayscale / Neutral Gray"
    elif r_mean > g_mean and r_mean > b_mean:
        dominant_color = "Warm Red / Orange / Gold"
    elif g_mean > r_mean and g_mean > b_mean:
        dominant_color = "Vibrant Green / Nature tones"
    elif b_mean > r_mean and b_mean > g_mean:
        dominant_color = "Cool Blue / Ocean / Sky tones"
    else:
        dominant_color = "Balanced Multi-color"

    return {
        "brightness": brightness,
        "contrast": contrast,
        "dominant_color": dominant_color,
        "rgb_means": (round(r_mean, 1), round(g_mean, 1), round(b_mean, 1))
    }

def decode_base64_image(base64_str: str) -> Image.Image:
    """Decodes a base64 encoded image string or data URL to PIL Image."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    image_bytes = base64.b64decode(base64_str)
    return Image.open(io.BytesIO(image_bytes))

def analyze_image_payload(base64_image: str, user_prompt: str = "") -> dict:
    """
    Analyzes an image using BOTH MobileNetV3 and ResNet-50 models.
    """
    try:
        img = decode_base64_image(base64_image)
        width, height = img.size
        img_format = img.format or "JPEG"

        # Aspect ratio determination
        aspect_ratio = width / max(1, height)
        if aspect_ratio > 1.2:
            orientation = "Landscape (Wide)"
        elif aspect_ratio < 0.8:
            orientation = "Portrait (Tall)"
        else:
            orientation = "Square / Standard"

        # Image color & pixel statistics
        color_stats = get_image_color_stats(img)

        # Preprocess tensor
        transform = get_transform()
        if img.mode != "RGB":
            img_rgb = img.convert("RGB")
        else:
            img_rgb = img
        tensor = transform(img_rgb).unsqueeze(0)

        # Load both models
        resnet, mobilenet, categories = load_models()

        # Perform inference on both MobileNetV3 and ResNet-50
        mobilenet_preds = run_model_inference(mobilenet, tensor, categories, top_k=5)
        resnet_preds = run_model_inference(resnet, tensor, categories, top_k=5)

        # Combine predictions for primary consensus
        top_mobilenet = mobilenet_preds[0] if mobilenet_preds else {"label": "Unknown", "confidence": 0}
        top_resnet = resnet_preds[0] if resnet_preds else {"label": "Unknown", "confidence": 0}

        primary_label = top_resnet['label'] if top_resnet['confidence'] >= top_mobilenet['confidence'] else top_mobilenet['label']
        primary_conf = max(top_resnet['confidence'], top_mobilenet['confidence'])

        # Format MobileNet lines
        mobilenet_lines = []
        for i, p in enumerate(mobilenet_preds[:3], 1):
            bar_len = max(1, int(p['confidence'] / 5))
            bar = "█" * bar_len + "░" * (20 - bar_len)
            mobilenet_lines.append(f"{i}. **{p['label']}**: `{p['confidence']}%` `[{bar}]`")
        mobilenet_text = "\n".join(mobilenet_lines)

        # Format ResNet lines
        resnet_lines = []
        for i, p in enumerate(resnet_preds[:3], 1):
            bar_len = max(1, int(p['confidence'] / 5))
            bar = "█" * bar_len + "░" * (20 - bar_len)
            resnet_lines.append(f"{i}. **{p['label']}**: `{p['confidence']}%` `[{bar}]`")
        resnet_text = "\n".join(resnet_lines)

        analysis_text = (
            f"### 📷 Dual Vision AI Classification (MobileNetV3 + ResNet-50)\n\n"
            f"**Primary Detected Object**: **{primary_label}** (Highest Confidence: **{primary_conf}%**)\n"
            f"**Image Dimensions**: `{width} x {height}` ({orientation}, {img_format})\n"
            f"**Color Profile**: `{color_stats['dominant_color']}` (Brightness: `{color_stats['brightness']}/255`, Contrast: `{color_stats['contrast']}`)\n\n"
            f"#### 📱 MobileNetV3 Large Model Predictions:\n"
            f"{mobilenet_text}\n\n"
            f"#### ⚡ ResNet-50 Deep Neural Network Predictions:\n"
            f"{resnet_text}\n\n"
            f"#### 🔎 Visual Features & Observations:\n"
            f"- **MobileNetV3 Top Match**: **{top_mobilenet['label']}** ({top_mobilenet['confidence']}%).\n"
            f"- **ResNet-50 Top Match**: **{top_resnet['label']}** ({top_resnet['confidence']}%).\n"
            f"- **Frame Attributes**: `{orientation}` layout in `{color_stats['dominant_color']}` spectrum."
        )

        if user_prompt and user_prompt.strip() and user_prompt.lower() not in ["analyze this image and classify its contents.", "analyze this image"]:
            analysis_text += f"\n\n#### 💬 Question Response:\n> *\"{user_prompt}\"*\n\nBased on dual-model classification (**{primary_label}** with {primary_conf}% certainty), the image showcases distinct features of {primary_label.lower()}."

        return {
            "success": True,
            "top_label": primary_label,
            "confidence": primary_conf,
            "resolution": f"{width}x{height}",
            "dominant_color": color_stats['dominant_color'],
            "mobilenet_predictions": mobilenet_preds,
            "resnet_predictions": resnet_preds,
            "formatted_analysis": analysis_text
        }
    except Exception as e:
        print("Error in analyze_image_payload:", e)
        return {
            "success": False,
            "error": str(e),
            "formatted_analysis": f"⚠️ Could not process image: {str(e)}"
        }
