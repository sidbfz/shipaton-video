"""Find the screen recorder's touch indicators ("show taps" dots) in the parts
of the recordings that play in the video, and write patches that paint them
out: src/data/dot-patches.json.

A touch dot is a ~33 px semi-transparent grey disc with a thin, slightly blue
rim. Its blended interior always falls in a narrow grey band (~150–230)
whatever lies underneath, which makes strong dots easy to find. Dots also fade
in and out, so single-frame detection misses the faint frames; detections are
therefore linked into tracks, gaps are filled and each track is extended a few
frames along its motion. A frame is only patched where the ring around the dot
is flat (so the patch can't smear text or edges) — painting the surrounding
colour over a flat surface is invisible even if no dot is there.

Each patch is a small feathered image: the disc is refilled row by row from
the pixels just left and right of it, so horizontal lines and card edges
continue through. Dots with structure inside (an icon or text beneath them)
are left alone rather than erased.

Where only part of a dot's path can be patched, the patch fades out over the
frames next to the unpatchable stretch, so the dot reappears gradually rather
than popping into view.

Patch entries are keyed by source frame s (the frame shown at s / 24 s, the
same convention as tracks.json): [x0, y0, "data:image/png;base64,…", opacity]
— the top-left corner of a PATCH_SIZE square, in source px.

Requirements: numpy, scipy, Pillow, ffmpeg. Usage:
    python3 scripts/clean_touch_dots.py [--sheet out/dot-sheet.jpg]
"""
import base64
import io
import json
import os
import subprocess
import sys

import numpy as np
from scipy import ndimage

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import track_targets as tt  # noqa: E402  (frame timing helpers)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H, FPS = 720, 1606, 24

# Source ranges that PLAY in the video (seconds) — keep in sync with the shot
# lists in src/scenes/Demo.tsx (a shot without holdAt keeps playing ~0.4 s
# into the next push). Held freeze frames use hand-placed `patches`. Not listed:
# 06 at 18.625–19.34 s, the tap on "Reveal photo" — that dot is the click the
# video shows (marked by a tap ring), and the fading photo trips the detector.
RANGES = {
    '01-onboarding-story.mp4': [(6.3, 10.15), (3.2, 5.4)],
    '02-onboarding-personalization.mp4': [(14.05, 14.6)],
    '03-home-and-checkin.mp4': [(0.0, 0.9), (1.2, 3.7)],
    '04-history-and-timeline.mp4': [(5.2, 9.5)],
    '05-medicine-reminders-routines.mp4': [(1.4, 2.4), (5.45, 8.6), (15.0, 18.9)],
    '06-journal-and-photos.mp4': [(1.6, 2.55), (9.3, 10.4), (12.2, 13.55), (17.05, 18.45)],
    '07-privacy-and-settings.mp4': [(7.5, 8.0), (10.6, 13.3)],
    '08-lifetime-supporter.mp4': [(0.2, 1.6), (4.3, 5.5)],
}

ANG = np.linspace(0, 2 * np.pi, 48, endpoint=False)
PATCH_R = 19          # covers the dot (radius ~16.5) and its rim
FEATHER = 4           # soft edge beyond PATCH_R
SIDE = 23             # columns sampled left/right of the centre for the row fill
PATCH_SIZE = 2 * (PATCH_R + FEATHER) + 2
INTERIOR_MAX_STD = 5.0  # structure inside the dot -> leave it alone
SIDE_MAX_DIFF = 12.0    # left/right fill columns must agree row by row (lines yes, text/edges no)
EXTEND = 4            # frames added before/after each track (fade in/out)
LINK_DIST = 70        # px a dot may move between consecutive frames
FLAT_STD = {'detected': 14.0, 'inferred': 6.0}  # ring flatness needed to patch


def ring(img, cx, cy, r):
    px = np.clip(np.round(cx + r * np.cos(ANG)).astype(int), 0, W - 1)
    py = np.clip(np.round(cy + r * np.sin(ANG)).astype(int), 0, H - 1)
    return img[py, px]


