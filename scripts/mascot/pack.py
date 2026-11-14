"""Pack the genie's painted layers into two small WebP atlases plus a toggle icon.

Usage (from the project root):
    python scripts/mascot/pack.py scripts/mascot/source public/mascot src/mascot/engine/atlas.json

Source layers are 700 x 800 "rig units" (g5-<pose>-<part>.webp, part = tail | body | head | jaw).
Each layer is cropped to its visible pixels, scaled by K and shelf-packed. atlas.json stores, per layer,
[x, y, w, h, ox, oy]: the rectangle in the atlas and where its top-left corner sits in rig units, so the
engine draws in rig units and never needs the full 700 x 800 canvases.

core.webp  = the happy pose (idle, float, rest), loaded first.
extra.webp = talk + wink poses and the coin, loaded once the page is quiet.
"""
import json
import os
import sys

import numpy as np
from PIL import Image

src, outdir, atlas_json = sys.argv[1], sys.argv[2], sys.argv[3]
os.makedirs(outdir, exist_ok=True)

K = 0.45          # atlas px per rig unit: about 2x device pixels for the largest on-screen size (150 CSS px)
PAD = 2           # px between items so filtering never bleeds a neighbour in
WIDTH = 512
# Jaw images are smaller than the rig; their top-left corner in rig units (the old rig's jaw rectangles).
JAW_AT = {'happy': (237, 249), 'talk': (230, 206), 'wink': (212, 230)}
ATLASES = {'core': ['happy'], 'extra': ['talk', 'wink']}
PARTS = ['tail', 'body', 'head', 'jaw']


def clean(im):
    """Fade the faint painted halo (it was cut off in rectangles where layers meet); the engine draws its own glow."""
    a = np.array(im.convert('RGBA')).astype(np.float32)
    al = a[..., 3]
    soft = al < 110
    al[soft] = al[soft] * (al[soft] / 110) ** 2
    al[al < 6] = 0
    a[..., 3] = al
    return Image.fromarray(a.clip(0, 255).astype(np.uint8), 'RGBA')


def item(path, origin=(0, 0), scale=K):
    im = clean(Image.open(path))
    bb = im.getbbox()
    im = im.crop(bb)
    w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
    im = im.resize((w, h), Image.LANCZOS)
    return im, (origin[0] + bb[0], origin[1] + bb[1])


def pack(items):
    x = y = shelf = 0
    places = []
    for _, im, _ in items:
        if x + im.width > WIDTH:
            x, y, shelf = 0, y + shelf + PAD, 0
        places.append((x, y))
        x += im.width + PAD
        shelf = max(shelf, im.height)
    sheet = Image.new('RGBA', (WIDTH, y + shelf))
    for (_, im, _), p in zip(items, places):
        sheet.paste(im, p)
    return sheet, places


result = {'k': K, 'units': [700, 800], 'parts': {}, 'atlases': {}}
for atlas, poses in ATLASES.items():
    items = []
    for pose in poses:
        for part in PARTS:
            origin = JAW_AT[pose] if part == 'jaw' else (0, 0)
            im, o = item(os.path.join(src, f'g5-{pose}-{part}.webp'), origin)
            items.append((f'{pose}.{part}', im, o))
    if atlas == 'extra':
        coin = Image.open(os.path.join(src, '..', '..', '..', 'public', 'media', 'prop-crown-coin.webp')).convert('RGBA')
        coin = coin.crop(coin.getbbox()).resize((56, 56), Image.LANCZOS)
        items.append(('coin', coin, (0, 0)))
    # Tallest first packs tighter on shelves.
    items.sort(key=lambda it: -it[1].height)
    sheet, places = pack(items)
    sheet.save(os.path.join(outdir, f'{atlas}.webp'), 'WEBP', quality=86, method=6, alpha_quality=90)
    result['atlases'][atlas] = [sheet.width, sheet.height]
    for (name, im, o), (px, py) in zip(items, places):
        rect = [px, py, im.width, im.height]
        if name == 'coin':
            result['coin'] = {'atlas': atlas, 'f': rect}
            continue
        pose, part = name.split('.')
        result['parts'].setdefault(pose, {'atlas': atlas})[part] = rect + [o[0], o[1]]

face = Image.open(os.path.join(src, 'dino-dock.webp')).convert('RGBA')
face.thumbnail((96, 96), Image.LANCZOS)
face.save(os.path.join(outdir, 'face.webp'), 'WEBP', quality=88, method=6)

with open(atlas_json, 'w') as f:
    json.dump(result, f, separators=(',', ':'))
for name in sorted(os.listdir(outdir)):
    print(name, os.path.getsize(os.path.join(outdir, name)), 'bytes')
