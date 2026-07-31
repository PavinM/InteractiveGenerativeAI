import os
import json
import torch
import torchvision.models as models

def download_and_save_model():
    print("Downloading Image Classification Model (MobileNetV3 Large)...")
    save_dir = os.path.join(os.path.dirname(__file__), "image_model")
    os.makedirs(save_dir, exist_ok=True)

    weights = models.MobileNet_V3_Large_Weights.DEFAULT
    model = models.mobilenet_v3_large(weights=weights)
    model.eval()

    # Save weights locally
    model_path = os.path.join(save_dir, "mobilenet_v3.pth")
    torch.save(model.state_dict(), model_path)
    print(f"Model saved to: {model_path}")

    # Save categories locally
    categories = weights.meta["categories"]
    categories_path = os.path.join(save_dir, "categories.json")
    with open(categories_path, "w", encoding="utf-8") as f:
        json.dump(categories, f, indent=2)
    print(f"Categories ({len(categories)}) saved to: {categories_path}")

    print("Image classification model download complete!")

if __name__ == "__main__":
    download_and_save_model()
