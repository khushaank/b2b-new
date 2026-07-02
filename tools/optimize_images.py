from pathlib import Path
import argparse
from PIL import Image


def save_webp(source: Path, destination: Path, max_width: int, quality: int, square: int | None = None) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as image:
        image = image.convert("RGBA" if "A" in image.getbands() else "RGB")
        if square:
            image.thumbnail((round(square * .82), round(square * .82)), Image.Resampling.LANCZOS)
            canvas = Image.new("RGB", (square, square), "white")
            if image.mode == "RGBA":
                canvas.paste(image, ((square - image.width) // 2, (square - image.height) // 2), image)
            else:
                canvas.paste(image, ((square - image.width) // 2, (square - image.height) // 2))
            image = canvas
        elif image.width > max_width:
            height = round(image.height * max_width / image.width)
            image = image.resize((max_width, height), Image.Resampling.LANCZOS)
        image.save(destination, "WEBP", quality=quality, method=6, optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description="Convert and optimize website imagery as WebP.")
    parser.add_argument("source", type=Path)
    parser.add_argument("destination", type=Path)
    parser.add_argument("--max-width", type=int, default=1600)
    parser.add_argument("--quality", type=int, default=78)
    parser.add_argument("--square", type=int)
    args = parser.parse_args()
    save_webp(args.source, args.destination, args.max_width, args.quality, args.square)


if __name__ == "__main__":
    main()