def detect(rgb):
    """Strong (clearly visible) dots in one frame: [(cx, cy)]."""
    g = rgb.mean(2)
    sat = rgb.max(2) - rgb.min(2)
    m = ((sat < 14) & (g >= 148) & (g <= 232)).astype(np.float32)
    frac = ndimage.uniform_filter(m, 21)
    lab, n = ndimage.label(frac >= 0.92)
    out = []
    for sl in ndimage.find_objects(lab) if n else []:
        if sl[0].stop - sl[0].start > 16 or sl[1].stop - sl[1].start > 16:
            continue  # a dot leaves only a small core; large grey areas are rejected
        cy = (sl[0].start + sl[0].stop - 1) / 2
        cx = (sl[1].start + sl[1].stop - 1) / 2
        if cy < 70 or cy > H - 25 or cx < 22 or cx > W - 22:
            continue
        rv, rs = ring(g, cx, cy, 14.5), ring(sat, cx, cy, 14.5)
        ov, os_ = ring(g, cx, cy, 21), ring(sat, cx, cy, 21)
        rim = ((rs < 45) & (rv >= 140) & (rv <= 220)).mean()
        outside = ((os_ < 16) & (ov >= 148) & (ov <= 232)).mean()
        if rim >= 0.6 and outside < 0.6:
            out.append((float(cx), float(cy)))
    return out


def link(found):
    """Group per-frame detections into tracks of nearby positions."""
    tracks = []
    for s in sorted(found):
        for x, y in found[s]:
            best = None
            for tr in tracks:
                ls, lx, ly = tr[-1]
                if 0 < s - ls <= EXTEND and np.hypot(x - lx, y - ly) <= LINK_DIST * (s - ls):
                    best = tr
                    break
            if best is None:
                tracks.append([(s, x, y)])
            else:
                best.append((s, x, y))
    return tracks


def positions(tr):
    """Every frame of a track with position, filled and extended: {s: (x, y, kind)}."""
    pts = {s: (x, y, 'detected') for s, x, y in tr}
    ss = sorted(pts)
    for a, b in zip(ss, ss[1:]):  # fill gaps linearly
        for s in range(a + 1, b):
            k = (s - a) / (b - a)
            pts[s] = (pts[a][0] + k * (pts[b][0] - pts[a][0]), pts[a][1] + k * (pts[b][1] - pts[a][1]), 'inferred')

    def velocity(i, j):
        return ((pts[j][0] - pts[i][0]) / (j - i), (pts[j][1] - pts[i][1]) / (j - i)) if j != i else (0.0, 0.0)

    v0 = velocity(ss[0], ss[min(1, len(ss) - 1)])
    v1 = velocity(ss[max(0, len(ss) - 2)], ss[-1])
    for k in range(1, EXTEND + 1):  # extend along the motion (taps: stand still)
        pts[ss[0] - k] = (pts[ss[0]][0] - v0[0] * k, pts[ss[0]][1] - v0[1] * k, 'inferred')
        pts[ss[-1] + k] = (pts[ss[-1]][0] + v1[0] * k, pts[ss[-1]][1] + v1[1] * k, 'inferred')
    return pts


def interior_std(g, cx, cy, r=11):
    yy, xx = np.mgrid[-r:r + 1, -r:r + 1]
    inside = (yy ** 2 + xx ** 2) <= r * r
    y0, x0 = int(round(cy)), int(round(cx))
    return float(g[y0 - r:y0 + r + 1, x0 - r:x0 + r + 1][inside].std())


def sides_agree(g, cx, cy):
    """True when the columns either side of the dot match row by row: a
    horizontal line or flat surface passes, text or a vertical edge does not."""
    xl, xr = int(round(cx)) - SIDE, int(round(cx)) + SIDE
    y0 = int(round(cy)) - PATCH_R - FEATHER
    rows = slice(max(0, y0), min(H, y0 + 2 * (PATCH_R + FEATHER) + 1))
    left = g[rows, max(0, xl - 1):xl + 2].mean(1)
    right = g[rows, xr - 1:min(W, xr + 2)].mean(1)
    return float(np.abs(left - right).max()) <= SIDE_MAX_DIFF


