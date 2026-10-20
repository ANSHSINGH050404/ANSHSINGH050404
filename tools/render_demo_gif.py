"""Render the Tracekit demo animation from a real recorded session.

Frames are drawn with Pillow (monospace Consolas) and assembled with ffmpeg.
Every line of content below is verbatim output from an actual `tracekit wrap`
and `tracekit inspect` run.
"""
import subprocess, sys, pathlib
from PIL import Image, ImageDraw, ImageFont

OUT = pathlib.Path(sys.argv[1])
OUT.mkdir(parents=True, exist_ok=True)

W, H = 960, 440
FPS = 12
BG = (13, 17, 23)
TERM_BG = (1, 4, 9)
BORDER = (48, 54, 61)
BAR_BG = (22, 27, 34)
FG = (230, 237, 243)
MUTED = (139, 148, 158)
GREEN = (63, 185, 80)
DIM = (72, 79, 88)
CYAN = (121, 192, 255)

FONT = ImageFont.truetype(r"C:\Windows\Fonts\consola.ttf", 15)
FONT_B = ImageFont.truetype(r"C:\Windows\Fonts\consolab.ttf", 15)

LINE_H = 21
PAD_X = 20
TOP = 46
CHAR_W = FONT.getlength("M")
LEFT = 22

# (kind, text) — verbatim from a real run
SCRIPT = [
    ("cmd", "tracekit wrap -- node agent.js"),
    ("out", "read src/auth.py"),
    ("out", "wrote auth.py"),
    ("ok", "tracekit: recorded run_1792499305569_5da396 (completed, 94ms, 2 file(s) changed)"),
    ("blank", ""),
    ("cmd", "tracekit inspect run_1792499305569_5da396"),
    ("head", "Events:"),
    ("ev", "git.snapshot"),
    ("ev", "agent.started"),
    ("ev", "command.started    node agent.js"),
    ("ev", "command.stdout"),
    ("ev", "command.finished"),
    ("ev", "file.write         auth.py"),
    ("ev", "git.snapshot"),
    ("ev", "agent.finished"),
    ("blank", ""),
    ("head", "Files changed:"),
    ("out", "  auth.py"),
]

# Frames per entry: commands type out, output appears in a couple of frames.
WEIGHT = {"cmd": 26, "out": 3, "ok": 3, "head": 3, "ev": 2, "blank": 2}

COLORS = {"cmd": FG, "out": (201, 209, 217), "ok": GREEN, "head": CYAN, "ev": MUTED, "blank": DIM}


def draw_check(draw, x, y, color):
    """Draw a checkmark as two strokes so we do not depend on font coverage."""
    draw.line([(x, y + 6), (x + 4, y + 10)], fill=color, width=2)
    draw.line([(x + 4, y + 10), (x + 11, y + 1)], fill=color, width=2)


def render(frame_index):
    img = Image.new("RGB", (W, H), BG)
    d = ImageDraw.Draw(img)

    # terminal window
    d.rounded_rectangle([12, 12, W - 12, H - 12], radius=10, fill=TERM_BG, outline=BORDER, width=1)
    d.rounded_rectangle([12, 12, W - 12, 42], radius=10, fill=BAR_BG, outline=BORDER, width=1)
    d.rectangle([12, 32, W - 12, 42], fill=BAR_BG)
    d.line([12, 42, W - 12, 42], fill=BORDER, width=1)
    for i, c in enumerate([(255, 95, 86), (255, 189, 46), (39, 201, 63)]):
        d.ellipse([28 + i * 18, 21, 38 + i * 18, 31], fill=c)
    d.text((92, 19), "tracekit — agent run trace", font=FONT, fill=MUTED)

    # work out how much of the script is visible on this frame
    budget = frame_index
    y = TOP
    visible = []
    for kind, text in SCRIPT:
        cost = WEIGHT[kind]
        if budget <= 0:
            break
        if kind == "cmd":
            shown = text[: max(1, min(len(text), budget))]
            visible.append((kind, shown))
            budget -= cost
        else:
            visible.append((kind, text))
            budget -= cost

    for kind, text in visible:
        color = COLORS[kind]
        if kind == "blank":
            y += LINE_H
            continue
        if kind == "cmd":
            d.text((LEFT, y), "$", font=FONT_B, fill=GREEN)
            d.text((LEFT + CHAR_W * 2, y), text, font=FONT, fill=color)
        elif kind == "ev":
            draw_check(d, LEFT + 2, y + 3, GREEN)
            d.text((LEFT + 20, y), text, font=FONT, fill=color)
        else:
            d.text((LEFT, y), text, font=FONT, fill=color)
        y += LINE_H

    # blinking cursor on the last visible command line
    if visible and visible[-1][0] == "cmd" and frame_index % 8 < 5:
        d.rectangle(
            [LEFT + CHAR_W * 2 + CHAR_W * len(visible[-1][1]), y - LINE_H + 3,
             LEFT + CHAR_W * 2 + CHAR_W * len(visible[-1][1]) + CHAR_W - 2, y - LINE_H + 17],
            fill=FG,
        )
    return img


total = sum(WEIGHT[k] for k, _ in SCRIPT) + 14
frames = []
for i in range(total):
    img = render(i)
    path = OUT / f"frame{i:04d}.png"
    img.save(path)
    frames.append(path)
    if i % 24 == 0:
        print(f"  frame {i}/{total}", flush=True)

# hold the last frame
last = OUT / f"frame{total:04d}.png"
render(total).save(last)
frames.append(last)

subprocess.run(
    ["ffmpeg", "-y", "-framerate", str(FPS), "-i", str(OUT / "frame%04d.png"),
     "-filter_complex", "split[a][b];[a]palettegen=max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3",
     "-loop", "0", str(OUT.parent / "tracekit-demo.gif")],
    capture_output=True,
)
subprocess.run(
    ["ffmpeg", "-y", "-framerate", str(FPS), "-i", str(OUT / "frame%04d.png"),
     "-pix_fmt", "yuv420p", "-crf", "20", str(OUT.parent / "tracekit-demo.mp4")],
    capture_output=True,
)
gif = OUT.parent / "tracekit-demo.gif"
print("gif:", gif, gif.stat().st_size if gif.exists() else "MISSING")
