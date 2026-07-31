import io
import sys
import base64
from PIL import Image, ImageDraw
from fastapi.testclient import TestClient
from server import app

sys.stdout.reconfigure(encoding='utf-8')
client = TestClient(app)

def create_sample_image_base64():
    # Create a red square image
    img = Image.new("RGB", (224, 224), color="red")
    draw = ImageDraw.Draw(img)
    draw.rectangle([50, 50, 170, 170], fill="yellow", outline="black")
    
    buf = io.BytesIO()
    img.save(buf, format="JPEG")
    b64_bytes = base64.b64encode(buf.getvalue())
    return "data:image/jpeg;base64," + b64_bytes.decode("utf-8")

def test_api():
    print("Testing /api/analyze-image endpoint...")
    b64_img = create_sample_image_base64()
    
    res1 = client.post("/api/analyze-image", json={"image": b64_img, "prompt": "What is in this image?"})
    print("Status code:", res1.status_code)
    data1 = res1.json()
    print("Top Label:", data1.get("top_label"))
    print("Confidence:", data1.get("confidence"))
    print("Resolution:", data1.get("resolution"))
    print("Formatted Analysis snippet:\n", data1.get("formatted_analysis", "")[:300])
    
    print("\nTesting /api/chat with image endpoint...")
    res2 = client.post("/api/chat", json={"image": b64_img, "prompt": "Can you analyze this picture?"})
    print("Chat Status code:", res2.status_code)
    data2 = res2.json()
    print("Response text snippet:\n", data2.get("text", "")[:300])

if __name__ == "__main__":
    test_api()
