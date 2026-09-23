"""Build compact WebP delivery assets from the original PNG artwork.

Run with: uv run --with pillow --no-project python -X utf8 optimize-images.py
The original PNG files stay available as source artwork.
"""

from pathlib import Path
from PIL import Image

assets = Path(__file__).resolve().parent / "assets"
names = (
    "entry",
    "cover",
    "stars",
    "climb",
    "run",
    "late-chapters-flow-v2",
    "story-outdoor",
    "story-design",
    "story-coffee",
)

for name in names:
    source = assets / f"{name}.png"
    target = assets / f"{name}.webp"
    with Image.open(source) as image:
        image.save(target, "WEBP", quality=82, method=6)
        print(f"{name}: {source.stat().st_size:,} → {target.stat().st_size:,} bytes ({image.width}×{image.height})")

# These three existing PNG paths have identical file hashes. Store their shared
# background once so the browser fetches and decodes it only once.
source = assets / "ending-light-trails.png"
target = assets / "journey-flow.webp"
with Image.open(source) as image:
    image.save(target, "WEBP", quality=82, method=6)
    print(f"journey-flow: {source.stat().st_size:,} → {target.stat().st_size:,} bytes ({image.width}×{image.height})")
