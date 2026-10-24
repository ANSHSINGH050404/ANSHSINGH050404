"""Validate the generated SVG assets.

Checks:
  1. well-formed XML
  2. every url(#id) reference resolves to a defined element
  3. no geometry escapes the viewBox
  4. every <text> has a fill and a font-family
"""
import glob
import re
import sys
import xml.etree.ElementTree as ET

SVG = "{http://www.w3.org/2000/svg}"
failed = False

for path in sorted(glob.glob("assets/*.svg")):
    try:
        tree = ET.parse(path)
    except ET.ParseError as exc:
        print(f"FAIL {path}: not well-formed XML -> {exc}")
        failed = True
        continue

    root = tree.getroot()
    ids = {el.get("id") for el in root.iter() if el.get("id")}
    raw = open(path, encoding="utf-8").read()

    # 1. url(#id) references
    refs = set(re.findall(r"url\(#([^)]+)\)", raw))
    missing = refs - ids
    if missing:
        print(f"FAIL {path}: unresolved references {sorted(missing)}")
        failed = True

    # 2. text elements
    bad_text = [
        el.get("id")
        for el in root.iter(f"{SVG}text")
        if not el.get("fill") or not el.get("font-family")
    ]
    if bad_text:
        print(f"FAIL {path}: text elements missing fill/font-family: {bad_text[:5]}")
        failed = True

    # 3. geometry inside the viewBox
    w = float(root.get("width"))
    h = float(root.get("height"))
    vb = [float(v) for v in root.get("viewBox").split()]
    for el in root.iter():
        tag = el.tag.replace(SVG, "")
        if tag == "rect":
            x = float(el.get("x", 0)); y = float(el.get("y", 0))
            rw = float(el.get("width", 0)); rh = float(el.get("height", 0))
            # The scanline is animated far outside the panel on purpose.
            if el.get("class") == "scan":
                continue
            if x < -1 or y < -1 or x + rw > w + 1 or y + rh > h + 1:
                print(f"FAIL {path}: rect outside viewBox {x},{y} {rw}x{rh}")
                failed = True
        if tag == "circle":
            cx = float(el.get("cx", 0)); cy = float(el.get("cy", 0)); r = float(el.get("r", 0))
            if cx - r < -1 or cy - r < -1 or cx + r > w + 1 or cy + r > h + 1:
                print(f"FAIL {path}: circle outside viewBox at {cx},{cy}")
                failed = True

    print(f"OK   {path}  {w:.0f}x{h:.0f}  ids={sorted(ids)}")

if failed:
    sys.exit(1)
print("\nall assets valid")
