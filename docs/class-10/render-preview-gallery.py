import json
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageStat

folder = Path(__file__).resolve().parent
entries = json.loads((folder / "book-mapping.json").read_text(encoding="utf-8"))["experiments"]
assert len(entries) == 12
tile_width, tile_height, gap, heading = 600, 490, 20, 100
sheet = Image.new("RGB", (tile_width * 3 + gap * 4, tile_height * 4 + gap * 5 + heading), "#edf1f5")
draw = ImageDraw.Draw(sheet)
font = ImageFont.truetype("C:/Windows/Fonts/segoeui.ttf", 25)
title_font = ImageFont.truetype("C:/Windows/Fonts/segoeuib.ttf", 36)
draw.text((gap, 28), "CLASS 10 / PRACTICAL MODELS", font=title_font, fill="#172438")
for index, entry in enumerate(entries):
    source = folder / "models" / f"experiment-{entry['number']:02d}.png"
    image = Image.open(source).convert("RGB")
    assert image.size == (1200, 900), f"Unexpected render size: {source}"
    assert sum(ImageStat.Stat(image).var) > 10, f"Blank preview: {source}"
    image.thumbnail((tile_width, 430))
    x = gap + (index % 3) * (tile_width + gap)
    y = heading + gap + (index // 3) * (tile_height + gap)
    sheet.paste(image, (x + (tile_width - image.width) // 2, y))
    text = f"{entry['number']:02d}  {entry['title']}"
    while draw.textbbox((0, 0), text, font=font)[2] > tile_width:
        text = text[:-4] + "..."
    draw.text((x, y + 440), text, font=font, fill="#172438")
output = folder / "class-10-models-gallery.jpg"
sheet.save(output, quality=94)
print(output)
