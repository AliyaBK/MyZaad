#!/usr/bin/env python3
"""
Zaaduna — сборка курсора из знака платформы.

Курсор — тот же знак, что стоит в шапке главы, а не отдельный рисунок:
одна лодка на всё приложение. Источник — assets/logo-mark.png и его
тёмный вариант; они в 138 пикселей, этого хватает и на 64, и на 32,
поэтому ничего не растягивается.

Состояние одно: знак сопровождает чтение и приглушён, чтобы не спорить
с текстом. На нажимаемом работает обычный указатель системы, своего
рисунка там нет — по руке целятся не думая.

Сайту скрипт не нужен, он статический. Запускают руками, когда знак
меняется:

    python tools/render-cursor.py

Требуется Pillow.
"""
import os
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SIZES = ((1, 32, ""), (2, 64, "@2x"))
REST_ALPHA = 0.62          # лодка не спорит с текстом, по которому идёт
SOURCES = (
    ("assets/logo-mark.png",      "cursor-dhow-light"),
    ("assets/logo-mark-dark.png", "cursor-dhow-dark"),
)


def prepare(path):
    """Обрезает прозрачные поля и находит верх мачты."""
    im = Image.open(os.path.join(ROOT, path))
    im.load()
    im = im.convert("RGBA")
    im = im.crop(im.getchannel("A").getbbox())

    px = im.getchannel("A").load()
    mast = (0, 0)
    for y in range(im.height):
        row = [x for x in range(im.width) if px[x, y] > 40]
        if row:
            mast = (sum(row) // len(row), y)   # середина самого верхнего штриха
            break
    return im, mast


def render(im, mast, size, alpha):
    k = min(size / im.width, size / im.height)
    w, h = max(1, round(im.width * k)), max(1, round(im.height * k))
    small = im.resize((w, h), Image.LANCZOS)

    if alpha < 1:
        small.putalpha(small.getchannel("A").point(lambda v: int(v * alpha)))

    # Квадратный холст: 32 и 64 рисуют все системы без оговорок.
    pad = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    pad.paste(small, (0, 0))
    return pad, (round(mast[0] * k), round(mast[1] * k))


def main():
    hotspots = set()
    for path, name in SOURCES:
        im, mast = prepare(path)
        for dens, size, suffix in SIZES:
            img, hs = render(im, mast, size, REST_ALPHA)
            img.save(os.path.join(ROOT, "%s%s.png" % (name, suffix)))
            if dens == 1:
                hotspots.add(hs)
        print(name, "— png 32 и 64")
    print("верх мачты при обычной плотности:", sorted(hotspots),
          "— но в стиле горячая точка стоит в 1 1, как у обычной стрелки")


if __name__ == "__main__":
    main()
