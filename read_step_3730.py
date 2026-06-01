import json

path = "/Users/macbook/.gemini/antigravity/brain/29667d9f-431e-4d0c-96ef-71b818564768/.system_generated/logs/transcript.jsonl"
with open(path, "r", encoding="utf-8") as f:
    for line in f:
        data = json.loads(line)
        step = data.get("step_index")
        if step == 3730:
            tool_calls = data.get("tool_calls", [])
            for tc in tool_calls:
                print(json.dumps(tc.get("args"), indent=2))
