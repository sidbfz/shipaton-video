"""Offline forced alignment of transcript.txt against assets/shipaton-VO.wav.

Produces src/data/vo-words.json (word start/end times in seconds), which the
caption timings in src/data/captions.ts were derived from.

Requirements (local only, no network API):
    pip install pocketsphinx   # ships its own en-us acoustic model
    ffmpeg on PATH

Usage:
    python3 scripts/align_vo.py
"""
import json
import os
import re
import subprocess

import pocketsphinx

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SR = 16000

raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", os.path.join(ROOT, "assets", "shipaton-VO.wav"),
     "-ac", "1", "-ar", str(SR), "-f", "s16le", "-"],
    check=True, capture_output=True,
).stdout

text = open(os.path.join(ROOT, "transcript.txt")).read()
blocks = re.split(r"\d\d:\d\d:\d\d,\d+ --> \d\d:\d\d:\d\d,\d+", text)[1:]
# Search windows around the three transcript blocks (seconds). The silences
# between them were confirmed on the waveform (67.49-69.04s, 112.03-113.58s).
ranges = [(0.0, 68.3), (68.3, 112.9), (112.9, len(raw) / 2 / SR)]
extra_words = [
    ("fistula", "F IH S CH AH L AH"),
    ("onboarding", "AA N B AO R D IH NG"),
    ("paywall", "P EY W AO L"),
    ("app's", "AE P S"),
]

out = []
for (start, end), block in zip(ranges, blocks):
    d = pocketsphinx.Decoder(samprate=SR, bestpath=False, loglevel="FATAL")
    for word, phones in extra_words:
        d.add_word(word, phones, True)
    tokens = re.findall(r"[a-zA-Z']+", block.lower())
    seg = raw[int(start * SR) * 2:int(end * SR) * 2]
    d.set_align_text(" ".join(tokens))
    d.start_utt(); d.process_raw(seg, full_utt=True); d.end_utt()
    d.set_alignment()
    d.start_utt(); d.process_raw(seg, full_utt=True); d.end_utt()
    for w in d.get_alignment():
        if w.name in ("<s>", "</s>", "<sil>"):
            continue
        out.append({
            "w": re.sub(r"\(\d\)", "", w.name),
            "s": round(start + w.start / 100, 3),
            "e": round(start + (w.start + w.duration) / 100, 3),
        })

dest = os.path.join(ROOT, "src", "data", "vo-words.json")
with open(dest, "w") as f:
    f.write("[\n" + ",\n".join(json.dumps(x) for x in out) + "\n]\n")
print(f"{len(out)} words -> {dest}")
