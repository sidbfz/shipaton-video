"""Frame-by-frame tracking of app UI sections in the screen recordings.

For every target, a template strip (a section header that does not change as
the screen scrolls) is cut from the reference frame on which the highlight box
was measured. The script then finds that strip's vertical position in every
source frame of the range used in the video, and writes the per-frame offset
to src/data/tracks.json. The video only reads that file, so renders stay
deterministic.

  dy[k]  = vertical offset (source px) of the section at source frame s0 + k
           relative to its position on the reference frame; null = not on screen
  err[k] = mean absolute grey-level difference of the best match (0 = identical)

Source frame s is the frame shown at time s / 24 s — the same convention
Remotion uses (trimBefore = round(clip * 24)).

Requirements: numpy, Pillow, ffmpeg on PATH (local only, no network APIs).
Usage:
    python3 scripts/track_targets.py            # writes tracks.json
    python3 scripts/track_targets.py --sheet out/tracking-sheet.jpg
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 720, 1606
FPS = 24
STATUS_BAR = 62
FOUND_MAX_ERR = 2.0  # on blurred frames: found ~0–1, absent ~4+
ACQUIRE_MAX_ERR = 1.0  # first lock / re-lock must be a near-exact match
MAX_STEP = 150  # px a section can plausibly move between consecutive frames
MIN_RUN = 3  # a match must hold for 3+ consecutive frames

# id: source, frame range (seconds), reference time, template rows, highlight box
# (x, y, w, h in source px on the reference frame).
TARGETS = {
    'history-story': dict(src='04-history-and-timeline.mp4', range=(5.2, 9.5), ref=9.5, tpl=(872, 960), box=[10, 868, 700, 390]),
    'history-days': dict(src='04-history-and-timeline.mp4', range=(5.2, 9.5), ref=9.5, tpl=(280, 355), box=[10, 265, 700, 520]),
    'med-instructions': dict(src='05-medicine-reminders-routines.mp4', range=(5.45, 8.6), ref=6.0, tpl=(715, 800), box=[24, 715, 674, 275]),
    'med-reminders': dict(src='05-medicine-reminders-routines.mp4', range=(5.45, 8.6), ref=8.6, tpl=(895, 965), box=[16, 888, 696, 92]),
    'routine-today': dict(src='05-medicine-reminders-routines.mp4', range=(15.0, 18.9), ref=17.8, tpl=(155, 197), box=[14, 150, 692, 560]),
    'routine-choose': dict(src='05-medicine-reminders-routines.mp4', range=(15.0, 18.9), ref=17.8, tpl=(779, 821), box=[14, 770, 692, 640]),
    'settings-companion': dict(src='07-privacy-and-settings.mp4', range=(10.6, 13.3), ref=13.3, tpl=(1272, 1330), box=[16, 1266, 696, 144]),
}


def frame_times(path):
    """Presentation time of every decoded frame (the recordings are VFR)."""
    log = subprocess.run(
        ['ffmpeg', '-hide_banner', '-i', path, '-map', '0:v:0', '-vf', 'showinfo', '-f', 'null', '-'],
        capture_output=True, text=True,
    ).stderr
    return [float(x) for x in re.findall(r'pts_time:([0-9.]+)', log)]


def decode(path, keep):
    """Grey frames for the decoded-frame indices in `keep` (streamed, low memory)."""
    proc = subprocess.Popen(
        ['ffmpeg', '-v', 'fatal', '-i', path, '-map', '0:v:0', '-vf', 'format=gray', '-fps_mode', 'passthrough', '-f', 'rawvideo', '-'],
        stdout=subprocess.PIPE,
    )
    frames, i, last = {}, 0, max(keep)
    while i <= last:
        buf = proc.stdout.read(W * H)
        if len(buf) < W * H:
            break
        if i in keep:
            frames[i] = blur(np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.float32))
        i += 1
    proc.kill()
    return frames


def blur(a, k=5):
    """Separable box blur: text drawn at fractional scroll offsets (sub-pixel
    anti-aliasing) then matches its reference just as well as whole-pixel text."""
    c = np.cumsum(np.pad(a, ((k // 2 + 1, k // 2), (0, 0)), mode='edge'), axis=0)
    a = (c[k:] - c[:-k]) / k
    c = np.cumsum(np.pad(a, ((0, 0), (k // 2 + 1, k // 2)), mode='edge'), axis=1)
    return (c[:, k:] - c[:, :-k]) / k


def frame_at(times, t):
    """Index of the frame on screen at time t (last frame with pts <= t)."""
    idx = 0
    for i, pt in enumerate(times):
        if pt <= t + 1e-4:
            idx = i
        else:
            break
    return idx


def match(img, tpl, hint=None):
    """Best vertical position of tpl in img (columns sub-sampled for speed)."""
    th = tpl.shape[0]
    cols = slice(20, 700, 2)
    t = tpl[:, cols]

    def err(y):
        return float(np.abs(img[y:y + th, cols] - t).mean())

    lo, hi = STATUS_BAR, H - th - 30
    cands = range(max(lo, hint - 160), min(hi, hint + 160), 2) if hint is not None else range(lo, hi, 3)
    best = min((err(y), y) for y in cands)
    if hint is not None and best[0] > FOUND_MAX_ERR:  # lost it: full search
        best = min((err(y), y) for y in range(lo, hi, 3))
    y0 = best[1]
    return min((err(y), y) for y in range(max(lo, y0 - 3), min(hi, y0 + 4)))


def drop_short_runs(dy):
    """Discard isolated matches (fewer than MIN_RUN consecutive frames)."""
    out, k = list(dy), 0
    while k < len(dy):
        if dy[k] is None:
            k += 1
            continue
        j = k
        while j < len(dy) and dy[j] is not None:
            j += 1
        if j - k < MIN_RUN:
            for m in range(k, j):
                out[m] = None
        k = j
    return out


def smooth(dy):
    """Median-of-3 then mean-of-3 over runs of found frames (removes 1-frame jitter)."""
    out = list(dy)
    for k in range(1, len(dy) - 1):
        w = [v for v in dy[k - 1:k + 2] if v is not None]
        if dy[k] is not None and len(w) == 3:
            out[k] = sorted(w)[1]
    res = list(out)
    for k in range(len(out)):
        w = [v for v in out[max(0, k - 1):k + 2] if v is not None]
        if out[k] is not None:
            res[k] = round(sum(w) / len(w), 1)
    return res


def track():
    by_src = {}
    for tid, t in TARGETS.items():
        by_src.setdefault(t['src'], []).append(tid)
    result = {}
    for src, ids in by_src.items():
        path = os.path.join(ROOT, 'assets', src)
        times = frame_times(path)
        needed = set()
        plan = {}
        for tid in ids:
            t = TARGETS[tid]
            s0, s1 = round(t['range'][0] * FPS), round(t['range'][1] * FPS)
            idx = [frame_at(times, s / FPS) for s in range(s0, s1 + 1)]
            ref = frame_at(times, round(t['ref'] * FPS) / FPS)
            plan[tid] = (s0, s1, idx, ref)
            needed.update(idx)
            needed.add(ref)
        frames = decode(path, needed)
        for tid in ids:
            t = TARGETS[tid]
            s0, s1, idx, ref = plan[tid]
            y0, y1 = t['tpl']
            tpl = frames[ref][y0:y1]
            # A blank strip would 'match' any empty background — refuse it.
            if float(tpl[:, 20:700].std()) < 8:
                raise SystemExit(f'{tid}: template rows {y0}-{y1} are blank on the reference frame')
            dy, errs, hint = [], [], None
            for i in idx:
                e, y = match(frames[i], tpl, hint)
                if hint is None:  # not locked: only a near-exact match counts
                    found = e <= ACQUIRE_MAX_ERR
                else:  # locked: allow motion blur, but not impossible jumps
                    found = e <= FOUND_MAX_ERR and abs(y - hint) <= MAX_STEP
                dy.append(y - y0 if found else None)
                errs.append(round(e, 2))
                hint = y if found else None
            dy = drop_short_runs(dy)
            result[tid] = {'src': src, 's0': s0, 's1': s1, 'box': t['box'], 'dy': smooth(dy), 'err': errs}
            n = sum(v is not None for v in dy)
            print(f'{tid:20s} frames {s0}-{s1}  found {n}/{len(dy)}  max err found '
                  f'{max([e for e, v in zip(errs, dy) if v is not None] or [0]):.2f}')
    dest = os.path.join(ROOT, 'src', 'data', 'tracks.json')
    with open(dest, 'w') as f:
        json.dump(result, f, separators=(',', ':'))
        f.write('\n')
    print(f'-> {dest}')
    return result


def contact_sheet(result, out, per=8):
    """Sampled frames per target with the tracked box drawn on, for visual checking."""
    from PIL import Image, ImageDraw, ImageFont
    font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 30)
    tw, th = 240, 535
    rows = []
    for tid, r in result.items():
        path = os.path.join(ROOT, 'assets', r['src'])
        n = len(r['dy'])
        picks = [round(i * (n - 1) / (per - 1)) for i in range(per)]
        row = Image.new('RGB', (per * (tw + 6) + 280, th + 10), 'white')
        d = ImageDraw.Draw(row)
        d.text((8, 10), tid, fill=(150, 40, 40), font=ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 22))
        for j, k in enumerate(picks):
            t = (r['s0'] + k) / FPS
            img = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.4f}', '-i', path, '-frames:v', '1', '-f', 'image2pipe', '-vcodec', 'png', '-'], capture_output=True).stdout
            from io import BytesIO
            im = Image.open(BytesIO(img)).convert('RGB')
            dd = ImageDraw.Draw(im)
            x, y, w, h = r['box']
            if r['dy'][k] is not None:
                y += r['dy'][k]
                dd.rounded_rectangle((x, y, x + w, y + h), radius=18, outline=(190, 70, 70), width=7)
                dd.ellipse((x + w - 12, y + h / 2 - 12, x + w + 12, y + h / 2 + 12), fill=(190, 70, 70))
                lab = f'{t:.2f}s dy{r["dy"][k]:+.0f} e{r["err"][k]:.1f}'
            else:
                lab = f'{t:.2f}s off-screen e{r["err"][k]:.1f}'
            dd.rectangle((0, 0, W, 64), fill=(255, 255, 255))
            dd.text((10, 14), lab, fill=(170, 30, 30), font=font)
            row.paste(im.resize((tw, th)), (280 + j * (tw + 6), 5))
        rows.append(row)
    sheet = Image.new('RGB', (rows[0].width, sum(r.height for r in rows)), 'white')
    y = 0
    for r in rows:
        sheet.paste(r, (0, y))
        y += r.height
    sheet.save(out, quality=88)
    print(f'-> {out}')


if __name__ == '__main__':
    res = track()
    if '--sheet' in sys.argv:
        contact_sheet(res, sys.argv[sys.argv.index('--sheet') + 1])