def make_patch(f, cx, cy):
    """Feathered RGBA patch: each row is a linear blend between the pixels
    SIDE px left and right of the dot. Returns (x0, y0, data URI)."""
    from PIL import Image
    n = PATCH_SIZE
    x0, y0 = int(round(cx)) - n // 2, int(round(cy)) - n // 2
    xl, xr = int(round(cx)) - SIDE, int(round(cx)) + SIDE
    out = np.zeros((n, n, 4), np.uint8)
    for j in range(n):
        y = min(H - 1, max(0, y0 + j))
        left = f[y, max(0, xl - 1):xl + 2].mean(0)
        right = f[y, xr - 1:min(W, xr + 2)].mean(0)
        for i in range(n):
            k = (x0 + i - xl) / (xr - xl)
            k = min(1.0, max(0.0, k))
            out[j, i, :3] = np.round(left * (1 - k) + right * k)
    yy, xx = np.mgrid[0:n, 0:n]
    d = np.hypot(xx - (cx - x0), yy - (cy - y0))
    out[:, :, 3] = np.round(255 * np.clip((PATCH_R + FEATHER - d) / FEATHER, 0, 1))
    buf = io.BytesIO()
    Image.fromarray(out, 'RGBA').save(buf, 'PNG', optimize=True)
    return x0, y0, 'data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode()


def decode(src, sframes):
    path = os.path.join(ROOT, 'assets', src)
    times = tt.frame_times(path)
    idx = {s: tt.frame_at(times, s / FPS) for s in sframes}
    need = set(idx.values())
    proc = subprocess.Popen(
        ['ffmpeg', '-v', 'fatal', '-i', path, '-map', '0:v:0', '-fps_mode', 'passthrough', '-pix_fmt', 'rgb24', '-f', 'rawvideo', '-'],
        stdout=subprocess.PIPE,
    )
    frames, i = {}, 0
    while i <= max(need):
        buf = proc.stdout.read(W * H * 3)
        if len(buf) < W * H * 3:
            break
        if i in need:
            frames[i] = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.int32)
        i += 1
    proc.kill()
    return {s: frames[idx[s]] for s in sframes}


def main():
    result, stats = {}, []
    for src, rngs in RANGES.items():
        used = sorted({s for a, b in rngs for s in range(round(a * FPS), round(b * FPS) + 1)})
        frames = decode(src, used)
        found = {}
        for s in used:
            d = detect(frames[s])
            if d:
                found[s] = d
        patches = {}
        skipped = 0
        for tr in link(found):
            ok, blocked = {}, []
            for s, (x, y, kind) in positions(tr).items():
                if s not in frames or not (SIDE + 2 < x < W - SIDE - 2 and 70 < y < H - 30):
                    if kind == 'detected':
                        blocked.append(s)
                    continue
                f = frames[s]
                g = f.mean(2)
                ringg = np.concatenate([ring(g, x, y, r) for r in (20, 22)])
                if ringg.std() > FLAT_STD[kind] or interior_std(g, x, y) > INTERIOR_MAX_STD or not sides_agree(g, x, y):
                    if kind == 'detected':
                        blocked.append(s)
                        skipped += 1
                    continue
                ok[s] = make_patch(f, x, y)
            for s, (x0, y0, uri) in ok.items():
                # fade the patch out next to frames where the dot has to stay visible
                d = min((abs(s - b) for b in blocked), default=99)
                opacity = round(min(1.0, d / 4), 2)
                if opacity > 0:
                    patches.setdefault(str(s), []).append([x0, y0, uri, opacity])
        result[src] = patches
        stats.append((src, len(found), sum(len(v) for v in patches.values()), skipped))
    dest = os.path.join(ROOT, 'src', 'data', 'dot-patches.json')
    with open(dest, 'w') as fh:
        json.dump(result, fh, separators=(',', ':'))
        fh.write('\n')
    for src, nf, npatch, sk in stats:
        print(f'{src:38s} frames with strong dots {nf:3d}  patches {npatch:3d}  strong dots left (not flat) {sk}')
    print(f'-> {dest}')
    return result


if __name__ == '__main__':
    main()
