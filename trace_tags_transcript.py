import json

path = "/Users/macbook/.gemini/antigravity/brain/29667d9f-431e-4d0c-96ef-71b818564768/.system_generated/logs/transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        content = json.dumps(data)
        if "etiquetas" in content or "etiqueta" in content:
            step = data.get("step_index")
            c = data.get("content") or ""
            if data.get("source") == "USER_EXPLICIT" and data.get("type") == "USER_INPUT":
                print(f"Step {step}: User Input: {c[:200]}")
                print("-" * 50)
