#!/usr/bin/env python3
"""
Zaaduna — сборка курсора-дау.

Единственное место, где живут геометрия и цвета лодки: отсюда выходят
и SVG (читаемый исходник), и PNG (то, что реально показывает браузер).
Сайту этот файл не нужен — он статический и собирается сам; скрипт
запускают руками, когда лодку надо перерисовать:

    python tools/render-cursor.py

Требуется Pillow. Растр делается с восьмикратным суперсэмплингом, потому
что курсор в 32 пикселя не прощает грубых краёв.
"""
import os
from PIL import Image, ImageDraw

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

VB = (1.4, 1.0, 21.2, 18.55)   # рамка, обрезанная по силуэту
ART = (24, 21)                 # размер лодки при обычной плотности
BOX = 32                       # холст: квадрат рисуют все системы
SS = 8                         # суперсэмплинг

# Контуры: ("M", x, y), ("L", x, y), ("Q", cx, cy, x, y), ("C", x1,y1,x2,y2,x,y)
SAIL = [("M", 10.2, 1.8), ("Q", 15.8, 7.2, 17.6, 13.9), ("L", 11.4, 13.9)]
HULL = [("M", 2.2, 4.6), ("C", 4, 9.4, 6.2, 12.6, 8.6, 14.1),
        ("L", 20.4, 14.1), ("L", 21.8, 12.4),
        ("C", 21.4, 16.2, 17.6, 18.6, 12.4, 18.6),
        ("C", 7.6, 18.6, 3.6, 12, 2.2, 4.6)]

STROKE_W = 0.5
# Корпус золотой, паруса синие — как на логотипе. Обводка берёт цвет фона
# своей темы, чтобы силуэт не пропадал над чужими пятнами.
BG_LIGHT, BG_DARK = "#FAF8F2", "#14181C"
STATES = {
    # Светлая тема: в покое приглушённо, над нажимаемым — в полную силу.
    "cursor-dhow-light":     dict(sail="#6E7E95", hull="#C3A77E", stroke=BG_LIGHT),
    "cursor-dhow-light-hot": dict(sail="#1A355C", hull="#B68B55", stroke=BG_LIGHT),
    # Тёмная тема: те же роли, но цвета берутся из её половины палитры.
    "cursor-dhow-dark":      dict(sail="#5C7599", hull="#9A8352", stroke=BG_DARK),
    "cursor-dhow-dark-hot":  dict(sail="#7FA6D6", hull="#D2AE5C", stroke=BG_DARK),
}

SVG = '''<svg xmlns="http://www.w3.org/2000/svg" width="{w}" height="{h}" viewBox="{vb}">
  <g paint-order="stroke" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round">
    <path fill="{sail}" d="M10.2 1.8Q15.8 7.2 17.6 13.9L11.4 13.9Z"/>
    <path fill="{hull}" d="M2.2 4.6C4 9.4 6.2 12.6 8.6 14.1L20.4 14.1L21.8 12.4C21.4 16.2 17.6 18.6 12.4 18.6C7.6 18.6 3.6 12 2.2 4.6Z"/>
  </g>
</svg>
'''


def flatten(path, steps=96):
    """Разворачивает кривые в многоугольник в координатах рамки."""
    pts, cur = [], None
    for seg in path:
        k = seg[0]
        if k in ("M", "L"):
            cur = (seg[1], seg[2])
            pts.append(cur)
        elif k == "Q":
            (x0, y0), (cx, cy), (x1, y1) = cur, (seg[1], seg[2]), (seg[3], seg[4])
            for i in range(1, steps + 1):
                t = i / steps
                u = 1 - t
                pts.append((u * u * x0 + 2 * u * t * cx + t * t * x1,
                            u * u * y0 + 2 * u * t * cy + t * t * y1))
            cur = (x1, y1)
        elif k == "C":
            x0, y0 = cur
            cx1, cy1, cx2, cy2, x1, y1 = seg[1:]
            for i in range(1, steps + 1):
                t = i / steps
                u = 1 - t
                pts.append((u**3 * x0 + 3 * u * u * t * cx1 + 3 * u * t * t * cx2 + t**3 * x1,
                            u**3 * y0 + 3 * u * u * t * cy1 + 3 * u * t * t * cy2 + t**3 * y1))
            cur = (x1, y1)
    return pts


def raster(colors, dens):
    """dens=1 — лодка 24x21 в холсте 32x32; dens=2 — вдвое крупнее."""
    art_w = ART[0] * dens
    box = BOX * dens
    s = art_w / VB[2] * SS
    big = Image.new("RGBA", (box * SS, box * SS), (0, 0, 0, 0))
    d = ImageDraw.Draw(big)
    w = max(1, round(STROKE_W * s))

    def put(path, fill):
        p = [((x - VB[0]) * s, (y - VB[1]) * s) for x, y in flatten(path)]
        d.line(p + [p[0]], fill=colors["stroke"], width=w, joint="curve")  # paint-order: обводка под заливкой
        d.polygon(p, fill=fill)

    put(SAIL, colors["sail"])   # парус первым, корпус ложится сверху
    put(HULL, colors["hull"])
    return big.resize((box, box), Image.LANCZOS)


def main():
    vb = " ".join(str(v) for v in VB)
    for name, colors in STATES.items():
        svg = SVG.format(w=ART[0], h=ART[1], vb=vb, sw=STROKE_W, **colors)
        with open(os.path.join(ROOT, name + ".svg"), "w", encoding="utf-8", newline="\n") as f:
            f.write(svg)
        for dens, suffix in ((1, ""), (2, "@2x")):
            raster(colors, dens).save(os.path.join(ROOT, "%s%s.png" % (name, suffix)))
        print(name, "— svg + png 32 и 64")


if __name__ == "__main__":
    main()
