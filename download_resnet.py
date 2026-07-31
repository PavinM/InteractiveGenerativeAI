import os
import json
import torch
import torchvision.models as models

def download_resnet50():
    print("Downloading ResNet-50 Image Classification Model...")
    save_dir = os.path.join(os.path.dirname(__file__), "image_model")
    os.makedirs(save_dir, exist_ok=True)

    weights = models.ResNet50_Weights.DEFAULT
    model = models.resnet50(weights=weights)
    model.eval()

    # Save weights
    model_path = os.path.join(save_dir, "resnet50.pth")
    torch.save(model.state_dict(), model_path)
    print(f"ResNet-50 weights saved to: {model_path}")

    # Save categories
    categories = weights.meta["categories"]
    categories_path = os.path.join(save_dir, "categories.json")
    with open(categories_path, "w", encoding="utf-8") as f:
        json.dump(categories, f, indent=2)
    print(f"Categories ({len(categories)}) saved to: {categories_path}")

if __name__ == "__main__":
    download_resnet50()
