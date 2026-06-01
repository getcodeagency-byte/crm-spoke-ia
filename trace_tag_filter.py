import re

path = "/Users/macbook/Desktop/Spoke - IA/frontend/js/app.js"
with open(path, "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if "currentInboxTagFilter" in line:
        print(f"Line {idx+1}: {line.strip()}")
